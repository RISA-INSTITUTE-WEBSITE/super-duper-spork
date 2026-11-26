"use client";

/** Learners explicitly decide when a video is complete; playback is not tracked. */
export function RisaLessonCompletionControl({
  completed,
  completedCount,
  totalCount,
  saving,
  error,
  onToggle,
}: {
  completed: boolean;
  completedCount: number | null;
  totalCount: number;
  saving: boolean;
  error: string | null;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {completed ? "Lesson completed" : "Your lesson progress"}
          </p>
          <p className="mt-1 text-xs text-slate-600" role="status">
            {completedCount === null
              ? "Saved progress is temporarily unavailable."
              : `${completedCount} of ${totalCount} lessons completed in this topic`}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={saving || completedCount === null}
          aria-pressed={completed}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#286518] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1b4810] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] disabled:cursor-not-allowed disabled:opacity-55"
        >
          <span aria-hidden="true">{completed ? "✓" : "○"}</span>
          {saving
            ? "Saving progress..."
            : completed
              ? "Mark as incomplete"
              : "Mark as complete"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
