# Supabase Portfolio Backend

This project stores admin-managed portfolio content and portrait assets for
`jesuszavala.dev`.

## Connected Project

- Project URL: `https://xinydijbceyopouscxoc.supabase.co`
- Public admin domain target: `admin.jesuszavala.dev`
- Admin app path: `apps/admin`
- Public site app path: `apps/site`

The Supabase MCP connector can currently read the project URL, but other
project operations are failing with a connector-side ByteString encoding error.
Until that is resolved, apply the SQL from Supabase Studio or a linked local
CLI session.

## Apply Locally Or In Studio

1. Open Supabase Studio for the `jesuszavala.dev` project.
2. Run `migrations/20260908204822_portfolio_admin_schema.sql` in the SQL editor.
3. Run `seed.sql` to insert the first published content version.
4. Create or invite your admin user in Auth.
5. Insert the admin row with that Auth user ID:

```sql
insert into public.site_admins (user_id, email)
values ('00000000-0000-0000-0000-000000000000', lower('jesus@zvl.dev'))
on conflict (user_id) do update set email = excluded.email;
```

Replace the UUID with the real user ID from Supabase Auth.

## Data Model

- `site_admins`: allowlist of users who can manage the portfolio.
- `portfolio_content_versions`: draft, published, and archived JSON content
  snapshots. Public clients can only read published versions.
- `portfolio_assets`: metadata for public portfolio images and private portrait
  references/generations.
- `portrait_generations`: prompt/settings/history for generated portraits.
- `portrait_generation_assets`: joins generation records to reference/output
  assets.
- `published_portfolio_content`: public read view for the active site content.
- `public_portfolio_assets`: public read view for published asset metadata.

## Storage

The migration creates two buckets:

- `portfolio-public`: public published images.
- `portfolio-private`: private portrait references and raw generated outputs.

Storage policies allow public reads from the public bucket and admin-only
uploads, updates, and deletes for both buckets.

## App Environment

Set these on the Vercel admin project:

```sh
PUBLIC_SUPABASE_URL=https://xinydijbceyopouscxoc.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Keep `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and deploy hook URLs in
server-only code or Supabase Edge Function secrets.

## Admin Domain

`admin.jesuszavala.dev` does not currently resolve in DNS. The live domain is
already on Vercel DNS targets, so add `admin.jesuszavala.dev` to the intended
Vercel project first, then create the `admin` DNS record in Namecheap using the
CNAME target Vercel provides. Do not point the subdomain at the apex domain.
