import { requestPublicCourseCatalogue, requestStudentBackend } from "./student-auth-api";

export const courseCodePattern = /^[A-Z0-9]{3,16}(-[A-Z0-9]{2,8})?$/;
export const courseIdPattern = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
export const courseLevels = [
  "Foundation Level",
  "1st Year Level",
  "2nd Year Level",
  "3rd Year Level",
  "4th Year Level",
  "Postgraduate Level",
  "Professional Level",
] as const;
const thumbnailPathPattern = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:png|jpg|webp)$/;
const thumbnailTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type NewRisaCourse = {
  code: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  is_published: boolean;
  programme_slug?: string;
};

export type RisaCourse = NewRisaCourse & {
  id: string;
  created_at: string;
  thumbnail_path: string | null;
};

export type CreateCourseResult = "created" | "duplicate" | "unavailable";

export function validateCourseLevel(input: string): string | null {
  const level = input.trim().replace(/\s+/g, " ");
  return /^[A-Za-z0-9][A-Za-z0-9 .&'()-]{2,49}$/.test(level) ? level : null;
}

/** Institutional codes, titles and levels are revalidated before every write. */
export function validateNewRisaCourse(input: {
  code: string;
  title: string;
  description: string;
  isPublished: boolean;
  level?: string;
  programmeSlug?: string;
}): NewRisaCourse | null {
  const code = input.code.trim().toUpperCase();
  const title = input.title.trim().replace(/\s+/g, " ");
  const description = input.description.trim();
  const level = validateCourseLevel(input.level ?? "1st Year Level");
  const programme = input.programmeSlug;
  if (programme !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(programme)) {
    return null;
  }

  if (
    !courseCodePattern.test(code) ||
    title.length < 2 ||
    title.length > 120 ||
    description.length > 1200 ||
    !level
  ) {
    return null;
  }

  return {
    code,
    slug: code.toLowerCase(),
    title,
    description,
    level,
    is_published: input.isPublished,
    ...(programme ? { programme_slug: programme } : {}),
  };
}

export type InitialCourseThumbnail = {
  courseId: string;
  thumbnailPath: string;
};

function validInitialThumbnail(thumbnail: InitialCourseThumbnail): boolean {
  return (
    courseIdPattern.test(thumbnail.courseId) &&
    thumbnailPathPattern.test(thumbnail.thumbnailPath) &&
    thumbnail.thumbnailPath.startsWith(thumbnail.courseId + "/")
  );
}

export async function createRisaCourse(
  token: string,
  course: NewRisaCourse,
  thumbnail?: InitialCourseThumbnail,
): Promise<CreateCourseResult> {
  const validated = validateNewRisaCourse({
    code: course.code,
    title: course.title,
    description: course.description,
    level: course.level,
    isPublished: course.is_published,
  });
  if (!validated || (thumbnail && !validInitialThumbnail(thumbnail))) {
    return "unavailable";
  }

  const response = await requestStudentBackend(token, "/rest/v1/risa_courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ...validated,
      ...(thumbnail
        ? { id: thumbnail.courseId, thumbnail_path: thumbnail.thumbnailPath }
        : {}),
    }),
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
  const stringFields = [
    "id",
    "code",
    "slug",
    "title",
    "description",
    "created_at",
    "level",
  ];
  if (
    stringFields.some((field) => typeof row[field] !== "string") ||
    typeof row.is_published !== "boolean" ||
    !validateCourseLevel(String(row.level))
  ) {
    return null;
  }
  const thumbnail =
    typeof row.thumbnail_path === "string" &&
    thumbnailPathPattern.test(row.thumbnail_path)
      ? row.thumbnail_path
      : null;

  return {
    id: row.id as string,
    code: row.code as string,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string,
    level: row.level as string,
    is_published: row.is_published as boolean,
    created_at: row.created_at as string,
    thumbnail_path: thumbnail,
    ...(typeof row.programme_slug === "string"
      ? { programme_slug: row.programme_slug }
      : {}),
  };
}

const courseFields =
  "id,code,slug,title,description,level,thumbnail_path,is_published,created_at,programme_slug";

