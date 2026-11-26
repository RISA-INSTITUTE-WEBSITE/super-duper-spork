import {
  getCourseCurriculum,
  getCoursePreviewCurriculum,
  uuidPattern,
} from "./risa-course-curriculum";
import { requestStudentBackend } from "./student-auth-api";

import type { ModuleSection } from "./risa-module-outline";

export { groupModuleTopics, type ModuleSection } from "./risa-module-outline";

function parseSection(value: unknown): ModuleSection | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Partial<ModuleSection>;
  if (
    typeof row.id !== "string" ||
    typeof row.course_id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.sort_order !== "number"
  ) {
    return null;
  }
  return { id: row.id, course_id: row.course_id, title: row.title, sort_order: row.sort_order };
}

export async function getModuleSections(
  token: string,
  courseId: string,
): Promise<ModuleSection[] | null> {
  if (!uuidPattern.test(courseId)) {
    return null;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_module_sections?select=id,course_id,title,sort_order&course_id=eq." +
      courseId + "&order=sort_order.asc,created_at.asc&limit=100",
  );
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) {
      return null;
    }
    return rows.flatMap((row) => {
      const section = parseSection(row);
      return section?.course_id === courseId ? [section] : [];
    });
  } catch {
    return null;
  }
}

export async function getStructuredCurriculum(
  token: string,
  courseId: string,
  drafts = false,
) {
  const [curriculum, sections] = await Promise.all([
    getCourseCurriculum(token, courseId, drafts),
    getModuleSections(token, courseId),
  ]);
  return curriculum && sections ? { ...curriculum, sections } : null;
}

export async function getStructuredPreview(token: string, courseId: string) {
  const [curriculum, sections] = await Promise.all([
    getCoursePreviewCurriculum(token, courseId),
    getModuleSections(token, courseId),
  ]);
  return curriculum && sections ? { ...curriculum, sections } : null;
}

export function validSectionOrder(order: number): boolean {
  return Number.isInteger(order) && order >= 1 && order <= 9999;
}

export async function createModuleSection(
  token: string,
  courseId: string,
  input: { title: string; order: number },
): Promise<boolean> {
  const title = input.title.trim();
  if (!uuidPattern.test(courseId) || title.length < 2 || title.length > 140 ||
      !validSectionOrder(input.order)) {
    return false;
  }
  const response = await requestStudentBackend(token, "/rest/v1/risa_module_sections", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ course_id: courseId, title, sort_order: input.order }),
  });
  return response?.ok === true;
}

export async function moveModuleTopic(
  token: string,
  courseId: string,
  input: { topicId: string; sectionId: string; order: number },
): Promise<boolean> {
  if (![courseId, input.topicId, input.sectionId].every((id) => uuidPattern.test(id)) ||
      !validSectionOrder(input.order)) {
    return false;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_course_topics?id=eq." + input.topicId + "&course_id=eq." + courseId,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ section_id: input.sectionId, sort_order: input.order }),
    },
  );
  if (!response?.ok) {
    return false;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows) && rows.length === 1;
  } catch {
    return false;
  }
}
