"use client";

import { useState } from "react";

import { RisaStudyNoteMarkdown } from "./risa-study-note-markdown";

export function MarkdownPresenter() {
  const [text, setText] = useState("");
  const [presenting, setPresenting] = useState(false);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setPresenting(!presenting)}
          className="rounded-lg bg-[#286518] px-4 py-2 font-bold text-white"
        >
          {presenting ? "Edit Markdown" : "Present Markdown"}
        </button>
        <p className="text-sm text-slate-600">
          Use a python-run fenced code block to insert an optional Python Studio.
        </p>
      </div>
      {presenting ? (
        <RisaStudyNoteMarkdown text={text} allowPython />
      ) : (
        <textarea
          aria-label="Presentation Markdown"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste notes, an assessment or other Markdown here."
          maxLength={70000}
          rows={20}
          className="w-full rounded-xl border border-slate-300 p-4 font-mono text-sm"
        />
      )}
    </section>
  );
}
