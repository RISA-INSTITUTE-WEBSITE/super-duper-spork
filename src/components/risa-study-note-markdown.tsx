"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import {
  extractMarkdownChecklist,
  normalizeMathDelimiters,
  taskKey,
  type ChecklistEntry,
} from "@/lib/risa-study-note-format";

const katexOptions = {
  throwOnError: false,
  trust: false,
  strict: "warn" as const,
};

function loadChecks(key?: string): Record<string, boolean> {
  if (!key || typeof localStorage === "undefined") {
    return {};
  }
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, boolean>)
      : {};
  } catch {
    return {};
  }
}

function StudyNoteImage({ src, alt }: { src?: string; alt?: string }) {
  if (!src || !/^\/students\/study-note-images\/[0-9a-f-]{36}$/i.test(src)) {
    return <span className="text-sm text-slate-600">{alt || "Image unavailable"}</span>;
  }
  return (
    <span className="my-5 flex max-w-full flex-col items-center gap-2">
      <Image
        src={src}
        alt={alt || "Study note diagram"}
        width={1200}
        height={800}
        unoptimized
        className="h-auto max-h-[680px] w-auto max-w-full rounded-xl border border-slate-200 bg-white object-contain shadow-sm"
      />
      {alt && (
        <span className="max-w-full text-center text-xs italic text-slate-500">
          {alt}
        </span>
      )}
    </span>
  );
}

function OutcomesProgress({ done, total }: { done: number; total: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-4 rounded-xl border border-[#C8E0DC] bg-[#F3FAF8] p-3 text-slate-800"
    >
      <p className="font-bold">
        Learning outcomes: {done} of {total} achieved
      </p>
      <progress
        aria-label="Learning outcomes achieved"
        value={done}
        max={total}
        className="mt-2 h-2 w-full accent-[#0D9488]"
      />
      <p className="mt-2 text-xs text-slate-600">
        Tick each outcome when you feel confident you can demonstrate it. Progress is
        saved on this device.
      </p>
    </div>
  );
}

export function RisaStudyNoteMarkdown({
  text,
  checklistStorageKey,
}: {
  text: string;
  checklistStorageKey?: string;
}) {
  const normalized = useMemo(() => normalizeMathDelimiters(text), [text]);
  const tasks = useMemo(() => extractMarkdownChecklist(normalized), [normalized]);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCheckedMap(loadChecks(checklistStorageKey));
  }, [checklistStorageKey]);

  const done = tasks.filter(
    (item) => checkedMap[taskKey(item)] ?? item.defaultChecked,
  ).length;

  function toggleTask(item: ChecklistEntry, checked: boolean) {
    if (!checklistStorageKey) {
      return;
    }
    const next = { ...checkedMap, [taskKey(item)]: checked };
    setCheckedMap(next);
    try {
      localStorage.setItem(checklistStorageKey, JSON.stringify(next));
    } catch {
      // Private browsing must not prevent checkbox use.
    }
  }

  return (
    <div className="edu-study-note-markdown min-w-0 break-words space-y-2 text-sm leading-relaxed [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2 [&_p]:my-1.5 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_code]:break-all">
      {checklistStorageKey && tasks.length > 0 && (
        <OutcomesProgress done={done} total={tasks.length} />
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, katexOptions]]}
        skipHtml
        components={{
          img: ({ src, alt }) => (
            <StudyNoteImage src={typeof src === "string" ? src : undefined} alt={alt} />
          ),
          table: ({ children }) => (
            <div
              role="region"
              aria-label="Study notes table"
              tabIndex={0}
              className="my-4 max-w-full overflow-x-auto rounded-xl border border-slate-200"
            >
              <table className="edu-markdown-table edu-study-note-table w-full min-w-max border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="text-slate-900">{children}</thead>,
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200">{children}</tbody>
          ),
          th: ({ children }) => (
            <th
              scope="col"
              className="border-b border-slate-200 px-4 py-3 align-top font-bold"
            >
              {children}
            </th>
          ),
          td: ({ children }) => <td className="px-4 py-3 align-top">{children}</td>,
          input: ({ checked }) =>
            checklistStorageKey ? null : (
              <input
                type="checkbox"
                checked={!!checked}
                disabled
                readOnly
                className="mr-2 accent-[#0D9488]"
              />
            ),
          li: ({ node, children, ...props }) => {
            const item = tasks.find((task) => task.line === node?.position?.start.line);
            const hasCheckbox = node?.children?.some(
              (child) =>
                child.type === "element" &&
                child.tagName === "input" &&
                child.properties?.type === "checkbox",
            );
            if (checklistStorageKey && hasCheckbox && item) {
              return (
                <li {...props} className="list-none">
                  <label className="flex cursor-pointer items-start gap-2 rounded-md py-1">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-[#0D9488]"
                      checked={checkedMap[taskKey(item)] ?? item.defaultChecked}
                      onChange={(event) => toggleTask(item, event.target.checked)}
                      aria-label={"I can: " + item.text}
                    />
                    <span>{children}</span>
                  </label>
                </li>
              );
            }
            return <li {...props}>{children}</li>;
          },
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-xl bg-slate-100 p-4 text-sm">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-slate-300 pl-4 text-slate-700">
              {children}
            </blockquote>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
