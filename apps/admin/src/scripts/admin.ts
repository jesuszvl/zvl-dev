import type { User } from '@supabase/supabase-js'
import { supabase, supabaseConfigError } from '../lib/supabase'

type ContentVersion = {
  id: string
  version: number
  status: string
  summary: string | null
  updated_at: string | null
  published_at: string | null
  content: Record<string, unknown>
}

type PortfolioAsset = {
  id: string
  kind: string
  bucket_id: string
  object_path: string
  public_url: string | null
  alt_text: string | null
  is_public: boolean
  created_at: string | null
}

type PortraitGeneration = {
  id: string
  status: string
  prompt: string
  created_at: string | null
}

const authPanel = document.querySelector<HTMLElement>('[data-auth-panel]')
const dashboard = document.querySelector<HTMLElement>('[data-dashboard]')
const loginForm = document.querySelector<HTMLFormElement>('[data-login-form]')
const loginStatus = document.querySelector<HTMLElement>('[data-login-status]')
const dashboardStatus = document.querySelector<HTMLElement>('[data-dashboard-status]')
const adminEmail = document.querySelector<HTMLElement>('[data-admin-email]')
const updatedAt = document.querySelector<HTMLElement>('[data-updated-at]')
const contentList = document.querySelector<HTMLTableSectionElement>(
  '[data-content-list]'
)
const assetList = document.querySelector<HTMLUListElement>('[data-asset-list]')
const generationList = document.querySelector<HTMLUListElement>(
  '[data-generation-list]'
)
const refreshButton = document.querySelector<HTMLButtonElement>('[data-refresh]')
const signOutButton = document.querySelector<HTMLButtonElement>('[data-sign-out]')
const createDraftButton =
  document.querySelector<HTMLButtonElement>('[data-create-draft]')
const uploadForm = document.querySelector<HTMLFormElement>('[data-upload-form]')
const generationForm = document.querySelector<HTMLFormElement>(
  '[data-generation-form]'
)

const state: { user: User | null } = {
  user: null
}

function setLoginStatus(message: string) {
  if (loginStatus) loginStatus.textContent = message
}

function setDashboardStatus(message: string) {
  if (dashboardStatus) dashboardStatus.textContent = message
}

function formatDate(value: string | null) {
  if (!value) return 'Draft'
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function renderSignedOut(message = '') {
  state.user = null
  if (dashboard) dashboard.hidden = true
  if (authPanel) authPanel.hidden = false
  setLoginStatus(message)
}

function renderSignedIn(user: User) {
  state.user = user
  if (authPanel) authPanel.hidden = true
  if (dashboard) dashboard.hidden = false
  if (adminEmail) adminEmail.textContent = user.email ?? 'Signed in'
}

function renderContentVersions(versions: ContentVersion[]) {
  if (!contentList) return
  contentList.textContent = ''
  if (versions.length === 0) {
    const row = document.createElement('tr')
    const cell = document.createElement('td')
    cell.colSpan = 4
    cell.textContent = 'No content versions found.'
    row.append(cell)
    contentList.append(row)
    return
  }

  versions.forEach((version) => {
    const row = document.createElement('tr')
    const versionCell = document.createElement('td')
    const statusCell = document.createElement('td')
    const summaryCell = document.createElement('td')
    const updatedCell = document.createElement('td')
    const status = document.createElement('span')

    status.className = 'status-pill'
    status.textContent = version.status
    versionCell.textContent = `v${version.version}`
    summaryCell.textContent = version.summary ?? 'No summary'
    updatedCell.textContent = formatDate(version.updated_at ?? version.published_at)
    statusCell.append(status)
    row.append(versionCell, statusCell, summaryCell, updatedCell)
    contentList.append(row)
  })
}

function renderAssets(assets: PortfolioAsset[]) {
  if (!assetList) return
  assetList.textContent = ''
  if (assets.length === 0) {
    const item = document.createElement('li')
    item.textContent = 'No portrait references yet.'
    assetList.append(item)
    return
  }

  assets.forEach((asset) => {
    const item = document.createElement('li')
    const label = document.createElement('span')
    const meta = document.createElement('small')

    label.textContent = asset.alt_text ?? asset.object_path
    meta.textContent = `${asset.kind} · ${asset.is_public ? 'public' : 'private'}`
    item.append(label, meta)
    assetList.append(item)
  })
}

function renderGenerations(generations: PortraitGeneration[]) {
  if (!generationList) return
  generationList.textContent = ''
  if (generations.length === 0) {
    const item = document.createElement('li')
    item.textContent = 'No generation drafts yet.'
    generationList.append(item)
    return
  }

  generations.forEach((generation) => {
    const item = document.createElement('li')
    const prompt = document.createElement('span')
    const meta = document.createElement('small')

    prompt.textContent = generation.prompt
    meta.textContent = `${generation.status} · ${formatDate(generation.created_at)}`
    item.append(prompt, meta)
    generationList.append(item)
  })
}

function safeFileName(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'portrait-reference'
  )
}

