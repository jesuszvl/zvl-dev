import nowildo from '../images/portfolio/nowildo.webp'
import mexicalivip from '../images/portfolio/mexicalivip.webp'
import preplibre from '../images/portfolio/preplibre.webp'
import vodyet from '../images/portfolio/vodyet.webp'

// Based on the existing portfolio; keep contribution and project status explicit.
export const projects = [
  {
    name: 'mexicali.vip',
    category: 'Commerce & small business',
    headline: 'Handmade products. A more useful storefront.',
    description:
      'A local maker’s party centerpieces, easy to discover by age, preview in 3D and AR, and order through WhatsApp.',
    contribution:
      'Storefront development, searchable product pages, and AR previews.',
    stack: ['Next.js', '3D & AR', 'SEO'],
    status: 'Storefront',
    image: mexicalivip,
    imageAlt: 'mexicali.vip storefront showcasing handmade party centerpieces',
    url: 'https://mexicali.vip',
    domain: 'mexicali.vip',
    theme: 'mexicali'
  },
  {
    name: 'PREP Libre',
    category: 'Civic technology · Open source',
    headline: 'Election software built to be inspectable.',
    description:
      'An open-source preliminary election results project for Mexico’s local electoral bodies, informed by my work at IEEBC.',
    contribution:
      'System architecture, electoral data modeling, and SQL-level tests. Currently in design and architecture, with a public demo; not ready for a real election.',
    stack: ['Postgres', 'Data modeling', 'Open source'],
    status: 'Architecture & demo',
    image: preplibre,
    imageAlt:
      'PREP Libre website introducing its open-source preliminary election results system',
    url: 'https://preplibre.com',
    domain: 'preplibre.com',
    theme: 'prep'
  },
  {
    name: 'Vodyet',
    category: 'Personal finance',
    headline: 'A clearer picture of everyday spending.',
    description:
      'A Spanish-language expense tracker that brings category budgets, recurring payments, credit balances, and spending trends together.',
    contribution:
      'App development, Google sign-in, and private per-user data access.',
    stack: ['React', 'Supabase', 'PWA'],
    status: 'Web app',
    image: vodyet,
    imageAlt: 'Vodyet personal finance website introducing its expense tracker',
    url: 'https://vodyet.com',
    domain: 'vodyet.com',
    theme: 'vodyet'
  },
  {
    name: 'NoWildo',
    category: 'Community & entertainment',
    headline: 'A community that lives beyond the stream.',
    description:
      'A home for a Spanish-speaking Twitch community, with a film archive, daily movie games, raffles, and a 3D arcade.',
    contribution: 'Product development, Twitch sign-in, and database logic.',
    stack: ['Astro', 'Supabase', 'Postgres'],
    status: 'Live since 2024',
    image: nowildo,
    imageAlt:
      'NoWildo website with a late-night entertainment headline and green illustrated mascot',
    url: 'https://nowildo.com',
    domain: 'nowildo.com',
    theme: 'nowildo'
  }
]

export const experience = [
  {
    company: 'Gametime',
    initial: 'G',
    period: '2022 — Present',
    role: 'Software Engineer',
    context: 'Consumer marketplace · Remote',
    description:
      'Leading conversion and pricing-transparency work across the purchase journey, from planning with Product, Design, and Backend through experimentation and rollout. The unified event header I shipped added $5.1M in annualized GMV and 1.83% purchase conversion.',
    tags: ['Conversion & experimentation', 'Frontend architecture', 'SEO'],
    current: true
  },
  {
    company: 'IEEBC',
    initial: 'I',
    period: '2019 — 2022',
    role: 'Full-stack Software Engineer',
    context: 'Instituto Estatal Electoral de Baja California',
    description:
      'Built the electoral records and district vote-counting platform that carried 17 electoral districts through the 2020–2021 election, along with the internal systems and statistical reporting used around it.',
    tags: ['Election systems', 'Django', 'Data integrity'],
    current: false
  }
]

export const earlierExperience = [
  {
    company: 'Timbox',
    period: '2018',
    role: 'Software Engineer',
    description:
      'Ruby on Rails services, payment integrations, and invoicing workflows.'
  },
  {
    company: 'SRAX',
    period: '2016 — 2018',
    role: 'Software Engineer',
    description:
      'Laravel APIs, web templates, and automated server configuration.'
  },
  {
    company: 'Iconos',
    period: '2010 — 2016',
    role: 'Software Developer & IT Support',
    description:
      'Point-of-sale, inventory, and HR platforms, plus fuel monitoring across service stations and transport fleets.'
  }
]

export const capabilities = [
  {
    label: 'Interfaces',
    description: 'Fast, accessible experiences with thoughtful details.',
    tools: 'TypeScript · React · Next.js · Astro'
  },
  {
    label: 'Systems',
    description: 'The APIs and data models that make a product work.',
    tools: 'Node.js · Python · Django · Postgres'
  },
  {
    label: 'Beyond launch',
    description: 'Making what ships easier to find, use, and maintain.',
    tools: 'SEO · Performance · Code review'
  }
]
