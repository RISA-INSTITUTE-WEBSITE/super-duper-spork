# Practical Workspace and Lecturer Management

## Workspace

Open Labs → Practical Workspace. Four starter exercises implement a restricted
arithmetic programming editor, fictional Linux terminal, read-only SQL query
simulation and physics arithmetic. The existing interactive Physics Lab remains
available. No arbitrary code, shell commands, database connections, external
network access or real filesystem operations are executed.

Registered enrolled learners can copy their work, output and explanation into
My practical submissions, select their module and activity, and submit evidence.
The workspace state is session-local; submissions and reviews are persistent.
The submission is self-reported practice evidence, not automatically verified
execution or a formal grade.

## Lecturer access

Admin → Lecturer management: enter an existing Supabase Auth user UUID and select
a module. Assignment grants access to that module's enrolment count and practical
submissions only. Revoke an assignment to remove the access immediately.
Lecturer dashboard: select an assigned module, review evidence, enter a practice
score out of 100 and written feedback. Students can read their own submissions
and feedback. No lecturer can grade their own submission or edit student evidence.
Admins can review any module, but cannot grade their own submissions.

No global lecturer role, course authoring privilege, user directory, official
gradebook, roster by name, or formal assessment is introduced. The administrator
role registry remains unchanged. Current lists are bounded to the latest 100
submissions and 200 assignments; pagination is a follow-up.

## Verification

Database rollback probes confirmed student self-promotion is denied, unenrolled
submission is denied, students cannot mark themselves, out-of-scope lecturers
cannot read or mark, assigned lecturers can review but cannot edit evidence, and
revocation removes access. Anonymous grants are absent and RLS is enabled on both
new tables. Test records were rolled back. Supabase advisors report the existing
leaked-password protection warning, with no new security lint.
