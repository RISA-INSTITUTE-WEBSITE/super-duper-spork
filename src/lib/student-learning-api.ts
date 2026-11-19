import { requestStudentBackend } from "./student-auth-api";

export type EnrolledCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: "active" | "completed";
};

export type CourseMaterial = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  kind: "resource" | "exercise";
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getEnrolledCourses(
  token: string,
  studentId: string,
): Promise<EnrolledCourse[] | null> {
  if (!uuidPattern.test(studentId)) {
    return null;
  }

  const path =
    "/rest/v1/risa_enrollments?select=course_id,status,course:risa_courses(id,slug,title,description)" +
    "&student_id=eq." +
    studentId +
    "&status=in.(active,completed)&order=created_at.desc&limit=50";
  const response = await requestStudentBackend(token, path);
  if (!response?.ok) {
    return null;
  }

  try {
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) {
      return null;
    }

    return rows.flatMap((row): EnrolledCourse[] => {
      if (!row || typeof row !== "object") {
        return [];
      }
      const entry = row as Record<string, unknown>;
      const course = entry.course as Record<string, unknown> | null;
      if (
        !course ||
        typeof course.id !== "string" ||
        typeof course.slug !== "string" ||
        typeof course.title !== "string" ||
        typeof course.description !== "string" ||
        (entry.status !== "active" && entry.status !== "completed")
      ) {
        return [];
      }
      return [
        {
          id: course.id,
          slug: course.slug,
          title: course.title,
          description: course.description,
          status: entry.status,
        },
      ];
    });
  } catch {
    return null;
  }
}

export async function getCourseMaterials(
  token: string,
  courseIds: readonly string[],
): Promise<CourseMaterial[] | null> {
  const ids = courseIds.filter((id) => uuidPattern.test(id));
  if (!ids.length) {
    return [];
  }

  const path =
    "/rest/v1/risa_course_materials?select=id,course_id,title,description,kind" +
    "&course_id=in.(" +
    ids.join(",") +
    ")&order=created_at.desc&limit=60";
  const response = await requestStudentBackend(token, path);
  if (!response?.ok) {
    return null;
  }

  try {
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) {
      return null;
    }

    return rows.flatMap((item): CourseMaterial[] => {
      if (!item || typeof item !== "object") {
        return [];
      }
      const row = item as Record<string, unknown>;
      if (
        typeof row.id !== "string" ||
        typeof row.course_id !== "string" ||
        typeof row.title !== "string" ||
        typeof row.description !== "string" ||
        (row.kind !== "resource" && row.kind !== "exercise")
      ) {
        return [];
      }
      return [
        {
          id: row.id,
          courseId: row.course_id,
          title: row.title,
          description: row.description,
          kind: row.kind,
        },
      ];
    });
  } catch {
    return null;
  }
}

/**
 * Every materials lookup is done with the learner's JWT. PostgREST and
 * Storage independently enforce the enrolled-course RLS rules.
 */
type MaterialFile = { title: string; storagePath: string };

function parseMaterialFile(value: unknown): MaterialFile | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  if (
    typeof row.title !== "string" ||
    typeof row.storage_path !== "string" ||
    !/^[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,180}$/i.test(row.storage_path)
  ) {
    return null;
  }
  return { title: row.title, storagePath: row.storage_path };
}

async function getAuthorizedMaterialFile(
  token: string,
  id: string,
): Promise<MaterialFile | null> {
  const path =
    "/rest/v1/risa_course_materials?select=title,storage_path&id=eq." + id + "&limit=1";
  const response = await requestStudentBackend(token, path);
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows) && rows.length === 1 ? parseMaterialFile(rows[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Every file lookup is performed with the student's access token. Storage RLS
 * independently confirms enrollment before returning private bytes.
 */
export async function downloadCourseMaterial(
  token: string,
  materialId: string,
): Promise<{ response: Response; title: string; extension: string } | null> {
  if (!uuidPattern.test(materialId)) {
    return null;
  }

  const metadata = await getAuthorizedMaterialFile(token, materialId);
  if (!metadata) {
    return null;
  }

  const file = await requestStudentBackend(
    token,
    "/storage/v1/object/risa-course-content/" + metadata.storagePath,
  );
  if (!file?.ok || !file.body) {
    return null;
  }

  const extension = metadata.storagePath.split(".").at(-1)?.toLowerCase() ?? "bin";
  const safeTitle = metadata.title
    .replace(/[^a-z0-9 _.-]/gi, "")
    .trim()
    .slice(0, 70);
  return {
    response: file,
    title: safeTitle || "RISA-course-material",
    extension: ["pdf", "png", "jpg", "jpeg", "webp", "txt"].includes(extension)
      ? extension
      : "bin",
  };
}

export async function uploadStudentAvatar(
  token: string,
  userId: string,
  image: File,
): Promise<string | null> {
  if (!uuidPattern.test(userId)) {
    return null;
  }

  const fileName =
    image.type === "image/png"
      ? "avatar.png"
      : image.type === "image/webp"
        ? "avatar.webp"
        : "avatar.jpg";
  const avatarPath = userId + "/" + fileName;
  const response = await requestStudentBackend(
    token,
    "/storage/v1/object/risa-student-avatars/" + avatarPath,
    {
      method: "POST",
      headers: {
        "Content-Type": image.type,
        "x-upsert": "true",
      },
      body: image,
    },
  );
  return response?.ok ? avatarPath : null;
}

export async function getStudentAvatar(
  token: string,
  avatarPath: string,
): Promise<Response | null> {
  const response = await requestStudentBackend(
    token,
    "/storage/v1/object/risa-student-avatars/" + avatarPath,
  );
  return response?.ok ? response : null;
}
