"use client";

import { useState } from "react";

import {
  type Bit,
  type Gate,
  binaryQuestions,
  bitWeights,
  gateOutput,
  gateQuestions,
  gates,
  representByte,
  toggleBit,
  truthTable,
} from "@/lib/computing-lab";

const panel = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8";
const button =
  "min-h-11 rounded-xl border px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

type Question = {
  prompt: string;
  options: readonly string[];
  answer: number;
};

function Practice({
  questions,
  onComplete,
}: {
  questions: readonly Question[];
  onComplete: (complete: boolean) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h3 className="text-lg font-bold">Knowledge checkpoint</h3>
      {questions.map((question, i) => (
        <fieldset key={question.prompt} className="mt-5">
          <legend className="font-semibold">{question.prompt}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {question.options.map((option, j) => (
              <button
                key={option}
                type="button"
                aria-pressed={answers[i] === j}
                className={
                  button +
                  (answers[i] === j
                    ? " border-blue-700 bg-blue-50 text-blue-800"
                    : " border-slate-300")
                }
                onClick={() => {
                  setAnswers((old) => ({ ...old, [i]: j }));
                  setChecked(false);
                  onComplete(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
          {checked && (
            <p className="mt-2 text-sm text-slate-700">
              {answers[i] === question.answer
                ? "Correct."
                : "Not quite. Review the simulator and try again."}
            </p>
          )}
        </fieldset>
      ))}
      <button
        type="button"
        disabled={Object.keys(answers).length !== questions.length}
        className={
          button + " mt-5 border-blue-700 bg-blue-700 text-white disabled:opacity-50"
        }
        onClick={() => {
          setChecked(true);
          onComplete(score === questions.length);
        }}
      >
        Check answers
      </button>
      <p role="status" className="mt-3 font-semibold">
        {checked &&
          (score === questions.length
            ? "All correct — practice checkpoint completed!"
            : score + "/" + questions.length + " correct. Try again.")}
      </p>
    </div>
  );
}

function BinaryLab({ onComplete }: { onComplete: (complete: boolean) => void }) {
  const [value, setValue] = useState(13);
  const representation = representByte(value);

  return (
    <section id="binary-lab" className={panel + " scroll-mt-8"}>
      <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Lab 01</p>
      <h2 className="mt-2 text-2xl font-bold">Binary foundations</h2>
      <p className="mt-3 leading-7 text-slate-600">
        Computers represent data using bits. Each bit has a value of 0 or 1. In an
        unsigned byte, eight bits represent numbers from 0 to 255. Turn bits on to
        add their place values.
      </p>
      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {bitWeights.map((weight) => (
          <button
            type="button"
            key={weight}
            aria-label={"Bit with place value " + weight}
            aria-pressed={(value & weight) !== 0}
            onClick={() => setValue((old) => toggleBit(old, weight))}
            className={
              button +
              (value & weight
                ? " border-blue-700 bg-blue-700 text-white"
                : " border-slate-300 bg-slate-50 text-slate-900")
            }
          >
            <span className="block text-xs">{weight}</span>
            <span className="block font-mono text-xl">{(value & weight) ? 1 : 0}</span>
          </button>
        ))}
      </div>
      <label className="mt-5 block font-semibold" htmlFor="decimal-value">
        Decimal value (0–255)
      </label>
      <input
        id="decimal-value"
        type="range"
        min={0}
        max={255}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-2 w-full accent-blue-700"
      />
      <div aria-live="polite" className="mt-5 grid gap-3 sm:grid-cols-3">
        {Object.entries(representation).map(([base, number]) => (
          <div key={base} className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm capitalize text-slate-600">{base}</p>
            <p className="mt-1 break-all font-mono text-xl font-bold">{number}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-700">
        Active place values:{" "}
        {bitWeights.filter((weight) => value & weight).join(" + ") || "0"} = {value}
      </p>
      <p className="mt-3 text-sm text-slate-600">
        Application: bytes encode pixel colour values, characters and machine instructions.
      </p>
      <Practice questions={binaryQuestions} onComplete={onComplete} />
    </section>
  );
}

function LogicLab({ onComplete }: { onComplete: (complete: boolean) => void }) {
  const [gate, setGate] = useState<Gate>("AND");
  const [a, setA] = useState<Bit>(0);
  const [b, setB] = useState<Bit>(0);
  const output = gateOutput(gate, a, b);

  return (
    <section id="logic-lab" className={panel + " scroll-mt-8"}>
      <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Lab 02</p>
      <h2 className="mt-2 text-2xl font-bold">Digital logic gates</h2>
      <p className="mt-3 leading-7 text-slate-600">
        Logic gates combine binary inputs to produce an output. Select a gate and toggle
        the inputs. Compare your result with its truth table.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {gates.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={gate === name}
            onClick={() => setGate(name)}
            className={
              button +
              (gate === name
                ? " border-blue-700 bg-blue-700 text-white"
                : " border-slate-300")
            }
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-slate-100 p-4">
        <div className="grid gap-2">
          <button
            type="button"
            aria-pressed={a === 1}
            className={button + " border-slate-400 bg-white"}
            onClick={() => setA((old) => (old === 0 ? 1 : 0))}
          >
            A: {a}
          </button>
          {gate !== "NOT" && (
            <button
              type="button"
              aria-pressed={b === 1}
              className={button + " border-slate-400 bg-white"}
              onClick={() => setB((old) => (old === 0 ? 1 : 0))}
            >
              B: {b}
            </button>
          )}
        </div>
        <div className="rounded-xl border-2 border-blue-700 bg-white px-3 py-5 text-center font-mono font-bold text-blue-800">
          {gate}
        </div>
        <div className="text-center" aria-live="polite">
          <p className="text-sm">Output</p>
          <p
            className={
              "mt-1 text-4xl font-bold " + (output ? "text-green-700" : "text-slate-600")
            }
          >
            {output}
          </p>
        </div>
      </div>
      <table className="mt-6 w-full border-collapse text-center">
        <caption className="mb-2 text-left font-semibold">{gate} truth table</caption>
        <thead className="bg-slate-200">
          <tr>
            <th scope="col" className="p-2">
              A
            </th>
            {gate !== "NOT" && (
              <th scope="col" className="p-2">
                B
              </th>
            )}
            <th scope="col" className="p-2">
              Output
            </th>
          </tr>
        </thead>
        <tbody>
          {truthTable(gate).map((row) => (
            <tr
              key={row.a + ":" + row.b}
              className={
                row.a === a && (gate === "NOT" || row.b === b)
                  ? "bg-blue-50 font-bold"
                  : "bg-white"
              }
            >
              <td className="border-b border-slate-200 p-2">{row.a}</td>
              {gate !== "NOT" && (
                <td className="border-b border-slate-200 p-2">{row.b}</td>
              )}
              <td className="border-b border-slate-200 p-2">{row.output}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-slate-600">
        Application: logic gates form the circuits that perform arithmetic and control
        operations inside processors.
      </p>
      <Practice questions={gateQuestions} onComplete={onComplete} />
    </section>
  );
}

export function ComputingLab() {
  const [binaryComplete, setBinaryComplete] = useState(false);
  const [logicComplete, setLogicComplete] = useState(false);
  const completed = Number(binaryComplete) + Number(logicComplete);

  return (
    <main id="main-content" className="flex-1 bg-slate-50">
      <section className="border-b border-blue-100 bg-gradient-to-br from-white to-blue-100">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            RISA Virtual Laboratories
          </p>
          <h1 className="risa-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            RISA Computing Lab
          </h1>
          <p className="mt-3 text-xl font-semibold text-blue-800">Learn Computing by Doing</p>
          <p className="mt-4 max-w-2xl leading-7 text-slate-700">
            Experiment with the building blocks of computers. Explore, predict, test and
            check your understanding.
          </p>
          <a
            href="#cs101"
            className={
              button + " mt-6 inline-flex items-center border-blue-700 bg-blue-700 text-white"
            }
          >
            Explore CS101
          </a>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8">
        <section id="cs101" className={panel + " scroll-mt-8"}>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">CS101</p>
          <h2 className="mt-2 text-2xl font-bold">
            Computer Architecture &amp; Data Representation
          </h2>
          <p className="mt-3 text-slate-600">Choose a practical activity to begin.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href="#binary-lab"
              className={button + " border-blue-200 bg-blue-50 text-blue-900"}
            >
              01 · Binary foundations
            </a>
            <a
              href="#logic-lab"
              className={button + " border-blue-200 bg-blue-50 text-blue-900"}
            >
              02 · Digital logic gates
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            CPU and data encoding labs are planned for a later release.
          </p>
        </section>
        <section className={panel} aria-label="Practice progress">
          <h2 className="text-xl font-bold">Your practice progress</h2>
          <p role="status" className="mt-2 text-slate-700">
            {completed}/2 checkpoints completed
          </p>
          <progress
            className="mt-3 h-4 w-full accent-green-700"
            value={completed}
            max={2}
            aria-label="Completed checkpoints"
          />
          <p className="mt-3 text-sm text-slate-600">
            Binary foundations: {binaryComplete ? "Completed" : "Not yet completed"} ·
            Digital logic: {logicComplete ? "Completed" : "Not yet completed"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Practice progress resets when you reload. It is not a formal competency record
            or an enrolled course assessment.
          </p>
        </section>
        <BinaryLab onComplete={setBinaryComplete} />
        <LogicLab onComplete={setLogicComplete} />
      </div>
    </main>
  );
}
