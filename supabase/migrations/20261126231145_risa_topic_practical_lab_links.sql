-- Optional link to an existing public RISA laboratory, never an arbitrary URL.
alter table public.risa_course_topics add column practical_lab_slug text
  check (practical_lab_slug in ('computing', 'physics', 'devops', 'security'));
notify pgrst, 'reload schema';
