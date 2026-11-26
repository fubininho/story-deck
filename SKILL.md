---
name: story-deck
description: The craft of a presentation, from finding the story to animated slides. Use it to work out what a talk should say and in what order (even when the main message is not known yet), and to build it as an animated HTML deck that reveals the story click by click, with drawn schematics, clean charts, rounded numbers and timed speaker notes. Fits any talk built on evidence, such as a data-science findings readout for stakeholders, an analysis or discovery shared with a team, a project update or demo, a research talk or defence, a pitch, or a lecture. Use it whenever someone wants slides, a deck or a presentation, asks "how do I present this", wants to turn notebooks, results, a report or a paper into a talk, or is editing a deck built this way (an index.html with data-steps/data-at slides and SLIDE_HOOKS). Not for PowerPoint files, which the pptx skill handles.
---

# Story deck

This skill covers two crafts: finding the story a talk should tell, and making each slide tell its part of it so the eye follows without effort. The output is one HTML file of slides, each revealed click by click, with pictures drawn in code and speaker notes for every click. It fits work readouts and academic talks alike.

Four ideas run through everything below. The talk serves a decision, so it shows what the audience needs to take it and leaves out how the work was built. The audience follows a story, not a list of results. A concrete case comes before any abstraction. Animation says "this, then this" and never decorates.

## Find the story

Often the material exists but the message does not yet. Work through these steps in order before making any slide. Steps 1, 3 and 4 wait for the user's answer.

1. Audience gate. Stop here before reading any material or drafting anything, and ask the user for (a) the audience and what they already know, (b) the decision the meeting should take, and (c) the time slot, including time for discussion. Ask too what must not be said or shown. What the user wrote in the request counts as an answer; what you infer from files, memory or the topic does not. If one of the three is missing or vague, ask for it again instead of assuming, and do nothing else until all three are in, even if the user is in a hurry. If you opened material while loading this skill, say so and draw nothing from it yet. A lecture or a defence has a decision too: what the listeners do next, or what the committee has to be convinced of.
2. Read the material and list what was actually found, each item in one plain sentence, with its evidence and how strong that evidence is. Include what did not work and what is still unknown.
3. Produced versus needed. Split that list in two: "what I produced" and "what this audience needs to take the decision". An item is needed only if the decision would change or stall without it, however much work it took. A limitation that could change the decision is always needed. Only the second list reaches the main slides. Everything else goes to the backup list (`BACKUP.md` beside the deck). If the decision needs something nobody produced, record it as a gap. Show the user both lists and get their OK.
4. Draft two or three candidate headlines from the needed list: one sentence each that a listener could repeat to a colleague afterwards. ("Churn is driven by the first week, not by price.") Pick one with the user. If none holds up, the analysis is not finished, and saying so is more useful than a deck.
5. Inversion exercise. Building starts in the details and ends at the result. Presenting runs the other way: the decision first, then the practical priorities, then the few details the decision needs. Write the talk in the order the work was built, then turn it round. Before: "We joined three sources, tried four models and tuned the best. It predicts which accounts will leave, so we could call them." After: "Approve a one-month trial of calling the accounts on this list. Call the largest first, with one person owning the calls. The list catches about two in three leavers and is weak on new accounts."
6. Write the questions the audience would ask, in that inverted order. Each question becomes a section: "what should we do?", "what does that rest on?", "what could go wrong?" in a work readout, the research questions in a research talk.
7. Choose the reference point every claim is read against: a baseline, last quarter, the current process, doing nothing, an untrained copy of the model. A number means little until the audience knows what it is compared with.

When the user already has a thesis and questions, the gate still comes first, and steps 3 to 7 check them.

## Pick a shape

Pick the shape that fits the audience and the headline, then fill it with beats (next section). In every shape the decision opens the talk and the next MVP closes it; the shape orders what comes between. No shape replays how the work was done.

- Question-led. Each section answers one of the audience's questions; a divider states it and a recap answers it. Good for research talks and any deep dive.
- Situation, complication, resolution. The resolution in one line first, then what is normal and what changed, so the room sees why it follows. Good for findings that lead to a decision.
- Investigation. The finding first, then the one or two explanations the room would raise and the check that settles each. Good for discovery work the audience might doubt.
- Incremental build-up. The result first, then the steps that lead to it as options: what each adds, what it costs, where the room could stop. Good when the decision is how far to go.
- Before and after. Where things are now, where they were, what that changes for this audience, what it cost. Good for project updates and demos.
- Options and recommendation. The pick, then the options side by side against the same criteria, and the risks of the pick. Good for a decision meeting.

