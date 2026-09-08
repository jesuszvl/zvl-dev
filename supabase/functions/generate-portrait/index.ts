import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type'
}

// Option keys the admin sends -> the phrasing that goes into the prompt.
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

const MAX_REFERENCES = 10

function pick(map: Record<string, string>, key: unknown, fallback: string) {
  return typeof key === 'string' && key in map ? map[key] : map[fallback]
}

function buildPrompt(settings: Record<string, unknown>, notes: string) {
  const parts = [
    'Photorealistic portrait of the same person shown in the reference photographs.',
    'Preserve their facial features, skin tone, facial hair and hairstyle exactly as they appear in the references.',
    `${pick(FRAMING, settings.framing, 'standing')}.`,
    `Wearing ${pick(OUTFIT, settings.outfit, 'tee')}.`,
    `${pick(LIGHTING, settings.lighting, 'studio')}.`,
    `Subject ${pick(BACKGROUND, settings.background, 'transparent')}.`,
    'Sharp focus, natural colour, no text or watermarks.'
  ]
  if (notes.trim()) parts.push(notes.trim())
  return parts.join(' ')
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

    // RLS only exposes an admin's own row, so a hit here proves admin.
    const { data: adminRow } = await caller
      .from('site_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!adminRow) return json({ error: 'Not an admin.' }, 403)

    if (!OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY is not set on this function.' }, 500)

    const { referenceAssetIds = [], settings = {}, notes = '' } = await req.json()
    if (!Array.isArray(referenceAssetIds) || referenceAssetIds.length === 0) {
      return json({ error: 'Select at least one reference photo.' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: assets, error: assetError } = await admin
      .from('portfolio_assets')
      .select('id,bucket_id,object_path')
      .in('id', referenceAssetIds.slice(0, MAX_REFERENCES))
    if (assetError) throw assetError
    if (!assets?.length) return json({ error: 'Those references no longer exist.' }, 400)

    const prompt = buildPrompt(settings, String(notes))
    const form = new FormData()
    form.append('model', 'gpt-image-1')
    form.append('prompt', prompt)
    form.append('size', '1024x1536')
    form.append('quality', 'high')
    form.append('output_format', 'png')
    if (settings.background === 'transparent') form.append('background', 'transparent')

    for (const asset of assets) {
      const { data: blob, error } = await admin.storage
        .from(asset.bucket_id)
        .download(asset.object_path)
      if (error) throw error
      form.append('image[]', new File([blob], `${asset.id}.png`, { type: blob.type }))
    }

    // ponytail: synchronous call, ~30-60s. Move to a queue if it ever hits the function timeout.
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form
    })
    const result = await response.json()
    if (!response.ok) {
      return json({ error: result?.error?.message ?? 'Image generation failed.' }, 502)
    }

    const b64 = result?.data?.[0]?.b64_json
    if (!b64) return json({ error: 'Model returned no image.' }, 502)
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

    const objectPath = `portrait-generations/${user.id}/${Date.now()}.png`
    const { error: uploadError } = await admin.storage
      .from('portfolio-private')
      .upload(objectPath, bytes, { contentType: 'image/png', upsert: false })
    if (uploadError) throw uploadError

    const { data: outputAsset, error: outputError } = await admin
      .from('portfolio_assets')
      .insert({
        kind: 'portrait_generation',
        bucket_id: 'portfolio-private',
        object_path: objectPath,
        alt_text: 'Generated portrait',
        metadata: { width: 1024, height: 1536, model: 'gpt-image-1', source: 'generate-portrait' },
        is_public: false,
        created_by: user.id
      })
      .select('id')
      .single()
    if (outputError) throw outputError

    const { data: generation, error: generationError } = await admin
      .from('portrait_generations')
      .insert({
        status: 'generated',
        prompt,
        settings,
        output_asset_id: outputAsset.id,
        created_by: user.id
      })
      .select('id')
      .single()
    if (generationError) throw generationError

    const links = assets.map((asset) => ({
      portrait_generation_id: generation.id,
      asset_id: asset.id,
      role: 'identity'
    }))
    links.push({
      portrait_generation_id: generation.id,
      asset_id: outputAsset.id,
      role: 'result'
    })
    const { error: linkError } = await admin.from('portrait_generation_assets').insert(links)
    if (linkError) throw linkError

    return json({ generationId: generation.id, assetId: outputAsset.id })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500)
  }
})
