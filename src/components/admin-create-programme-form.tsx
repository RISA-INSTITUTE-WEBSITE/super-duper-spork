"use client";

import { useActionState } from "react";

import {
  createProgrammeAction,
  type CourseCreationState,
} from "@/app/admin/courses/actions";

const field = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm";

export function AdminCreateProgrammeForm() {
  const initialState: CourseCreationState = {
    status: "idle",
    message: "",
  };
  const [state, action, pending] = useActionState(createProgrammeAction, initialState);
  return (
    <form action={action} className="risa-glass-card rounded-2xl p-6">
      <h2 className="text-xl font-bold">Create a course</h2>
      <p className="mt-2 text-sm text-slate-600">
        Create a parent course such as Computer Science before adding modules.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">
          Course name
          <input name="title" required minLength={2} maxLength={120} className={field} />
        </label>
        <label className="text-sm font-bold">
          Course slug
          <input
            name="slug"
            required
            maxLength={100}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="computer-science"
            className={field}
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-bold">
        Description
        <textarea name="description" maxLength={1200} rows={3} className={field} />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" />
        Publish course in the student catalogue
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-xl bg-[#286518] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create course"}
      </button>
      {state.status !== "idle" && (
        <p role="status" className="mt-3 text-sm">
          {state.message}
        </p>
      )}
    </form>
  );
}
