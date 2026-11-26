"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import {
  courseIdPattern,
  createRisaCourse,
  getRisaCourseById,
  isValidCourseThumbnail,
  removeRisaCourseThumbnail,
  updateRisaCoursePresentation,
  uploadRisaCourseThumbnail,
  validateCourseLevel,
  validateNewRisaCourse,
  type RisaCourse,
} from "@/lib/risa-course-admin";
import { createRisaProgramme, getRisaProgrammes, isProgrammeSlug } from "@/lib/risa-programmes";
import { studentCookieNames } from "@/lib/student-session";

export type CourseCreationState = {
  status: "idle" | "success" | "error";
  message: string;
};

function error(message: string): CourseCreationState {
  return { status: "error", message };
}

async function authorizedAdminToken(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    return null;
  }
  const identity = await getStudentIdentity(token);
  if (!identity || !(await isRisaAdministrator(token, identity.id))) {
    return null;
  }
  return token;
}

function formThumbnail(formData: FormData): File | null {
  const image = formData.get("thumbnail");
  return image instanceof File && image.size > 0 ? image : null;
}

function refreshCoursePages(courseId?: string) {
  revalidatePath("/");
  revalidatePath("/programmes");
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  if (courseId) {
    revalidatePath("/students/courses/" + courseId);
  }
}

function newCourseFromForm(formData: FormData): ReturnType<typeof validateNewRisaCourse> {
  return validateNewRisaCourse({
    code: String(formData.get("code") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    level: String(formData.get("level") ?? ""),
    isPublished: formData.get("isPublished") === "on",
    programmeSlug: String(formData.get("programmeSlug") ?? ""),
  });
}

async function validModuleParent(
  token: string,
  input: NonNullable<ReturnType<typeof newCourseFromForm>>,
): Promise<boolean> {
  const programmes = await getRisaProgrammes(token);
  const parent = programmes?.find((item) => item.slug === input.programme_slug);
  return Boolean(parent && (!input.is_published || parent.is_published));
}

export async function createProgrammeAction(
  _previous: CourseCreationState,
  formData: FormData,
): Promise<CourseCreationState> {
  const token = await authorizedAdminToken();
  if (!token) {
    return error("Administrator access is required.");
  }
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  if (!isProgrammeSlug(slug)) {
    return error("Enter a unique course slug using letters, digits and hyphens.");
  }
  const saved = await createRisaProgramme(token, {
    title,
    slug,
    description,
    is_published: formData.get("isPublished") === "on",
  });
  if (!saved) {
    return error("Course creation failed. Check the title, slug and description.");
  }
  refreshCoursePages();
  return { status: "success", message: "Course created successfully." };
}

export async function createCourseAction(
  _previous: CourseCreationState,
  formData: FormData,
): Promise<CourseCreationState> {
  const token = await authorizedAdminToken();
  if (!token) {
    return error("Administrator access is required.");
  }

  const input = newCourseFromForm(formData);
  if (!input) {
    return error(
      "Enter a valid course code, title, academic level and overview (up to 1,200 characters).",
    );
  }

  if (!(await validModuleParent(token, input))) {
    return error("Choose a valid parent course. Publish it before publishing modules.");
  }

  const thumbnail = formThumbnail(formData);
  if (!thumbnail) {
    return error("Choose a course thumbnail before creating the course.");
  }
  if (!isValidCourseThumbnail(thumbnail)) {
    return error("Upload a JPG, PNG or WebP image no larger than 2 MB.");
  }

  // Upload first, so the course and its presentation metadata are saved
  // together. A failed image upload never creates a thumbnail-less course.
  const courseId = crypto.randomUUID();
  const thumbnailPath = await uploadRisaCourseThumbnail(token, courseId, thumbnail);
  if (!thumbnailPath) {
    return error("Thumbnail upload failed. No course was created. Please retry.");
  }

  const outcome = await createRisaCourse(token, input, { courseId, thumbnailPath });
  if (outcome !== "created") {
    await removeRisaCourseThumbnail(token, thumbnailPath);
    if (outcome === "duplicate") {
      return error("This course code is already in use. Choose a different unique code.");
    }
    return error("Course creation failed. No course was created. Please retry.");
  }

  refreshCoursePages(courseId);
  return {
    status: "success",
    message: "Module " + input.code + " created successfully.",
  };
}

async function saveExistingPresentation({
  token,
  course,
  level,
  thumbnail,
}: {
  token: string;
  course: RisaCourse;
  level: string;
  thumbnail: File | null;
}): Promise<CourseCreationState> {
  const path = thumbnail
    ? await uploadRisaCourseThumbnail(token, course.id, thumbnail)
    : null;
  if (thumbnail && !path) {
    return error("Thumbnail upload failed. Please retry.");
  }

  const saved = await updateRisaCoursePresentation(token, course.id, {
    level,
    ...(path ? { thumbnailPath: path } : {}),
  });
  if (!saved) {
    if (path) {
      await removeRisaCourseThumbnail(token, path);
    }
    return error("Course changes could not be saved.");
  }

  if (path && course.thumbnail_path) {
    await removeRisaCourseThumbnail(token, course.thumbnail_path);
  }
  refreshCoursePages(course.id);
  return {
    status: "success",
    message: "Course level and thumbnail settings saved.",
  };
}

export async function updateCoursePresentationAction(
  _previous: CourseCreationState,
  formData: FormData,
): Promise<CourseCreationState> {
  const token = await authorizedAdminToken();
  if (!token) {
    return error("Administrator access is required.");
  }

  const courseId = String(formData.get("courseId") ?? "");
  const level = validateCourseLevel(String(formData.get("level") ?? ""));
  if (!courseIdPattern.test(courseId) || !level) {
    return error("Choose a valid course level.");
  }

  const course = await getRisaCourseById(token, courseId);
  if (!course) {
    return error("Course not found or access denied.");
  }

  const thumbnail = formThumbnail(formData);
  if (thumbnail && !isValidCourseThumbnail(thumbnail)) {
    return error("Upload a JPG, PNG or WebP image no larger than 2 MB.");
  }
  return saveExistingPresentation({ token, course, level, thumbnail });
}
