import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addQuizQuestion,
  createCourseContent,
  getCourseCurriculum,
  parseYouTubeId,
} from "../../src/lib/risa-course-curriculum";

const fetchMock = vi.fn();
const course = "11111111-1111-4111-8111-111111111111";
const topic = "22222222-2222-4222-8222-222222222222";
const quiz = "33333333-3333-4333-8333-333333333333";

beforeEach(() => {
  vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "test-public-key");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("trusted YouTube lesson embeds", () => {
  it.each([
    "dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=33",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://youtube.com/live/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  ])("accepts a valid video identifier from %s", (value) => {
    expect(parseYouTubeId(value)).toBe("dQw4w9WgXcQ");
  });

  it.each([
    "https://evil.example/watch?v=dQw4w9WgXcQ",
    "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
    "http://youtube.com/watch?v=dQw4w9WgXcQ",
    "javascript:alert(1)",
    "https://youtube.com/watch?v=%22%3Escript",
    "https://youtu.be/not-valid",
    "https://user:secret@youtube.com/watch?v=dQw4w9WgXcQ",
  ])("rejects untrusted or invalid video URL %s", (value) => {
    expect(parseYouTubeId(value)).toBeNull();
  });
});

describe("RISA course content authorization", () => {
  it("loads published topics, video IDs, quizzes and learner-safe questions", async () => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json([
          {
            id: topic,
            course_id: course,
            title: "Intro",
            description: "Welcome",
            is_published: true,
          },
        ]),
      )
      .mockResolvedValueOnce(
        Response.json([
          {
            id: "video-1",
            topic_id: topic,
            title: "Lab demonstration",
            youtube_id: "dQw4w9WgXcQ",
            is_published: true,
          },
        ]),
      )
      .mockResolvedValueOnce(
        Response.json([
          {
            id: quiz,
            topic_id: topic,
            title: "Knowledge check",
            description: "Try the quiz",
            is_published: true,
          },
        ]),
      )
      .mockResolvedValueOnce(
        Response.json([
          {
            id: "question-1",
            quiz_id: quiz,
            prompt: "Which command prints the current directory?",
            choices: ["pwd", "rm", "mv", "cd"],
          },
        ]),
      );

    const data = await getCourseCurriculum("student-token", course);
    expect(data?.topics).toHaveLength(1);
    expect(data?.videos).toHaveLength(1);
    expect(data?.quizzes).toHaveLength(1);
    expect(data?.questions[0]?.choices[0]).toBe("pwd");
    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls).toHaveLength(4);
    expect(urls.some((url) => url.includes("risa_quiz_answer_keys"))).toBe(false);
    expect(urls.some((url) => url.includes("is_published=eq.true"))).toBe(true);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer student-token");
  });

  it("handles empty courses and backend failures correctly", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await getCourseCurriculum("admin-token", course)).toEqual({
      topics: [],
      videos: [],
      quizzes: [],
      questions: [],
    });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getCourseCurriculum("other-token", course)).toBeNull();
    expect(await getCourseCurriculum("token", "invalid")).toBeNull();
  });

  it("only includes unpublished material when requested for an administrator", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    const result = await getCourseCurriculum("admin-token", course, true);
    expect(result?.topics).toEqual([]);
    expect(fetchMock.mock.calls[0][0]).not.toContain("is_published=eq.true");
  });

  it("writes topics through the caller JWT so Supabase RLS decides authorization", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    const result = await createCourseContent("admin-jwt", "risa_course_topics", {
      course_id: course,
      title: "Measurement",
      is_published: true,
    });
    expect(result).toBe(true);
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(request.headers).toMatchObject({ Authorization: "Bearer admin-jwt" });
    expect(request.method).toBe("POST");
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(
      await createCourseContent("learner-jwt", "risa_topic_quizzes", {
        topic_id: topic,
        title: "Unauthorized",
      }),
    ).toBe(false);
  });

  it("creates quiz questions with answer keys only through the invoker RPC", async () => {
    fetchMock.mockResolvedValueOnce(Response.json("new-question-id"));
    expect(
      await addQuizQuestion(
        "admin-jwt",
        quiz,
        "A sample question?",
        ["A", "B", "C", "D"],
        1,
      ),
    ).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain("/rest/v1/rpc/risa_add_quiz_question");
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      p_quiz_id: quiz,
      p_correct_index: 1,
      p_choices: ["A", "B", "C", "D"],
    });
  });

  it("rejects malformed quizzes before making database requests", async () => {
    expect(await addQuizQuestion("admin-jwt", quiz, "Hi?", ["A", "B", "C", "D"], 0)).toBe(
      false,
    );
    expect(
      await addQuizQuestion("admin-jwt", quiz, "Question?", ["A", "B", "C"], 1),
    ).toBe(false);
    expect(
      await addQuizQuestion("admin-jwt", quiz, "Question?", ["A", "B", "C", "D"], 5),
    ).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
