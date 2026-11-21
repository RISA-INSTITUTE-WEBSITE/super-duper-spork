-- Per-learner lesson completion records. The composite primary key prevents
-- duplicate counts; deleting a video or user cascades to its progress rows.
-- Supabase Data API uses the authenticated learner's JWT (never a service key).
create table public.risa_lesson_completions (
  student_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.risa_topic_videos(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (student_id, video_id)
);

create index risa_lesson_completions_video_index
  on public.risa_lesson_completions(video_id);

alter table public.risa_lesson_completions enable row level security;

revoke all on public.risa_lesson_completions from public, anon, authenticated;
grant select, delete on public.risa_lesson_completions to authenticated;
-- Timestamp is database-generated, not supplied by the learner.
grant insert (student_id, video_id) on public.risa_lesson_completions to authenticated;

create policy "Learners read own completed lessons"
on public.risa_lesson_completions
for select to authenticated
using (student_id = (select auth.uid()));

create policy "Enrolled learners complete their published lessons"
on public.risa_lesson_completions
for insert to authenticated
with check (
  student_id = (select auth.uid())
  and exists (
    select 1
    from public.risa_topic_videos v
    join public.risa_course_topics t on t.id = v.topic_id
    join public.risa_courses c on c.id = t.course_id
    join public.risa_enrollments e on e.course_id = c.id
    where v.id = public.risa_lesson_completions.video_id
      and v.is_published
      and t.is_published
      and c.is_published
      and e.student_id = (select auth.uid())
      and e.status in ('active', 'completed')
  )
);

-- A learner can undo only their own completion. No UPDATE permission exists.
create policy "Learners undo own completed lessons"
on public.risa_lesson_completions
for delete to authenticated
using (student_id = (select auth.uid()));

notify pgrst, 'reload schema';
