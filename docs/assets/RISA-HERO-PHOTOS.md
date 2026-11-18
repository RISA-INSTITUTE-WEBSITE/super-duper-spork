# RISA homepage rotating photographs

The homepage grid has been replaced with a four-photo slideshow. Each
photo begins 4 seconds after the previous one and fades in over 2 seconds.
The full loop repeats every 16 seconds. Users requesting reduced motion
see the first photo as a static background.

## Required image assets

The site looks for these exact files, relative to the repository root:

| Sequence | Path                                       | Original supplied file             |
| -------- | ------------------------------------------ | ---------------------------------- |
| 1        | `public/images/risa-home/innovation.jpg`   | `48035309701_7a5bae0d61_k.jpg`     |
| 2        | `public/images/risa-home/laboratory.webp`  | `GettyImages-135018895 (1).webp`   |
| 3        | `public/images/risa-home/devops.png`       | `Go DevOps Coding Workstation.png` |
| 4        | `public/images/risa-home/mathematics.webp` | `Maths.webp`                       |

**All four original images are committed** at these exact paths. Their
Git blob SHA-1 identifiers match the original file bytes (no image editing or
recompression).

Before public distribution, confirm the institution holds the necessary
publication rights to each photo, especially the one labelled GettyImages.
Confirm the deployed paths respond with HTTP 200 and check legibility on
desktop and mobile.

## Implementation notes

- `src/components/hero-photo-background.tsx` defines the image order and
  uses Next.js `Image` for lazy loading/caching.
- `src/app/globals.css` controls a 16-second slideshow with 2-second
  opacity crossfades and reduced-motion fallback.
- `src/app/page.tsx` displays the slideshow behind the existing hero
  heading, buttons and RISA logo with a light readability overlay.
