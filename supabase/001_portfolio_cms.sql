-- Portfolio Studio schema and access rules.
-- Run in your OWN Supabase project using SQL Editor.
-- NEVER add service_role keys to browser source code.

create table if not exists public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_content (
  key text primary key check (key in ('draft', 'published')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  is_published boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint published_matches_key check (is_published = (key = 'published'))
);

create table if not exists public.cms_revisions (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now()
);
create index if not exists cms_revisions_recent_idx on public.cms_revisions (published_at desc);

create or replace function public.cms_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cms_content_updated on public.cms_content;
create trigger cms_content_updated before update on public.cms_content
for each row execute function public.cms_set_updated_at();

alter table public.cms_admins enable row level security;
alter table public.cms_content enable row level security;
alter table public.cms_revisions enable row level security;

-- Admins may only see their own membership; NO browser user can grant admin rights.
drop policy if exists "Read own CMS admin membership" on public.cms_admins;
create policy "Read own CMS admin membership" on public.cms_admins
for select to authenticated using (user_id = (select auth.uid()));

-- Unauthenticated visitors may read ONLY the published row.
drop policy if exists "Read published portfolio" on public.cms_content;
create policy "Read published portfolio" on public.cms_content
for select to anon, authenticated using (key = 'published' and is_published);

-- Authenticated admins may read drafts and publish, but nobody else may write.
drop policy if exists "Admin read CMS content" on public.cms_content;
create policy "Admin read CMS content" on public.cms_content
for select to authenticated using (
  exists (select 1 from public.cms_admins where user_id = (select auth.uid()))
);
drop policy if exists "Admin insert CMS content" on public.cms_content;
create policy "Admin insert CMS content" on public.cms_content
for insert to authenticated with check (
  exists (select 1 from public.cms_admins where user_id = (select auth.uid()))
);
drop policy if exists "Admin update CMS content" on public.cms_content;
create policy "Admin update CMS content" on public.cms_content
for update to authenticated using (
  exists (select 1 from public.cms_admins where user_id = (select auth.uid()))
) with check (
  exists (select 1 from public.cms_admins where user_id = (select auth.uid()))
);
-- Deliberately no delete policy: versions and published content cannot be removed from browser.

drop policy if exists "Admin read CMS revisions" on public.cms_revisions;
create policy "Admin read CMS revisions" on public.cms_revisions
for select to authenticated using (
  exists (select 1 from public.cms_admins where user_id = (select auth.uid()))
);
drop policy if exists "Admin record CMS revision" on public.cms_revisions;
create policy "Admin record CMS revision" on public.cms_revisions
for insert to authenticated with check (
  published_by = (select auth.uid()) and
  exists (select 1 from public.cms_admins where user_id = (select auth.uid()))
);

grant usage on schema public to anon, authenticated;
grant select on public.cms_content to anon;
grant select on public.cms_content, public.cms_admins, public.cms_revisions to authenticated;
grant insert, update on public.cms_content to authenticated;
grant insert on public.cms_revisions to authenticated;

-- Publicly readable asset bucket, but only allowlisted admins can upload/edit objects.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',true,5242880,
  array['image/png','image/jpeg','image/webp','image/gif','application/pdf']::text[])
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Portfolio admin upload media" on storage.objects;
create policy "Portfolio admin upload media" on storage.objects
for insert to authenticated with check (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.cms_admins where user_id = (select auth.uid()))
);
-- No overwrite or delete policies: immutable, cacheable uploads.

-- NEXT: create an Auth user by hand in Supabase Auth > Users, then run this
-- with the user UUID returned in the dashboard (not an email or a guessed UUID):
-- insert into public.cms_admins (user_id) values ('USER_UUID_FROM_AUTH_USERS');
