# jesuszavala.dev

Personal portfolio of Jesús Zavala, software and product engineer.
Live at **[jesuszavala.dev](https://jesuszavala.dev/)**.

## Stack

Astro with plain CSS and no other runtime dependencies. Fonts (Bricolage
Grotesque and Geist) are fetched at build time through Astro's Fonts API from
Fontsource and served locally. Deployed to GitHub Pages by
`.github/workflows/deploy.yml` on every push to `main`.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static build in dist/
npm run preview  # serve the build
```

## Where things live

- `src/data/portfolio.ts` — projects, work history, and capabilities. Edit content here.
- `src/components/` — one component per section (Hero, Work, Experience, About, Contact) plus the Sidebar and shared Icon. Each owns its markup, styles, and script.
- `src/layouts/Layout.astro` — head metadata, fonts, structured data, and the page shell.
- `src/styles/global.css` — design tokens, reset, shared classes, and the two breakpoints (900px collapses the sidebar into a top bar, 600px goes single column).
- `src/images/` — portrait and project screenshots, optimized at build time.
- `public/` — favicons, social preview image, `robots.txt`, `CNAME`.

Adding a project: drop a `.webp` in `src/images/portfolio/`, add an entry to
`projects` in `src/data/portfolio.ts` with its audience, your contribution,
stack, and actual status, and give its `theme` a tint in `Work.astro`. Keep
prototypes and demos clearly labeled.

Navigation and expandable details work without JavaScript. Scripts add the
local clock, the current-section indicator, and the copy-email button.
