-- Signed-in learners may preview published topic and video metadata.
-- Playable media, quizzes, answer keys and private files stay enrolled-only.
-- YouTube video IDs are public identifiers, not DRM.
create policy "Registered learners preview published RISA topics"
on public.risa_course_topics for select to authenticated
using (
  is_published
  and exists (
    select 1 from public.risa_courses c
    where c.id = risa_course_topics.course_id and c.is_published
  )
);

create policy "Registered learners preview published video metadata"
on public.risa_topic_videos for select to authenticated
using (
  is_published
  and exists (
    select 1
    from public.risa_course_topics t
    join public.risa_courses c on c.id = t.course_id
    where t.id = risa_topic_videos.topic_id
      and t.is_published and c.is_published
  )
);

-- Requests alone do not grant access to videos, quizzes or private course files.
create table public.risa_enrolment_requests (
  course_id uuid not null references public.risa_courses(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  primary key (course_id, student_id)
);

create index risa_enrolment_requests_pending_index
on public.risa_enrolment_requests(status, created_at)
where status = 'pending';

alter table public.risa_enrolment_requests enable row level security;
revoke all on public.risa_enrolment_requests from public, anon, authenticated;
grant select, insert, update on public.risa_enrolment_requests to authenticated;

create policy "Learners read own course requests"
on public.risa_enrolment_requests for select to authenticated
using (student_id = (select auth.uid()));

create policy "Learners submit own enrolment requests"
on public.risa_enrolment_requests for insert to authenticated
with check (
  student_id = (select auth.uid())
  and status = 'pending'
  and reviewed_at is null
  and exists (
    select 1 from public.risa_courses c
    where c.id = course_id and c.is_published
  )
  and not exists (
    select 1 from public.risa_enrollments e
    where e.student_id = (select auth.uid())
      and e.course_id = course_id
      and e.status in ('active', 'completed')
  )
);

create policy "RISA admins read enrolment requests"
on public.risa_enrolment_requests for select to authenticated
using (
  exists (
    select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  )
);

create policy "RISA admins review enrolment requests"
on public.risa_enrolment_requests for update to authenticated
using (
  exists (
    select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.risa_user_roles r
    where r.user_id = (select auth.uid()) and r.role = 'admin'
  )
);
notify pgrst, 'reload schema';
