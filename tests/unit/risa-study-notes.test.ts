import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  extractMarkdownChecklist,
  normalizeMathDelimiters,
  studyNoteTemplate,
  taskKey,
  validStudyNote,
} from "@/lib/risa-study-note-format";
import {
  getTopicsWithStudyNotes,
  getTopicStudyNotes,
  removeStudyNote,
  saveStudyNote,
} from "@/lib/risa-study-notes";
import {
  insertStudyNoteImage,
  readStudyNoteImage,
  validateStudyNoteImage,
} from "@/lib/risa-study-note-images";

const topicId = "11111111-1111-4111-8111-111111111111";
const noteId = "22222222-2222-4222-8222-222222222222";
const note = {
  id: noteId,
  topic_id: topicId,
  title: "Mechanics",
  markdown: "## Newton's laws",
  is_published: true,
  updated_at: "2026-11-27T00:00:00Z",
};
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "public-test-value");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Edu-ca-te note formatting", () => {
  it("preserves dollar math and converts bracket LaTeX", () => {
    expect(normalizeMathDelimiters(String.raw`\(a=b\) \[F=ma\]`)).toBe(
      "$a=b$ \n$$\nF=ma\n$$\n",
    );
    expect(normalizeMathDelimiters("$x$")).toBe("$x$");
  });

  it("tracks checklist text and position", () => {
    const tasks = extractMarkdownChecklist(
      "## Outcomes\n- [ ] Apply a law\n- [X] Explain it",
    );
    expect(tasks).toEqual([
      { line: 2, text: "Apply a law", defaultChecked: false },
      { line: 3, text: "Explain it", defaultChecked: true },
    ]);
    expect(taskKey(tasks[0])).toBe("2:Apply a law");
    expect(studyNoteTemplate).toContain("## Real-world application");
    expect(validStudyNote("Mechanics", "# A")).toBe(true);
    expect(validStudyNote("x", "notes")).toBe(false);
    expect(validStudyNote("Valid", " ".repeat(2))).toBe(false);
    expect(validStudyNote("Valid", "x".repeat(70001))).toBe(false);
  });
});

describe("private study notes API", () => {
  it("uses the learner JWT and publication filter", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([note, null]));
    expect(await getTopicStudyNotes("token", topicId)).toEqual([note]);
    expect(fetchMock.mock.calls[0][0]).toContain("is_published=eq.true");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token");
    fetchMock.mockResolvedValueOnce(Response.json([note]));
    expect(await getTopicStudyNotes("admin", topicId, true)).toEqual([note]);
    expect(fetchMock.mock.calls[1][0]).not.toContain("is_published=eq.true");
  });

  it("does not fabricate content or accept invalid identifiers", async () => {
    expect(await getTopicStudyNotes("token", "invalid")).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getTopicStudyNotes("token", topicId)).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response("malformed"));
    expect(await getTopicStudyNotes("token", topicId)).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json({}));
    expect(await getTopicStudyNotes("token", topicId)).toBeNull();
  });

  it("requests only topic identifiers for available notes", async () => {
    expect(await getTopicsWithStudyNotes("token", [])).toEqual([]);
    fetchMock.mockResolvedValueOnce(
      Response.json([
        { topic_id: topicId },
        { topic_id: topicId },
        { topic_id: noteId },
        null,
      ]),
    );
    expect(await getTopicsWithStudyNotes("token", [topicId])).toEqual([topicId]);
    expect(fetchMock.mock.calls[0][0]).toContain("select=topic_id");
    expect(fetchMock.mock.calls[0][0]).not.toContain("markdown");
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getTopicsWithStudyNotes("token", [topicId])).toEqual([]);
    fetchMock.mockResolvedValueOnce(new Response("invalid"));
    expect(await getTopicsWithStudyNotes("token", [topicId])).toEqual([]);
  });

  it("saves notes only using the supplied scoped topic and verifies affected rows", async () => {
    const draft = { topicId, title: "Mechanics", markdown: "# Test", published: true };
    expect(await saveStudyNote("token", { ...draft, topicId: "bad" })).toBe(false);
    fetchMock.mockResolvedValueOnce(Response.json([note]));
    expect(await saveStudyNote("token", draft)).toBe(true);
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    fetchMock.mockResolvedValueOnce(Response.json([note]));
    expect(await saveStudyNote("token", { ...draft, noteId })).toBe(true);
    expect(fetchMock.mock.calls[1][0]).toContain("id=eq." + noteId);
    expect(fetchMock.mock.calls[1][1].method).toBe("PATCH");
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await saveStudyNote("token", draft)).toBe(false);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await saveStudyNote("token", draft)).toBe(false);
  });

  it("deletes only a note within its authorized topic", async () => {
    expect(await removeStudyNote("token", "bad", noteId)).toBe(false);
    fetchMock.mockResolvedValueOnce(Response.json([note]));
    expect(await removeStudyNote("token", topicId, noteId)).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain("&topic_id=eq." + topicId);
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await removeStudyNote("token", topicId, noteId)).toBe(false);
  });
});

describe("study note image protections", () => {
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString("base64");

  it("accepts only bounded canonical raster data", () => {
    expect(validateStudyNoteImage("image/png", png)).not.toBeNull();
    expect(
      validateStudyNoteImage(
        "image/jpeg",
        Buffer.from([255, 216, 255]).toString("base64"),
      ),
    ).not.toBeNull();
    expect(
      validateStudyNoteImage(
        "image/webp",
        Buffer.from("RIFF0000WEBP").toString("base64"),
      ),
    ).not.toBeNull();
    expect(validateStudyNoteImage("image/svg+xml", png)).toBeNull();
    expect(validateStudyNoteImage("image/jpeg", png)).toBeNull();
    expect(validateStudyNoteImage("image/png", "!")).toBeNull();
    expect(validateStudyNoteImage("image/png", "x".repeat(300001))).toBeNull();
  });

  it("uploads and reads private image records using authorization", async () => {
    expect(
      await insertStudyNoteImage("token", topicId, { mime: "image/svg+xml", data: png }),
    ).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(
      await insertStudyNoteImage("token", topicId, { mime: "image/png", data: png }),
    ).toMatch(/^\/students\/study-note-images\//);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(
      await insertStudyNoteImage("token", topicId, { mime: "image/png", data: png }),
    ).toBeNull();
    expect(await readStudyNoteImage("token", "bad")).toBeNull();
    fetchMock.mockResolvedValueOnce(
      Response.json([{ mime_type: "image/png", image_data: png }]),
    );
    expect((await readStudyNoteImage("token", noteId))?.mime).toBe("image/png");
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await readStudyNoteImage("token", noteId)).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await readStudyNoteImage("token", noteId)).toBeNull();
  });
});
