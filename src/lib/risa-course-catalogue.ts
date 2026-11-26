import type { RisaCourse } from "./risa-course-admin";

export type CatalogueCourse = Pick<
  RisaCourse,
  "id" | "slug" | "code" | "title" | "description" | "level"
> & { thumbnailUrl: string | null };

type SearchableCourse = Pick<CatalogueCourse, "code" | "title" | "description" | "level">;

/** Only filters already-published course metadata passed in by the server. */
export function filterCourseCatalogue<T extends SearchableCourse>(
  courses: readonly T[],
  search: string,
  level: string,
): T[] {
  const query = search.trim().toLocaleLowerCase();
  return courses.filter((course) => {
    if (level !== "all" && course.level !== level) {
      return false;
    }
    return (
      !query ||
      [course.code, course.title, course.description, course.level].some((value) =>
        value.toLocaleLowerCase().includes(query),
      )
    );
  });
}
