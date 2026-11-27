"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Replace these three existing RISA photographs with approved update banners.
const slides = [
  { src: "/images/risa-home/innovation.jpg", alt: "Applied technology learning" },
  { src: "/images/risa-home/laboratory.webp", alt: "Science laboratory research" },
  { src: "/images/risa-home/devops.png", alt: "Software engineering and DevOps" },
] as const;

const slideInterval = 5000;

export function RisaLatestUpdates() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setActive((index) => (index + 1) % slides.length);
      }
    }, slideInterval);
    return () => window.clearTimeout(timer);
  }, [active, paused]);

  return (
    <section aria-labelledby="latest-updates-heading" className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2
          id="latest-updates-heading"
          className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
        >
          Latest deals/updates
        </h2>
        <div
          aria-roledescription="carousel"
          aria-label="Latest deals and updates"
          role="region"
          className="mt-5"
        >
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            <div
              className="flex transition-transform duration-500 ease-in-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.src}
                  aria-hidden={index !== active}
                  className="relative aspect-[16/9] w-full shrink-0 sm:aspect-[3/1]"
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 1280px) 1216px, 100vw"
                    unoptimized
                    className="object-cover object-center"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Show update ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                onClick={() => setActive(index)}
                className="inline-flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[#155DFC]"
              >
                <span
                  className={
                    active === index
                      ? "h-2.5 w-7 rounded-full bg-[#155DFC]"
                      : "size-2.5 rounded-full bg-slate-400"
                  }
                />
              </button>
            ))}
            <button
              type="button"
              aria-label={paused ? "Resume updates" : "Pause updates"}
              onClick={() => setPaused((value) => !value)}
              className="inline-flex size-11 items-center justify-center rounded-full text-[#286518] hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#155DFC]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5"
              >
                {paused ? (
                  <path d="M8 5v14l11-7z" />
                ) : (
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
