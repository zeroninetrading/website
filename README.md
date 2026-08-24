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

assets/css/main.css All styling. Every brand value is a CSS variable in :root.
assets/img/         Logo fallback and favicon.

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

## Product imagery

The current site has inconsistent and in places missing product photography, so
every product here is **drawn from its own data** — the pack type plus the brand
colour, with the brand, product name and pack size set on the label. Nine pack
shapes are supported: `jar`, `bottle`, `pouch`, `box`, `carton`, `bread`, `bar`,
`tube`, `tin`, `sachet`.

The result is one consistent look across all 70 items without a photoshoot.

When real photography arrives, put the URL in a product's `image` field and that
product switches to the photo. Illustrated and photographed products can coexist,
so the catalogue can be converted gradually rather than all at once.

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

That means the admin panel we build next only has to manage prices, images,
stock and product details, and write JSON in this shape. No template changes,
no redeploy, no WordPress.

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
