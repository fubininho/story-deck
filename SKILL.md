---
name: story-deck
description: The craft of a presentation, from finding the story to animated slides. Use it to work out what a talk should say and in what order (even when the main message is not known yet), and to build it as an animated HTML deck that reveals the story click by click, with drawn schematics, clean charts, rounded numbers and timed speaker notes. Fits any talk built on evidence, such as a data-science findings readout for stakeholders, an analysis or discovery shared with a team, a project update or demo, a research talk or defence, a pitch, or a lecture. Use it whenever someone wants slides, a deck or a presentation, asks "how do I present this", wants to turn notebooks, results, a report or a paper into a talk, or is editing a deck built this way (an index.html with data-steps/data-at slides and SLIDE_HOOKS). Not for PowerPoint files, which the pptx skill handles.
---

# Story deck

This skill covers two crafts: finding the story a talk should tell, and making each slide tell its part of it so the eye follows without effort. The output is one HTML file of slides, each revealed click by click, with pictures drawn in code and speaker notes for every click. It started from a research talk that went through many rounds of feedback, but nothing here is specific to academic talks. A findings readout for a product team uses the same moves.

Three ideas run through everything below. The audience follows a story, not a list of results. A concrete case comes before any abstraction. Animation says "this, then this" and never decorates.

## Find the story

Often the material exists (notebooks, query results, a report, a paper, a pile of charts) but the message does not yet. Find it before making any slide, because every later choice depends on it.

1. Ask who is in the room and what they should know, believe or do afterwards. A director deciding whether to fund a model, a team that will maintain a pipeline, and an examination committee need different talks from the same results. Also ask how long the talk is, what the audience already knows, and anything that must not be said or shown.
2. Read the material and list what was actually found, each item in one plain sentence, with its evidence and how strong that evidence is. Include what did not work and what is still unknown. Don't polish yet.
3. Draft two or three candidate headlines: one sentence each that a listener could repeat to a colleague afterwards. ("Churn is driven by the first week, not by price." "One pretrained model serves every task, and we can tell which part of the gain comes from training.") Show them to the user and pick one together. If none holds up, the analysis is not finished, and saying so is more useful than a deck.
4. From the chosen headline, write the questions the audience would ask, in the order they would ask them. Each question becomes a section. In a research talk these are the research questions; in a work readout they are things like "how big is it?", "why does it happen?", "what do we do?".
5. Choose the reference point every claim is read against: a baseline, last quarter, the current process, doing nothing, an untrained copy of the model. A number means little until the audience knows what it is compared with.

When the user already has a thesis and questions, check them with steps 3 to 5 anyway: a headline that cannot be said in one sentence will not survive the talk.

## Pick a shape

Pick the shape that fits the audience and the headline, then fill it with beats (next section). These are the common ones:

- Question-led. Each section answers one of the audience's questions; a divider states it and a recap answers it. Good for research talks and any deep dive.
- Situation, complication, resolution. What is normal, what went wrong or changed, what to do about it. Good for findings that lead to a decision.
- Investigation. We noticed something, suspected a cause, checked it, and found something else. Good for discovery work, because the audience relives the reasoning and believes the ending.
- Incremental build-up. Start from the simplest result, then improve it in small steps, one change and one new result at a time, until you reach the solution. Good for modelling work and any solution that came from many small decisions.
- Before and after. Where things were, what was built, where things are now, what it cost. Good for project updates and demos.
- Options and recommendation. The decision, the options side by side against the same criteria, the pick and its risks. Good for a decision meeting.

Long talks can nest shapes: a question-led talk whose sections are each small investigations.

## Beats

A beat is one move of the story, usually one slide or one click. Use the ones a point needs, in an order that keeps the concrete before the abstract:

- The question, in the audience's words. "Which past cases look like this one?" lands; "retrieval evaluation" does not.
- A concrete case. A real example from the data (kept local, see Privacy), an analogy told as a story, a live view, one customer's timeline. A model that learns by predicting hidden parts of its input can be told as an expert who saw everything describing the covered parts in her own words, while a learner who saw only the rest guesses what she will say, and the gap between the two shrinks. Only on the last click do the technical names appear over the same picture.
- The mechanism, drawn on that same case: how the data goes in and what comes back out, ideally drawn back onto the original picture.
- The evidence: one chart, one message, with the reference point on it.
- What it means, in one line, usually the slide title or a footer.

Order findings with the strongest first and keep the weak ones and the losses visible. A recap that shows the strength, the tie and the caveat side by side earns more trust than one that leaves the caveat out. Treat the reference point as a way to read the result: if a simple baseline or an untrained copy already gets part of the way, say what that part is and what the method adds beyond it. Never frame a strong baseline as making the work pointless, unless that is the honest finding, and then it is the headline.

Close with where the approach stops working, what is still open (stated as open, never as a guess dressed as an answer), and one line per section. The early "what you will take away" slide works best as a few core claims in a row with the supporting evidence underneath. Six equal boxes read as a list; three with evidence below read as an argument.

`references/story.md` walks through one full deck slide by slide and shows how the same beats map onto other kinds of talk.

## Build the deck

