/* ------------------------------------------------------------------
   shop.js — catalogue browsing

   All filter state lives in the URL, so any view can be linked,
   bookmarked or sent to a customer.
------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var doc = document;
  var esc = ZNUI.esc;
  var PAGE = 24;

  ZNUI.mount('shop');

  var state = {
    q: '', diets: [], cats: [], brands: [],
    min: null, max: null, instock: false, sale: false,
    sort: 'popular', shown: PAGE
  };

  /* ---------- URL <-> state ------------------------------------- */
  function readUrl() {
    var u = new URLSearchParams(location.search);
    var list = function (k) {
      var v = u.get(k);
      return v ? v.split(',').filter(Boolean) : [];
    };
    state.q = u.get('q') || '';
    state.diets = list('diet');
    state.cats = list('category');
    state.brands = list('brand');
    state.min = u.get('min') ? parseFloat(u.get('min')) : null;
    state.max = u.get('max') ? parseFloat(u.get('max')) : null;
    state.instock = u.get('instock') === '1';
    state.sale = u.get('sale') === '1';
    state.sort = u.get('sort') || 'popular';
  }

  function writeUrl() {
    var u = new URLSearchParams();
    if (state.q) u.set('q', state.q);
    if (state.diets.length) u.set('diet', state.diets.join(','));
    if (state.cats.length) u.set('category', state.cats.join(','));
    if (state.brands.length) u.set('brand', state.brands.join(','));
    if (state.min != null && !isNaN(state.min)) u.set('min', state.min);
    if (state.max != null && !isNaN(state.max)) u.set('max', state.max);
    if (state.instock) u.set('instock', '1');
    if (state.sale) u.set('sale', '1');
    if (state.sort !== 'popular') u.set('sort', state.sort);
    var qs = u.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }

  /* ---------- filtering ----------------------------------------- */
  function matches(p) {
    if (state.instock && p.stock <= 0) return false;
    if (state.sale && !p.oldPrice) return false;
    if (state.cats.length && state.cats.indexOf(p.category) === -1) return false;
    if (state.brands.length && state.brands.indexOf(p.brand) === -1) return false;
    if (state.min != null && !isNaN(state.min) && p.price < state.min) return false;
    if (state.max != null && !isNaN(state.max) && p.price > state.max) return false;

    for (var i = 0; i < state.diets.length; i++) {
      if (p.diets.indexOf(state.diets[i]) === -1) return false;
    }

    if (state.q) {
      var hay = (p.name + ' ' + p.brand + ' ' + p.size + ' ' + p.blurb + ' ' +
        p.category + ' ' + p.diets.join(' ')).toLowerCase();
      var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var j = 0; j < words.length; j++) {
        if (hay.indexOf(words[j]) === -1) return false;
      }
    }
    return true;
  }

  function sortList(list) {
    var copy = list.slice();
    switch (state.sort) {
      case 'price-asc':  return copy.sort(function (a, b) { return a.price - b.price; });
      case 'price-desc': return copy.sort(function (a, b) { return b.price - a.price; });
      case 'name':       return copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
      case 'rating':     return copy.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
      default:
        return copy.sort(function (a, b) {
          // In stock first, then by how much feedback the product has.
          if ((a.stock > 0) !== (b.stock > 0)) return a.stock > 0 ? -1 : 1;
          return (b.reviews * b.rating) - (a.reviews * a.rating);
        });
    }
  }

  /* ---------- filter sidebar ------------------------------------ */
  function buildSidebar(products) {
    function countBy(fn, value) {
      return products.filter(function (p) { return fn(p) === value; }).length;
    }

    doc.querySelector('[data-filter-diets]').innerHTML = ZN_DIETS.map(function (d) {
      var n = products.filter(function (p) { return p.diets.indexOf(d.id) > -1; }).length;
      return '<label class="check"><input type="checkbox" data-f="diet" value="' + d.id + '"> ' +
        esc(d.name) + '<span class="check__count">' + n + '</span></label>';
    }).join('');

    doc.querySelector('[data-filter-cats]').innerHTML = ZN_CATEGORIES.map(function (c) {
      var n = countBy(function (p) { return p.category; }, c.id);
      return '<label class="check"><input type="checkbox" data-f="category" value="' + c.id + '"> ' +
        esc(c.name) + '<span class="check__count">' + n + '</span></label>';
    }).join('');

    doc.querySelector('[data-filter-brands]').innerHTML = Object.keys(ZN_BRANDS).map(function (b) {
      var n = countBy(function (p) { return p.brand; }, b);
      return '<label class="check"><input type="checkbox" data-f="brand" value="' + esc(b) + '"> ' +
        esc(b) + '<span class="check__count">' + n + '</span></label>';
    }).join('');
  }

  function syncSidebar() {
    Array.prototype.forEach.call(doc.querySelectorAll('[data-f]'), function (input) {
      var kind = input.getAttribute('data-f');
      var bucket = kind === 'diet' ? state.diets : kind === 'category' ? state.cats : state.brands;
      input.checked = bucket.indexOf(input.value) > -1;
    });
    doc.querySelector('[data-price-min]').value = state.min == null || isNaN(state.min) ? '' : state.min;
    doc.querySelector('[data-price-max]').value = state.max == null || isNaN(state.max) ? '' : state.max;
    doc.querySelector('[data-instock]').checked = state.instock;
    doc.querySelector('[data-onsale]').checked = state.sale;
    doc.querySelector('[data-sort]').value = state.sort;
  }

  /* ---------- active filter chips -------------------------------- */
  function paintChips() {
    var chips = [];
    if (state.q) chips.push({ k: 'q', v: state.q, label: '“' + state.q + '”' });
    state.diets.forEach(function (d) { chips.push({ k: 'diet', v: d, label: ZNUI.dietName(d) }); });
    state.cats.forEach(function (c) { chips.push({ k: 'category', v: c, label: ZNUI.categoryName(c) }); });
    state.brands.forEach(function (b) { chips.push({ k: 'brand', v: b, label: b }); });
    if (state.min != null && !isNaN(state.min)) chips.push({ k: 'min', v: '', label: 'From ' + ZN.money(state.min) });
    if (state.max != null && !isNaN(state.max)) chips.push({ k: 'max', v: '', label: 'Up to ' + ZN.money(state.max) });
    if (state.instock) chips.push({ k: 'instock', v: '', label: 'In stock' });
    if (state.sale) chips.push({ k: 'sale', v: '', label: 'Reduced' });

    doc.querySelector('[data-chips]').innerHTML = chips.map(function (c) {
      return '<button class="chip" data-chip-k="' + c.k + '" data-chip-v="' + esc(c.v) + '">' +
        esc(c.label) + ' <b aria-hidden="true">×</b>' +
        '<span class="sr-only">Remove filter</span></button>';
    }).join('');
  }

  /* ---------- page title ---------------------------------------- */
  function paintHeading() {
    var title = 'Shop';
    var lead = 'Everything we hold in the Latsia warehouse, updated as stock moves.';

    if (state.q) {
      title = 'Results for “' + state.q + '”';
      lead = 'Searching across product names, brands, sizes and diets.';
    } else if (state.sale) {
      title = 'Offers';
      lead = 'Reduced lines and short-dated stock. When they are gone, they are gone.';
    } else if (state.cats.length === 1) {
      var c = ZN_CATEGORIES.filter(function (x) { return x.id === state.cats[0]; })[0];
      if (c) { title = c.name; lead = c.blurb + '.'; }
    } else if (state.brands.length === 1) {
      var b = ZN_BRANDS[state.brands[0]];
      title = state.brands[0];
      if (b) lead = b.line + ' Imported from ' + b.origin + '.';
    } else if (state.diets.length === 1) {
      title = ZNUI.dietName(state.diets[0]);
      lead = 'Everything in the catalogue that carries this label.';
    }

    doc.querySelector('[data-shop-title]').textContent = title;
    doc.querySelector('[data-shop-lead]').textContent = lead;
    doc.querySelector('[data-crumb]').textContent = title;
    doc.title = title + ' — Zero Nine Trading';
  }

  /* ---------- render -------------------------------------------- */
  var all = [];

  function render() {
    var list = sortList(all.filter(matches));
    var slice = list.slice(0, state.shown);
    var results = doc.querySelector('[data-results]');

    if (!list.length) {
      results.className = '';
      results.innerHTML = '<div class="empty-state">' +
        '<h3>Nothing matches those filters</h3>' +
        '<p>Try removing a filter, or widening the price range.</p>' +
        '<button class="btn btn--primary" data-clear-filters>Clear all filters</button></div>';
    } else {
      results.className = 'grid-products';
      results.setAttribute('data-stagger', '40');
      results.innerHTML = slice.map(function (p, i) {
        // Only animate the first screenful; beyond that it just delays reading.
        return i < 12
          ? '<div data-animate="fade-up">' + ZNUI.card(p) + '</div>'
          : ZNUI.card(p);
      }).join('');
      if (global.ZNMotion) global.ZNMotion.reveal(results);
    }

    doc.querySelector('[data-count]').innerHTML = list.length
      ? 'Showing <b>' + slice.length + '</b> of <b>' + list.length + '</b> products'
      : '';

    var more = doc.querySelector('[data-more]');
    more.hidden = slice.length >= list.length;
    more.textContent = 'Load more (' + Math.max(0, list.length - slice.length) + ' left)';

    paintChips();
    paintHeading();
    writeUrl();
  }

  function update() { state.shown = PAGE; render(); }

  /* ---------- events -------------------------------------------- */
  doc.addEventListener('change', function (e) {
    var t = e.target;

    if (t.matches('[data-f]')) {
      var kind = t.getAttribute('data-f');
      var bucket = kind === 'diet' ? state.diets : kind === 'category' ? state.cats : state.brands;
      var i = bucket.indexOf(t.value);
      if (t.checked && i === -1) bucket.push(t.value);
      if (!t.checked && i > -1) bucket.splice(i, 1);
      update();
    } else if (t.matches('[data-price-min]')) {
      state.min = t.value === '' ? null : parseFloat(t.value); update();
    } else if (t.matches('[data-price-max]')) {
      state.max = t.value === '' ? null : parseFloat(t.value); update();
    } else if (t.matches('[data-instock]')) {
      state.instock = t.checked; update();
    } else if (t.matches('[data-onsale]')) {
      state.sale = t.checked; update();
    } else if (t.matches('[data-sort]')) {
      state.sort = t.value; update();
    }
  });

  doc.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-chip-k]');
    if (chip) {
      var k = chip.getAttribute('data-chip-k');
      var v = chip.getAttribute('data-chip-v');
      if (k === 'q') state.q = '';
      else if (k === 'diet') state.diets = state.diets.filter(function (x) { return x !== v; });
      else if (k === 'category') state.cats = state.cats.filter(function (x) { return x !== v; });
      else if (k === 'brand') state.brands = state.brands.filter(function (x) { return x !== v; });
      else if (k === 'min') state.min = null;
      else if (k === 'max') state.max = null;
      else if (k === 'instock') state.instock = false;
      else if (k === 'sale') state.sale = false;
      syncSidebar();
      update();
      return;
    }

    if (e.target.closest('[data-clear-filters]')) {
      state.q = ''; state.diets = []; state.cats = []; state.brands = [];
      state.min = null; state.max = null; state.instock = false; state.sale = false;
      state.sort = 'popular';
      var input = doc.getElementById('zn-search');
      if (input) input.value = '';
      syncSidebar();
      update();
      return;
    }

    if (e.target.closest('[data-more]')) {
      state.shown += PAGE;
      render();
    }
  });

  /* ---------- boot ---------------------------------------------- */
  readUrl();
  ZN.load().then(function (products) {
    all = products;
    buildSidebar(products);
    syncSidebar();
    render();
  });
})(window);