async function requireAdmin(user: User) {
  if (!supabase) throw new Error(supabaseConfigError ?? 'Supabase is not configured.')

  const { data, error } = await supabase
    .from('site_admins')
    .select('user_id,email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('This email is not allowed to manage the portfolio.')
}

async function loadDashboard() {
  if (!supabase || !state.user) return

  setDashboardStatus('Loading.')

  const [contentResult, assetsResult, generationsResult] = await Promise.all([
    supabase
      .from('portfolio_content_versions')
      .select('id,version,status,summary,updated_at,published_at,content')
      .eq('slug', 'portfolio')
      .order('version', { ascending: false })
      .limit(8),
    supabase
      .from('portfolio_assets')
      .select('id,kind,bucket_id,object_path,public_url,alt_text,is_public,created_at')
      .in('kind', ['portrait_reference', 'portrait_current', 'portrait_generation'])
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('portrait_generations')
      .select('id,status,prompt,created_at')
      .order('created_at', { ascending: false })
      .limit(8)
  ])

  if (contentResult.error) throw contentResult.error
  if (assetsResult.error) throw assetsResult.error
  if (generationsResult.error) throw generationsResult.error

  renderContentVersions((contentResult.data ?? []) as ContentVersion[])
  renderAssets((assetsResult.data ?? []) as PortfolioAsset[])
  renderGenerations((generationsResult.data ?? []) as PortraitGeneration[])

  if (updatedAt) updatedAt.textContent = `Updated ${formatDate(new Date().toISOString())}`
  setDashboardStatus('')
}

async function bootstrap() {
  if (!supabase) {
    renderSignedOut(supabaseConfigError ?? 'Supabase is not configured.')
    return
  }

  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error) {
    renderSignedOut(error.message)
    return
  }

  if (!session?.user) {
    renderSignedOut()
    return
  }

  try {
    await requireAdmin(session.user)
    renderSignedIn(session.user)
    await loadDashboard()
  } catch (adminError) {
    await supabase.auth.signOut()
    const message =
      adminError instanceof Error ? adminError.message : 'Admin access failed.'
    renderSignedOut(message)
  }
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!supabase) {
    renderSignedOut(supabaseConfigError ?? 'Supabase is not configured.')
    return
  }

  const formData = new FormData(loginForm)
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return

  setLoginStatus('Sending sign-in link.')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
      shouldCreateUser: false
    }
  })

  setLoginStatus(error ? error.message : 'Check your email.')
})

refreshButton?.addEventListener('click', () => {
  loadDashboard().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Refresh failed.'
    setDashboardStatus(message)
  })
})

signOutButton?.addEventListener('click', async () => {
  if (supabase) await supabase.auth.signOut()
  renderSignedOut()
})

createDraftButton?.addEventListener('click', async () => {
  if (!supabase || !state.user) return
  setDashboardStatus('Creating draft.')

  const { data: latest, error: latestError } = await supabase
    .from('portfolio_content_versions')
    .select('version,content')
    .eq('slug', 'portfolio')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    setDashboardStatus(latestError.message)
    return
  }

  const nextVersion = Number(latest?.version ?? 0) + 1
  const { error } = await supabase.from('portfolio_content_versions').insert({
    slug: 'portfolio',
    version: nextVersion,
    status: 'draft',
    summary: `Draft version ${nextVersion}`,
    content: latest?.content ?? {},
    created_by: state.user.id
  })

  if (error) {
    setDashboardStatus(error.message)
    return
  }

  await loadDashboard()
})

uploadForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!supabase || !state.user) return

  const formData = new FormData(uploadForm)
  const file = formData.get('file')
  if (!(file instanceof File)) return

  setDashboardStatus('Uploading portrait reference.')
  const path = `portrait-references/${state.user.id}/${Date.now()}-${safeFileName(
    file.name
  )}`

  const { error: uploadError } = await supabase.storage
    .from('portfolio-private')
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    })

  if (uploadError) {
    setDashboardStatus(uploadError.message)
    return
  }

  const { error: assetError } = await supabase.from('portfolio_assets').insert({
    kind: 'portrait_reference',
    bucket_id: 'portfolio-private',
    object_path: path,
    alt_text: String(formData.get('altText') ?? 'Portrait reference'),
    metadata: {
      contentType: file.type,
      fileName: file.name,
      fileSize: file.size,
      source: 'admin'
    },
    is_public: false,
    created_by: state.user.id
  })

  if (assetError) {
    setDashboardStatus(assetError.message)
    return
  }

  uploadForm.reset()
  await loadDashboard()
})

generationForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!supabase || !state.user) return

  const formData = new FormData(generationForm)
  const prompt = String(formData.get('prompt') ?? '').trim()
  if (!prompt) return

  setDashboardStatus('Saving generation draft.')
  const { error } = await supabase.from('portrait_generations').insert({
    status: 'draft',
    prompt,
    settings: {
      background: 'transparent',
      hair: 'short',
      outfit: 'plain black t-shirt',
      posture: 'standing'
    },
    created_by: state.user.id
  })

  if (error) {
    setDashboardStatus(error.message)
    return
  }

  await loadDashboard()
})

supabase?.auth.onAuthStateChange((_event, session) => {
  if (!session?.user) {
    renderSignedOut()
  }
})

bootstrap()
