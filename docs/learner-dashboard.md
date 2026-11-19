# RISA My Learning — enrolments, resources, exercises and profiles

## Overview

The **My Learning** dashboard now reads real learner enrolments and course materials
from the RISA Supabase project, using the currently authenticated student's JWT.
There are **no demo enrolments, fabricated completion percentages or example files**.

- **Courses you're enrolled in:** only the student's assigned, published courses.
- **Course content & exercises:** files that RISA staff have uploaded for those
  courses, with authenticated, download-only links.
- **Edit profile:** change the learner's display name and upload a profile
  photo (JPEG, PNG or WebP, up to 2 MB), securely stored in a private bucket.
- **Proposed learning pathways:** kept separate from actual enrolments.

## Project and data model

RISA project: `zaruopeqlndkxltqlpeh`.

| Table | Purpose | Student access |
| --- | --- | --- |
| `public.risa_courses` | Published course catalogue | SELECT only for enrolled students |
| `public.risa_enrollments` | Student-to-course membership and status | SELECT only own rows |
| `public.risa_course_materials` | Staff-uploaded files and exercises | SELECT only enrolled courses |

Supabase Storage has two **private** buckets:

- `risa-student-avatars`: photo in `<student-uuid>/avatar.png` (or
  `avatar.jpg` / `avatar.webp`), with owner-only read/write policies.
- `risa-course-content`: course files under `<course-uuid>/<filename>`,
  maximum 10 MB per file. Only enrolled students may read files referenced
  by a course material record; learners cannot publish course files.

All tables have RLS enabled. Learners have no INSERT/UPDATE/DELETE privileges
on course catalogue, enrolment or material tables.

## Publishing course content (authorized staff)

Until an administrative upload interface is reviewed and implemented,
**staff use the authenticated Supabase Dashboard/SQL Editor** to manage
publication and enrolment. Do not give learners service-role or secret keys.

1. In RISA's Supabase SQL Editor, insert a course with a unique slug,
   title, description and `is_published = true` once approved. Record the
   generated UUID from `RETURNING id`.
2. Identify the learner's UUID in **Authentication → Users**, not from a
   claimed email address or editable user metadata. Insert a matching row
   in `public.risa_enrollments` with `status='active'`.
3. Upload the approved file in **Storage → risa-course-content** under a
   folder named after that exact course UUID, e.g.
   `<course-uuid>/lesson-01.pdf` or `<course-uuid>/exercise-01.pdf`.
4. Create a `public.risa_course_materials` row containing the same
   `course_id`, a title, description, `kind='resource'` or
   `kind='exercise'`, and the exact `storage_path` from step 3.
5. Sign into a student test account and confirm the assigned course,
   materials list and download. Confirm another student cannot access
   that file or another learner's avatar.

**Course and file lists are empty until staff publish real content and
assign enrolments.** Do not manually insert rows into `auth.users`.

## Operations and security

- Keep `RISA_SUPABASE_URL` and `RISA_SUPABASE_PUBLISHABLE_KEY`
  configured as server-side Vercel environment variables.
- Profiles modify user-editable Supabase Auth metadata only for display;
  **never authorize an account from profile metadata**.
- Only the verified user can access their private profile photo.
- File download handlers recheck the Supabase session and apply RLS at both
  database and Storage levels.
- A RISA student account alone **does not** constitute course enrolment,
  admission or assessment eligibility.
- Review POPIA retention/erasure processes, guardian requirements for minors,
  virus scanning for uploaded course files, and relevant consent before
  scaling learner registrations.
- Supabase's security advisor currently notes **leaked-password protection
  disabled**; enable that safeguard in the Auth dashboard.
- Continue reviewing the GitHub OWASP ZAP warning gate; never treat an
  unfinished or failed scan as proof of security.
