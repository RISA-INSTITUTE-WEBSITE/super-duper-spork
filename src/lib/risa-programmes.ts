import type { RisaCourse } from "./risa-course-admin";
import { requestPublicCourseCatalogue, requestStudentBackend } from "./student-auth-api";

export type RisaProgramme = {
  slug: string;
  title: string;
  description: string;
  is_published: boolean;
};

export function isProgrammeSlug(value: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) && value.length <= 100;
}

export function parseProgramme(value: unknown): RisaProgramme | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Partial<RisaProgramme>;
  if (
    typeof row.slug !== "string" ||
    !isProgrammeSlug(row.slug) ||
    typeof row.title !== "string" ||
    typeof row.description !== "string" ||
    typeof row.is_published !== "boolean"
  ) {
    return null;
  }
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    is_published: row.is_published,
  };
}

export async function getRisaProgrammes(token?: string): Promise<RisaProgramme[] | null> {
  const path =
    "/rest/v1/risa_programmes?select=slug,title,description,is_published&order=title.asc";
  const response = token
    ? await requestStudentBackend(token, path)
    : await requestPublicCourseCatalogue(path + "&is_published=eq.true");
  if (!response?.ok) {
    return null;
  }
  try {
    const rows: unknown = await response.json();
    return Array.isArray(rows)
      ? rows.flatMap((row) => {
          const programme = parseProgramme(row);
          return programme ? [programme] : [];
        })
      : null;
  } catch {
    return null;
  }
}

export function modulesForProgramme<T extends Pick<RisaCourse, "programme_slug" | "code">>(
  modules: readonly T[],
  slug: string,
): T[] {
  return modules
    .filter((module) => module.programme_slug === slug)
    .sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
}

export async function createRisaProgramme(
  token: string,
  input: RisaProgramme,
): Promise<boolean> {
  const programme = parseProgramme(input);
  if (
    !programme ||
    programme.title.length < 2 ||
    programme.title.length > 120 ||
    programme.description.length > 1200
  ) {
    return false;
  }
  const response = await requestStudentBackend(token, "/rest/v1/risa_programmes", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(programme),
  });
  return response?.ok ?? false;
}
