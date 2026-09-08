create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default pg_catalog.now(),
  constraint site_admins_email_lowercase check (email = lower(email))
);

create table public.portfolio_content_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null default 'portfolio',
  version integer not null,
  status text not null default 'draft',
  summary text,
  content jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  published_at timestamptz,
  constraint portfolio_content_versions_slug_check
    check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint portfolio_content_versions_version_check
    check (version > 0),
  constraint portfolio_content_versions_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint portfolio_content_versions_published_at_check
    check (status <> 'published' or published_at is not null),
  constraint portfolio_content_versions_slug_version_unique
    unique (slug, version)
);

create unique index portfolio_content_versions_one_published_per_slug_idx
  on public.portfolio_content_versions (slug)
  where status = 'published';

create index portfolio_content_versions_latest_idx
  on public.portfolio_content_versions (slug, status, version desc);

create index portfolio_content_versions_content_gin_idx
  on public.portfolio_content_versions using gin (content jsonb_path_ops);

create table public.portfolio_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  kind text not null,
  bucket_id text not null,
  object_path text not null,
  public_url text,
  alt_text text,
  metadata jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint portfolio_assets_kind_check
    check (
      kind in (
        'project_image',
        'portrait_current',
        'portrait_reference',
        'portrait_generation',
        'portrait_source',
        'og_image'
      )
    ),
  constraint portfolio_assets_bucket_check
    check (bucket_id in ('portfolio-public', 'portfolio-private')),
  constraint portfolio_assets_public_bucket_check
    check (not is_public or bucket_id = 'portfolio-public'),
  constraint portfolio_assets_path_unique unique (bucket_id, object_path)
);

create index portfolio_assets_public_kind_idx
  on public.portfolio_assets (kind, created_at desc)
  where is_public;

create index portfolio_assets_metadata_gin_idx
  on public.portfolio_assets using gin (metadata jsonb_path_ops);

create table public.portrait_generations (
  id uuid primary key default extensions.gen_random_uuid(),
  status text not null default 'draft',
  prompt text not null,
  settings jsonb not null default '{}'::jsonb,
  source_asset_id uuid references public.portfolio_assets(id) on delete set null,
  output_asset_id uuid references public.portfolio_assets(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint portrait_generations_status_check
    check (status in ('draft', 'queued', 'generated', 'approved', 'rejected', 'failed'))
);

create index portrait_generations_status_idx
  on public.portrait_generations (status, created_at desc);

create table public.portrait_generation_assets (
  portrait_generation_id uuid not null
    references public.portrait_generations(id) on delete cascade,
  asset_id uuid not null references public.portfolio_assets(id) on delete cascade,
  role text not null default 'identity',
  notes text,
  created_at timestamptz not null default pg_catalog.now(),
  primary key (portrait_generation_id, asset_id),
  constraint portrait_generation_assets_role_check
    check (role in ('identity', 'hair', 'posture', 'outfit', 'avoid', 'style', 'source', 'result'))
);

create index portrait_generation_assets_asset_id_idx
  on public.portrait_generation_assets (asset_id);

create or replace function private.is_site_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.site_admins
      where user_id = (select auth.uid())
    );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke execute on function private.is_site_admin() from public, anon, authenticated;
revoke execute on function private.set_updated_at() from public, anon, authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_site_admin() to anon, authenticated;

create trigger portfolio_content_versions_set_updated_at
before update on public.portfolio_content_versions
for each row execute function private.set_updated_at();

create trigger portfolio_assets_set_updated_at
before update on public.portfolio_assets
for each row execute function private.set_updated_at();

create trigger portrait_generations_set_updated_at
before update on public.portrait_generations
for each row execute function private.set_updated_at();

alter table public.site_admins enable row level security;
alter table public.portfolio_content_versions enable row level security;
alter table public.portfolio_assets enable row level security;
alter table public.portrait_generations enable row level security;
alter table public.portrait_generation_assets enable row level security;

revoke all on table public.site_admins from anon, authenticated;
revoke all on table public.portfolio_content_versions from anon, authenticated;
revoke all on table public.portfolio_assets from anon, authenticated;
revoke all on table public.portrait_generations from anon, authenticated;
revoke all on table public.portrait_generation_assets from anon, authenticated;

