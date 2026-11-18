# Drawing and animating slides

All of this is in `template/`. Read the template's `slides/example.js` next to this file; it uses every helper below.

## Contents

1. Canvas and layout
2. The build system
3. Helpers
4. Motion recipes
5. Hooks and timers
6. Charts
7. Live data slides

## 1. Canvas and layout

- The deck is a fixed 1920×1080 canvas, scaled to the screen. Content sits in `.frame` (inset 96 px top, 128 px sides, 88 px bottom): a `header` with a `.kicker` (section · topic, small caps) and an `h2` title, then a `.stage` from 190 px down.
- Draw schematics in `<svg id="<slide>-svg" viewBox="0 0 1664 706">` inside `.stage`. 1664×706 is the stage size, so SVG units are pixels.
- Text sizes: titles 72 px, slide text 40 to 50 px, SVG `lbl-b` 34 px, `lbl` 30 px, `lbl-s` 24 px. Nothing smaller than 19 px, and only for citations. If it does not fit, cut words.
- Keep titles to one line at 72 px (about 45 characters). A wrapped title pushes into the stage.
- Colour roles live in `:root` in `deck.css` and are mirrored in `C` (helpers.js) and `CH` (charts.js). Change all three together.

## 2. The build system

- `data-steps="N"` on a `<section>`: the slide takes N clicks. `deck.js` adds N invisible fragments and keeps the count in `section.dataset.step`.
- `data-at="k"`: the element gets class `.b` and is hidden until step k (then `.on`). Use it on HTML elements and on SVG groups made with `grp(svg, k)`.
- `data-off="k"`: the element dims to 18% from step k. Add class `gone` to hide it completely. Use it to push old content back when a callout arrives.
- Inside an `.on` group: `.pop` scales in from 0, `.draw` traces a stroke (set `pathLength: 1`), `.grow` extends a bar from the left. Each has a default delay; override with `transition-delay` per element to stagger.
- `.move` on elements a hook moves with `style.transform` (1.1 s eased).
- Roadmap dividers are generated: `<section class="roadmap" data-part="k" data-rq="...">` with only notes inside.

## 3. Helpers (`slides/helpers.js`)

| Helper | What it makes |
|---|---|
| `el(tag, attrs, parent)` | any SVG element; null attributes are skipped |
| `txt(s, attrs, parent)` | a text element |
| `grp(svg, k)` | a group that appears at step k (`grp(svg)` for always visible) |
| `delay(node, ms)` | sets the transition delay, returns the node |
| `label(g, x, y, s, color, anchor, cls)` | text with a white halo, readable over lines |
| `box(g, x, y, w, h, title, sub, color, {fill, dash})` | rounded box with a bold title and a muted sub-line; dashed for "frozen" or "slow" parts |
| `arrow(g, d, color, dash)` | path with an arrowhead; markers are made per SVG because a marker inside a hidden slide does not render |
| `trace(g, d, color, w, ms)` | a stroke that draws itself in |
| `field(g, x, y, W, w, h)` | a rectangle of w×h units at pixel width W, returning `px(u)`, `py(v)` mappers (a pitch, a plate, a map) |
| `<i class="ic" data-ic="name">` | a line icon in the current colour; add icons to the `I` table |

## 4. Motion recipes

Each recipe maps one movement to one sentence of the notes. If a movement has no sentence, drop it.

- Picture to grid. Draw the items on the picture, create a flying copy of each with class `.move`, and in the hook set `style.transform = translate(x, y)` to the picture position at step 0 and to the grid column at step 1. Pop the grid in with delays that run from the newest column backwards (`300 + (NF - 1 - j) * 40` ms), so time visibly fills in.
- Stack of layers. Draw the layers from back to front with increasing stroke opacity and delays `200 + k * 110` ms, so they pop in one after another. On a later step a timer lights one layer at a time with a counter ("layer 3 of 8").
- Cycling chips. Several small boxes (heads, experts, branches). A timer every 2 to 2.5 seconds lights one and sets a caption saying what it does. Slow enough to read the caption.
- Back onto the picture. Draw what the model computed for one item (attention, a forecast, a neighbour) as lines on the original picture, thicker for stronger. Ring the item. This closes the loop from data to model to data.
- Story, then names. Build the analogy in steps; on the last step add tags in the method colour with a white halo (`= encoder`) placed over the story's boxes.
- Callouts over a dimmed diagram. On the step that introduces the changes, add numbered pill callouts and set `data-off` on every other group of the SVG.
- Text rows. `.icons-list` with `.irow` per click: icon, line, muted sub-line.
- Answer cards. `.ans3` with one card per click, each with a 240×120 inline SVG picture made of a few bars or dots in the role colours.

