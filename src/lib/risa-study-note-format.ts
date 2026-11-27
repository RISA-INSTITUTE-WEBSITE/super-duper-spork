function normalizeProseMath(text: string): string {
  return text
    .replace(
      /\\\[([\s\S]*?)\\\]/g,
      (_match, equation: string) => "\n$$\n" + equation.trim() + "\n$$\n",
    )
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, equation: string) => "$" + equation + "$");
}

// Keep top-level fenced code verbatim, including Python raw strings and
// backslashes that might otherwise be interpreted as LaTeX delimiters.
export function normalizeMathDelimiters(text: string): string {
  const chunks: string[] = [];
  let prose = "";
  let fence: string | null = null;
  for (const line of text.split(/(?<=\n)/)) {
    if (fence !== null) {
      chunks.push(line);
      const closing = /^ {0,3}(`{3,}|~{3,})[ \t]*\r?\n?$/.exec(line)?.[1];
      if (closing && closing[0] === fence[0] && closing.length >= fence.length) {
        fence = null;
      }
      continue;
    }
    const opening = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (opening) {
      chunks.push(normalizeProseMath(prose), line);
      prose = "";
      fence = opening;
    } else {
      prose += line;
    }
  }
  chunks.push(normalizeProseMath(prose));
  return chunks.join("");
}

export const pythonStudioFence = "\n\n```python-run\n\n```\n\n";

export type ChecklistEntry = {
  line: number;
  text: string;
  defaultChecked: boolean;
};

export function extractMarkdownChecklist(text: string): ChecklistEntry[] {
  return text.split("\n").flatMap((line, index) => {
    const match = /^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/.exec(line);
    return match
      ? [
          {
            line: index + 1,
            text: match[2].trim(),
            defaultChecked: match[1].toLowerCase() === "x",
          },
        ]
      : [];
  });
}

export function taskKey(item: ChecklistEntry): string {
  return String(item.line) + ":" + item.text;
}

export const studyNoteTemplate = [
  "## Topic summary",
  "Explain the topic in 2–3 sentences using plain English.",
  "",
  "## Learning outcomes",
  "- [ ] Explain the key concepts in your own words",
  "- [ ] Apply the concepts independently",
  "",
  "## Key definitions",
  "",
  "## Detailed explanation",
  "",
  "## Worked examples and diagrams",
  "",
  "## Real-world application",
  "",
  "## Practice questions",
  "1. ...",
  "",
  "## Answers",
  "1. ...",
  "",
  "## References",
].join("\n");

export function validStudyNote(title: string, markdown: string): boolean {
  return (
    title.trim().length >= 2 &&
    title.trim().length <= 140 &&
    markdown.trim().length >= 1 &&
    markdown.trim().length <= 70000
  );
}
