import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function installHook() {
  const root = git(["rev-parse", "--show-toplevel"]);
  const source = resolve(root, ".githooks/pre-commit");
  const destination = resolve(
    root,
    git(["rev-parse", "--git-path", "hooks/pre-commit"]),
  );
  const content = readFileSync(source, "utf8").replace(/\r\n/g, "\n");
  if (existsSync(destination)) {
    const existing = readFileSync(destination, "utf8");
    if (!existing.includes("# Installed by npm run hooks:install.")) {
      throw new Error("An existing pre-commit hook was found. Integrate it manually.");
    }
  }
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content, { mode: 0o755 });
  chmodSync(destination, 0o755);
  process.stdout.write("RISA pre-commit formatting and lint hook installed.\n");
}

installHook();
