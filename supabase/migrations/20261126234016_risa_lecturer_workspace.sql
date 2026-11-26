-- Module-scoped lecturer assignments; no change to the administrator role registry.
create table public.risa_lecturer_assignments (
  lecturer_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.risa_courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (lecturer_id, course_id)
);
create index risa_lecturer_assignment_module_idx on public.risa_lecturer_assignments(course_id);
alter table public.risa_lecturer_assignments enable row level security;
revoke all on public.risa_lecturer_assignments from anon, authenticated;
grant select, insert, delete on public.risa_lecturer_assignments to authenticated;
create policy "Administrators manage lecturer assignments"
on public.risa_lecturer_assignments for all to authenticated
using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'))
with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Lecturers see own assignments"
on public.risa_lecturer_assignments for select to authenticated
using (lecturer_id=(select auth.uid()));

create policy "Lecturers read assigned module metadata"
on public.risa_courses for select to authenticated
using (exists (select 1 from public.risa_lecturer_assignments a where a.course_id=risa_courses.id and a.lecturer_id=(select auth.uid())));
create policy "Lecturers see assigned module enrolments"
on public.risa_enrollments for select to authenticated
using (exists (select 1 from public.risa_lecturer_assignments a where a.course_id=risa_enrollments.course_id and a.lecturer_id=(select auth.uid())));

create table public.risa_practical_submissions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.risa_courses(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  activity text not null check (activity in ('programming','linux','sql','physics')),
  evidence text not null check (char_length(evidence) between 1 and 6000),
  created_at timestamptz not null default now(),
  score integer check (score between 0 and 100),
  feedback text check (char_length(feedback) between 1 and 2000),
  reviewed_at timestamptz,
  check ((score is null and feedback is null and reviewed_at is null) or
    (score is not null and feedback is not null and reviewed_at is not null))
);
create index risa_practical_submissions_module_idx on public.risa_practical_submissions(course_id,created_at desc);
create index risa_practical_submissions_student_idx on public.risa_practical_submissions(student_id,created_at desc);
alter table public.risa_practical_submissions enable row level security;
revoke all on public.risa_practical_submissions from anon, authenticated;
grant select on public.risa_practical_submissions to authenticated;
grant insert(course_id,student_id,activity,evidence) on public.risa_practical_submissions to authenticated;
grant update(score,feedback,reviewed_at) on public.risa_practical_submissions to authenticated;
create policy "Enrolled students submit their own evidence"
on public.risa_practical_submissions for insert to authenticated
with check (student_id=(select auth.uid()) and exists (
  select 1 from public.risa_enrollments e join public.risa_courses c on c.id=e.course_id
  where e.course_id=risa_practical_submissions.course_id and e.student_id=(select auth.uid())
    and e.status in ('active','completed') and c.is_published
));
create policy "Students read own practical submissions"
on public.risa_practical_submissions for select to authenticated
using (student_id=(select auth.uid()));
create policy "Assigned lecturers read module submissions"
on public.risa_practical_submissions for select to authenticated
using (exists (select 1 from public.risa_lecturer_assignments a where a.course_id=risa_practical_submissions.course_id and a.lecturer_id=(select auth.uid())));
create policy "Administrators read practical submissions"
on public.risa_practical_submissions for select to authenticated
using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Assigned lecturers review module submissions"
on public.risa_practical_submissions for update to authenticated
using (student_id<>(select auth.uid()) and exists (select 1 from public.risa_lecturer_assignments a where a.course_id=risa_practical_submissions.course_id and a.lecturer_id=(select auth.uid())))
with check (student_id<>(select auth.uid()) and exists (select 1 from public.risa_lecturer_assignments a where a.course_id=risa_practical_submissions.course_id and a.lecturer_id=(select auth.uid())));
create policy "Administrators review practical submissions"
on public.risa_practical_submissions for update to authenticated
using (student_id<>(select auth.uid()) and exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'))
with check (student_id<>(select auth.uid()) and exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));

notify pgrst, 'reload schema';
