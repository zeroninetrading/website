# Change Summary — motion, type, 3D hero, photo uploads — 24 Aug 2026

## Files Created
- `zeronine/assets/js/motion.js` — scroll animation engine: reveals, stagger, parallax, count-ups, progress bar, sticky header
- `zeronine/assets/js/bottle3d.js` — the rotating product in the hero; canvas 2D, no 3D library

## Files Modified
- `zeronine/assets/css/main.css` — new type stack; base size 16→17px with looser leading; full Motion section replacing the old single reveal rule; hero showcase styles; brand marquee; scroll progress bar; sticky-header state; hover micro-interactions on cards, tiles, promos and recipes; dead `.shelf` rules removed
- `zeronine/assets/css/admin.css` — matching type stack; base size 15→16px; drop-zone and upload styles; light panel/stat entrance animations
- `zeronine/index.html` — hero shelf replaced by the rotating showcase (canvas, product info, dots, drag hint); progress bar; `data-animate` / `data-stagger` throughout; brand strip wrapped in a marquee; stats switched to count-up
- `zeronine/shop.html`, `about.html`, `contact.html`, `recipes.html`, `404.html`, `product.html` — new font link, `motion.js` script tag, entrance animations on page heads and content blocks
- `zeronine/admin.html` — new font link; drag-and-drop photo upload in the product editor, with the pasted-address field kept behind a disclosure; note on the Publish screen about where uploads go
- `zeronine/assets/js/app.js` — reveals delegated to `motion.js`; progress bar injected on every page
- `zeronine/assets/js/home.js` — hero showcase wiring (featured products, cycling, dots, drag); brand list duplicated for the marquee; stats set up to count
- `zeronine/assets/js/shop.js` — results grid staggers as it repaints (first screenful only)
- `zeronine/assets/js/pages.js`, `product.js` — reveal calls point at `motion.js`; recipe articles animate individually
- `zeronine/assets/js/admin.js` — photo upload pipeline: validation, canvas resize, progress, thumbnail, remove, reopen; `image` validation now accepts data URLs
- `zeronine/README.md` — documented the type stack, the motion attributes, how the rotating product works, and the upload caveat
- `setup.sh` — `motion.js` and `bottle3d.js` added to the required list (41 files, up from 39)

## Notes

**Type.** Outfit for headings, Figtree for body, JetBrains Mono for prices and codes. Figtree was chosen for the large x-height and open apertures — that plus the 16→17px bump is most of the readability gain. All three come from one `<link>` per page; the fallbacks are in the `--display` / `--body` / `--mono` variables.

**Motion is attribute-driven.** `data-animate="fade-up|fade-down|fade|zoom|slide-left|slide-right|rise|blur"`, `data-animate-delay`, `data-stagger` on a parent, `data-parallax`, `data-count-to`. One IntersectionObserver covers the page and unobserves each element once it has appeared.

**`prefers-reduced-motion` is honoured throughout** — elements appear in place, the marquee stops looping, the progress bar is hidden, and the hero product stops turning on its own (it can still be dragged).

**The rotating product.** No WebGL, no library, nothing to load. A bottle is a surface of revolution, so its outline doesn't change as it turns — only the label and the highlight do. The silhouette is drawn once and the label is mapped around it as a cylinder (`x = R·sin θ`, width scaled by `cos θ`, Lambert shading over the same angle). Three shapes with their own proportions, four featured products on a 7-second cycle, drag or arrow keys to turn, and it only animates while on screen.

**Photo uploads work, but the file never leaves the browser.** It's validated, resized to 900px on the long edge, and kept as a data URL, so an uploaded photo genuinely shows on the shop. It will not survive the export, so photos can't be published the way price and stock changes can — worth saying out loud when demoing. When the backend lands, only `storeFile()` in `admin.js` changes: it POSTs the blob and keeps the returned address. The drop zone, validation, resizing, progress bar and thumbnail all stay.

**Testing done**
- Public suite grown to 66 assertions; admin suite to 73. Both passing, and both re-run against the delivered copy.
- New coverage: showcase renders and names a real product, the bottle actually draws label slices and shading gradients, the marquee duplicates its list, stats count up to the true total, progress bar present.
- New upload coverage: non-image rejected, oversize rejected, nothing attached after a rejection, progress shown, photo attached and resized, dropzone hides and returns, thumbnail rendered, photo persists through save, packshot switches from illustration to `<img>`, remove clears it, pasted https address still accepted.
- The bottle was rendered to PNG at six rotations and three shapes and inspected twice — first pass read as a jug with a stretched tin, so the profiles were reworked to give each shape its own height and girth.
- `setup.sh` re-rehearsed against a flattened folder of all 44 files.

**Three real bugs caught while testing**
1. `bottle3d.js` threw on any browser without a 2D canvas context. It now returns `null` from `create()` and the hero falls back to the flat illustration.
2. `shade()` returned `rgb(...)` but its result was chained back into itself, which couldn't be parsed — the cap colour crashed the draw. It returns hex now.
3. The count-up never fired: the numbers sit inside a block that carries the reveal, so they were never observed on their own. Counters now get their own pass, which also covers numbers added to the page after the first scan.
