/* ------------------------------------------------------------------
   product.js — single product page
------------------------------------------------------------------- */
(function () {
  'use strict';

  var doc = document;
  var esc = ZNUI.esc;

  ZNUI.mount('shop');

  ZN.load().then(function (products) {
    var id = ZNUI.param('id');
    var p = products.filter(function (x) { return x.id === id; })[0];
    var host = doc.querySelector('[data-pdp]');

    if (!p) {
      doc.querySelector('[data-crumbs]').innerHTML =
        '<a href="index.html">Home</a><span>/</span><a href="shop.html">Shop</a>';
      host.innerHTML = '<div class="empty-state" style="padding-block:80px">' +
        '<h3>We can\'t find that product</h3>' +
        '<p>It may have been renamed or removed from the catalogue.</p>' +
        '<a class="btn btn--primary" href="shop.html">Back to the shop</a></div>';
      return;
    }

    doc.title = p.brand + ' ' + p.name + ' — Zero Nine Trading';
    var metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', p.blurb + ' ' + p.size + ', ' + ZN.money(p.price) + '.');

    var brand = ZN_BRANDS[p.brand] || {};
    var brandColor = ZNUI.brandInk(p.brand);

    doc.querySelector('[data-crumbs]').innerHTML =
      '<a href="index.html">Home</a><span>/</span>' +
      '<a href="shop.html">Shop</a><span>/</span>' +
      '<a href="shop.html?category=' + p.category + '">' + esc(ZNUI.categoryName(p.category)) + '</a>' +
      '<span>/</span><span>' + esc(p.name) + '</span>';

    /* ---------- stock line ------------------------------------- */
    var stockLine;
    if (p.stock <= 0) {
      stockLine = '<span class="dot dot--out"></span> Sold out — email us and we\'ll tell you when it lands';
    } else if (p.stock <= 10) {
      stockLine = '<span class="dot dot--low"></span> Only ' + p.stock + ' left in the warehouse';
    } else {
      stockLine = '<span class="dot dot--in"></span> In stock, ships next working day';
    }

    var badges = p.diets.map(function (d) {
      return '<span class="diet-badge">' + esc(ZNUI.dietName(d)) + '</span>';
    }).join('');

    var save = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

    host.innerHTML = '' +
      '<div class="pdp">' +
        '<div class="pdp__media">' +
          '<div class="packshot">' + ZNArt.packshot(p) + '</div>' +
        '</div>' +

        '<div>' +
          '<div class="pdp__brandline" style="color:' + esc(brandColor) + '">' +
            '<a href="shop.html?brand=' + encodeURIComponent(p.brand) + '">' + esc(p.brand) + '</a>' +
            (brand.origin ? ' · ' + esc(brand.origin) : '') + '</div>' +
          '<h1>' + esc(p.name) + '</h1>' +
          '<div class="pdp__size">' + esc(p.size) + '</div>' +
          ZNUI.stars(p.rating, p.reviews) +

          '<div class="pdp__price" style="margin-top:18px">' +
            (p.oldPrice ? '<span style="font-size:1.1rem;color:var(--muted);text-decoration:line-through;margin-right:10px">' +
              ZN.money(p.oldPrice) + '</span>' : '') +
            ZN.money(p.price) +
            (save > 0 ? ' <span class="flag flag--save" style="vertical-align:middle">Save ' + save + '%</span>' : '') +
          '</div>' +
          '<div class="pdp__vat">' + esc(ZN_CONFIG.vatNote) + ' · free delivery over ' + ZN.money(ZN_CONFIG.freeDeliveryFrom) + '</div>' +

          '<p class="pdp__blurb">' + esc(p.blurb) + '</p>' +
          (badges ? '<div class="diet-badges">' + badges + '</div>' : '') +
          '<div class="stockline">' + stockLine + '</div>' +

          '<div class="pdp__buy">' +
            (p.stock > 0
              ? '<div class="qty qty--lg">' +
                  '<button data-pdp-down aria-label="Reduce quantity">−</button>' +
                  '<span data-pdp-qty>1</span>' +
                  '<button data-pdp-up aria-label="Increase quantity">+</button>' +
                '</div>' +
                '<button class="btn btn--lime" data-pdp-add>Add to basket</button>' +
                '<button class="btn btn--ghost" data-open-cart>View basket</button>'
              : '<a class="btn btn--primary" href="mailto:' + ZN_CONFIG.email +
                  '?subject=' + encodeURIComponent('Restock enquiry: ' + p.brand + ' ' + p.name) +
                  '">Email us about this</a>' +
                '<a class="btn btn--ghost" href="shop.html?category=' + p.category + '">See alternatives</a>') +
          '</div>' +

          '<dl class="spec">' +
            '<dt>Brand</dt><dd>' + esc(p.brand) + '</dd>' +
            '<dt>Department</dt><dd>' + esc(ZNUI.categoryName(p.category)) + '</dd>' +
            '<dt>Pack size</dt><dd>' + esc(p.size) + '</dd>' +
            '<dt>Suitable for</dt><dd>' + (p.diets.length
              ? p.diets.map(ZNUI.dietName).join(', ') : 'No dietary claims') + '</dd>' +
            '<dt>Product code</dt><dd style="font-family:var(--mono);font-size:.85rem">' + esc(p.id) + '</dd>' +
          '</dl>' +
        '</div>' +
      '</div>' +

      '<div style="padding-block:20px 40px">' +
        '<div class="tabs" role="tablist">' +
          '<button class="tab" role="tab" aria-selected="true" data-tab="about">About this product</button>' +
          '<button class="tab" role="tab" aria-selected="false" data-tab="storage">Storage</button>' +
          '<button class="tab" role="tab" aria-selected="false" data-tab="delivery">Delivery &amp; returns</button>' +
        '</div>' +
        '<div class="tabpanel" role="tabpanel" data-panel="about">' +
          '<p>' + esc(p.blurb) + '</p>' +
          (brand.line ? '<p><strong>' + esc(p.brand) + '</strong> — ' + esc(brand.line) +
            ' We hold the Cyprus distribution and buy directly from the producer in ' + esc(brand.origin) + '.</p>' : '') +
          '<p>Full ingredient and nutrition panels are printed on the pack. If you need them before ordering — ' +
            'for an allergy, or for a school or clinic — email <a href="mailto:' + ZN_CONFIG.email + '">' +
            ZN_CONFIG.email + '</a> and we will photograph the current batch for you.</p>' +
        '</div>' +
        '<div class="tabpanel" role="tabpanel" data-panel="storage" hidden>' +
          '<p>Store in a cool, dry place out of direct sunlight. Once opened, keep sealed and use within the period shown on the pack.</p>' +
          '<p>Nut butters and tahini separate naturally — that is the oil, not spoilage. Stir it back through before use.</p>' +
        '</div>' +
        '<div class="tabpanel" role="tabpanel" data-panel="delivery" hidden>' +
          '<p>Orders placed before 14:00 on a working day are dispatched the same day. Delivery is ' +
            ZN.money(ZN_CONFIG.deliveryFee) + ', or free once your basket passes ' +
            ZN.money(ZN_CONFIG.freeDeliveryFrom) + '. Collection from Latsia is free.</p>' +
          '<p>Unopened items can be returned within 14 days. Short-dated stock is sold as final.</p>' +
        '</div>' +
      '</div>';

    /* ---------- quantity + add --------------------------------- */
    var qty = 1;
    host.addEventListener('click', function (e) {
      var out = doc.querySelector('[data-pdp-qty]');
      if (e.target.closest('[data-pdp-up]')) {
        qty = Math.min(qty + 1, Math.max(1, p.stock)); out.textContent = qty;
      } else if (e.target.closest('[data-pdp-down]')) {
        qty = Math.max(1, qty - 1); out.textContent = qty;
      } else if (e.target.closest('[data-pdp-add]')) {
        ZN.cart.add(p.id, qty);
        ZNUI.toast(qty + ' × ' + p.name + ' added to the basket');
      }
    });

    /* ---------- tabs -------------------------------------------- */
    host.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-tab]');
      if (!tab) return;
      var key = tab.getAttribute('data-tab');
      Array.prototype.forEach.call(host.querySelectorAll('[data-tab]'), function (t) {
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      Array.prototype.forEach.call(host.querySelectorAll('[data-panel]'), function (panel) {
        panel.hidden = panel.getAttribute('data-panel') !== key;
      });
    });

    /* ---------- related ----------------------------------------- */
    var related = products.filter(function (x) {
      return x.id !== p.id && x.stock > 0 && (x.category === p.category || x.brand === p.brand);
    }).sort(function (a, b) {
      var aScore = (a.brand === p.brand ? 2 : 0) + (a.category === p.category ? 1 : 0);
      var bScore = (b.brand === p.brand ? 2 : 0) + (b.category === p.category ? 1 : 0);
      return bScore - aScore;
    }).slice(0, 4);

    if (related.length) {
      doc.querySelector('[data-related]').innerHTML = related.map(ZNUI.card).join('');
      doc.querySelector('[data-related-section]').hidden = false;
    }

    /* ---------- structured data --------------------------------- */
    var ld = doc.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.brand + ' ' + p.name,
      description: p.blurb,
      brand: { '@type': 'Brand', name: p.brand },
      sku: p.id,
      offers: {
        '@type': 'Offer',
        price: p.price.toFixed(2),
        priceCurrency: 'EUR',
        availability: p.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock'
      }
    });
    doc.head.appendChild(ld);
  });
})();
