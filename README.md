# story-deck

A Claude Code skill for the craft of a presentation: finding the story a talk should tell, then building it as an animated HTML deck that reveals that story click by click.

It works for any talk built on evidence: a data-science findings readout, a discovery shared with a team, a project update, a research talk or defence, a pitch. Claude uses it to:

- find the headline and the questions the audience will ask, even when the main message is not known yet
- pick a story shape (question-led, investigation, incremental build-up, before and after, and others) and fill it with beats that put a concrete case before any abstraction
- build the slides as one offline HTML file, with schematics drawn in code, charts with rounded numbers written inline, and speaker notes for every click
- keep a timed script and render every build step headless to check for overlaps
- export the deck as PDF, PowerPoint (with the speaker notes) or Keynote

## Install

Clone it into your Claude Code skills folder:

```bash
git clone https://github.com/fubininho/story-deck ~/.claude/skills/story-deck
```

Claude Code picks it up in the next session. Ask for slides, a deck or a talk ("turn this notebook into a 15-minute readout for the product team") and the skill loads on its own.

## What is inside

- `SKILL.md`: the workflow and the rules (story, numbers, notes, animation, charts, verification, privacy).
- `references/story.md`: one full deck walked through slide by slide, plus three other talks built from the same beats.
- `references/animation.md`: the build system, SVG helpers, motion recipes and chart specs.
- `template/`: a working starter deck with one example of each slide kind. It runs offline; reveal.js 5.1.0 is vendored under its MIT licence.

The template needs Python 3 to serve and to run its tools. `tools/shoot.py` and `tools/export.py` also need a headless Chrome (for example `npx playwright install chromium-headless-shell`). The PowerPoint and Keynote exports need `pip install python-pptx`, and the Keynote one runs only on a Mac with Keynote installed.

## Licence

MIT. See [LICENSE](LICENSE).
