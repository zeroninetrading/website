# Zero Nine Trading — website remake (demo)

A static rebuild of [zeronine.com.cy](https://zeronine.com.cy/) off WordPress/WooCommerce.
No build step, no framework, no database. Plain HTML, CSS and vanilla JavaScript.

**This is a demo build.** No payment is taken, no order is placed, and the
contact and newsletter forms don't send anything. A "Demo build" flag sits in
the top bar so nobody mistakes it for the live shop.

---

## Deploying to GitHub Pages

1. Create a repository and push the contents of this folder to the root of the
   default branch (`index.html` must sit at the top level, not inside a subfolder).
2. Repository → **Settings** → **Pages**.
3. Under *Build and deployment*, set **Source** to `Deploy from a branch`,
   pick your branch and the `/ (root)` folder, then save.
4. The site appears at `https://<user>.github.io/<repo>/` within a minute or two.

Nothing needs installing or compiling. Every path in the project is relative, so
the site works from a subfolder (`/<repo>/`), from a custom domain, or opened
straight off a USB stick.

`404.html` is picked up automatically by GitHub Pages for bad URLs.

### Running it locally

Opening `index.html` directly in a browser works. If you'd rather serve it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Project structure

```
index.html          Homepage
shop.html           Catalogue with filters, search, sorting
product.html        Product detail  (product.html?id=<product-id>)
about.html          Company story
contact.html        Enquiry form + FAQ
recipes.html        Recipe articles that link to the products they use
404.html            Not found
admin.html          Product & inventory admin  (not linked from the shop)

assets/css/main.css Public site styling. Brand values are CSS variables in :root.
assets/css/admin.css Admin panel styling.
assets/img/         Logo, favicon, and the illustration set.
tools/make-images.js Regenerates the illustration set.

assets/js/
  products.js       THE CATALOGUE — 70 products, brands, categories, diets
  content.js        Recipes and FAQ copy
  store.js          Config, catalogue loading, cart state, € formatting
  packshot.js       Generates the product illustrations
  app.js            Header, footer, nav, cart drawer, toasts, product cards
  home.js           Homepage
  shop.js           Catalogue filtering and sorting
  product.js        Product detail page
  pages.js          About, contact, recipes, 404
  motion.js         Scroll reveals, parallax, count-ups, progress bar
  admin.js          Admin panel — never loaded by a public page
```

---

## Changing things

### Colours

All of them live in one place — the `:root` block at the top of
`assets/css/main.css`. Change these four and the whole site re-skins:

```css
--pine:  #174436;   /* primary green — buttons, headings, header */
--lime:  #B9DC55;   /* accent — highlights, add-to-basket */
--paper: #F2F5EC;   /* page background */
--ink:   #0E2A22;   /* body text */
```

> **Note for the client review:** these were picked to suit an organic Cyprus
> food shop, not sampled from the existing logo. Once we have the brand's exact
> hex values, swapping them in is a two-minute job and touches nothing else.

### The logo

The header and footer load the real logo from `zeronine.com.cy`. If that server
is unreachable, `assets/img/logo.svg` takes over automatically. To bundle the
logo instead of hotlinking it, drop the file into `assets/img/` and change
`LOGO_REMOTE` near the top of `assets/js/app.js`.

### Products

`assets/js/products.js`. One object per product:

```js
{
  id: 'dragon-matcha-100g',   // stable — it's the URL and the cart key
  name: 'Bio Matcha',
  brand: 'Dragon',            // must exist in ZN_BRANDS
  category: 'supplements',    // must exist in ZN_CATEGORIES
  price: 13.50,
  oldPrice: 15.90,            // optional — shows a strike-through and "Save %"
  size: '100 g',
  diets: ['organic','vegan','gluten-free'],
  stock: 9,                   // 0 = sold out
  rating: 5, reviews: 2,
  pack: 'tin',                // drives the illustration
  blurb: 'Ceremonial-style green tea powder, whisked or shaken.',
  image: null                 // a photo URL here overrides the illustration
}
```

### Shop settings

`ZN_CONFIG` at the top of `assets/js/store.js` holds the phone number, email,
address, opening hours, delivery fee and the free-delivery threshold. Everything
on the site reads from there, including the footer and the cart totals.

---

## Type

- **Outfit** for headings — geometric, open, and holds up at large sizes.
- **Figtree** for body text — a tall x-height and wide apertures, which is what
  makes it easy to read at 17px on a phone.
- **JetBrains Mono** for prices, codes and labels, where digits need to line up.

All three are Google Fonts, loaded from one `<link>` in each page's `<head>`,
with system fallbacks in the `--display` / `--body` / `--mono` variables in
`main.css`. To self-host them, drop the files in `assets/` and swap that link.

---

## Motion

`assets/js/motion.js` drives everything that moves on scroll. Adding an
animation is an attribute, not more JavaScript:

```html
<div data-animate="fade-up">…</div>
<div data-animate="zoom" data-animate-delay="200">…</div>
<div class="grid" data-stagger="80">…</div>   <!-- children enter in sequence -->
<div data-parallax="0.12">…</div>              <!-- drifts against the scroll -->
<span data-count-to="82">0</span>              <!-- counts up when it's seen -->
```

Available entrances: `fade-up`, `fade-down`, `fade`, `zoom`, `slide-left`,
`slide-right`, `rise`, `blur` — defined in the Motion section of `main.css`.

One IntersectionObserver handles the whole page, and each element is unobserved
once it has appeared. **Everything checks `prefers-reduced-motion` first**: with
that set, elements are simply shown in place, the marquee stops looping, the
progress bar is hidden and the hero product stops turning on its own.

### The hero deck

`assets/js/home.js`. Four featured products, one per screen.

It uses native CSS scroll snapping rather than a JavaScript carousel, so a touch
swipe has real momentum and the browser handles the physics. Story-style
segments above fill as each card takes its turn, and tapping one jumps to it.
Auto-advance stops the moment you interact and resumes a few seconds later, and
the timer doesn't run at all while the deck is off screen.

A desktop has no swipe gesture, so pointer devices get three ways in: **arrow
buttons** beside the segments, **grab-and-drag** with the mouse, and the
**wheel** (a vertical wheel delta moves one slide; a trackpad's horizontal
scroll already works natively). A drag is prevented from turning into a click,
so releasing over a card doesn't open it.

### Touch feedback

Phones expect a control to acknowledge the tap itself, not just the result:

- Every button, icon button, pill and chip ripples from the point you touched.
- Add-to-basket confirms in place — the button turns green and reads "Added" for
  a moment — and the cart badge pops.
- The hamburger reports its state and rotates to a cross.
- A back-to-top button appears once you're well down the page, and only while
  you're scrolling *up*, so it never covers what you're reading.
- Product pages get a sticky buy bar on phones, which slides in once the real
  add button has scrolled out of sight.

All of it is off under `prefers-reduced-motion`.

---

## Mobile

Two things worth knowing, because both were bugs and both are easy to
reintroduce:

**Horizontal overflow.** The cart drawer is `position: fixed` past the right
edge. On iOS that produces a horizontal scroll, and the page loads shifted with
a white strip down the side. `html { overflow-x: clip }` fixes it. It has to be
`clip`, not `hidden` — `hidden` turns `<html>` into a scroll container and
breaks the sticky header. There's an `@supports` fallback for older engines.

**Product card footers.** At two columns on a phone there isn't room for a price
and an Add button side by side, and the button gets pushed outside the card. The
footer stacks below 640px and the button goes full width.

**Never write `grid-template-columns: 1fr`.** Use `minmax(0, 1fr)`. A bare `1fr`
means `minmax(auto, 1fr)`, so the track can never be narrower than its content's
min-content — and a horizontally-scrolling child like the hero carousel reports
a min-content of *all* its slides laid end to end. That pushed the hero column
several screens wide, and everything sharing it (the headline, the lead, the
diet finder) got cut off on the right. There's a test that fails if a bare `1fr`
reappears anywhere in the stylesheets.

Also worth keeping: the search input is `16px` on small screens, because
anything smaller makes iOS zoom the page when you focus it.

---

## The admin panel---

## The admin panel

`admin.html`. Nothing on the public site links to it — no nav entry, no footer
link, no mention in any public file. You reach it by typing the address.

**Password:** `zeronine2026`

> **This is a demo gate, not security.** The password is checked in the browser,
> so anyone who reads the page source can get past it. It keeps the panel out of
> casual view during a client demo and nothing more. The production version
> authenticates on the server and refuses to return or write product data
> without a valid session. Don't put anything sensitive behind it.
>
> To change the password, edit `PASSWORD_DIGEST` in `assets/js/admin.js`. The
> digest is produced by the `digest()` function in that same file.

### What it does

- **Dashboard** — product count, stock levels, retail value of inventory, and
  what needs attention.
- **Products** — searchable, filterable, sortable table of everything. Edit any
  field, add a product, delete one. Every row has a **View** link that opens
  that product on the shop.
- **Photo upload** — drag a photo onto the editor, or choose a file. It's checked
  for type and size, resized to 900px on the long edge, and attached to the
  product. See the caveat below.
- **Inventory** — sold-out and low-stock lists with stock steppers you can adjust
  in place, plus stock value broken down by brand.
- **Activity** — a log of every change made in the panel, newest first.
- **Publish & data** — export, import, and reset.

### Publishing changes

There's no backend yet, so edits are held in the browser's local storage. They
show on the shop **on that machine straight away** — change a price in the admin
and reload the shop to see it — but nobody else sees them.

To publish for real:

1. Admin → **Publish & data** → **Download products.js**
2. Replace `assets/js/products.js` in the repository with the downloaded file
3. Run `./setup.sh` to commit and push

**Discard my changes** on the same screen throws away everything held in the
browser and goes back to the committed catalogue.

### Photo uploads

The upload box works: drop a file in and the photo really does appear on that
product across the shop. But with no backend, the file never leaves the browser
— it's resized on a canvas and kept as a data URL in local storage.

That means **uploaded photos don't survive the export**, so they can't be
published the way price and stock changes can. Say so if you're demoing it.

When the backend lands, one function changes: `storeFile()` in `admin.js` POSTs
the blob to storage and keeps the address it returns instead of the data URL.
Everything around it — the drop zone, the validation, the resizing, the progress
bar, the thumbnail — stays exactly as it is.

---

## Product imagery

The current site has inconsistent and in places missing product photography, so
every product here is **drawn from its own data** — the pack type plus the brand
colour, with the brand, product name and pack size set on the label. Nine pack
shapes are supported: `jar`, `bottle`, `pouch`, `box`, `carton`, `bread`, `bar`,
`tube`, `tin`, `sachet`.

The result is one consistent look across all 70 items without a photoshoot.

When real photography arrives, put the URL in a product's `image` field — there's
a **Photo URL** box on every product in the admin panel — and that product
switches to the photo. Illustrated and photographed products can coexist, so the
catalogue can be converted gradually rather than all at once.

### The rest of the illustrations

Category tiles, recipe cards, promo banners and the about-page image are static
SVGs in `assets/img/`, generated from shared primitives by
`tools/make-images.js` so the whole set shares one visual language. To change
them, edit that file and run:

```bash
node tools/make-images.js
```

These are template artwork for the demo. Swapping any of them for a photograph
is a one-line change wherever the filename appears.

---

## Connecting the admin backend (phase two)

The site was structured so this is a one-line change.

`assets/js/products.js` holds the catalogue in the exact shape the admin API
should return. In `assets/js/store.js`:

```js
window.ZN_CONFIG = {
  apiUrl: 'https://api.zeronine.com.cy/products',   // was null
  ...
}
```

`ZN.load()` is the only thing on the site that reads product data — every page
goes through it. With `apiUrl` set it fetches live JSON instead of the bundled
file, and if that request fails for any reason it falls back to the bundled data
rather than showing an empty shop.

The API should return either a bare array of products or `{ "products": [...] }`.
Field names are listed above; anything missing gets a sensible default.

The admin panel in `admin.html` already edits exactly this shape, so connecting
it to a real backend means changing where it reads and writes — the interface
itself doesn't change. No template edits, no redeploy, no WordPress.

---

## Accessibility and quality

- Responsive from 320 px up.
- Keyboard navigable, with a skip link and visible focus rings.
- `prefers-reduced-motion` respected.
- Label and text colours darken automatically to hold a 4.5:1 contrast ratio
  against white.
- Product pages emit `schema.org/Product` structured data for search engines.
- The cart survives page navigation via `localStorage`, and falls back to
  in-memory storage where that's blocked (private browsing, embedded previews).
