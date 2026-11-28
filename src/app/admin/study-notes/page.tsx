import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { RisaStudyNotesStudio } from "@/components/risa-study-notes-studio";
import { RisaStudioNavigation, RisaStudioSelect } from "@/components/risa-studio-navigation";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { getRisaAdminCourses, type RisaCourse } from "@/lib/risa-course-admin";
import { getStructuredCurriculum, groupModuleTopics } from "@/lib/risa-module-sections";
import {
  getRisaProgrammes,
  modulesForProgramme,
  type RisaProgramme,
} from "@/lib/risa-programmes";
import { getTopicStudyNotes } from "@/lib/risa-study-notes";
import { getStudentIdentity } from "@/lib/student-auth-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Study Notes Studio | RISA",
  robots: { index: false, follow: false },
};

async function requireAdministrator(): Promise<string> {
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity || !(await isRisaAdministrator(token, identity.id))) {
    notFound();
  }
  return token;
}

function ModuleSelector({
  programmes,
  modules,
  selected,
}: {
  programmes: RisaProgramme[];
  modules: RisaCourse[];
  selected?: RisaCourse;
}) {
  const unassigned = modules.filter(
    (module) => !programmes.some((programme) => programme.slug === module.programme_slug),
  );
  return (
    <div className="min-w-0 space-y-3">
      <label className="block text-sm font-bold">
        Course / Module
        <RisaStudioSelect name="module" value={selected?.id ?? ""}>
          <option value="">Select a module</option>
          {programmes.map((programme) => (
            <optgroup key={programme.slug} label={programme.title}>
              {modulesForProgramme(modules, programme.slug).map((module) => (
                <option key={module.id} value={module.id}>
                  {module.code} · {module.title}
                </option>
              ))}
            </optgroup>
          ))}
          {unassigned.length > 0 && (
            <optgroup label="Unassigned modules">
              {unassigned.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.code} · {module.title}
                </option>
              ))}
            </optgroup>
          )}
        </RisaStudioSelect>
      </label>
    </div>
  );
}

function TopicSelector({
  selected,
  curriculum,
  topicId,
}: {
  selected?: RisaCourse;
  curriculum: Awaited<ReturnType<typeof getStructuredCurriculum>>;
  topicId?: string;
}) {
  const { sections, topics } = curriculum ?? { sections: [], topics: [] };
  const groups = groupModuleTopics(sections, topics);
  const canOpen = topics.length > 0;
  return (
    <div className="min-w-0 space-y-3">
      <label className="block text-sm font-bold">
        Section / Topic
        <RisaStudioSelect
          name="topic"
          value={topicId ?? ""}
          moduleId={selected?.id}
          disabled={!canOpen}
        >
          <option value="">Select a topic</option>
          {groups.map((group) => (
            <optgroup key={group.id} label={group.title}>
              {group.topics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                  {item.is_published ? "" : " (Draft)"}
                </option>
              ))}
            </optgroup>
          ))}
        </RisaStudioSelect>
      </label>
      {selected && curriculum && !curriculum.topics.length && (
        <p className="text-sm text-slate-600">
          No topics yet.{" "}
          <Link
            href={"/admin/courses/" + selected.id + "/content"}
            className="font-bold text-[#286518] hover:underline"
          >
            Create a topic
          </Link>
        </p>
      )}
    </div>
  );
}

function WorkspaceSelection({
  programmes,
  modules,
  selected,
  curriculum,
  topicId,
}: {
  programmes: RisaProgramme[] | null;
  modules: RisaCourse[] | null;
  selected?: RisaCourse;
  curriculum: Awaited<ReturnType<typeof getStructuredCurriculum>>;
  topicId?: string;
}) {
  if (!programmes || !modules) {
    return (
      <p role="status" className="mt-5 text-slate-600">
        Curriculum information is temporarily unavailable.
      </p>
    );
  }
  return (
    <section className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
      <ModuleSelector programmes={programmes} modules={modules} selected={selected} />
      <TopicSelector selected={selected} curriculum={curriculum} topicId={topicId} />
      {selected && !curriculum && (
        <p role="status" className="md:col-span-2">
          Topics are temporarily unavailable.
        </p>
      )}
    </section>
  );
}

export default async function AdminStudyNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; topic?: string }>;
}) {
  const token = await requireAdministrator();
  const query = await searchParams;
  const [programmes, modules] = await Promise.all([
    getRisaProgrammes(token),
    getRisaAdminCourses(token),
  ]);
  const selected = modules?.find((module) => module.id === query.module);
  const curriculum = selected
    ? await getStructuredCurriculum(token, selected.id, true)
    : null;
  const topic = curriculum?.topics.find((item) => item.id === query.topic);
  const notes = topic ? await getTopicStudyNotes(token, topic.id, true) : null;
  const target =
    selected && topic && notes
      ? { courseId: selected.id, topicId: topic.id, notes }
      : { courseId: "", topicId: "", notes: [] };

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8"
    >
      <Link href="/admin" className="font-bold text-[#286518] hover:underline">
        ← Administration Centre
      </Link>
      <h1 className="mt-5 text-3xl font-bold sm:text-4xl">Study Notes Studio</h1>
      <RisaStudioNavigation>
        <WorkspaceSelection
          programmes={programmes}
          modules={modules}
          selected={selected}
          curriculum={curriculum}
          topicId={topic?.id}
        />
        <RisaStudyNotesStudio key={target.topicId} {...target} embedded />
        {topic && !notes && <p role="status">Study notes are temporarily unavailable.</p>}
      </RisaStudioNavigation>
    </main>
  );
}
