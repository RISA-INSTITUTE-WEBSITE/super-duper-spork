import { describe, expect, it } from "vitest";

import { isWorkspaceActivity, runWorkspace, workspaceActivities } from "@/lib/risa-workspace";

describe("restricted practical workspace", () => {
  it("runs all four starter exercises", () => {
    for (const item of workspaceActivities) {
      expect(runWorkspace(item.id, item.starter)).toContain(item.expected);
      expect(isWorkspaceActivity(item.id)).toBe(true);
    }
    expect(isWorkspaceActivity("other")).toBe(false);
  });

  it("interprets bounded arithmetic without executing source", () => {
    expect(runWorkspace("programming", "print(7 * 3)")).toBe("21");
    expect(runWorkspace("programming", "print(2 + 3)")).toBe("5");
    expect(runWorkspace("programming", "print(2 - 3)")).toBe("-1");
    expect(runWorkspace("physics", "12 / 4")).toBe("3");
    expect(runWorkspace("physics", "1 / 0")).toContain("Undefined");
    expect(runWorkspace("physics", "abc")).toContain("Enter two numbers");
    expect(runWorkspace("programming", "import os")).toContain("Supported syntax");
    expect(runWorkspace("programming", "x".repeat(2001))).toContain("exceeds");
  });

  it("uses fictional files and rejects unsupported commands", () => {
    expect(runWorkspace("linux", "pwd\n\nls exercises\ncat exercises/task.txt\nhelp")).toContain("task.txt");
    expect(runWorkspace("linux", "cat /etc/passwd")).toContain("not supported");
    expect(runWorkspace("linux", "constructor")).toContain("not supported");
  });

  it("filters only fictional data", () => {
    expect(runWorkspace("sql", "SELECT * FROM students;")).toContain("3 rows");
    expect(runWorkspace("sql", "SELECT * FROM students WHERE score >= 90;")).toContain("Cleo | 94");
    expect(runWorkspace("sql", "SELECT * FROM students WHERE score >= 100;")).toContain("0 rows");
    expect(runWorkspace("sql", "DROP TABLE students")).toContain("Supported:");
  });
});
