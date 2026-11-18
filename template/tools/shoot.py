"""Render every build step of every slide to PNG at 1920x1080 with headless Chrome, for checking overlaps by eye.

    python3 tools/shoot.py               # all slides  -> shots/NN-<id>-<step>.png
    python3 tools/shoot.py pipeline open  # only these slide ids

Serves the deck on 127.0.0.1 (never a public address) for the duration. Step 0 is the slide before any click;
step k is after k clicks (Reveal fragment index k-1 in the URL). Set CHROME to the browser binary if it is not found.
"""
import functools
import glob
import http.server
import os
import re
import subprocess
import sys
import threading
from pathlib import Path

D = Path(__file__).resolve().parents[1]
OUT = D / 'shots'


def find_chrome():
    if os.environ.get('CHROME'):
        return os.environ['CHROME']
    pats = ['~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell',
            '~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell',
            '~/.cache/puppeteer/chrome-headless-shell/*/chrome-headless-shell-*/chrome-headless-shell',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    for p in pats:
        hits = sorted(glob.glob(os.path.expanduser(p)))
        if hits:
            return hits[-1]
    raise SystemExit('No headless Chrome found. Install one (npx playwright install chromium-headless-shell) or set CHROME.')


def main():
    only = set(sys.argv[1:])
    html = (D / 'index.html').read_text()
    slides = [(sid, int(m.group(1)) if (m := re.search(r'data-steps="(\d+)"', a)) else 0)
              for sid, a in re.findall(r'<section id="([^"]+)"([^>]*)>', html)]
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(D))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    port, chrome = srv.server_address[1], find_chrome()
    OUT.mkdir(exist_ok=True)
    for i, (sid, steps) in enumerate(slides, 1):
        if only and sid not in only:
            continue
        for n in range(steps + 1):
            frag = f'/{n - 1}' if n else ''
            png = OUT / f'{i:02d}-{sid}-{n}.png'
            subprocess.run([chrome, '--headless', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1920,1080',
                            '--virtual-time-budget=4000', f'--screenshot={png}', f'http://127.0.0.1:{port}/index.html#/{sid}{frag}'],
                           check=True, capture_output=True)
            print(png.relative_to(D))
    srv.shutdown()


if __name__ == '__main__':
    main()
