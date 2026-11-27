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

export function RisaStudyNotesStudio({
  courseId,
  topicId,
  topicTitle,
  notes,
}: {
  courseId: string;
  topicId: string;
  topicTitle: string;
  notes: StudyNote[];
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
    if (!validStudyNote(title, markdown)) {
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
    if (!file || busy) {
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
      <header className="rounded-3xl bg-gradient-to-br from-[#2814D1] to-[#5274C3] p-6 text-white sm:p-8">
        <h1 className="text-2xl font-black">Study Notes Studio</h1>
        <p className="mt-3 font-semibold">{topicTitle}</p>
        <p className="mt-3 text-sm leading-7 text-indigo-100">
          Paste or write your original Markdown and LaTeX, preview the lesson, then save
          and publish it independently of video lessons.
        </p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <label className="block text-sm font-bold">
          Note title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={140}
            disabled={busy}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
          />
        </label>
        <div className="my-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={secondaryButton}
            aria-pressed={!preview}
            onClick={() => setPreview(false)}
          >
            Edit Markdown
          </button>
          <button
            type="button"
            className={secondaryButton}
            aria-pressed={preview}
            onClick={() => setPreview(true)}
          >
            Preview
          </button>
          <button
            type="button"
            className={secondaryButton}
            disabled={busy || preview}
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
            disabled={busy || preview}
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
              disabled={busy}
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
            disabled={busy}
            onClick={() => void save(true)}
            className={primaryButton}
          >
            Save &amp; Publish
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save(false)}
            className={secondaryButton}
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={busy}
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
                  disabled={busy}
                  className={secondaryButton}
                  onClick={() => edit(note)}
                >
                  Edit
                </button>
                {deleteId === note.id ? (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      className={secondaryButton}
                      onClick={() => void remove(note.id)}
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className={secondaryButton}
                      onClick={() => setDeleteId(undefined)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
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
