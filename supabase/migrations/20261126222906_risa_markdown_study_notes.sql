-- Study notes are independent of videos and remain protected by module enrolment.
create table public.risa_study_notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.risa_course_topics(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 140),
  markdown text not null check (char_length(markdown) between 1 and 70000),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index risa_study_notes_topic_idx on public.risa_study_notes(topic_id, created_at);
alter table public.risa_study_notes enable row level security;
revoke all on public.risa_study_notes from anon, authenticated;
grant select, insert, update, delete on public.risa_study_notes to authenticated;

create policy "Administrators manage study notes"
on public.risa_study_notes for all to authenticated
using (exists (select 1 from public.risa_user_roles r
  where r.user_id = (select auth.uid()) and r.role = 'admin'))
with check (exists (select 1 from public.risa_user_roles r
  where r.user_id = (select auth.uid()) and r.role = 'admin'));

create policy "Enrolled students read published study notes"
on public.risa_study_notes for select to authenticated
using (is_published and exists (
  select 1 from public.risa_course_topics t
  join public.risa_courses c on c.id = t.course_id
  join public.risa_enrollments e on e.course_id = c.id
  where t.id = public.risa_study_notes.topic_id
    and t.is_published and c.is_published
    and e.student_id = (select auth.uid())
    and e.status in ('active', 'completed')
));

notify pgrst, 'reload schema';
