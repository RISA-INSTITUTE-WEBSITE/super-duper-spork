import { requestStudentBackend } from "./student-auth-api";
import { uuidPattern } from "./risa-course-curriculum";

function validProgressSelection(
  token: string,
  studentId: string,
  videoIds: readonly string[],
): boolean {
  return (
    Boolean(token) &&
    uuidPattern.test(studentId) &&
    videoIds.length <= 200 &&
    videoIds.every((id) => uuidPattern.test(id))
  );
}

function parseVideoRows(rows: unknown, videoIds: readonly string[]): string[] | null {
  if (!Array.isArray(rows)) {
    return null;
  }
  const completed: string[] = [];
  for (const row of rows) {
    if (
      !row ||
      typeof row !== "object" ||
      typeof row.video_id !== "string" ||
      !videoIds.includes(row.video_id)
    ) {
      return null;
    }
    completed.push(row.video_id);
  }
  return [...new Set(completed)];
}

/**
 * Saved lesson completion IDs belong to a verified learner and an approved
 * course curriculum. The database's SELECT RLS independently checks ownership.
 * null means progress could not be loaded, not "zero lessons completed".
 */
export async function getLearnerLessonCompletions(
  token: string,
  studentId: string,
  videoIds: readonly string[],
): Promise<string[] | null> {
  if (!validProgressSelection(token, studentId, videoIds)) {
    return null;
  }
  if (!videoIds.length) {
    return [];
  }

  const path =
    "/rest/v1/risa_lesson_completions?select=video_id" +
    "&student_id=eq." +
    studentId +
    "&video_id=in.(" +
    videoIds.join(",") +
    ")&limit=200";
  const response = await requestStudentBackend(token, path);
  if (!response?.ok) {
    return null;
  }
  try {
    return parseVideoRows(await response.json(), videoIds);
  } catch {
    return null;
  }
}

/**
 * Repeated "complete" requests are idempotent because of the composite PK and
 * ignore-duplicates. Unmarking removes only the current learner's row. RLS
 * blocks writes for unpublished, unenrolled or other learners' videos.
 */
export async function saveLearnerLessonCompletion(
  token: string,
  selection: { studentId: string; videoId: string; completed: boolean },
): Promise<boolean> {
  const { studentId, videoId, completed } = selection;
  if (!token || !uuidPattern.test(studentId) || !uuidPattern.test(videoId)) {
    return false;
  }

  const path = "/rest/v1/risa_lesson_completions";
  const response = completed
    ? await requestStudentBackend(token, path + "?on_conflict=student_id,video_id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({ student_id: studentId, video_id: videoId }),
      })
    : await requestStudentBackend(
        token,
        path + "?student_id=eq." + studentId + "&video_id=eq." + videoId,
        {
          method: "DELETE",
          headers: { Prefer: "return=minimal" },
        },
      );

  return response?.ok === true;
}
