# Course content authoring: topics, YouTube videos and quizzes

## Administration workflow

Sign in with a **verified RISA administrator account**, open
`/admin/courses`, then choose **Manage topics, videos & quizzes** on the
course you want to edit.

1. **Create a topic.** Supply a title and optional learning summary. The
   topic is attached to that course's UUID; other courses are unaffected.
2. **Embed a YouTube lesson.** Enter a descriptive title and paste a valid
   `youtube.com/watch`, `youtube.com/shorts`, `youtube.com/live`,
   `youtube.com/embed`, or `youtu.be` link (or the exact video ID).
   RISA stores **only the 11-character ID**, not arbitrary HTML or a URL.
3. **Create a quiz.** Add a title and optional instructions under the topic.
4. **Add questions.** For each question, enter the question text, four
   distinct answer choices (A–D) and select the correct choice. Repeat for
   as many questions as the quiz requires.

Topics, lessons and quizzes have a **Visible** checkbox, checked by default.
They are shown to learners only if all of the following are true: the course
is published, the learner is enrolled in the course, the topic is published,
and the lesson or quiz is published.

The Administration Centre uses RISA's existing Crystal Glass styling.
Course creation, enrolment status and private file access remain unchanged.

## Learner experience

Under **My Learning → Courses you're enrolled in**, learners can select
**Open lessons and quizzes**. The first course screen now follows the
Edu-ca-te topic-card pattern: a responsive **grid of topic cards**, each
showing the official YouTube thumbnail of the **first published video**,
real lesson count, optional quiz count, title and description. No fictitious
progress data is displayed; topics without a video get a neutral illustration.

Selecting a topic opens `/students/courses/<course-id>/topics/<topic-id>`.
Its embedded YouTube player stays **on the RISA website** with a selectable
video thumbnail playlist and next/previous controls, followed by the topic's
practice quizzes. Video selection updates the embedded player without
redirecting learners to YouTube.

The same embedded preview replaces outbound YouTube links in the **admin
topic editor**, so staff can review lessons without leaving RISA.

For privacy, embeds use `https://www.youtube-nocookie.com/embed/` and the
Content Security Policy allows only that iframe origin. YouTube topic covers
use `https://img.youtube.com/vi/<video-id>/hqdefault.jpg`, with a fallback
when an image is missing. Playback still depends on the YouTube owner's embed
permissions and third-party network availability; embedded playback cannot
override restrictions set by the content owner.

**Quiz scope in this release:** Learners can select and review their answers
locally, but answers are **not submitted, graded, or stored**. The answer
key is invisible to students and stored in a separate RLS-protected table.
Assessment submissions, grades, attempts, due dates, editing, ordering and
full content deletion are not part of this release.

## Database

The applied migrations create:

- `public.risa_course_topics`
- `public.risa_topic_videos`
- `public.risa_topic_quizzes`
- `public.risa_quiz_questions`
- `public.risa_quiz_answer_keys`

The latter table stores the correct-option index and has an **administrator-
only SELECT policy**. Students can read only published course content for
courses in which they have active/completed enrolment.

The `risa_add_quiz_question` database function uses `SECURITY INVOKER`,
not `SECURITY DEFINER`. It creates the question and answer key within
one transaction and is protected by administrator INSERT policies.

The follow-up migration `fix_risa_topic_enrolment_rls` explicitly qualifies
the **topic's own course_id**, closing a potential cross-course policy
ambiguity. Both migrations are applied to the connected RISA Supabase
project, committed to GitHub and protected by RLS. No example content
or fabricated quiz submissions are inserted into production.

## Limits / next steps

- Individual topics, videos, quizzes and questions can be **created** but not
  yet modified, reordered or removed through the browser.
- Admins should preview each YouTube link to ensure its owner allows embedding;
  private/deleted/age-restricted videos may refuse playback.
- Quiz correctness and learner grades are not exposed or calculated on the
  client. A later assessed-quiz feature will need secure submission,
  grading and attempt controls.
- RISA staff assign learners to courses separately through the existing
  Supabase administration workflow.
- Run browser tests using two separate accounts, one administrator and
  one enrolled learner. An automated build is not a substitute for an
  authenticated end-to-end test with real enrolments.

The Supabase security advisor still flags **leaked-password protection
disabled**. Enable it before broad learner access.