Long talks can nest shapes: a question-led talk whose sections are each small investigations.

## Beats

A beat is one move of the story, usually one slide or one click. Use the ones a point needs, in an order that keeps the concrete before the abstract:

- The question, in the audience's words. "Which past cases look like this one?" lands; "retrieval evaluation" does not.
- A concrete case. A real example from the data (kept local, see Privacy), an analogy told as a story, a live view, one customer's timeline. An analogy runs as a story first; the technical names appear over the same picture only on the last click.
- The mechanism, drawn on that same case, when the decision depends on how it works: how the data goes in and what comes back out, ideally drawn back onto the original picture. Otherwise it is backup.
- The evidence: one chart, one message, with the reference point on it.
- What it means, in one line, usually the slide title or a footer.

Order findings by how much they weigh on the decision, and keep the losses that bear on it visible. A recap that shows the strength, the tie and the caveat side by side earns more trust than one that leaves the caveat out. Treat the reference point as a way to read the result: if a simple baseline or an untrained copy already gets part of the way, say what that part is and what the method adds beyond it. Never frame a strong baseline as making the work pointless, unless that is the honest finding, and then it is the headline.

The opening slide states the decision, with a few core claims in a row and the evidence it needs underneath. Six equal boxes read as a list; three with evidence below read as an argument.

Near the end, say the main limitation and what is still open (stated as open, never as a guess dressed as an answer). The last slide is the next MVP: what it is, what it needs from this audience, and which gaps remain after it.

`references/story.md` walks through one full deck as a catalogue of slide kinds and shows the beats in three work talks.

## Build the deck

1. Copy the template into the project: `cp -R ~/.claude/skills/story-deck/template <project>/presentation`. It runs offline (reveal.js 5.1.0 is vendored) and its example slides show slide kinds, not the order of a talk.
2. Serve it on loopback only: `cd presentation && python3 -m http.server 8090 --bind 127.0.0.1`, then open `http://127.0.0.1:8090`. Keys: arrows or space to step, S for the speaker view with notes and timer, T for elapsed time against the plan, O for the overview.
3. Set the sections in `<script id="parts">` in `index.html`. The divider slides and `tools/outline.py` both read it.
4. Plan the core and its time before drawing. The core is the decision, what we found, what it means, the main limitation and the next MVP, and nothing else yet. Give each slide an id and a planned length (`data-min`), leave the notes empty, and run `python3 tools/outline.py`. It writes `OUTLINE.md` and prints the total. Keep the total within about two thirds of the slot (20 minutes of a 30-minute slot); the rest is discussion. About 45 seconds per ordinary slide, 1 to 1.5 minutes for a schematic that builds in five steps, 10 seconds for a divider. Cut slides now, not after they are drawn.
5. Keep `FACTS.md` beside the deck: every number on a slide and where it came from (a query, a notebook cell, a report line).
6. Build the core slides click by click with the helpers in `references/animation.md`. Delete the example slides as you replace them.
7. Write the notes per click, run the humanizer skill on them (the room hears AI tells), and run `tools/outline.py` again.
8. Render every step and look at it (Verification), then show the user the core.
9. Ask where they want more detail, offering the backup list as options with the minutes each would add. Add detail only where they say so, through steps 4 to 8, and check the new total against the slot each time. If a detail would go past two thirds, name what to cut and get an answer before adding it.

## Numbers and names

- On the slide: rounded headline numbers. Two decimals at most ("1.2 m", "+0.04"), or a ratio ("about 12× faster", "about a third"). No confidence intervals or p-values as text; draw an interval as a faint line behind the dot instead.
- In the spoken notes: as few numbers as possible. Say "ahead of", "ties", "behind", "about twice". A listener takes in about one number a minute, and the slide already shows it.
- No experiment codes, file paths, table names, run names or internal jargon anywhere a listener sees or hears. Name each thing by what it is or tests: "the same model, untrained", not "ctrl_v2"; "customers who left in week one", not "cohort_b".

## Notes and timing

