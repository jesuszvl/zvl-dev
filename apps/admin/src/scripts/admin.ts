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
  portfolio_assets: { object_path: string } | null
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
const assetGrid = document.querySelector<HTMLElement>('[data-asset-grid]')
const generationGrid = document.querySelector<HTMLElement>('[data-generation-grid]')
const referenceCount = document.querySelector<HTMLElement>('[data-reference-count]')
const refreshButton = document.querySelector<HTMLButtonElement>('[data-refresh]')
const signOutButton = document.querySelector<HTMLButtonElement>('[data-sign-out]')
const createDraftButton =
  document.querySelector<HTMLButtonElement>('[data-create-draft]')
const uploadForm = document.querySelector<HTMLFormElement>('[data-upload-form]')
const generationForm = document.querySelector<HTMLFormElement>(
  '[data-generation-form]'
)

const state: { user: User | null; selected: Set<string> } = {
  user: null,
  selected: new Set()
}

const BUCKET = 'portfolio-private'

// Option keys from the form -> the phrasing that goes into the prompt.
const BACKGROUND: Record<string, string> = {
  transparent: 'isolated on a fully transparent background',
  studio: 'against a smooth neutral grey studio backdrop',
  solid: 'against a flat solid off-white background',
  office: 'in a softly blurred modern office interior'
}
const OUTFIT: Record<string, string> = {
  tee: 'a plain black t-shirt',
  shirt: 'a well-fitted button-down shirt',
  hoodie: 'a simple dark hoodie',
  jacket: 'a tailored casual jacket over a plain top'
}
const FRAMING: Record<string, string> = {
  standing: 'Full-body standing shot, three-quarter turn toward the camera',
  half: 'Half-body shot from the waist up, facing the camera',
  head: 'Head and shoulders portrait, facing the camera'
}
const LIGHTING: Record<string, string> = {
  studio: 'Natural studio lighting with soft shadows',
  window: 'Soft directional window light',
  dramatic: 'Dramatic high-contrast side lighting',
  editorial: 'Flat even editorial lighting'
}

type Settings = Record<string, string>

function readSettings(form: HTMLFormElement): Settings {
  const data = new FormData(form)
  return {
    background: String(data.get('background') ?? 'transparent'),
    outfit: String(data.get('outfit') ?? 'tee'),
    framing: String(data.get('framing') ?? 'standing'),
    lighting: String(data.get('lighting') ?? 'studio'),
    notes: String(data.get('notes') ?? '')
  }
}

function buildPrompt(settings: Settings) {
  const parts = [
    'Photorealistic portrait of the same person shown in the reference photographs.',
    'Preserve their facial features, skin tone, facial hair and hairstyle exactly as they appear in the references.',
    `${FRAMING[settings.framing] ?? FRAMING.standing}.`,
    `Wearing ${OUTFIT[settings.outfit] ?? OUTFIT.tee}.`,
    `${LIGHTING[settings.lighting] ?? LIGHTING.studio}.`,
    `Subject ${BACKGROUND[settings.background] ?? BACKGROUND.transparent}.`,
    'Sharp focus, natural colour, no text or watermarks.'
  ]
  if (settings.notes.trim()) parts.push(settings.notes.trim())
  return parts.join(' ')
}

// One batch call keeps the grid to a single request instead of one per thumbnail.
async function signedUrls(paths: string[]) {
  const urls = new Map<string, string>()
  if (!supabase || paths.length === 0) return urls
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600)
  data?.forEach((entry) => {
    if (entry.signedUrl && entry.path) urls.set(entry.path, entry.signedUrl)
  })
  return urls
}

