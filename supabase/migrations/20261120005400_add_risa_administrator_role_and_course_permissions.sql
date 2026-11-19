-- RISA administrator role and least-privilege course administration.
-- This migration was also applied to RISA's connected Supabase project.
-- Only trusted SQL-editor/service-role operators may grant or revoke admin.
create table public.risa_user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role = 'admin'),
  granted_at timestamptz not null default now()
);

alter table public.risa_user_roles enable row level security;
revoke all on public.risa_user_roles from anon, authenticated;
grant select on public.risa_user_roles to authenticated;

create policy "A signed-in user may read only their own RISA role"
on public.risa_user_roles for select to authenticated
using (user_id = (select auth.uid()));

grant select, insert, update, delete
on public.risa_courses, public.risa_enrollments, public.risa_course_materials
to authenticated;

create policy "Admin can read every course"
on public.risa_courses for select to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can courses"
on public.risa_courses for insert to authenticated
with check (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can update courses"
on public.risa_courses for update to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
))
with check (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can delete courses"
on public.risa_courses for delete to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can read every enrolment"
on public.risa_enrollments for select to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can enrol learners"
on public.risa_enrollments for insert to authenticated
with check (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can update enrolments"
on public.risa_enrollments for update to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
))
with check (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can delete enrolments"
on public.risa_enrollments for delete to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can read every course material"
on public.risa_course_materials for select to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can publish course materials"
on public.risa_course_materials for insert to authenticated
with check (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can update course materials"
on public.risa_course_materials for update to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
))
with check (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can delete course materials"
on public.risa_course_materials for delete to authenticated
using (exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

-- Course files remain in a private bucket. Admins can manage those files;
-- learners continue to access enrolled-course files under their existing RLS.
create policy "Admin can read private course files"
on storage.objects for select to authenticated
using (bucket_id = 'risa-course-content' and exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can upload private course files"
on storage.objects for insert to authenticated
with check (bucket_id = 'risa-course-content' and exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can update private course files"
on storage.objects for update to authenticated
using (bucket_id = 'risa-course-content' and exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
))
with check (bucket_id = 'risa-course-content' and exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));

create policy "Admin can remove private course files"
on storage.objects for delete to authenticated
using (bucket_id = 'risa-course-content' and exists (
  select 1 from public.risa_user_roles roles
  where roles.user_id = (select auth.uid()) and roles.role = 'admin'
));
