"use client";

import { useState } from "react";

import {
  accelerationFromForce,
  accessRoles,
  accessScenarios,
  evaluateAccess,
  simulatePipeline,
  straightTrackMotion,
  type AccessRole,
  type PipelineResult,
} from "@/lib/risa-virtual-labs";

const panel = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8";
const button =
  "min-h-11 rounded-xl bg-[#286518] px-4 py-2 font-bold text-white hover:bg-[#1d4f11]";

function Control({
  label,
  value,
  max,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mt-4 block text-sm font-semibold">
      {label}: {value}
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 block w-full accent-blue-700"
      />
    </label>
  );
}

function PhysicsLab() {
  const [speed, setSpeed] = useState(2);
  const [acceleration, setAcceleration] = useState(1);
  const [time, setTime] = useState(5);
  const [mass, setMass] = useState(2);
  const [force, setForce] = useState(10);
  const motion = straightTrackMotion(speed, acceleration, time);
  const position = Math.min(100, (motion.distance / 600) * 100);
  const result = accelerationFromForce(force, mass);

  return (
    <div className="grid gap-6">
      <section className={panel}>
        <h2 className="text-2xl font-bold">Motion on a straight track</h2>
        <p className="mt-3 leading-7 text-slate-600">
          Predict where the cart will be, then adjust its initial speed, acceleration
          and elapsed time. The track represents 600 metres.
        </p>
        <Control label="Initial speed (m/s)" value={speed} max={10} onChange={setSpeed} />
        <Control
          label="Acceleration (m/s²)"
          value={acceleration}
          max={10}
          onChange={setAcceleration}
        />
        <Control label="Time (s)" value={time} max={10} onChange={setTime} />
        <div className="mt-6 rounded-xl bg-blue-50 p-4">
          <svg viewBox="0 0 340 90" role="img" aria-label="Cart position on the track">
            <path d="M20 65H320" stroke="#64748b" strokeWidth="3" />
            <g transform={`translate(${20 + position * 2.8} 0)`}>
              <rect y="35" width="24" height="20" rx="3" fill="#155DFC" />
              <circle cx="5" cy="60" r="5" fill="#334155" />
              <circle cx="19" cy="60" r="5" fill="#334155" />
            </g>
            <text x="20" y="82" fontSize="10">
              0 m
            </text>
            <text x="290" y="82" fontSize="10">
              600 m
            </text>
          </svg>
          <div aria-live="polite" className="mt-3 grid gap-3 sm:grid-cols-2">
            <p>
              Distance: <strong>{motion.distance.toFixed(1)} m</strong>
            </p>
            <p>
              Velocity: <strong>{motion.velocity.toFixed(1)} m/s</strong>
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          The model assumes constant acceleration in one direction. Distance = initial
          speed × time + ½ × acceleration × time².
        </p>
      </section>
      <section className={panel}>
        <h2 className="text-2xl font-bold">Force and acceleration</h2>
        <p className="mt-3 text-slate-600">
          Change the net force and mass to investigate Newton&apos;s second law.
        </p>
        <Control label="Mass (kg)" value={mass} min={1} max={20} onChange={setMass} />
        <Control label="Net force (N)" value={force} max={40} onChange={setForce} />
        <p aria-live="polite" className="mt-5 rounded-xl bg-blue-50 p-4 font-bold">
          Acceleration = {result.toFixed(2)} m/s²
        </p>
        <p className="mt-3 text-sm text-slate-600">
          a = F / m. Keep force constant and double the mass: what happens?
        </p>
      </section>
    </div>
  );
}

function DevOpsLab() {
  const [buildPasses, setBuildPasses] = useState(true);
  const [testsPass, setTestsPass] = useState(true);
  const [results, setResults] = useState<PipelineResult[] | null>(null);

  return (
    <section className={panel}>
      <h2 className="text-2xl font-bold">Build, test and deploy</h2>
      <p className="mt-3 leading-7 text-slate-600">
        Configure simulated outcomes and run the pipeline. A failed build or test
        prevents a deployment. No real infrastructure or code is executed.
      </p>
      <div className="mt-5 grid gap-3">
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={buildPasses}
            onChange={(event) => {
              setBuildPasses(event.target.checked);
              setResults(null);
            }}
          />
          Build succeeds
        </label>
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={testsPass}
            onChange={(event) => {
              setTestsPass(event.target.checked);
              setResults(null);
            }}
          />
          Tests succeed
        </label>
      </div>
      <button
        type="button"
        className={button + " mt-5"}
        onClick={() => setResults(simulatePipeline(buildPasses, testsPass))}
      >
        Run pipeline
      </button>
      <ol aria-live="polite" className="mt-6 grid gap-3 sm:grid-cols-3">
        {(results ?? [
          { stage: "Build", status: "ready" },
          { stage: "Test", status: "ready" },
          { stage: "Deploy", status: "ready" },
        ]).map((item) => (
          <li key={item.stage} className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold">{item.stage}</h3>
            <p className="mt-2 capitalize text-slate-700">{item.status}</p>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm text-slate-600">
        Challenge: make the build succeed but the tests fail. Explain why deployment
        is blocked.
      </p>
    </section>
  );
}

function SecurityLab() {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<AccessRole | null>(null);
  const scenario = accessScenarios[index];
  const outcome = chosen ? evaluateAccess(scenario.required, chosen) : null;
  const feedback = {
    correct: "Correct — the minimum necessary permission was selected.",
    excessive: "Too much access. Choose the least privilege needed.",
    insufficient: "Insufficient access. Choose a permission that enables the task.",
  };

  return (
    <section className={panel}>
      <h2 className="text-2xl font-bold">Least privilege access control</h2>
      <p className="mt-3 leading-7 text-slate-600">
        Assign permissions in a fictional learning system. Give each user only the
        privileges necessary to perform their task.
      </p>
      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-blue-700">
        Scenario {index + 1} of {accessScenarios.length}
      </p>
      <p className="mt-3 text-lg font-semibold">{scenario.task}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {accessRoles.map((role) => (
          <button
            type="button"
            key={role}
            aria-pressed={chosen === role}
            className="min-h-11 rounded-xl border border-slate-300 px-5 py-2 font-bold aria-pressed:border-blue-700 aria-pressed:bg-blue-50"
            onClick={() => setChosen(role)}
          >
            {role}
          </button>
        ))}
      </div>
      <div role="status" className="mt-5 rounded-xl bg-slate-50 p-4">
        <p>{outcome ? feedback[outcome] : "Select a permission to check your answer."}</p>
        {outcome === "correct" && <p className="mt-2">{scenario.explanation}</p>}
      </div>
      <button
        type="button"
        disabled={outcome !== "correct"}
        className={button + " mt-5 disabled:opacity-50"}
        onClick={() => {
          setIndex((old) => (old + 1) % accessScenarios.length);
          setChosen(null);
        }}
      >
        {index === accessScenarios.length - 1 ? "Restart scenarios" : "Next scenario"}
      </button>
    </section>
  );
}

export function DomainLab({ domain }: { domain: "physics" | "devops" | "security" }) {
  if (domain === "physics") {
    return <PhysicsLab />;
  }
  return domain === "devops" ? <DevOpsLab /> : <SecurityLab />;
}