1. Copy the template into the project: `cp -R ~/.claude/skills/story-deck/template <project>/presentation`. It runs offline (reveal.js 5.1.0 is vendored) and has one example of each slide kind above.
2. Serve it on loopback only: `cd presentation && python3 -m http.server 8090 --bind 127.0.0.1`, then open `http://127.0.0.1:8090`. Keys: arrows or space to step, S for the speaker view with notes and timer, T for elapsed time against the plan, O for the overview.
3. Set the sections in `<script id="parts">` in `index.html`. The divider slides and `tools/outline.py` both read it.
4. Plan slides and time before drawing. Give each slide an id and a planned length (`data-min`), leave the notes empty, and run `python3 tools/outline.py`. It writes `OUTLINE.md` with the running clock and prints the total. About 45 seconds per ordinary slide, 1 to 1.5 minutes for a schematic that builds in five steps, 10 seconds for a divider. Cut slides now, not after they are drawn.
5. Keep `FACTS.md` beside the deck: every number on a slide and where it came from (a query, a notebook cell, a report line). Someone will check a number, and a mismatch found live costs more than the time this takes.
6. Build each slide click by click with the helpers in `references/animation.md`. Delete the example slides as you replace them.
7. Write the notes per click, then run `tools/outline.py` again.
8. Render every step and look at it (Verification) before showing the user anything.
9. Run the humanizer skill on the notes and any Markdown prose. Notes are read aloud, so AI tells are heard by the whole room.

## Numbers and names

- On the slide: rounded headline numbers. Two decimals at most ("1.2 m", "+0.04"), or a ratio ("about 12× faster", "about a third"). No confidence intervals or p-values as text; draw an interval as a faint line behind the dot instead.
- In the spoken notes: as few numbers as possible. Say "ahead of", "ties", "behind", "about twice". A listener takes in about one number a minute, and the slide already shows it.
- No experiment codes, file paths, table names, run names or internal jargon anywhere a listener sees or hears. Name each thing by what it is or tests: "the same model, untrained", not "ctrl_v2"; "customers who left in week one", not "cohort_b".

## Notes and timing

Write notes inside each slide's `<aside class="notes">`. `[0]` is what to say before the first click and `[k]` what to say after click k, so the speaker view always matches the screen. Write spoken English: connectors ("so", "now", "and this is why"), one idea per sentence, comparisons instead of numbers. Say when a picture is an illustration rather than real output. End each slide on a sentence that leads into the next.

`tools/outline.py` reads `data-min` and the notes, rewrites the time mark at the end of each note (`(45 s)`), and regenerates `OUTLINE.md` and `SCRIPT.md` with the clock at the end of every slide. Run it after every edit to notes or timing.

If the user wants the script as a shared document (to comment on, or in a second language), create it through the first-party docs connector when one is attached, one tab per language. After any change to the notes, update every language tab in the same turn, and bring comments made there back into `index.html` before regenerating.

## Animation

Each slide declares its clicks (`data-steps="N"`). Anything with `data-at="k"` appears at step k, and `data-off="k"` dims it from step k. Inside an appearing group, `.pop` grows elements in, `.draw` traces strokes, `.grow` extends bars, and an inline `transition-delay` staggers them so items arrive one after another. Motion that appear and dim cannot express (dots flying from a picture into a grid, layers lighting in sequence, chips taking turns) goes in `SLIDE_HOOKS[id] = n => {...}`, which runs on every step in both directions.

A good schematic shows the mechanism moving, one movement per sentence of the notes. In one model slide, the data picture turned into a grid of tokens (dots flew into the newest column, then the grid popped in column by column), eight layers popped in one after another and then lit in turn on a timer, four head chips took turns with a caption for each, and what one item attended to was drawn back on the original picture. The template's `pipeline` slide is a data-free version. The same moves fit a data pipeline, a funnel, or a system diagram.

Read `references/animation.md` before drawing: helper API, motion recipes, chart specs, layout sizes and timer rules.

## Charts

One message per chart. Colour by role and keep the roles fixed for the whole talk: the thing presented in teal, the reference point in grey, a simple baseline in amber, outside references in ink. Write the rounded value next to each dot and the series name at the end of each line, with no legend box. Reveal in the order of the argument: baseline, reference, the thing presented, then the one-line verdict ("ahead of both"). `dotChart` and `lineChart` in `slides/charts.js` do this; specs are in `references/animation.md`.

## Verification

Render every build step before showing the deck or committing it:

```bash
python3 tools/shoot.py            # every slide, every step -> shots/NN-<id>-<step>.png
python3 tools/shoot.py pipeline   # only the slides you changed
```

It serves the deck on `127.0.0.1` and runs headless Chrome at 1920×1080 on `#/<id>` (step 0) and `#/<id>/<k-1>` (step k), with a virtual time budget so transitions finish. Look at each PNG for text over text, labels over lines, titles that wrap into the stage, anything past the right edge, and steps that look identical. A contact sheet of all shots makes a full pass quick. Keep `shots/` gitignored.

## Privacy

Talks often show data that cannot leave the team: customer records, tracking data, video, internal metrics. Keep it in a gitignored folder, serve only on `127.0.0.1`, and never put it into a public URL, an artifact, a gist, a shared doc or a commit. Before publishing any preview, check that its slides use no such data, and ask the user first. Pictures drawn from illustrative positions, as in the template, are safe to share; frames from real data are not.

## Prose

Slide text, notes, `README.md` and any write-up go through the humanizer skill. On slides the target is short noun phrases and plain verbs; in notes it is how the speaker talks. Keep the user's own wording where they gave it, and translate only when asked.
