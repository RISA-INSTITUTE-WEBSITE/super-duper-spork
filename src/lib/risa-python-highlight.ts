export type PythonTokenKind =
  | "plain"
  | "keyword"
  | "comment"
  | "string"
  | "number"
  | "function"
  | "variable"
  | "bracket-0"
  | "bracket-1"
  | "bracket-2"
  | "operator";

export type PythonToken = { kind: PythonTokenKind; text: string };

const keywords = new Set(
  "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(
    " ",
  ),
);

// A bounded lexical highlighter, not a parser or interpreter. String bodies
// are scanned separately so comments and brackets inside literals stay intact.
const tokenPattern =
  /(?<comment>#[^\r\n]*)|(?<quote>(?:[rRuUbBfFtT]|[rR][fFbBtT]|[fFbBtT][rR])?(?:"""|'''|"|'))|(?<number>0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?[\d_]+)?[jJ]?)|(?<name>[_\p{ID_Start}][_\p{ID_Continue}]*)|(?<bracket>[()[\]{}])|(?<operator>[+\-*/%<>=!&|^~@:,.;]+)|(?<space>\s+)|[\s\S]/gu;

function quoteEnd(source: string, start: number, opening: string): number {
  const delimiter = opening.match(/(?:"""|'''|"|')$/)?.[0] ?? '"';
  let end = start + opening.length;
  while (end < source.length) {
    if (source[end] === "\\") {
      end = Math.min(end + 2, source.length);
      continue;
    }
    if (source.startsWith(delimiter, end)) {
      return end + delimiter.length;
    }
    if (delimiter.length === 1 && /[\r\n]/.test(source[end])) {
      return end;
    }
    end++;
  }
  return end;
}

function bracketKind(text: string, stack: string[]): PythonTokenKind {
  const closing = { ")": "(", "]": "[", "}": "{" } as Record<string, string>;
  let depth = stack.length;
  if (Object.hasOwn(closing, text)) {
    if (stack.at(-1) === closing[text]) {
      stack.pop();
    }
    depth = stack.length;
  } else {
    stack.push(text);
  }
  return (["bracket-0", "bracket-1", "bracket-2"] as const)[depth % 3];
}

function nameKind(text: string, following: string): PythonTokenKind {
  if (keywords.has(text)) {
    return "keyword";
  }
  // Declarations and calls share the function colour; other identifiers use
  // the variable colour. This does not attempt semantic type inference.
  return /^[ \t]*\(/.test(following) ? "function" : "variable";
}

function classify(
  match: RegExpExecArray,
  source: string,
  stack: string[],
): PythonTokenKind {
  const groups = match.groups ?? {};
  if (groups.comment) {
    return "comment";
  }
  if (groups.quote) {
    return "string";
  }
  if (groups.number) {
    return "number";
  }
  if (groups.name) {
    return nameKind(match[0], source.slice(match.index + match[0].length));
  }
  if (groups.bracket) {
    return bracketKind(match[0], stack);
  }
  return groups.operator ? "operator" : "plain";
}

export function highlightPython(source: string): PythonToken[] {
  const scanner = new RegExp(tokenPattern);
  const tokens: PythonToken[] = [];
  const stack: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = scanner.exec(source))) {
    const kind = classify(match, source, stack);
    if (kind === "string") {
      scanner.lastIndex = quoteEnd(source, match.index, match[0]);
    }
    tokens.push({ kind, text: source.slice(match.index, scanner.lastIndex) });
  }
  return tokens;
}
