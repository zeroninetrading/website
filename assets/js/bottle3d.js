/* ------------------------------------------------------------------
   bottle3d.js — the rotating product in the hero

   No WebGL and no 3D library. A bottle is a surface of revolution, so
   its outline is identical from every angle — the only things that
   actually change as it turns are the label and the highlight.

   So: draw the fixed silhouette, then map the label onto it as a
   cylinder. Each column of a flat label texture is placed at
   x = R·sin(θ) and squeezed by cos(θ), which is genuine cylindrical
   texture mapping and reads as real rotation. Shading is a Lambert
   term over the same angle.

   The whole thing is one canvas, works offline, and degrades to a
   still three-quarter view when prefers-reduced-motion is set.
------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function toRgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  /* Returns hex, not rgb(), so the result can be shaded again. */
  function shade(hex, amount) {
    return '#' + toRgb(hex).map(function (v) {
      var n = clamp(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount, 0, 255);
      var h = Math.round(n).toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('');
  }

  /* ---------- silhouette profiles -------------------------------- */
  /* Each returns the radius, 0..1 of maxR, at height t (0 = top). */
  var PROFILES = {
    bottle: function (t) {
      if (t < 0.045) return 0.30;                                        // cap
      if (t < 0.065) return 0.26;                                        // lip
      if (t < 0.26)  return 0.22;                                        // neck
      if (t < 0.42)  return 0.22 + 0.78 * smoothstep((t - 0.26) / 0.16); // shoulder
      if (t < 0.965) return 1;                                           // body
      return 1 - 0.30 * smoothstep((t - 0.965) / 0.035);                 // base
    },
    jar: function (t) {
      if (t < 0.085) return 0.88;                                        // screw lid
      if (t < 0.11)  return 0.84;
      if (t < 0.15)  return 0.94 + 0.06 * smoothstep((t - 0.11) / 0.04); // shoulder
      if (t < 0.955) return 1;
      return 1 - 0.24 * smoothstep((t - 0.955) / 0.045);
    },
    tin: function (t) {
      if (t < 0.075) return 1;                                           // press lid
      if (t < 0.10)  return 0.96;
      if (t < 0.955) return 1;
      return 1 - 0.12 * smoothstep((t - 0.955) / 0.045);
    }
  };

  /* Per shape: where the cap ends, where the label sits, how tall the whole
     thing is relative to the canvas, and how wide relative to that height.
     A tin is squat, a bottle is not — without this they all come out the
     same size and the tin looks stretched. */
  var LAYOUT = {
    bottle: { capTo: 0.065, label: [0.50, 0.84], height: 0.88, girth: 0.23 },
    jar:    { capTo: 0.11,  label: [0.34, 0.76], height: 0.76, girth: 0.28 },
    tin:    { capTo: 0.10,  label: [0.26, 0.74], height: 0.54, girth: 0.46 }
  };

  function Bottle(canvas, opts) {
    var self = this;
    this.canvas = canvas;
    this.ctx = canvas.getContext ? canvas.getContext('2d') : null;
    this.phase = 0.6;
    this.spin = 0.011;
    this.velocity = 0;
    this.dragging = false;
    this.product = null;
    this.labelCanvas = doc_createCanvas();
    this.reduced = global.ZNMotion ? global.ZNMotion.reduced : false;
    this.running = false;

    this.setProduct(opts && opts.product);
    this.resize();

    global.addEventListener('resize', function () { self.resize(); self.draw(); }, { passive: true });

    /* drag to spin */
    function down(e) {
      self.dragging = true;
      self.lastX = (e.touches ? e.touches[0].clientX : e.clientX);
      canvas.classList.add('is-dragging');
    }
    function move(e) {
      if (!self.dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      var dx = x - self.lastX;
      self.lastX = x;
      self.phase -= dx * 0.012;
      self.velocity = -dx * 0.012;
      if (e.cancelable && e.touches) e.preventDefault();
      if (self.reduced) self.draw();
    }
    function up() {
      self.dragging = false;
      canvas.classList.remove('is-dragging');
    }

    canvas.addEventListener('mousedown', down);
    global.addEventListener('mousemove', move);
    global.addEventListener('mouseup', up);
    canvas.addEventListener('touchstart', down, { passive: true });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', up);

    /* keyboard: left/right nudge the rotation */
    canvas.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { self.phase -= 0.25; self.draw(); }
      if (e.key === 'ArrowRight') { self.phase += 0.25; self.draw(); }
    });

    /* Only animate while the canvas is actually on screen. */
    if ('IntersectionObserver' in global) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) self.start(); else self.stop();
        });
      }, { threshold: 0.05 }).observe(canvas);
    } else {
      this.start();
    }
  }

  function doc_createCanvas() { return document.createElement('canvas'); }

  Bottle.prototype.resize = function () {
    if (!this.ctx) return;
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var w = this.canvas.clientWidth || 380;
    var h = this.canvas.clientHeight || 480;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w;
    this.h = h;
  };

  /* Render the flat label once; the draw loop just samples columns. */
  Bottle.prototype.buildLabel = function () {
    var p = this.product;
    if (!p || !this.ctx) return;
    var g0 = this.labelCanvas.getContext ? this.labelCanvas.getContext('2d') : null;
    if (!g0) return;

    var R = this.radius();
    var W = Math.max(240, Math.round(TAU * R * 2));
    var H = Math.max(90, Math.round(this.labelHeight() * 2));

    var lc = this.labelCanvas;
    lc.width = W;
    lc.height = H;
    var g = g0;

    g.clearRect(0, 0, W, H);
    g.fillStyle = p.color;
    g.fillRect(0, 0, W, H);

    g.fillStyle = 'rgba(0,0,0,0.16)';
    g.fillRect(0, 0, W, 5);

    // The label wraps, so the text is drawn twice half a turn apart —
    // whichever face is toward the viewer always reads.
    var brand = String(p.brand || '').toUpperCase();
    var name = String(p.name || '').replace(/^Bio\s+/i, '');

    for (var k = 0; k < 2; k++) {
      var cx = W * (0.25 + k * 0.5);

      g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,0.8)';
      g.font = '500 ' + Math.round(H * 0.13) + 'px "JetBrains Mono", ui-monospace, monospace';
      g.fillText(spaced(brand), cx, H * 0.26);

      g.fillStyle = '#FFFFFF';
      var lines = wrap(name, 16);
      var fs = Math.round(H * (lines.length > 2 ? 0.155 : 0.19));
      g.font = '700 ' + fs + 'px Outfit, "Trebuchet MS", sans-serif';
      var top = H * 0.46;
      lines.forEach(function (line, i) {
        g.fillText(line, cx, top + i * fs * 1.14);
      });

      g.fillStyle = 'rgba(255,255,255,0.75)';
      g.font = '400 ' + Math.round(H * 0.12) + 'px "JetBrains Mono", ui-monospace, monospace';
      g.fillText(String(p.size || ''), cx, H * 0.90);
    }
  };

  function spaced(s) { return s.split('').join(' '); }

  function wrap(text, max) {
    var words = String(text).split(/\s+/);
    var lines = [], line = '';
    words.forEach(function (w) {
      var next = line ? line + ' ' + w : w;
      if (next.length > max && line) { lines.push(line); line = w; }
      else line = next;
    });
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  Bottle.prototype.radius = function () {
    return this.h * LAYOUT[this.shape()].height * LAYOUT[this.shape()].girth;
  };
  Bottle.prototype.labelHeight = function () {
    var L = LAYOUT[this.shape()].label;
    return (L[1] - L[0]) * this.bodyHeight();
  };
  Bottle.prototype.bodyHeight = function () { return this.h * LAYOUT[this.shape()].height; };
  Bottle.prototype.shape = function () {
    var pack = this.product && this.product.pack;
    return PROFILES[pack] ? pack : 'bottle';
  };

  Bottle.prototype.setProduct = function (p) {
    this.product = p || null;
    if (p) this.buildLabel();
    this.draw();
  };

  /* ---------- drawing --------------------------------------------- */
  Bottle.prototype.silhouette = function (ctx, profile, cx, top, H, R) {
    var steps = 90;
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      ctx.lineTo(cx - profile(t) * R, top + t * H);
    }
    for (var j = steps; j >= 0; j--) {
      var t2 = j / steps;
      ctx.lineTo(cx + profile(t2) * R, top + t2 * H);
    }
    ctx.closePath();
  };

  Bottle.prototype.draw = function () {
    var ctx = this.ctx;
    var p = this.product;
    if (!ctx || !this.w) return;

    ctx.clearRect(0, 0, this.w, this.h);
    if (!p) return;

    var shape = this.shape();
    var profile = PROFILES[shape];
    var layout = LAYOUT[shape];

    var R = this.radius();
    var H = this.bodyHeight();
    var cx = this.w / 2;
    var top = this.h * 0.94 - H;   // same baseline whatever the shape

    /* ground shadow, squashed and offset with the light */
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#0E2A22';
    ctx.beginPath();
    ctx.ellipse(cx + R * 0.10, top + H + 8, R * 1.15, R * 0.17, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    this.silhouette(ctx, profile, cx, top, H, R);
    ctx.clip();

    /* glass body: a cylinder lit from the upper left */
    var body = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
    body.addColorStop(0.00, '#D9D9CF');
    body.addColorStop(0.16, '#F2F0E8');
    body.addColorStop(0.34, '#FFFFFF');
    body.addColorStop(0.62, '#F4F2EA');
    body.addColorStop(0.86, '#DAD8CD');
    body.addColorStop(1.00, '#BFC0B5');
    ctx.fillStyle = body;
    ctx.fillRect(cx - R - 2, top - 2, R * 2 + 4, H + 4);

    /* cap */
    var capH = layout.capTo * H;
    var capCol = shade(p.color, -0.42);
    var capGrad = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
    capGrad.addColorStop(0, shade(capCol, -0.3));
    capGrad.addColorStop(0.34, shade(capCol, 0.16));
    capGrad.addColorStop(1, shade(capCol, -0.42));
    ctx.fillStyle = capGrad;
    ctx.fillRect(cx - R - 2, top - 2, R * 2 + 4, capH + 4);

    /* label, mapped around the cylinder */
    var lTop = top + layout.label[0] * H;
    var lH = (layout.label[1] - layout.label[0]) * H;
    this.drawLabel(ctx, cx, lTop, lH, R);

    /* specular highlight */
    var spec = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
    spec.addColorStop(0.12, 'rgba(255,255,255,0)');
    spec.addColorStop(0.26, 'rgba(255,255,255,0.55)');
    spec.addColorStop(0.36, 'rgba(255,255,255,0)');
    ctx.fillStyle = spec;
    ctx.fillRect(cx - R, top, R * 2, H);

    /* edge darkening, so the form reads as round */
    var edge = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
    edge.addColorStop(0.00, 'rgba(14,42,34,0.30)');
    edge.addColorStop(0.14, 'rgba(14,42,34,0)');
    edge.addColorStop(0.84, 'rgba(14,42,34,0)');
    edge.addColorStop(1.00, 'rgba(14,42,34,0.34)');
    ctx.fillStyle = edge;
    ctx.fillRect(cx - R, top, R * 2, H);

    ctx.restore();

    /* outline */
    ctx.save();
    this.silhouette(ctx, profile, cx, top, H, R);
    ctx.strokeStyle = 'rgba(14,42,34,0.16)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    /* top ellipse, so the neck reads as an opening rather than a flat edge */
    var rTop = profile(0.001) * R;
    ctx.save();
    ctx.fillStyle = shade(capCol, 0.22);
    ctx.beginPath();
    ctx.ellipse(cx, top, rTop, rTop * 0.24, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  Bottle.prototype.drawLabel = function (ctx, cx, top, h, R) {
    var lc = this.labelCanvas;
    if (!lc.width) return;

    var cols = 150;
    var srcStep = lc.width / cols;

    for (var i = 0; i < cols; i++) {
      var theta = (i / cols) * TAU + this.phase;
      var c = Math.cos(theta);
      if (c <= 0.02) continue;                 // facing away

      var x = cx + R * Math.sin(theta);
      var w = (TAU * R / cols) * c;
      if (w < 0.35) w = 0.35;

      ctx.drawImage(lc, i * srcStep, 0, srcStep, lc.height, x - w / 2, top, w + 0.6, h);
    }

    /* Lambert shading across the label, matching the body's light */
    var g = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
    g.addColorStop(0.00, 'rgba(0,0,0,0.42)');
    g.addColorStop(0.20, 'rgba(0,0,0,0.10)');
    g.addColorStop(0.34, 'rgba(255,255,255,0.16)');
    g.addColorStop(0.62, 'rgba(0,0,0,0.06)');
    g.addColorStop(1.00, 'rgba(0,0,0,0.46)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - R, top, R * 2, h);
  };

  /* ---------- loop ------------------------------------------------ */
  Bottle.prototype.start = function () {
    if (this.running) return;
    this.running = true;

    if (this.reduced) { this.draw(); return; }

    var self = this;
    function frame() {
      if (!self.running) return;
      if (!self.dragging) {
        // ease any flick back into the steady turn
        self.velocity *= 0.94;
        self.phase += self.spin + self.velocity;
      }
      self.draw();
      self.raf = requestAnimationFrame(frame);
    }
    this.raf = requestAnimationFrame(frame);
  };

  Bottle.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  };

  global.ZNBottle = {
    /** Returns null when canvas isn't usable, so the caller can fall back. */
    create: function (canvas, opts) {
      if (!canvas || !canvas.getContext || !canvas.getContext('2d')) return null;
      return new Bottle(canvas, opts);
    },
    supported: function (canvas) {
      var c = canvas || document.createElement('canvas');
      return !!(c.getContext && c.getContext('2d'));
    },
    shapes: Object.keys(PROFILES)
  };

})(window);
