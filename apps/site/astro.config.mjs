// @ts-check
import { defineConfig, fontProviders } from 'astro/config'

export default defineConfig({
  site: 'https://jesuszavala.dev',
  image: { domains: ['eeltmgmeuxnajoggevct.supabase.co'] },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-display',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['sans-serif']
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Geist',
      cssVariable: '--font-sans',
      weights: ['400 600'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif']
    }
  ]
})
