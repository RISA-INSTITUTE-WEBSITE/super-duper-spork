-- Section grouping is metadata; existing topic publication and enrolment policies stay intact.
create table public.risa_module_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.risa_courses(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 140),
  sort_order integer not null default 1 check (sort_order between 1 and 9999),
  created_at timestamptz not null default now(),
  unique (id, course_id),
  unique (course_id, title)
);
create index risa_module_sections_order on public.risa_module_sections(course_id,sort_order,created_at);
alter table public.risa_module_sections enable row level security;
revoke all on public.risa_module_sections from anon, authenticated;
grant select, insert, update on public.risa_module_sections to authenticated;
create policy "Administrators manage module sections"
on public.risa_module_sections for all to authenticated
using (exists (select 1 from public.risa_user_roles r
 where r.user_id=(select auth.uid()) and r.role='admin'))
with check (exists (select 1 from public.risa_user_roles r
 where r.user_id=(select auth.uid()) and r.role='admin'));
create policy "Registered learners read published module outline"
on public.risa_module_sections for select to authenticated
using (exists (select 1 from public.risa_courses c
 where c.id=public.risa_module_sections.course_id and c.is_published));

alter table public.risa_course_topics add column section_id uuid;
alter table public.risa_course_topics add constraint risa_topic_section_same_module
 foreign key (section_id, course_id) references public.risa_module_sections(id,course_id)
 on delete restrict;
create index risa_topics_section_order on public.risa_course_topics(section_id,sort_order);

