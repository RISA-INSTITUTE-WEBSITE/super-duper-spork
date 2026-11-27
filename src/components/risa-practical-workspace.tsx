"use client";

import { useState } from "react";

import { ProgrammingIDE } from "@/components/risa-programming-ide";
import { runWorkspace, workspaceActivities } from "@/lib/risa-workspace";

export function RisaPracticalWorkspace() {
  const [activity, setActivity] = useState<(typeof workspaceActivities)[number]>(
    workspaceActivities[0],
  );
  const [source, setSource] = useState<string>(workspaceActivities[0].starter);
  const [output, setOutput] = useState("");
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
      <div className="flex flex-wrap gap-2">
        {workspaceActivities.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={activity.id === item.id}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold aria-pressed:border-[#286518] aria-pressed:bg-[#eefce5]"
            onClick={() => {
              setActivity(item);
              setSource(item.starter);
              setOutput("");
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {activity.id === "programming" ? (
        <ProgrammingIDE
          source={source}
          output={output}
          onSourceChange={(value) => {
            setSource(value);
            setOutput("");
          }}
          onRun={() => setOutput(runWorkspace(activity.id, source))}
          onReset={() => {
            setSource(activity.starter);
            setOutput("");
          }}
          onClear={() => setOutput("")}
        />
      ) : (
        <>
          <h2 className="mt-6 text-xl font-bold">{activity.label} workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activity.prompt}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block min-w-0 text-sm font-bold">
              Editor
              <textarea
                value={source}
                onChange={(event) => setSource(event.target.value)}
                maxLength={2000}
                rows={9}
                spellCheck={false}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-sm text-white"
              />
            </label>
            <div className="min-w-0">
              <p className="text-sm font-bold">Output</p>
              <pre
                aria-live="polite"
                className="mt-2 min-h-56 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 font-mono text-sm text-green-200"
              >
                {output || "Run your exercise to see the result."}
              </pre>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-[#286518] px-5 py-3 font-bold text-white"
              onClick={() => setOutput(runWorkspace(activity.id, source))}
            >
              Run exercise
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-5 py-3 font-bold"
              onClick={() => {
                setSource(activity.starter);
                setOutput("");
              }}
            >
              Reset
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-600">
            Restricted educational simulation. Copy your code, output and explanation into the
            submission form when ready.
          </p>
        </>
      )}
    </section>
  );
}
