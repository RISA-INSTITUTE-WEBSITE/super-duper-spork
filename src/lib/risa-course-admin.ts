import { requestStudentBackend } from "./student-auth-api";

export const courseCodePattern = /^[A-Z0-9]{3,16}(-[A-Z0-9]{2,8})?$/;

export type NewRisaCourse = {
  code: string;
  slug: string;
  title: string;
  description: string;
  is_published: boolean;
};

export type RisaCourse = NewRisaCourse & {
  id: string;
  created_at: string;
};

export type CreateCourseResult = "created" | "duplicate" | "unavailable";

/**
 * Course codes are institutional identifiers, not student-chosen URL names.
 * Uppercase validation is enforced again by the database constraint.
 */
export function validateNewRisaCourse(input: {
  code: string;
  title: string;
  description: string;
  isPublished: boolean;
}): NewRisaCourse | null {
  const code = input.code.trim().toUpperCase();
  const title = input.title.trim().replace(/\s+/g, " ");
  const description = input.description.trim();

  if (
    !courseCodePattern.test(code) ||
    title.length < 2 ||
    title.length > 120 ||
    description.length > 1200
  ) {
    return null;
  }

  return {
    code,
    slug: code.toLowerCase(),
    title,
    description,
    is_published: input.isPublished,
  };
}

export async function createRisaCourse(
  token: string,
  course: NewRisaCourse,
): Promise<CreateCourseResult> {
  // A valid course must be revalidated server-side, even if called by a custom client.
  const validated = validateNewRisaCourse({
    code: course.code,
    title: course.title,
    description: course.description,
    isPublished: course.is_published,
  });
  if (!validated) {
    return "unavailable";
  }

  const response = await requestStudentBackend(token, "/rest/v1/risa_courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(validated),
  });

  if (response?.status === 409) {
    return "duplicate";
  }
  return response?.ok ? "created" : "unavailable";
}

function parseRisaCourse(entry: unknown): RisaCourse | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const row = entry as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.code !== "string" ||
    typeof row.slug !== "string" ||
    typeof row.title !== "string" ||
    typeof row.description !== "string" ||
    typeof row.created_at !== "string" ||
    typeof row.is_published !== "boolean"
  ) {
    return null;
  }
  return {
    id: row.id,
    code: row.code,
    slug: row.slug,
    title: row.title,
    description: row.description,
    is_published: row.is_published,
    created_at: row.created_at,
  };
}

export async function getRisaAdminCourses(token: string): Promise<RisaCourse[] | null> {
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_courses?select=id,code,slug,title,description,is_published,created_at&order=created_at.desc&limit=100",
  );
  if (!response?.ok) {
    return null;
  }
  try {
    const items: unknown = await response.json();
    return Array.isArray(items)
      ? items.flatMap((entry) => {
          const parsed = parseRisaCourse(entry);
          return parsed ? [parsed] : [];
        })
      : null;
  } catch {
    return null;
  }
}

/** Single-course lookup also respects learner enrolment policies. */
export async function getRisaCourseById(
  token: string,
  courseId: string,
): Promise<RisaCourse | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(courseId)) {
    return null;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_courses?select=id,code,slug,title,description,is_published,created_at&id=eq." +
      courseId +
      "&limit=1",
  );
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows) && rows.length === 1 ? parseRisaCourse(rows[0]) : null;
  } catch {
    return null;
  }
}
