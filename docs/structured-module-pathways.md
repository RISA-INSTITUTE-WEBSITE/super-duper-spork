# Structured module pathways

RISA organises the curriculum as Course → Module → Section → Topic.
Existing topic video lessons and practice quizzes remain attached to their
original topic IDs. Study Notes Studio (PR #72) also uses the same topic IDs.

## Imported outline

Teaching section names and order come from the draft learning-outcomes
documents in the RISA Curricular repository:

- Computer Science: 8 modules, 24 sections.
- Cloud & DevOps: 5 modules, 28 sections.
- Ethical Hacking: 5 modules, 25 sections.
- Physics: PHY101, one General topics section preserving its existing topic.

These are curriculum outlines, not academic approval or published lesson
content. Empty sections are identified as planned.

## Administration and learner experience

Administrators can create a section with teaching order, create a topic in
a section, and move or reorder an existing topic. Learners see topics
grouped under section headings in both the registered preview and enrolled
module view. The preview continues to lock lesson access.

The composite foreign key prevents assigning a topic to a section in a
different module. RLS allows registered learners to read published module
outline metadata and restricts section creation and updates to administrators.
Existing topic, quiz, video, notes and enrolment policies are unchanged.

New topic authoring requires a section. Older topics without a section
remain accessible under General topics. No lesson content, formal assessment
or lab instructions have been invented or published by this migration.
The section grouping does not make the currently public Labs private.
Detailed section-specific lessons and topic-level lab assignments remain
future authoring work.
