# jesuszavala.dev

Personal portfolio site of Jesús Zavala, product engineer. A single Astro page:
intro, selected work, and work history.

Live at **[jesuszavala.dev](https://jesuszavala.dev/)**.

## Stack

Astro · plain CSS (Geist + Instrument Serif via Fontsource) · PostHog analytics ·
deployed to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + build to dist/
npm run preview  # serve the build
```

## Where things live

- `src/pages/index.astro` — the whole page: projects, jobs, and markup.
- `src/layouts/Layout.astro` — head, meta/OG tags, global styles.
- `src/images/portfolio/` — project screenshots.
- `public/` — favicon, `og.jpg`, `sitemap.xml`, `robots.txt`, `CNAME`.

Adding a project: drop a `.webp` in `src/images/portfolio/`, then add an entry
to the `projects` array at the top of `index.astro`.
