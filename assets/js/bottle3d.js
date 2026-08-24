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
      if (t < 0.055) return 0.30;                      // cap
      if (t < 0.075) return 0.255;                     // lip
      if (t < 0.26)  return 0.215;                     // neck
      if (t < 0.40)  {                                 // shoulder
        // Tangent to the neck at the top and to the body at the bottom.
        // Keep this span short: stretch it and the middle goes straight,
        // which reads as a funnel.
        return 0.215 + 0.785 * smoothstep((t - 0.26) / 0.14);
      }
      if (t < 0.97) return 1;                          // body
      return 1 - 0.06 * smoothstep((t - 0.97) / 0.03); // base chamfer
    },
    jar: function (t) {
      if (t < 0.085) return 0.88;                                        // screw lid
      if (t < 0.11)  return 0.84;
      if (t < 0.15)  return 0.94 + 0.06 * smoothstep((t - 0.11) / 0.04); // shoulder
      if (t < 0.955) return 1;
      return 1 - 0.07 * smoothstep((t - 0.955) / 0.045);
    },
    tin: function (t) {
      if (t < 0.075) return 1;                                           // press lid
      if (t < 0.10)  return 0.96;
      if (t < 0.955) return 1;
      return 1 - 0.05 * smoothstep((t - 0.955) / 0.045);
    }
  };

  /* Per shape: where the cap ends, where the label sits, how tall the whole
     thing is relative to the canvas, and how wide relative to that height.
     A tin is squat, a bottle is not — without this they all come out the
     same size and the tin looks stretched. */
  var LAYOUT = {
    bottle: { capTo: 0.075, label: [0.46, 0.85], height: 0.90, girth: 0.205 },
    jar:    { capTo: 0.11,  label: [0.27, 0.80], height: 0.76, girth: 0.28 },
    tin:    { capTo: 0.10,  label: [0.15, 0.88], height: 0.54, girth: 0.46 }
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
    this.dropGradients();
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
    this.dropGradients();
    if (p) this.buildLabel();
    this.draw();
  };

  /* ---------- drawing ---------------------------------------------
     Everything is drawn into an offscreen buffer first, so the same
     pixels can be reused for the reflection underneath.

     The perspective is a slight downward tilt. A horizontal circle on
     the cylinder projects to an ellipse, so a point at angle θ sits
     Ez·cos(θ) lower on screen than the band's centre line — near side
     low, far side high. Applying that offset per label column is what
     stops the label reading as a flat sticker.
  ------------------------------------------------------------------ */

  /** Semi-minor axis of the projected circles: how much we see from above. */
  Bottle.prototype.ez = function (r) { return r * 0.26; };

  Bottle.prototype.silhouette = function (ctx, profile, cx, top, H, R) {
    var steps = 120;
    var i, t, r;

    ctx.beginPath();
    ctx.moveTo(cx - profile(0) * R, top);

    for (i = 0; i <= steps; i++) {
      t = i / steps;
      ctx.lineTo(cx - profile(t) * R, top + t * H);
    }

    // rounded base, so the bottle sits on a rim rather than a flat edge
    r = profile(1) * R;
    ctx.ellipse(cx, top + H, r, this.ez(r), 0, Math.PI, 0, true);

    for (i = steps; i >= 0; i--) {
      t = i / steps;
      ctx.lineTo(cx + profile(t) * R, top + t * H);
    }
    ctx.closePath();
  };

  /* Gradients only depend on the geometry and the brand colour, neither of
     which changes between frames — rebuilding six of them per frame was the
     bulk of the draw cost. */
  Bottle.prototype.grad = function (ctx, key, x0, x1, stops) {
    if (!this._grads) this._grads = {};
    var id = key + '|' + Math.round(x0) + '|' + Math.round(x1);
    if (this._grads[id]) return this._grads[id];
    var g = ctx.createLinearGradient(x0, 0, x1, 0);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    this._grads[id] = g;
    return g;
  };

  Bottle.prototype.dropGradients = function () { this._grads = null; this._vert = null; this._shadow = null; this._fade = null; };

  Bottle.prototype.buffer = function () {
    if (!this._buf) {
      this._buf = document.createElement('canvas');
      this._bufCtx = this._buf.getContext ? this._buf.getContext('2d') : null;
    }
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    if (this._buf.width !== Math.round(this.w * dpr)) {
      this._buf.width = Math.round(this.w * dpr);
      this._buf.height = Math.round(this.h * dpr);
    }
    if (this._bufCtx) this._bufCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return this._bufCtx;
  };

  Bottle.prototype.draw = function () {
    var ctx = this.ctx;
    if (!ctx || !this.w || !this.product) return;

    ctx.clearRect(0, 0, this.w, this.h);

    var shape = this.shape();
    var R = this.radius();
    var H = this.bodyHeight();
    var cx = this.w / 2;
    var top = this.h * 0.90 - H;
    var base = top + H;

    /* --- contact shadow: tight and dark under the base, soft further out */
    if (!this._shadow) {
      this._shadow = ctx.createRadialGradient(
        cx + R * 0.06, base + 6, R * 0.08, cx + R * 0.06, base + 6, R * 1.35);
      this._shadow.addColorStop(0, 'rgba(14,42,34,0.30)');
      this._shadow.addColorStop(0.45, 'rgba(14,42,34,0.12)');
      this._shadow.addColorStop(1, 'rgba(14,42,34,0)');
    }
    var sh = this._shadow;
    ctx.save();
    ctx.translate(0, 0);
    ctx.scale(1, 0.19);
    ctx.fillStyle = sh;
    ctx.fillRect(cx - R * 2, (base + 4) / 0.19 - R * 1.4, R * 4, R * 2.8);
    ctx.restore();

    /* --- the bottle itself, into the buffer */
    var bctx = this.buffer();
    if (!bctx) { this.paint(ctx, shape, cx, top, H, R); return; }

    bctx.clearRect(0, 0, this.w, this.h);
    this.paint(bctx, shape, cx, top, H, R);

    /* Blit only the box the bottle occupies. Compositing the whole canvas
       twice a frame is most of the cost on a software rasteriser. */
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var bx = Math.max(0, cx - R - 8);
    var bw = Math.min(this.w - bx, R * 2 + 16);
    var by = Math.max(0, top - 6);
    var bh = Math.min(this.h - by, H + 14);

    var self = this;
    function blit(sx, sy, sw, sh) {
      ctx.drawImage(self._buf, sx * dpr, sy * dpr, sw * dpr, sh * dpr, sx, sy, sw, sh);
    }

    /* --- reflection: flipped about the base, squashed, faded out.
       The base has to map back onto itself, hence 1.42·base rather than
       twice it — getting that wrong pushes the reflection off the canvas. */
    var squash = 0.42;
    var refSrcH = Math.min(bh, H * 0.6);          // only the part that survives the fade
    var refSrcY = base - refSrcH;

    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.translate(0, base * (1 + squash) + 2);
    ctx.scale(1, -squash);
    blit(bx, Math.max(0, refSrcY), bw, refSrcH);
    ctx.restore();

    if (!this._fade) {
      this._fade = ctx.createLinearGradient(0, base, 0, base + H * squash * 0.62);
      this._fade.addColorStop(0, 'rgba(242,245,236,0)');
      this._fade.addColorStop(1, 'rgba(242,245,236,1)');
    }
    ctx.fillStyle = this._fade;
    ctx.fillRect(bx - 4, base, bw + 8, H * squash * 0.62 + 2);

    blit(bx, by, bw, bh);
  };

  Bottle.prototype.paint = function (ctx, shape, cx, top, H, R) {
    var p = this.product;
    var profile = PROFILES[shape];
    var layout = LAYOUT[shape];
    var capCol = shade(p.color, -0.44);

    ctx.save();
    this.silhouette(ctx, profile, cx, top, H, R);
    ctx.clip();

    /* --- glass body. Five stops: shadow edge, core light, midtone,
       terminator, then a rim light picked up from behind on the right. */
    ctx.fillStyle = this.grad(ctx, 'body', cx - R, cx + R, [
      [0.000, '#B6B7AD'], [0.050, '#CBCAC0'], [0.140, '#E6E5DC'],
      [0.280, '#F9F8F2'], [0.420, '#FFFFFF'], [0.580, '#F4F2EB'],
      [0.740, '#E0DED4'], [0.880, '#C7C8BD'],
      [0.955, '#E8E7DC'],   // rim light off the back edge
      [1.000, '#ADAEA4']
    ]);
    ctx.fillRect(cx - R - 2, top - 2, R * 2 + 4, H + 24);

    /* --- vertical falloff: brighter at the shoulder, darker at the base */
    if (!this._vert) {
      this._vert = ctx.createLinearGradient(0, top, 0, top + H);
      this._vert.addColorStop(0, 'rgba(255,255,255,0.16)');
      this._vert.addColorStop(0.45, 'rgba(255,255,255,0)');
      this._vert.addColorStop(0.88, 'rgba(14,42,34,0.05)');
      this._vert.addColorStop(1, 'rgba(14,42,34,0.20)');
    }
    ctx.fillStyle = this._vert;
    ctx.fillRect(cx - R, top, R * 2, H + 24);

    this.paintCap(ctx, cx, top, H, R, profile, layout, capCol);

    var lTop = top + layout.label[0] * H;
    var lH = (layout.label[1] - layout.label[0]) * H;
    this.paintLabel(ctx, cx, lTop, lH, R);

    /* --- specular: a soft core highlight plus a tight one beside it */
    ctx.fillStyle = this.grad(ctx, 'spec', cx - R, cx + R, [
      [0.08, 'rgba(255,255,255,0)'],    [0.19, 'rgba(255,255,255,0.10)'],
      [0.26, 'rgba(255,255,255,0.40)'], [0.30, 'rgba(255,255,255,0.52)'],
      [0.34, 'rgba(255,255,255,0.34)'], [0.42, 'rgba(255,255,255,0.07)'],
      [0.54, 'rgba(255,255,255,0)']
    ]);
    ctx.fillRect(cx - R, top, R * 2, H + 24);

    /* --- occlusion into both edges */
    ctx.fillStyle = this.grad(ctx, 'edge', cx - R, cx + R, [
      [0.00, 'rgba(14,42,34,0.26)'], [0.11, 'rgba(14,42,34,0)'],
      [0.80, 'rgba(14,42,34,0)'],    [0.93, 'rgba(14,42,34,0.26)'],
      [1.00, 'rgba(14,42,34,0.10)']
    ]);
    ctx.fillRect(cx - R, top, R * 2, H + 24);

    ctx.restore();

    /* --- base rim: the front arc catches the light */
    var rBase = profile(1) * R;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, top + H, rBase * 0.94, this.ez(rBase) * 0.8, 0, 0.15, Math.PI - 0.15);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    /* --- outline */
    ctx.save();
    this.silhouette(ctx, profile, cx, top, H, R);
    ctx.strokeStyle = 'rgba(14,42,34,0.20)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  };

  Bottle.prototype.paintCap = function (ctx, cx, top, H, R, profile, layout, capCol) {
    var capH = layout.capTo * H;
    var rCap = profile(capH / H * 0.5) * R;

    ctx.fillStyle = this.grad(ctx, 'cap', cx - rCap, cx + rCap, [
      [0.00, shade(capCol, -0.35)], [0.26, shade(capCol, 0.30)],
      [0.48, shade(capCol, 0.06)],  [0.86, shade(capCol, -0.34)],
      [1.00, shade(capCol, -0.12)]
    ]);
    ctx.fillRect(cx - R - 2, top - 2, R * 2 + 4, capH + 4);

    /* knurling — vertical ribs that travel round as it turns, which is
       most of what sells the rotation on an otherwise plain cap */
    var ribs = 34;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - rCap, top + capH * 0.18, rCap * 2, capH * 0.74);
    ctx.clip();
    for (var i = 0; i < ribs; i++) {
      var th = (i / ribs) * TAU + this.phase;
      var c = Math.cos(th);
      if (c <= 0.04) continue;
      var x = cx + rCap * Math.sin(th);
      ctx.strokeStyle = 'rgba(0,0,0,' + (0.22 * c).toFixed(3) + ')';
      ctx.lineWidth = Math.max(0.6, (TAU * rCap / ribs) * c * 0.5);
      ctx.beginPath();
      ctx.moveTo(x, top + capH * 0.18);
      ctx.lineTo(x, top + capH * 0.92);
      ctx.stroke();
    }
    ctx.restore();

    /* the cap's top face */
    var ez = this.ez(rCap);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, top + 1, rCap, ez, 0, 0, TAU);
    ctx.fillStyle = this.grad(ctx, 'capTop', cx - rCap, cx + rCap, [
      [0, shade(capCol, 0.10)], [0.35, shade(capCol, 0.40)], [1, shade(capCol, -0.10)]
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  };

  Bottle.prototype.paintLabel = function (ctx, cx, top, h, R) {
    var lc = this.labelCanvas;
    if (!lc.width) return;

    var ez = this.ez(R);
    var cols = 168;
    var i, th, c, x, w, dy;

    ctx.save();

    for (i = 0; i < cols; i++) {
      th = (i / cols) * TAU + this.phase;
      c = Math.cos(th);
      if (c <= 0.015) continue;                       // facing away

      x = cx + R * Math.sin(th);
      w = (TAU * R / cols) * c;
      if (w < 0.4) w = 0.4;

      // near side of the cylinder sits lower on screen than the far side
      dy = ez * c;

      ctx.drawImage(
        lc, (i / cols) * lc.width, 0, lc.width / cols, lc.height,
        x - w / 2, top + dy, w + 0.7, h
      );
    }

    /* the label's own curved top and bottom edges, drawn as arcs */
    ctx.beginPath();
    ctx.ellipse(cx, top, R, ez, 0, 0.02, Math.PI - 0.02);
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, top + h, R, ez, 0, 0.02, Math.PI - 0.02);
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.stroke();

    // catch the light on the near lip of the label, just off centre
    ctx.beginPath();
    ctx.ellipse(cx, top + 1, R * 0.97, ez, 0, 0.55, 1.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    /* Lambert shading over the label, matching the glass */
    ctx.fillStyle = this.grad(ctx, 'lambert', cx - R, cx + R, [
      [0.00, 'rgba(0,0,0,0.36)'],       [0.13, 'rgba(0,0,0,0.13)'],
      [0.29, 'rgba(255,255,255,0.10)'], [0.37, 'rgba(255,255,255,0.19)'],
      [0.60, 'rgba(0,0,0,0.03)'],       [0.87, 'rgba(0,0,0,0.24)'],
      [0.95, 'rgba(255,255,255,0.07)'], [1.00, 'rgba(0,0,0,0.32)']
    ]);
    ctx.fillRect(cx - R, top - ez, R * 2, h + ez * 2);

    ctx.restore();
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
