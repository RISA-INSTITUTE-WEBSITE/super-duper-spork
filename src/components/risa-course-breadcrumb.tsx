"use client";

type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
};

/**
 * Mirrors Edu-ca-te's BreadcrumbNav presentation and ancestor navigation.
 * The final crumb describes the current view; earlier crumbs are buttons.
 */
export function RisaCourseBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Course breadcrumb" className="min-w-0 font-heading">
      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-2 sm:gap-x-3">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={index} className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[23px] leading-none font-light text-[#B8C8DD] sm:text-[25px]"
                >
                  ›
                </span>
              )}

              {current ? (
                <span
                  aria-current="page"
                  title={item.label}
                  className="relative isolate inline-flex min-w-0 max-w-[min(70vw,22rem)] items-center text-[18px] font-extrabold leading-snug tracking-[-0.045em] text-[#155DFC] drop-shadow-[0_1px_5px_rgba(255,255,255,0.95)] sm:text-[21px]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-x-5 -inset-y-3 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.98)_0%,rgba(215,234,255,0.76)_36%,rgba(215,234,255,0)_80%)] blur-[7px]"
                  />
                  <span className="truncate">{item.label}</span>
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  title={item.label}
                  className="min-w-0 max-w-[min(48vw,15rem)] cursor-pointer truncate rounded-sm text-[15px] font-medium text-[#64748B] transition-colors hover:text-[#155DFC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155DFC] sm:text-[17px]"
                >
                  {item.label}
                </button>
              ) : (
                <span
                  title={item.label}
                  className="min-w-0 max-w-[min(48vw,15rem)] truncate text-[15px] font-medium text-[#64748B] sm:text-[17px]"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
