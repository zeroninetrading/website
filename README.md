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