Write notes inside each slide's `<aside class="notes">`. `[0]` is what to say before the first click and `[k]` what to say after click k, so the speaker view always matches the screen. Write spoken English: connectors ("so", "now", "and this is why"), one idea per sentence, comparisons instead of numbers. Say when a picture is an illustration rather than real output. End each slide on a sentence that leads into the next.

`tools/outline.py` rewrites the time mark at the end of each note (`(45 s)`) and regenerates `OUTLINE.md` and `SCRIPT.md`. Run it after every edit to notes or timing.

If the user wants the script as a shared document (to comment on, or in a second language), create it through the first-party docs connector when one is attached, one tab per language. After any change to the notes, update every language tab in the same turn, and bring comments made there back into `index.html` before regenerating.

## Animation

Each slide declares its clicks (`data-steps="N"`). Anything with `data-at="k"` appears at step k, and `data-off="k"` dims it from step k. Inside an appearing group, `.pop` grows elements in, `.draw` traces strokes, `.grow` extends bars, and an inline `transition-delay` staggers them so items arrive one after another. Motion that appear and dim cannot express (dots flying from a picture into a grid, layers lighting in sequence, chips taking turns) goes in `SLIDE_HOOKS[id] = n => {...}`, which runs on every step in both directions.

A good schematic shows the mechanism moving, one movement per sentence of the notes. The template's `pipeline` slide shows the moves: dots fly from the picture into a grid, layers pop in and light in turn, chips take turns with a caption, and the result is drawn back on the picture. The same moves fit a data pipeline, a funnel, or a system diagram.

Read `references/animation.md` before drawing: helper API, motion recipes, chart specs, layout sizes and timer rules.

## Charts

One message per chart. Colour by role and keep the roles fixed for the whole talk: the thing presented in teal, the reference point in grey, a simple baseline in amber, outside references in ink. Write the rounded value next to each dot and the series name at the end of each line, with no legend box. Reveal in the order of the argument: baseline, reference, the thing presented, then the one-line verdict ("ahead of both"). `dotChart` and `lineChart` in `slides/charts.js` do this; specs are in `references/animation.md`.

## Verification

Render every build step before showing the deck or committing it:

```bash
python3 tools/shoot.py            # every slide, every step -> shots/NN-<id>-<step>.png
python3 tools/shoot.py pipeline   # only the slides you changed
```

It serves the deck on `127.0.0.1` and runs headless Chrome at 1920×1080 on `#/<id>` (step 0) and `#/<id>/<k-1>` (step k). Look at each PNG for text over text, labels over lines, titles that wrap into the stage, anything past the right edge, and steps that look identical. A contact sheet of all shots makes a full pass quick. Keep `shots/` gitignored.

## Export

The HTML deck is the master. Export it when the user needs a file to send or present from another machine:

```bash
python3 tools/export.py pdf             # one page per slide, as it looks after its last click
python3 tools/export.py pdf --steps     # one page per click, as a handout of every build step
python3 tools/export.py pptx            # PowerPoint, one slide per click, each with that click's speaker notes
python3 tools/export.py pptx --final    # one slide per slide, with its full notes
python3 tools/export.py key             # Keynote: the pptx above, imported and saved by Keynote (macOS only)
```

Files land in `export/` (gitignored). Every page is a 1920×1080 picture of the rendered slide, so it looks like the browser, but its text cannot be edited and animation becomes one page per click. Timers freeze at the moment of the screenshot; say so if the user plans to present from the export. pptx and key need `pip install python-pptx`; key also needs Keynote, and macOS asks once for permission to control it. If the user needs editable slides, say that this route does not give them, and offer the pptx skill.

An export contains whatever the slides show, so the Privacy rules apply to the file too.

## Privacy

Talks often show data that cannot leave the team: customer records, tracking data, video, internal metrics. Keep it in a gitignored folder, serve only on `127.0.0.1`, and never put it into a public URL, an artifact, a gist, a shared doc or a commit. Before publishing any preview, check that its slides use no such data, and ask the user first. Pictures drawn from illustrative positions, as in the template, are safe to share; frames from real data are not.

## Prose

Slide text, notes and any write-up go through the humanizer skill. On slides aim for short noun phrases and plain verbs; in notes, for how the speaker talks. Keep the user's own wording where they gave it, and translate only when asked.
