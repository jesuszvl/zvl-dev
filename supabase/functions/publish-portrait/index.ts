import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const DEPLOY_HOOK = Deno.env.get('VERCEL_SITE_DEPLOY_HOOK_URL')

// The site reads this exact path at build time, so publishing overwrites it.
const LIVE_PATH = 'portrait/current.png'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    })

  try {
    const authorization = req.headers.get('Authorization') ?? ''
    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authorization } }
    })
    const { data: { user } } = await caller.auth.getUser()
    if (!user) return json({ error: 'Not signed in.' }, 401)

    const { data: adminRow } = await caller
      .from('site_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!adminRow) return json({ error: 'Not an admin.' }, 403)

    const { generationId } = await req.json()
    if (!generationId) return json({ error: 'Missing generationId.' }, 400)

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: generation, error: generationError } = await admin
      .from('portrait_generations')
      .select('id,output_asset_id,portfolio_assets!portrait_generations_output_asset_id_fkey(bucket_id,object_path,metadata)')
      .eq('id', generationId)
      .single()
    if (generationError) throw generationError

    const source = generation.portfolio_assets as unknown as {
      bucket_id: string
      object_path: string
      metadata: Record<string, unknown>
    } | null
    if (!source) return json({ error: 'That generation has no image.' }, 400)

    const { data: blob, error: downloadError } = await admin.storage
      .from(source.bucket_id)
      .download(source.object_path)
    if (downloadError) throw downloadError

    const { error: uploadError } = await admin.storage
      .from('portfolio-public')
      .upload(LIVE_PATH, blob, {
        contentType: 'image/png',
        // Short TTL so the site build right after this picks up the new file.
        cacheControl: '0',
        upsert: true
      })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = admin.storage
      .from('portfolio-public')
      .getPublicUrl(LIVE_PATH)

    // Previous live portraits stop being public so the view only ever has one.
    await admin
      .from('portfolio_assets')
      .update({ is_public: false })
      .eq('kind', 'portrait_current')
      .eq('is_public', true)

    const { error: assetError } = await admin.from('portfolio_assets').upsert(
      {
        kind: 'portrait_current',
        bucket_id: 'portfolio-public',
        object_path: LIVE_PATH,
        public_url: publicUrl,
        alt_text: 'Studio portrait of Jesús Zavala',
        metadata: { ...source.metadata, generationId },
        is_public: true,
        created_by: user.id
      },
      { onConflict: 'bucket_id,object_path' }
    )
    if (assetError) throw assetError

    const { error: statusError } = await admin
      .from('portrait_generations')
      .update({ status: 'approved' })
      .eq('id', generationId)
    if (statusError) throw statusError

    let rebuildTriggered = false
    if (DEPLOY_HOOK) {
      const hook = await fetch(DEPLOY_HOOK, { method: 'POST' })
      rebuildTriggered = hook.ok
    }

    return json({ publicUrl, rebuildTriggered })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500)
  }
})
