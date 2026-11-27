import Link from "next/link";

export function RisaChevronLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="group inline-flex size-16 shrink-0 items-center justify-center rounded-xl transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155DFC] sm:size-[4.5rem]"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 52 52"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
        className="size-12 sm:size-14"
      >
        <path
          d="M12 14L24 26 12 38"
          stroke="#155DFC"
          className="motion-safe:group-hover:animate-[pulse_1.6s_ease-in-out_infinite] motion-safe:group-focus-visible:animate-[pulse_1.6s_ease-in-out_infinite]"
        />
        <path
          d="M26 14L38 26 26 38"
          stroke="#286518"
          className="motion-safe:group-hover:animate-[pulse_1.6s_ease-in-out_220ms_infinite] motion-safe:group-focus-visible:animate-[pulse_1.6s_ease-in-out_220ms_infinite]"
        />
      </svg>
    </Link>
  );
}
