import type { ModuleSection } from "./risa-module-outline";
import { requestStudentBackend } from "./student-auth-api";

export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CourseTopic = {
  id: string;
  course_id: string;
  section_id?: string;
  sort_order?: number;
  title: string;
  description: string;
  is_published: boolean;
};

export type TopicVideo = {
  id: string;
  topic_id: string;
  title: string;
  youtube_id: string;
  is_published: boolean;
};

export type TopicQuiz = {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  is_published: boolean;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  prompt: string;
  choices: string[];
};

export type CourseCurriculum = {
  sections?: ModuleSection[];
  topics: CourseTopic[];
  videos: TopicVideo[];
  quizzes: TopicQuiz[];
  questions: QuizQuestion[];
};

/** Public-to-registered preview: no quiz questions or playable player data are rendered. */
export type CoursePreviewCurriculum = Pick<CourseCurriculum, "topics" | "videos" | "sections">;

type JsonRow = Record<string, unknown>;
function asRecord(item: unknown): JsonRow | null {
  return item && typeof item === "object" && !Array.isArray(item)
    ? (item as JsonRow)
    : null;
}

function published(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function parseTopic(item: unknown): CourseTopic | null {
  const row = asRecord(item);
  if (
    !row ||
    typeof row.id !== "string" ||
    typeof row.course_id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.description !== "string" ||
    !published(row.is_published)
  ) {
    return null;
  }
  return {
    id: row.id,
    course_id: row.course_id,
    ...(typeof row.section_id === "string" ? { section_id: row.section_id } : {}),
    ...(typeof row.sort_order === "number" ? { sort_order: row.sort_order } : {}),
    title: row.title,
    description: row.description,
    is_published: row.is_published,
  };
}

function parseVideo(item: unknown): TopicVideo | null {
  const row = asRecord(item);
  if (
    !row ||
    typeof row.id !== "string" ||
    typeof row.topic_id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.youtube_id !== "string" ||
    !published(row.is_published)
  ) {
    return null;
  }
  return {
    id: row.id,
    topic_id: row.topic_id,
    title: row.title,
    youtube_id: row.youtube_id,
    is_published: row.is_published,
  };
}

function parseQuiz(item: unknown): TopicQuiz | null {
  const row = asRecord(item);
  if (
    !row ||
    typeof row.id !== "string" ||
    typeof row.topic_id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.description !== "string" ||
    !published(row.is_published)
  ) {
    return null;
  }
  return {
    id: row.id,
    topic_id: row.topic_id,
    title: row.title,
    description: row.description,
    is_published: row.is_published,
  };
}

function parseQuestion(item: unknown): QuizQuestion | null {
  const row = asRecord(item);
  if (
    !row ||
    typeof row.id !== "string" ||
    typeof row.quiz_id !== "string" ||
    typeof row.prompt !== "string" ||
    !Array.isArray(row.choices) ||
    row.choices.length !== 4 ||
    !row.choices.every((choice) => typeof choice === "string")
  ) {
    return null;
  }
  return {
    id: row.id,
    quiz_id: row.quiz_id,
    prompt: row.prompt,
    choices: row.choices as string[],
  };
}

async function fetchCollection<T>(
  token: string,
  path: string,
  parse: (item: unknown) => T | null,
): Promise<T[] | null> {
  const response = await requestStudentBackend(token, path);
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) {
      return null;
    }
    return rows.flatMap((row) => {
      const value = parse(row);
      return value ? [value] : [];
    });
  } catch {
    return null;
  }
}

function inFilter(ids: string[]): string {
  return "in.(" + ids.join(",") + ")";
}

function publishedFilter(includeDrafts: boolean): string {
  return includeDrafts ? "" : "&is_published=eq.true";
}

async function getTopics(
  token: string,
  courseId: string,
  drafts: boolean,
): Promise<CourseTopic[] | null> {
  return fetchCollection(
    token,
    "/rest/v1/risa_course_topics?select=id,course_id,title,description,is_published,section_id,sort_order" +
      "&course_id=eq." +
      courseId +
      publishedFilter(drafts) +
      "&order=sort_order.asc,created_at.asc&limit=100",
    parseTopic,
  );
}

async function getVideos(
  token: string,
  topicIds: string[],
  drafts: boolean,
): Promise<TopicVideo[] | null> {
  if (!topicIds.length) {
    return [];
  }
  return fetchCollection(
    token,
    "/rest/v1/risa_topic_videos?select=id,topic_id,title,youtube_id,is_published" +
      "&topic_id=" +
      inFilter(topicIds) +
      publishedFilter(drafts) +
      "&order=sort_order.asc,created_at.asc&limit=200",
    parseVideo,
  );
}

