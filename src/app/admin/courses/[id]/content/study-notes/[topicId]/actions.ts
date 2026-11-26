"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { uuidPattern } from "@/lib/risa-course-curriculum";
import { getStudentIdentity, requestStudentBackend } from "@/lib/student-auth-api";
import { insertStudyNoteImage } from "@/lib/risa-study-note-images";
import {
  removeStudyNote,
  saveStudyNote,
  type StudyNoteDraft,
} from "@/lib/risa-study-notes";
import { studentCookieNames } from "@/lib/student-session";

async function authorizedTopic(
  courseId: string,
  topicId: string,
): Promise<string | null> {
  if (!uuidPattern.test(courseId) || !uuidPattern.test(topicId)) {
    return null;
  }
  const token = await administratorToken();
  if (!token) {
    return null;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_course_topics?select=id&id=eq." +
      topicId +
      "&course_id=eq." +
      courseId,
  );
  if (!response?.ok) {
    return null;
  }
  const rows: unknown = await response.json();
  return Array.isArray(rows) && rows.length === 1 ? token : null;
}

function refresh(courseId: string, topicId: string) {
  revalidatePath("/admin/courses/" + courseId + "/content/study-notes/" + topicId);
  revalidatePath("/students/courses/" + courseId);
}

export async function saveStudyNoteAction(courseId: string, draft: StudyNoteDraft) {
  const token = await authorizedTopic(courseId, draft.topicId);
  const saved = token ? await saveStudyNote(token, draft) : false;
  if (saved) {
    refresh(courseId, draft.topicId);
  }
  return saved;
}

export async function deleteStudyNoteAction(
  courseId: string,
  topicId: string,
  noteId: string,
) {
  const token = await authorizedTopic(courseId, topicId);
  const removed = token ? await removeStudyNote(token, topicId, noteId) : false;
  if (removed) {
    refresh(courseId, topicId);
  }
  return removed;
}

export async function insertStudyNoteImageAction(
  courseId: string,
  topicId: string,
  image: { mime: string; data: string },
) {
  const token = await authorizedTopic(courseId, topicId);
  return token ? insertStudyNoteImage(token, topicId, image) : null;
}

async function administratorToken(): Promise<string | null> {
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    return null;
  }
  const identity = await getStudentIdentity(token);
  if (!identity || !(await isRisaAdministrator(token, identity.id))) {
    return null;
  }
  return token;
}
