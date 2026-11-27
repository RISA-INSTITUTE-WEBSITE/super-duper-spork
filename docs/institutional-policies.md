# Institutional policies

Public route: `/policies`; individual policies use stable slugs.
Administrators open `/admin/policies` from the Administration Centre.

Create a draft with title, slug, category, version, optional effective date
and Markdown content. Change visibility to Published only after approval.
Editing a published record updates the live policy; saving as Draft
unpublishes it. Version is descriptive metadata, not revision history.

The database enforces published-only anonymous access and verified admin
membership for writes. Server actions also verify the administrator session.
Markdown skips raw HTML and images. No official policies have been seeded;
RISA supplies and approves its own content. PDF uploads and version history
are not included in this initial release.
