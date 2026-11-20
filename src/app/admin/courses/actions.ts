"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import {
  courseIdPattern,
  createRisaCourse,
  getRisaCourseByCode,
  getRisaCourseById,
  isValidCourseThumbnail,
  removeRisaCourseThumbnail,
  updateRisaCoursePresentation,
  uploadRisaCourseThumbnail,
  validateCourseLevel,
  validateNewRisaCourse,
  type RisaCourse,
} from "@/lib/risa-course-admin";
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

/** Thumbnail failure never makes an already-created course disappear. */
async function saveInitialThumbnail(
  token: string,
  code: string,
  level: string,
  image: File,
): Promise<boolean> {
  const course = await getRisaCourseByCode(token, code);
  if (!course) {
    return false;
  }
  const path = await uploadRisaCourseThumbnail(token, course.id, image);
  if (!path) {
    return false;
  }
  const saved = await updateRisaCoursePresentation(token, course.id, {
    level,
    thumbnailPath: path,
  });
  if (!saved) {
    await removeRisaCourseThumbnail(token, path);
  }
  return saved;
}

export async function createCourseAction(
  _previous: CourseCreationState,
  formData: FormData,
): Promise<CourseCreationState> {
  const token = await authorizedAdminToken();
  if (!token) {
    return error("Administrator access is required.");
  }

  const input = validateNewRisaCourse({
    code: String(formData.get("code") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    level: String(formData.get("level") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!input) {
    return error("Enter a valid course code, title, academic level and overview (up to 1,200 characters).");
  }

  const thumbnail = formThumbnail(formData);
  if (thumbnail && !isValidCourseThumbnail(thumbnail)) {
    return error("Upload a JPG, PNG or WebP image no larger than 2 MB.");
  }

  const outcome = await createRisaCourse(token, input);
  if (outcome === "duplicate") {
    return error("This course code is already in use. Choose a different unique code.");
  }
  if (outcome !== "created") {
    return error("Course creation failed. Check your permissions and try again.");
  }

  const thumbnailSaved = thumbnail
    ? await saveInitialThumbnail(token, input.code, input.level, thumbnail)
    : true;
  refreshCoursePages();
  return {
    status: "success",
    message: thumbnailSaved
      ? "Course " + input.code + " created successfully."
      : "Course " + input.code + " created, but its thumbnail could not be saved. Retry from Edit course.",
  };
}

async function saveExistingPresentation(
  token: string,
  course: RisaCourse,
  level: string,
  thumbnail: File | null,
): Promise<CourseCreationState> {
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
  return saveExistingPresentation(token, course, level, thumbnail);
}
