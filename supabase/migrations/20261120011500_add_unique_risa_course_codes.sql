-- Applied to the RISA Supabase project in migration "add_unique_risa_course_codes".
-- Enforce institutional codes at the database layer in addition to form validation.
alter table public.risa_courses
  add column code text not null unique
    check (code ~ '^[A-Z0-9]{3,16}(-[A-Z0-9]{2,8})?$');

comment on column public.risa_courses.code is
  'Unique uppercase institutional code such as DVE101, 4CPS232 or PHY-101.';

notify pgrst, 'reload schema';
