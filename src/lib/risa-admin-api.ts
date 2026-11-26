import { requestStudentBackend } from "./student-auth-api";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Server-side authorization that uses Supabase's current RLS-protected role
 * membership, never editable Auth user metadata or unverified browser input.
 * The table permits SELECT for own user_id only, no client-side role writes.
 */
export async function isRisaAdministrator(
  accessToken: string,
  verifiedUserId: string,
): Promise<boolean> {
  if (!uuidPattern.test(verifiedUserId)) {
    return false;
  }

  const path =
    "/rest/v1/risa_user_roles?select=role&user_id=eq." +
    verifiedUserId +
    "&role=eq.admin&limit=1";
  const response = await requestStudentBackend(accessToken, path);
  if (!response?.ok) {
    return false;
  }

  try {
    const roles: unknown = await response.json();
    return (
      Array.isArray(roles) &&
      roles.length === 1 &&
      typeof roles[0] === "object" &&
      roles[0] !== null &&
      roles[0].role === "admin"
    );
  } catch {
    return false;
  }
}

export type RisaAdminOverview = {
  courses: number | null;
  modules: number | null;
  enrolments: number | null;
  materials: number | null;
};

async function countAdminRecords(
  token: string,
  resource: "risa_programmes" | "risa_courses" | "risa_enrollments" | "risa_course_materials",
  column: "id" | "student_id" | "slug",
): Promise<number | null> {
  const response = await requestStudentBackend(
    token,
    "/rest/v1/" + resource + "?select=" + column + "&limit=0",
    { headers: { Prefer: "count=exact" } },
  );
  if (!response?.ok) {
    return null;
  }

  const match = /\/(\d+)$/.exec(response.headers.get("content-range") ?? "");
  return match ? Number(match[1]) : null;
}

export async function getRisaAdminOverview(token: string): Promise<RisaAdminOverview> {
  const [courses, modules, enrolments, materials] = await Promise.all([
    countAdminRecords(token, "risa_programmes", "slug"),
    countAdminRecords(token, "risa_courses", "id"),
    countAdminRecords(token, "risa_enrollments", "student_id"),
    countAdminRecords(token, "risa_course_materials", "id"),
  ]);
  return { courses, modules, enrolments, materials };
}
