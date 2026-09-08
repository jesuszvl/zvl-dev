# Supabase Portfolio Backend

This project stores admin-managed portfolio content and portrait assets for
`jesuszavala.dev`.

## Connected Project

- Project URL: `https://eeltmgmeuxnajoggevct.supabase.co`
- Project ref: `eeltmgmeuxnajoggevct`
- Public admin domain target: `admin.jesuszavala.dev`
- Admin app path: `apps/admin`
- Public site app path: `apps/site`

## Applied State

The schema, seed, and admin user are already applied to the project above.
`site_admins` holds one row for `jesuszavalavalle@gmail.com`.

To re-apply after adding a migration:

```sh
supabase link --project-ref eeltmgmeuxnajoggevct
supabase db push                 # migrations only
supabase db push --include-seed  # also re-runs seed.sql (idempotent)
```

Adding another admin means creating the user in Auth, then inserting their
Auth user ID:

```sql
insert into public.site_admins (user_id, email)
values ('<auth-user-uuid>', lower('someone@example.com'))
on conflict (user_id) do update set email = excluded.email;
```

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
PUBLIC_SUPABASE_URL=https://eeltmgmeuxnajoggevct.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Keep `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and deploy hook URLs in
server-only code or Supabase Edge Function secrets.

## Admin Domain

`admin.jesuszavala.dev` does not currently resolve in DNS. The live domain is
already on Vercel DNS targets, so add `admin.jesuszavala.dev` to the intended
Vercel project first, then create the `admin` DNS record in Namecheap using the
CNAME target Vercel provides. Do not point the subdomain at the apex domain.
