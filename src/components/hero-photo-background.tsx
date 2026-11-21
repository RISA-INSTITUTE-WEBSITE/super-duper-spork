import Image from "next/image";

const heroPhotos = [
  { src: "/images/risa-home/innovation.jpg", label: "Applied technology learning" },
  { src: "/images/risa-home/laboratory.webp", label: "Science laboratory research" },
  { src: "/images/risa-home/devops.png", label: "Software engineering and DevOps" },
  { src: "/images/risa-home/mathematics.webp", label: "Mathematics and physics" },
] as const;

/**
 * Four-image, CSS-only carousel. Each slide begins every four seconds,
 * fades in over two seconds, and stays until the next slide crossfades in.
 * The first photo is static when the user prefers reduced motion.
 */
export function HeroPhotoBackground() {
  return (
    <div
      aria-hidden="true"
      className="risa-hero-photos pointer-events-none absolute inset-0"
    >
      {heroPhotos.map((photo, index) => (
        <div
          key={photo.src}
          className="risa-hero-photo absolute inset-0"
          style={{ animationDelay: `${index * 4}s` }}
        >
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="100vw"
            // Hero images are already public static assets; avoid exposing the
            // Next.js image optimizer to external path-manipulation probes.
            unoptimized
            priority={index === 0}
            className="object-cover object-center"
          />
        </div>
      ))}
      <div className="risa-hero-photo-wash absolute inset-0" />
    </div>
  );
}