function emptyMessage(host: HTMLElement, message: string) {
  const note = document.createElement('p')
  note.className = 'empty'
  note.textContent = message
  host.append(note)
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

async function renderAssets(assets: PortfolioAsset[]) {
  if (!assetGrid) return
  assetGrid.textContent = ''
  if (referenceCount) {
    referenceCount.textContent = `${assets.length} photo${assets.length === 1 ? '' : 's'}`
  }
  if (assets.length === 0) {
    state.selected.clear()
    emptyMessage(assetGrid, 'No reference photos yet.')
    return
  }

  const urls = await signedUrls(assets.map((asset) => asset.object_path))

  assets.forEach((asset) => {
    const figure = document.createElement('label')
    const checkbox = document.createElement('input')
    const image = document.createElement('img')
    const remove = document.createElement('button')

    figure.className = 'thumb'
    checkbox.type = 'checkbox'
    checkbox.checked = state.selected.has(asset.id)
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) state.selected.add(asset.id)
      else state.selected.delete(asset.id)
      figure.classList.toggle('is-selected', checkbox.checked)
    })

    image.src = urls.get(asset.object_path) ?? ''
    image.alt = asset.alt_text ?? 'Portrait reference'
    image.loading = 'lazy'

    remove.type = 'button'
    remove.className = 'thumb-remove'
    remove.textContent = 'Remove'
    remove.addEventListener('click', (event) => {
      event.preventDefault()
      void deleteReference(asset)
    })

    // Opening the full photo is how you feed it to ChatGPT.
    const open = document.createElement('a')
    open.className = 'thumb-open'
    open.href = urls.get(asset.object_path) ?? '#'
    open.target = '_blank'
    open.rel = 'noreferrer'
    open.textContent = 'Open'
    open.addEventListener('click', (event) => event.stopPropagation())

    const actions = document.createElement('span')
    actions.className = 'thumb-actions'
    actions.append(open, remove)

    figure.classList.toggle('is-selected', checkbox.checked)
    figure.append(checkbox, image, actions)
    assetGrid.append(figure)
  })
}

async function renderGenerations(generations: PortraitGeneration[]) {
  if (!generationGrid) return
  generationGrid.textContent = ''
  if (generations.length === 0) {
    emptyMessage(generationGrid, 'Nothing generated yet.')
    return
  }

  const paths = generations
    .map((generation) => generation.portfolio_assets?.object_path)
    .filter((path): path is string => Boolean(path))
  const urls = await signedUrls(paths)

  generations.forEach((generation) => {
    const figure = document.createElement('figure')
    const image = document.createElement('img')
    const caption = document.createElement('figcaption')
    const publish = document.createElement('button')
    const path = generation.portfolio_assets?.object_path

    figure.className = 'thumb is-result'
    image.src = path ? (urls.get(path) ?? '') : ''
    image.alt = 'Generated portrait'
    image.loading = 'lazy'

    caption.textContent = `${generation.status} · ${formatDate(generation.created_at)}`
    caption.title = generation.prompt

    publish.type = 'button'
    publish.className = 'thumb-publish'
    publish.textContent = generation.status === 'approved' ? 'Live' : 'Publish'
    publish.disabled = generation.status === 'approved'
    publish.addEventListener('click', () => void publishGeneration(generation.id, publish))

    figure.append(image, caption, publish)
    generationGrid.append(figure)
  })
}

async function deleteReference(asset: PortfolioAsset) {
  if (!supabase) return
  setDashboardStatus('Removing photo.')

  const { error: storageError } = await supabase.storage
    .from(asset.bucket_id)
    .remove([asset.object_path])
  if (storageError) {
    setDashboardStatus(storageError.message)
    return
  }

  const { error } = await supabase.from('portfolio_assets').delete().eq('id', asset.id)
  if (error) {
    setDashboardStatus(error.message)
    return
  }

  state.selected.delete(asset.id)
  await loadDashboard()
}

// functions.invoke puts the body of a non-2xx response on error.context.
async function callFunction(name: string, body: unknown) {
  if (!supabase) throw new Error(supabaseConfigError ?? 'Supabase is not configured.')
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (!error) return data
  const detail = await error.context?.json().catch(() => null)
  throw new Error(detail?.error ?? error.message)
}

