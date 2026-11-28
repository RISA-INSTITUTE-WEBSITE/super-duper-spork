"use server";

import { requireAdminSession } from "@/lib/risa-staff-session";
import {
  executeLinux,
  sandboxConfig,
  sessionDuration,
  signLinuxSession,
  startLinux,
  stopLinux,
  verifyLinuxSession,
} from "@/lib/risa-linux-sandbox";

export async function startLinuxSession() {
  const { identity } = await requireAdminSession();
  const config = sandboxConfig();
  if (!config) {
    return {
      error:
        "Linux runtime is not configured. Enable Vercel OIDC and set RISA_LINUX_SESSION_SECRET.",
    };
  }
  try {
    const id = await startLinux(config);
    return {
      session: signLinuxSession(
        { id, user: identity.id, expires: Date.now() + sessionDuration },
        config.secret,
      ),
    };
  } catch {
    return {
      error: "Unable to start the Linux sandbox. Check Vercel Sandbox access and limits.",
    };
  }
}

export async function runLinuxCommand(session: string, command: string) {
  const { identity } = await requireAdminSession();
  const config = sandboxConfig();
  if (!config) {
    return { error: "Linux runtime is not configured." };
  }
  if (
    typeof session !== "string" ||
    typeof command !== "string" ||
    command.length > 4000
  ) {
    return { error: "Invalid command or session." };
  }
  const id = verifyLinuxSession(session, identity.id, config.secret);
  if (!id) {
    return { error: "Session expired or invalid. Start a new Linux session." };
  }
  try {
    return await executeLinux(config, id, command);
  } catch {
    return { error: "Command failed or session expired. Restart the session if needed." };
  }
}

export async function endLinuxSession(session: string) {
  const { identity } = await requireAdminSession();
  const config = sandboxConfig();
  if (!config || typeof session !== "string") {
    return { error: "Invalid session." };
  }
  const id = verifyLinuxSession(session, identity.id, config.secret);
  if (!id) {
    return { error: "Session expired or invalid." };
  }
  try {
    await stopLinux(config, id);
    return { stopped: true };
  } catch {
    return { error: "Could not confirm shutdown. The sandbox expires automatically." };
  }
}
