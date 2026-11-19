# RISA student accounts — Supabase activation checklist

## Current backend (verified 19 November 2026)

RISA has its **own dedicated Supabase organization** and an existing project
chosen for student authentication. Do **not** create or connect resources under
Beacon Innovation Hub.

- Organization: **RISA Institute of Applied Sciences**
- Organization ID: `vvhpskswrwuexeuatqoq`
- Project name in Supabase: `learnxul-lang's Project` (can be renamed in Supabase settings)
- Project ID: `zaruopeqlndkxltqlpeh`
- Region: `eu-west-1` (Ireland)
- Project URL: `https://zaruopeqlndkxltqlpeh.supabase.co`
- Plan: Free
- Database: active; no public user-profile tables required for initial email/password Auth

The current RISA website already includes responsive registration, sign-in,
email confirmation, private student dashboard and logout routes. The website
is deployed, **but these forms must remain disabled** until email verification,
privacy readiness, security controls and end-to-end tests have been confirmed.
Account creation does not mean programme admission or enrolment.

## Configure the existing Supabase project

1. Open the [RISA Supabase Authentication settings](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/providers)
   and enable **Email** sign-in. Require email confirmation.
2. In [Authentication URL configuration](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/url-configuration),
   set **Site URL** to the actual, approved RISA deployment origin (HTTPS).
   Do not guess the domain. If preview testing is intended, explicitly list
   the allowed HTTPS preview redirect origin(s).
3. In [Email Templates](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/templates),
   configure the confirmation email using a one-time token hash to the
   existing server-side endpoint:

       <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
         Confirm your RISA email address
       </a>

   Ensure `SiteURL` is the same approved website origin. Test delivery to
   a controlled account before enabling broad registration.
4. Before public use, configure and validate a production SMTP sender,
   anti-abuse/rate-limiting protection and an appropriate email confirmation
   expiry policy. The built-in email service can have restrictive limits.
5. Review the student privacy notice, POPIA compliance, hosting region,
   cross-border transfers, retention/deletion processes and minors/guardian
   consent as applicable.

## Connect the Next.js site to RISA Supabase on Vercel

In the **Vercel project currently hosting the RISA website**, open
**Settings → Environment Variables** and add:

    RISA_SUPABASE_URL=https://zaruopeqlndkxltqlpeh.supabase.co
    RISA_SUPABASE_PUBLISHABLE_KEY=<copy the sb_publishable key from the RISA project>
    RISA_STUDENT_AUTH_ENABLED=false

The publishable key is available at
[Supabase API Keys](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/settings/api-keys).
It is safe to use the publishable key **as an API identifier**, but keep the
value in Vercel configuration rather than committing it to the repository.
Never use a secret key, service-role key or database password. **These are
server-side-only variables**; no `NEXT_PUBLIC_` prefix is needed.

Add the variables to the right Vercel environments (preview and/or production),
then redeploy so the server receives them. Keep the flag set to `false`
until all operational and security checks have passed. Flipping it to
`true` intentionally opens registration and sign-in on that deployment.

There is no Vercel connection available to this assistant at the moment,
so environment values are **not yet verified or installed**.

## Verification before activation

- Run `npm ci`, `npm run check` and `npm run test:e2e`.
- Confirm email provider, site URL and confirmation template are correct.
- Test with a controlled student email: register, receive confirmation,
  verify once, sign in, access private dashboard, refresh session and log out.
- Test invalid credentials, expired confirmation, duplicate registrations,
  password strength, throttling and mobile accessibility.
- Ensure unauthenticated requests to `/students/dashboard` redirect to login.
- Review current GitHub required checks, including the OWASP ZAP DAST scan.
  Earlier runs had failed the ZAP gate, so do not assume final CI approval.
- Review pending dependency and licence audit exceptions before public release.

## Database security

A Supabase security advisor warning identified `public.rls_auto_enable()`
(an event-trigger maintenance function) as executable by `anon` and
`authenticated` roles. The migration
`restrict_public_rls_event_trigger_execution` revoked those direct
execution grants while retaining the internal service-role privilege.
A subsequent advisor scan returned no findings. Recheck after future
schema changes.

No new public student tables or role authorization policies have been
created. RISA uses Supabase Auth for identity. User-editable Auth metadata
contains a display name only and must never be used to determine privileged
access.
