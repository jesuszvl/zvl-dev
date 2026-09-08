import type { EmailOtpType } from '@supabase/supabase-js'
import { supabase, supabaseConfigError } from '../lib/supabase'

const statusEl = document.querySelector<HTMLElement>('[data-confirm-status]')

function setStatus(message: string) {
  if (statusEl) statusEl.textContent = message
}

async function confirmSession() {
  if (!supabase) {
    setStatus(supabaseConfigError ?? 'Supabase is not configured.')
    return
  }

  const url = new URL(window.location.href)
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const code = url.searchParams.get('code')

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    })
    if (error) throw error
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
  } else {
    const { error } = await supabase.auth.getSession()
    if (error) throw error
  }

  setStatus('Signed in. Opening the dashboard.')
  window.history.replaceState({}, document.title, '/')
  window.setTimeout(() => window.location.replace('/'), 450)
}

confirmSession().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Sign in failed.'
  setStatus(message)
})
