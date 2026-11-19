/**
 * Server-only gateway for Supabase Auth's documented REST endpoints.
 * No service-role key or password is ever sent to the browser.
 * Student records are managed by Supabase Auth (no public profile tables).
 */

type AuthConfig = { url: string; publishableKey: string };

export type StudentSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type StudentIdentity = {
  id: string;
  email: string;
  fullName: string;
};

function getAuthConfig(): AuthConfig | null {
  const rawUrl = process.env.RISA_SUPABASE_URL;
  const publishableKey = process.env.RISA_SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !publishableKey || !publishableKey.trim()) return null;

  try {
    const url = new URL(rawUrl);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      (url.protocol === "http:" && !["localhost", "127.0.0.1"].includes(url.hostname)) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    // An Auth publishable key is not an admin key.
    if (publishableKey.startsWith("sb_secret_")) return null;

    return { url: url.origin, publishableKey };
  } catch {
    return null;
  }
}

export function isStudentAuthConfigured(): boolean {
  return getAuthConfig() !== null;
}

async function requestAuth(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
  bearer?: string,
): Promise<Response | null> {
  const config = getAuthConfig();
  if (!config) return null;

  try {
    return await fetch(config.url + "/auth/v1" + path, {
      method,
      headers: {
        apikey: config.publishableKey,
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: "Bearer " + bearer } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    return null;
  }
}

function readSession(value: unknown): StudentSession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Partial<StudentSession>;
  if (
    typeof session.access_token !== "string" ||
    !session.access_token ||
    typeof session.refresh_token !== "string" ||
    !session.refresh_token ||
    typeof session.expires_in !== "number" ||
    !Number.isFinite(session.expires_in) ||
    session.expires_in <= 0
  ) {
    return null;
  }

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
  };
}

async function parseSession(response: Response | null): Promise<StudentSession | null> {
  if (!response?.ok) return null;
  try {
    return readSession(await response.json());
  } catch {
    return null;
  }
}

export async function registerStudentWithAuth(
  fullName: string,
  email: string,
  password: string,
): Promise<boolean> {
  const response = await requestAuth("/signup", "POST", {
    email,
    password,
    data: { full_name: fullName, account_type: "student" },
  });
  return response?.ok ?? false;
}

export async function signInStudentWithAuth(
  email: string,
  password: string,
): Promise<StudentSession | null> {
  const response = await requestAuth("/token?grant_type=password", "POST", {
    email,
    password,
  });
  return parseSession(response);
}

export async function refreshStudentSession(
  refreshToken: string,
): Promise<StudentSession | null> {
  const response = await requestAuth("/token?grant_type=refresh_token", "POST", {
    refresh_token: refreshToken,
  });
  return parseSession(response);
}

export async function verifyStudentEmail(
  tokenHash: string,
): Promise<StudentSession | null> {
  const response = await requestAuth("/verify", "POST", {
    token_hash: tokenHash,
    type: "email",
  });
  return parseSession(response);
}

export async function getStudentIdentity(
  accessToken: string,
): Promise<StudentIdentity | null> {
  const response = await requestAuth("/user", "GET", undefined, accessToken);
  if (!response?.ok) return null;

  try {
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return null;
    const user = data as {
      id?: unknown;
      email?: unknown;
      email_confirmed_at?: unknown;
      user_metadata?: unknown;
    };
    if (
      typeof user.id !== "string" ||
      typeof user.email !== "string" ||
      typeof user.email_confirmed_at !== "string"
    ) {
      return null;
    }

    const metadata =
      user.user_metadata && typeof user.user_metadata === "object"
        ? (user.user_metadata as { full_name?: unknown })
        : {};
    const name = typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";

    return {
      id: user.id,
      email: user.email,
      fullName: name.slice(0, 80) || "Student",
    };
  } catch {
    return null;
  }
}

export async function revokeStudentSession(accessToken: string): Promise<void> {
  await requestAuth("/logout", "POST", undefined, accessToken);
}
