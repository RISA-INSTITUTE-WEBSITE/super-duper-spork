-- Public RISA course catalogue with administrator-owned thumbnail uploads.
-- Only published courses are visible to the anonymous homepage.
alter table public.risa_courses
  add column if not exists level text not null default '1st Year Level',
  add column if not exists thumbnail_path text;

alter table public.risa_courses
  add constraint risa_courses_level_length
  check (char_length(trim(level)) between 3 and 50),
  add constraint risa_courses_thumbnail_path_format
  check (
    thumbnail_path is null
    or thumbnail_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
  );

grant select on public.risa_courses to anon;

create policy "Public can browse published RISA courses"
  on public.risa_courses for select to anon
  using (is_published = true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'risa-course-thumbnails', 'risa-course-thumbnails', true,
  2097152, array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
  set public = true, file_size_limit = 2097152,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "RISA administrators upload course thumbnails"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'risa-course-thumbnails'
    and exists (
      select 1 from public.risa_user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'admin'
    )
  );

create policy "RISA administrators delete course thumbnails"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'risa-course-thumbnails'
    and exists (
      select 1 from public.risa_user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'admin'
    )
  );
