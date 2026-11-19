"use client";

import { useState } from "react";

import type { QuizQuestion, TopicQuiz } from "@/lib/risa-course-curriculum";

/**
 * Practice questions are interactive but not graded.
 * The correct-answer table remains private to RISA staff.
 */
export function StudentPracticeQuiz({
  quiz,
  questions,
}: {
  quiz: TopicQuiz;
  questions: QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reviewed, setReviewed] = useState(false);
  const answered = questions.filter(
    (question) => answers[question.id] !== undefined,
  ).length;

  return (
    <section className="rounded-[1.5rem] border border-[#78eb29]/40 bg-[#eefce5]/60 p-5 sm:p-7">
      <h4 className="font-heading text-xl font-bold text-slate-950">{quiz.title}</h4>
      {quiz.description && (
        <p className="mt-2 text-sm leading-6 text-slate-600">{quiz.description}</p>
      )}
      <p className="mt-2 text-xs text-slate-600">
        Practice quiz · Multiple choice · No grades recorded yet
      </p>
      {questions.length === 0 ? (
        <p className="mt-5 rounded-xl bg-white/75 p-4 text-sm text-slate-600">
          Questions are being prepared for this quiz.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {questions.map((question, index) => (
            <fieldset
              key={question.id}
              className="rounded-xl border border-white bg-white/80 p-5"
            >
              <legend className="px-1 text-sm font-bold text-slate-950">
                {index + 1}. {question.prompt}
              </legend>
              <div className="mt-3 grid gap-3">
                {question.choices.map((choice, option) => (
                  <label
                    key={option}
                    className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 has-[:checked]:border-[#78eb29] has-[:checked]:bg-[#eefce5]"
                  >
                    <input
                      type="radio"
                      name={"quiz-" + quiz.id + "-question-" + question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => {
                        setAnswers((previous) => ({
                          ...previous,
                          [question.id]: option,
                        }));
                        setReviewed(false);
                      }}
                      className="size-4 accent-[#286518]"
                    />
                    <span>
                      {String.fromCharCode(65 + option)}. {choice}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setReviewed(true)}
              className="inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-6 py-2 text-sm font-bold text-white hover:bg-[#1d4f11]"
            >
              Review selections
            </button>
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setReviewed(false);
              }}
              className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline"
            >
              Clear answers
            </button>
          </div>
          {reviewed && (
            <p
              role="status"
              className="rounded-xl border border-white bg-white/80 p-4 text-sm text-slate-700"
            >
              You selected answers for {answered} of {questions.length} questions. Your
              selections stay on this page only; they are not submitted or graded.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
