/**
 * Server-only gateway for Supabase Auth's documented REST endpoints.
 * No service-role key is used, and credentials are sent to Auth only server-side.
 * Student records are managed by Supabase Auth (no public profile tables).
 */

type AuthConfig = { url: string; publishableKey: string };

export type StudentSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type StudentRegistrationResult =
  | { status: "failed" }
  | { status: "confirmation_required" }
  | { status: "signed_in"; session: StudentSession };

export type StudentIdentity = {
  id: string;
  email: string;
  fullName: string;
  avatarPath: string | null;
  updatedAt?: string;
};

function resolveAuthOrigin(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const validProtocol =
      url.protocol === "https:" ||
      (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
    const validLocation =
      !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash;
    return validProtocol && validLocation ? url.origin : null;
  } catch {
    return null;
  }
}

function getAuthConfig(): AuthConfig | null {
  const rawUrl = process.env.RISA_SUPABASE_URL;
  const publishableKey = process.env.RISA_SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !publishableKey?.trim()) {
    return null;
  }

  const origin = resolveAuthOrigin(rawUrl);
  if (!origin || publishableKey.startsWith("sb_secret_")) {
    return null;
  }

  return { url: origin, publishableKey };
}

export function isStudentAuthConfigured(): boolean {
  // Student registration is active whenever the RISA Supabase connection is
  // configured. The legacy deployment feature flag is no longer required.
  // Missing or unsafe credentials still disable all student auth actions.
  return getAuthConfig() !== null;
}

type AuthRequestOptions = {
  path: string;
  method: "GET" | "POST" | "PUT";
  body?: Record<string, unknown>;
  bearer?: string;
};

async function requestAuth({
  path,
  method,
  body,
  bearer,
}: AuthRequestOptions): Promise<Response | null> {
  const config = getAuthConfig();
  if (!config) {
    return null;
  }

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
  if (!value || typeof value !== "object") {
    return null;
  }
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
  if (!response?.ok) {
    return null;
  }
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
): Promise<StudentRegistrationResult> {
  const response = await requestAuth({
    path: "/signup",
    method: "POST",
    body: {
      email,
      password,
      data: { full_name: fullName, account_type: "student" },
    },
  });

  if (!response?.ok) {
    return { status: "failed" };
  }

  try {
    // Supabase returns a session immediately when email confirmation is disabled.
    // With confirmations enabled it accepts signup without issuing a session.
    const session = readSession(await response.json());
    return session
      ? { status: "signed_in", session }
      : { status: "confirmation_required" };
  } catch {
    return { status: "failed" };
  }
}

export async function signInStudentWithAuth(
  email: string,
  password: string,
): Promise<StudentSession | null> {
  const response = await requestAuth({
    path: "/token?grant_type=password",
    method: "POST",
    body: {
      email,
      password,
    },
  });
  return parseSession(response);
}

export async function refreshStudentSession(
  refreshToken: string,
): Promise<StudentSession | null> {
  const response = await requestAuth({
    path: "/token?grant_type=refresh_token",
    method: "POST",
    body: {
      refresh_token: refreshToken,
    },
  });
  return parseSession(response);
}

export async function verifyStudentEmail(
  tokenHash: string,
): Promise<StudentSession | null> {
  const response = await requestAuth({
    path: "/verify",
    method: "POST",
    body: {
      token_hash: tokenHash,
      type: "email",
    },
  });
  return parseSession(response);
}

function validatedAvatarPath(userId: string, path: unknown): string | null {
  if (typeof path !== "string") {
    return null;
  }
  const accepted = ["avatar.jpg", "avatar.png", "avatar.webp"].some(
    (file) => path === userId + "/" + file,
  );
  return accepted ? path : null;
}

function optionalProfileUpdateDate(value: unknown): { updatedAt?: string } {
  return typeof value === "string" ? { updatedAt: value } : {};
}

function parseStudentIdentity(data: unknown): StudentIdentity | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const user = data as {
    id?: unknown;
    email?: unknown;
    email_confirmed_at?: unknown;
    updated_at?: unknown;
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
      ? (user.user_metadata as { full_name?: unknown; avatar_path?: unknown })
      : {};
  const name = typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  // Profile metadata is user-editable, never an authorization credential.
  const avatarPath = validatedAvatarPath(user.id, metadata.avatar_path);

  return {
    id: user.id,
    email: user.email,
    fullName: name.slice(0, 80) || "Student",
    avatarPath,
    ...optionalProfileUpdateDate(user.updated_at),
  };
}

export async function getStudentIdentity(
  accessToken: string,
): Promise<StudentIdentity | null> {
  const response = await requestAuth({
    path: "/user",
    method: "GET",
    bearer: accessToken,
  });
  if (!response?.ok) {
    return null;
  }

  try {
    return parseStudentIdentity(await response.json());
  } catch {
    return null;
  }
}

export async function revokeStudentSession(accessToken: string): Promise<void> {
  await requestAuth({ path: "/logout", method: "POST", bearer: accessToken });
}

/**
 * Server-side Supabase Data API / Storage access. Forward the learner's real
 * access token so RLS remains effective; never use an administrative secret.
 */
export async function requestStudentBackend(
  accessToken: string,
  path: string,
  options: RequestInit = {},
): Promise<Response | null> {
  const config = getAuthConfig();
  if (!config || !accessToken || !/^\/(rest|storage)\/v1\//.test(path)) {
    return null;
  }

  try {
    return await fetch(config.url + path, {
      ...options,
      headers: {
        apikey: config.publishableKey,
        Authorization: "Bearer " + accessToken,
        ...(options.headers ?? {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    return null;
  }
}

/** Update learner-owned display metadata (never used for authorization). */
export async function updateStudentAuthMetadata(
  accessToken: string,
  fullName: string,
  avatarPath?: string,
): Promise<boolean> {
  const response = await requestAuth({
    path: "/user",
    method: "PUT",
    bearer: accessToken,
    body: {
      data: {
        full_name: fullName,
        ...(avatarPath ? { avatar_path: avatarPath } : {}),
      },
    },
  });
  return response?.ok === true;
}

/** Anonymous access is limited by Supabase RLS to published catalogue rows. */
export async function requestPublicCourseCatalogue(
  path: string,
): Promise<Response | null> {
  const config = getAuthConfig();
  const allowed =
    path.startsWith("/rest/v1/risa_courses?") ||
    path.startsWith("/rest/v1/risa_programmes?");
  if (!config || !allowed) {
    return null;
  }
  try {
    return await fetch(config.url + path, {
      headers: { apikey: config.publishableKey },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    return null;
  }
}
