#!/usr/bin/env node
/* ------------------------------------------------------------------
   tools/make-images.js — writes the site's illustration set

   Produces every category, recipe, banner and editorial image as a
   flat SVG in assets/img/. They share one set of primitives and one
   palette, so the whole set reads as a family rather than clip art.

   Regenerate after editing:   node tools/make-images.js
------------------------------------------------------------------- */
'use strict';

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'img');

/* ---------- palette (mirrors :root in main.css) ------------------ */
const P = {
  pine:   '#174436',
  pineLt: '#2A6A52',
  lime:   '#B9DC55',
  limeSf: '#E9F3CF',
  amber:  '#E2A03C',
  berry:  '#B33A2E',
  paper:  '#F2F5EC',
  cream:  '#FAF7EE',
  shell:  '#F7F5EF',
  crust:  '#E7C98F',
  crumb:  '#F3E3C4',
  ink:    '#0E2A22',
  stone:  '#DCE2D2'
};

/* ---------- primitives ------------------------------------------- */

/** Background: paper field, a soft disc behind the subject, one accent dot. */
function bg(w, h, tint = P.limeSf, alt = P.paper) {
  return `<rect width="${w}" height="${h}" fill="${alt}"/>` +
    `<circle cx="${w * 0.5}" cy="${h * 0.46}" r="${h * 0.40}" fill="${tint}"/>` +
    `<circle cx="${w * 0.83}" cy="${h * 0.22}" r="${h * 0.12}" fill="${tint}" fill-opacity="0.6"/>` +
    `<circle cx="${w * 0.14}" cy="${h * 0.74}" r="${h * 0.09}" fill="${tint}" fill-opacity="0.5"/>`;
}

/** Ground shadow under a subject. */
function ground(cx, cy, rx, op = 0.08) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.14}" fill="${P.ink}" fill-opacity="${op}"/>`;
}

/** A single almond leaf, tip pointing up before rotation. */
function leaf(x, y, s = 1, rot = 0, fill = P.pineLt, vein = true) {
  const body = `<path d="M0 0 Q 30 -36 0 -78 Q -30 -36 0 0 Z" fill="${fill}"/>`;
  const v = vein
    ? `<path d="M0 -6 V -68" stroke="${P.limeSf}" stroke-opacity="0.7" stroke-width="3.5" stroke-linecap="round"/>`
    : '';
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${body}${v}</g>`;
}

/** A sprig: curved stem with leaves alternating up it. */
function sprig(x, y, s = 1, rot = 0, fill = P.pineLt) {
  let g = `<path d="M0 0 C 4 -34 -2 -66 2 -104" stroke="${fill}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const at = [-26, -50, -74];
  at.forEach((ly, i) => {
    g += leaf(1, ly, 0.42, 52 + i * 4, fill, false);
    g += leaf(1, ly - 10, 0.42, -52 - i * 4, fill, false);
  });
  g += leaf(2, -98, 0.36, 0, fill, false);
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${g}</g>`;
}

/** A seedling: stem with two open leaves. */
function sprout(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 C 0 -40 0 -72 0 -104" stroke="${P.pineLt}" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${leaf(6, -62, 0.72, 58, P.lime)}
    ${leaf(-6, -74, 0.72, -58, P.pineLt)}
  </g>`;
}

function jar(x, y, s = 1, lid = P.pine, label = P.lime) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-46" y="-150" width="92" height="30" rx="9" fill="${lid}"/>
    <rect x="-54" y="-126" width="108" height="126" rx="16" fill="${P.shell}" stroke="${P.stone}" stroke-width="2"/>
    <rect x="-54" y="-86" width="108" height="46" fill="${label}"/>
  </g>`;
}

function bottle(x, y, s = 1, cap = P.pine, label = P.amber) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-16" y="-190" width="32" height="20" rx="7" fill="${cap}"/>
    <rect x="-11" y="-172" width="22" height="30" fill="${P.shell}" stroke="${P.stone}" stroke-width="2"/>
    <path d="M-38 -130 q0-14 27-16 h22 q27 2 27 16 v118 q0 14-14 14 h-48 q-14 0-14-14 z" fill="${P.shell}" stroke="${P.stone}" stroke-width="2"/>
    <rect x="-38" y="-92" width="76" height="44" fill="${label}"/>
  </g>`;
}

