import { describe, expect, it } from "vitest";

import { highlightPython } from "@/lib/risa-python-highlight";

describe("Python syntax highlighting", () => {
  it("distinguishes keywords, calls, variables, numbers and nested brackets", () => {
    const tokens = highlightPython("def square(x):\n    return print([x ** 2])");
    expect(tokens).toContainEqual({ kind: "keyword", text: "def" });
    expect(tokens).toContainEqual({ kind: "keyword", text: "return" });
    expect(tokens).toContainEqual({ kind: "function", text: "square" });
    expect(tokens).toContainEqual({ kind: "function", text: "print" });
    expect(tokens).toContainEqual({ kind: "variable", text: "x" });
    expect(tokens).toContainEqual({ kind: "number", text: "2" });
    expect(tokens).toContainEqual({ kind: "bracket-0", text: "(" });
    expect(tokens).toContainEqual({ kind: "bracket-1", text: "[" });
    expect(tokens).toContainEqual({ kind: "bracket-1", text: "]" });
  });

  it("does not interpret comments or bracket characters inside strings", () => {
    const source = 'message = f"# hello ({name})"\n# print("test")';
    const tokens = highlightPython(source);
    expect(tokens).toContainEqual({ kind: "string", text: 'f"# hello ({name})"' });
    expect(tokens).toContainEqual({ kind: "comment", text: '# print("test")' });
    expect(tokens.some((token) => token.kind.startsWith("bracket"))).toBe(false);
  });

  it("handles escaped strings, triple quotes and incomplete typing without losing text", () => {
    for (const source of [
      "x = 'it\\'s fine'\n",
      '"""multi\n# line"""',
      'x = "unfinished\nprint(1)',
      'x = """unfinished',
      "x = '\\",
      "变量 = 0xFF + 1.2e-3j",
      "([{}])]",
      "🙂\t\n",
      "",
    ]) {
      expect(highlightPython(source).map((token) => token.text).join("")).toBe(source);
    }
    expect(highlightPython('"""multi\n# line"""')).toEqual([
      { kind: "string", text: '"""multi\n# line"""' },
    ]);
    expect(highlightPython("x = 'unterminated\nprint(1)")).toContainEqual({
      kind: "function",
      text: "print",
    });
  });
});
