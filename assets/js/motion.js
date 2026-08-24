/* ------------------------------------------------------------------
   motion.js — scroll behaviour for the public site

   One IntersectionObserver drives every reveal on the page, so adding
   an animation is a matter of putting an attribute on the element
   rather than writing more JavaScript:

     data-animate="fade-up"      how it enters (see main.css)
     data-animate-delay="120"    milliseconds
     data-stagger="70"           on a parent: delays each child in turn
     data-parallax="0.12"        drifts against the scroll
     data-count-to="82"          counts up when it comes into view

   Everything here checks prefers-reduced-motion first. When that's set,
   elements are simply shown in place and nothing moves.
------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var doc = document;
  var reduced = global.matchMedia &&
    global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveals -------------------------------------------- */
  var observer = null;

  function showNow(el) {
    el.classList.add('is-in');
    if (el.hasAttribute('data-count-to')) countUp(el, true);
  }

  function reveal(scope) {
    var nodes = (scope || doc).querySelectorAll(
      '[data-animate]:not(.is-in), .reveal:not(.is-in)'
    );
    if (!nodes.length) return;

    // Give staggered children their own delay before anything is observed.
    Array.prototype.forEach.call((scope || doc).querySelectorAll('[data-stagger]'), function (parent) {
      var step = parseInt(parent.getAttribute('data-stagger'), 10) || 60;
      Array.prototype.forEach.call(parent.children, function (child, i) {
        if (!child.hasAttribute('data-animate-delay')) {
          child.style.setProperty('--d', (i * step) + 'ms');
        }
      });
    });

    Array.prototype.forEach.call(nodes, function (el) {
      var delay = el.getAttribute('data-animate-delay');
      if (delay) el.style.setProperty('--d', delay + 'ms');
    });

    if (reduced || !('IntersectionObserver' in global)) {
      Array.prototype.forEach.call(nodes, showNow);
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          showNow(e.target);
          observer.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    }

    Array.prototype.forEach.call(nodes, function (el) { observer.observe(el); });
    counters(scope);
  }

  /* Counters are handled separately: the number is usually nested inside a
     block that carries the reveal, so it never gets observed on its own —
     and it may be added to the page after the first pass. */
  function counters(scope) {
    var nums = (scope || doc).querySelectorAll('[data-count-to]:not([data-counted="1"])');

    Array.prototype.forEach.call(nums, function (el) {
      if (reduced || !observer || el.classList.contains('is-in')) {
        countUp(el, reduced);
        return;
      }
      observer.observe(el);
    });
  }

  /* ---------- count-up ------------------------------------------- */
  function countUp(el, instant) {
    if (el.dataset.counted === '1') return;
    el.dataset.counted = '1';

    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var suffix = el.getAttribute('data-count-suffix') || '';

    if (instant || reduced) {
      el.textContent = Math.round(target) + suffix;
      return;
    }

    var dur = 1100;
    var start = null;

    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- scroll-linked bits ---------------------------------- */
  var parallaxItems = [];
  var ticking = false;

  function collectParallax() {
    parallaxItems = Array.prototype.slice.call(doc.querySelectorAll('[data-parallax]'));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = global.pageYOffset || doc.documentElement.scrollTop;

      // progress bar
      var bar = doc.querySelector('[data-progress]');
      if (bar) {
        var h = doc.documentElement.scrollHeight - global.innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
      }

      // header state
      var head = doc.querySelector('.masthead');
      if (head) head.classList.toggle('is-stuck', y > 8);

      if (!reduced) {
        parallaxItems.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > global.innerHeight + 200) return;
          var rate = parseFloat(el.getAttribute('data-parallax')) || 0.1;
          var mid = rect.top + rect.height / 2 - global.innerHeight / 2;
          el.style.setProperty('--py', (-mid * rate).toFixed(1) + 'px');
        });
      }

      ticking = false;
    });
  }

  /* ---------- public --------------------------------------------- */
  function init(scope) {
    reveal(scope);
    counters(scope);
    collectParallax();
    onScroll();
  }

  global.ZNMotion = {
    init: init,
    reveal: reveal,
    count: counters,
    reduced: reduced
  };

  global.addEventListener('scroll', onScroll, { passive: true });
  global.addEventListener('resize', function () { collectParallax(); onScroll(); }, { passive: true });

  if (doc.readyState !== 'loading') init();
  else doc.addEventListener('DOMContentLoaded', function () { init(); });

})(window);
