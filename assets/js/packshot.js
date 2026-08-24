/* ------------------------------------------------------------------
   packshot.js — illustrated product imagery

   The client's catalogue has no consistent photography, so every
   product is drawn from its own data: pack type + brand colour.
   The result is one coherent look across all 70 items.

   If a product has an `image` URL, that photo is used instead and
   this generator is skipped — so real photography can be dropped in
   product by product from the admin backend without a rebuild.
------------------------------------------------------------------- */
(function (global) {
  'use strict';

  /* ---------- colour helpers ------------------------------------ */
  function toRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function toHex(rgb) {
    return '#' + rgb.map(function (v) {
      var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return s.length === 1 ? '0' + s : s;
    }).join('');
  }
  /** mix(a, b, t) — t=0 returns a, t=1 returns b */
  function mix(a, b, t) {
    var ra = toRgb(a), rb = toRgb(b);
    return toHex([0, 1, 2].map(function (i) { return ra[i] + (rb[i] - ra[i]) * t; }));
  }

  /** Relative luminance, for keeping white label text readable. */
  function luminance(hex) {
    var c = toRgb(hex).map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  /** Darken a brand colour until white text on it clears 4.5:1. */
  function ink(hex, target) {
    var t = target == null ? 0.175 : target;
    var c = hex, guard = 0;
    while (luminance(c) > t && guard++ < 24) c = mix(c, '#000000', 0.1);
    return c;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Stable pseudo-random from a string, so a product always looks the same. */
  function seed(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
    return h;
  }

  var SHELL = '#F7F5EF';
  var SHELL_EDGE = '#E3DFD4';

  /* ---------- label band ---------------------------------------- */
  /* Real packaging carries the product name, not just the brand, and so
     does this: without it, six Dragon pouches all render identically. */
  function shortName(name) {
    return String(name).replace(/^Bio\s+/i, '').replace(/,\s*/g, ' ').trim();
  }

  function wrapWords(words, maxChars) {
    var lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var candidate = line ? line + ' ' + words[i] : words[i];
      if (candidate.length > maxChars && line) { lines.push(line); line = words[i]; }
      else line = candidate;
    }
    if (line) lines.push(line);
    return lines;
  }

  function label(x, y, w, h, brandColor, brand, name, size) {
    var words = shortName(name).split(/\s+/);
    var sizes = [16, 15, 14, 13, 12, 11, 10, 9, 8];
    var fs = sizes[sizes.length - 1];
    var lines = wrapWords(words, 40);

    // Step the type down until the wrapped name fits the band's height.
    for (var i = 0; i < sizes.length; i++) {
      var maxChars = Math.max(4, Math.floor((w - 16) / (sizes[i] * 0.6)));
      var roomForLines = Math.max(1, Math.floor((h - 38) / (sizes[i] * 1.18)));
      var attempt = wrapWords(words, maxChars);
      var overflows = attempt.some(function (l) { return l.length > maxChars + 2; });
      fs = sizes[i];
      lines = attempt;
      if (attempt.length <= roomForLines && !overflows) break;
    }

    // Last resort on a very long name in a very short band.
    var hardCap = Math.max(1, Math.floor((h - 38) / (fs * 1.18)));
    if (lines.length > hardCap) {
      lines = lines.slice(0, hardCap);
      lines[hardCap - 1] = lines[hardCap - 1].replace(/\s*\S*$/, '') + '…';
    }

    var cx = x + w / 2;
    var lineH = fs * 1.18;
    var blockTop = y + 20;
    var blockBottom = y + h - 18;
    var firstBaseline = blockTop + ((blockBottom - blockTop) - lines.length * lineH) / 2 + fs;

    var nameText = lines.map(function (l, i) {
      return '<text x="' + cx + '" y="' + (firstBaseline + i * lineH).toFixed(1) + '" text-anchor="middle" ' +
        'font-family="DM Mono, ui-monospace, monospace" font-size="' + fs + '" ' +
        'fill="#FFFFFF">' + esc(l) + '</text>';
    }).join('');

    var band = ink(brandColor);

    return '' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + band + '"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="3" fill="' + mix(band, '#000000', 0.22) + '"/>' +
      '<text x="' + cx + '" y="' + (y + 17) + '" text-anchor="middle" ' +
        'font-family="DM Mono, ui-monospace, monospace" font-size="9.5" letter-spacing="2" ' +
        'fill="#FFFFFF" fill-opacity="0.78">' + esc(brand.toUpperCase()) + '</text>' +
      nameText +
      '<text x="' + cx + '" y="' + (y + h - 7) + '" text-anchor="middle" ' +
        'font-family="DM Mono, ui-monospace, monospace" font-size="10.5" ' +
        'fill="#FFFFFF" fill-opacity="0.78">' + esc(size) + '</text>';
  }

  /* ---------- pack silhouettes ---------------------------------- */
  var PACKS = {
    jar: function (c, brand, name, size) {
      return '<rect x="144" y="104" width="112" height="40" rx="12" fill="' + mix(c, '#000000', 0.16) + '"/>' +
        '<rect x="130" y="136" width="140" height="190" rx="22" fill="' + SHELL + '" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        label(130, 182, 140, 100, c, brand, name, size);
    },
    bottle: function (c, brand, name, size) {
      return '<rect x="176" y="66" width="48" height="26" rx="8" fill="' + mix(c, '#000000', 0.16) + '"/>' +
        '<rect x="184" y="90" width="32" height="44" fill="' + SHELL + '" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        '<path d="M148 150 q0-18 36-22 h32 q36 4 36 22 v156 q0 20-20 20 h-64 q-20 0-20-20 z" fill="' + SHELL + '" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        label(148, 186, 104, 100, c, brand, name, size);
    },
    pouch: function (c, brand, name, size) {
      return '<path d="M140 116 q4-14 20-14 h80 q16 0 20 14 l6 24 v152 q0 20-20 20 h-92 q-20 0-20-20 v-152 z" fill="' + SHELL + '" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        '<rect x="136" y="100" width="128" height="14" rx="4" fill="' + c + '" fill-opacity="0.35"/>' +
        '<path d="M158 140 v152 M242 140 v152" stroke="' + SHELL_EDGE + '" stroke-width="1.5" opacity="0.65"/>' +
        label(134, 184, 132, 100, c, brand, name, size);
    },
    box: function (c, brand, name, size) {
      return '<path d="M262 110 l28-17 v212 l-28 17 z" fill="' + mix(c, '#000000', 0.3) + '" fill-opacity="0.22"/>' +
        '<path d="M136 110 l28-17 h126 l-28 17 z" fill="' + mix(SHELL, '#000000', 0.06) + '"/>' +
        '<rect x="136" y="110" width="126" height="212" rx="4" fill="' + SHELL + '" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        label(136, 178, 126, 102, c, brand, name, size);
    },
    carton: function (c, brand, name, size) { return PACKS.box(c, brand, name, size); },
    bread: function (c, brand, name, size) {
      return '<path d="M128 206 q0-64 72-64 t72 64 v96 q0 20-20 20 h-104 q-20 0-20-20 z" fill="#F0E4CC"/>' +
        '<path d="M124 198 q0-72 76-72 t76 72 v104 q0 22-22 22 h-108 q-22 0-22-22 z" fill="#FFFFFF" fill-opacity="0.5" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        '<rect x="184" y="106" width="32" height="16" rx="6" fill="' + mix(c, '#000000', 0.16) + '"/>' +
        label(124, 200, 152, 96, c, brand, name, size);
    },
    bar: function (c, brand, name, size) {
      return '<path d="M96 158 l14 14 -14 14 v66 l14 14 -14 14 z" fill="' + mix(c, '#000000', 0.16) + '"/>' +
        '<path d="M304 158 l-14 14 14 14 v66 l-14 14 14 14 z" fill="' + mix(c, '#000000', 0.16) + '"/>' +
        '<rect x="108" y="154" width="184" height="126" rx="8" fill="' + SHELL + '" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        label(108, 172, 184, 92, c, brand, name, size);
    },
    tube: function (c, brand, name, size) {
      return '<rect x="180" y="80" width="40" height="34" rx="9" fill="' + mix(c, '#000000', 0.16) + '"/>' +
        '<path d="M154 114 h92 v148 l-13 58 h-66 l-13-58 z" fill="' + SHELL + '" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        '<rect x="168" y="302" width="64" height="10" rx="3" fill="' + mix(c, '#000000', 0.16) + '"/>' +
        label(154, 152, 92, 96, c, brand, name, size);
    },
    tin: function (c, brand, name, size) {
      return '<ellipse cx="200" cy="152" rx="80" ry="22" fill="' + mix(c, '#000000', 0.16) + '"/>' +
        '<rect x="120" y="152" width="160" height="140" fill="' + SHELL + '"/>' +
        '<ellipse cx="200" cy="292" rx="80" ry="22" fill="' + mix(SHELL, '#000000', 0.07) + '"/>' +
        label(120, 186, 160, 92, c, brand, name, size);
    },
    sachet: function (c, brand, name, size) {
      return '<path d="M124 138 q76-16 152 0 v152 q-76 16-152 0 z" fill="' + SHELL + '" stroke="' + SHELL_EDGE + '" stroke-width="2"/>' +
        '<rect x="124" y="126" width="152" height="14" rx="3" fill="' + c + '" fill-opacity="0.32"/>' +
        label(124, 176, 152, 92, c, brand, name, size);
    }
  };

  /* ---------- public API ---------------------------------------- */
  function packshot(product) {
    if (product.image) {
      return '<img src="' + esc(product.image) + '" alt="' + esc(product.brand + ' ' + product.name) + '" loading="lazy">';
    }

    var brand = (global.ZN_BRANDS && global.ZN_BRANDS[product.brand]) || { color: '#174436' };
    var c = brand.color;
    var draw = PACKS[product.pack] || PACKS.box;
    var s = seed(product.id);
    var tilt = (s % 7) - 3;               // -3deg .. +3deg, stable per product
    var blobX = 140 + (s % 40);

    // Backgrounds are mixed toward the page's paper tone rather than white,
    // so ten different brand colours still read as one coherent grid.
    var PAPER = '#F1F4EA';

    return '' +
      '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" ' +
        'aria-label="' + esc(product.brand + ' ' + product.name) + '">' +
        '<rect width="400" height="400" fill="' + mix(c, PAPER, 0.95) + '"/>' +
        '<circle cx="' + blobX + '" cy="150" r="132" fill="' + mix(c, PAPER, 0.89) + '"/>' +
        '<circle cx="300" cy="300" r="86" fill="' + mix(c, PAPER, 0.92) + '"/>' +
        '<ellipse cx="200" cy="330" rx="104" ry="16" fill="' + mix(c, '#000000', 0.6) + '" fill-opacity="0.07"/>' +
        '<g transform="rotate(' + tilt + ' 200 220)">' + draw(c, product.brand, product.name, product.size) + '</g>' +
      '</svg>';
  }

  /* Abstract art for the category tiles — a leaf motif tinted per category. */
  function categoryArt(color) {
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="58" fill="' + color + '" fill-opacity="0.1"/>' +
      '<path d="M84 34c0 30-16 48-40 50 0-30 16-48 40-50z" fill="' + color + '" fill-opacity="0.4"/>' +
      '<path d="M84 34C64 44 52 60 44 84" stroke="' + color + '" stroke-opacity="0.55" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* Recipe card art — three stable variations. */
  function recipeArt(i, color) {
    var v = i % 3;
    var body;
    if (v === 0) {
      body = '<circle cx="150" cy="105" r="52" fill="' + color + '" fill-opacity="0.28"/>' +
             '<circle cx="212" cy="128" r="34" fill="' + color + '" fill-opacity="0.42"/>' +
             '<circle cx="96" cy="132" r="28" fill="' + color + '" fill-opacity="0.36"/>';
    } else if (v === 1) {
      body = '<rect x="70" y="70" width="160" height="72" rx="36" fill="' + color + '" fill-opacity="0.3"/>' +
             '<circle cx="110" cy="106" r="20" fill="' + color + '" fill-opacity="0.5"/>' +
             '<circle cx="190" cy="106" r="20" fill="' + color + '" fill-opacity="0.5"/>';
    } else {
      body = '<path d="M60 150 q90-100 180 0z" fill="' + color + '" fill-opacity="0.3"/>' +
             '<circle cx="150" cy="86" r="24" fill="' + color + '" fill-opacity="0.5"/>';
    }
    return '<svg viewBox="0 0 300 188" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ' +
      'style="width:100%;height:100%">' + body + '</svg>';
  }

  global.ZNArt = { packshot: packshot, categoryArt: categoryArt, recipeArt: recipeArt, mix: mix, ink: ink };
})(window);
