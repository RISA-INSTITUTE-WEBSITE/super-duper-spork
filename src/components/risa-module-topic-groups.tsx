import { RisaTopicCard } from "@/components/risa-topic-card";
import type { CoursePreviewCurriculum } from "@/lib/risa-course-curriculum";
import { groupModuleTopics } from "@/lib/risa-module-outline";

export function ModuleTopicGroups({
  curriculum,
  locked = false,
  onSelect,
}: {
  curriculum: CoursePreviewCurriculum & { quizzes?: { topic_id: string }[] };
  locked?: boolean;
  onSelect: (id: string, title: string) => void;
}) {
  const groups = groupModuleTopics(curriculum.sections ?? [], curriculum.topics);
  if (!groups.length) {
    return (
      <p className="risa-glass-card mt-7 rounded-2xl p-7 text-sm text-slate-600">
        RISA has not published any topics for this module yet.
      </p>
    );
  }

  return (
    <div className="mt-7 space-y-7">
      {groups.map((group) => (
        <section
          key={group.id}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white/70 p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-heading text-xl font-bold text-slate-950">
              {group.title}
            </h3>
            <span className="text-xs font-semibold text-[#286518]">
              {group.topics.length} {group.topics.length === 1 ? "topic" : "topics"}
            </span>
          </div>
          {group.topics.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              Planned section — topics coming soon.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {group.topics.map((topic, index) => (
                <RisaTopicCard
                  key={topic.id}
                  topic={topic}
                  order={index + 1}
                  videos={curriculum.videos.filter(
                    (video) => video.topic_id === topic.id,
                  )}
                  quizCount={
                    curriculum.quizzes?.filter((quiz) => quiz.topic_id === topic.id)
                      .length
                  }
                  locked={locked}
                  onSelect={() => onSelect(topic.id, topic.title)}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
