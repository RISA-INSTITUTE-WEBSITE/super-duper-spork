# RISA homepage rotating photographs

The homepage grid has been replaced with a four-photo slideshow. Each
photo begins 4 seconds after the previous one and fades in over 2 seconds.
The full loop repeats every 16 seconds. Users requesting reduced motion
see the first photo as a static background.

## Required image assets

The site looks for these exact files, relative to the repository root:

| Sequence | Path | Original supplied file |
| --- | --- | --- |
| 1 | `public/images/risa-home/innovation.jpg` | `48035309701_7a5bae0d61_k.jpg` |
| 2 | `public/images/risa-home/laboratory.webp` | `GettyImages-135018895 (1).webp` |
| 3 | `public/images/risa-home/devops.png` | `Go DevOps Coding Workstation.png` |
| 4 | `public/images/risa-home/mathematics.webp` | `Maths.webp` |

**Asset upload remains pending.** The uploaded photographs are provided
separately in the user's four-file ZIP package with the exact paths above.
The connected GitHub text-file editor cannot upload these binary files.
Do not merge this feature branch until those four assets are committed;
otherwise browsers will request missing image paths.

To finish, extract the ZIP, upload the four image files into this exact
folder in the `feat/homepage-four-photo-fade` branch and rerun CI.
Confirm image paths return HTTP 200 before approving the pull request.
Use properly licensed imagery; the photo labelled GettyImages should be
checked for the institution's intended website publication rights.

## Implementation notes

- `src/components/hero-photo-background.tsx` defines the image order and
  uses Next.js `Image` for lazy loading/caching.
- `src/app/globals.css` controls a 16-second slideshow with 2-second
  opacity crossfades and reduced-motion fallback.
- `src/app/page.tsx` displays the slideshow behind the existing hero
  heading, buttons and RISA logo with a light readability overlay.
