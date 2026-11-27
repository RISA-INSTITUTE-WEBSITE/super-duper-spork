import Link from "next/link";

export function RisaOrbitLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="group inline-flex size-16 shrink-0 items-center justify-center rounded-full border border-[#c9dcf8] bg-white/90 text-[#155DFC] shadow-sm transition hover:border-[#155DFC] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155DFC] sm:size-[4.5rem]"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 52 52"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-12 sm:size-14"
      >
        <circle
          cx="26"
          cy="26"
          r="22"
          stroke="#155DFC"
          strokeOpacity=".22"
          strokeWidth="2"
        />
        <g className="origin-center motion-safe:group-hover:animate-[spin_3s_linear_infinite] motion-safe:group-focus-visible:animate-[spin_3s_linear_infinite]">
          <path d="M26 4A22 22 0 0 1 48 26" stroke="#155DFC" strokeWidth="3" />
          <path d="M26 48A22 22 0 0 1 4 26" stroke="#286518" strokeWidth="3" />
          <circle cx="26" cy="4" r="3" fill="#78eb29" stroke="#286518" strokeWidth="1" />
        </g>
        <path d="M15 26H37M28 17L37 26 28 35" stroke="currentColor" strokeWidth="3" />
      </svg>
    </Link>
  );
}