-- Draft curriculum outline titles transcribed from the Curricular repository.
insert into public.risa_module_sections(course_id, sort_order, title)
select c.id, s.sort_order, s.title
from (values
  ('CS101', 1, 'Section A — Computer Architecture'),
  ('CS101', 2, 'Section B — Data Representation'),
  ('CS101', 3, 'Section C — Integrated Applications and Practical Work'),
  ('CS102', 1, 'Section A — Python Fundamentals and Development Environment'),
  ('CS102', 2, 'Section B — Control Flow and Functions'),
  ('CS102', 3, 'Section C — Collections, Files and Integrated Practical Work'),
  ('CS201', 1, 'Section A — Data Structures and Complexity Foundations'),
  ('CS201', 2, 'Section B — Algorithmic Techniques'),
  ('CS201', 3, 'Section C — Selection, Analysis and Integrated Practical Work'),
  ('CS202', 1, 'Section A — Network Fundamentals and Layered Communication'),
  ('CS202', 2, 'Section B — Internet Protocols and Wireless Networking'),
  ('CS202', 3, 'Section C — Configuration, Troubleshooting and Practical Work'),
  ('CS221', 1, 'Section A — Data Modelling and Relational Design'),
  ('CS221', 2, 'Section B — SQL, Transactions and Indexing'),
  ('CS221', 3, 'Section C — Integrated Database Practical Project'),
  ('CS222', 1, 'Section A — OS Services, Processes and CPU Scheduling'),
  ('CS222', 2, 'Section B — Concurrency, Memory, Files and I/O'),
  ('CS222', 3, 'Section C — System Investigation and Practical Work'),
  ('CS301', 1, 'Section A — Lifecycle, Requirements and Design'),
  ('CS301', 2, 'Section B — Implementation Practices, Testing and Responsible Engineering'),
  ('CS301', 3, 'Section C — Team Project and Engineering Evidence'),
  ('CS302', 1, 'Section A — AI Foundations, Search and Knowledge Representation'),
  ('CS302', 2, 'Section B — Machine Learning and Neural Networks'),
  ('CS302', 3, 'Section C — Responsible AI and Integrated Practical Work'),
  ('DVE101', 1, 'Section A — Introduction to Linux for DevOps'),
  ('DVE101', 2, 'Section B — Linux System and Service Administration'),
  ('DVE101', 3, 'Section C — Linux Networking Fundamentals'),
  ('DVE101', 4, 'Section D — Bash Scripting'),
  ('DVE101', 5, 'Section E — Linux Automation and Operations'),
  ('DVE101', 6, 'Section F — Git and GitHub'),
  ('DVE101', 7, 'Section G — YAML Fundamentals'),
  ('DVE201', 1, 'Section A — CI/CD Architecture and GitHub Actions'),
  ('DVE201', 2, 'Section B — Docker Fundamentals'),
  ('DVE201', 3, 'Section C — Docker Networking, Storage and Compose'),
  ('DVE201', 4, 'Section D — Jenkins Pipeline Engineering'),
  ('DVE201', 5, 'Section E — Secure Delivery and Pipeline Operations'),
  ('DVE301', 1, 'Section A — Cloud Platform Concepts'),
  ('DVE301', 2, 'Section B — Cloud Networking, Identity and Security'),
  ('DVE301', 3, 'Section C — Terraform Infrastructure as Code'),
  ('DVE301', 4, 'Section D — Ansible Configuration Management'),
  ('DVE301', 5, 'Section E — Infrastructure Delivery and Recovery'),
  ('DVE401', 1, 'Section A — Kubernetes Architecture'),
  ('DVE401', 2, 'Section B — Workload Management'),
  ('DVE401', 3, 'Section C — Networking, Storage and Rollouts'),
  ('DVE401', 4, 'Section D — Monitoring and Observability'),
  ('DVE401', 5, 'Section E — Reliability, Security and Incident Response'),
  ('DVE501', 1, 'Section A — Requirements and Solution Architecture'),
  ('DVE501', 2, 'Section B — Infrastructure Engineering'),
  ('DVE501', 3, 'Section C — Automated Software Delivery'),
  ('DVE501', 4, 'Section D — Deployment and Platform Operations'),
  ('DVE501', 5, 'Section E — Reliability and Incident Management'),
  ('DVE501', 6, 'Section F — Final Technical Review'),
  ('COMS101', 1, 'Section A — Foundations'),
  ('COMS101', 2, 'Section B — Defensive Security Principles'),
  ('COMS101', 3, 'Section C — System and Threat Context'),
  ('COMS101', 4, 'Section D — Ethics and Professional Practice'),
  ('COMS101', 5, 'Section E — Risk Reporting'),
  ('COMS102', 1, 'Section A — Linux Lab Setup and Fundamentals'),
  ('COMS102', 2, 'Section B — Files, Permissions and Identity'),
  ('COMS102', 3, 'Section C — Processes and Services'),
  ('COMS102', 4, 'Section D — Linux Networking for Security'),
  ('COMS102', 5, 'Section E — Host Hygiene and Evidence'),
  ('COMS103', 1, 'Section A — Networking Review'),
  ('COMS103', 2, 'Section B — Engagement Rules and Lab Design'),
  ('COMS103', 3, 'Section C — Observation and Discovery'),
  ('COMS103', 4, 'Section D — Defense Validation'),
  ('COMS103', 5, 'Section E — Reporting and Retesting'),
  ('COMS104', 1, 'Section A — Identity and Trust'),
  ('COMS104', 2, 'Section B — Sources of Host Exposure'),
  ('COMS104', 3, 'Section C — Controlled Validation'),
  ('COMS104', 4, 'Section D — Detection and Mitigation'),
  ('COMS104', 5, 'Section E — Responsible Evidence'),
  ('COMS105', 1, 'Section A — Web Technology Foundations'),
  ('COMS105', 2, 'Section B — Responsible Web Testing'),
  ('COMS105', 3, 'Section C — Vulnerability Understanding'),
  ('COMS105', 4, 'Section D — Secure Remediation'),
  ('COMS105', 5, 'Section E — Verification and Reporting')
) as s(code,sort_order,title)
join public.risa_courses c on c.code=s.code;

-- Preserve every existing topic and its UUID, videos, notes and quizzes.
-- Unclassified legacy topics are grouped into General topics without inventing a syllabus.
insert into public.risa_module_sections(course_id,sort_order,title)
select distinct t.course_id, 9999, 'General topics'
from public.risa_course_topics t where t.section_id is null
on conflict (course_id,title) do nothing;
update public.risa_course_topics t set section_id=s.id
from public.risa_module_sections s where s.course_id=t.course_id
 and s.title='General topics' and t.section_id is null;
notify pgrst, 'reload schema';
