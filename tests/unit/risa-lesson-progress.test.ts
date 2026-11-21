import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getLearnerLessonCompletions,
  saveLearnerLessonCompletion,
} from "../../src/lib/risa-lesson-progress";

const studentId = "11111111-1111-4111-8111-111111111111";
const videoId = "22222222-2222-4222-8222-222222222222";
const otherVideoId = "33333333-3333-4333-8333-333333333333";
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "test-public-key");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("RISA learner lesson progress", () => {
  it("loads only owned, authorized video IDs and ignores duplicate rows", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json([{ video_id: videoId }, { video_id: videoId }]),
    );
    const result = await getLearnerLessonCompletions("learner-jwt", studentId, [
      videoId,
      otherVideoId,
    ]);

    expect(result).toEqual([videoId]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("risa_lesson_completions?select=video_id");
    expect(String(url)).toContain("student_id=eq." + studentId);
    expect(String(url)).toContain("video_id=in.(" + videoId + "," + otherVideoId + ")");
    expect(options.headers.Authorization).toBe("Bearer learner-jwt");
  });

  it("does not treat database failures or malformed records as zero progress", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getLearnerLessonCompletions("token", studentId, [videoId])).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json([{ video_id: otherVideoId }]));
    expect(await getLearnerLessonCompletions("token", studentId, [videoId])).toBeNull();
    expect(await getLearnerLessonCompletions("token", studentId, ["invalid"])).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("creates an idempotent completion without client-controlled timestamps", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(
      await saveLearnerLessonCompletion("learner-jwt", {
        studentId,
        videoId,
        completed: true,
      }),
    ).toBe(true);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("on_conflict=student_id,video_id");
    expect(options.method).toBe("POST");
    expect(options.headers.Prefer).toContain("resolution=ignore-duplicates");
    expect(JSON.parse(String(options.body))).toEqual({
      student_id: studentId,
      video_id: videoId,
    });
    expect(String(options.body)).not.toContain("completed_at");
    expect(options.headers.Authorization).toBe("Bearer learner-jwt");
  });

  it("allows undo only on learner and video scoped delete requests", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect(
      await saveLearnerLessonCompletion("learner-jwt", {
        studentId,
        videoId,
        completed: false,
      }),
    ).toBe(true);
    const [url, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("DELETE");
    expect(String(url)).toContain("student_id=eq." + studentId);
    expect(String(url)).toContain("video_id=eq." + videoId);
    expect(
      await saveLearnerLessonCompletion("learner-jwt", {
        studentId,
        videoId: "invalid",
        completed: true,
      }),
    ).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
