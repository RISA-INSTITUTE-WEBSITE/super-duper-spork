import { requestPublicCourseCatalogue, requestStudentBackend } from "./student-auth-api";

export type PolicySummary = {
  slug: string;
  title: string;
  category: string;
  version: string;
  effective_date: string | null;
  is_published: boolean;
  updated_at: string;
};

export type Policy = PolicySummary & { body: string };
export type PolicyInput = Omit<Policy, "updated_at">;

const fields = "slug,title,category,version,effective_date,is_published,updated_at";

export function isPolicySlug(slug: string): boolean {
  return slug.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function validatePolicy(form: FormData): PolicyInput | null {
  const field = (key: string) => String(form.get(key) ?? "").trim();
  const slug = field("slug");
  const title = field("title");
  const category = field("category");
  const version = field("version");
  const body = field("body");
  const date = field("effectiveDate");
  const status = field("status");
  if (date) {
    const parsed = new Date(date + "T00:00:00Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    ) {
      return null;
    }
  }
  if (
    !isPolicySlug(slug) ||
    title.length < 2 ||
    title.length > 160 ||
    category.length < 2 ||
    category.length > 80 ||
    version.length < 1 ||
    version.length > 40 ||
    body.length < 1 ||
    body.length > 50000 ||
    !["draft", "published"].includes(status)
  ) {
    return null;
  }
  return {
    slug,
    title,
    category,
    version,
    body,
    effective_date: date || null,
    is_published: status === "published",
  };
}

async function readRows<T>(response: Response | null): Promise<T[] | null> {
  if (!response?.ok) return null;
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows) ? (rows as T[]) : null;
  } catch {
    return null;
  }
}

export async function listPolicies(token?: string): Promise<PolicySummary[] | null> {
  const path =
    "/rest/v1/risa_policies?select=" + fields + "&order=category.asc,title.asc";
  const response = token
    ? await requestStudentBackend(token, path)
    : await requestPublicCourseCatalogue(path + "&is_published=eq.true");
  return readRows<PolicySummary>(response);
}

export async function getPolicy(
  slug: string,
  token?: string,
): Promise<Policy | null | undefined> {
  if (!isPolicySlug(slug)) return undefined;
  const path =
    "/rest/v1/risa_policies?select=" + fields + ",body&slug=eq." + slug + "&limit=1";
  const response = token
    ? await requestStudentBackend(token, path)
    : await requestPublicCourseCatalogue(path + "&is_published=eq.true");
  const rows = await readRows<Policy>(response);
  return rows === null ? null : rows[0];
}

export async function savePolicy(
  token: string,
  input: PolicyInput,
  editing: boolean,
): Promise<boolean> {
  const path = "/rest/v1/risa_policies" + (editing ? "?slug=eq." + input.slug : "");
  const response = await requestStudentBackend(token, path, {
    method: editing ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ ...input, updated_at: new Date().toISOString() }),
  });
  const rows = await readRows<Policy>(response);
  return rows?.length === 1;
}
