# Change Summary — illustration set + admin panel — 24 Aug 2026

## Files Created

### Admin panel (not linked from the public site)
- `zeronine/admin.html` — password-gated admin: dashboard, products, inventory, activity log, publish
- `zeronine/assets/css/admin.css` — admin styling, deliberately distinct from the shop
- `zeronine/assets/js/admin.js` — admin logic; never loaded by a public page
- `zeronine/robots.txt` — disallows `/admin.html`

### Illustration set
- `zeronine/tools/make-images.js` — generator that writes every image below from shared primitives
- `zeronine/assets/img/cat-organic.svg`, `cat-gluten-free.svg`, `cat-no-sugar.svg`, `cat-supplements.svg`, `cat-natural.svg`, `cat-vegan.svg` — department tile images
- `zeronine/assets/img/recipe-muffins.svg`, `recipe-smoothie.svg`, `recipe-toast.svg`, `recipe-baking.svg`, `recipe-tahini.svg`, `recipe-oats.svg` — recipe images
- `zeronine/assets/img/banner-organic.svg`, `banner-gluten-free.svg`, `banner-offers.svg` — wide promo banners
- `zeronine/assets/img/about-warehouse.svg` — about-page editorial image

## Files Modified
- `zeronine/index.html` — added a two-up promo banner strip and an offers banner; catalogue link text is now set from the product count instead of being hardcoded
- `zeronine/about.html` — added the warehouse figure above the story
- `zeronine/assets/css/main.css` — category tiles rebuilt around an image; new `.promo` and `.figure` styles; recipe art now holds an image
- `zeronine/assets/js/products.js` — added 12 products across Byodo, Roo Bar and Biagi, which were listed as brands but had no stock; categories now carry an `image`
- `zeronine/assets/js/content.js` — each recipe now carries an `image`
- `zeronine/assets/js/store.js` — catalogue now reads admin edits from local storage before falling back to the bundled file; added `ZN.catalogue` (all/save/reset/isEdited) for the admin panel
- `zeronine/assets/js/home.js` — category tiles and recipe cards use the new images; catalogue link text set from the live count
- `zeronine/assets/js/pages.js` — recipe articles use the new images
- `zeronine/assets/js/app.js` — search placeholder no longer hardcodes a product count
- `zeronine/README.md` — documented the admin panel, the password caveat, the publish workflow and the image generator
- `setup.sh` — routes the new files (admin, images, `tools/`); required-file list grew from 20 to 39; asset-reference check now covers all 8 pages instead of just `index.html`; JS syntax check includes `tools/`

## Notes

**Admin access**
- URL: `admin.html` — e.g. `https://zeroninetrading.github.io/website/admin.html`
- Password: `zeronine2026`
- Nothing on the public site links to it. Verified by a test that greps every public HTML and JS file for admin references.

**The password is a demo gate, not security.** It is checked in the browser, so anyone who reads the page source can get past it. It keeps the panel out of casual view during a client demo and nothing more. Say so if the client asks. The production version must authenticate on the server before returning or writing any product data. To change it, edit `PASSWORD_DIGEST` in `assets/js/admin.js`.

`robots.txt` is included but on a GitHub Pages project site it is served from `/website/robots.txt`, which crawlers ignore — they only read the domain root. The `<meta name="robots" content="noindex">` on the page does apply.

**How admin edits reach the shop**
- Edits are held in the browser's local storage under `zn.catalogue.v1`, and `ZN.load()` reads that before the bundled file. Change a price in the admin, reload the shop on the same machine, and the new price is there. This is the thing to demo.
- Nobody else sees those edits. To publish: Publish & data → Download products.js → replace `assets/js/products.js` → run `./setup.sh`.
- "Discard my changes" clears the override and returns to the committed catalogue.

**Catalogue grew from 70 to 82 products.** Byodo, Roo Bar and Biagi were listed as brands with zero products, so their brand pages and filters came up empty. All counts shown on the site are now derived from the data rather than written into the copy.

**Images are template artwork**, generated rather than photographed — the client has no consistent photography. To change them, edit `tools/make-images.js` and run `node tools/make-images.js`. Replacing any one with a photograph is a one-line change wherever the filename appears.

**Testing done**
- New admin suite: 55 assertions covering the password gate (wrong and right), dashboard figures, table search/filter/sort, stock steppers, the editor's validation rules (required fields, old price must exceed price, malformed photo URL, duplicate product code), add/edit/delete, the activity log, inventory tables, restock-all, export, reset and sign-out. It also evaluates the exported `products.js` in a clean sandbox to confirm it parses and round-trips the full catalogue.
- Existing 58-assertion public-site suite re-run and passing after the catalogue and image changes.
- Both suites re-run against the delivered copy in the outputs folder, not just the working copy.
- Every illustration rasterised and inspected; four defects found and fixed (muffins reading as mushrooms, bowl contents painted over by the rim, dietary badges cropped at the canvas edge, kitchen scale reading as a featureless slab).
- `setup.sh` re-tested by flattening all 42 files into one folder and confirming it rebuilt the tree correctly.

**One real bug caught during testing:** the editor read its fields via form named-property access (`form.name`, `form.id`). Those resolve to the form element's own attributes rather than the controls, which would have broken saving in every browser. All field access is now by element id.