## 5. Hooks and timers

```js
let timer = null;
SLIDE_HOOKS.myslide = n => {
  if (timer) { clearInterval(timer); timer = null; }   // first: stop anything the last step started
  // then set every moving part for step n, whatever step came before
  if (n === 3) timer = setInterval(() => { /* advance */ }, 2200);
};
SLIDE_HOOKS.myslide(0);                                // draw step 0 once at load
```

- A hook must give the same picture for step n whether you arrive from n−1, from n+1, or by jumping to the slide. Set state, do not toggle it.
- Clear timers at the top of the hook. Steps go backwards during rehearsal and questions.
- Keep timers on one slide; a hook only runs for its own section.
- Wrap each slide's drawing in `(function name() { const svg = document.getElementById('x-svg'); if (!svg) return; ... })();` so a removed slide never breaks the others.

## 6. Charts (`slides/charts.js`)

`chartRoot(svgId, at)` returns a group in that SVG (appearing at step `at` if given). Pass it to a chart builder.

`dotChart(g, spec)`: horizontal rows, one per model, a dot per score.

```js
dotChart(chartRoot('result-svg'), {
  min: 0.4, max: 0.8, ticks: [0.4, 0.6, 0.8], tickFmt: v => v.toFixed(1), x0: 520, x1: 1300, top: 90, rowH: 130,
  axis: 'what is measured, where better is', chance: 0.5,
  rows: [
    { name: 'simple baseline', small: true, marks: [{ v: 0.52, lo: 0.50, hi: 0.54, c: 'base', label: '0.52', dx: 40, anchor: 'start', inline: true }] },
    { name: 'same network, untrained', small: true, at: 1, marks: [{ v: 0.61, c: 'ctrl', label: '0.61', dx: 40, anchor: 'start', inline: true }] },
    { name: 'our method', at: 2, marks: [{ v: 0.70, c: 'ours', label: '0.70', big: true, dx: 40, anchor: 'start', inline: true }],
      note: 'ahead of both', noteAt: 3 },
  ],
});
```

Marks take `v` (dot), `lo`/`hi` (interval drawn as a faint line), `band` (a range drawn as a pill), `c` (`ours`, `ctrl`, `base`, `ref`, or a hex colour), `label` with `inline`, `below` or above by default, `dx`, `anchor`, `big`. Rows take `name`, `sub`, `small`, `at`, and a `note` at the right with its own `noteAt`. Use `log: true` for ratios.

`lineChart(g, spec)`: curves against a log x axis by default (`logx: false` for linear). `xs`, `ymax`, `yticks`, `x0 x1 y0 y1`, `xlabel`, `ylabel`, `chance`, and `series: [{ys, c, name, at, dash, dy, hollow}]`. The name is written at the end of each line; `dy` nudges it when two ends collide; `hollow` marks points that do not clear their null.

Chart rules: one message per chart; build in argument order (baseline, control, method, verdict); rounded labels inline; the control's labels in dark grey so they stay readable; no legend box unless lines cross so much that end labels fail.

## 7. Live data slides

Decks can also have live slides: a recording on the left and the model's view drawn on a canvas on the right, synced, with a clickable timeline; rotatable 3D point clouds of embeddings; or frames frozen with captions at chosen moments. These read from a gitignored `data/` folder filled by an export script from the project's own data, and are served on `127.0.0.1` by a small server that answers byte-range requests (browsers need them to seek in video, Safari to play at all). The template leaves this out because it is specific to each project's data. If you add it, keep the data folder out of git and out of every preview, and give each live slide a `data-live` attribute so `outline.py` can be extended to mark it.
