# One deck, slide by slide, and other talks with the same beats

Sections 1 to 6 walk through one long research talk (about 70 slides and 50 minutes, presenting a machine-learning model and what it can be used for), a question-led talk. It is one worked example, not a required structure. Section 7 shows the same beats in three other talks. Slide ids are examples; use your own.

## Contents

1. Introduction
2. Related work
3. Method
4. One results section per research question
5. Discussion and close
6. Lessons from the revision history
7. Same beats, other talks

## 1. Introduction (about 7 minutes)

- `title`: name, subtitle, people. 15 seconds.
- `titleparts`: the title read as three ideas, one picture per idea, one per click. A long academic title becomes a map of the talk. The last click says how the talk is ordered and names the one thread running through it.
- A first look at the data, live if possible: what one example actually looks like. Let the audience see the raw thing before any abstraction.
- How the data becomes model input, as an animation: points on the picture fly into a column, columns stack into a grid, one cell is called out and its features listed.
- `problem`: what people in the field actually ask, as three questions in speech bubbles; why it is hard (labels are rare, costly, made for one task); what the field does today (one model per task); what this work does instead. One picture per point.
- `idea`: the core idea in one picture, usually the workflow the work makes possible, drawn as data flowing through it to the tasks it serves.
- `rq`: the main question read as written in the thesis, then the research questions one per click, each phrased so a listener can hold it.
- `thesis`: the statement defended, in three parts, each lit on its own click.
- `contrib`: three core contributions in a row with the supporting studies underneath (see SKILL.md). The source deck first had six equal boxes; three core claims plus evidence read as an argument instead of a list.

## 2. Related work (about 4 minutes)

- A divider, then the families of prior methods as three lines, each with its citations as a muted sub-line. Mark where this work sits (its line in the method colour).
- The analogy slide: the idea told as a story with everyday roles, then the technical names written over the same picture on the last click. Keep the story true to the mechanism: if the method hides scattered pieces of the input, the picture should hide scattered pieces too, not one block.
- The canonical architecture of the closest prior method, with the analogy's roles named again in the notes ("the encoder, our learner"), and a last click: why it works, in three plain sentences.
- One schematic per building block the audience may not know (for example attention), comparing the options side by side.
- "Where this sits": one slide that places the work among the others.

## 3. Method (about 6 minutes)

- The backbone on a real example: the picture becomes tokens, the tokens go through the layers (popping in, then lit one by one), heads take turns, the output comes out, and what one token attended to is drawn back on the picture. Say in the notes that illustrative weights are illustrations.
- The training objective, as the prior method's diagram with this work's changes as numbered callouts, the rest dimmed (`data-off`).
- Each optional ingredient on its own short slide.
- `control`: the control, introduced before any result as "the most important slide for reading everything that follows". Here it was the same network left untrained, read exactly like the trained one: whatever it reaches belongs to the architecture, what the trained model adds belongs to training.
- `reading`: how to read the results, three markers (architecture, training, limit), each with the reason it happens. Every result slide then carries one marker, and the discussion returns to all three.

## 4. A results section (4 to 9 minutes each)

- Divider with the research question.
- One slide per finding, each with its example first. Live examples (a real recording with the model's view beside it) work best when the claim is about something a viewer can see.
- Result slides: chart built in argument order, rounded numbers inline, verdict on the last click, reading marker in the kicker.
- When a control wins, give it its own slide and say why ("where the untrained copy wins"). It is part of the answer.
- The answer slide: three or four cards, each a small picture, a short heading and one sentence. Strength first, in the method colour; then the tie; then the caveat. The last note leads into the next question.

## 5. Discussion and close (about 4 minutes)

- What each part gives: a two-column ledger, architecture on one side and training on the other, one icon row per finding with its reason.
- "Where it stops paying": the conditions under which the method's advantage disappears, each with its reason, then a footer that lists what is still open, stated as open.
- Limitations as icon rows, each with the concrete consequence.
- Future work as a road of four milestones, each with a tiny picture of the use it enables.
- Conclusion: one line per research question, then the thesis in one sentence, then thanks.

## 6. Lessons from the revision history

These came from rounds of feedback on that deck and are the reason for most rules in SKILL.md.

- Numbers went from many, to none on the slide faces ("ahead", "tie", "behind"), to rounded numbers back on the faces with the spoken notes kept low on numbers. Pure words made the slides feel unsupported; full precision made them unreadable. Rounded values on the slide and comparisons in the voice is where it settled.
- Notes were rewritten from written prose into spoken English with connectors. A note that reads well on paper often sounds stiff aloud.
- The analogy moved onto its own slide, story first and names last. Mixing the two on one slide lost both.
- Schematics gained motion over time: the model slide went from a static picture to layers popping in sequence and heads taking turns, because each moving part maps to one sentence of the notes.
- Every claim on a slide was checked against the written work, and slides were changed where they had drifted (a claim that two curves tie "early on" was widened to "through most of the range" because that is what the chart shows).
- Open questions were moved onto the slides in the discussion instead of being left for the Q&A.
- Text sizes grew several times. If a slide needs smaller text to fit, it has too much text.
- Experiment codes leaked into slide text twice and were removed both times. Name things by what they test.

## 7. Same beats, other talks

### A findings readout (investigation shape, 15 minutes)

A data scientist found why a metric moved and has to tell the product team. The headline came from the material: "Most of the drop in retention comes from users who never finish setup in their first week."

- The question in the team's words: "Why did retention fall this quarter?" with the curve drawn in, last quarter in grey.
- One concrete user: a timeline of a single (anonymised, illustrative) user who signed up, stalled at one setup step and left. The audience now has a person to hold on to.
- What was suspected first (price, a release) and the check that ruled it out, one chart each. Showing the dead ends is what makes the ending believable.
- The finding: the drop split by "finished setup in week one" or not, the two groups built in one after another.
- The mechanism: the setup funnel drawn as boxes, with users flowing through and dropping at the step that changed.
- What it means and what to do: one recommendation, the expected size rounded ("about a third of the drop"), and what is still unknown.
- Notes say "most of", "about twice as likely", not the raw rates; the rates are on the slide.

### A project update (before and after, 10 minutes)

- Where things were: the old process as a diagram, the pain point marked.
- What was built: the new pipeline drawn as a schematic that animates one record through it, like the model slide's tokens.
- Where things are now: one chart against the old process, which is the reference point here.
- What it cost and what is left: limits and open items, stated plainly.
- The ask: the decision or help needed from the room, on its own slide.

### A model that got better step by step (incremental build-up, 12 minutes)

The work was a long run of small changes, and the talk retells them as a ladder. One chart stays on screen across several slides and gains one row per step.

- The task and how it is scored, with the score of doing nothing drawn in grey.
- Step 1, the simplest model that works at all: its dot appears on the chart, and the slide title says what it is ("a linear model on the raw features").
- Each next step, one per slide or one per click: name the single change in plain words ("add the week-one features", "train on all regions together"), show one concrete example of what the change fixes, then the new dot, with the gain written beside it, rounded ("about +0.03").
- Steps that did not help stay on the ladder, greyed, with one line on why. The audience then trusts that the steps that did help were tested the same way.
- The last step is the solution, in the method colour, with the full gap from the starting point written once.
- Close on which steps mattered most, so the audience leaves with two or three changes, not ten.
- In the deck, build the ladder with one `dotChart` whose rows carry `at: k`, so each click adds a row and the earlier ones stay visible for comparison.