function loaf(x, y, s = 1, tone = P.crust) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-86 0 v-48 q0-58 86-58 t86 58 v48 q0 12-12 12 h-148 q-12 0-12-12 z" fill="${tone}"/>
    <path d="M-86 -34 h172" stroke="${P.crumb}" stroke-width="6" stroke-linecap="round"/>
    <path d="M-52 -96 q10 22 0 44 M0 -104 q10 24 0 48 M52 -96 q10 22 0 44"
          stroke="${P.crumb}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.85"/>
  </g>`;
}

function slice(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-54 20 v-46 q0-40 54-40 t54 40 v46 q0 8-8 8 h-92 q-8 0-8-8 z" fill="${P.crumb}" stroke="${P.crust}" stroke-width="5"/>
  </g>`;
}

function bowl(x, y, s = 1, fill = P.shell, contents = '') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-90 -18 h180 q-8 76-90 76 t-90-76 z" fill="${fill}" stroke="${P.stone}" stroke-width="2"/>
    <ellipse cx="0" cy="-18" rx="90" ry="16" fill="${P.paper}"/>
    ${contents}
  </g>`;
}

function glass(x, y, s = 1, liquid = P.lime) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-42 -150 h84 l-10 150 q-2 14-32 14 t-32-14 z" fill="${P.shell}" stroke="${P.stone}" stroke-width="2"/>
    <path d="M-37 -104 h74 l-9 104 q-2 12-28 12 t-28-12 z" fill="${liquid}"/>
    <path d="M-28 -138 l-6 60" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="7" stroke-linecap="round"/>
  </g>`;
}

function spoon(x, y, s = 1, rot = 0, fill = P.pineLt, heap = null) {
  const h = heap ? `<path d="M-26 -8 q26-30 52 0 z" fill="${heap}"/>` : '';
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    ${h}
    <ellipse cx="0" cy="0" rx="30" ry="17" fill="${fill}"/>
    <rect x="26" y="-5" width="92" height="10" rx="5" fill="${fill}"/>
  </g>`;
}

function pouch(x, y, s = 1, label = P.pine) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-52" y="-160" width="104" height="14" rx="4" fill="${label}" fill-opacity="0.35"/>
    <path d="M-48 -146 q3-10 15-10 h66 q12 0 15 10 l4 18 v116 q0 12-14 12 h-76 q-14 0-14-12 v-116 z"
          fill="${P.shell}" stroke="${P.stone}" stroke-width="2"/>
    <rect x="-52" y="-84" width="104" height="46" fill="${label}"/>
  </g>`;
}

function tube(x, y, s = 1, label = '#12897E') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-17" y="-172" width="34" height="26" rx="7" fill="${label}"/>
    <path d="M-38 -146 h76 v106 l-10 44 h-56 l-10-44 z" fill="${P.shell}" stroke="${P.stone}" stroke-width="2"/>
    <rect x="-38" y="-112" width="76" height="44" fill="${label}"/>
  </g>`;
}

function crate(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-92 0 v-70 h184 v70 z" fill="${P.crust}"/>
    <path d="M-92 -70 l16-16 h184 l-16 16 z" fill="${P.crumb}"/>
    <path d="M92 -70 l16-16 v70 l-16 16 z" fill="${P.crust}" fill-opacity="0.6"/>
    <path d="M-92 -46 h184 M-92 -22 h184" stroke="${P.crumb}" stroke-width="5" opacity="0.7"/>
  </g>`;
}

