/* ------------------------------------------------------------------
   home.js — homepage
------------------------------------------------------------------- */
(function () {
  'use strict';

  var doc = document;
  var esc = ZNUI.esc;

  ZNUI.mount('home');

  ZN.load().then(function (products) {
    var live = products.filter(function (p) { return p.stock > 0; });

    /* ---------- hero shelf ------------------------------------- */
    var shelfPicks = live.filter(function (p) { return p.reviews >= 5; }).slice(0, 4);
    while (shelfPicks.length < 4) shelfPicks.push(live[shelfPicks.length]);

    doc.querySelector('[data-shelf]').innerHTML = shelfPicks.map(function (p) {
      return '<a class="shelf__tile" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
        '<div class="packshot">' + ZNArt.packshot(p) + '</div>' +
        '<div class="shelf__name">' + esc(p.name) + '</div>' +
        '<div class="shelf__price">' + esc(p.size) + ' · ' + ZN.money(p.price) + '</div>' +
      '</a>';
    }).join('');

    /* ---------- diet finder (the signature) --------------------- */
    var chosen = [];
    var pillWrap = doc.querySelector('[data-finder-pills]');
    var countEl = doc.querySelector('[data-finder-count]');
    var goEl = doc.querySelector('[data-finder-go]');

    pillWrap.innerHTML = ZN_DIETS.map(function (d) {
      return '<button type="button" class="pill" aria-pressed="false" data-diet="' + d.id + '">' +
        esc(d.name) + '<span class="pill__tag">' + esc(d.short) + '</span></button>';
    }).join('');

    function matching() {
      return live.filter(function (p) {
        return chosen.every(function (d) { return p.diets.indexOf(d) > -1; });
      });
    }

    function paintFinder() {
      var n = matching().length;
      countEl.innerHTML = chosen.length
        ? '<b>' + n + '</b> product' + (n === 1 ? '' : 's') + ' match every filter'
        : '<b>' + live.length + '</b> products in stock right now';
      goEl.textContent = chosen.length ? 'Show ' + n + ' product' + (n === 1 ? '' : 's') : 'Browse the shop';
      goEl.href = chosen.length ? 'shop.html?diet=' + chosen.join(',') : 'shop.html';
    }

    pillWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-diet]');
      if (!btn) return;
      var id = btn.getAttribute('data-diet');
      var i = chosen.indexOf(id);
      if (i > -1) chosen.splice(i, 1); else chosen.push(id);
      btn.setAttribute('aria-pressed', i > -1 ? 'false' : 'true');
      paintFinder();
    });

    paintFinder();

    /* ---------- best sellers rail ------------------------------- */
    var best = live.slice().sort(function (a, b) {
      return (b.reviews * b.rating) - (a.reviews * a.rating);
    }).slice(0, 10);
    doc.querySelector('[data-rail="best"]').innerHTML = best.map(ZNUI.card).join('');

    /* ---------- department tiles -------------------------------- */
    doc.querySelector('[data-cats]').innerHTML = ZN_CATEGORIES.map(function (c) {
      var n = products.filter(function (p) { return p.category === c.id; }).length;
      var tint = ZNArt.mix('#174436', '#B9DC55', 0.35);
      return '<a class="cat-tile" href="shop.html?category=' + c.id + '">' +
        '<div class="cat-tile__art" aria-hidden="true">' + ZNArt.categoryArt(tint) + '</div>' +
        '<h3>' + esc(c.name) + '</h3>' +
        '<p>' + esc(c.blurb) + '</p>' +
        '<span class="cat-tile__count">' + n + ' product' + (n === 1 ? '' : 's') + '</span>' +
      '</a>';
    }).join('');

    /* ---------- offers ------------------------------------------ */
    var offers = live.filter(function (p) { return p.oldPrice; }).slice(0, 4);
    if (offers.length) {
      doc.querySelector('[data-offers]').innerHTML = offers.map(ZNUI.card).join('');
    } else {
      doc.querySelector('[data-offers-section]').remove();
    }

    /* ---------- brands ------------------------------------------ */
    doc.querySelector('[data-brands]').innerHTML = Object.keys(ZN_BRANDS).map(function (name) {
      var b = ZN_BRANDS[name];
      var n = products.filter(function (p) { return p.brand === name; }).length;
      return '<a class="brand-chip" href="shop.html?brand=' + encodeURIComponent(name) + '">' +
        '<span class="brand-chip__bar" style="background:' + esc(b.color) + '"></span>' +
        '<span class="brand-chip__name">' + esc(name) + '</span>' +
        '<span class="brand-chip__origin">' + esc(b.origin) + ' · ' + n + ' items</span>' +
      '</a>';
    }).join('');

    /* ---------- stats ------------------------------------------- */
    doc.querySelector('[data-stat-products]').textContent = products.length;
    doc.querySelector('[data-stat-brands]').textContent = Object.keys(ZN_BRANDS).length;

    /* ---------- recipes ----------------------------------------- */
    doc.querySelector('[data-recipes]').innerHTML = ZN_RECIPES.slice(0, 3).map(function (r, i) {
      return '<a class="recipe" href="recipes.html#' + r.id + '">' +
        '<div class="recipe__art">' + ZNArt.recipeArt(i, '#174436') + '</div>' +
        '<div class="recipe__body">' +
          '<div class="recipe__date">' + esc(r.date) + ' · ' + r.minutes + ' min</div>' +
          '<h3>' + esc(r.title) + '</h3>' +
          '<p>' + esc(r.excerpt) + '</p>' +
        '</div></a>';
    }).join('');

    /* ---------- rail arrows ------------------------------------- */
    doc.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-rail-prev],[data-rail-next]');
      if (!btn) return;
      var key = btn.getAttribute('data-rail-prev') || btn.getAttribute('data-rail-next');
      var rail = doc.querySelector('[data-rail="' + key + '"]');
      if (!rail) return;
      var step = rail.clientWidth * 0.8;
      rail.scrollBy({ left: btn.hasAttribute('data-rail-next') ? step : -step, behavior: 'smooth' });
    });

    doc.querySelector('[data-rail-prev="best"]').innerHTML = ZNUI.icons.arrowL;
    doc.querySelector('[data-rail-next="best"]').innerHTML = ZNUI.icons.arrowR;

    ZNUI.reveal();
  });

  /* ---------- newsletter ---------------------------------------- */
  doc.querySelector('[data-newsletter]').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = doc.querySelector('[data-newsletter-msg]');
    msg.textContent = 'Thanks — on the live site this would add you to the monthly list.';
    this.reset();
  });
})();
