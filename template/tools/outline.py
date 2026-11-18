"""Regenerate OUTLINE.md (slides and timing plan) and SCRIPT.md (speaker notes, click by click) from index.html.

    python3 tools/outline.py

It also rewrites the time mark at the end of each slide's notes to match its data-min, so the notes and the plan
never disagree. Prints the slide count and the total planned minutes.
"""
import json
import re
from pathlib import Path

D = Path(__file__).resolve().parents[1]
s = (D / 'index.html').read_text()
PARTS = [p[0] + (f' · {p[1]}' if len(p) > 1 else '') for p in
         json.loads(re.search(r'<script id="parts" type="application/json">(.*?)</script>', s, re.S).group(1))]
SECTION = r'<section id="([^"]+)"([^>]*)>(.*?)</section>'
fmt = lambda mn: f'{round(mn * 60)} s' if mn < 1 else f'{mn:g} min'
clock = lambda mn: f'{round(mn * 60) // 60}:{round(mn * 60) % 60:02d}'

rows, part, cum = [], 0, 0.0
for sid, attrs, body in re.findall(SECTION, s, re.S):
    m = re.search(r'data-min="([\d.]+)"', attrs)
    if not m:
        raise SystemExit(f'slide {sid} has no data-min')
    mn = float(m.group(1)); cum += mn
    if 'roadmap' in attrs:
        part = int(re.search(r'data-part="(\d+)"', attrs).group(1))
        title = 'Outline divider' + (' + research question' if 'data-rq' in attrs else '')
    else:
        h = re.search(r'<h[12][^>]*>(.*?)</h[12]>', body, re.S)
        title = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h.group(1))).strip() if h else sid
    steps = re.search(r'data-steps="(\d+)"', attrs)
    rows.append((part, sid, title, int(steps.group(1)) if steps else 0, mn, cum))

out = [f'# Deck outline ({cum:g} min, {len(rows)} slides)', '']
for p, name in enumerate(PARTS):
    rs = [r for r in rows if r[0] == p]
    out += [f'## {p + 1}. {name} ({sum(r[4] for r in rs):g} min)', '',
            '| # | Slide | Title | Clicks | Min | Clock |', '|---|---|---|---|---|---|']
    out += [f'| {rows.index(r) + 1} | `{r[1]}` | {r[2]} | {r[3]} | {r[4]:g} | {clock(r[5])} |' for r in rs] + ['']
(D / 'OUTLINE.md').write_text('\n'.join(out))


def retime(m):
    mn = float(re.search(r'data-min="([\d.]+)"', m.group(2)).group(1))
    note = re.sub(r'\s*\((?:[\d.]+ (?:s|min))\)\s*$', '', m.group(3).rstrip())
    return m.group(1) + note + f' ({fmt(mn)})\n  ' + m.group(4)


s = re.sub(r'(<section id="[^"]+"([^>]*)>.*?<aside class="notes">)(.*?)(</aside>)', retime, s, flags=re.S)
(D / 'index.html').write_text(s)

sc = ['# What to say, slide by slide', '',
      'Each slide shows its planned time and, in brackets, the clock at its end. "Click k" is what to say after the '
      'k-th click. Edit the notes in index.html, then run `python3 tools/outline.py`.', '']
for i, (sid, attrs, body) in enumerate(re.findall(SECTION, s, re.S)):
    p, _, title, _, mn, c = rows[i]
    if i == 0 or p != rows[i - 1][0]:
        sc += [f'## {PARTS[p]}', '']
    sc += [f'### {i + 1}. {title} · {fmt(mn)} [{clock(c)}]', '']
    n = re.search(r'<aside class="notes">(.*?)</aside>', body, re.S)
    t = re.sub(r'\s+', ' ', n.group(1)).strip() if n else ''
    t = re.sub(r'\s*\((?:[\d.]+ (?:s|min))\)$', '', t)
    for k, chunk in zip(['0'] + re.findall(r'\[([\d-]+)\]', t), re.split(r'\[[\d-]+\]', t)):
        if chunk.strip():
            sc += [(f'**Click {k}.** ' if k != '0' else '') + chunk.strip(), '']
(D / 'SCRIPT.md').write_text('\n'.join(sc))
print(len(rows), 'slides,', round(cum, 2), 'min')
