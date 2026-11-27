import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminSession } from "@/lib/risa-staff-session";
import {
  getPolicy,
  listPolicies,
  type Policy,
  type PolicySummary,
} from "@/lib/risa-policies";
import { savePolicyAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Manage policies | RISA",
  robots: { index: false, follow: false },
};

const fieldClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-3";

function PolicyNotice({ result }: { result?: string }) {
  return (
    <>
      {result === "saved" && (
        <p role="status" className="mt-4">
          Policy saved.
        </p>
      )}
      {result === "invalid" && (
        <p role="alert" className="mt-4">
          Check the required policy fields and try again.
        </p>
      )}
      {result === "failed" && (
        <p role="alert" className="mt-4">
          Policy could not be saved. Check the slug and try again.
        </p>
      )}
    </>
  );
}

function PolicyForm({
  policy,
  editing,
}: {
  policy: Policy | null | undefined;
  editing: boolean;
}) {
  if (editing && !policy) {
    return (
      <p role="alert" className="mt-8">
        Policy unavailable.
      </p>
    );
  }
  const values = policy ?? {
    title: "",
    slug: "",
    category: "",
    version: "1.0",
    effective_date: "",
    body: "",
    is_published: false,
  };
  const visibility = values.is_published ? "published" : "draft";
  return (
    <form
      action={savePolicyAction}
      className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 className="text-xl font-bold">{editing ? "Edit policy" : "New policy"}</h2>
      <input type="hidden" name="mode" value={editing ? "edit" : "create"} />
      <label className="block font-semibold">
        Policy title
        <input
          name="title"
          required
          maxLength={160}
          defaultValue={values.title}
          className={fieldClass}
        />
      </label>
      <label className="block font-semibold">
        URL slug
        <input
          name="slug"
          required
          maxLength={100}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={values.slug}
          readOnly={editing}
          placeholder="academic-integrity"
          className={fieldClass}
        />
      </label>
      <label className="block font-semibold">
        Category
        <input
          name="category"
          required
          maxLength={80}
          defaultValue={values.category}
          placeholder="Academic"
          className={fieldClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block font-semibold">
          Version
          <input
            name="version"
            required
            maxLength={40}
            defaultValue={values.version}
            className={fieldClass}
          />
        </label>
        <label className="block font-semibold">
          Effective date (optional)
          <input
            name="effectiveDate"
            type="date"
            defaultValue={values.effective_date || ""}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block font-semibold">
        Policy content (Markdown supported)
        <textarea
          name="body"
          required
          maxLength={50000}
          rows={16}
          defaultValue={values.body}
          className={fieldClass + " font-mono font-normal"}
        />
      </label>
      <label className="block font-semibold">
        Visibility
        <select name="status" defaultValue={visibility} className={fieldClass}>
          <option value="draft">Draft — administrators only</option>
          <option value="published">Published — visible to everyone</option>
        </select>
      </label>
      <button
        type="submit"
        className="rounded-xl bg-[#286518] px-5 py-3 font-bold text-white"
      >
        Save policy
      </button>
      {editing && (
        <Link href="/admin/policies" className="ml-4 font-bold text-[#286518]">
          Cancel edit
        </Link>
      )}
    </form>
  );
}

function PolicyList({ policies }: { policies: PolicySummary[] | null }) {
  return (
    <>
      <h2 className="mt-10 text-2xl font-bold">Existing policies</h2>
      {policies === null ? (
        <p role="status" className="mt-4">
          Policy records are unavailable.
        </p>
      ) : policies.length === 0 ? (
        <p className="mt-4">No policies created yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {policies.map((item) => (
            <li key={item.slug} className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-slate-600">
                {item.category} · v{item.version} ·{" "}
                {item.is_published ? "Published" : "Draft"}
              </p>
              <Link
                href={"/admin/policies?edit=" + item.slug}
                className="mt-2 inline-flex font-bold text-[#286518]"
              >
                Edit policy
                <span className="sr-only">: {item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default async function AdminPoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; result?: string }>;
}) {
  const { token } = await requireAdminSession();
  const params = await searchParams;
  const policies = await listPolicies(token);
  const editing = typeof params.edit === "string";
  const policy = editing ? await getPolicy(params.edit!, token) : undefined;
  const result = params.result;
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
      <Link href="/admin" className="font-bold text-[#286518]">
        ← Administration Centre
      </Link>
      <h1 className="mt-5 text-4xl font-bold">Manage policies</h1>
      <p className="mt-3 text-slate-600">
        Draft, edit and publish approved institutional policies.
      </p>
      <Link href="/policies" className="mt-4 inline-flex font-bold text-[#286518]">
        View public policies →
      </Link>
      <PolicyNotice result={result} />
      <PolicyForm policy={policy} editing={editing} />
      <PolicyList policies={policies} />
    </main>
  );
}
