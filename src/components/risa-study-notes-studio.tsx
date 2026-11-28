"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  deleteStudyNoteAction,
  insertStudyNoteImageAction,
  saveStudyNoteAction,
} from "@/app/admin/courses/[id]/content/study-notes/[topicId]/actions";
import { RisaStudyNoteMarkdown } from "@/components/risa-study-note-markdown";
import { prepareStudyNoteImage } from "@/lib/risa-note-image-preparation";
import {
  pythonStudioFence,
  studyNoteTemplate,
  validStudyNote,
} from "@/lib/risa-study-note-format";
import type { StudyNote } from "@/lib/risa-study-notes";

const primaryButton =
  "min-h-11 rounded-xl bg-[#286518] px-4 py-2 text-sm font-bold text-white hover:bg-[#1d4f11] disabled:opacity-50";
const secondaryButton =
  "min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 disabled:opacity-50";

function EditorModeButtons({
  preview,
  setPreview,
}: {
  preview: boolean;
  setPreview: (value: boolean) => void;
}) {
  const modeClass = (active: boolean) =>
    "inline-flex size-11 items-center justify-center rounded-xl border focus-visible:outline-2 focus-visible:outline-[#155DFC] " +
    (active
      ? "border-[#155DFC] bg-blue-50 text-[#155DFC]"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50");

  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        type="button"
        className={modeClass(!preview)}
        aria-label="Edit Markdown"
        title="Edit Markdown"
        aria-pressed={!preview}
        onClick={() => setPreview(false)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path d="m16 3 5 5-12 12-6 1 1-6L16 3Z" />
          <path d="m13 6 5 5" />
        </svg>
      </button>
      <button
        type="button"
        className={modeClass(preview)}
        aria-label="Preview"
        title="Preview"
        aria-pressed={preview}
        onClick={() => setPreview(true)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  );
}

export function RisaStudyNotesStudio({
  courseId,
  topicId,
  notes,
  embedded = false,
}: {
  courseId: string;
  topicId: string;
  notes: StudyNote[];
  embedded?: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string>();
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState(studyNoteTemplate);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleteId, setDeleteId] = useState<string>();
  const editor = useRef<HTMLTextAreaElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const cursor = useRef({ start: 0, end: 0 });
  const ready = Boolean(courseId && topicId);
  const blocked = busy || !ready;

  function startNew() {
    setEditingId(undefined);
    setTitle("");
    setMarkdown(studyNoteTemplate);
    setPreview(false);
    setNotice("");
  }

  function edit(note: StudyNote) {
    setEditingId(note.id);
    setTitle(note.title);
    setMarkdown(note.markdown);
    setPreview(false);
    setNotice("Editing an existing note. Save to apply changes.");
  }

  function rememberCursor() {
    if (editor.current) {
      cursor.current = {
        start: editor.current.selectionStart,
        end: editor.current.selectionEnd,
      };
    }
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await action();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The action failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function save(published: boolean) {
    if (!ready || !validStudyNote(title, markdown)) {
      setNotice("Add a title and up to 70,000 characters of Markdown.");
      return;
    }
    await run(async () => {
      const saved = await saveStudyNoteAction(courseId, {
        topicId,
        noteId: editingId,
        title,
        markdown,
        published,
      });
      if (!saved) {
        throw new Error("Could not save the note.");
      }
      startNew();
      setNotice(published ? "Study note published." : "Draft saved.");
      router.refresh();
    });
  }

  async function insertImage(file?: File) {
    if (!file || blocked) {
      return;
    }
    rememberCursor();
    const point = cursor.current;
    await run(async () => {
      const { mime, data } = await prepareStudyNoteImage(file);
      const url = await insertStudyNoteImageAction(courseId, topicId, { mime, data });
      if (!url) {
        throw new Error("Image upload failed.");
      }
      const insertion = "\n![Study note diagram](" + url + ")\n";
      setMarkdown((old) => old.slice(0, point.start) + insertion + old.slice(point.end));
      setPreview(false);
      setNotice("Image inserted. Edit its alt text and save the note.");
    });
    if (imageInput.current) {
      imageInput.current.value = "";
    }
  }

  async function remove(noteId: string) {
    await run(async () => {
      if (!(await deleteStudyNoteAction(courseId, topicId, noteId))) {
        throw new Error("Could not delete the study note.");
      }
      if (editingId === noteId) {
        startNew();
      }
      setDeleteId(undefined);
      setNotice("Study note deleted.");
      router.refresh();
    });
  }

  return (
    <div className="mt-6 space-y-6">
      {!embedded && <h1 className="text-3xl font-bold">Study Notes Studio</h1>}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        {!ready && (
          <p className="mb-4 text-sm text-slate-600">Select a module and topic to edit.</p>
        )}
        <label className="block text-sm font-bold">
          Note title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={140}
            disabled={blocked}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
          />
        </label>
        <div className="my-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={secondaryButton}
            disabled={blocked || preview}
            onClick={() => {
              rememberCursor();
              imageInput.current?.click();
            }}
          >
            Insert Image
          </button>
          <button
            type="button"
            className={secondaryButton}
            disabled={blocked || preview}
            onClick={() => {
              rememberCursor();
              const { start, end } = cursor.current;
              setMarkdown(
                (old) => old.slice(0, start) + pythonStudioFence + old.slice(end),
              );
              setNotice("Python block inserted. Add code inside the fence and preview.");
            }}
          >
            Insert Python Studio
          </button>
          <EditorModeButtons preview={preview} setPreview={setPreview} />
          <input
            ref={imageInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(event) => void insertImage(event.target.files?.[0])}
          />
        </div>
        {preview ? (
          <div className="min-w-0 rounded-xl border border-slate-200 p-4">
            <RisaStudyNoteMarkdown text={markdown} allowPython />
          </div>
        ) : (
          <label className="block text-sm font-bold">
            Lesson editor — Markdown and LaTeX
            <textarea
              ref={editor}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              onSelect={rememberCursor}
              onBlur={rememberCursor}
              onPaste={(event) => {
                const file = Array.from(event.clipboardData.files).find((item) =>
                  item.type.startsWith("image/"),
                );
                if (file) {
                  event.preventDefault();
                  void insertImage(file);
                }
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const file = event.dataTransfer.files[0];
                if (file) {
                  event.preventDefault();
                  void insertImage(file);
                }
              }}
              disabled={blocked}
              rows={20}
              maxLength={70000}
              className="mt-2 w-full rounded-xl border border-slate-300 p-4 font-mono text-sm leading-6"
            />
          </label>
        )}
        <p className="mt-3 text-xs text-slate-600">
          {markdown.length.toLocaleString()} / 70,000 characters. Images may be pasted,
          dropped or inserted at the cursor.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={blocked}
            onClick={() => void save(true)}
            className={primaryButton}
          >
            Save &amp; Publish
          </button>
          <button
            type="button"
            disabled={blocked}
            onClick={() => void save(false)}
            className={secondaryButton}
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={blocked}
            onClick={startNew}
            className={secondaryButton}
          >
            New note
          </button>
        </div>
        <p role="status" className="mt-4 text-sm font-semibold text-slate-700">
          {busy ? "Working…" : notice}
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold">Existing notes</h2>
        <div className="mt-4 space-y-3">
          {notes.map((note) => (
            <article
              key={note.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-semibold text-[#286518]">
                {note.is_published ? "Published" : "Draft"}
              </p>
              <h3 className="mt-2 font-bold">{note.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={blocked}
                  className={secondaryButton}
                  onClick={() => edit(note)}
                >
                  Edit
                </button>
                {deleteId === note.id ? (
                  <>
                    <button
                      type="button"
                      disabled={blocked}
                      className={secondaryButton}
                      onClick={() => void remove(note.id)}
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      disabled={blocked}
                      className={secondaryButton}
                      onClick={() => setDeleteId(undefined)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={blocked}
                    className={secondaryButton}
                    onClick={() => setDeleteId(note.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