grant select on table public.site_admins to authenticated;
grant select on table public.portfolio_content_versions to authenticated;
grant insert, update, delete on table public.portfolio_content_versions to authenticated;
grant select on table public.portfolio_assets to authenticated;
grant insert, update, delete on table public.portfolio_assets to authenticated;
grant select, insert, update, delete on table public.portrait_generations to authenticated;
grant select, insert, update, delete on table public.portrait_generation_assets to authenticated;

create policy "Admins can read their admin record."
on public.site_admins for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Admins can read portfolio content versions."
on public.portfolio_content_versions for select
to authenticated
using ((select private.is_site_admin()));

create policy "Admins can create portfolio content versions."
on public.portfolio_content_versions for insert
to authenticated
with check ((select private.is_site_admin()));

create policy "Admins can update portfolio content versions."
on public.portfolio_content_versions for update
to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));

create policy "Admins can delete portfolio content versions."
on public.portfolio_content_versions for delete
to authenticated
using ((select private.is_site_admin()));

create policy "Admins can read portfolio asset metadata."
on public.portfolio_assets for select
to authenticated
using ((select private.is_site_admin()));

create policy "Admins can create portfolio asset metadata."
on public.portfolio_assets for insert
to authenticated
with check ((select private.is_site_admin()));

create policy "Admins can update portfolio asset metadata."
on public.portfolio_assets for update
to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));

create policy "Admins can delete portfolio asset metadata."
on public.portfolio_assets for delete
to authenticated
using ((select private.is_site_admin()));

create or replace view public.published_portfolio_content
with (security_barrier = true)
as
select
  slug,
  version,
  summary,
  content,
  updated_at,
  published_at
from public.portfolio_content_versions
where status = 'published';

create or replace view public.public_portfolio_assets
with (security_barrier = true)
as
select
  id,
  kind,
  public_url,
  alt_text,
  metadata,
  created_at,
  updated_at
from public.portfolio_assets
where is_public;

revoke all on public.published_portfolio_content from public, anon, authenticated;
revoke all on public.public_portfolio_assets from public, anon, authenticated;
grant select on public.published_portfolio_content to anon, authenticated;
grant select on public.public_portfolio_assets to anon, authenticated;

create policy "Admins can read portrait generations."
on public.portrait_generations for select
to authenticated
using ((select private.is_site_admin()));

create policy "Admins can create portrait generations."
on public.portrait_generations for insert
to authenticated
with check ((select private.is_site_admin()));

create policy "Admins can update portrait generations."
on public.portrait_generations for update
to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));

create policy "Admins can delete portrait generations."
on public.portrait_generations for delete
to authenticated
using ((select private.is_site_admin()));

create policy "Admins can read portrait generation assets."
on public.portrait_generation_assets for select
to authenticated
using ((select private.is_site_admin()));

create policy "Admins can create portrait generation assets."
on public.portrait_generation_assets for insert
to authenticated
with check ((select private.is_site_admin()));

create policy "Admins can update portrait generation assets."
on public.portrait_generation_assets for update
to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));

create policy "Admins can delete portrait generation assets."
on public.portrait_generation_assets for delete
to authenticated
using ((select private.is_site_admin()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'portfolio-public',
    'portfolio-public',
    true,
    10485760,
    array['image/png', 'image/jpeg', 'image/webp']::text[]
  ),
  (
    'portfolio-private',
    'portfolio-private',
    false,
    20971520,
    array['image/png', 'image/jpeg', 'image/webp']::text[]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public bucket objects are readable."
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-public');

create policy "Admins can read portfolio storage objects."
on storage.objects for select
to authenticated
using (
  bucket_id in ('portfolio-public', 'portfolio-private')
  and (select private.is_site_admin())
);

create policy "Admins can upload portfolio storage objects."
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('portfolio-public', 'portfolio-private')
  and (select private.is_site_admin())
);

create policy "Admins can update portfolio storage objects."
on storage.objects for update
to authenticated
using (
  bucket_id in ('portfolio-public', 'portfolio-private')
  and (select private.is_site_admin())
)
with check (
  bucket_id in ('portfolio-public', 'portfolio-private')
  and (select private.is_site_admin())
);

create policy "Admins can delete portfolio storage objects."
on storage.objects for delete
to authenticated
using (
  bucket_id in ('portfolio-public', 'portfolio-private')
  and (select private.is_site_admin())
);
