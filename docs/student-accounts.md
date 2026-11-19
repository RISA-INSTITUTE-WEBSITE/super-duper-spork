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
- RISA website origin (owner-provided): `https://super-duper-spork-iota.vercel.app`
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
   set **Site URL** to the RISA deployment origin provided by the project owner:
   `https://super-duper-spork-iota.vercel.app`
   Add `https://super-duper-spork-iota.vercel.app/auth/confirm` to the
   allowed redirect URLs. If preview testing is intended, explicitly add
   only those approved HTTPS preview redirects. This website domain was
   supplied by the owner and has not been independently HTTP-verified.
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

## Controlled testing with Supabase's built-in email provider

The RISA project can use Supabase's default SMTP service **for development
only**, with no Custom SMTP credentials. As documented by Supabase, the default
sender is restricted to email addresses belonging to organization team
members, has strict rate limits, and is not suitable for public rollout.

1. In [RISA Authentication Providers](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/providers),
   enable email/password sign-in, keep **Confirm email** enabled and leave
   Custom SMTP disabled. These settings must be verified in the dashboard;
   the available connector does not expose Auth configuration controls.
2. In [URL Configuration](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/url-configuration),
   verify Site URL equals `https://super-duper-spork-iota.vercel.app`.
3. The unmodified **default** Supabase confirmation template normally sends
   a link through Supabase's own verification endpoint and then redirects to
   the configured Site URL. That is valid for confirming email, but it
   **does not** call the website's custom `/auth/confirm` handler or
   automatically create its HttpOnly login session. After clicking the
   default link, return to `/students/login` and sign in normally.
   If a custom email template is permitted, the token-hash link specified
   above instead invokes the RISA handler and establishes a session.
4. Choose a **single approved test address** belonging to a member of
   the RISA Supabase organization's team; do not email random learners.
5. Keep the **Production** Vercel variable `RISA_STUDENT_AUTH_ENABLED=false`.
   For a website smoke test, use either a **protected preview** deployment
   with `RISA_STUDENT_AUTH_ENABLED=true` set for Preview only, or a local
   development server with the three RISA variables configured. Verify
   Preview access control before enabling it; an unprotected preview is
   publicly accessible to anyone with its link, and even an email-only
   restriction on delivery does not prevent unwanted signup attempts.
6. On the test deployment, register using the approved address and a fresh
   password (10+ characters with a letter, number, special character).
   Check for the confirmation email, open the link once, sign in at
   `/students/login`, verify dashboard protection and sign out.
   Check [Auth Users](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/users)
   for one test user whose email is confirmed. Do not use an admin key
   or insert records directly into `auth.users`.
7. Disable test-only Preview access or reset the flag to `false` after
   testing. Do not enable production signup without approved privacy
   procedures, an appropriate email service and the full release review.

**Verification baseline (19 November 2026):** Supabase project healthy,
`auth.users` count = 0, security advisor has no findings. An earlier RISA
website CI run failed at the OWASP ZAP DAST step, so release approval
is still outstanding. The assistant cannot read Vercel environment-variable
values or modify Supabase Auth's provider settings through the connected
tools, and therefore has **not** enabled registration or sent a test email.

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
