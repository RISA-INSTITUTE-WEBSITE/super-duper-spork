-- Note images use private rows and are visible only to an administrator or
-- an enrolled learner when referenced in a published note in the same topic.
create table public.risa_study_note_images (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.risa_course_topics(id) on delete cascade,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  image_data text not null check (char_length(image_data) between 4 and 300000),
  created_at timestamptz not null default now()
);
create index risa_study_note_images_topic_idx on public.risa_study_note_images(topic_id);
alter table public.risa_study_note_images enable row level security;
revoke all on public.risa_study_note_images from anon, authenticated;
grant select, insert on public.risa_study_note_images to authenticated;

create policy "Administrators manage study note images"
on public.risa_study_note_images for all to authenticated
using (exists (select 1 from public.risa_user_roles r
  where r.user_id = (select auth.uid()) and r.role = 'admin'))
with check (exists (select 1 from public.risa_user_roles r
  where r.user_id = (select auth.uid()) and r.role = 'admin'));

create policy "Enrolled students read referenced published note images"
on public.risa_study_note_images for select to authenticated
using (exists (
  select 1 from public.risa_study_notes n
  where n.topic_id = public.risa_study_note_images.topic_id
    and n.is_published
    and position('/students/study-note-images/' || public.risa_study_note_images.id::text in n.markdown) > 0
));

notify pgrst, 'reload schema';
