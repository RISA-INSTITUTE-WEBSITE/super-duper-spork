# RISA student accounts — activation checklist

## Status

**Implemented but disabled.** RISA has responsive registration, sign-in and
student dashboard pages. Production signup is disabled until RISA has a dedicated
Supabase Auth project and the institution approves privacy and operational
requirements. Do not reuse the unrelated Beacon Innovation Hub project.

This creates login identities only; it does not admit students, collect
payment, enrol users in programmes, or grant administrative privileges.

## Required RISA Supabase setup

1. Create a dedicated RISA Supabase project with an approved organization and
   data region. Enable Email authentication with required email verification.
2. Set Supabase Auth Site URL to the RISA production domain, and explicitly
   configure any approved test redirect URLs.
3. In Auth > Email Templates > Confirm signup, use a verification link that
   supplies the one-time hash to the RISA server:

       <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
         Confirm your RISA email address
       </a>

4. Use a production SMTP service with appropriate RISA sender identity. Review
   Supabase's rate limits, password policy and CAPTCHA or anti-bot controls.
5. In Vercel, set these server-only environment values:

       RISA_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
       RISA_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
       RISA_STUDENT_AUTH_ENABLED=false

   Never put a database password, service-role key or sb_secret key in public
   environment variables or the Git repository. The publishable key is a
   restricted public-project credential, NOT an admin credential.

6. Review the draft student privacy notice and POPIA obligations before launch:
   lawful basis, vendor arrangement, hosting/data transfers, retention,
   correction/deletion requests, and guardian-consent handling if any students
   are minors.
7. After manual end-to-end verification on a RISA test project, set
   RISA_STUDENT_AUTH_ENABLED=true and deploy. Any other value, including an
   unset flag, keeps registration and sign-in disabled.

## Functionality

- Signup collects full name, email, password and password confirmation, with
  server-side validation and live password rule feedback.
- Passwords must have at least ten characters, a letter, a number and a
  special character; no plain-text password is persisted by the website.
- The registration action uses Supabase Auth's HTTPS signup endpoint.
- Confirmation is verified by the RISA server and redirects to a fixed
  same-origin dashboard route.
- Login and logout actions use HttpOnly, SameSite=Lax session cookies, with
  Secure set on production and refresh-token rotation via Next.js proxy.
- Protected student dashboard checks the signed-in user against the Auth
  service instead of trusting cookie payloads or editable user metadata.
- No student profile tables or role policies are added at this stage.

## Release verification

- npm ci
- npm run check
- npm run test:e2e
- Validate actual signup, delivery, verification, sign-in, refresh and logout
  with a dedicated test project and approved domain.
- Confirm direct unauthenticated dashboard access redirects to sign-in.
- Test expired/invalid verification links, duplicate signup, throttling and
  mobile keyboard accessibility.
- Confirm GitHub CI and Vercel deployment statuses before activation.

Student sign-up must not be enabled based on a successful build alone. Review
privacy, abuse prevention, email delivery and release readiness independently.
