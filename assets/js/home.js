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

    /* ---------- hero deck (swipeable featured products) ---------- */
    var featured = [];
    var seenBrands = {};
    live.slice().sort(function (a, b) {
      return (b.reviews * b.rating) - (a.reviews * a.rating);
    }).forEach(function (p) {                       // one per brand, for variety
      if (featured.length >= 4 || seenBrands[p.brand]) return;
      seenBrands[p.brand] = true;
      featured.push(p);
    });

    var track = doc.querySelector('[data-deck-track]');
    var bars = doc.querySelector('[data-deck-bars]');
    var DWELL = 6000;

    if (track && featured.length) {
      track.innerHTML = featured.map(function (p, i) {
        var save = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
        return '<article class="deck__slide' + (i === 0 ? ' is-current' : '') + '" ' +
            'data-slide="' + i + '" aria-roledescription="slide" ' +
            'aria-label="' + esc(p.name) + ', ' + (i + 1) + ' of ' + featured.length + '">' +
          '<div class="deck__media">' + ZNArt.packshot(p) + '</div>' +
          '<div>' +
            '<div class="deck__brand" style="color:' + esc(ZNUI.brandInk(p.brand)) + '">' +
              esc(p.brand) + '</div>' +
            '<div class="deck__name">' + esc(p.name) + '</div>' +
            '<div class="deck__meta">' + esc(p.size) +
              (save ? ' · <span class="flag flag--save">Save ' + save + '%</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="deck__row">' +
            '<span class="deck__price">' +
              (p.oldPrice ? '<small>' + ZN.money(p.oldPrice) + '</small>' : '') +
              ZN.money(p.price) + '</span>' +
            '<span style="display:flex;gap:8px">' +
              '<a class="btn btn--ghost btn--sm" href="product.html?id=' +
                encodeURIComponent(p.id) + '">Details</a>' +
              '<button class="btn btn--lime btn--sm" data-add="' + esc(p.id) + '">Add</button>' +
            '</span>' +
          '</div>' +
        '</article>';
      }).join('');

      bars.innerHTML = featured.map(function (p, i) {
        return '<button type="button" class="deck__bar" role="tab" data-bar="' + i + '" ' +
          'data-state="' + (i === 0 ? 'active' : 'idle') + '" ' +
          'aria-label="Show ' + esc(p.name) + '"><span></span></button>';
      }).join('');
      bars.style.setProperty('--dwell', DWELL + 'ms');

      var index = 0;
      var timer = null;
      var idle = null;

      function paintBars() {
        Array.prototype.forEach.call(bars.children, function (b, i) {
          // Restart the fill animation by replacing the node.
          var state = i < index ? 'done' : i === index ? 'active' : 'idle';
          if (b.getAttribute('data-state') !== state || state === 'active') {
            b.innerHTML = '<span></span>';
            b.setAttribute('data-state', state);
          }
        });
        Array.prototype.forEach.call(track.children, function (el, i) {
          el.classList.toggle('is-current', i === index);
        });
      }

      function goTo(i, smooth) {
        index = (i + featured.length) % featured.length;
        var slide = track.children[index];
        var left = slide.offsetLeft - track.offsetLeft;

        // scrollTo rather than scrollIntoView, so the page itself doesn't jump.
        // Older Safari has no options object on element scrolling, so fall
        // back to scrollLeft — the CSS scroll-behaviour still smooths it.
        try {
          if (typeof track.scrollTo === 'function') {
            track.scrollTo({
              left: left,
              behavior: smooth === false || ZNMotion.reduced ? 'auto' : 'smooth'
            });
          } else {
            track.scrollLeft = left;
          }
        } catch (e) {
          track.scrollLeft = left;
        }

        paintBars();
      }

      function play() {
        if (ZNMotion.reduced) return;
        clearInterval(timer);
        timer = setInterval(function () { goTo(index + 1); }, DWELL);
      }

      function pause(resumeAfter) {
        clearInterval(timer);
        clearTimeout(idle);
        if (resumeAfter) idle = setTimeout(play, resumeAfter);
      }

      bars.addEventListener('click', function (e) {
        var b = e.target.closest('[data-bar]');
        if (!b) return;
        goTo(parseInt(b.getAttribute('data-bar'), 10));
        pause(DWELL * 1.5);
      });

      // Follow a swipe: whichever slide settles nearest the centre wins.
      var settle;
      track.addEventListener('scroll', function () {
        clearTimeout(settle);
        settle = setTimeout(function () {
          if (drag) return;                       // mid-drag, wait for the release
          var nearest = nearestIndex();
          if (nearest !== index) { index = nearest; paintBars(); }
        }, 90);
      }, { passive: true });

      var prev = doc.querySelector('[data-deck-prev]');
      var next = doc.querySelector('[data-deck-next]');
      if (prev) prev.addEventListener('click', function () { goTo(index - 1); pause(DWELL * 1.5); });
      if (next) next.addEventListener('click', function () { goTo(index + 1); pause(DWELL * 1.5); });

      track.addEventListener('touchstart', function () { pause(DWELL * 1.5); }, { passive: true });

      /* ---- drag to swipe with a mouse ----------------------------
         A touch device scrolls this natively. On a desktop there's no
         gesture at all unless you have a trackpad, so grab-and-drag is
         wired up by hand, and a drag is stopped from becoming a click. */
      var drag = null;

      function nearestIndex() {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var nearest = 0, best = Infinity;
        Array.prototype.forEach.call(track.children, function (el, i) {
          var c = el.offsetLeft - track.offsetLeft + el.offsetWidth / 2;
          var d = Math.abs(c - mid);
          if (d < best) { best = d; nearest = i; }
        });
        return nearest;
      }

      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch' || e.button !== 0) return;
        drag = { x: e.clientX, left: track.scrollLeft, moved: 0 };
        track.classList.add('is-dragging');
        pause(DWELL * 1.5);
        if (track.setPointerCapture) {
          try { track.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
        }
      });

      track.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var dx = e.clientX - drag.x;
        drag.moved = Math.max(drag.moved, Math.abs(dx));
        track.scrollLeft = drag.left - dx;
      });

      function endDrag() {
        if (!drag) return;
        var moved = drag.moved;
        drag = null;
        track.classList.remove('is-dragging');
        goTo(nearestIndex());
        // Swallow the click that follows a real drag, so letting go over a
        // card doesn't open it.
        if (moved > 6) {
          track.addEventListener('click', function once(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            track.removeEventListener('click', once, true);
          }, true);
          setTimeout(function () { /* nothing left to clean up */ }, 0);
        }
      }

      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);
      track.addEventListener('pointerleave', endDrag);

      /* A trackpad's horizontal scroll already works; a wheel-only mouse
         gets vertical deltas, so translate those into slide changes. */
      var wheelLock = false;
      track.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;   // real horizontal scroll
        if (wheelLock) return;
        wheelLock = true;
        setTimeout(function () { wheelLock = false; }, 320);
        goTo(index + (e.deltaY > 0 ? 1 : -1));
        pause(DWELL * 1.5);
      }, { passive: true });

      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { goTo(index + 1); pause(DWELL * 1.5); }
        if (e.key === 'ArrowLeft') { goTo(index - 1); pause(DWELL * 1.5); }
      });

      // Don't run the timer while the deck is off screen.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { en.isIntersecting ? play() : pause(); });
        }, { threshold: 0.25 }).observe(track);
      } else {
        play();
      }

      if (ZNMotion.reduced) doc.querySelector('[data-deck-hint]').hidden = true;
      paintBars();
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
