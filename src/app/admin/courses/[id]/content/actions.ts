"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import {
  addQuizQuestion,
  createCourseContent,
  getCourseCurriculum,
  parseYouTubeId,
  uuidPattern,
} from "@/lib/risa-course-curriculum";
import {
  createModuleSection,
  getModuleSections,
  moveModuleTopic,
  validSectionOrder,
  validPracticalLab,
} from "@/lib/risa-module-sections";
import { getRisaCourseById } from "@/lib/risa-course-admin";
import { studentCookieNames } from "@/lib/student-session";

function inputText(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function validText(text: string, min: number, max: number): boolean {
  return text.length >= min && text.length <= max;
}

async function verifiedAdminToken(): Promise<string> {
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity || !(await isRisaAdministrator(token, identity.id))) {
    notFound();
  }
  return token;
}

async function authoringCourse(form: FormData) {
  const token = await verifiedAdminToken();
  const courseId = inputText(form, "courseId");
  if (!uuidPattern.test(courseId) || !(await getRisaCourseById(token, courseId))) {
    notFound();
  }
  return { token, courseId };
}

function finish(courseId: string, outcome: string): never {
  const path = "/admin/courses/" + courseId + "/content";
  revalidatePath(path);
  revalidatePath("/students/courses/" + courseId);
  redirect(path + "?result=" + outcome);
}

function failed(courseId: string): never {
  finish(courseId, "invalid");
}

export async function createTopicAction(form: FormData): Promise<void> {
  const { token, courseId } = await authoringCourse(form);
  const title = inputText(form, "title");
  const description = inputText(form, "description");
  if (!validText(title, 2, 140) || description.length > 1500) {
    failed(courseId);
  }
  const sectionId = inputText(form, "sectionId");
  const order = Number(inputText(form, "sortOrder"));
  const labSlug = inputText(form, "labSlug");
  if (!(await validTopicSection(token, courseId, sectionId)) || !validSectionOrder(order) || !validPracticalLab(labSlug)) {
    failed(courseId);
  }
  const ok = await createCourseContent(token, "risa_course_topics", {
    course_id: courseId,
    section_id: sectionId,
    sort_order: order,
    practical_lab_slug: labSlug || null,
    title,
    description,
    is_published: form.get("published") === "on",
  });
  finish(courseId, ok ? "topic" : "failed");
}

async function authoringTopic(form: FormData) {
  const { token, courseId } = await authoringCourse(form);
  const topicId = inputText(form, "topicId");
  const content = await getCourseCurriculum(token, courseId, true);
  if (!content || !content.topics.some((topic) => topic.id === topicId)) {
    failed(courseId);
  }
  return { token, courseId, topicId, content };
}

export async function createVideoAction(form: FormData): Promise<void> {
  const { token, courseId, topicId } = await authoringTopic(form);
  const title = inputText(form, "title");
  const youtubeId = parseYouTubeId(inputText(form, "youtubeUrl"));
  if (!validText(title, 2, 160) || !youtubeId) {
    failed(courseId);
  }
  const ok = await createCourseContent(token, "risa_topic_videos", {
    topic_id: topicId,
    title,
    youtube_id: youtubeId,
    is_published: form.get("published") === "on",
  });
  finish(courseId, ok ? "video" : "failed");
}

export async function createQuizAction(form: FormData): Promise<void> {
  const { token, courseId, topicId } = await authoringTopic(form);
  const title = inputText(form, "title");
  const description = inputText(form, "description");
  if (!validText(title, 2, 160) || description.length > 800) {
    failed(courseId);
  }
  const ok = await createCourseContent(token, "risa_topic_quizzes", {
    topic_id: topicId,
    title,
    description,
    is_published: form.get("published") === "on",
  });
  finish(courseId, ok ? "quiz" : "failed");
}

export async function createQuestionAction(form: FormData): Promise<void> {
  const { token, courseId, content } = await authoringTopic(form);
  const quizId = inputText(form, "quizId");
  if (!content.quizzes.some((quiz) => quiz.id === quizId)) {
    failed(courseId);
  }

  const prompt = inputText(form, "prompt");
  const choices = [0, 1, 2, 3].map((index) => inputText(form, "choice" + index));
  const correctIndex = Number(inputText(form, "correctIndex"));
  const ok = await addQuizQuestion(token, { quizId, prompt, choices, correctIndex });
  finish(courseId, ok ? "question" : "failed");
}

async function validTopicSection(token: string, courseId: string, sectionId: string) {
  const sections = await getModuleSections(token, courseId);
  return sections?.some((section) => section.id === sectionId) === true;
}

export async function createSectionAction(form: FormData): Promise<void> {
  const { token, courseId } = await authoringCourse(form);
  const ok = await createModuleSection(token, courseId, {
    title: inputText(form, "title"),
    order: Number(inputText(form, "sortOrder")),
  });
  finish(courseId, ok ? "section" : "failed");
}

export async function moveTopicAction(form: FormData): Promise<void> {
  const { token, courseId, topicId } = await authoringTopic(form);
  const sectionId = inputText(form, "sectionId");
  if (!(await validTopicSection(token, courseId, sectionId))) {
    failed(courseId);
  }
  const ok = await moveModuleTopic(token, courseId, {
    topicId,
    sectionId,
    order: Number(inputText(form, "sortOrder")),
    labSlug: inputText(form, "labSlug"),
  });
  finish(courseId, ok ? "moved" : "failed");
}
