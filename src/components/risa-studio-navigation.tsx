"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const NavigationContext = createContext<(href: string) => void>(() => {});

export function RisaStudioNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(href: string) {
    startTransition(() => router.push(href, { scroll: false }));
  }

  return (
    <NavigationContext.Provider value={navigate}>
      {pending && (
        <p role="status" className="mt-3 text-sm text-slate-600">
          Loading selection…
        </p>
      )}
      <fieldset disabled={pending} aria-busy={pending} className="min-w-0">
        {children}
      </fieldset>
    </NavigationContext.Provider>
  );
}

export function RisaStudioSelect({
  name,
  value,
  moduleId,
  disabled,
  children,
}: {
  name: "module" | "topic";
  value: string;
  moduleId?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const navigate = useContext(NavigationContext);

  function select(next: string) {
    const params = new URLSearchParams();
    if (name === "module" && next) {
      params.set("module", next);
    }
    if (name === "topic" && moduleId) {
      params.set("module", moduleId);
      if (next) {
        params.set("topic", next);
      }
    }
    const query = params.toString();
    navigate("/admin/study-notes" + (query ? "?" + query : ""));
  }

  return (
    <select
      name={name}
      value={value}
      disabled={disabled}
      onChange={(event) => select(event.target.value)}
      className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-50"
    >
      {children}
    </select>
  );
}
