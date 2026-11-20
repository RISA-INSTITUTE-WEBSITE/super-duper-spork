-- The topic/video preview policies look up published courses as authenticated users.
-- The public catalogue's existing SELECT policy was only granted to 'anon'.
create policy "Registered learners can see published RISA courses"
on public.risa_courses for select to authenticated
using (is_published = true);
notify pgrst, 'reload schema';