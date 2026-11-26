import { uuidPattern } from "./risa-course-curriculum";
import { requestStudentBackend } from "./student-auth-api";

const maxBytes = 220000;

export function validateStudyNoteImage(mime: string, data: string): Uint8Array | null {
  if (data.length > 300000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    return null;
  }
  const bytes = Buffer.from(data, "base64");
  if (bytes.length > maxBytes || bytes.toString("base64") !== data) {
    return null;
  }
  const validators: Record<string, () => boolean> = {
    "image/jpeg": () => bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    "image/png": () =>
      bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "image/webp": () =>
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP",
  };
  const valid = Object.hasOwn(validators, mime) && validators[mime]();
  return valid ? new Uint8Array(bytes) : null;
}

export async function insertStudyNoteImage(
  token: string,
  topicId: string,
  mime: string,
  data: string,
): Promise<string | null> {
  if (!uuidPattern.test(topicId) || !validateStudyNoteImage(mime, data)) {
    return null;
  }
  const id = crypto.randomUUID();
  const response = await requestStudentBackend(token, "/rest/v1/risa_study_note_images", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ id, topic_id: topicId, mime_type: mime, image_data: data }),
  });
  return response?.ok ? "/students/study-note-images/" + id : null;
}

export async function readStudyNoteImage(token: string, id: string) {
  if (!uuidPattern.test(id)) {
    return null;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/risa_study_note_images?select=mime_type,image_data&id=eq." +
      id +
      "&limit=1",
  );
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    if (!Array.isArray(rows) || rows.length !== 1) {
      return null;
    }
    const row = rows[0];
    if (typeof row?.mime_type !== "string" || typeof row?.image_data !== "string") {
      return null;
    }
    const bytes = validateStudyNoteImage(row.mime_type, row.image_data);
    return bytes ? { mime: row.mime_type as string, bytes } : null;
  } catch {
    return null;
  }
}
