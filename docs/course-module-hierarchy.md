# Course and module hierarchy

RISA courses are parent disciplines, such as Computer Science. Coded teaching
units, such as CS101, are modules.

The live database migration creates `risa_programmes` as the parent course
table and links each existing module through `risa_courses.programme_slug`.
The legacy `risa_courses` table name is retained so that all existing module
IDs, topic relations, enrolment requests, assessments and lesson progress
continue working without changing their foreign keys.

The student catalogue links to individual course pages that list modules in
code order. The admin interface creates parent courses separately and requires
a parent when creating a new module. The dashboard distinguishes course and
module counts.

Existing module-level access and enrolment approvals are intentionally
unchanged. Course-wide enrolment, explicit section and lesson entities,
bulk syllabus import, course-level thumbnails and arbitrary teaching order
are separate future changes. Programme publication controls catalogue
visibility; existing module policies remain the authorization boundary.

The migration was applied to the live database before the application update
so the previous app continues to work during rollout. The 18 previously
inserted curriculum-preview rows are existing production data; the migration
links them without recreating them. New empty databases need separate module
seed data if the curriculum is to appear there.

Verified in production: four published parent courses, 19 published modules
readable by anonymous and authenticated roles; PHY101 retains its topic,
enrolment and two requests. No student data was deleted.

Application regression tests are in the existing GitHub Actions quality gate.