async function readCourses(response: Response | null): Promise<RisaCourse[] | null> {
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows)
      ? rows.flatMap((row) => {
          const parsed = parseRisaCourse(row);
          return parsed ? [parsed] : [];
        })
      : null;
  } catch {
    return null;
  }
}

/** Public homepage query uses anon RLS; draft and unpublished rows are excluded. */
export async function getPublicRisaCourses(): Promise<RisaCourse[] | null> {
  return readCourses(
    await requestPublicCourseCatalogue(
      "/rest/v1/risa_courses?select=" +
        courseFields +
        "&is_published=eq.true&order=created_at.desc&limit=100",
    ),
  );
}

export async function getRisaAdminCourses(token: string): Promise<RisaCourse[] | null> {
  return readCourses(
    await requestStudentBackend(
      token,
      "/rest/v1/risa_courses?select=" + courseFields + "&order=created_at.desc&limit=100",
    ),
  );
}

export async function getRisaCourseById(
  token: string,
  courseId: string,
): Promise<RisaCourse | null> {
  if (!courseIdPattern.test(courseId)) {
    return null;
  }
  const courses = await readCourses(
    await requestStudentBackend(
      token,
      "/rest/v1/risa_courses?select=" + courseFields + "&id=eq." + courseId + "&limit=1",
    ),
  );
  return courses?.[0] ?? null;
}

export async function getRisaCourseByCode(
  token: string,
  code: string,
): Promise<RisaCourse | null> {
  if (!courseCodePattern.test(code)) {
    return null;
  }
  const courses = await readCourses(
    await requestStudentBackend(
      token,
      "/rest/v1/risa_courses?select=" + courseFields + "&code=eq." + code + "&limit=1",
    ),
  );
  return courses?.[0] ?? null;
}

export function isValidCourseThumbnail(file: File): boolean {
  return (
    file.size > 0 &&
    file.size <= 2 * 1024 * 1024 &&
    Object.hasOwn(thumbnailTypes, file.type)
  );
}

/** The bucket is public for display, but uploads require admin RLS membership. */
export async function uploadRisaCourseThumbnail(
  token: string,
  courseId: string,
  file: File,
): Promise<string | null> {
  if (!courseIdPattern.test(courseId) || !isValidCourseThumbnail(file)) {
    return null;
  }
  const ext = thumbnailTypes[file.type];
  const path = courseId + "/" + crypto.randomUUID() + "." + ext;
  const response = await requestStudentBackend(
    token,
    "/storage/v1/object/risa-course-thumbnails/" + path,
    {
      method: "POST",
      headers: { "Content-Type": file.type, "cache-control": "3600" },
      body: file,
    },
  );
  return response?.ok ? path : null;
}

export async function removeRisaCourseThumbnail(
  token: string,
  path: string,
): Promise<void> {
  if (!thumbnailPathPattern.test(path)) {
    return;
  }
  await requestStudentBackend(
    token,
    "/storage/v1/object/risa-course-thumbnails/" + path,
    { method: "DELETE" },
  );
}

export async function updateRisaCoursePresentation(
  token: string,
  courseId: string,
  changes: { level: string; thumbnailPath?: string },
): Promise<boolean> {
  const level = validateCourseLevel(changes.level);
  const thumbnailPath = changes.thumbnailPath;
  if (
    !courseIdPattern.test(courseId) ||
    !level ||
    (thumbnailPath !== undefined && !thumbnailPathPattern.test(thumbnailPath))
  ) {
    return false;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_courses?id=eq." + courseId,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        level,
        ...(thumbnailPath ? { thumbnail_path: thumbnailPath } : {}),
      }),
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

/** Never use untrusted image URLs; display only our managed thumbnail bucket. */
export function risaThumbnailUrl(path: string | null): string | null {
  const base = process.env.RISA_SUPABASE_URL;
  if (!base || !path || !thumbnailPathPattern.test(path)) {
    return null;
  }
  try {
    const url = new URL(base);
    if (
      url.pathname !== "/" ||
      (url.protocol !== "https:" &&
        !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
    ) {
      return null;
    }
    return url.origin + "/storage/v1/object/public/risa-course-thumbnails/" + path;
  } catch {
    return null;
  }
}
