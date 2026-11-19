# RISA Administrator Role — Provisioning and Access

RISA now supports two levels of access:

- **Learner (default):** Every registered, verified learner may use `My Learning`
  and access only their own enrolments, authorized course materials, and profile.
- **Administrator (explicit grant):** A verified account with an `admin` entry
  in `public.risa_user_roles` may access `/admin` and manage RISA course,
  enrolment, and exercise records.

The admin role is **not** granted by signup, learner profile metadata, email
address, client-side code, or editable JWT claims. Server access is checked
against the signed-in identity and current database role membership.

## Granting the first administrator

The table starts **empty**. RISA must explicitly choose which verified person
is trusted with administrator privileges.

1. Confirm the person's identity and institutional authorization outside the
   website. In **Supabase → Authentication → Users**, locate their account UUID.
2. As a trusted Supabase project maintainer, use the **SQL Editor** to run the
   following query after replacing the UUID placeholder (do **not** grant roles
   from a public registration or profile form):

```sql
insert into public.risa_user_roles (user_id, role)
select id, 'admin'
from auth.users
where id = 'REPLACE_WITH_VERIFIED_USER_UUID'::uuid
  and email_confirmed_at is not null
on conflict (user_id) do nothing;
```

3. Sign out and back into RISA. A verified admin will now land at
   `/admin`. Unauthorized learners receive a not-found response.
4. Confirm the admin can see actual course/enrolment/material counts, and that
   a normal learner **cannot** open `/admin` or modify course records.

You may check the result securely in SQL Editor with:

```sql
select user_id, role, granted_at
from public.risa_user_roles;
```

**Revoke** an administrator immediately in SQL Editor:

```sql
delete from public.risa_user_roles
where user_id = 'REPLACE_WITH_VERIFIED_USER_UUID'::uuid;
```

The next authorization request checks current database membership. Role removal
does not rely on a claim that remains cached until JWT refresh.

## Authorization and access rules

The applied Supabase migration `add_risa_administrator_role_and_course_permissions`
is tracked under `supabase/migrations`.

- `public.risa_user_roles` uses RLS. A signed-in account can read **only its own
  role**. Anonymous users cannot read role records.
- Browser and learner sessions cannot INSERT, UPDATE, or DELETE role records.
- Administrators have RLS-protected SELECT/INSERT/UPDATE/DELETE for
  `risa_courses`, `risa_enrollments`, and `risa_course_materials`.
- Admins can upload, read, update, and delete files in the
  **private** `risa-course-content` bucket. Learner access remains limited to
  the files referenced by their own enrolled, published courses.
- Avatar access remains private and **unchanged**; being an admin does not
  give read access to another person's avatar.
- The admin page checks a verified Supabase identity and live RLS role
  membership. No `service_role` secret is used on the website.
- Administrator role changes are performed only by trusted RISA maintainers in
  the Supabase project, not by administrators in a public-facing profile form.

## Administrator interface scope

The `/admin` page provides protected sign-in, role verification and
live counts for courses, enrolments, and materials.

### Create a course with its code

Select **Manage courses** from the Administration Centre or open `/admin/courses`.
The admin-only tool provides:

- **Unique course code**, such as `DVE101`, `4CPS232`, or `PHY-101`.
- **Course title** (required, 2–120 characters).
- **Course overview** (optional, up to 1,200 characters).
- **Publish now** checkbox (unchecked by default so a new course starts as draft).
- **Created courses** directory showing codes and publication status.

Codes are normalized to uppercase and checked for uniqueness at both the
application and the database levels. The generated URL slug is the lowercase
version of the course code, not the potentially changeable course title.
Only a live, verified administrator can submit the form. Supabase's role-based
row-level security separately verifies every INSERT using the student's access
token, so changing the browser form or submitting directly to the API never
grants extra access.

The `add_unique_risa_course_codes` migration has been applied to Supabase and
is represented by `supabase/migrations/20261120011500_add_unique_risa_course_codes.sql`.
No courses were automatically created or published.

**Student assignment, file upload, and exercise editing forms are still not
available inside the website**. Trusted staff can manage those via the existing
Supabase administration process until RISA adds separate admin interfaces.

For a production rollout, enable Supabase leaked-password protection,
require MFA for staff accounts, review least-privilege audit logging and
institutional data-handling obligations, and test both admin and learner
accounts. A successful deployment is not proof that account-role enforcement
has been end-to-end tested.
