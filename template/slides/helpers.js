// SVG helpers for schematics drawn in code. Every slide's picture is built from these, so the look stays one system.
// el/txt make nodes; grp makes a build group (data-at = step it appears); box/arrow/label are the diagram vocabulary.
const NS = 'http://www.w3.org/2000/svg';
window.SLIDE_HOOKS = window.SLIDE_HOOKS || {};
// One colour per role, mirrored from deck.css :root.
const C = { ink: '#1B2430', muted: '#8A919A', ours: '#12827A', ctrl: '#9AA0A6', base: '#E3A008', ref: '#1B2430',
            a: '#C80F2E', b: '#1B3F7A', c: '#F5B301', enc: '#44505C', pred: '#6D4A9E', loss: '#9C3D7E', data: '#6B7480' };
const HALO = 'paint-order:stroke;stroke:#fff;stroke-width:7px;stroke-linejoin:round';  // text readable over lines

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function txt(s, attrs, parent) { const t = el('text', attrs, parent); t.textContent = s; return t; }
function grp(svg, at) { return el('g', at == null ? {} : { 'data-at': at }, svg); }
// Stagger: delay(node, ms) sets the transition-delay of a .pop/.draw/.grow child, so items arrive one after another.
function delay(e, ms) { e.style.transitionDelay = ms + 'ms'; return e; }
function label(g, x, y, s, color = C.ink, anchor = 'middle', cls = 'lbl') {
  return txt(s, { x, y, class: cls, 'text-anchor': anchor, style: `fill:${color};${HALO}` }, g);
}
function box(g, x, y, w, h, title, sub, color, opt = {}) {
  el('rect', { x, y, width: w, height: h, rx: 10, fill: color, 'fill-opacity': opt.fill ?? 0.10, stroke: color, 'stroke-width': 3,
               'stroke-dasharray': opt.dash || null }, g);
  txt(title, { x: x + w / 2, y: y + h / 2 + (sub ? -6 : 11), class: 'lbl-b', 'text-anchor': 'middle' }, g);
  if (sub) txt(sub, { x: x + w / 2, y: y + h / 2 + 32, class: 'lbl-s', 'text-anchor': 'middle' }, g);
}
function arrow(g, d, color = C.ink, dash) {
  const svg = g.ownerSVGElement || g;
  const id = 'ah' + color.slice(1) + (svg.id ? '-' + svg.id : '');  // one marker per svg: a marker inside a hidden slide does not render
  if (!svg.querySelector('#' + id)) {
    const defs = svg.querySelector('defs') || el('defs', {}, svg);
    const m = el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 9, markerHeight: 9, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0,0 L10,5 L0,10 z', fill: color }, m);
  }
  return el('path', { d, stroke: color, 'stroke-width': 3, fill: 'none', 'marker-end': `url(#${id})`, 'stroke-dasharray': dash || null }, g);
}
// A stroke that traces itself in when its group turns on.
function trace(g, d, color, w = 3, ms = 0) {
  return delay(el('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', pathLength: 1, class: 'draw' }, g), ms);
}
// A field (pitch, plate, map...) of w x h units drawn at (x, y) with pixel width W; returns unit -> pixel mappers.
function field(g, x, y, W, w = 105, h = 68, fill = '#BCD8B0', line = '#2F6B46') {
  const s = W / w;
  el('rect', { x, y, width: W, height: h * s, fill, stroke: line, 'stroke-width': 2 }, g);
  return { s, H: h * s, px: u => x + (u + w / 2) * s, py: v => y + (h / 2 - v) * s };
}

// Icons: <i class="ic" data-ic="name"></i> becomes a 48 x 48 line icon in currentColor. Add your own to I.
(function icons() {
  const I = {
    clock: '<circle cx="24" cy="24" r="17"/><path d="M24 13 v11 l8 5"/>',
    search: '<circle cx="20" cy="20" r="11"/><path d="M28 28 L40 40"/>',
    dice: '<rect x="9" y="9" width="30" height="30" rx="6"/><circle cx="18" cy="18" r="2.5"/><circle cx="30" cy="30" r="2.5"/><circle cx="24" cy="24" r="2.5"/>',
    test: '<path d="M18 7 h12 M20 7 v14 l-10 18 a3 3 0 0 0 3 4 h22 a3 3 0 0 0 3 -4 l-10 -18 v-14"/><path d="M14 32 h20"/>',
    people: '<circle cx="16" cy="16" r="6"/><circle cx="33" cy="18" r="5"/><path d="M5 40 a11 11 0 0 1 22 0 M25 40 a9 9 0 0 1 17 -2"/>',
    tag: '<path d="M8 8 h16 l16 16 -16 16 -16 -16 z"/><circle cx="16" cy="16" r="3"/>',
    value: '<path d="M8 40 h32"/><rect x="11" y="28" width="6" height="12"/><rect x="21" y="20" width="6" height="20"/><rect x="31" y="10" width="6" height="30"/>',
    forecast: '<path d="M6 34 L16 28 L24 30"/><path d="M24 30 L34 18 L42 14" stroke-dasharray="4 4"/><circle cx="24" cy="30" r="3"/>',
    eye: '<path d="M4 24 C 12 12, 36 12, 44 24 C 36 36, 12 36, 4 24 Z"/><circle cx="24" cy="24" r="6"/>',
    link: '<circle cx="12" cy="24" r="6"/><circle cx="36" cy="24" r="6"/><path d="M18 24 h12"/>',
    store: '<ellipse cx="24" cy="12" rx="15" ry="5"/><path d="M9 12 v24 a15 5 0 0 0 30 0 v-24 M9 24 a15 5 0 0 0 30 0"/>',
    chip: '<rect x="12" y="12" width="24" height="24" rx="3"/><path d="M18 6 v6 M24 6 v6 M30 6 v6 M18 36 v6 M24 36 v6 M30 36 v6 M6 18 h6 M6 24 h6 M6 30 h6 M36 18 h6 M36 24 h6 M36 30 h6"/>',
  };
  document.querySelectorAll('i.ic[data-ic]').forEach(e => {
    e.innerHTML = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${I[e.dataset.ic] || ''}</svg>`;
  });
})();
