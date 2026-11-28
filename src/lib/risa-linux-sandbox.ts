import { createHmac, timingSafeEqual } from "node:crypto";

export const sessionDuration = 300_000;

export function signLinuxSession(
  id: string,
  user: string,
  secret: string,
  expires: number,
): string {
  const payload = Buffer.from(JSON.stringify({ id, user, expires })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return payload + "." + signature;
}

export function verifyLinuxSession(
  value: string,
  user: string,
  secret: string,
): string | null {
  if (value.length > 1024) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  try {
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return null;
    }
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      data.user !== user ||
      !Number.isFinite(data.expires) ||
      data.expires <= Date.now() ||
      typeof data.id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(data.id)
    ) {
      return null;
    }
    return data.id;
  } catch {
    return null;
  }
}

export function sandboxConfig() {
  const token = process.env.VERCEL_OIDC_TOKEN;
  const secret = process.env.RISA_LINUX_SESSION_SECRET;
  if (!token || !secret || secret.length < 32) return null;
  try {
    const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    if (typeof claims.owner_id !== "string" || typeof claims.project_id !== "string") {
      return null;
    }
    return { token, secret, team: claims.owner_id, project: claims.project_id };
  } catch {
    return null;
  }
}

type Config = NonNullable<ReturnType<typeof sandboxConfig>>;

async function request(config: Config, path: string, body: object) {
  const url = new URL(path, "https://api.vercel.com");
  url.searchParams.set("teamId", config.team);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + config.token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error("Sandbox request failed (" + response.status + ").");
  }
  return response;
}

export async function startLinux(config: Config): Promise<string> {
  const response = await request(config, "/v3/sandboxes", {
    projectId: config.project,
    image: "vercel/sandbox/universal",
    resources: { vcpus: 1 },
    timeout: sessionDuration,
    persistent: false,
    networkPolicy: { mode: "deny-all" },
    ports: [],
  });
  const data = await response.json();
  if (typeof data.session?.id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(data.session.id)) {
    throw new Error("Invalid sandbox response.");
  }
  return data.session.id;
}

export async function stopLinux(config: Config, id: string) {
  const response = await request(config, "/v2/sandboxes/sessions/" + id + "/stop", {});
  await response.body?.cancel();
}

// This script runs only inside the disposable microVM, never in Next.js.
// A separate Bash process handles each line; the guest filesystem and cwd survive.
const shell = [
  'state=/tmp/risa-linux-cwd',
  'if [ -r "$state" ]; then IFS= read -r previous < "$state"; cd -- "$previous" || cd /vercel/sandbox; fi',
  'trap \'pwd -P > "$state"\' EXIT',
  'eval "$1"',
].join("\n");

export async function executeLinux(config: Config, id: string, command: string) {
  const response = await request(config, "/v2/sandboxes/sessions/" + id + "/cmd", {
    command: "bash",
    args: ["-c", shell, "risa-terminal", command],
    cwd: "/vercel/sandbox",
    env: { TERM: "dumb" },
    sudo: false,
    wait: true,
    logs: true,
    timeout: 10_000,
  });
  if (!response.body) throw new Error("No command response.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let output = "";
  let exitCode: number | null = null;
  let truncated = false;
  function line(value: string) {
    if (!value.trim()) return;
    const entry = JSON.parse(value);
    if (entry.stream === "error") throw new Error("Sandbox command failed.");
    if (
      (entry.stream === "stdout" || entry.stream === "stderr") &&
      typeof entry.data === "string"
    ) {
      const remaining = 24_000 - output.length;
      output += entry.data.slice(0, Math.max(0, remaining));
      if (entry.data.length > remaining) truncated = true;
    }
    if (typeof entry.command?.exitCode === "number") exitCode = entry.command.exitCode;
  }
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      pending += decoder.decode(chunk.value, { stream: true });
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const value of lines) line(value);
      if (pending.length > 256_000) throw new Error("Command output exceeded limit.");
    }
    line(pending + decoder.decode());
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  if (exitCode === null) throw new Error("Command did not report an exit status.");
  return { output: output + (truncated ? "\n[Output truncated]" : ""), exitCode };
}
