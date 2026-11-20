import Image from "next/image";
import Link from "next/link";

export type HeaderUser = {
  fullName: string;
  initials: string;
  avatarUrl: string | null;
  isAdmin: boolean;
};

export function HeaderProfileLink({ user }: { user: HeaderUser }) {
  return (
    <Link
      href="/students/dashboard"
      aria-label={"Open My Learning for " + user.fullName}
      title="My Learning"
      className="inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#78eb29] bg-gradient-to-br from-[#38b6ff] via-[#155DFC] to-[#123e8a] font-heading text-sm font-bold text-white shadow-sm ring-2 ring-white transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#286518]"
    >
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt=""
          width={44}
          height={44}
          unoptimized
          className="size-full rounded-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{user.initials}</span>
      )}
    </Link>
  );
}
