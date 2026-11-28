// Edit mode, loaded only by tools/edit.py (never part of the deck itself, its exports or its screenshots).
// Elements marked data-src="k" by the server are editable; Save sends the changed ones back as HTML.
(() => {
  const css = `
  #edit-bar { position: fixed; top: 12px; right: 12px; z-index: 1000; display: flex; gap: 6px; align-items: center;
    font: 14px/1 system-ui, sans-serif; background: #fff; border: 1px solid #ccc; border-radius: 8px; padding: 6px;
    box-shadow: 0 2px 10px rgba(0,0,0,.12); }
  #edit-bar button { font: inherit; padding: 6px 10px; border: 1px solid #bbb; border-radius: 6px; background: #f7f7f7; cursor: pointer; }
  #edit-bar button.on { background: #12827A; color: #fff; border-color: #12827A; }
  #edit-bar .st { padding: 0 6px; color: #555; min-width: 90px; }
  body.editing [data-src] { outline: 2px dashed rgba(18,130,122,.35); outline-offset: 4px; cursor: text; }
  body.editing [data-src]:focus { outline: 3px solid #12827A; }
  body.editing .b, body.editing .dim.off { opacity: 1 !important; }
  body.editing .reveal section.draft::after { content: 'draft: not animated yet'; position: absolute; right: 40px; top: 30px;
    font: 22px system-ui, sans-serif; color: #B45309; background: #FEF3C7; padding: 6px 14px; border-radius: 6px; }
  body.editing.notes-open .reveal .slides section.present aside.notes { display: block !important; position: absolute;
    left: 60px; right: 60px; bottom: 24px; max-height: 320px; overflow: auto; z-index: 50; background: #FFFBEA;
    border: 2px solid #E3A008; border-radius: 10px; padding: 18px 26px; font: 28px/1.4 system-ui, sans-serif;
    color: #333; white-space: pre-line; text-align: left; }`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  const els = [...document.querySelectorAll('[data-src]')];
  const dirty = new Set();
  const bar = document.createElement('div');
  bar.id = 'edit-bar';
  bar.innerHTML = `<span class="st"></span>
    <button data-a="mode" class="on" title="Turn editing off to see the slides as the audience will">Editing</button>
    <button data-a="notes" title="Show the speaker notes of this slide">Notes</button>
    <button data-a="save" title="Cmd/Ctrl+S">Save</button>
    <button data-a="add" title="Add a plain draft slide after this one">Add slide</button>
    <button data-a="delete" title="Delete this slide (draft slides only)">Delete draft</button>`;
  document.body.appendChild(bar);
  const st = bar.querySelector('.st');
  const status = msg => { st.textContent = msg || (dirty.size ? `${dirty.size} unsaved` : 'all saved'); };

  function setEditing(on) {
    document.body.classList.toggle('editing', on);
    bar.querySelector('[data-a=mode]').classList.toggle('on', on);
    els.forEach(el => on ? (el.contentEditable = 'true') : el.removeAttribute('contenteditable'));
    if (!on && document.activeElement) document.activeElement.blur();
  }

  // The HTML to write back: drop the classes deck.js adds at runtime, so the source keeps only what was written.
  function clean(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll('[data-at], [data-off]').forEach(x => {
      x.classList.remove('b', 'on', 'dim', 'off');
      if (!x.classList.length) x.removeAttribute('class');
    });
    return c.innerHTML;
  }

  async function send(op) {
    const edits = {};
    dirty.forEach(el => { edits[el.dataset.src] = clean(el); });
    const slide = Reveal.getCurrentSlide().id;
    status('saving…');
    const r = await fetch('/__edit/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: window.EDIT_VERSION, edits, op, slide }) });
    const res = await r.json();
    if (!r.ok) { status(); alert(res.error); return; }
    dirty.clear();
    // Reload so the page and the server agree on the file again; the hash keeps the slide.
    const idx = Reveal.getIndices();
    location.hash = res.slide && res.slide !== slide ? `#/${res.slide}` : `#/${slide}${idx.f >= 0 ? '/' + idx.f : ''}`;
    location.reload();
  }

  els.forEach(el => {
    el.addEventListener('input', () => { dirty.add(el); status(); });
    el.addEventListener('paste', e => {          // plain text only, so no fonts or colours come in from elsewhere
      e.preventDefault();
      document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
    });
  });
  document.addEventListener('keydown', e => {
    const t = e.target;
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); send('save'); return; }
    if (!t.isContentEditable) return;
    if (e.key === 'Escape') { t.blur(); return; }   // then arrow keys move through slides and clicks again
    if (e.key === 'Enter' && !t.closest('[data-edit]')) {
      e.preventDefault();
      document.execCommand(t.closest('aside.notes') ? 'insertText' : 'insertLineBreak', false, '\n');
    }
  }, true);
  bar.addEventListener('click', e => {
    const a = e.target.dataset && e.target.dataset.a;
    if (a === 'mode') setEditing(!document.body.classList.contains('editing'));
    if (a === 'notes') { document.body.classList.toggle('notes-open'); e.target.classList.toggle('on'); }
    if (a === 'save') send('save');
    if (a === 'add') send('add');
    if (a === 'delete') {
      if (!Reveal.getCurrentSlide().classList.contains('draft')) return alert('Only draft slides can be deleted here.');
      if (confirm('Delete this draft slide?')) send('delete');
    }
  });
  window.addEventListener('beforeunload', e => { if (dirty.size) { e.preventDefault(); e.returnValue = ''; } });

  setEditing(true);
  status();
})();
