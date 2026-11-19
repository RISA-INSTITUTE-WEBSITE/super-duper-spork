-- Authenticated RISA course authoring: topics, YouTube lessons and quizzes.
-- Correct answers are in a separate admin-only table; learners cannot retrieve them.
create table public.risa_course_topics (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.risa_courses(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 140),
  description text not null default '' check (char_length(description)<=1500),
  sort_order integer not null default 1 check (sort_order between 1 and 9999),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index risa_topics_course_order on public.risa_course_topics(course_id,sort_order,created_at);

create table public.risa_topic_videos (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.risa_course_topics(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  sort_order integer not null default 1 check (sort_order between 1 and 9999),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index risa_videos_topic_order on public.risa_topic_videos(topic_id,sort_order,created_at);

create table public.risa_topic_quizzes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.risa_course_topics(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '' check (char_length(description)<=800),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index risa_quizzes_topic_order on public.risa_topic_quizzes(topic_id,created_at);

create table public.risa_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.risa_topic_quizzes(id) on delete cascade,
  prompt text not null check (char_length(prompt) between 5 and 500),
  choices jsonb not null check (
    jsonb_typeof(choices)='array' and jsonb_array_length(choices)=4
    and octet_length(choices::text)<=1600
  ),
  sort_order integer not null default 1 check (sort_order between 1 and 9999),
  created_at timestamptz not null default now()
);
create index risa_questions_quiz_order on public.risa_quiz_questions(quiz_id,sort_order,created_at);

create table public.risa_quiz_answer_keys (
  question_id uuid primary key references public.risa_quiz_questions(id) on delete cascade,
  correct_index integer not null check (correct_index between 0 and 3)
);

alter table public.risa_course_topics enable row level security;
revoke all on public.risa_course_topics from anon, authenticated;
grant select, insert, update, delete on public.risa_course_topics to authenticated;
create policy "Admin read risa_course_topics" on public.risa_course_topics
  for select to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin create risa_course_topics" on public.risa_course_topics
  for insert to authenticated with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin edit risa_course_topics" on public.risa_course_topics
  for update to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin')) with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin remove risa_course_topics" on public.risa_course_topics
  for delete to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Enrolled learners read risa_course_topics" on public.risa_course_topics
  for select to authenticated using (is_published and exists (
 select 1 from public.risa_enrollments e
 join public.risa_courses c on c.id=e.course_id
 where e.student_id=(select auth.uid()) and e.status in ('active','completed')
 and e.course_id=course_id and c.is_published
));

alter table public.risa_topic_videos enable row level security;
revoke all on public.risa_topic_videos from anon, authenticated;
grant select, insert, update, delete on public.risa_topic_videos to authenticated;
create policy "Admin read risa_topic_videos" on public.risa_topic_videos
  for select to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin create risa_topic_videos" on public.risa_topic_videos
  for insert to authenticated with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin edit risa_topic_videos" on public.risa_topic_videos
  for update to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin')) with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin remove risa_topic_videos" on public.risa_topic_videos
  for delete to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Enrolled learners read risa_topic_videos" on public.risa_topic_videos
  for select to authenticated using (is_published and exists (
 select 1 from public.risa_course_topics t
 where t.id=topic_id and t.is_published and exists (
 select 1 from public.risa_enrollments e
 join public.risa_courses c on c.id=e.course_id
 where e.student_id=(select auth.uid()) and e.status in ('active','completed')
 and e.course_id=t.course_id and c.is_published
)
));

alter table public.risa_topic_quizzes enable row level security;
revoke all on public.risa_topic_quizzes from anon, authenticated;
grant select, insert, update, delete on public.risa_topic_quizzes to authenticated;
create policy "Admin read risa_topic_quizzes" on public.risa_topic_quizzes
  for select to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin create risa_topic_quizzes" on public.risa_topic_quizzes
  for insert to authenticated with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin edit risa_topic_quizzes" on public.risa_topic_quizzes
  for update to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin')) with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin remove risa_topic_quizzes" on public.risa_topic_quizzes
  for delete to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Enrolled learners read risa_topic_quizzes" on public.risa_topic_quizzes
  for select to authenticated using (is_published and exists (
 select 1 from public.risa_course_topics t
 where t.id=topic_id and t.is_published and exists (
 select 1 from public.risa_enrollments e
 join public.risa_courses c on c.id=e.course_id
 where e.student_id=(select auth.uid()) and e.status in ('active','completed')
 and e.course_id=t.course_id and c.is_published
)
));

alter table public.risa_quiz_questions enable row level security;
revoke all on public.risa_quiz_questions from anon, authenticated;
grant select, insert, update, delete on public.risa_quiz_questions to authenticated;
create policy "Admin read risa_quiz_questions" on public.risa_quiz_questions
  for select to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin create risa_quiz_questions" on public.risa_quiz_questions
  for insert to authenticated with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin edit risa_quiz_questions" on public.risa_quiz_questions
  for update to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin')) with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin remove risa_quiz_questions" on public.risa_quiz_questions
  for delete to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Enrolled learners read risa_quiz_questions" on public.risa_quiz_questions
  for select to authenticated using (exists (
 select 1 from public.risa_topic_quizzes q
 join public.risa_course_topics t on t.id=q.topic_id
 where q.id=quiz_id and q.is_published and t.is_published
 and exists (
 select 1 from public.risa_enrollments e
 join public.risa_courses c on c.id=e.course_id
 where e.student_id=(select auth.uid()) and e.status in ('active','completed')
 and e.course_id=t.course_id and c.is_published
)
));

alter table public.risa_quiz_answer_keys enable row level security;
revoke all on public.risa_quiz_answer_keys from anon, authenticated;
grant select, insert, update, delete on public.risa_quiz_answer_keys to authenticated;
create policy "Admin read risa_quiz_answer_keys" on public.risa_quiz_answer_keys
  for select to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin create risa_quiz_answer_keys" on public.risa_quiz_answer_keys
  for insert to authenticated with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin edit risa_quiz_answer_keys" on public.risa_quiz_answer_keys
  for update to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin')) with check (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Admin remove risa_quiz_answer_keys" on public.risa_quiz_answer_keys
  for delete to authenticated using (exists (select 1 from public.risa_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));

-- Atomic question + private answer key creation, using caller's RLS role.
-- NOT security definer: admin-only table INSERT policies protect both statements.
create function public.risa_add_quiz_question(
  p_quiz_id uuid, p_prompt text, p_choices jsonb, p_correct_index integer
) returns uuid
language plpgsql security invoker
set search_path = ''
as $$
declare new_id uuid;
begin
  if p_correct_index not between 0 and 3
    or jsonb_typeof(p_choices) <> 'array'
    or jsonb_array_length(p_choices) <> 4
    or exists (
      select 1 from jsonb_array_elements(p_choices) as choice
      where jsonb_typeof(choice) <> 'string'
        or char_length(trim(choice #>> '{}')) < 1
        or char_length(trim(choice #>> '{}')) > 250
    )
  then
    raise exception 'Invalid multiple-choice question';
  end if;

  insert into public.risa_quiz_questions(quiz_id,prompt,choices)
  values (p_quiz_id,trim(p_prompt),p_choices)
  returning id into new_id;

  insert into public.risa_quiz_answer_keys(question_id,correct_index)
  values (new_id,p_correct_index);
  return new_id;
end
$$;
revoke all on function public.risa_add_quiz_question(uuid,text,jsonb,integer)
 from public, anon, authenticated;
grant execute on function public.risa_add_quiz_question(uuid,text,jsonb,integer)
 to authenticated;
notify pgrst, 'reload schema';