async function getQuizzes(
  token: string,
  topicIds: string[],
  drafts: boolean,
): Promise<TopicQuiz[] | null> {
  if (!topicIds.length) {
    return [];
  }
  return fetchCollection(
    token,
    "/rest/v1/risa_topic_quizzes?select=id,topic_id,title,description,is_published" +
      "&topic_id=" +
      inFilter(topicIds) +
      publishedFilter(drafts) +
      "&order=created_at.asc&limit=150",
    parseQuiz,
  );
}

async function getQuestions(
  token: string,
  quizIds: string[],
): Promise<QuizQuestion[] | null> {
  if (!quizIds.length) {
    return [];
  }
  // Deliberately never select from risa_quiz_answer_keys.
  return fetchCollection(
    token,
    "/rest/v1/risa_quiz_questions?select=id,quiz_id,prompt,choices" +
      "&quiz_id=" +
      inFilter(quizIds) +
      "&order=sort_order.asc,created_at.asc&limit=500",
    parseQuestion,
  );
}

export async function getCourseCurriculum(
  token: string,
  courseId: string,
  includeDrafts = false,
): Promise<CourseCurriculum | null> {
  if (!uuidPattern.test(courseId)) {
    return null;
  }
  const topics = await getTopics(token, courseId, includeDrafts);
  if (!topics) {
    return null;
  }
  const ids = topics.map((topic) => topic.id);
  const [videos, quizzes] = await Promise.all([
    getVideos(token, ids, includeDrafts),
    getQuizzes(token, ids, includeDrafts),
  ]);
  if (!videos || !quizzes) {
    return null;
  }
  const questions = await getQuestions(
    token,
    quizzes.map((quiz) => quiz.id),
  );
  return questions ? { topics, videos, quizzes, questions } : null;
}

/**
 * Get only published topic and thumbnail metadata for signed-in visitors.
 * Quiz questions, answer keys and private files are never requested.
 */
export async function getCoursePreviewCurriculum(
  token: string,
  courseId: string,
): Promise<CoursePreviewCurriculum | null> {
  if (!uuidPattern.test(courseId)) {
    return null;
  }
  const topics = await getTopics(token, courseId, false);
  if (!topics) {
    return null;
  }
  const videos = await getVideos(
    token,
    topics.map((topic) => topic.id),
    false,
  );
  return videos ? { topics, videos } : null;
}

function youtubeUrlCandidate(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    return url.pathname.split("/")[1] || null;
  }
  const hosts = [
    "www.youtube.com",
    "youtube.com",
    "m.youtube.com",
    "www.youtube-nocookie.com",
  ];
  if (!hosts.includes(host)) {
    return null;
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "watch") {
    return url.searchParams.get("v");
  }
  return ["shorts", "embed", "live"].includes(parts[0]) ? parts[1] || null : null;
}

export function parseYouTubeId(input: string): string | null {
  const text = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(text)) {
    return text;
  }
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.port || url.username || url.password) {
      return null;
    }
    const candidate = youtubeUrlCandidate(url);
    return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

type InsertTable = "risa_course_topics" | "risa_topic_videos" | "risa_topic_quizzes";

export async function createCourseContent(
  token: string,
  table: InsertTable,
  data: Record<string, unknown>,
): Promise<boolean> {
  const response = await requestStudentBackend(token, "/rest/v1/" + table, {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(data),
  });
  return response?.ok === true;
}

export type QuizQuestionDraft = {
  quizId: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
};

export async function addQuizQuestion(
  token: string,
  draft: QuizQuestionDraft,
): Promise<boolean> {
  const { quizId, prompt, choices, correctIndex } = draft;
  if (
    !uuidPattern.test(quizId) ||
    prompt.length < 5 ||
    prompt.length > 500 ||
    choices.length !== 4 ||
    choices.some((choice) => !choice.trim() || choice.length > 250) ||
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex > 3
  ) {
    return false;
  }
  const response = await requestStudentBackend(
    token,
    "/rest/v1/rpc/risa_add_quiz_question",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        p_quiz_id: quizId,
        p_prompt: prompt,
        p_choices: choices,
        p_correct_index: correctIndex,
      }),
    },
  );
  return response?.ok === true;
}
