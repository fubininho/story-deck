// Example slides. All positions and numbers here are illustrative placeholders: replace them with your own,
// and copy every real number from the source document (FACTS.md records where each one came from).

// ---------------------------------------------------------------- the analogy: a story first, the technical names last
(function analogy() {
  const svg = document.getElementById('analogy-svg'); if (!svg) return;
  const g0 = grp(svg, 0), F = field(g0, 0, 120, 440);
  [[-30, 10], [-18, -18], [-12, 8], [-4, -6], [2, 20], [10, -14], [16, 4], [24, -22], [30, 12], [36, -4]].forEach(([x, y], i) =>
    el('circle', { cx: F.px(x), cy: F.py(y), r: 9, fill: i % 2 ? C.b : C.a }, g0));
  // covered patches spread over the picture, not one block
  [[-36, -30, -13, -7], [-4, 3, 15, 31], [20, -27, 41, -3]].forEach(([u0, v0, u1, v1]) => {
    const x = F.px(u0), w = F.px(u1) - x, y = F.py(v1), h = F.py(v0) - y;
    el('rect', { x, y, width: w, height: h, rx: 6, fill: '#2F6B46', stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g0);
    txt('covered', { x: x + w / 2, y: y + h / 2 + 7, class: 'lbl-s', 'text-anchor': 'middle', style: 'fill:#fff;font-size:19px' }, g0);
  });
  txt('parts of the picture are covered', { x: 0, y: 450, class: 'lbl-s' }, g0);
  const g1 = grp(svg, 1);
  arrow(g1, 'M 444 340 C 500 340, 520 425, 580 425', C.ctrl, '10 8');
  box(g1, 585, 360, 360, 130, 'The expert', 'saw everything', '#777777', { fill: 0.06, dash: '12 8' });
  arrow(g1, 'M 945 425 L 1035 425', C.ctrl, '10 8');
  box(g1, 1040, 360, 600, 130, 'Her description', '"in her own words"', C.loss);
  const g2 = grp(svg, 2);
  arrow(g2, 'M 444 200 C 500 200, 520 155, 580 155');
  box(g2, 585, 90, 360, 130, 'The learner', 'sees only the rest', C.enc);
  arrow(g2, 'M 945 155 L 1035 155');
  box(g2, 1040, 90, 600, 130, 'His guess', 'of what she will say', C.pred);
  const g3 = grp(svg, 3);
  el('path', { d: 'M 1340 228 L 1340 352', stroke: C.loss, 'stroke-width': 5 }, g3);
  txt('the difference', { x: 1360, y: 298, class: 'lbl', style: `fill:${C.loss}` }, g3);
  txt('He changes his guesses until the difference is small.', { x: 0, y: 600, class: 'lbl' }, g3);
  // last step: the same picture, now with the technical names written over it
  const g4 = grp(svg, 4), tag = (s, x, y) => txt(s, { x, y, class: 'lbl-b', style: `fill:${C.ours};font-size:28px;${HALO}` }, g4);
  tag('= masked input', 0, 100); tag('= encoder', 585, 76); tag('= predictor', 1040, 76);
  tag('= target network', 585, 346); tag('= target', 1040, 346); tag('= loss', 1360, 334);
})();

// ---------------------------------------------------------------- the method: picture -> tokens -> layers and heads (timers) -> output -> back on the picture
(function pipeline() {
  const svg = document.getElementById('pipeline-svg'); if (!svg) return;
  const agents = [[0, -2, C.c], [-20, 10, C.a], [-8, -14, C.a], [6, 18, C.a], [14, -6, C.a], [24, 6, C.a],
                  [-14, -2, C.b], [0, 12, C.b], [10, -20, C.b], [20, 18, C.b], [30, -8, C.b]];
  const NF = 12, GX = 640, GY = 80, D = 26, CELL = 21;
  const g0 = el('g', {}, svg), F = field(g0, 0, 80, 520);
  const lines = el('g', {}, svg);                           // attention drawn back on the picture (last step)
  const home = agents.map(([u, v]) => [F.px(u), F.py(v)]);
  agents.forEach(([, , c], i) => el('circle', { cx: home[i][0], cy: home[i][1], r: i ? 11 : 8, fill: c, stroke: '#fff', 'stroke-width': 2 }, g0));
  txt('one moment', { x: 0, y: 60, class: 'lbl-s' }, g0);
  // step 1: dots fly into the newest column, the grid pops in from the newest column backwards
  const cy = i => GY + i * D + (i ? 8 : 0) + CELL / 2, cx = j => GX + j * D + CELL / 2;
  const fly = agents.map(([, , c], i) => el('circle', { cx: 0, cy: 0, r: 8, fill: c, class: 'move', style: 'opacity:0' }, svg));
  const g1 = grp(svg, 1);
  agents.forEach(([, , c], i) => { for (let j = 0; j < NF; j++)
    el('rect', { x: cx(j) - CELL / 2, y: cy(i) - CELL / 2, width: CELL, height: CELL, rx: 3, fill: c, 'fill-opacity': 0.45,
                 class: 'pop', style: `transition-delay:${300 + (NF - 1 - j) * 40}ms` }, g1); });
  txt('tokens: every item at every moment', { x: GX, y: 60, class: 'lbl-s' }, g1);
  // step 2: a stack of layers pops in one after another; a timer then lights each layer in turn
  const g2 = grp(svg, 2), SX = 1120, L = 6, layers = [];
  for (let k = L - 1; k >= 0; k--) layers[k] = el('rect', { x: SX + k * 9, y: 140 - k * 9, width: 300, height: 300, rx: 12, fill: '#fff', stroke: C.enc,
    'stroke-width': 2.5, 'stroke-opacity': 0.35 + k * 0.1, class: 'pop', style: `transition-delay:${200 + k * 110}ms` }, g2);
  arrow(g2, `M${GX + NF * D + 8} 240 L${SX - 10} 240`);
  txt('attention', { x: SX + 150, y: 180, class: 'lbl-b', 'text-anchor': 'middle' }, g2);
  const counter = txt(`${L} layers`, { x: SX + 150, y: 430, class: 'lbl-s', 'text-anchor': 'middle' }, g2);
  // step 3: head chips; a timer cycles which one is lit, with a caption saying what it looks at
  const HN = ['the key object', 'its own past', 'its neighbours', 'its opponent'];
  const chips = HN.map((h, k) => { const x = SX + 22 + (k % 2) * 136, y = 200 + Math.floor(k / 2) * 106;
    const r = el('rect', { x, y, width: 120, height: 90, rx: 10, fill: C.ours, 'fill-opacity': 0.08, stroke: C.ours, 'stroke-width': 2,
      class: 'pop', style: `transition-delay:${1100 + k * 150}ms` }, g2);
    txt('head ' + (k + 1), { x: x + 60, y: y + 52, class: 'lbl-s', 'text-anchor': 'middle', style: 'font-size:21px' }, g2);
    return r; });
  const cap = txt('', { x: SX - 10, y: 520, class: 'lbl' }, svg);
  // step 4: one vector per token comes out
  const g4 = grp(svg, 4);
  arrow(g4, `M${SX + 370} 290 L${SX + 410} 290`, C.ours);
  for (let i = 0; i < 11; i++) el('rect', { x: SX + 420, y: 150 + i * 26, width: 30, height: 20, rx: 3, fill: C.ours,
    'fill-opacity': 0.35 + 0.5 * ((i * 5) % 7) / 7, class: 'pop', style: `transition-delay:${200 + i * 60}ms` }, g4);
  txt('one vector each', { x: SX + 435, y: 470, class: 'lbl-s', 'text-anchor': 'middle', style: 'font-size:20px' }, g4);

  const lit = l => layers.forEach((r, k) => { r.setAttribute('stroke', k === l ? C.ours : C.enc); r.setAttribute('stroke-width', k === l ? 5 : 2.5); });
  const head = h => { chips.forEach((r, k) => { r.setAttribute('fill-opacity', k === h ? 0.3 : 0.08); r.setAttribute('stroke-width', k === h ? 4 : 2); });
    cap.textContent = h == null ? '' : `Head ${h + 1} looks at ${HN[h]}.`; };
  const draw = () => { lines.replaceChildren(); const me = home[1];
    [[0, 9], [6, 6], [2, 4], [3, 2]].forEach(([j, w]) => el('line', { x1: me[0], y1: me[1], x2: home[j][0], y2: home[j][1], stroke: C.ours,
      'stroke-width': w, 'stroke-linecap': 'round', 'stroke-opacity': 0.7 }, lines));
    el('circle', { cx: me[0], cy: me[1], r: 20, fill: 'none', stroke: C.ink, 'stroke-width': 4 }, lines); };
  let timer = null;
  SLIDE_HOOKS.pipeline = n => {
    if (timer) { clearInterval(timer); timer = null; }   // every hook clears its own timers first: steps go backwards too
    fly.forEach((d, i) => { const [x, y] = n >= 1 ? [cx(NF - 1), cy(i)] : home[i]; d.style.transform = `translate(${x}px, ${y}px)`; d.style.opacity = n === 1 ? 1 : 0; });
    lit(-1); head(null); counter.textContent = `${L} layers`; lines.replaceChildren();
    if (n === 2) { let t = 0; lit(0); timer = setInterval(() => { t = (t + 1) % L; lit(t); counter.textContent = `layer ${t + 1} of ${L}`; }, 400); }
    if (n === 3) { let h = 0; head(0); timer = setInterval(() => { h = (h + 1) % HN.length; head(h); }, 2200); }
    if (n >= 5) draw();
  };
  SLIDE_HOOKS.pipeline(0);
})();

// ---------------------------------------------------------------- a result: baseline, control, ours; rounded numbers written inline
dotChart(chartRoot('result-svg'), {
  min: 0.4, max: 0.8, ticks: [0.4, 0.5, 0.6, 0.7, 0.8], tickFmt: v => v.toFixed(1), top: 90, rowH: 130, x0: 520, x1: 1300, axis: 'score (placeholder)',
  rows: [
    { name: 'simple baseline', small: true, marks: [{ v: 0.52, lo: 0.50, hi: 0.54, c: 'base', label: '0.52', dx: 40, anchor: 'start', inline: true }] },
    { name: 'same network, untrained', small: true, at: 1, marks: [{ v: 0.61, lo: 0.59, hi: 0.63, c: 'ctrl', label: '0.61', dx: 40, anchor: 'start', inline: true }] },
    { name: 'our method', at: 2, marks: [{ v: 0.70, lo: 0.68, hi: 0.72, c: 'ours', label: '0.70', big: true, dx: 40, anchor: 'start', inline: true }],
      note: 'ahead of both', noteAt: 3 },
  ],
});