async function publishGeneration(generationId: string, trigger: HTMLButtonElement) {
  trigger.disabled = true
  setDashboardStatus('Publishing to the site.')
  try {
    const result = await callFunction('publish-portrait', { generationId })
    setDashboardStatus(
      result?.rebuildTriggered
        ? 'Published. The site is rebuilding.'
        : 'Published. Redeploy the site to pick it up.'
    )
    await loadDashboard()
  } catch (error) {
    trigger.disabled = false
    setDashboardStatus(error instanceof Error ? error.message : 'Publish failed.')
  }
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
      .eq('kind', 'portrait_reference')
      .order('created_at', { ascending: false })
      .limit(60),
    supabase
      .from('portrait_generations')
      .select(
        'id,status,prompt,created_at,portfolio_assets!portrait_generations_output_asset_id_fkey(object_path)'
      )
      .order('created_at', { ascending: false })
      .limit(8)
  ])

  if (contentResult.error) throw contentResult.error
  if (assetsResult.error) throw assetsResult.error
  if (generationsResult.error) throw generationsResult.error

  renderContentVersions((contentResult.data ?? []) as ContentVersion[])
  await renderAssets((assetsResult.data ?? []) as PortfolioAsset[])
  await renderGenerations((generationsResult.data ?? []) as PortraitGeneration[])

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
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return

  setLoginStatus('Signing in.')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    setLoginStatus(error.message)
    return
  }

  loginForm.reset()
  await bootstrap()
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

  const files = new FormData(uploadForm).getAll('file').filter((f): f is File => f instanceof File)
  if (files.length === 0) return

  for (const [index, file] of files.entries()) {
    setDashboardStatus(`Uploading ${index + 1} of ${files.length}.`)
    const path = `portrait-references/${state.user.id}/${Date.now()}-${safeFileName(file.name)}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false })
    if (uploadError) {
      setDashboardStatus(uploadError.message)
      return
    }

    const { error: assetError } = await supabase.from('portfolio_assets').insert({
      kind: 'portrait_reference',
      bucket_id: BUCKET,
      object_path: path,
      alt_text: file.name,
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
  }

  uploadForm.reset()
  setDashboardStatus('')
  await loadDashboard()
})

const promptPreview = document.querySelector<HTMLTextAreaElement>('[data-prompt-preview]')
const resultForm = document.querySelector<HTMLFormElement>('[data-result-form]')

function refreshPrompt() {
  if (!generationForm || !promptPreview) return
  promptPreview.value = buildPrompt(readSettings(generationForm))
}

generationForm?.addEventListener('input', refreshPrompt)
refreshPrompt()

generationForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!promptPreview) return
  try {
    await navigator.clipboard.writeText(promptPreview.value)
    setDashboardStatus('Prompt copied.')
  } catch {
    promptPreview.select()
    setDashboardStatus('Press copy to take the selected prompt.')
  }
})

// The image itself comes from ChatGPT; this records it and its references.
resultForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!supabase || !state.user || !generationForm) return

  const file = new FormData(resultForm).get('file')
  if (!(file instanceof File)) return

  const settings = readSettings(generationForm)
  const prompt = buildPrompt(settings)
  setDashboardStatus('Uploading portrait.')

  const path = `portrait-generations/${state.user.id}/${Date.now()}-${safeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) {
    setDashboardStatus(uploadError.message)
    return
  }

  const { data: asset, error: assetError } = await supabase
    .from('portfolio_assets')
    .insert({
      kind: 'portrait_generation',
      bucket_id: BUCKET,
      object_path: path,
      alt_text: 'Generated portrait',
      metadata: { contentType: file.type, fileName: file.name, source: 'chatgpt' },
      is_public: false,
      created_by: state.user.id
    })
    .select('id')
    .single()
  if (assetError) {
    setDashboardStatus(assetError.message)
    return
  }

  const { data: generation, error: generationError } = await supabase
    .from('portrait_generations')
    .insert({
      status: 'generated',
      prompt,
      settings,
      output_asset_id: asset.id,
      created_by: state.user.id
    })
    .select('id')
    .single()
  if (generationError) {
    setDashboardStatus(generationError.message)
    return
  }

  const links = [...state.selected].map((assetId) => ({
    portrait_generation_id: generation.id,
    asset_id: assetId,
    role: 'identity'
  }))
  links.push({
    portrait_generation_id: generation.id,
    asset_id: asset.id,
    role: 'result'
  })
  const { error: linkError } = await supabase.from('portrait_generation_assets').insert(links)
  if (linkError) {
    setDashboardStatus(linkError.message)
    return
  }

  resultForm.reset()
  setDashboardStatus('')
  await loadDashboard()
})

supabase?.auth.onAuthStateChange((_event, session) => {
  if (!session?.user) {
    renderSignedOut()
  }
})

bootstrap()
