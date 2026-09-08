insert into public.portfolio_content_versions (
  slug,
  version,
  status,
  summary,
  content,
  published_at
)
values (
  'portfolio',
  1,
  'published',
  'Initial portfolio content from the Astro source tree.',
  $content$
  {
    "profile": {
      "name": "Jesús Zavala",
      "title": "Software & Product Engineer",
      "email": "jesus@zvl.dev",
      "location": "Mexicali, México",
      "shortLocation": "Mexicali, MX",
      "timeZone": "America/Tijuana",
      "currentCompany": "Gametime",
      "github": "https://github.com/jesuszvl",
      "linkedin": "https://www.linkedin.com/in/jesuszvl/",
      "education": "CETYS Universidad",
      "educationPeriod": "2012-2016",
      "languages": "Spanish & English",
      "languageLevel": "C2"
    },
    "siteMeta": {
      "title": "Jesús Zavala — Software & Product Engineer",
      "description": "Software engineer in Mexicali, México. Building thoughtful web products since 2010, from community platforms and local commerce to civic technology. Currently at Gametime.",
      "ogImage": "/og-portfolio.jpg",
      "ogImageAlt": "Jesús Zavala. Good ideas. Thoughtful software. Product engineer in Mexicali, México."
    },
    "hero": {
      "eyebrow": "A portfolio of things made real",
      "greeting": "Hey, I’m Jesús",
      "marker": "✳",
      "titleLines": ["Good ideas.", "Thoughtful"],
      "titleAccent": "software.",
      "description": "I’m a software engineer who connects the dots between a product idea and the people using it.",
      "contextPrefix": "Building for the web since 2010. Currently at",
      "primaryAction": { "label": "Explore my work", "href": "#work" },
      "secondaryAction": { "label": "Let’s talk", "href": "mailto:jesus@zvl.dev" },
      "portraitAlt": "Studio portrait of Jesús Zavala",
      "portraitLabel": "The human behind the code",
      "portraitLocation": "Mexicali, México",
      "portraitNote": "Working everywhere.",
      "focusLead": "Product-minded.",
      "focusEmphasis": "Hands-on, end to end.",
      "focusItems": [
        "Frontend engineering",
        "Full-stack development",
        "Thoughtful user experiences"
      ]
    },
    "work": {
      "eyebrow": "Selected work",
      "title": "Built with a purpose.",
      "description": "Independent projects for real communities, businesses, and everyday problems.",
      "githubLabel": "More experiments and code on GitHub"
    },
    "projects": [
      {
        "name": "NoWildo",
        "category": "Community & entertainment",
        "headline": "A community that lives beyond the stream.",
        "description": "A home for a Spanish-speaking Twitch community, with a film archive, daily movie games, raffles, and a 3D arcade.",
        "contribution": "Product development, Twitch sign-in, and database logic.",
        "stack": ["Astro", "Supabase", "Postgres"],
        "status": "Live since 2024",
        "imageKey": "nowildo",
        "imagePath": "apps/site/src/images/portfolio/nowildo.webp",
        "imageAlt": "NoWildo website with a late-night entertainment headline and green illustrated mascot",
        "url": "https://nowildo.com",
        "domain": "nowildo.com",
        "theme": "nowildo"
      },
      {
        "name": "mexicali.vip",
        "category": "Commerce & small business",
        "headline": "Handmade products. A more useful storefront.",
        "description": "A local maker’s party centerpieces, easy to discover by age, preview in 3D and AR, and order through WhatsApp.",
        "contribution": "Storefront development, searchable product pages, and AR previews.",
        "stack": ["Next.js", "3D & AR", "SEO"],
        "status": "Storefront",
        "imageKey": "mexicalivip",
        "imagePath": "apps/site/src/images/portfolio/mexicalivip.webp",
        "imageAlt": "mexicali.vip storefront showcasing handmade party centerpieces",
        "url": "https://mexicali.vip",
        "domain": "mexicali.vip",
        "theme": "mexicali"
      },
      {
        "name": "PREP Libre",
        "category": "Civic technology · Open source",
        "headline": "Election software built to be inspectable.",
        "description": "An open-source preliminary election results project for Mexico’s local electoral bodies, informed by my work at IEEBC.",
        "contribution": "System architecture, electoral data modeling, and SQL-level tests. Currently in design and architecture, with a public demo; not ready for a real election.",
        "stack": ["Postgres", "Data modeling", "Open source"],
        "status": "Architecture & demo",
        "imageKey": "preplibre",
        "imagePath": "apps/site/src/images/portfolio/preplibre.webp",
        "imageAlt": "PREP Libre website introducing its open-source preliminary election results system",
        "url": "https://preplibre.com",
        "domain": "preplibre.com",
        "theme": "prep"
      },
      {
        "name": "Vodyet",
        "category": "Personal finance",
        "headline": "A clearer picture of everyday spending.",
        "description": "A Spanish-language expense tracker that brings category budgets, recurring payments, credit balances, and spending trends together.",
        "contribution": "App development, Google sign-in, and private per-user data access.",
        "stack": ["React", "Supabase", "PWA"],
        "status": "Web app",
        "imageKey": "vodyet",
        "imagePath": "apps/site/src/images/portfolio/vodyet.webp",
        "imageAlt": "Vodyet personal finance website introducing its expense tracker",
        "url": "https://vodyet.com",
        "domain": "vodyet.com",
        "theme": "vodyet"
      }
    ],
    "experienceIntro": {
      "eyebrow": "The work along the way",
      "titleLines": ["Different teams.", "The same care."],
      "description": "From local business tools to election systems and a consumer marketplace.",
      "earlierLabel": "Earlier chapters",
      "earlierPeriod": "2010 — 2018"
    },
    "experience": [
      {
        "company": "Gametime",
        "initial": "G",
        "period": "2022 — Present",
        "role": "Software Engineer",
        "context": "Consumer marketplace · Remote",
        "description": "Building the web product alongside Design, Product, and Backend. My work spans frontend systems, SEO improvements, conversion, and code review.",
        "tags": ["Frontend engineering", "SEO", "Product collaboration"],
        "current": true
      },
      {
        "company": "IEEBC",
        "initial": "I",
        "period": "2019 — 2022",
        "role": "Full-stack Software Engineer",
        "context": "Instituto Estatal Electoral de Baja California",
        "description": "Designed and maintained systems used during live elections, improved data consistency, and built Django REST APIs for internal data tracking.",
        "tags": ["Election systems", "Django", "Data integrity"],
        "current": false
      }
    ],
    "earlierExperience": [
      {
        "company": "Timbox",
        "period": "2018",
        "role": "Software Engineer",
        "description": "Ruby on Rails services, payment integrations, and invoicing workflows."
      },
      {
        "company": "SRAX",
        "period": "2016 — 2018",
        "role": "Software Engineer",
        "description": "Laravel APIs, web templates, and automated server configuration."
      },
      {
        "company": "Iconos",
        "period": "2010 — 2016",
        "role": "Software Developer & IT Support",
        "description": "Business-process automation and IT support for regional companies."
      }
    ],
    "about": {
      "eyebrow": "A bit about me",
      "titleLines": ["Curious by nature.", "Engineer by practice."],
      "copy": [
        "I like being close to the whole product: understanding the problem, building the interface, shaping the data, and improving what happens after launch.",
        "Small teams taught me to care about all of it. Outside my day job, I build projects for the simple satisfaction of turning “what if” into something someone can use."
      ],
      "linkLabel": "More about my background",
      "facts": [
        { "label": "Home base", "value": "Mexicali, México · Pacific time" },
        { "label": "Languages", "value": "Spanish & English", "note": "C2" },
        { "label": "Education", "value": "CETYS Universidad", "note": "2012–2016" }
      ]
    },
    "capabilities": [
      {
        "label": "Interfaces",
        "description": "Fast, accessible experiences with thoughtful details.",
        "tools": "TypeScript · React · Next.js · Astro"
      },
      {
        "label": "Systems",
        "description": "The APIs and data models that make a product work.",
        "tools": "Node.js · Python · Django · Postgres"
      },
      {
        "label": "Beyond launch",
        "description": "Making what ships easier to find, use, and maintain.",
        "tools": "SEO · Performance · Code review"
      }
    ],
    "contact": {
      "eyebrow": "Good things start with a conversation",
      "titleLines": ["What are you", "working on?"],
      "description": "A product to build, a problem to untangle, or a team that cares about the details. I’d love to hear about it.",
      "email": "jesus@zvl.dev",
      "copySuccess": "Copied!",
      "copyFallback": "Please select the email to copy it.",
      "links": [
        { "label": "GitHub", "href": "https://github.com/jesuszvl" },
        { "label": "LinkedIn", "href": "https://www.linkedin.com/in/jesuszvl/" }
      ]
    },
    "sidebar": {
      "monogram": "jz",
      "monogramSuffix": ".",
      "navigation": [
        { "href": "#work", "label": "Selected work", "icon": "grid" },
        { "href": "#experience", "label": "Experience", "icon": "briefcase" },
        { "href": "#about", "label": "About me", "icon": "person" },
        { "href": "#contact", "label": "Get in touch", "icon": "mail" }
      ],
      "currentRoleLead": "Currently building at",
      "noteLines": ["Made with care.", "From Mexicali, México."]
    },
    "assets": {
      "portrait": {
        "kind": "portrait_current",
        "localPath": "apps/site/src/images/portrait-standing-transparent.png",
        "background": "transparent",
        "description": "Standing transparent portrait with short hair and a plain black t-shirt."
      }
    }
  }
  $content$::jsonb,
  now()
)
on conflict (slug, version) do update
set
  status = excluded.status,
  summary = excluded.summary,
  content = excluded.content,
  published_at = excluded.published_at;
