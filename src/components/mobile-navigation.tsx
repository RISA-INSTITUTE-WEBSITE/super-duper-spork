"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/programmes", label: "Programmes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/students/login", label: "Students" },
] as const;

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function trapSidebarFocus(event: KeyboardEvent, sidebar: HTMLDivElement | null): void {
  if (event.key !== "Tab") {
    return;
  }

  const elements = sidebar?.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (!elements?.length) {
    return;
  }

  const first = elements[0];
  const last = elements[elements.length - 1];

  const wrapsBackward = event.shiftKey && document.activeElement === first;
  const wrapsForward = !event.shiftKey && document.activeElement === last;

  if (wrapsBackward) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (wrapsForward || !sidebar?.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

export function MobileNavigation() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    function handleSearchEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    document.addEventListener("keydown", handleSearchEscape);
    return () => document.removeEventListener("keydown", handleSearchEscape);
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleSidebarKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      trapSidebarFocus(event, sidebarRef.current);
    }

    document.addEventListener("keydown", handleSidebarKeyboard);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleSidebarKeyboard);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  return (
    <div className="flex shrink-0 items-center gap-1 md:hidden">
      <button
        type="button"
        aria-label={searchOpen ? "Close search" : "Open search"}
        aria-expanded={searchOpen}
        aria-controls="risa-mobile-search"
        onClick={() => {
          setMenuOpen(false);
          setSearchOpen((open) => !open);
        }}
        className="inline-flex size-11 items-center justify-center rounded-xl text-[#286518] transition hover:bg-[#eefce5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
      >
        <SearchIcon />
      </button>
      <button
        ref={menuButtonRef}
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={menuOpen}
        aria-controls="risa-mobile-sidebar"
        onClick={() => {
          setSearchOpen(false);
          setMenuOpen(true);
        }}
        className="inline-flex size-11 items-center justify-center rounded-xl text-slate-900 transition hover:bg-[#eefce5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-6"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div
        id="risa-mobile-search"
        hidden={!searchOpen}
        className="absolute inset-x-0 top-full z-30 border-b border-[#78eb29] bg-white px-5 py-4 shadow-lg sm:px-8"
      >
        <form
          role="search"
          action="/search"
          method="get"
          className="relative mx-auto max-w-md"
        >
          <label htmlFor="risa-mobile-search-input" className="sr-only">
            Search RISA website
          </label>
          <input
            ref={searchInputRef}
            id="risa-mobile-search-input"
            type="search"
            name="q"
            placeholder="Search RISA..."
            required
            maxLength={100}
            className="min-h-11 w-full rounded-full border border-slate-200 bg-[#f8fafc] py-2.5 pr-12 pl-5 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus-visible:border-[#78eb29] focus-visible:ring-2 focus-visible:ring-[#78eb29]/30"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-full text-[#286518] hover:bg-[#eafbdc] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#286518]"
          >
            <SearchIcon />
          </button>
        </form>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation menu overlay"
            onClick={closeMenu}
            className="absolute inset-0 cursor-default bg-slate-950/45"
          />
          <div
            id="risa-mobile-sidebar"
            ref={sidebarRef}
            role="dialog"
            aria-modal="true"
            aria-label="RISA navigation menu"
            className="absolute inset-y-0 right-0 flex w-[88vw] max-w-sm flex-col overflow-y-auto rounded-l-2xl border-l border-[#78eb29] bg-white px-6 py-6 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-lg font-extrabold text-[#0A0F1D]">RISA</p>
                <p className="text-xs text-slate-500">Explore the institute</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMenu}
                className="inline-flex size-11 items-center justify-center rounded-xl text-slate-700 hover:bg-[#eefce5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-6"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile navigation" className="mt-6">
              <ul className="space-y-2">
                {navigation.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center rounded-xl px-4 py-3 font-heading text-lg font-semibold text-slate-800 transition hover:bg-[#eefce5] hover:text-[#286518] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto border-t border-slate-100 pt-6 text-xs text-slate-500">
              RISA Institute of Applied Sciences
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
