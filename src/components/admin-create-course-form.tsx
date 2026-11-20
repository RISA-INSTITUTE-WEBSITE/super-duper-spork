"use client";

import { useActionState } from "react";

import { courseLevels } from "@/lib/risa-course-admin";

import {
  createCourseAction,
  type CourseCreationState,
} from "@/app/admin/courses/actions";

const initialCourseCreationState: CourseCreationState = {
  status: "idle",
  message: "",
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-xl border border-white bg-white/85 px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus-visible:border-[#286518] focus-visible:ring-2 focus-visible:ring-[#78eb29]/30";

export function AdminCreateCourseForm() {
  const [state, formAction, pending] = useActionState(
    createCourseAction,
    initialCourseCreationState,
  );
  return (
    <form
      action={formAction}
      className="risa-science-glass rounded-[1.6rem] p-6 sm:p-8"
    >
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#286518]">
            Curriculum management
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-slate-950">
            Create a course
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Set the course code, academic level and thumbnail when creating a course.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#286518]">
          Admin only
        </span>
      </div>

      {state.status !== "idle" && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            "mb-6 rounded-xl border px-4 py-3 text-sm font-medium " +
            (state.status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-[#eefce5] text-[#286518]")
          }
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="risa-course-code" className="text-sm font-bold text-slate-900">
            Course code <span className="text-red-600">*</span>
          </label>
          <input
            id="risa-course-code"
            name="code"
            type="text"
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.toUpperCase();
            }}
            maxLength={25}
            pattern="[A-Z0-9]{3,16}(-[A-Z0-9]{2,8})?"
            placeholder="e.g. DVE101"
            autoComplete="off"
            required
            aria-describedby="risa-code-hint"
            className={fieldClass + " font-mono font-semibold uppercase tracking-wider"}
          />
          <p id="risa-code-hint" className="mt-2 text-xs leading-5 text-slate-600">
            Examples: DVE101, 4CPS232, PHY-101. Letters, digits, and one optional hyphen.
            Codes cannot be reused.
          </p>
        </div>
        <div>
          <label htmlFor="risa-course-name" className="text-sm font-bold text-slate-900">
            Course title <span className="text-red-600">*</span>
          </label>
          <input
            id="risa-course-name"
            name="title"
            type="text"
            minLength={2}
            maxLength={120}
            placeholder="e.g. Introduction to Linux for DevOps"
            required
            className={fieldClass}
          />
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Use the full teaching title learners will recognize.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="risa-course-level" className="text-sm font-bold text-slate-900">
            Academic level <span className="text-red-600">*</span>
          </label>
          <select
            id="risa-course-level"
            name="level"
            className={fieldClass}
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select an academic level
            </option>
            {courseLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="risa-course-thumbnail"
            className="text-sm font-bold text-slate-900"
          >
            Course thumbnail <span className="text-red-600">*</span>
          </label>
          <input
            id="risa-course-thumbnail"
            name="thumbnail"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            aria-describedby="risa-thumbnail-hint"
            className={
              fieldClass +
              " file:mr-3 file:rounded-lg file:border-0 file:bg-[#eefce5] file:px-2 file:py-1 file:text-sm"
            }
          />
          <p id="risa-thumbnail-hint" className="mt-2 text-xs text-slate-600">
            Required JPG, PNG or WebP (max 2 MB). Add a cover image before creating
            the course.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="risa-course-description"
          className="text-sm font-bold text-slate-900"
        >
          Course overview
        </label>
        <textarea
          id="risa-course-description"
          name="description"
          rows={4}
          maxLength={1200}
          placeholder="Summarize the learning outcomes, intended level and practical activities."
          className={fieldClass + " resize-y"}
        />
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white bg-white/75 p-4">
        <input
          type="checkbox"
          name="isPublished"
          className="mt-1 size-5 accent-[#286518]"
        />
        <span className="text-sm leading-6 text-slate-700">
          <strong className="block text-slate-950">Publish this course now</strong>
          Leave unchecked to save as a draft. Published courses appear in the public
          catalogue; full lessons still require RISA enrolment approval.
        </span>
      </label>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white pt-6">
        <p className="text-sm text-slate-600">
          Codes are unique. A new course starts as a draft unless you publish it.
        </p>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#286518] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518] disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Creating course..." : "Create course"}
        </button>
      </div>
    </form>
  );
}
