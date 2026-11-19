-- Explicitly bind the topic policy to the outer topic's course.
-- Unqualified course_id inside the enrolment subquery would resolve to the
-- inner enrolment row, inadvertently allowing cross-course topic visibility.
drop policy "Enrolled learners read risa_course_topics" on public.risa_course_topics;

create policy "Enrolled learners read risa_course_topics"
on public.risa_course_topics
for select to authenticated
using (
  is_published
  and exists (
    select 1 from public.risa_enrollments e
    join public.risa_courses c on c.id=e.course_id
    where e.student_id=(select auth.uid())
      and e.status in ('active','completed')
      and e.course_id=public.risa_course_topics.course_id
      and c.is_published
  )
);
notify pgrst, 'reload schema';
