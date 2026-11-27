import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Institution",
  description:
    "Explore RISA's vision, mission and educational philosophy for practical learning in applied sciences.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            RISA Institute of Applied Sciences
          </p>
          <h1 className="risa-display mt-3 text-[2.6rem] font-bold tracking-tight text-[#0A0F1D] sm:text-[3.5rem]">
            About the Institution
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
            RISA Institute of Applied Sciences focuses on clear scientific foundations
            and practical application.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="vision-mission-heading"
        className="bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            RISA — Vision and Mission
          </p>
          <h2
            id="vision-mission-heading"
            className="risa-display mt-3 text-[2.6rem] font-bold tracking-tight text-[#0A0F1D] sm:text-[3.5rem]"
          >
            Our Vision and Mission
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="risa-glass-card relative isolate overflow-hidden rounded-[1.6rem] p-7 sm:p-8">
              <span className="inline-flex size-12 items-center justify-center rounded-xl border border-white/90 bg-white/75 text-sm font-bold text-[#155DFC] shadow-sm">
                01
              </span>
              <h3 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">
                Our Vision
              </h3>
              <p className="mt-4 leading-8 text-slate-600">
                To become a globally recognized centre of excellence in applied sciences
                education, where theoretical knowledge meets practical experience,
                empowering individuals to think critically, innovate confidently, and
                develop sustainable solutions to real-world challenges.
              </p>
            </article>
            <article className="risa-glass-card relative isolate overflow-hidden rounded-[1.6rem] p-7 sm:p-8">
              <span className="inline-flex size-12 items-center justify-center rounded-xl border border-white/90 bg-white/75 text-sm font-bold text-[#155DFC] shadow-sm">
                02
              </span>
              <h3 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">
                Our Mission
              </h3>
              <p className="mt-4 leading-8 text-slate-600">
                To make scientific and technical education accessible, practical,
                rigorous, and relevant by integrating foundational knowledge with hands-on
                experimentation, engineering applications, research, and real-world
                problem-solving.
              </p>
              <p className="mt-4 leading-8 text-slate-600">
                RISA is committed to developing competent, creative, and independent
                learners who can understand scientific principles, apply their knowledge,
                design and test solutions, and contribute meaningfully to technological
                advancement and societal development.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="philosophy-heading"
        className="risa-pathways-section py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Our Educational Philosophy
          </p>
          <h2
            id="philosophy-heading"
            className="risa-display mt-3 max-w-4xl text-[2.6rem] font-bold tracking-tight text-[#0A0F1D] sm:text-[3.5rem]"
          >
            Learn it. Understand it. Apply it. Test it. Improve it.
          </h2>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
            At RISA, education goes beyond memorizing theories and passing examinations.
            We believe that meaningful learning emerges when students actively engage with
            concepts, investigate problems, experiment with solutions, and demonstrate
            what they have learned through practical work.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="risa-glass-card rounded-[1.6rem] p-7 sm:p-8">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">Theory</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Theory provides the foundation.
              </p>
            </article>
            <article className="risa-glass-card rounded-[1.6rem] p-7 sm:p-8">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                Practical Experience
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Practical experience develops competence.
              </p>
            </article>
            <article className="risa-glass-card rounded-[1.6rem] p-7 sm:p-8">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                Innovation
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Innovation transforms knowledge into impact.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
