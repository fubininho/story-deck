// Build steps. A slide with data-steps="N" gets N hidden `.fragment.step` markers; each click shows one more,
// and the count is the slide's step n. Elements carry data-at="k" (appear at step k) or data-off="k" (dim from step k).
// A slide with custom motion registers SLIDE_HOOKS[id] = n => {...}; it runs on every step change, both directions.
window.SLIDE_HOOKS = window.SLIDE_HOOKS || {};

function applyStep(section) {
  if (!section) return;
  const n = section.querySelectorAll('.fragment.step.visible').length;
  section.dataset.step = n;
  section.querySelectorAll('[data-at]').forEach(el => el.classList.toggle('on', n >= +el.dataset.at));
  section.querySelectorAll('[data-off]').forEach(el => el.classList.toggle('off', n >= +el.dataset.off));
  const hook = SLIDE_HOOKS[section.id];
  if (hook) hook(n, section);
}

// Roadmap dividers: <section class="roadmap" data-part="k" data-rq="..."> gets the part list with part k lit.
// The list lives once, in <script id="parts" type="application/json"> in index.html; tools/outline.py reads it too.
const PARTS = JSON.parse(document.getElementById('parts').textContent);
document.querySelectorAll('.slides section.roadmap').forEach(s => {
  const k = +s.dataset.part, notes = s.querySelector('aside.notes');
  const items = PARTS.map(([name, rq], i) =>
    `<li class="${i === k ? 'cur' : i < k ? 'done' : ''}">${name}${rq ? `<span class="rqn">${rq}</span>` : ''}</li>`).join('');
  const rq = s.dataset.rq ? `<p class="rq"><span class="tiny">${PARTS[k][1] || 'Question'}</span>${s.dataset.rq}</p>` : '';
  s.insertAdjacentHTML('afterbegin', `<div class="frame"><header><div class="kicker">Outline</div></header><ol>${items}</ol>${rq}</div>`);
  if (notes) s.appendChild(notes);
});

document.querySelectorAll('.slides section[data-steps]').forEach(s => {
  for (let i = 0; i < +s.dataset.steps; i++) {
    const f = document.createElement('span');
    f.className = 'fragment step';
    s.appendChild(f);
  }
});
document.querySelectorAll('[data-at]').forEach(el => el.classList.add('b'));
document.querySelectorAll('[data-off]').forEach(el => el.classList.add('dim'));

// Planned minutes per slide (data-min); press T for elapsed time against the plan, R to reset.
const sections = [...document.querySelectorAll('.slides > section')];
let t0 = null;
const timing = document.createElement('div');
timing.id = 'timing';
document.body.appendChild(timing);
const planUpTo = idx => sections.slice(0, idx + 1).reduce((a, s) => a + (+s.dataset.min || 0), 0);
const clock = sec => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
setInterval(() => {
  if (!timing.classList.contains('show')) return;
  const el = t0 ? (Date.now() - t0) / 1000 : 0;
  timing.textContent = `${clock(el)} elapsed · plan ${clock(planUpTo(Reveal.getIndices().h) * 60)} at end of this slide`;
}, 500);

Reveal.initialize({
  width: 1920, height: 1080, margin: 0, minScale: 0.1, maxScale: 3,
  hash: true, center: false, controls: false, progress: true, slideNumber: 'c/t',
  transition: 'fade', transitionSpeed: 'fast', backgroundTransition: 'none',
  fragments: true, plugins: [RevealNotes],
  keyboard: {
    84: () => { timing.classList.toggle('show'); if (!t0) t0 = Date.now(); }, // T
    82: () => { t0 = Date.now(); },                                            // R
  },
}).then(() => applyStep(Reveal.getCurrentSlide()));

Reveal.on('slidechanged', e => { if (!t0) t0 = Date.now(); applyStep(e.currentSlide); });
Reveal.on('fragmentshown', () => applyStep(Reveal.getCurrentSlide()));
Reveal.on('fragmenthidden', () => applyStep(Reveal.getCurrentSlide()));
