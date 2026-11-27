import { requestStudentBackend } from "./student-auth-api";
import { uuidPattern } from "./risa-course-curriculum";
import { isWorkspaceActivity, type WorkspaceActivity } from "./risa-workspace";

export type LecturerAssignment = { lecturer_id: string; course_id: string };
export type PracticalSubmission = {
  id: string;
  student_id: string;
  course_id: string;
  activity: WorkspaceActivity;
  evidence: string;
  created_at: string;
  score: number | null;
  feedback: string | null;
};

async function readRows<T>(response: Response | null): Promise<T[] | null> {
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows) ? (rows as T[]) : null;
  } catch {
    return null;
  }
}

export async function getLecturerAssignments(token: string, lecturerId?: string) {
  if (lecturerId && !uuidPattern.test(lecturerId)) {
    return null;
  }
  return readRows<LecturerAssignment>(
    await requestStudentBackend(
      token,
      "/rest/v1/risa_lecturer_assignments?select=lecturer_id,course_id&order=created_at.desc&limit=200" +
        (lecturerId ? "&lecturer_id=eq." + lecturerId : ""),
    ),
  );
}

export async function changeLecturerAssignment(
  token: string,
  assignment: LecturerAssignment,
  remove: boolean,
): Promise<boolean> {
  if (
    ![assignment.lecturer_id, assignment.course_id].every((id) => uuidPattern.test(id))
  ) {
    return false;
  }
  const filter = remove
    ? "?lecturer_id=eq." +
      assignment.lecturer_id +
      "&course_id=eq." +
      assignment.course_id
    : "";
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_lecturer_assignments" + filter,
    {
      method: remove ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      ...(remove ? {} : { body: JSON.stringify(assignment) }),
    },
  );
  return (await readRows(response))?.length === 1;
}

export async function getPracticalSubmissions(
  token: string,
  filter: { studentId?: string; courseId?: string },
) {
  const ids = [filter.studentId, filter.courseId].filter(
    (id): id is string => id !== undefined,
  );
  if (!ids.length || !ids.every((id) => uuidPattern.test(id))) {
    return null;
  }
  const query =
    (filter.studentId ? "&student_id=eq." + filter.studentId : "") +
    (filter.courseId ? "&course_id=eq." + filter.courseId : "");
  return readRows<PracticalSubmission>(
    await requestStudentBackend(
      token,
      "/rest/v1/risa_practical_submissions?select=id,student_id,course_id,activity,evidence,created_at,score,feedback&order=created_at.desc&limit=100" +
        query,
    ),
  );
}

export async function submitPractical(
  token: string,
  input: { student_id: string; course_id: string; activity: string; evidence: string },
) {
  if (
    ![input.student_id, input.course_id].every((id) => uuidPattern.test(id)) ||
    !isWorkspaceActivity(input.activity) ||
    !input.evidence.trim() ||
    input.evidence.length > 6000
  ) {
    return false;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_practical_submissions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(input),
    },
  );
  return (await readRows(response))?.length === 1;
}

export function validReview(score: number, feedback: string) {
  return (
    Number.isInteger(score) &&
    score >= 0 &&
    score <= 100 &&
    feedback.trim().length > 0 &&
    feedback.length <= 2000
  );
}

export async function reviewPractical(
  token: string,
  input: { id: string; courseId: string; score: number; feedback: string },
) {
  if (
    ![input.id, input.courseId].every((id) => uuidPattern.test(id)) ||
    !validReview(input.score, input.feedback)
  ) {
    return false;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_practical_submissions?id=eq." +
      input.id +
      "&course_id=eq." +
      input.courseId,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        score: input.score,
        feedback: input.feedback.trim(),
        reviewed_at: new Date().toISOString(),
      }),
    },
  );
  return (await readRows(response))?.length === 1;
}

export async function getModuleLearnerCount(token: string, courseId: string) {
  if (!uuidPattern.test(courseId)) {
    return null;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_enrollments?select=student_id&course_id=eq." +
      courseId +
      "&status=in.(active,completed)&limit=0",
    { headers: { Prefer: "count=exact" } },
  );
  if (!response?.ok) {
    return null;
  }
  const match = /\/(\d+)$/.exec(response.headers.get("content-range") ?? "");
  return match ? Number(match[1]) : null;
}