function berries(x, y, s = 1, fill = P.berry) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="-22" cy="0" r="18" fill="${fill}"/>
    <circle cx="14" cy="-8" r="22" fill="${fill}" fill-opacity="0.85"/>
    <circle cx="-2" cy="18" r="15" fill="${fill}" fill-opacity="0.7"/>
  </g>`;
}

/** Crossed sugar cubes. Centred on origin. */
function noSugarMark(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="0" r="66" fill="${P.cream}"/>
    <rect x="-40" y="-38" width="36" height="36" rx="6" fill="${P.crumb}" stroke="${P.crust}" stroke-width="3"/>
    <rect x="4" y="2" width="36" height="36" rx="6" fill="${P.crumb}" stroke="${P.crust}" stroke-width="3"/>
    <circle cx="0" cy="0" r="60" fill="none" stroke="${P.berry}" stroke-width="9"/>
    <path d="M-42 42 L42 -42" stroke="${P.berry}" stroke-width="9" stroke-linecap="round"/>
  </g>`;
}

function wheatCrossed(x, y, s = 1) {
  let ears = '';
  for (let i = 0; i < 4; i++) {
    const ey = 20 - i * 20;
    ears += `<ellipse cx="-12" cy="${ey}" rx="10" ry="14" fill="${P.crust}" transform="rotate(-20 -12 ${ey})"/>`;
    ears += `<ellipse cx="12" cy="${ey}" rx="10" ry="14" fill="${P.crust}" transform="rotate(20 12 ${ey})"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="0" r="66" fill="${P.cream}"/>
    <path d="M0 52 v-96" stroke="${P.crust}" stroke-width="6" stroke-linecap="round"/>
    ${ears}
    <circle cx="0" cy="0" r="60" fill="none" stroke="${P.berry}" stroke-width="9"/>
    <path d="M-42 42 L42 -42" stroke="${P.berry}" stroke-width="9" stroke-linecap="round"/>
  </g>`;
}

function muffin(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-41 0 l-9-64 h100 l-9 64 z" fill="#E6DCC6"/>
    <path d="M-20 0 l-4-60 M0 0 v-60 M20 0 l4-60"
          stroke="#D3C4A4" stroke-width="5" stroke-linecap="round"/>
    <path d="M-50 -64 h100" stroke="#D3C4A4" stroke-width="5"/>
    <path d="M-58 -64 q-6-42 30-52 q10-28 54-14 q36 8 32 66 z" fill="#C9995B"/>
    <path d="M-58 -64 q-6-42 30-52 q10-28 54-14 q36 8 32 66" fill="none"
          stroke="#B5833F" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="-18" cy="-94" r="7" fill="#5A3E24"/>
    <circle cx="16" cy="-106" r="6" fill="#5A3E24"/>
    <circle cx="6" cy="-78" r="5.5" fill="#5A3E24"/>
  </g>`;
}

function scales(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-52 -66 q52-48 104 0 z" fill="${P.crumb}"/>
    <rect x="-72" y="-66" width="144" height="14" rx="6" fill="${P.stone}"/>
    <rect x="-90" y="-52" width="180" height="52" rx="14" fill="${P.shell}" stroke="${P.stone}" stroke-width="2"/>
    <rect x="-36" y="-40" width="72" height="27" rx="5" fill="${P.pine}"/>
    <rect x="-26" y="-31" width="14" height="9" rx="2" fill="${P.lime}"/>
    <rect x="-6" y="-31" width="14" height="9" rx="2" fill="${P.lime}"/>
    <rect x="14" y="-31" width="10" height="9" rx="2" fill="${P.lime}" fill-opacity="0.5"/>
  </g>`;
}

function spreadSlice(x, y, s = 1, rot = 0, colour = '#6B4A2A') {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-54 20 v-46 q0-40 54-40 t54 40 v46 q0 8-8 8 h-92 q-8 0-8-8 z"
          fill="${P.crumb}" stroke="${P.crust}" stroke-width="5"/>
    <path d="M-36 8 v-32 q0-27 36-27 t36 27 v32 q0 5-6 5 h-60 q-6 0-6-5 z" fill="${colour}"/>
  </g>`;
}

function toastPlate(x, y, s = 1, spread = '#6B4A2A') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="14" rx="116" ry="28" fill="${P.shell}" stroke="${P.stone}" stroke-width="2"/>
    <ellipse cx="0" cy="10" rx="96" ry="22" fill="${P.paper}"/>
    ${spreadSlice(-36, -6, 0.92, -7, spread)}
    ${slice(48, 0, 0.76, 9)}
  </g>`;
}

/* ---------- scene builder ---------------------------------------- */
function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>\n`;
}

const files = {};

/* ---------- category images (4:3) --------------------------------
   Each scene is centred: hero object on the middle line, one
   supporting object either side, everything standing on y = 306.
------------------------------------------------------------------ */
const CW = 480, CH = 360;

files['cat-organic.svg'] = svg(CW, CH,
  bg(CW, CH) + ground(240, 310, 118) +
  sprig(120, 306, 0.95, -12) +
  jar(240, 306, 1.05, P.pine, P.lime) +
  leaf(368, 300, 0.9, 28) +
  leaf(398, 306, 0.72, 62, P.pine)
);

files['cat-gluten-free.svg'] = svg(CW, CH,
  bg(CW, CH, P.crumb) + ground(238, 312, 132) +
  loaf(238, 306, 1.02) +
  slice(376, 288, 0.86, 8) +
  wheatCrossed(400, 104, 0.62)
);

files['cat-no-sugar.svg'] = svg(CW, CH,
  bg(CW, CH, '#F6E3DF') + ground(240, 310, 118) +
  bottle(238, 306, 0.94, P.berry, P.berry) +
  spoon(352, 276, 0.86, -14, P.pineLt, P.crumb) +
  noSugarMark(384, 108, 0.62)
);

files['cat-supplements.svg'] = svg(CW, CH,
  bg(CW, CH) + ground(240, 310, 122) +
  pouch(240, 306, 1) +
  spoon(356, 280, 0.86, 12, P.pine, P.lime) +
  berries(104, 268, 0.86, P.berry) +
  leaf(132, 306, 0.72, -34)
);

files['cat-natural.svg'] = svg(CW, CH,
  bg(CW, CH, '#DCEFEA') + ground(240, 310, 110) +
  tube(240, 306, 1) +
  sprig(352, 306, 0.9, 10, '#12897E') +
  leaf(120, 300, 0.78, -30, '#12897E')
);

files['cat-vegan.svg'] = svg(CW, CH,
  bg(CW, CH) + ground(240, 314, 122) +
  bowl(240, 256, 1, P.shell,
    `<circle cx="-34" cy="-44" r="26" fill="${P.lime}"/>` +
    `<circle cx="10" cy="-56" r="30" fill="${P.pineLt}"/>` +
    `<circle cx="46" cy="-40" r="22" fill="${P.amber}"/>`) +
  sprout(378, 308, 0.92) +
  leaf(104, 300, 0.78, -28)
);

/* ---------- recipe images (3:2) ---------------------------------- */
const RW = 600, RH = 400;

files['recipe-muffins.svg'] = svg(RW, RH,
  bg(RW, RH, P.crumb) + ground(300, 348, 168) +
  muffin(268, 344, 1.05) +
  muffin(392, 348, 0.82) +
  leaf(160, 336, 0.8, -26)
);

files['recipe-smoothie.svg'] = svg(RW, RH,
  bg(RW, RH) + ground(300, 350, 152) +
  glass(300, 346, 1.05, P.lime) +
  sprig(422, 348, 0.95, 12) +
  berries(184, 330, 0.9, P.pineLt)
);

files['recipe-toast.svg'] = svg(RW, RH,
  bg(RW, RH, P.crumb) + ground(300, 352, 164) +
  toastPlate(288, 318, 1.06) +
  jar(474, 340, 0.62, '#5A3E24', '#6B4A2A')
);

files['recipe-baking.svg'] = svg(RW, RH,
  bg(RW, RH, '#F6E3DF') + ground(300, 350, 156) +
  scales(292, 338, 1.08) +
  pouch(452, 346, 0.76, P.berry) +
  spoon(150, 300, 0.86, -16, P.pineLt, P.crumb)
);

files['recipe-tahini.svg'] = svg(RW, RH,
  bg(RW, RH) + ground(300, 352, 160) +
  bowl(300, 298, 1.06, P.shell,
    `<ellipse cx="0" cy="-30" rx="72" ry="20" fill="${P.crumb}"/>`) +
  jar(468, 344, 0.68, P.pine, P.crumb) +
  spoon(146, 300, 0.84, 18, P.pineLt, P.crumb)
);

files['recipe-oats.svg'] = svg(RW, RH,
  bg(RW, RH, P.crumb) + ground(300, 350, 150) +
  jar(300, 346, 1.15, P.pine, P.crumb) +
  berries(438, 322, 0.95, P.berry) +
  sprig(168, 348, 0.8, -12)
);

/* ---------- banners ----------------------------------------------
   Wide, dark, and weighted right: the pages lay type over the left
   third, so the subjects sit clear of it.
------------------------------------------------------------------ */
const BW = 1200, BH = 500;

files['banner-organic.svg'] = svg(BW, BH,
  `<rect width="${BW}" height="${BH}" fill="${P.pine}"/>` +
  `<circle cx="880" cy="230" r="248" fill="${P.pineLt}" fill-opacity="0.55"/>` +
  `<circle cx="1104" cy="112" r="76" fill="${P.lime}" fill-opacity="0.22"/>` +
  ground(880, 448, 200, 0.2) +
  sprig(714, 448, 1.25, -10, P.lime) +
  jar(852, 444, 1.3, P.lime, P.lime) +
  pouch(1006, 448, 1.1, P.lime) +
  leaf(1126, 430, 1.05, 34, P.lime)
);

files['banner-gluten-free.svg'] = svg(BW, BH,
  `<rect width="${BW}" height="${BH}" fill="${P.crust}"/>` +
  `<circle cx="880" cy="220" r="250" fill="${P.crumb}" fill-opacity="0.75"/>` +
  ground(880, 452, 212, 0.12) +
  loaf(866, 446, 1.3) +
  slice(1064, 416, 1.05, 8) +
  wheatCrossed(690, 268, 0.95)
);

files['banner-offers.svg'] = svg(BW, BH,
  `<rect width="${BW}" height="${BH}" fill="${P.amber}"/>` +
  `<circle cx="890" cy="220" r="248" fill="${P.crumb}" fill-opacity="0.6"/>` +
  ground(890, 450, 198, 0.14) +
  sprig(700, 450, 1.1, 12, P.pine) +
  bottle(822, 446, 1.18, P.berry, P.berry) +
  jar(970, 444, 1.14, P.pine, P.pine) +
  berries(1098, 404, 1.4, P.berry)
);

/* ---------- editorial -------------------------------------------- */
files['about-warehouse.svg'] = svg(900, 560,
  bg(900, 560) +
  `<rect x="110" y="286" width="680" height="13" rx="4" fill="${P.stone}"/>` +
  jar(226, 286, 0.84, P.pine, P.lime) +
  pouch(362, 286, 0.8, P.pineLt) +
  bottle(500, 286, 0.76, P.pine, P.amber) +
  loaf(650, 286, 0.6) +
  crate(292, 470, 1.02) +
  crate(596, 472, 0.88) +
  ground(292, 476, 116, 0.08) +
  ground(596, 478, 100, 0.08) +
  sprig(796, 480, 1, 8)
);

/* ---------- write ------------------------------------------------ */
fs.mkdirSync(OUT, { recursive: true });
Object.keys(files).forEach((name) => {
  fs.writeFileSync(path.join(OUT, name), files[name]);
  console.log('wrote assets/img/' + name);
});
console.log('\n' + Object.keys(files).length + ' images written.');
