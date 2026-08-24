/* ------------------------------------------------------------------
   admin.js — product and inventory management

   Deliberately separate from the public site: nothing on the shop
   links here, and this file is never loaded by a public page.

   SECURITY NOTE
   The password below is checked in the browser. That keeps the panel
   out of casual view, but anyone who reads the page source can get
   past it — treat it as a demo gate, not protection. In the production
   build the backend authenticates the request and refuses to return or
   write product data without a valid session.
------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var doc = document;

  /* ---------- config -------------------------------------------- */
  var PASSWORD_DIGEST = 'e4e27c79d619b53b';   // "zeronine2026"
  var SESSION_KEY = 'zn.admin.session';
  var LOG_KEY = 'zn.admin.log';
  var LOW_STOCK = 10;

  var PACK_TYPES = ['jar', 'bottle', 'pouch', 'box', 'carton', 'bread', 'bar', 'tube', 'tin', 'sachet'];

  /* ---------- tiny helpers -------------------------------------- */
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  /* Editor fields are addressed by id, never by form named-property access:
     form.name and form.id resolve to the form's own attributes, not the
     controls, and the rest of that API is inconsistent across browsers. */
  function fld(n) { return doc.getElementById('f-' + n); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Not cryptographic — see the security note above. */
  function digest(str) {
    var salted = 'zn\u0000' + str;
    var a = 5381;
    for (var i = 0; i < salted.length; i++) a = ((a * 33) ^ salted.charCodeAt(i)) >>> 0;
    var b = 2166136261 >>> 0;
    for (var j = 0; j < salted.length; j++) {
      b ^= salted.charCodeAt(j);
      b = Math.imul(b, 16777619) >>> 0;
    }
    function hex(n) { var h = n.toString(16); while (h.length < 8) h = '0' + h; return h; }
    return hex(a) + hex(b);
  }

  function slug(s) {
    return String(s).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  function money(n) { return global.ZN.money(Number(n) || 0); }

  var toastTimer;
  function toast(msg) {
    var el = $('[data-toast]');
    el.textContent = msg;
    el.setAttribute('data-open', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.setAttribute('data-open', 'false'); }, 2600);
  }

  function session(store) {
    try {
      if (store === undefined) return global.sessionStorage.getItem(SESSION_KEY);
      if (store === null) global.sessionStorage.removeItem(SESSION_KEY);
      else global.sessionStorage.setItem(SESSION_KEY, store);
    } catch (e) { /* storage blocked — the gate just won't persist */ }
    return null;
  }

  /* ---------- state --------------------------------------------- */
  var products = [];
  var editing = null;          // id being edited, or null for a new product
  var filters = { q: '', cat: '', brand: '', stock: '' };
  var sort = { key: 'name', dir: 1 };

  function persist() {
    global.ZN.catalogue.save(products);
    paintNotice();
  }

  /* ---------- activity log --------------------------------------- */
  function readLog() {
    try { return JSON.parse(global.localStorage.getItem(LOG_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function writeLog(entries) {
    try { global.localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(0, 300))); }
    catch (e) { /* nothing we can do */ }
  }
  function logIt(action, product, detail) {
    var entries = readLog();
    entries.unshift({
      at: Date.now(),
      action: action,
      product: product || '',
      id: (product && product.id) || '',
      detail: detail || ''
    });
    writeLog(entries);
  }
  function logEntry(action, name, id, detail) {
    var entries = readLog();
    entries.unshift({ at: Date.now(), action: action, product: name, id: id || '', detail: detail || '' });
    writeLog(entries);
  }

  function when(ts) {
    var d = new Date(ts);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  /* ---------- derived ------------------------------------------- */
  function stats() {
    var inStock = products.filter(function (p) { return p.stock > LOW_STOCK; });
    var low = products.filter(function (p) { return p.stock > 0 && p.stock <= LOW_STOCK; });
    var out = products.filter(function (p) { return p.stock <= 0; });
    var onOffer = products.filter(function (p) { return p.oldPrice; });
    var value = products.reduce(function (t, p) { return t + p.price * Math.max(0, p.stock); }, 0);
    var units = products.reduce(function (t, p) { return t + Math.max(0, p.stock); }, 0);
    return { inStock: inStock, low: low, out: out, onOffer: onOffer, value: value, units: units };
  }

  function stockTag(p) {
    if (p.stock <= 0) return '<span class="tag tag--out">Sold out</span>';
    if (p.stock <= LOW_STOCK) return '<span class="tag tag--low">Low</span>';
    return '<span class="tag tag--in">In stock</span>';
  }

  /* ---------- notices ------------------------------------------- */
  function paintNotice() {
    var host = $('[data-notice]');
    var edited = global.ZN.catalogue.isEdited();
    var warn = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>';

    host.innerHTML = edited
      ? '<div class="notice notice--warn">' + warn +
          '<div><strong>Unpublished changes.</strong> Your edits are saved in this browser and ' +
          'are showing on the shop here, but nobody else can see them yet. ' +
          'Download <code>products.js</code> from Publish &amp; data and commit it.</div>' +
          '<span class="notice__actions"><button class="b b-primary b-sm" data-view="data">Publish</button></span>' +
        '</div>'
      : '<div class="notice notice--info">' + warn +
          '<div>Showing the catalogue as it is committed in the repository. Any edit you make ' +
          'here is kept in this browser until you publish it.</div></div>';
  }

  /* ---------- dashboard ----------------------------------------- */
  function paintDashboard() {
    var s = stats();

    $('[data-stats]').innerHTML = [
      { label: 'Products listed', value: products.length, sub: Object.keys(global.ZN_BRANDS).length + ' brands' },
      { label: 'In stock', value: s.inStock.length, sub: s.units + ' units on hand' },
      { label: 'Running low', value: s.low.length, sub: LOW_STOCK + ' or fewer', cls: s.low.length ? ' stat--warn' : '' },
      { label: 'Sold out', value: s.out.length, sub: 'not buyable', cls: s.out.length ? ' stat--bad' : '' },
      { label: 'On offer', value: s.onOffer.length, sub: 'reduced price' },
      { label: 'Stock value', value: money(s.value), sub: 'at retail price' }
    ].map(function (c) {
      return '<div class="stat' + (c.cls || '') + '">' +
        '<div class="stat__label">' + esc(c.label) + '</div>' +
        '<div class="stat__value">' + esc(String(c.value)) + '</div>' +
        '<div class="stat__sub">' + esc(c.sub) + '</div></div>';
    }).join('');

    var attention = s.out.concat(s.low).slice(0, 8);
    $('[data-attention]').innerHTML = attention.length
      ? table(attention, { stockEditor: true })
      : '<div class="empty"><h3>Nothing needs attention</h3><p>Every product has healthy stock.</p></div>';

    var entries = readLog().slice(0, 6);
    $('[data-recent]').innerHTML = entries.length
      ? '<ul class="log">' + entries.map(logRow).join('') + '</ul>'
      : '<div class="empty"><h3>No changes yet</h3><p>Edits you make will be listed here.</p></div>';
  }

  function logRow(e) {
    return '<li><time>' + esc(when(e.at)) + '</time>' +
      '<span><b>' + esc(e.action) + '</b>' +
      (e.product ? ' — ' + esc(e.product) : '') +
      (e.detail ? ' <span class="what">' + esc(e.detail) + '</span>' : '') +
      '</span></li>';
  }

  /* ---------- product table -------------------------------------- */
  function table(list, opts) {
    opts = opts || {};
    if (!list.length) {
      return '<div class="empty"><h3>Nothing here</h3><p>Try a different search or filter.</p></div>';
    }

    var rows = list.map(function (p) {
      return '<tr>' +
        '<td><div class="cell-product">' +
          '<div class="thumb">' + global.ZNArt.packshot(p) + '</div>' +
          '<div><b>' + esc(p.name) + '</b><span>' + esc(p.brand) + ' · ' + esc(p.size) + '</span></div>' +
        '</div></td>' +
        '<td>' + esc(categoryName(p.category)) + '</td>' +
        '<td class="num">' + money(p.price) +
          (p.oldPrice ? ' <span class="tag tag--sale">offer</span>' : '') + '</td>' +
        '<td class="num">' + stepper(p) + '</td>' +
        '<td>' + stockTag(p) + '</td>' +
        '<td class="num">' + money(p.price * Math.max(0, p.stock)) + '</td>' +
        '<td><div class="rowactions">' +
          '<button class="b b-ghost b-sm" data-edit="' + esc(p.id) + '">Edit</button>' +
          '<a class="b b-ghost b-sm" href="product.html?id=' + encodeURIComponent(p.id) + '" ' +
            'target="_blank" rel="noopener" title="Open this product on the shop">View</a>' +
        '</div></td>' +
      '</tr>';
    }).join('');

    return '<table><thead><tr>' +
      th('Product', 'name', opts) +
      th('Department', 'category', opts) +
      th('Price', 'price', opts, true) +
      '<th class="num">Stock</th>' +
      '<th>Status</th>' +
      th('Value', 'value', opts, true) +
      '<th></th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function th(label, key, opts, num) {
    if (!opts.sortable) return '<th' + (num ? ' class="num"' : '') + '>' + esc(label) + '</th>';
    var arrow = sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';
    return '<th class="sortable' + (num ? ' num' : '') + '" data-sort="' + key + '">' +
      esc(label) + arrow + '</th>';
  }

  function stepper(p) {
    return '<span class="stepper">' +
      '<button data-stock-down="' + esc(p.id) + '" aria-label="Reduce stock for ' + esc(p.name) + '">−</button>' +
      '<input type="number" min="0" value="' + p.stock + '" data-stock-set="' + esc(p.id) + '" ' +
        'aria-label="Stock for ' + esc(p.name) + '">' +
      '<button data-stock-up="' + esc(p.id) + '" aria-label="Increase stock for ' + esc(p.name) + '">+</button>' +
    '</span>';
  }

  function categoryName(id) {
    var c = global.ZN_CATEGORIES.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : id;
  }

  function filtered() {
    var list = products.filter(function (p) {
      if (filters.cat && p.category !== filters.cat) return false;
      if (filters.brand && p.brand !== filters.brand) return false;
      if (filters.stock === 'in' && p.stock <= LOW_STOCK) return false;
      if (filters.stock === 'low' && !(p.stock > 0 && p.stock <= LOW_STOCK)) return false;
      if (filters.stock === 'out' && p.stock > 0) return false;
      if (filters.stock === 'sale' && !p.oldPrice) return false;
      if (filters.q) {
        var hay = (p.name + ' ' + p.brand + ' ' + p.id + ' ' + p.size).toLowerCase();
        if (hay.indexOf(filters.q.toLowerCase()) === -1) return false;
      }
      return true;
    });

    return list.sort(function (a, b) {
      var av, bv;
      switch (sort.key) {
        case 'price':    av = a.price; bv = b.price; break;
        case 'value':    av = a.price * Math.max(0, a.stock); bv = b.price * Math.max(0, b.stock); break;
        case 'category': av = a.category; bv = b.category; break;
        default:         av = a.name.toLowerCase(); bv = b.name.toLowerCase();
      }
      if (av < bv) return -sort.dir;
      if (av > bv) return sort.dir;
      return 0;
    });
  }

  function paintProducts() {
    var list = filtered();
    $('[data-table]').innerHTML = table(list, { sortable: true });
    $('[data-count]').textContent = list.length === products.length
      ? products.length + ' products'
      : list.length + ' of ' + products.length + ' products';
  }

  /* ---------- inventory ------------------------------------------ */
  function paintInventory() {
    var s = stats();

    $('[data-inv-stats]').innerHTML = [
      { label: 'Units on hand', value: s.units, sub: 'across ' + products.length + ' products' },
      { label: 'Stock value', value: money(s.value), sub: 'at retail price' },
      { label: 'Sold out', value: s.out.length, sub: 'nothing to sell', cls: s.out.length ? ' stat--bad' : '' },
      { label: 'Running low', value: s.low.length, sub: LOW_STOCK + ' or fewer', cls: s.low.length ? ' stat--warn' : '' }
    ].map(function (c) {
      return '<div class="stat' + (c.cls || '') + '">' +
        '<div class="stat__label">' + esc(c.label) + '</div>' +
        '<div class="stat__value">' + esc(String(c.value)) + '</div>' +
        '<div class="stat__sub">' + esc(c.sub) + '</div></div>';
    }).join('');

    $('[data-inv-out]').innerHTML = s.out.length
      ? table(s.out, {})
      : '<div class="empty"><h3>Nothing is sold out</h3><p>Every product has stock against it.</p></div>';

    $('[data-inv-low]').innerHTML = s.low.length
      ? table(s.low, {})
      : '<div class="empty"><h3>No low stock</h3><p>Everything is above ' + LOW_STOCK + ' units.</p></div>';

    var byBrand = {};
    products.forEach(function (p) {
      var b = byBrand[p.brand] || (byBrand[p.brand] = { units: 0, value: 0, items: 0, out: 0 });
      b.units += Math.max(0, p.stock);
      b.value += p.price * Math.max(0, p.stock);
      b.items += 1;
      if (p.stock <= 0) b.out += 1;
    });

    var brandRows = Object.keys(byBrand).sort(function (a, b) {
      return byBrand[b].value - byBrand[a].value;
    }).map(function (name) {
      var b = byBrand[name];
      return '<tr>' +
        '<td><b>' + esc(name) + '</b></td>' +
        '<td class="num">' + b.items + '</td>' +
        '<td class="num">' + b.units + '</td>' +
        '<td class="num">' + money(b.value) + '</td>' +
        '<td class="num">' + (b.out ? '<span class="tag tag--out">' + b.out + ' sold out</span>' : '—') + '</td>' +
      '</tr>';
    }).join('');

    $('[data-inv-brand]').innerHTML = '<table><thead><tr>' +
      '<th>Brand</th><th class="num">Products</th><th class="num">Units</th>' +
      '<th class="num">Stock value</th><th class="num">Sold out</th>' +
      '</tr></thead><tbody>' + brandRows + '</tbody></table>';
  }

  /* ---------- activity ------------------------------------------- */
  function paintActivity() {
    var entries = readLog();
    $('[data-log]').innerHTML = entries.length
      ? '<ul class="log">' + entries.map(logRow).join('') + '</ul>'
      : '<div class="empty"><h3>Nothing logged yet</h3>' +
        '<p>Add, edit or restock a product and it will appear here.</p></div>';
  }

  /* ---------- photo upload ---------------------------------------
     There's no backend yet, so the file never leaves the browser: it's
     resized on a canvas and kept as a data URL in the product's `image`
     field. That means an uploaded photo really does appear on the shop,
     which is the point of the demo. When the backend lands, only
     storeFile() changes — it POSTs the blob and keeps the returned URL.
  ---------------------------------------------------------------- */
  var MAX_BYTES = 5 * 1024 * 1024;
  var MAX_EDGE = 900;

  function prettySize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  /** Draw the file onto a canvas at a sane size and return a data URL. */
  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();

      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        if (!w || !h) { reject(new Error("that file doesn't look like an image")); return; }

        var scale = Math.min(1, MAX_EDGE / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));

        var c = doc.createElement('canvas');
        c.width = cw;
        c.height = ch;
        var g = c.getContext('2d');
        g.fillStyle = '#FFFFFF';
        g.fillRect(0, 0, cw, ch);
        g.drawImage(img, 0, 0, cw, ch);

        var hasAlpha = /png|webp/i.test(file.type);
        resolve({
          dataUrl: c.toDataURL(hasAlpha ? 'image/png' : 'image/jpeg', 0.85),
          width: cw, height: ch
        });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("that file couldn't be opened as an image"));
      };
      img.src = url;
    });
  }

  function paintUpload(state) {
    var host = $('[data-upload]');
    if (!host) return;

    if (!state) {
      host.hidden = true;
      host.innerHTML = '';
      $('[data-dropzone]').hidden = false;
      return;
    }

    $('[data-dropzone]').hidden = true;
    host.hidden = false;
    host.innerHTML =
      '<div class="upload' + (state.done ? ' is-done' : '') + '">' +
        '<div class="upload__thumb">' +
          (state.src ? '<img src="' + esc(state.src) + '" alt="">' : '') +
        '</div>' +
        '<div class="upload__meta">' +
          '<div class="upload__name">' + esc(state.name) + '</div>' +
          '<div class="upload__sub">' + esc(state.sub) + '</div>' +
          (state.done ? '' : '<div class="bar"><div class="bar__fill" style="width:' +
            (state.progress || 0) + '%"></div></div>') +
        '</div>' +
        (state.done
          ? '<button type="button" class="b b-danger b-sm" data-remove-photo>Remove</button>'
          : '') +
      '</div>';
  }

  /** Swap this for a real POST when the backend exists. */
  function storeFile(file, onProgress) {
    return new Promise(function (resolve, reject) {
      // Fake the transfer so the interface behaves the way it will later.
      var pct = 0;
      var tick = setInterval(function () {
        pct = Math.min(92, pct + 9 + Math.random() * 14);
        onProgress(pct);
      }, 90);

      resizeImage(file).then(function (out) {
        clearInterval(tick);
        onProgress(100);
        setTimeout(function () { resolve(out); }, 180);
      }).catch(function (err) {
        clearInterval(tick);
        reject(err);
      });
    });
  }

  function handlePhoto(file) {
    var err = $('[data-err="image"]');
    err.textContent = '';

    if (!file) return;
    if (!/^image\//.test(file.type)) {
      err.textContent = 'Pick an image file — JPG, PNG or WebP.';
      return;
    }
    if (file.size > MAX_BYTES) {
      err.textContent = 'That photo is ' + prettySize(file.size) +
        '. The limit is ' + prettySize(MAX_BYTES) + ' — try a smaller one.';
      return;
    }

    paintUpload({ name: file.name, sub: 'Uploading… ' + prettySize(file.size), progress: 4 });

    storeFile(file, function (pct) {
      var fill = $('[data-upload] .bar__fill');
      if (fill) fill.style.width = pct + '%';
    }).then(function (out) {
      fld('image').value = out.dataUrl;
      paintUpload({
        name: file.name,
        sub: out.width + ' × ' + out.height + ' · ' + prettySize(out.dataUrl.length * 0.75),
        src: out.dataUrl,
        done: true
      });
      paintPreview();
      toast('Photo attached');
    }).catch(function (e) {
      paintUpload(null);
      err.textContent = 'Upload failed — ' + e.message + '.';
    });
  }

  function showExistingPhoto(url) {
    if (!url) { paintUpload(null); return; }
    paintUpload({
      name: /^data:/.test(url) ? 'Uploaded photo' : url.replace(/^https?:\/\//, '').slice(0, 48),
      sub: /^data:/.test(url) ? 'held in this browser' : 'linked from another site',
      src: url,
      done: true
    });
  }

  function wireUpload() {
    var zone = $('[data-dropzone]');
    var input = $('[data-photo-input]');
    if (!zone || !input) return;

    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });

    input.addEventListener('change', function () {
      if (input.files && input.files[0]) handlePhoto(input.files[0]);
      input.value = '';
    });

    ['dragenter', 'dragover'].forEach(function (t) {
      zone.addEventListener(t, function (e) {
        e.preventDefault();
        zone.classList.add('is-over');
      });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      zone.addEventListener(t, function (e) {
        e.preventDefault();
        zone.classList.remove('is-over');
      });
    });
    zone.addEventListener('drop', function (e) {
      var dt = e.dataTransfer;
      if (dt && dt.files && dt.files[0]) handlePhoto(dt.files[0]);
    });

    // Dropping a file anywhere else in the window shouldn't navigate away.
    ['dragover', 'drop'].forEach(function (t) {
      global.addEventListener(t, function (e) {
        if (!e.target.closest || !e.target.closest('[data-dropzone]')) e.preventDefault();
      });
    });
  }

  /* ---------- editor --------------------------------------------- */
  function openEditor(id) {
    editing = id || null;
    var p = id ? products.filter(function (x) { return x.id === id; })[0] : null;

    $('[data-drawer-title]').textContent = p ? 'Edit product' : 'Add a product';
    $('[data-delete]').hidden = !p;

    var live = $('[data-view-live]');
    if (p) {
      live.hidden = false;
      live.href = 'product.html?id=' + encodeURIComponent(p.id);
    } else {
      live.hidden = true;
    }

    fld('name').value = p ? p.name : '';
    fld('brand').value = p ? p.brand : Object.keys(global.ZN_BRANDS)[0];
    fld('category').value = p ? p.category : global.ZN_CATEGORIES[0].id;
    fld('price').value = p ? p.price : '';
    fld('oldPrice').value = p && p.oldPrice ? p.oldPrice : '';
    fld('size').value = p ? p.size : '';
    fld('stock').value = p ? p.stock : 0;
    fld('pack').value = p ? p.pack : 'box';
    fld('rating').value = p ? p.rating : 0;
    fld('reviews').value = p ? p.reviews : 0;
    fld('blurb').value = p ? p.blurb : '';
    fld('image').value = p && p.image ? p.image : '';
    fld('id').value = p ? p.id : '';

    $$('[data-diets] input').forEach(function (cb) {
      cb.checked = !!(p && p.diets.indexOf(cb.value) > -1);
    });

    showExistingPhoto(p && p.image ? p.image : '');
    clearErrors();
    paintPreview();

    $('[data-drawer]').setAttribute('data-open', 'true');
    $('[data-drawer]').setAttribute('aria-hidden', 'false');
    $('[data-scrim]').setAttribute('data-open', 'true');
    doc.body.style.overflow = 'hidden';
    setTimeout(function () { fld('name').focus(); }, 60);
  }

  function closeEditor() {
    $('[data-drawer]').setAttribute('data-open', 'false');
    $('[data-drawer]').setAttribute('aria-hidden', 'true');
    $('[data-scrim]').setAttribute('data-open', 'false');
    doc.body.style.overflow = '';
    editing = null;
  }

  function formValues() {
    function val(n) { return fld(n).value; }
    function num(n) { return val(n) === '' ? NaN : parseFloat(val(n)); }
    function int(n) { return val(n) === '' ? NaN : parseInt(val(n), 10); }

    return {
      name: val('name').trim(),
      brand: val('brand'),
      category: val('category'),
      price: num('price'),
      oldPrice: val('oldPrice') === '' ? null : parseFloat(val('oldPrice')),
      size: val('size').trim(),
      stock: int('stock'),
      pack: val('pack'),
      rating: val('rating') === '' ? 0 : parseFloat(val('rating')),
      reviews: val('reviews') === '' ? 0 : parseInt(val('reviews'), 10),
      blurb: val('blurb').trim(),
      image: val('image').trim() || null,
      id: val('id').trim() || slug(val('brand') + ' ' + val('name') + ' ' + val('size')),
      diets: $$('[data-diets] input').filter(function (c) { return c.checked; })
        .map(function (c) { return c.value; })
    };
  }

  function clearErrors() {
    $$('[data-err]').forEach(function (el) { el.textContent = ''; });
    $$('.field').forEach(function (el) { el.classList.remove('field--error'); });
  }

  function setError(field, msg) {
    var el = $('[data-err="' + field + '"]');
    if (!el) return;
    el.textContent = msg;
    var wrap = el.closest('.field');
    if (wrap) wrap.classList.add('field--error');
  }

  function validate(v) {
    clearErrors();
    var ok = true;

    if (!v.name) { setError('name', 'Give the product a name.'); ok = false; }
    if (!v.size) { setError('size', 'Add the pack size, e.g. 250 g.'); ok = false; }
    if (!v.blurb) { setError('blurb', 'Write one line describing it.'); ok = false; }

    if (isNaN(v.price) || v.price <= 0) {
      setError('price', 'Enter a price above zero.'); ok = false;
    }
    if (v.oldPrice !== null) {
      if (isNaN(v.oldPrice) || v.oldPrice <= 0) {
        setError('oldPrice', 'Remove this, or enter a price above zero.'); ok = false;
      } else if (!isNaN(v.price) && v.oldPrice <= v.price) {
        setError('oldPrice', 'The old price has to be higher than the current one.'); ok = false;
      }
    }
    if (isNaN(v.stock) || v.stock < 0) {
      setError('stock', 'Enter 0 or more.'); ok = false;
    }
    if (isNaN(v.rating) || v.rating < 0 || v.rating > 5) {
      setError('rating', 'Between 0 and 5.'); ok = false;
    }
    if (isNaN(v.reviews) || v.reviews < 0) {
      setError('reviews', 'Enter 0 or more.'); ok = false;
    }
    if (v.image && !/^(https?:\/\/|data:image\/)/i.test(v.image)) {
      setError('image', 'Upload a file, or paste an address starting with http:// or https://.');
      ok = false;
    }
    if (!v.id) {
      setError('id', 'A product code is needed.'); ok = false;
    } else if (products.some(function (p) { return p.id === v.id && p.id !== editing; })) {
      setError('id', 'Another product already uses that code.'); ok = false;
    }
    return ok;
  }

  function paintPreview() {
    var v = formValues();
    var draft = {
      id: v.id || 'draft',
      name: v.name || 'New product',
      brand: v.brand,
      size: v.size || '—',
      pack: v.pack,
      image: v.image
    };
    $('[data-preview-shot]').innerHTML = global.ZNArt.packshot(draft);
    $('[data-preview-name]').textContent = draft.name;
    $('[data-preview-sub]').textContent = v.brand + ' · ' + draft.size +
      ' · ' + (isNaN(v.stock) ? 0 : v.stock) + ' in stock';
    $('[data-preview-price]').innerHTML = isNaN(v.price)
      ? '<span style="color:var(--a-muted)">no price yet</span>'
      : (v.oldPrice ? '<span style="text-decoration:line-through;color:var(--a-muted);font-size:.85rem">' +
          money(v.oldPrice) + '</span> ' : '') + money(v.price);
  }

  function saveProduct() {
    var v = formValues();
    if (!validate(v)) { toast('Check the highlighted fields'); return; }

    var record = {
      id: v.id, name: v.name, brand: v.brand, category: v.category,
      price: v.price, size: v.size, diets: v.diets, stock: v.stock,
      rating: v.rating, reviews: v.reviews, pack: v.pack, blurb: v.blurb
    };
    if (v.oldPrice) record.oldPrice = v.oldPrice;
    if (v.image) record.image = v.image;

    if (editing) {
      var before = products.filter(function (p) { return p.id === editing; })[0];
      var changes = [];
      if (before.price !== record.price) changes.push('price ' + money(before.price) + ' → ' + money(record.price));
      if (before.stock !== record.stock) changes.push('stock ' + before.stock + ' → ' + record.stock);
      if (before.name !== record.name) changes.push('renamed');

      products = products.map(function (p) { return p.id === editing ? record : p; });
      logEntry('Edited', record.name, record.id, changes.join(', '));
      toast('Saved ' + record.name);
    } else {
      products.push(record);
      logEntry('Added', record.name, record.id, money(record.price) + ', ' + record.stock + ' in stock');
      toast('Added ' + record.name);
    }

    persist();
    closeEditor();
    repaint();
  }

  function deleteProduct() {
    if (!editing) return;
    var p = products.filter(function (x) { return x.id === editing; })[0];
    if (!p) return;
    if (!global.confirm('Delete "' + p.name + '"? It will disappear from the shop.')) return;

    products = products.filter(function (x) { return x.id !== editing; });
    logEntry('Deleted', p.name, p.id, '');
    persist();
    closeEditor();
    repaint();
    toast('Deleted ' + p.name);
  }

  /* ---------- stock adjustments ---------------------------------- */
  function setStock(id, value) {
    var p = products.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var next = Math.max(0, isNaN(value) ? 0 : value);
    if (next === p.stock) return;
    var before = p.stock;
    p.stock = next;
    logEntry('Stock changed', p.name, p.id, before + ' → ' + next);
    persist();
    repaint();
  }

  /* ---------- export / import ------------------------------------ */
  function download(filename, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = doc.createElement('a');
    a.href = url;
    a.download = filename;
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function productsFileText() {
    var lines = products.map(function (p) {
      var o = {
        id: p.id, name: p.name, brand: p.brand, category: p.category,
        price: p.price
      };
      if (p.oldPrice) o.oldPrice = p.oldPrice;
      o.size = p.size;
      o.diets = p.diets;
      o.stock = p.stock;
      o.rating = p.rating;
      o.reviews = p.reviews;
      o.pack = p.pack;
      o.blurb = p.blurb;
      if (p.image) o.image = p.image;
      return '  ' + JSON.stringify(o);
    }).join(',\n');

    return '/* ------------------------------------------------------------------\n' +
      '   Zero Nine Trading — catalogue data\n' +
      '   ------------------------------------------------------------------\n' +
      '   Exported from the admin panel on ' + new Date().toISOString() + '\n' +
      '   Replaces assets/js/products.js. Commit and push to publish.\n' +
      '------------------------------------------------------------------- */\n\n' +
      'window.ZN_BRANDS = ' + JSON.stringify(global.ZN_BRANDS, null, 2) + ';\n\n' +
      'window.ZN_CATEGORIES = ' + JSON.stringify(global.ZN_CATEGORIES, null, 2) + ';\n\n' +
      'window.ZN_DIETS = ' + JSON.stringify(global.ZN_DIETS, null, 2) + ';\n\n' +
      'window.ZN_PRODUCTS = [\n' + lines + '\n];\n';
  }

  function importJson(file) {
    var msg = $('[data-import-msg]');
    var reader = new FileReader();

    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var list = Array.isArray(data) ? data : data.products;
        if (!Array.isArray(list) || !list.length) throw new Error('no products');

        var bad = list.filter(function (p) { return !p.id || !p.name; });
        if (bad.length) throw new Error('every product needs an id and a name');

        products = list;
        logEntry('Imported catalogue', '', '', list.length + ' products from ' + file.name);
        persist();
        repaint();
        msg.style.color = 'var(--a-pine)';
        msg.textContent = 'Loaded ' + list.length + ' products from ' + file.name + '.';
        toast('Catalogue loaded');
      } catch (e) {
        msg.style.color = 'var(--a-berry)';
        msg.textContent = "That file couldn't be read — " + e.message + '.';
      }
    };
    reader.onerror = function () {
      msg.style.color = 'var(--a-berry)';
      msg.textContent = "That file couldn't be read.";
    };
    reader.readAsText(file);
  }

  /* ---------- views ---------------------------------------------- */
  function showView(name) {
    $$('[data-panel]').forEach(function (s) {
      s.hidden = s.getAttribute('data-panel') !== name;
    });
    $$('.navitem[data-view]').forEach(function (b) {
      b.setAttribute('aria-current', b.getAttribute('data-view') === name ? 'true' : 'false');
    });
    if (name === 'dashboard') paintDashboard();
    if (name === 'products') paintProducts();
    if (name === 'inventory') paintInventory();
    if (name === 'activity') paintActivity();
    global.scrollTo(0, 0);
  }

  function currentView() {
    var open = $$('[data-panel]').filter(function (s) { return !s.hidden; })[0];
    return open ? open.getAttribute('data-panel') : 'dashboard';
  }

  function repaint() {
    var s = stats();
    var badge = $('[data-low-badge]');
    var needs = s.low.length + s.out.length;
    badge.hidden = needs === 0;
    badge.textContent = needs;
    showView(currentView());
  }

  /* ---------- populate the form's select lists ----------------------- */
  function buildFormOptions() {
    fld('brand').innerHTML = Object.keys(global.ZN_BRANDS).map(function (b) {
      return '<option value="' + esc(b) + '">' + esc(b) + '</option>';
    }).join('');

    fld('category').innerHTML = global.ZN_CATEGORIES.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>';
    }).join('');

    fld('pack').innerHTML = PACK_TYPES.map(function (p) {
      return '<option value="' + p + '">' + p.charAt(0).toUpperCase() + p.slice(1) + '</option>';
    }).join('');

    $('[data-diets]').innerHTML = global.ZN_DIETS.map(function (d) {
      return '<label><input type="checkbox" value="' + esc(d.id) + '"> ' + esc(d.name) + '</label>';
    }).join('');

    $('[data-f-cat]').innerHTML = '<option value="">All departments</option>' +
      global.ZN_CATEGORIES.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>';
      }).join('');

    $('[data-f-brand]').innerHTML = '<option value="">All brands</option>' +
      Object.keys(global.ZN_BRANDS).map(function (b) {
        return '<option value="' + esc(b) + '">' + esc(b) + '</option>';
      }).join('');
  }

  /* ---------- events --------------------------------------------- */
  function wire() {
    doc.addEventListener('click', function (e) {
      var t = e.target.closest('[data-view],[data-new],[data-edit],[data-close-drawer],[data-scrim],' +
        '[data-save],[data-delete],[data-logout],[data-stock-up],[data-stock-down],[data-sort],' +
        '[data-export-js],[data-export-json],[data-reset],[data-clear-log],[data-restock-all],' +
        '[data-remove-photo]');
      if (!t) return;

      if (t.hasAttribute('data-view')) { showView(t.getAttribute('data-view')); return; }
      if (t.hasAttribute('data-new')) { openEditor(null); return; }
      if (t.hasAttribute('data-edit')) { openEditor(t.getAttribute('data-edit')); return; }
      if (t.hasAttribute('data-close-drawer') || t.hasAttribute('data-scrim')) { closeEditor(); return; }
      if (t.hasAttribute('data-save')) { saveProduct(); return; }
      if (t.hasAttribute('data-delete')) { deleteProduct(); return; }

      if (t.hasAttribute('data-logout')) {
        session(null);
        global.location.reload();
        return;
      }

      if (t.hasAttribute('data-stock-up') || t.hasAttribute('data-stock-down')) {
        var id = t.getAttribute('data-stock-up') || t.getAttribute('data-stock-down');
        var p = products.filter(function (x) { return x.id === id; })[0];
        if (p) setStock(id, p.stock + (t.hasAttribute('data-stock-up') ? 1 : -1));
        return;
      }

      if (t.hasAttribute('data-sort')) {
        var key = t.getAttribute('data-sort');
        if (sort.key === key) sort.dir = -sort.dir;
        else { sort.key = key; sort.dir = 1; }
        paintProducts();
        return;
      }

      if (t.hasAttribute('data-export-js')) {
        download('products.js', productsFileText(), 'text/javascript;charset=utf-8');
        toast('products.js downloaded');
        return;
      }

      if (t.hasAttribute('data-export-json')) {
        download('products.json', JSON.stringify(products, null, 2), 'application/json');
        toast('products.json downloaded');
        return;
      }

      if (t.hasAttribute('data-reset')) {
        if (!global.confirm('Discard every change made in this browser and go back to the committed catalogue?')) return;
        global.ZN.catalogue.reset();
        products = global.ZN.catalogue.all();
        logEntry('Reset catalogue', '', '', 'back to the committed version');
        repaint();
        paintNotice();
        toast('Back to the committed catalogue');
        return;
      }

      if (t.hasAttribute('data-remove-photo')) {
        fld('image').value = '';
        paintUpload(null);
        paintPreview();
        toast('Photo removed');
        return;
      }

      if (t.hasAttribute('data-clear-log')) {
        if (!global.confirm('Clear the activity log? The products themselves are not affected.')) return;
        writeLog([]);
        paintActivity();
        toast('Log cleared');
        return;
      }

      if (t.hasAttribute('data-restock-all')) {
        var out = products.filter(function (p) { return p.stock <= 0; });
        if (!out.length) { toast('Nothing is sold out'); return; }
        if (!global.confirm('Set stock to 12 for all ' + out.length + ' sold-out products?')) return;
        out.forEach(function (p) { p.stock = 12; });
        logEntry('Restocked', '', '', out.length + ' sold-out products set to 12');
        persist();
        repaint();
        toast(out.length + ' products restocked');
        return;
      }
    });

    doc.addEventListener('input', function (e) {
      var t = e.target;
      if (t.closest('[data-form]')) { paintPreview(); return; }
      if (t.hasAttribute('data-q')) { filters.q = t.value; paintProducts(); return; }
    });

    doc.addEventListener('change', function (e) {
      var t = e.target;
      if (t.hasAttribute('data-f-cat')) { filters.cat = t.value; paintProducts(); return; }
      if (t.hasAttribute('data-f-brand')) { filters.brand = t.value; paintProducts(); return; }
      if (t.hasAttribute('data-f-stock')) { filters.stock = t.value; paintProducts(); return; }
      if (t.hasAttribute('data-stock-set')) {
        setStock(t.getAttribute('data-stock-set'), parseInt(t.value, 10));
        return;
      }
      if (t.hasAttribute('data-import') && t.files && t.files[0]) {
        importJson(t.files[0]);
        t.value = '';
        return;
      }
      if (t.closest('[data-form]')) paintPreview();
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('[data-drawer]').getAttribute('data-open') === 'true') closeEditor();
    });

    // The form has no submit button of its own; Enter shouldn't reload the page.
    $('[data-form]').addEventListener('submit', function (e) { e.preventDefault(); saveProduct(); });
  }

  /* ---------- boot ----------------------------------------------- */
  function start() {
    $('[data-gate]').hidden = true;
    $('[data-gate]').style.display = 'none';
    $('[data-app]').hidden = false;

    products = global.ZN.catalogue.all();
    buildFormOptions();
    wire();
    wireUpload();
    paintNotice();
    repaint();
  }

  $('[data-login]').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('#pw');
    var err = $('[data-login-err]');

    if (digest(input.value) === PASSWORD_DIGEST) {
      session('open');
      start();
    } else {
      err.textContent = "That password isn't right. Try again.";
      input.value = '';
      input.focus();
    }
  });

  if (session() === 'open') start();

})(window);
