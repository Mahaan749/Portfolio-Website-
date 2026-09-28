-- Portfolio CMS: run once in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Cybersecurity project',
  summary text not null default '',
  image_url text,
  live_url text,
  github_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  body text not null default '',
  image_url text,
  author text not null default 'Mahaan Shrestha',
  tags text[] not null default '{}',
  published_at timestamptz not null default now(),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_portfolio_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.posts enable row level security;

create policy "admins can read their role" on public.admin_users for select to authenticated using (user_id = auth.uid());
create policy "public can read published projects" on public.projects for select using (published or public.is_portfolio_admin());
create policy "admins manage projects" on public.projects for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "public can read published posts" on public.posts for select using (published or public.is_portfolio_admin());
create policy "admins manage posts" on public.posts for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public can view portfolio media" on storage.objects for select using (bucket_id = 'portfolio-media');
create policy "admins upload portfolio media" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());
create policy "admins update portfolio media" on storage.objects for update to authenticated using (bucket_id = 'portfolio-media' and public.is_portfolio_admin()) with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());
create policy "admins delete portfolio media" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

-- After creating your Auth user, approve it once with:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'YOUR-ADMIN-EMAIL@example.com';
