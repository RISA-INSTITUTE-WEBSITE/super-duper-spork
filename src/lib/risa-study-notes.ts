import { uuidPattern } from "./risa-course-curriculum";
import { validStudyNote } from "./risa-study-note-format";
import { requestStudentBackend } from "./student-auth-api";

export type StudyNote = {
  id: string;
  topic_id: string;
  title: string;
  markdown: string;
  is_published: boolean;
  updated_at: string;
};

const fields = "id,topic_id,title,markdown,is_published,updated_at";

function parseNote(value: unknown): StudyNote | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Partial<StudyNote>;
  if (
    typeof row.id !== "string" ||
    typeof row.topic_id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.markdown !== "string" ||
    typeof row.is_published !== "boolean" ||
    typeof row.updated_at !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    topic_id: row.topic_id,
    title: row.title,
    markdown: row.markdown,
    is_published: row.is_published,
    updated_at: row.updated_at,
  };
}

export async function getTopicStudyNotes(
  token: string,
  topicId: string,
  drafts = false,
): Promise<StudyNote[] | null> {
  if (!uuidPattern.test(topicId)) {
    return null;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_study_notes?select=" +
      fields +
      "&topic_id=eq." +
      topicId +
      (drafts ? "" : "&is_published=eq.true") +
      "&order=created_at.asc&limit=100",
  );
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows)
      ? rows.flatMap((row) => {
          const note = parseNote(row);
          return note ? [note] : [];
        })
      : null;
  } catch {
    return null;
  }
}

export async function getTopicsWithStudyNotes(
  token: string,
  topicIds: string[],
): Promise<string[]> {
  const ids = topicIds.filter((id) => uuidPattern.test(id));
  if (!ids.length) {
    return [];
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_study_notes?select=topic_id&is_published=eq.true&topic_id=in.(" +
      ids.join(",") +
      ")",
  );
  if (!response?.ok) {
    return [];
  }
  try {
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) {
      return [];
    }
    return [
      ...new Set(
        rows.flatMap((row) =>
          typeof row?.topic_id === "string" && ids.includes(row.topic_id)
            ? [row.topic_id as string]
            : [],
        ),
      ),
    ];
  } catch {
    return [];
  }
}

export type StudyNoteDraft = {
  topicId: string;
  noteId?: string;
  title: string;
  markdown: string;
  published: boolean;
};

export async function saveStudyNote(
  token: string,
  input: StudyNoteDraft,
): Promise<boolean> {
  if (
    !uuidPattern.test(input.topicId) ||
    (input.noteId && !uuidPattern.test(input.noteId)) ||
    !validStudyNote(input.title, input.markdown)
  ) {
    return false;
  }
  const filter = input.noteId
    ? "?id=eq." + input.noteId + "&topic_id=eq." + input.topicId
    : "";
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_study_notes" + filter,
    {
      method: input.noteId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        topic_id: input.topicId,
        title: input.title.trim(),
        markdown: input.markdown.trim(),
        is_published: input.published,
        updated_at: new Date().toISOString(),
      }),
    },
  );
  return changedOne(response);
}

async function changedOne(response: Response | null): Promise<boolean> {
  if (!response?.ok) {
    return false;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows) && rows.length === 1;
  } catch {
    return false;
  }
}

export async function removeStudyNote(
  token: string,
  topicId: string,
  noteId: string,
): Promise<boolean> {
  if (!uuidPattern.test(topicId) || !uuidPattern.test(noteId)) {
    return false;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_study_notes?id=eq." + noteId + "&topic_id=eq." + topicId,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );
  return changedOne(response);
}
