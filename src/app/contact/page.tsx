import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-5 py-14 sm:px-8">
      <p className="font-semibold uppercase tracking-widest text-blue-800">Contact</p>
      <h1 className="mt-3 text-4xl font-bold">Get in touch</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
        Official contact information will be published here after it has been
        confirmed by the RISA team. No contact form or student applications
        are active yet.
      </p>
    </main>
  );
}
