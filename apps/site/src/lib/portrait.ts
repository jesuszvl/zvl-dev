import fallback from '../images/portrait-original-belly-up.png'

// publish-portrait writes the approved portrait to this exact path.
const PUBLISHED =
  'https://eeltmgmeuxnajoggevct.supabase.co/storage/v1/object/public/portfolio-public/portrait/current.png'

async function published() {
  try {
    const response = await fetch(PUBLISHED, { method: 'HEAD', cache: 'no-store' })
    return response.ok ? PUBLISHED : null
  } catch {
    // A build should never fail because Supabase is unreachable.
    return null
  }
}

// Module scope, so Hero and Layout share one lookup per build.
export const portrait = (await published()) ?? fallback
export const portraitAlt = 'Studio portrait of Jesús Zavala'
