-- Bind the applicant's selected course explicitly in the correlated enrolment check.
drop policy "Learners submit own enrolment requests"
on public.risa_enrolment_requests;

create policy "Learners submit own enrolment requests"
on public.risa_enrolment_requests for insert to authenticated
with check (
  student_id = (select auth.uid())
  and status = 'pending'
  and reviewed_at is null
  and exists (
    select 1 from public.risa_courses c
    where c.id = public.risa_enrolment_requests.course_id
      and c.is_published
  )
  and not exists (
    select 1 from public.risa_enrollments e
    where e.student_id = (select auth.uid())
      and e.course_id = public.risa_enrolment_requests.course_id
      and e.status in ('active', 'completed')
  )
);
notify pgrst, 'reload schema';