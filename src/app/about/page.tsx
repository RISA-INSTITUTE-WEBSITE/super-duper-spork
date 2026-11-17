import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl flex-1 px-5 py-14 sm:px-8"
    >
      <p className="font-semibold uppercase tracking-widest text-blue-800">About RISA</p>
      <h1 className="mt-3 text-4xl font-bold">Learning through application</h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-700">
        RISA Institute of Applied Sciences is developing an educational website focused on
        clear scientific foundations and practical application.
      </p>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-2xl font-semibold">Our planned learning approach</h2>
        <p className="mt-4 leading-relaxed text-slate-600">
          We aim to connect fundamental principles with engineering examples, accessible
          tools, structured lessons and hands-on activities. The website and programme
          details are currently under development.
        </p>
      </div>
    </main>
  );
}
