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

    /* ---------- hero showcase (the rotating product) ------------ */
    // Only shapes that are surfaces of revolution can be spun convincingly.
    var spinnable = live.filter(function (p) {
      return ZNBottle.shapes.indexOf(p.pack) > -1;
    }).sort(function (a, b) {
      return (b.reviews * b.rating) - (a.reviews * a.rating);
    });

    var featured = [];
    var seenBrands = {};
    spinnable.forEach(function (p) {                 // one per brand, for variety
      if (featured.length >= 4 || seenBrands[p.brand]) return;
      seenBrands[p.brand] = true;
      featured.push(p);
    });
    while (featured.length < 4 && spinnable.length > featured.length) {
      featured.push(spinnable[featured.length]);
    }

    var canvas = doc.querySelector('[data-bottle]');
    var bottle = null;
    var current = 0;
    var cycleTimer = null;

    function showFeatured(i, immediate) {
      current = (i + featured.length) % featured.length;
      var p = featured[current];
      var info = doc.querySelector('[data-showcase-info]');

      function apply() {
        if (!bottle) {
          // No canvas: show the illustration instead, still cycling products.
          var stage = doc.querySelector('.showcase__stage');
          if (stage) {
            stage.innerHTML = '<div class="showcase__glow" aria-hidden="true"></div>' +
              '<div class="showcase__fallback">' + ZNArt.packshot(p) + '</div>';
          }
          paintInfo();
          return;
        }
        bottle.setProduct({
          brand: p.brand,
          name: p.name,
          size: p.size,
          pack: p.pack,
          color: ZNArt.ink(ZNUI.brandColor(p.brand))
        });
        paintInfo();
      }

      function paintInfo() {
        doc.querySelector('[data-showcase-brand]').textContent = p.brand;
        doc.querySelector('[data-showcase-name]').textContent = p.name;
        doc.querySelector('[data-showcase-price]').textContent = ZN.money(p.price) + ' · ' + p.size;
        doc.querySelector('[data-showcase-link]').href = 'product.html?id=' + encodeURIComponent(p.id);
        info.classList.remove('is-swapping');

        Array.prototype.forEach.call(doc.querySelectorAll('[data-showcase-dots] button'), function (b, n) {
          b.setAttribute('aria-current', n === current ? 'true' : 'false');
        });
      }

      if (immediate || ZNMotion.reduced) { apply(); return; }
      info.classList.add('is-swapping');
      setTimeout(apply, 300);
    }

    function startCycle() {
      clearInterval(cycleTimer);
      cycleTimer = setInterval(function () { showFeatured(current + 1); }, 7000);
    }

    if (canvas && featured.length) {
      bottle = ZNBottle.create(canvas);
      if (!bottle) {
        canvas.remove();
        doc.querySelector('.showcase__hint').hidden = true;
      }

      doc.querySelector('[data-showcase-dots]').innerHTML = featured.map(function (p, i) {
        return '<button type="button" role="tab" aria-current="' + (i === 0) + '" ' +
          'data-dot="' + i + '" aria-label="Show ' + ZNUI.esc(p.name) + '"></button>';
      }).join('');

      doc.querySelector('[data-showcase-dots]').addEventListener('click', function (e) {
        var b = e.target.closest('[data-dot]');
        if (!b) return;
        showFeatured(parseInt(b.getAttribute('data-dot'), 10));
        startCycle();
      });

      // Stop cycling while someone is turning it by hand.
      canvas.addEventListener('mousedown', function () { clearInterval(cycleTimer); });
      canvas.addEventListener('touchstart', function () { clearInterval(cycleTimer); }, { passive: true });
      canvas.addEventListener('mouseup', startCycle);
      canvas.addEventListener('touchend', startCycle);

      showFeatured(0, true);
      startCycle();
    }

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
      return '<a class="cat-tile" href="shop.html?category=' + c.id + '">' +
        '<div class="cat-tile__img"><img src="' + esc(c.image) + '" alt="" loading="lazy" width="480" height="360"></div>' +
        '<div class="cat-tile__body">' +
          '<h3>' + esc(c.name) + '</h3>' +
          '<p>' + esc(c.blurb) + '</p>' +
          '<span class="cat-tile__count">' + n + ' product' + (n === 1 ? '' : 's') + '</span>' +
        '</div></a>';
    }).join('');

    /* ---------- offers ------------------------------------------ */
    var offers = live.filter(function (p) { return p.oldPrice; }).slice(0, 4);
    if (offers.length) {
      doc.querySelector('[data-offers]').innerHTML = offers.map(ZNUI.card).join('');
    } else {
      doc.querySelector('[data-offers-section]').remove();
    }

    /* ---------- brands (marquee, so the list is duplicated) ------ */
    var brandChips = Object.keys(ZN_BRANDS).map(function (name) {
      var b = ZN_BRANDS[name];
      var n = products.filter(function (p) { return p.brand === name; }).length;
      return '<a class="brand-chip" href="shop.html?brand=' + encodeURIComponent(name) + '">' +
        '<span class="brand-chip__bar" style="background:' + esc(b.color) + '"></span>' +
        '<span class="brand-chip__name">' + esc(name) + '</span>' +
        '<span class="brand-chip__origin">' + esc(b.origin) + ' · ' + n + ' items</span>' +
      '</a>';
    }).join('');
    doc.querySelector('[data-brands]').innerHTML = brandChips + brandChips;

    /* ---------- stats ------------------------------------------- */
    doc.querySelector('[data-stat-products]').setAttribute('data-count-to', products.length);
    var totalLink = doc.querySelector('[data-total-link]');
    if (totalLink) totalLink.textContent = 'See all ' + products.length + ' products';
    doc.querySelector('[data-stat-brands]').setAttribute('data-count-to', Object.keys(ZN_BRANDS).length);

    /* ---------- recipes ----------------------------------------- */
    doc.querySelector('[data-recipes]').innerHTML = ZN_RECIPES.slice(0, 3).map(function (r) {
      return '<a class="recipe" href="recipes.html#' + r.id + '">' +
        '<div class="recipe__art"><img src="' + esc(r.image) + '" alt="" loading="lazy" width="600" height="400"></div>' +
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

    ZNMotion.init();
  });

  /* ---------- newsletter ---------------------------------------- */
  doc.querySelector('[data-newsletter]').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = doc.querySelector('[data-newsletter-msg]');
    msg.textContent = 'Thanks — on the live site this would add you to the monthly list.';
    this.reset();
  });
})();
