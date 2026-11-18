// Chart builders for result slides. One message per chart; every row and series can carry `at` (build step).
// Colour roles: ours = the method, ctrl = the control, base = simple baseline, ref = published models.
// Numbers are passed in from the slide code, copied from the source document (keep FACTS.md in step).
const CH = { ours: '#12827A', ctrl: '#9AA0A6', base: '#E3A008', ref: '#1B2430', pred: '#6D4A9E', grid: '#E4E6E9', chance: '#6B7480' };
const labelFill = c => (c === CH.ctrl ? '#6B7480' : c);   // grey labels darker than grey dots, so they stay readable

function svgEl(tag, attrs, parent, text) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
function chartRoot(svgId, at) {
  const s = document.getElementById(svgId); if (!s) return null;
  return svgEl('g', at == null ? {} : { 'data-at': at }, s);
}

// Horizontal dot rows: one row per model, a dot per score, an optional interval line, the rounded number written inline.
// spec: {x0, x1, min, max, log, ticks, tickFmt, axis, top, rowH, chance, chanceLabel,
//        rows: [{name, sub, small, at, note, noteAt, noteColor, marks: [{v, lo, hi, band, c, r, label, inline, below, dx, anchor, big, at}]}]}
function dotChart(g, spec) {
  if (!g) return;
  const x0 = spec.x0 ?? 560, x1 = spec.x1 ?? 1380, top = spec.top ?? 70, rowH = spec.rowH ?? 150;
  const t = spec.log ? Math.log : v => v;
  const X = v => x0 + (t(v) - t(spec.min)) / (t(spec.max) - t(spec.min)) * (x1 - x0);
  const bottom = top + rowH * (spec.rows.length - 1) + 70;
  for (const v of spec.ticks || []) {
    svgEl('line', { x1: X(v), y1: top - 40, x2: X(v), y2: bottom - 30, stroke: CH.grid, 'stroke-width': 2 }, g);
    svgEl('text', { x: X(v), y: bottom + 6, class: 'lbl-s', 'text-anchor': 'middle' }, g, spec.tickFmt ? spec.tickFmt(v) : String(v));
  }
  if (spec.chance != null) {
    svgEl('line', { x1: X(spec.chance), y1: top - 40, x2: X(spec.chance), y2: bottom - 30, stroke: CH.chance, 'stroke-width': 2, 'stroke-dasharray': '6 6' }, g);
    svgEl('text', { x: X(spec.chance), y: top - 52, class: 'lbl-s', 'text-anchor': 'middle' }, g, spec.chanceLabel || 'chance');
  }
  if (spec.axis) svgEl('text', { x: x1, y: bottom + 46, class: 'lbl-s', 'text-anchor': 'end' }, g, spec.axis);
  spec.rows.forEach((row, i) => {
    const y = top + i * rowH, rg = svgEl('g', { 'data-at': row.at }, g);
    svgEl('text', { x: 0, y: y + 11, class: row.small ? 'lbl-s' : 'lbl' }, rg, row.name);
    if (row.sub) svgEl('text', { x: 0, y: y + 46, class: 'lbl-s' }, rg, row.sub);
    svgEl('line', { x1: X(spec.min), y1: y, x2: X(spec.max), y2: y, stroke: '#C9CDD2', 'stroke-width': 2 }, rg);
    for (const m of row.marks) {
      const mg = svgEl('g', { 'data-at': m.at }, rg), c = CH[m.c] || m.c || CH.ours;
      if (m.lo != null) svgEl('line', { x1: X(m.lo), y1: y, x2: X(m.hi), y2: y, stroke: c, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-opacity': 0.45 }, mg);
      if (m.band) svgEl('rect', { x: X(m.band[0]), y: y - 13, width: Math.max(6, X(m.band[1]) - X(m.band[0])), height: 26, rx: 13, fill: c, 'fill-opacity': 0.5 }, mg);
      if (m.v != null) svgEl('circle', { cx: X(m.v), cy: y, r: m.r || 15, fill: c }, mg);
      if (m.label) {
        const lx = m.v != null ? X(m.v) : (X(m.band[0]) + X(m.band[1])) / 2;
        svgEl('text', { x: lx + (m.dx || 0), y: m.inline ? y + 10 : m.below ? y + 52 : y - 30, class: m.big ? 'lbl-b' : 'lbl',
                        'text-anchor': m.anchor || 'middle', style: `fill:${labelFill(c)};${HALO}` }, mg, m.label);
      }
    }
    if (row.note) svgEl('text', { x: x1 + 40, y: y + 11, class: 'lbl', 'data-at': row.noteAt, style: `fill:${row.noteColor || CH.ours}` }, rg, row.note);
  });
}

// Curves (e.g. score against number of labels). The series name is written at the line's end, no legend box.
// spec: {xs, logx (default true), ymax, yticks, x0, x1, y0, y1, xlabel, ylabel, chance,
//        series: [{ys, c, name, at, dash, dy, hollow: [bool per point]}]}
function lineChart(g, spec) {
  if (!g) return;
  const { x0 = 120, x1 = 1100, y0 = 560, y1 = 40 } = spec, lg = spec.logx !== false;
  const tx = lg ? Math.log : v => v, X = v => x0 + (tx(v) - tx(spec.xs[0])) / (tx(spec.xs.at(-1)) - tx(spec.xs[0])) * (x1 - x0);
  const Y = v => y0 - v / spec.ymax * (y0 - y1);
  for (const v of spec.yticks || []) {
    svgEl('line', { x1: x0, y1: Y(v), x2: x1, y2: Y(v), stroke: CH.grid, 'stroke-width': 2 }, g);
    svgEl('text', { x: x0 - 18, y: Y(v) + 9, class: 'lbl-s', 'text-anchor': 'end' }, g, v.toFixed(1));
  }
  spec.xs.forEach(v => svgEl('text', { x: X(v), y: y0 + 44, class: 'lbl-s', 'text-anchor': 'middle' }, g, String(v)));
  if (spec.xlabel) svgEl('text', { x: x1, y: y0 + 90, class: 'lbl-s', 'text-anchor': 'end' }, g, spec.xlabel);
  if (spec.ylabel) svgEl('text', { x: x0 - 18, y: y1 - 26, class: 'lbl-s' }, g, spec.ylabel);
  if (spec.chance != null) {
    svgEl('line', { x1: x0, y1: Y(spec.chance), x2: x1, y2: Y(spec.chance), stroke: CH.chance, 'stroke-width': 2, 'stroke-dasharray': '6 6' }, g);
    svgEl('text', { x: x1 + 14, y: Y(spec.chance) + 8, class: 'lbl-s' }, g, 'chance');
  }
  for (const s of spec.series) {
    const sg = svgEl('g', { 'data-at': s.at }, g), c = CH[s.c] || s.c;
    const pts = spec.xs.map((x, i) => s.ys[i] == null ? null : [X(x), Y(s.ys[i])]);
    svgEl('path', { d: pts.filter(Boolean).map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' '), stroke: c, 'stroke-width': 6, fill: 'none',
                    'stroke-dasharray': s.dash, 'stroke-linejoin': 'round' }, sg);
    pts.forEach((p, i) => p && svgEl('circle', { cx: p[0], cy: p[1], r: 10, fill: s.hollow && s.hollow[i] ? '#fff' : c, stroke: c, 'stroke-width': 4 }, sg));
    const last = pts.filter(Boolean).at(-1);
    svgEl('text', { x: last[0] + 24, y: last[1] + 10 + (s.dy || 0), class: 'lbl', style: `fill:${labelFill(c)}` }, sg, s.name);
  }
}
