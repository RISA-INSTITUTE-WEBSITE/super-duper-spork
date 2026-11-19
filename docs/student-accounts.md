# RISA student accounts — Supabase activation guide

## Current configuration

RISA student registration is implemented on the Next.js website. RISA has a
dedicated Supabase project outside Beacon Innovation Hub. **The requested
temporary mode allows email-and-password registration without sending an
email confirmation.** It is not passwordless login or admission to a
programme.

| Setting               | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| Supabase organization | RISA Institute of Applied Sciences                            |
| Organization ID       | `vvhpskswrwuexeuatqoq`                                        |
| Project ID            | `zaruopeqlndkxltqlpeh`                                        |
| Project URL           | `https://zaruopeqlndkxltqlpeh.supabase.co`                    |
| Website               | `https://super-duper-spork-iota.vercel.app`                   |
| Database region       | `eu-west-1` (Ireland)                                         |
| Hosting plan          | Supabase Free                                                 |
| Student data          | Supabase Auth identities; no additional public profile tables |

## Enable immediate registration without confirmation emails

**Supabase requires an explicit dashboard setting.** The GitHub code cannot
override a project with confirmation emails enabled. The current connected
Supabase tools cannot modify Auth provider configuration, so a project
administrator must do the following in the Supabase Dashboard.

1. Open [Authentication → Providers → Email](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/providers).
   Keep **Email** authentication and email/password signups enabled.
   Turn **Confirm email** **OFF** and save. This auto-confirms new addresses
   for Supabase Auth; it **does not prove ownership of the email inbox**.
   Leave Custom SMTP disabled for this temporary mode.
2. Verify [Authentication → URL Configuration](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/url-configuration)
   has Site URL `https://super-duper-spork-iota.vercel.app`.
   No confirmation email template is used for signups while **Confirm email**
   is off. The existing `/auth/confirm` endpoint remains available for a
   future verified-email rollout.
3. In Vercel, open the **RISA** hosting project → **Settings → Environment
   Variables**. Keep these **server-side-only** variables:

       RISA_SUPABASE_URL=https://zaruopeqlndkxltqlpeh.supabase.co
       RISA_SUPABASE_PUBLISHABLE_KEY=<RISA project's sb_publishable key>
       RISA_STUDENT_AUTH_ENABLED=true

   The flag controls whether sign-up and sign-in are enabled on a deployment.
   The user previously set it to `false`; a Vercel administrator must
   explicitly switch it to `true` for the chosen environment and redeploy.
   If the variable is not exactly `true`, both actions remain disabled.
   **Do not use service-role or sb_secret keys.** Do not commit credentials.

4. Before enabling the **Production** environment, complete the checks below
   and ensure the draft [privacy notice](/students/privacy) is approved for
   POPIA and any relevant guardian/minor consent requirements.

The connected tools can check GitHub, Supabase database security and project
health, but **cannot read or change Vercel environment variables, or the
Supabase Auth Email provider toggles**. Do not claim the production switch is
complete until it is checked by an administrator.

## What students will experience

1. Navigate to `/students/register`.
2. Enter name, email and a password with 10 or more characters, at least one
   letter, one number and one special character. Accept the privacy notice.
3. Supabase creates an Auth identity. When its **Confirm email** toggle is
   OFF, Auth returns an access/refresh session immediately. RISA verifies the
   session against `/auth/v1/user`, saves HttpOnly SameSite=Lax cookies
   (Secure in production) and redirects to `/students/dashboard`.
4. Students can sign out and sign in again at `/students/login`.
   Their account is **not** an application, programme enrolment, academic
   identity verification or admin privilege.
5. If confirmations are later enabled, the same code falls back to the
   `?status=check-email` flow and the existing token-hash verification route.

## Security trade-offs and tests

**An unverified address can be mistyped, invented or belong to another
person.** Do not grant enrolment, sensitive data access or financial
capabilities solely because an Auth identity exists. A user might register
someone else's address first. Password recovery still needs working email
delivery, so without SMTP or the default email service, recovery may not be
available to ordinary learners.

- Enable CAPTCHA or equivalent anti-bot controls and review Supabase Auth
  rate limits before opening unrestricted public signups.
- Confirm that the account privacy notice, data retention/deletion procedures,
  POPIA responsibilities and rules for minors are approved.
- Test registration with a controlled test identity using the chosen
  deployment; verify immediate dashboard redirect, logout, login,
  password-strength validation, session expiry and inaccessible dashboard
  without a session.
- Check [Authentication → Users](https://supabase.com/dashboard/project/zaruopeqlndkxltqlpeh/auth/users)
  for the new test account. Do not insert users directly into `auth.users`.
- Run `npm ci`, `npm run check` and `npm run test:e2e`.
- Ensure required GitHub CI checks, including OWASP ZAP dynamic scans, pass.
  Previous baseline runs had a failed DAST step; do not bypass security checks.
- Confirm Vercel's deployment was created from the intended GitHub main
  commit and that the production environment really has the enabled flag.

## Restoring email verification

Before public student data or enrolment capabilities are introduced, configure
a production SMTP service, turn Supabase **Confirm email** back ON and verify
the email-confirmation and password-reset flows.

If custom email templates are available, the server-side RISA callback is:

    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
      Confirm your RISA email address
    </a>

A Supabase default confirmation template can verify addresses via Supabase's
own endpoint, but may return to the Site URL without creating RISA's
server-side session; in that case students sign in manually.

## Database security

The `restrict_public_rls_event_trigger_execution` migration revoked
public/anonymous/authenticated direct execution of the privileged
`public.rls_auto_enable()` maintenance function. The Supabase security
advisor subsequently returned no findings. No public student tables or
role-authorization policies were introduced. User-editable Auth metadata
contains only display information and must not be trusted for authorization.
