import type { CourseTopic } from "./risa-course-curriculum";

export type ModuleSection = {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
};

export type TopicGroup = { id: string; title: string; topics: CourseTopic[] };

export function groupModuleTopics(
  sections: ModuleSection[],
  topics: CourseTopic[],
): TopicGroup[] {
  const groups = [...sections]
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title))
    .map((section) => ({
      id: section.id,
      title: section.title,
      topics: topics.filter((topic) => topic.section_id === section.id),
    }));
  const assigned = new Set(groups.flatMap((group) => group.topics.map((topic) => topic.id)));
  const remaining = topics.filter((topic) => !assigned.has(topic.id));
  if (remaining.length) {
    groups.push({ id: "general", title: "General topics", topics: remaining });
  }
  return groups;
}

