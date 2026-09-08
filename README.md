# jesuszavala.dev

Personal portfolio and private content admin for Jesús Zavala.

## Stack

This is an npm workspace monorepo:

- `apps/site` — public Astro portfolio for `jesuszavala.dev`.
- `apps/admin` — private Astro admin for `admin.jesuszavala.dev`.
- `supabase` — database migrations, local config, and seed data.

## Local development

```sh
npm install
npm run dev:site      # http://localhost:4321
npm run dev:admin     # http://127.0.0.1:4322
npm run build         # build both apps
npm run build:site    # build only the public site
npm run build:admin   # build only the admin
```

The admin app reads Supabase browser env vars from `apps/admin/.env` in local
development:

```sh
PUBLIC_SUPABASE_URL=https://xinydijbceyopouscxoc.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Where things live

- `apps/site/src/data/portfolio.ts` — current public site content.
- `apps/site/src/components/` — public portfolio sections.
- `apps/site/src/layouts/Layout.astro` — public site metadata, fonts, structured data, and shell.
- `apps/site/src/styles/global.css` — public site design tokens and shared CSS.
- `apps/site/src/images/` — portrait and project screenshots optimized at build time.
- `apps/admin/src/pages/` — admin routes, including `/` and `/auth/confirm`.
- `apps/admin/src/scripts/` — Supabase Auth, admin checks, uploads, and content actions.
- `apps/admin/src/lib/supabase.ts` — browser Supabase client.
- `supabase/migrations/` — database and storage schema.

Adding a project: drop a `.webp` in `apps/site/src/images/portfolio/`, add an
entry to `projects` in `apps/site/src/data/portfolio.ts` with its audience, your
contribution, stack, and actual status, and give its `theme` a tint in
`Work.astro`. Keep prototypes and demos clearly labeled.

Navigation and expandable details work without JavaScript. Scripts add the
local clock, the current-section indicator, and the copy-email button.

## Vercel Projects

Create two Vercel projects from this same repository:

- Public site: root directory `apps/site`, domain `jesuszavala.dev` and `www.jesuszavala.dev`.
- Admin: root directory `apps/admin`, domain `admin.jesuszavala.dev`.

Both apps use `npm run build` and output `dist` from their own root directory.
Set the Supabase public env vars on the admin Vercel project. Keep service role,
OpenAI, and deploy hook secrets out of client-side code.
