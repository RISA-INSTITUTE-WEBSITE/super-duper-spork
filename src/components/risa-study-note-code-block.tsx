"use client";

import { useState, type ReactNode } from "react";
import type { ExtraProps } from "react-markdown";

import { PythonStudio } from "./risa-programming-ide";

export function getRunnablePython(node: ExtraProps["node"]): string | null {
  const code = node?.children[0];
  if (code?.type !== "element" || code.tagName !== "code") {
    return null;
  }
  const classes = code.properties.className;
  if (!Array.isArray(classes) || !classes.includes("language-python-run")) {
    return null;
  }
  const text = code.children
    .map((child) => (child.type === "text" ? child.value : ""))
    .join("")
    .replace(/\n$/, "");
  return text.length <= 20000 ? text : null;
}

function RunnablePython({ source }: { source: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-4 min-w-0 rounded-xl border border-slate-300 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-800">Python Studio</span>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-[#286518] px-4 py-2 text-sm font-bold text-white"
        >
          {open ? "Close Python Studio" : "Open Python Studio"}
        </button>
      </div>
      {open ? (
        <PythonStudio initialCode={source} />
      ) : (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-100 p-3 text-sm">
          <code>{source}</code>
        </pre>
      )}
    </div>
  );
}

export function StudyNoteCodeBlock({
  node,
  children,
  allowPython,
}: ExtraProps & { children?: ReactNode; allowPython: boolean }) {
  const source = allowPython ? getRunnablePython(node) : null;
  if (source !== null) {
    return <RunnablePython key={source} source={source} />;
  }
  return (
    <pre className="my-4 overflow-x-auto rounded-xl bg-slate-100 p-4 text-sm">
      {children}
    </pre>
  );
}
