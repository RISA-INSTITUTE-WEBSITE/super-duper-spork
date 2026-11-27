export const workspaceActivities = [
  {
    id: "programming",
    label: "Programming",
    prompt:
      "Calculate the area of a rectangle using print(8 * 5). Change the dimensions and run again.",
    starter: "print(8 * 5)",
    expected: "40",
  },
  {
    id: "linux",
    label: "Linux terminal",
    prompt: "Explore a fictional filesystem with pwd, ls and cat README.txt.",
    starter: "pwd\nls\ncat README.txt",
    expected: "RISA practice workspace",
  },
  {
    id: "sql",
    label: "Database",
    prompt: "Select the records of fictional students whose score is at least 70.",
    starter: "SELECT * FROM students WHERE score >= 70;",
    expected: "Ada | 82",
  },
  {
    id: "physics",
    label: "Physics",
    prompt: "Calculate acceleration using force divided by mass. Change the two values.",
    starter: "10 / 2",
    expected: "5",
  },
] as const;

export type WorkspaceActivity = (typeof workspaceActivities)[number]["id"];

export function isWorkspaceActivity(value: string): value is WorkspaceActivity {
  return workspaceActivities.some((item) => item.id === value);
}

const numbers = /^(-?\d+(?:\.\d+)?)\s*([+*/-])\s*(-?\d+(?:\.\d+)?)$/;
const operators: Record<string, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

function arithmetic(source: string): string {
  const match = numbers.exec(source.trim());
  if (!match) {
    return "Enter two numbers and one arithmetic operator.";
  }
  const result = operators[match[2]](Number(match[1]), Number(match[3]));
  return Number.isFinite(result) ? String(result) : "Undefined or out of range.";
}

function programming(source: string): string {
  const match = /^print\(([^()]*)\)$/.exec(source.trim());
  return match ? arithmetic(match[1]) : "Supported syntax: print(8 * 5).";
}

const terminalCommands: Record<string, string> = {
  pwd: "/home/learner",
  ls: "README.txt  exercises",
  "cat README.txt": "RISA practice workspace",
  "ls exercises": "task.txt",
  "cat exercises/task.txt": "Practice listing and reading fictional files.",
  help: "pwd, ls, cat README.txt, ls exercises, cat exercises/task.txt, help",
};

function terminal(source: string): string {
  return source
    .split("\n")
    .slice(0, 30)
    .map((line) => {
      const command = line.trim();
      if (!command) {
        return "";
      }
      const output = Object.hasOwn(terminalCommands, command)
        ? terminalCommands[command]
        : "Command not supported in this simulated terminal.";
      return "$ " + command + "\n" + output;
    })
    .join("\n");
}

const students = [
  { name: "Ada", score: 82 },
  { name: "Ben", score: 65 },
  { name: "Cleo", score: 94 },
];

function database(source: string): string {
  const match =
    /^SELECT\s+\*\s+FROM\s+students(?:\s+WHERE\s+score\s*>=\s*(\d{1,3}))?\s*;?$/i.exec(
      source.trim(),
    );
  if (!match) {
    return "Supported: SELECT * FROM students WHERE score >= 70;";
  }
  const minimum = match[1] ? Number(match[1]) : 0;
  const rows = students.filter((row) => row.score >= minimum);
  return (
    "name | score\n" +
    rows.map((row) => row.name + " | " + row.score).join("\n") +
    "\n" +
    rows.length +
    " rows"
  );
}

export function runWorkspace(activity: WorkspaceActivity, source: string): string {
  if (source.length > 2000) {
    return "Input exceeds 2,000 characters.";
  }
  const runners = { programming, linux: terminal, sql: database, physics: arithmetic };
  return runners[activity](source);
}
