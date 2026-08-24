/* ------------------------------------------------------------------
   app.js — shared chrome for every page

   Header, footer, mobile nav, cart drawer, toasts and the product
   card renderer live here so all seven pages stay identical. In the
   production build these become framework components; the markup
   moves across as-is.
------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var doc = document;
  var C = global.ZN_CONFIG;

  /* Real logo, served from the client's own domain. If it can't be
     reached (offline demo, hotlink block) the local mark takes over. */
  var LOGO_REMOTE = 'https://zeronine.com.cy/wp-content/uploads/2022/03/logo-newsmall.png';
  var LOGO_LOCAL = 'assets/img/logo.svg';
  var LOGO_TAG = '<img src="' + LOGO_REMOTE + '" alt="Zero Nine Trading — organic, bio, Cyprus" ' +
    'width="150" height="46" onerror="this.onerror=null;this.src=\'' + LOGO_LOCAL + '\'">';

  /* ---------- icons --------------------------------------------- */
  var I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v2a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 3.2 2 2 0 014.1 1h2a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.4 2.1L7.1 8.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.4 1.8.6 2.8.8a2 2 0 011.7 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1116 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h11v9H2zM13 10h4l4 3v3h-8z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4C10 4 4 9 4 17c0 1.5.3 2.5.3 2.5S9 20 13 17c4-3 7-8 7-13z"/><path d="M4 20c3-6 7-9 12-11"/></svg>',
    basket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18l-2 11H5L3 9z"/><path d="M8 9l3-6M16 9l-3-6"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V7.2c0-.8.2-1.2 1.4-1.2H17V3h-2.6C11.6 3 10.5 4.4 10.5 7v2H8.5v3h2v9h3.5v-9h2.4l.3-3H14z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'
  };

  /* ---------- helpers ------------------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function param(name) {
    return new URLSearchParams(global.location.search).get(name);
  }

  function dietName(id) {
    var d = (global.ZN_DIETS || []).filter(function (x) { return x.id === id; })[0];
    return d ? d.name : id;
  }
  function dietShort(id) {
    var d = (global.ZN_DIETS || []).filter(function (x) { return x.id === id; })[0];
    return d ? d.short : id;
  }
  function categoryName(id) {
    var c = (global.ZN_CATEGORIES || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.name : id;
  }

  function stars(rating, reviews) {
    if (!reviews) return '<span class="stars">No reviews yet</span>';
    var full = Math.round(rating);
    var glyphs = '';
    for (var i = 0; i < 5; i++) glyphs += i < full ? '★' : '☆';
    return '<span class="stars"><span class="stars__glyphs">' + glyphs + '</span>' +
      '<span>(' + reviews + ')</span></span>';
  }

  /* ---------- product card -------------------------------------- */
  function card(p) {
    var out = p.stock <= 0;
    var save = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    var href = 'product.html?id=' + encodeURIComponent(p.id);

    var flags = '';
    if (out) flags += '<span class="flag flag--out">Sold out</span>';
    if (save > 0) flags += '<span class="flag flag--save">Save ' + save + '%</span>';

    var badges = p.diets.map(function (d) {
      return '<span class="diet-badge" title="' + esc(dietName(d)) + '">' + esc(dietShort(d)) + '</span>';
    }).join('');

    return '' +
      '<article class="card' + (out ? ' card--out' : '') + '">' +
        '<div class="card__media">' +
          '<a href="' + href + '" class="packshot" aria-label="' + esc(p.brand + ' ' + p.name) + '">' +
            global.ZNArt.packshot(p) +
          '</a>' +
          (flags ? '<div class="card__flags">' + flags + '</div>' : '') +
        '</div>' +
        '<div class="card__brand" style="color:' + esc(brandInk(p.brand)) + '">' + esc(p.brand) + '</div>' +
        '<h3 class="card__title"><a href="' + href + '">' + esc(p.name) + '</a></h3>' +
        '<div class="card__size">' + esc(p.size) + '</div>' +
        (badges ? '<div class="diet-badges">' + badges + '</div>' : '') +
        stars(p.rating, p.reviews) +
        '<div class="card__foot">' +
          '<div class="price">' +
            (p.oldPrice ? '<small>' + global.ZN.money(p.oldPrice) + '</small>' : '') +
            global.ZN.money(p.price) +
          '</div>' +
          (out
            ? '<button class="btn btn--ghost btn--sm" disabled>Sold out</button>'
            : '<button class="btn btn--lime btn--sm" data-add="' + esc(p.id) + '">Add</button>') +
        '</div>' +
      '</article>';
  }

  function brandColor(name) {
    var b = (global.ZN_BRANDS || {})[name];
    return b ? b.color : '#174436';
  }

  /* The vivid brand colour is fine as a swatch but several are too light
     for small text on white, so text uses the darkened variant. */
  function brandInk(name) {
    return global.ZNArt ? global.ZNArt.ink(brandColor(name)) : brandColor(name);
  }

  /* ---------- header -------------------------------------------- */
  function headerHtml(active) {
    var cats = (global.ZN_CATEGORIES || []).map(function (c) {
      return '<li><a href="shop.html?category=' + c.id + '">' + esc(c.name) + '</a></li>';
    }).join('');

    var brands = Object.keys(global.ZN_BRANDS || {}).map(function (b) {
      return '<li><a href="shop.html?brand=' + encodeURIComponent(b) + '">' + esc(b) + '</a></li>';
    }).join('');

    function nav(href, label, key, drop) {
      return '<li class="' + (drop ? 'has-drop' : '') + '">' +
        '<a class="mainnav__link" href="' + href + '"' +
        (active === key ? ' aria-current="page"' : '') + '>' + esc(label) +
        (drop ? ' <span aria-hidden="true">▾</span>' : '') + '</a>' +
        (drop ? '<ul class="dropdown">' + drop + '</ul>' : '') + '</li>';
    }

    return '' +
      '<div class="utility"><div class="wrap">' +
        '<span class="demo-flag">Demo build</span>' +
        '<span class="utility__item utility__hide-sm">' + I.truck + ' Free delivery over ' + global.ZN.money(C.freeDeliveryFrom) + '</span>' +
        '<span class="utility__spacer"></span>' +
        '<a class="utility__item utility__hide-sm" href="mailto:' + C.email + '">' + I.mail + ' ' + C.email + '</a>' +
        '<a class="utility__item" href="' + C.phoneHref + '">' + I.phone + ' ' + C.phone + '</a>' +
      '</div></div>' +

      '<div class="masthead">' +
        '<div class="wrap masthead__main">' +
          '<button class="btn-icon nav-toggle" data-open-nav aria-label="Open menu">' + I.menu + '</button>' +
          '<a class="brandmark" href="index.html">' + LOGO_TAG + '</a>' +
          '<form class="searchbar" role="search" action="shop.html" method="get">' +
            '<label class="sr-only" for="zn-search">Search products</label>' +
            I.search +
            '<input id="zn-search" name="q" type="search" placeholder="Search the catalogue — try “gluten free bread”" autocomplete="off">' +
            '<button class="btn btn--primary btn--sm searchbar__go" type="submit">Search</button>' +
          '</form>' +
          '<div class="masthead__tools">' +
            '<button class="btn-icon" data-open-cart aria-label="Open basket">' + I.cart +
              '<span class="count-bubble" data-cart-count data-empty="true">0</span></button>' +
          '</div>' +
        '</div>' +
        '<nav class="mainnav" aria-label="Main"><div class="wrap"><ul class="mainnav__list">' +
          nav('index.html', 'Home', 'home') +
          nav('shop.html', 'Shop all', 'shop') +
          nav('shop.html', 'Departments', 'cats', cats) +
          nav('shop.html', 'Brands', 'brands', brands) +
          nav('shop.html?sale=1', 'Offers', 'offers') +
          nav('recipes.html', 'Recipes', 'recipes') +
          nav('about.html', 'About', 'about') +
          nav('contact.html', 'Contact', 'contact') +
          '<li class="mainnav__phone"><span>Order by phone</span> <a href="' + C.phoneHref + '">' + C.phone + '</a></li>' +
        '</ul></div></nav>' +
      '</div>';
  }

  /* ---------- mobile nav ---------------------------------------- */
  function mobileNavHtml() {
    var cats = (global.ZN_CATEGORIES || []).map(function (c) {
      return '<a href="shop.html?category=' + c.id + '">' + esc(c.name) + '</a>';
    }).join('');
    var brands = Object.keys(global.ZN_BRANDS || {}).map(function (b) {
      return '<a href="shop.html?brand=' + encodeURIComponent(b) + '">' + esc(b) + '</a>';
    }).join('');

    return '<nav class="mobilenav" data-mobilenav aria-label="Mobile">' +
      '<div class="mobilenav__head">' +
        '<a class="brandmark" href="index.html">' + LOGO_TAG + '</a>' +
        '<button class="btn-icon" data-close-nav aria-label="Close menu">' + I.close + '</button>' +
      '</div>' +
      '<div class="mobilenav__body">' +
        '<a href="index.html">Home</a>' +
        '<a href="shop.html">Shop all</a>' +
        '<a href="shop.html?sale=1">Offers</a>' +
        '<div class="mobilenav__group">Departments</div>' + cats +
        '<div class="mobilenav__group">Brands</div>' + brands +
        '<div class="mobilenav__group">More</div>' +
        '<a href="recipes.html">Recipes</a>' +
        '<a href="about.html">About us</a>' +
        '<a href="contact.html">Contact</a>' +
      '</div></nav>';
  }

  /* ---------- cart drawer --------------------------------------- */
  function cartShellHtml() {
    return '<aside class="cart" data-cart aria-label="Basket" aria-hidden="true">' +
      '<div class="cart__head"><h2>Your basket</h2>' +
        '<button class="btn-icon" data-close-cart aria-label="Close basket">' + I.close + '</button></div>' +
      '<div class="cart__body" data-cart-body></div>' +
      '<div class="cart__foot" data-cart-foot></div>' +
      '</aside>';
  }

  function renderCart() {
    var body = doc.querySelector('[data-cart-body]');
    var foot = doc.querySelector('[data-cart-foot]');
    if (!body || !foot) return;

    var d = global.ZN.cart.detailed();

    if (!d.rows.length) {
      body.innerHTML = '<div class="empty-state"><h3>Nothing in the basket yet</h3>' +
        '<p>Browse the shop and add something you like.</p>' +
        '<a class="btn btn--primary" href="shop.html">Go to the shop</a></div>';
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = d.rows.map(function (r) {
      var p = r.product;
      return '<div class="cart__row">' +
        '<a class="cart__thumb" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
          global.ZNArt.packshot(p) + '</a>' +
        '<div>' +
          '<div class="cart__name">' + esc(p.name) + '</div>' +
          '<div class="cart__meta">' + esc(p.brand) + ' · ' + esc(p.size) + '</div>' +
          '<div class="qty" style="margin-top:8px">' +
            '<button data-qty-down="' + esc(p.id) + '" aria-label="Reduce quantity">−</button>' +
            '<span>' + r.qty + '</span>' +
            '<button data-qty-up="' + esc(p.id) + '" aria-label="Increase quantity">+</button>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div class="cart__price">' + global.ZN.money(r.line) + '</div>' +
          '<button class="btn btn--ghost btn--sm" style="margin-top:8px;padding:4px 12px" ' +
            'data-remove="' + esc(p.id) + '">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');

    foot.innerHTML =
      '<div class="cart__totals"><span>Subtotal</span><span class="cart__price">' + global.ZN.money(d.subtotal) + '</span></div>' +
      '<div class="cart__totals"><span>Delivery</span><span class="cart__price">' +
        (d.freeDelivery ? 'Free' : global.ZN.money(d.delivery)) + '</span></div>' +
      '<div class="cart__totals"><span>Total</span><strong>' + global.ZN.money(d.total) + '</strong></div>' +
      (d.freeDelivery
        ? '<p class="cart__note">Delivery is on us for this order.</p>'
        : '<p class="cart__note">Add ' + global.ZN.money(d.remaining) + ' more for free delivery.</p>') +
      '<button class="btn btn--primary btn--block" style="margin-top:14px" data-checkout>Checkout</button>' +
      '<p class="cart__note">This is a demo. No payment is taken and no order is placed.</p>';
  }

  /* ---------- footer -------------------------------------------- */
  function footerHtml() {
    var brands = Object.keys(global.ZN_BRANDS || {}).slice(0, 8).map(function (b) {
      return '<li><a href="shop.html?brand=' + encodeURIComponent(b) + '">' + esc(b) + '</a></li>';
    }).join('');

    return '<footer class="footer">' +
      '<div class="wrap footer__grid">' +
        '<div>' +
          '<div class="footer__logo">' + LOGO_TAG + '</div>' +
          '<p>We supply organic, gluten-free, no-sugar and natural products across Cyprus, and have done since 2009. Every brand we carry is one we buy for our own kitchens.</p>' +
          '<div class="socials">' +
            '<a href="' + C.facebook + '" aria-label="Facebook" rel="noopener" target="_blank">' + I.facebook + '</a>' +
            '<a href="' + C.instagram + '" aria-label="Instagram" rel="noopener" target="_blank">' + I.instagram + '</a>' +
            '<a href="mailto:' + C.email + '" aria-label="Email">' + I.mail + '</a>' +
          '</div>' +
        '</div>' +
        '<div><h3>Shop</h3><ul>' +
          '<li><a href="shop.html">All products</a></li>' +
          '<li><a href="shop.html?sale=1">Offers</a></li>' +
          '<li><a href="shop.html?diet=gluten-free">Gluten free</a></li>' +
          '<li><a href="shop.html?diet=no-sugar">No added sugar</a></li>' +
          '<li><a href="shop.html?diet=vegan">Vegan</a></li>' +
        '</ul></div>' +
        '<div><h3>Brands</h3><ul>' + brands + '</ul></div>' +
        '<div><h3>Find us</h3>' +
          '<div class="infoline">' + I.pin + '<span>' + esc(C.address) + '</span></div>' +
          '<div class="infoline">' + I.phone + '<a href="' + C.phoneHref + '">' + C.phone + '</a></div>' +
          '<div class="infoline">' + I.mail + '<a href="mailto:' + C.email + '">' + C.email + '</a></div>' +
          '<div class="infoline">' + I.clock + '<span>' + esc(C.hours) + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="wrap footer__bar">' +
        '<span>© ' + new Date().getFullYear() + ' Zero Nine Trading Ltd — demo build, not the live shop.</span>' +
        '<span class="paycards"><span class="paycard">VISA</span><span class="paycard">MASTERCARD</span>' +
          '<span class="paycard">PAYPAL</span><span class="paycard">CASH ON DELIVERY</span></span>' +
      '</div></footer>';
  }

  /* ---------- drawer plumbing ------------------------------------ */
  function openDrawer(el) {
    if (!el) return;
    el.setAttribute('data-open', 'true');
    el.setAttribute('aria-hidden', 'false');
    doc.querySelector('[data-scrim]').setAttribute('data-open', 'true');
    doc.body.style.overflow = 'hidden';
  }
  function closeDrawers() {
    ['[data-cart]', '[data-mobilenav]', '[data-filters]'].forEach(function (sel) {
      var el = doc.querySelector(sel);
      if (el) { el.setAttribute('data-open', 'false'); el.setAttribute('aria-hidden', 'true'); }
    });
    var scrim = doc.querySelector('[data-scrim]');
    if (scrim) scrim.setAttribute('data-open', 'false');
    doc.body.style.overflow = '';
  }

  /* ---------- toast ---------------------------------------------- */
  var toastTimer;
  function toast(msg) {
    var el = doc.querySelector('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.setAttribute('data-open', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.setAttribute('data-open', 'false'); }, 2600);
  }

  /* ---------- cart count badge ----------------------------------- */
  function paintCount() {
    var n = global.ZN.cart.count();
    Array.prototype.forEach.call(doc.querySelectorAll('[data-cart-count]'), function (el) {
      el.textContent = n;
      el.setAttribute('data-empty', n === 0 ? 'true' : 'false');
    });
  }

  /* ---------- scroll reveal -------------------------------------- */
  /* motion.js owns this now; the alias keeps older call sites working. */
  function reveal(scope) {
    if (global.ZNMotion) global.ZNMotion.init(scope);
  }

  /* ---------- mount ---------------------------------------------- */
  function mount(active) {
    var head = doc.getElementById('zn-header');
    var foot = doc.getElementById('zn-footer');
    if (head) head.innerHTML = headerHtml(active);
    if (foot) foot.innerHTML = footerHtml();

    if (!doc.querySelector('[data-progress]')) {
      var bar = doc.createElement('div');
      bar.className = 'progress';
      bar.setAttribute('data-progress', '');
      bar.setAttribute('aria-hidden', 'true');
      doc.body.insertBefore(bar, doc.body.firstChild);
    }

    var extras = doc.createElement('div');
    extras.innerHTML = mobileNavHtml() + cartShellHtml() +
      '<div class="scrim" data-scrim></div>' +
      '<div class="toast" data-toast role="status" aria-live="polite"></div>';
    while (extras.firstChild) doc.body.appendChild(extras.firstChild);

    // Keep the search box in sync when the shop page has a query.
    var q = param('q');
    if (q) {
      var input = doc.getElementById('zn-search');
      if (input) input.value = q;
    }

    renderCart();
    paintCount();
    global.ZN.cart.onChange(function () { renderCart(); paintCount(); });

    /* One delegated listener handles every interactive control. */
    doc.addEventListener('click', function (e) {
      var t = e.target.closest('[data-add],[data-open-cart],[data-close-cart],[data-open-nav],' +
        '[data-close-nav],[data-scrim],[data-qty-up],[data-qty-down],[data-remove],[data-checkout],' +
        '[data-open-filters],[data-close-filters]');
      if (!t) return;

      if (t.hasAttribute('data-add')) {
        var id = t.getAttribute('data-add');
        var p = global.ZN.byId(id);
        global.ZN.cart.add(id, 1);
        toast((p ? p.name : 'Item') + ' added to the basket');
      } else if (t.hasAttribute('data-open-cart')) {
        openDrawer(doc.querySelector('[data-cart]'));
      } else if (t.hasAttribute('data-open-nav')) {
        openDrawer(doc.querySelector('[data-mobilenav]'));
      } else if (t.hasAttribute('data-open-filters')) {
        openDrawer(doc.querySelector('[data-filters]'));
      } else if (t.hasAttribute('data-close-cart') || t.hasAttribute('data-close-nav') ||
                 t.hasAttribute('data-scrim') || t.hasAttribute('data-close-filters')) {
        closeDrawers();
      } else if (t.hasAttribute('data-qty-up')) {
        var idU = t.getAttribute('data-qty-up');
        var rowU = global.ZN.cart.get().filter(function (i) { return i.id === idU; })[0];
        global.ZN.cart.setQty(idU, (rowU ? rowU.qty : 0) + 1);
      } else if (t.hasAttribute('data-qty-down')) {
        var idD = t.getAttribute('data-qty-down');
        var rowD = global.ZN.cart.get().filter(function (i) { return i.id === idD; })[0];
        global.ZN.cart.setQty(idD, (rowD ? rowD.qty : 0) - 1);
      } else if (t.hasAttribute('data-remove')) {
        global.ZN.cart.remove(t.getAttribute('data-remove'));
        toast('Removed from the basket');
      } else if (t.hasAttribute('data-checkout')) {
        var body = doc.querySelector('[data-cart-body]');
        var footEl = doc.querySelector('[data-cart-foot]');
        body.innerHTML = '<div class="empty-state"><h3>Checkout is not part of this demo</h3>' +
          '<p>On the live site this step collects the delivery address and takes payment. ' +
          'For now, your basket is untouched — close this panel to keep browsing.</p>' +
          '<button class="btn btn--ghost" data-close-cart>Back to shopping</button></div>';
        footEl.innerHTML = '';
      }
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawers();
    });

    reveal();
  }

  global.ZNUI = {
    mount: mount, card: card, icons: I, esc: esc, param: param,
    toast: toast, reveal: reveal, stars: stars,
    dietName: dietName, dietShort: dietShort,
    categoryName: categoryName, brandColor: brandColor, brandInk: brandInk,
    closeDrawers: closeDrawers
  };
})(window);
