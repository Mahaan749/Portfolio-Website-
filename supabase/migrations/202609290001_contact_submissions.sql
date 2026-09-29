-- Contact inbox for the portfolio admin dashboard.
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 320),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'unread' check (status in ('unread', 'read')),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "visitors can submit contact messages" on public.contact_submissions;
create policy "visitors can submit contact messages"
on public.contact_submissions for insert to anon, authenticated
with check (status = 'unread');

drop policy if exists "admins can read contact messages" on public.contact_submissions;
create policy "admins can read contact messages"
on public.contact_submissions for select to authenticated
using (public.is_portfolio_admin());

drop policy if exists "admins can update contact messages" on public.contact_submissions;
create policy "admins can update contact messages"
on public.contact_submissions for update to authenticated
using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

drop policy if exists "admins can delete contact messages" on public.contact_submissions;
create policy "admins can delete contact messages"
on public.contact_submissions for delete to authenticated
using (public.is_portfolio_admin());

create index if not exists contact_submissions_created_at_idx
on public.contact_submissions (created_at desc);
