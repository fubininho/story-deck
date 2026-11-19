"""Export the deck as PDF, PowerPoint or Keynote. Every page is a 1920x1080 picture of the rendered slide, so the
look matches the browser exactly, but the text is not editable and animation becomes one page per click.

    python3 tools/export.py pdf             # one page per slide, as it looks after its last click -> export/deck.pdf
    python3 tools/export.py pdf --steps     # one page per click (a handout of every build step)
    python3 tools/export.py pptx            # one slide per click, with that click's speaker notes -> export/deck.pptx
    python3 tools/export.py pptx --final    # one slide per slide, with its full notes
    python3 tools/export.py key             # the pptx above, converted by Keynote (macOS with Keynote installed)

Needs headless Chrome (see shoot.py). pptx and key also need python-pptx (pip install python-pptx).
The exported files contain whatever the slides show: keep any export of private data off public places.
"""
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from shoot import D, find_chrome, serve, shoot, slides

OUT = D / 'export'


def notes_by_step():
    """{slide id: {step: text}} from each slide's <aside class="notes">, split on the [k] click marks."""
    html, out = (D / 'index.html').read_text(), {}
    for sid, body in re.findall(r'<section id="([^"]+)"[^>]*>(.*?)</section>', html, re.S):
        m = re.search(r'<aside class="notes">(.*?)</aside>', body, re.S)
        t = re.sub(r'<[^>]+>', '', re.sub(r'\s+', ' ', m.group(1))).strip() if m else ''
        t = re.sub(r'\s*\((?:[\d.]+ (?:s|min))\)$', '', t)
        parts = re.split(r'\[(\d+)\]', t)          # ['before any mark', '0', 'text', '1', 'text', ...]
        steps = {0: parts[0].strip()} if parts[0].strip() else {}
        for k, chunk in zip(parts[1::2], parts[2::2]):
            steps[int(k)] = (steps.get(int(k), '') + ' ' + chunk).strip()
        out[sid] = steps
    return out


def render(every_step, tmp):
    """Screenshot each slide (every step, or only its last) into tmp; returns [(png, slide id, step)]."""
    srv, port = serve()
    chrome, pages = find_chrome(), []
    for i, (sid, steps) in enumerate(slides(), 1):
        for n in (range(steps + 1) if every_step else [steps]):
            png = tmp / f'{i:02d}-{sid}-{n}.png'
            shoot(chrome, port, sid, n, png)
            pages.append((png, sid, n))
            print(png.name, file=sys.stderr)
    srv.shutdown()
    return pages


def to_pdf(pages, tmp):
    """Lay the pictures out one per 1920x1080 page and let Chrome print them."""
    imgs = ''.join(f'<img src="{p.name}">' for p, _, _ in pages)
    page = tmp / 'pages.html'
    page.write_text('<!doctype html><style>@page{size:1920px 1080px;margin:0}html,body{margin:0}'
                    'img{display:block;width:1920px;height:1080px;break-after:page}</style>' + imgs)
    pdf = OUT / 'deck.pdf'
    subprocess.run([find_chrome(), '--headless', '--no-pdf-header-footer', f'--print-to-pdf={pdf}', page.as_uri()],
                   check=True, capture_output=True)
    return pdf


def to_pptx(pages, every_step):
    from pptx import Presentation
    from pptx.util import Inches
    prs, notes = Presentation(), notes_by_step()
    prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
    blank = prs.slide_layouts[6]
    for png, sid, n in pages:
        s = prs.slides.add_slide(blank)
        s.shapes.add_picture(str(png), 0, 0, prs.slide_width, prs.slide_height)
        per = notes.get(sid, {})
        s.notes_slide.notes_text_frame.text = per.get(n, '') if every_step else ' '.join(per[k] for k in sorted(per))
    # python-pptx creates the notes master but leaves it out of presentation.xml; PowerPoint does not mind,
    # Keynote refuses the whole file as "invalid format". Register it.
    from lxml import etree
    from pptx.oxml.ns import qn
    if prs._element.find(qn('p:notesMasterIdLst')) is None:
        rid = next(r.rId for r in prs.part.rels.values() if r.reltype.endswith('/notesMaster'))
        lst = etree.Element(qn('p:notesMasterIdLst'))
        etree.SubElement(lst, qn('p:notesMasterId'), {qn('r:id'): rid})
        prs._element.sldMasterIdLst.addnext(lst)
    path = OUT / 'deck.pptx'
    prs.save(path)
    return path


def to_key(pptx):
    """Keynote imports the pptx and saves it as .key. Opened through `open -a` so the sandboxed app may read the file;
    macOS asks once for permission to let the terminal control Keynote."""
    key, name = pptx.with_suffix('.key'), pptx.stem
    ask = lambda script: subprocess.run(['osascript', '-e', f'tell application "Keynote" to {script}'],
                                        capture_output=True, text=True, timeout=120).stdout.strip()
    subprocess.run(['open', '-a', 'Keynote', str(pptx)], check=True)
    for _ in range(90):                                   # import takes a few seconds per dozen slides
        if name in ask('get name of every document'):
            break
        time.sleep(2)
    else:
        raise SystemExit('Keynote did not open the pptx; check Keynote for an error dialog.')
    ask(f'save document "{name}" in POSIX file "{key}"')
    ask(f'close (every document whose name starts with "{name}") saving no')
    return key


def main():
    fmt = sys.argv[1] if len(sys.argv) > 1 else ''
    if fmt not in ('pdf', 'pptx', 'key'):
        raise SystemExit(__doc__)
    every_step = '--steps' in sys.argv if fmt == 'pdf' else '--final' not in sys.argv
    OUT.mkdir(exist_ok=True)
    tmp = Path(tempfile.mkdtemp(dir=D))   # inside the deck folder, so nothing is written elsewhere
    try:
        pages = render(every_step, tmp)
        path = to_pdf(pages, tmp) if fmt == 'pdf' else to_pptx(pages, every_step)
        if fmt == 'key':
            path = to_key(path)
    finally:
        shutil.rmtree(tmp)
    print(path.relative_to(D))


if __name__ == '__main__':
    main()
