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
} from "@/lib/risa-course-admin";
import { studentCookieNames } from "@/lib/student-session";

export type CourseCreationState = {
  status: "idle" | "success" | "error";
  message: string;
};

async function authorizedAdminToken(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) return null;
  const identity = await getStudentIdentity(token);
  if (!identity || !(await isRisaAdministrator(token, identity.id))) return null;
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

export async function createCourseAction(
  _previous: CourseCreationState,
  formData: FormData,
): Promise<CourseCreationState> {
  const token = await authorizedAdminToken();
  if (!token) {
    return { status: "error", message: "Administrator access is required." };
  }

  const input = validateNewRisaCourse({
    code: String(formData.get("code") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    level: String(formData.get("level") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!input) {
    return {
      status: "error",
      message:
        "Enter a valid course code, title, academic level and overview (up to 1,200 characters).",
    };
  }

  const thumbnail = formThumbnail(formData);
  if (thumbnail && !isValidCourseThumbnail(thumbnail)) {
    return {
      status: "error",
      message: "Upload a JPG, PNG or WebP image no larger than 2 MB.",
    };
  }

  const outcome = await createRisaCourse(token, input);
  if (outcome === "duplicate") {
    return {
      status: "error",
      message: "This course code is already in use. Choose a different unique code.",
    };
  }
  if (outcome !== "created") {
    return {
      status: "error",
      message: "Course creation failed. Check your permissions and try again.",
    };
  }

  if (thumbnail) {
    const course = await getRisaCourseByCode(token, input.code);
    const path = course
      ? await uploadRisaCourseThumbnail(token, course.id, thumbnail)
      : null;
    if (
      !course ||
      !path ||
      !(await updateRisaCoursePresentation(token, course.id, input.level, path))
    ) {
      if (path) await removeRisaCourseThumbnail(token, path);
      refreshCoursePages();
      return {
        status: "success",
        message:
          "Course " +
          input.code +
          " created, but the thumbnail could not be saved. You can retry from Edit course.",
      };
    }
  }

  refreshCoursePages();
  return {
    status: "success",
    message: "Course " + input.code + " created successfully.",
  };
}

export async function updateCoursePresentationAction(
  _previous: CourseCreationState,
  formData: FormData,
): Promise<CourseCreationState> {
  const token = await authorizedAdminToken();
  if (!token) {
    return { status: "error", message: "Administrator access is required." };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const level = validateCourseLevel(String(formData.get("level") ?? ""));
  if (!courseIdPattern.test(courseId) || !level) {
    return { status: "error", message: "Choose a valid course level." };
  }

  const course = await getRisaCourseById(token, courseId);
  if (!course) {
    return { status: "error", message: "Course not found or access denied." };
  }

  const thumbnail = formThumbnail(formData);
  if (thumbnail && !isValidCourseThumbnail(thumbnail)) {
    return {
      status: "error",
      message: "Upload a JPG, PNG or WebP image no larger than 2 MB.",
    };
  }

  let path: string | null = null;
  if (thumbnail) {
    path = await uploadRisaCourseThumbnail(token, courseId, thumbnail);
    if (!path) {
      return { status: "error", message: "Thumbnail upload failed. Please retry." };
    }
  }

  const saved = await updateRisaCoursePresentation(
    token,
    courseId,
    level,
    path ?? undefined,
  );
  if (!saved) {
    if (path) await removeRisaCourseThumbnail(token, path);
    return { status: "error", message: "Course changes could not be saved." };
  }

  if (path && course.thumbnail_path) {
    await removeRisaCourseThumbnail(token, course.thumbnail_path);
  }
  refreshCoursePages(courseId);
  return {
    status: "success",
    message: "Course level and thumbnail settings saved.",
  };
}
