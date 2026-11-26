-- Courses (programmes) contain modules. Keep legacy module IDs and foreign keys.
create table public.risa_programmes (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  description text not null default '' check (char_length(description) <= 1200),
  is_published boolean not null default false
);

alter table public.risa_programmes enable row level security;
revoke all on public.risa_programmes from anon, authenticated;
grant select on public.risa_programmes to anon, authenticated;
grant insert, update on public.risa_programmes to authenticated;

create policy "Public reads published programmes"
  on public.risa_programmes for select to anon, authenticated
  using (is_published);

create policy "Admins read all programmes"
  on public.risa_programmes for select to authenticated
  using (exists (select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'));

create policy "Admins create programmes"
  on public.risa_programmes for insert to authenticated
  with check (exists (select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'));

create policy "Admins update programmes"
  on public.risa_programmes for update to authenticated
  using (exists (select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'))
  with check (exists (select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'));

alter table public.risa_courses
  add column programme_slug text references public.risa_programmes(slug)
    on delete restrict;
create index risa_courses_programme_slug_idx
  on public.risa_courses(programme_slug);

insert into public.risa_programmes (slug, title, description, is_published) values
  ('computer-science', 'Computer Science', 'Explore computing foundations, programming, systems, software engineering and artificial intelligence. Curriculum preview.', true),
  ('cloud-devops', 'Cloud & DevOps', 'Explore practical DevOps systems, automation, cloud infrastructure and reliability engineering. Curriculum preview.', true),
  ('ethical-hacking', 'Ethical Hacking', 'Explore cybersecurity and authorized security assessment in isolated training environments. Curriculum preview.', true),
  ('physics', 'Physics', 'Explore the physical sciences, beginning with Mechanics 1.', true);

update public.risa_courses set programme_slug = 'computer-science'
  where code in ('CS101','CS102','CS201','CS202','CS221','CS222','CS301','CS302');
update public.risa_courses set programme_slug = 'cloud-devops'
  where code in ('DVE101','DVE201','DVE301','DVE401','DVE501');
update public.risa_courses set programme_slug = 'ethical-hacking'
  where code in ('COMS101','COMS102','COMS103','COMS104','COMS105');
update public.risa_courses set programme_slug = 'physics' where code = 'PHY101';
