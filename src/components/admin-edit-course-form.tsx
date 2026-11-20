"use client";

import { useActionState } from "react";

import {
  updateCoursePresentationAction,
  type CourseCreationState,
} from "@/app/admin/courses/actions";
import { courseLevels } from "@/lib/risa-course-admin";

const initialState: CourseCreationState = { status: "idle", message: "" };

export function AdminEditCourseForm({
  courseId,
  initialLevel,
}: {
  courseId: string;
  initialLevel: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateCoursePresentationAction,
    initialState,
  );
  const levelId = "risa-level-" + courseId;
  const thumbnailId = "risa-thumbnail-" + courseId;

  return (
    <details className="mt-5 rounded-xl border border-white bg-white/65 p-4">
      <summary className="cursor-pointer text-sm font-bold text-[#286518]">
        Edit level &amp; thumbnail
      </summary>
      <form action={formAction} encType="multipart/form-data" className="mt-5 space-y-4">
        <input type="hidden" name="courseId" value={courseId} />
        <div>
          <label htmlFor={levelId} className="text-sm font-semibold text-slate-900">
            Academic level
          </label>
          <select
            id={levelId}
            name="level"
            defaultValue={initialLevel}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            required
          >
            {!courseLevels.some((value) => value === initialLevel) && (
              <option value={initialLevel}>{initialLevel}</option>
            )}
            {courseLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={thumbnailId} className="text-sm font-semibold text-slate-900">
            Replace course thumbnail
          </label>
          <input
            id={thumbnailId}
            name="thumbnail"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#eefce5] file:px-3 file:py-2 file:font-semibold file:text-[#286518]"
          />
          <p className="mt-1 text-xs text-slate-500">
            Optional JPG, PNG or WebP, max 2 MB. Leave empty to keep the current image.
          </p>
        </div>
        {state.status !== "idle" && (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={
              "text-sm " + (state.status === "error" ? "text-red-700" : "text-green-800")
            }
          >
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 w-full rounded-xl bg-[#286518] px-4 py-2 text-sm font-bold text-white hover:bg-[#1d4f11] disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save course details"}
        </button>
      </form>
    </details>
  );
}
