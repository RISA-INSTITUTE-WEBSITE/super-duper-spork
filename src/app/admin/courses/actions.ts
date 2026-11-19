"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import {
  createRisaCourse,
  validateNewRisaCourse,
} from "@/lib/risa-course-admin";
import { studentCookieNames } from "@/lib/student-session";

export type CourseCreationState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialCourseCreationState: CourseCreationState = {
  status: "idle",
  message: "",
};

/** Called by the protected administrator form; checks role on each submission. */
export async function createCourseAction(
  _previous: CourseCreationState,
  formData: FormData,
): Promise<CourseCreationState> {
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  const identity = token ? await getStudentIdentity(token) : null;

  if (!token || !identity || !(await isRisaAdministrator(token, identity.id))) {
    return { status: "error", message: "Administrator access is required." };
  }

  const input = validateNewRisaCourse({
    code: String(formData.get("code") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!input) {
    return {
      status: "error",
      message:
        "Enter a title (2–120 characters), a code such as DVE101 or 4CPS232, and a description of at most 1,200 characters.",
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

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  return {
    status: "success",
    message: "Course " + input.code + " created successfully.",
  };
}
