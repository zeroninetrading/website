/* ------------------------------------------------------------------
   pages.js — about, contact, recipes, 404
------------------------------------------------------------------- */
(function () {
  'use strict';

  var doc = document;
  var esc = ZNUI.esc;
  var page = doc.body.getAttribute('data-page') || '';

  ZNUI.mount(page);

  /* ---------- contact: icons in the info cards ------------------ */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-info]'), function (row) {
    var key = row.getAttribute('data-info');
    var icon = ZNUI.icons[key];
    if (icon) row.insertAdjacentHTML('afterbegin', icon);
  });

  /* ---------- contact form -------------------------------------- */
  var contactForm = doc.querySelector('[data-contact]');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = doc.querySelector('[data-contact-msg]');
      var name = contactForm.querySelector('#c-name').value.trim();
      var email = contactForm.querySelector('#c-email').value.trim();
      var body = contactForm.querySelector('#c-message').value.trim();

      if (!name || !email || !body) {
        msg.style.color = 'var(--berry)';
        msg.textContent = 'Fill in your name, email and message so we can reply.';
        return;
      }
      if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
        msg.style.color = 'var(--berry)';
        msg.textContent = 'That email address doesn\'t look right — check it and try again.';
        return;
      }

      msg.style.color = 'var(--pine)';
      msg.textContent = 'Thanks ' + name + '. On the live site this reaches the office inbox within a minute.';
      contactForm.reset();
    });
  }

  /* ---------- FAQ ------------------------------------------------ */
  var faq = doc.querySelector('[data-faq]');
  if (faq && window.ZN_FAQ) {
    faq.innerHTML = ZN_FAQ.map(function (item) {
      return '<details><summary>' + esc(item.q) + '</summary><p>' + esc(item.a) + '</p></details>';
    }).join('');
  }

  /* ---------- brand strip (about page) --------------------------- */
  var brandStrip = doc.querySelector('[data-brands]');

  /* ---------- recipes -------------------------------------------- */
  var recipeList = doc.querySelector('[data-recipe-list]');

  if (brandStrip || recipeList || doc.querySelector('[data-about-products]')) {
    ZN.load().then(function (products) {

      if (brandStrip) {
        brandStrip.innerHTML = Object.keys(ZN_BRANDS).map(function (name) {
          var b = ZN_BRANDS[name];
          var n = products.filter(function (p) { return p.brand === name; }).length;
          return '<a class="brand-chip" href="shop.html?brand=' + encodeURIComponent(name) + '">' +
            '<span class="brand-chip__bar" style="background:' + esc(b.color) + '"></span>' +
            '<span class="brand-chip__name">' + esc(name) + '</span>' +
            '<span class="brand-chip__origin">' + esc(b.origin) + ' · ' + n + ' items</span>' +
          '</a>';
        }).join('');
      }

      var pc = doc.querySelector('[data-about-products]');
      if (pc) pc.textContent = products.length;
      var bc = doc.querySelector('[data-about-brands]');
      if (bc) bc.textContent = Object.keys(ZN_BRANDS).length;

      if (recipeList) {
        recipeList.innerHTML = ZN_RECIPES.map(function (r) {
          var used = (r.uses || []).map(function (id) {
            return products.filter(function (p) { return p.id === id; })[0];
          }).filter(Boolean);

          var steps = (r.steps || []).map(function (s) {
            return '<li>' + esc(s) + '</li>';
          }).join('');

          return '<article id="' + esc(r.id) + '" class="infocard" data-animate="fade-up" style="margin-bottom:22px;padding:0;overflow:hidden">' +
            '<div style="display:grid;grid-template-columns:minmax(0,220px) minmax(0,1fr);gap:0" class="recipe-row">' +
              '<div class="recipe__art" style="aspect-ratio:auto;min-height:100%">' +
                '<img src="' + esc(r.image) + '" alt="" loading="lazy" width="600" height="400">' +
              '</div>' +
              '<div style="padding:26px">' +
                '<div class="recipe__date">' + esc(r.date) + ' · ' + r.minutes + ' minutes</div>' +
                '<h2 style="font-size:1.5rem;margin-bottom:10px">' + esc(r.title) + '</h2>' +
                '<p style="color:var(--muted)">' + esc(r.excerpt) + '</p>' +
                (steps ? '<ol style="color:var(--muted);padding-left:20px;display:grid;gap:8px;margin:0 0 20px">' + steps + '</ol>' : '') +
                (used.length
                  ? '<div class="eyebrow" style="margin-bottom:10px">What you\'ll need</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
                      used.map(function (p) {
                        return '<a class="pill" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
                          esc(p.name) + '<span class="pill__tag">' + ZN.money(p.price) + '</span></a>';
                      }).join('') +
                    '</div>'
                  : '') +
              '</div>' +
            '</div></article>';
        }).join('');

        // Stack the art above the text on narrow screens.
        var style = doc.createElement('style');
        style.textContent = '@media (max-width:720px){.recipe-row{grid-template-columns:minmax(0,1fr) !important}' +
          '.recipe-row .recipe__art{min-height:150px !important}}';
        doc.head.appendChild(style);

        if (location.hash) {
          var target = doc.getElementById(location.hash.slice(1));
          if (target) target.scrollIntoView();
        }
      }

      if (window.ZNMotion) window.ZNMotion.init();
    });
  }
})();
