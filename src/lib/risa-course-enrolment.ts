import { requestStudentBackend } from "./student-auth-api";
import { uuidPattern } from "./risa-course-curriculum";

export type EnrolmentRequestStatus = "pending" | "approved" | "declined";
export type EnrolmentRequest = {
  courseId: string;
  studentId: string;
  email: string;
  status: EnrolmentRequestStatus;
  createdAt: string;
};
export type RequestSubmissionResult = "created" | "duplicate" | "unavailable";

function isRequestStatus(value: unknown): value is EnrolmentRequestStatus {
  return value === "pending" || value === "approved" || value === "declined";
}

function parseRequest(item: unknown): EnrolmentRequest | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  const row = item as Record<string, unknown>;
  const fields = ["course_id", "student_id", "email", "created_at"];
  if (
    fields.some((key) => typeof row[key] !== "string") ||
    !isRequestStatus(row.status)
  ) {
    return null;
  }
  return {
    courseId: row.course_id as string,
    studentId: row.student_id as string,
    email: row.email as string,
    status: row.status,
    createdAt: row.created_at as string,
  };
}

async function readRequests(
  token: string,
  path: string,
): Promise<EnrolmentRequest[] | null> {
  const response = await requestStudentBackend(token, path);
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows)
      ? rows.flatMap((entry) => {
          const parsed = parseRequest(entry);
          return parsed ? [parsed] : [];
        })
      : null;
  } catch {
    return null;
  }
}

const requestFields = "course_id,student_id,email,status,created_at";

/** RLS permits a learner to see only their own request. */
export async function getCourseEnrolmentRequest(
  token: string,
  courseId: string,
  studentId: string,
): Promise<EnrolmentRequest | null | undefined> {
  if (!uuidPattern.test(courseId) || !uuidPattern.test(studentId)) {
    return undefined;
  }
  const rows = await readRequests(
    token,
    "/rest/v1/risa_enrolment_requests?select=" +
      requestFields +
      "&course_id=eq." +
      courseId +
      "&student_id=eq." +
      studentId +
      "&limit=1",
  );
  return rows === null ? undefined : rows[0] ?? null;
}

/** Only the authenticated owner may submit; the database rechecks ownership. */
export async function submitCourseEnrolmentRequest(
  token: string,
  courseId: string,
  studentId: string,
  email: string,
): Promise<RequestSubmissionResult> {
  if (
    !uuidPattern.test(courseId) ||
    !uuidPattern.test(studentId) ||
    email.length < 3 ||
    email.length > 254
  ) {
    return "unavailable";
  }
  const response = await requestStudentBackend(token, "/rest/v1/risa_enrolment_requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({
      course_id: courseId,
      student_id: studentId,
      email,
      status: "pending",
    }),
  });
  if (response?.status === 409) {
    return "duplicate";
  }
  return response?.ok ? "created" : "unavailable";
}

/** Admin-only listing, independently protected by table RLS. */
export async function getPendingCourseEnrolmentRequests(
  token: string,
): Promise<EnrolmentRequest[] | null> {
  return readRequests(
    token,
    "/rest/v1/risa_enrolment_requests?select=" +
      requestFields +
      "&status=eq.pending&order=created_at.asc&limit=100",
  );
}

async function grantCourseEnrolment(
  token: string,
  courseId: string,
  studentId: string,
): Promise<boolean> {
  const response = await requestStudentBackend(token, "/rest/v1/risa_enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({
      course_id: courseId,
      student_id: studentId,
      status: "active",
    }),
  });
  // A duplicate could mean the learner already has a completed enrolment.
  if (response?.status === 409) {
    const check = await requestStudentBackend(
      token,
      "/rest/v1/risa_enrollments?select=status&course_id=eq." +
        courseId +
        "&student_id=eq." +
        studentId +
        "&status=in.(active,completed)&limit=1",
    );
    if (!check?.ok) {
      return false;
    }
    try {
      const items: unknown = await check.json();
      return Array.isArray(items) && items.length === 1;
    } catch {
      return false;
    }
  }
  return response?.ok === true;
}

async function markRequestReviewed(
  token: string,
  courseId: string,
  studentId: string,
  decision: "approved" | "declined",
): Promise<boolean> {
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_enrolment_requests?course_id=eq." +
      courseId +
      "&student_id=eq." +
      studentId +
      "&status=eq.pending",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: decision,
        reviewed_at: new Date().toISOString(),
      }),
    },
  );
  if (!response?.ok) {
    return false;
  }
  try {
    const updated: unknown = await response.json();
    return Array.isArray(updated) && updated.length === 1;
  } catch {
    return false;
  }
}

/** Only a verified administrator can invoke this from server actions. */
export async function reviewCourseEnrolmentRequest(
  token: string,
  courseId: string,
  studentId: string,
  decision: "approved" | "declined",
): Promise<boolean> {
  if (!uuidPattern.test(courseId) || !uuidPattern.test(studentId)) {
    return false;
  }
  const request = await readRequests(
    token,
    "/rest/v1/risa_enrolment_requests?select=" +
      requestFields +
      "&course_id=eq." + courseId +
      "&student_id=eq." + studentId +
      "&status=eq.pending&limit=1",
  );
  if (!request?.length) {
    return false;
  }
  if (decision === "approved") {
    const enrolled = await grantCourseEnrolment(token, courseId, studentId);
    if (!enrolled) {
      return false;
    }
  }
  return markRequestReviewed(token, courseId, studentId, decision);
}
