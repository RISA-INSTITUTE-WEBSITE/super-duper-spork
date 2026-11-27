create table public.risa_policies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  title text not null check (char_length(trim(title)) between 2 and 160),
  category text not null check (char_length(trim(category)) between 2 and 80),
  version text not null check (char_length(trim(version)) between 1 and 40),
  effective_date date,
  body text not null check (char_length(trim(body)) between 1 and 50000),
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.risa_policies enable row level security;
revoke all on public.risa_policies from public, anon, authenticated;
grant select on public.risa_policies to anon, authenticated;
grant insert, update on public.risa_policies to authenticated;
create policy "Public reads published policies" on public.risa_policies
  for select to anon, authenticated using (is_published);
create policy "Admins read all policies" on public.risa_policies
  for select to authenticated using (exists (
    select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  ));
create policy "Admins create policies" on public.risa_policies
  for insert to authenticated with check (exists (
    select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  ));
create policy "Admins update policies" on public.risa_policies
  for update to authenticated using (exists (
    select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  )) with check (exists (
    select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  ));
