# Change Summary — Zero Nine Trading website remake (demo) — 24 Aug 2026

Initial build. Static, framework-free rebuild of https://zeronine.com.cy/ off
WordPress/WooCommerce, deployable to GitHub Pages as-is. All paths are under
`zeronine/`.

## Files Created

### Pages
- `zeronine/index.html` — homepage: hero with dietary product finder, best sellers rail, department tiles, heritage strip, offers, brands, recipes, newsletter
- `zeronine/shop.html` — catalogue with filter sidebar, sort, search, chips and load-more
- `zeronine/product.html` — product detail, rendered from `?id=<product-id>`
- `zeronine/about.html` — company story, certifications, brand strip
- `zeronine/contact.html` — enquiry form, office details, FAQ
- `zeronine/recipes.html` — six recipe articles, each linking to the products it uses
- `zeronine/404.html` — not-found page (GitHub Pages picks this up automatically)

### Styles
- `zeronine/assets/css/main.css` — complete stylesheet; all brand values are CSS variables in a single `:root` block

### Scripts
- `zeronine/assets/js/products.js` — catalogue: 70 products, 10 brands, 6 categories, 4 diet tags. Single source of truth, shaped to match the future admin API response
- `zeronine/assets/js/content.js` — recipe and FAQ copy, kept out of the catalogue file
- `zeronine/assets/js/store.js` — `ZN_CONFIG` (contact details, delivery fees), catalogue loading, cart state, € formatting
- `zeronine/assets/js/packshot.js` — generates the product illustrations as SVG from pack type + brand colour
- `zeronine/assets/js/app.js` — shared chrome: header, footer, mobile nav, cart drawer, toasts, product card renderer
- `zeronine/assets/js/home.js` — homepage behaviour
- `zeronine/assets/js/shop.js` — filtering, sorting, URL state, pagination
- `zeronine/assets/js/product.js` — product page, tabs, related products, structured data
- `zeronine/assets/js/pages.js` — about, contact, recipes and 404 behaviour

### Assets
- `zeronine/assets/img/logo.svg` — local logo mark, used only if the hotlinked logo fails to load
- `zeronine/assets/img/favicon.svg` — favicon

### Repo files
- `zeronine/README.md` — deployment steps, file map, how to change colours/products/config, backend connection instructions
- `zeronine/.nojekyll` — stops GitHub Pages running the files through Jekyll

## Notes

**Deploying**
- Push the *contents* of `zeronine/` to the repo root — `index.html` must be at the top level, not inside a subfolder.
- Settings → Pages → Deploy from a branch → `/ (root)`. No build step, nothing to install.
- Every path is relative, so it works from `https://user.github.io/repo/` without changes.

**Colour palette — needs your input before the client sees it**
- The exact hex values could not be read off the existing logo file, so the palette is a deliberate organic direction rather than a sample: `--pine: #174436`, `--lime: #B9DC55`, `--paper: #F2F5EC`, `--ink: #0E2A22`.
- All four sit in the `:root` block at the top of `assets/css/main.css`. Eyedropping the real logo and replacing them re-skins the entire site and touches nothing else.

**Logo**
- The header and footer load the real logo from `https://zeronine.com.cy/wp-content/uploads/2022/03/logo-newsmall.png`, with `assets/img/logo.svg` as an automatic fallback. To bundle it instead, drop the file in `assets/img/` and change `LOGO_REMOTE` near the top of `assets/js/app.js`.

**Product imagery**
- The live site has inconsistent and partly missing photography, so each product is illustrated from its own data. Every product record has an `image` field — put a photo URL there and that product switches to the photo, so the catalogue can be converted to real photography gradually.

**Backend hook (phase two)**
- `ZN.load()` in `store.js` is the only thing on the site that reads product data.
- Set `ZN_CONFIG.apiUrl` to the admin API endpoint and the whole site switches from the bundled file to live JSON. If the request fails it falls back to the bundled data rather than showing an empty shop.
- The API should return a bare array or `{ "products": [...] }` using the field names documented in `products.js`.

**Demo limitations, deliberate**
- Checkout, contact form and newsletter are non-functional and say so in the interface. A "Demo build" flag sits in the top bar.
- The contact page map is a placeholder so the page loads without third-party scripts.

**Testing done**
- All nine JS files pass `node --check`.
- A jsdom harness boots all seven pages and drives them: 58 assertions covering rendering, add-to-basket, quantity changes, filter/sort/clear, search, empty results, sold-out products, invalid product IDs and form validation. All passing.
- Packshots were rasterised and inspected three times; two issues found and fixed (same-brand products rendering identically, and light brand colours failing contrast against white label text).

**Dependencies**
- None to install. The only external request is Google Fonts (Bricolage Grotesque, Instrument Sans, DM Mono). If the client wants zero third-party requests, self-host the three families in `assets/` and swap the `<link>` in each page's `<head>`.
