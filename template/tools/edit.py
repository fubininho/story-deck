"""Edit mode: change the deck's words in the browser, without asking Claude for each change.

    python3 tools/edit.py            # serves the deck on http://127.0.0.1:8765 and opens it in the browser
    python3 tools/edit.py --port 9000 --no-open

Every piece of text written in index.html becomes editable in place, and so are the speaker notes. Save (Cmd/Ctrl+S)
writes the changes back into index.html; nothing else in the file moves. "Add slide" puts a plain draft slide
(title, bullets, notes) after the current one; Claude animates drafts later when asked. Text drawn by code (SVG
schematics, charts, roadmap lists) is not editable here.

The server listens on 127.0.0.1 only. If index.html changed since the page loaded (Claude or another tab edited it),
each edit still lands when the text it replaces is unchanged and found once; otherwise the save is refused and the
page keeps the edits on screen to copy. The file as it was at start is kept in index.html.bak.
"""
import hashlib
import html.parser
import http.server
import json
import re
import shutil
import sys
import webbrowser
from pathlib import Path

D = Path(__file__).resolve().parents[1]
DECK = D / 'index.html'
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
DRAFT = '''

<section id="{id}" class="draft" data-min="0.5">
  <div class="frame">
    <header><div class="kicker">Draft</div><h2>New slide title</h2></header>
    <ul class="draft-body" data-edit><li>First point</li><li>Second point</li></ul>
  </div>
  <aside class="notes">
    What to say on this slide.
  </aside>
</section>'''


class Scan(html.parser.HTMLParser):
    """Records every element inside a <section>: where its content starts and ends in the source, and whether it
    holds text of its own. Elements whose end tag is implied (an unclosed <p>) are dropped, never guessed."""

    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.lines = [0] + [m.end() for m in re.finditer('\n', src)]
        self.els, self.stack = [], []
        self.feed(src)
        self.close()

    def off(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        start = self.off()
        parent = self.stack[-1] if self.stack else None
        in_sec = tag == 'section' or (parent is not None and self.els[parent]['in_sec'])
        self.els.append(dict(tag=tag, attrs=dict(attrs), inner=start + len(self.get_starttag_text()), end=None,
                             text=False, parent=parent, in_sec=in_sec))
        self.stack.append(len(self.els) - 1)

    def handle_endtag(self, tag):
        for k in range(len(self.stack) - 1, -1, -1):
            if self.els[self.stack[k]]['tag'] == tag:
                self.els[self.stack[k]]['end'] = self.off()
                del self.stack[k:]
                return

    def handle_data(self, data):
        if self.stack and data.strip():
            self.els[self.stack[-1]]['text'] = True


def editable(src):
    """The editable elements, in document order: the outermost element inside a slide that holds text of its own
    (or carries data-edit, which makes a whole block editable, such as a bullet list). Returns [(inner, end)]."""
    els, marked, out = Scan(src).els, [], []
    for e in els:
        above = e['parent'] is not None and (marked[e['parent']] or els[e['parent']].get('under'))
        e['under'] = above
        ok = (e['in_sec'] and e['tag'] not in ('section', 'script', 'style') and e['end'] is not None
              and not above and (e['text'] or 'data-edit' in e['attrs']))
        marked.append(ok)
        if ok:
            out.append((e['inner'], e['end']))
    return out


def version(src):
    return hashlib.sha1(src.encode()).hexdigest()


SEEN = {}   # version -> source as served, so edits made on an older page can be placed in a newer file


def served(src):
    """index.html with data-src="k" on every editable element and the editor script before </body>."""
    SEEN[version(src)] = src
    out = src
    for k, (inner, _) in reversed(list(enumerate(editable(src)))):
        out = out[:inner - 1] + f' data-src="{k}"' + out[inner - 1:]
    tag = f'<script>window.EDIT_VERSION = "{version(src)}";</script>\n<script src="/__edit/edit.js"></script>\n'
    return out.replace('</body>', tag + '</body>', 1)


def section_span(src, sid):
    m = re.search(rf'<section id="{re.escape(sid)}"[^>]*>.*?</section>', src, re.S)
    if not m:
        raise ValueError(f'no slide with id {sid}')
    return m


def apply(src, req, old=None):
    """Apply text edits, then the optional operation. Returns (new source, slide id to show). With `old` (the source
    the page was served from, when the file changed since), each edit goes to the one element that still holds the
    text it had then."""
    spans, edits = editable(src), {}
    old_spans = editable(old) if old is not None else spans
    for k, text in req.get('edits', {}).items():
        k = int(k)
        if old is not None:
            was = old[slice(*old_spans[k])]
            hits = [j for j, sp in enumerate(spans) if src[slice(*sp)] == was]
            if len(hits) != 1:
                raise ValueError('index.html changed meanwhile and this text changed or appears twice there: '
                                 + re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', was)).strip()[:80])
            k = hits[0]
        edits[k] = text
    for k in sorted(edits, reverse=True):
        inner, end = spans[k]
        src = src[:inner] + edits[k] + src[end:]
    op, sid = req.get('op'), req.get('slide')
    if op == 'add':
        n = 1
        while f'id="draft-{n}"' in src:
            n += 1
        new = f'draft-{n}'
        m = section_span(src, sid)
        return src[:m.end()] + DRAFT.format(id=new) + src[m.end():], new
    if op == 'delete':
        m = section_span(src, sid)
        if not re.match(r'<section[^>]*class="draft"', m.group(0)):
            raise ValueError('only draft slides can be deleted here; ask Claude for other slides')
        before = re.findall(r'<section id="([^"]+)"', src[:m.start()])
        return src[:m.start()].rstrip() + src[m.end():], (before[-1] if before else '')
    return src, sid


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(D), **k)

    def log_message(self, *a):
        pass

    def send(self, code, body, ctype='application/json'):
        data = body.encode()
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = self.path.split('?')[0].split('#')[0]
        if path in ('/', '/index.html'):
            return self.send(200, served(DECK.read_text()), 'text/html; charset=utf-8')
        if path == '/__edit/edit.js':
            return self.send(200, (D / 'tools' / 'edit.js').read_text(), 'text/javascript')
        return super().do_GET()

    def do_POST(self):
        host = f'http://{self.headers.get("Host", "")}'
        if self.path != '/__edit/apply' or self.headers.get('Origin', host) != host:
            return self.send(403, '{"error": "refused"}')
        req = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        src = DECK.read_text()
        old = None if req.get('version') == version(src) else SEEN.get(req.get('version'))
        if old is None and req.get('version') != version(src):
            return self.send(409, json.dumps({'error': 'index.html changed and this page is too old to merge. Copy '
                                                       'your edits, reload, and paste them again.'}))
        try:
            new, sid = apply(src, req, old)
        except (ValueError, IndexError) as e:
            return self.send(400, json.dumps({'error': str(e)}))
        DECK.write_text(new)
        self.send(200, json.dumps({'slide': sid}))


def main():
    port = int(sys.argv[sys.argv.index('--port') + 1]) if '--port' in sys.argv else 8765
    shutil.copy(DECK, D / 'index.html.bak')
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler)
    url = f'http://127.0.0.1:{port}/'
    print(f'Edit mode on {url}  (Ctrl+C to stop; the file as it was is in index.html.bak)')
    if '--no-open' not in sys.argv:
        webbrowser.open(url)
    srv.serve_forever()


if __name__ == '__main__':
    main()
