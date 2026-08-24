/* ------------------------------------------------------------------
   store.js — catalogue access, cart state, money formatting

   ZN.load() is the single entry point every page uses to get products.
   Point ZN_CONFIG.apiUrl at the admin backend and the whole site
   switches from the bundled file to live data. Nothing else changes.
------------------------------------------------------------------- */
window.ZN_CONFIG = {
  /* Set to e.g. 'https://api.zeronine.com.cy/products' once the
     admin backend is live. null = use the bundled products.js. */
  apiUrl: null,

  currency: 'EUR',
  locale: 'el-CY',
  freeDeliveryFrom: 50,
  deliveryFee: 3.50,
  vatNote: 'VAT included',
  phone: '22 26 03 09',
  phoneHref: 'tel:+35722260309',
  email: 'eshop@zeronine.com.cy',
  address: 'Lefkosias 53, Latsia, 2236 Nicosia, Cyprus',
  hours: 'Monday to Friday, 8:00 – 17:00',
  facebook: 'https://www.facebook.com/ZeroNineTradingltd/',
  instagram: 'https://www.instagram.com/zero_nine_trading/'
};

(function (global) {
  'use strict';

  var CART_KEY = 'zn.cart.v1';

  /* ---------- storage with a graceful fallback ------------------ */
  var memory = {};
  var canStore = (function () {
    try {
      var k = '__zn__';
      global.localStorage.setItem(k, '1');
      global.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;   // private mode, sandboxed iframe, storage disabled
    }
  })();

  function read(key) {
    try {
      return canStore ? global.localStorage.getItem(key) : (memory[key] || null);
    } catch (e) { return memory[key] || null; }
  }
  function write(key, value) {
    try {
      if (canStore) global.localStorage.setItem(key, value);
      else memory[key] = value;
    } catch (e) { memory[key] = value; }
  }

  /* ---------- money --------------------------------------------- */
  var fmt;
  try {
    fmt = new Intl.NumberFormat(global.ZN_CONFIG.locale, {
      style: 'currency', currency: global.ZN_CONFIG.currency
    });
  } catch (e) { fmt = null; }

  function money(n) {
    var v = Number(n) || 0;
    if (fmt) return fmt.format(v);
    return v.toFixed(2).replace('.', ',') + ' €';
  }

  /* ---------- catalogue ----------------------------------------- */
  var cache = null;

  function normalise(list) {
    return list.map(function (p) {
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: Number(p.price) || 0,
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        size: p.size || '',
        diets: p.diets || [],
        stock: typeof p.stock === 'number' ? p.stock : 0,
        rating: Number(p.rating) || 0,
        reviews: Number(p.reviews) || 0,
        pack: p.pack || 'box',
        blurb: p.blurb || '',
        image: p.image || null
      };
    });
  }

  function load() {
    if (cache) return Promise.resolve(cache);

    var url = global.ZN_CONFIG.apiUrl;
    if (!url) {
      cache = normalise(global.ZN_PRODUCTS || []);
      return Promise.resolve(cache);
    }
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        cache = normalise(Array.isArray(data) ? data : (data.products || []));
        return cache;
      })
      .catch(function () {
        // Never leave the shop empty because an API call failed.
        cache = normalise(global.ZN_PRODUCTS || []);
        return cache;
      });
  }

  function byId(id) {
    return (cache || normalise(global.ZN_PRODUCTS || [])).filter(function (p) {
      return p.id === id;
    })[0] || null;
  }

  /* ---------- cart ---------------------------------------------- */
  var listeners = [];

  function getCart() {
    try {
      var raw = read(CART_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function setCart(items) {
    write(CART_KEY, JSON.stringify(items));
    listeners.forEach(function (fn) { fn(items); });
  }

  function add(id, qty) {
    var items = getCart();
    var n = Math.max(1, qty || 1);
    var row = items.filter(function (i) { return i.id === id; })[0];
    if (row) row.qty += n;
    else items.push({ id: id, qty: n });
    setCart(items);
    return items;
  }

  function setQty(id, qty) {
    var items = getCart().map(function (i) {
      return i.id === id ? { id: id, qty: qty } : i;
    }).filter(function (i) { return i.qty > 0; });
    setCart(items);
    return items;
  }

  function remove(id) {
    setCart(getCart().filter(function (i) { return i.id !== id; }));
  }

  function clear() { setCart([]); }

  function count() {
    return getCart().reduce(function (t, i) { return t + i.qty; }, 0);
  }

  /** Cart rows joined to product records, plus totals. */
  function detailed() {
    var rows = getCart().map(function (i) {
      var p = byId(i.id);
      return p ? { product: p, qty: i.qty, line: p.price * i.qty } : null;
    }).filter(Boolean);

    var subtotal = rows.reduce(function (t, r) { return t + r.line; }, 0);
    var free = subtotal >= global.ZN_CONFIG.freeDeliveryFrom;
    var delivery = rows.length === 0 || free ? 0 : global.ZN_CONFIG.deliveryFee;

    return {
      rows: rows,
      subtotal: subtotal,
      delivery: delivery,
      freeDelivery: free,
      remaining: Math.max(0, global.ZN_CONFIG.freeDeliveryFrom - subtotal),
      total: subtotal + delivery
    };
  }

  function onChange(fn) { listeners.push(fn); }

  global.ZN = {
    load: load,
    byId: byId,
    money: money,
    cart: {
      get: getCart, add: add, setQty: setQty, remove: remove,
      clear: clear, count: count, detailed: detailed, onChange: onChange
    },
    storageAvailable: canStore
  };
})(window);
