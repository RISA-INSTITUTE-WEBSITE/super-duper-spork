# RISA Study Notes Studio

RISA adopts the Edu-ca-te manual Markdown authoring workflow with a shared
preview and reader, GFM Markdown, KaTeX (dollar and bracket notation),
learning-outcome checklists, diagrams, headings and scrollable tables.
The same reading CSS uses 12pt Arial, 24/20/16/14/13/12pt headings,
grey table headers and white body cells.

## Authoring

Open Admin → Courses → the module → Manage module topics → Study Notes Studio
on the desired topic. Paste or write Markdown, enter a title, preview it and
save a draft or Save & Publish. Edit or delete existing notes from the Studio.
Images can be inserted at the cursor, pasted or dropped; static diagrams
are compressed below 220 KB and stored independently. Alt text can be edited
in Markdown. Removing an image reference does not automatically delete its
stored asset.

## Learner access

Published topic notes appear as a Study notes link only where notes exist.
Only an enrolled learner may read the notes. Images require the same
authorization and must be referenced in a published note in the topic.
Checklist progress is browser-local, scoped to user, note and revision.
It is not a formal assessment result.

RISA uses Supabase rather than Firestore. Existing student enrolment,
authorization and protected content rules are retained. Edu-ca-te's
anonymous 75% SEO preview is not enabled for RISA's private study material.
School-specific SALM and DNA models are not copied into RISA. The
Markdown reader does not execute code, raw HTML, or untrusted external
image URLs. Only RISA's authenticated image endpoint is supported.

## Verification

Unit tests cover note validation, delimiter conversion, checklist keys,
scoped reads/writes and raster validation. The original CI quality gate
remains unchanged. The SQL migrations create separate RLS-protected tables.
