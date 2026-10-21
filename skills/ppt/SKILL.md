---
name: ppt
description: Build a clean, Duolingo-style click-through slide deck (presentation, pitch deck, class presentation, seminar talk) as one HTML page with navigation, progress bar, keyboard controls and print-to-PDF. Use when the user wants a presentation, PPT, slides or a pitch deck in the Lingua Franca style ("make slides from this", "bikin PPT", "pitch deck for investors").
---

# Lingua Franca · ppt

Build a `mode: "deck"` page. The kit handles navigation, progress, Back / Continue, arrow keys and printing; **you design each slide freely** with the kit's components.

## Steps
1. **Read** `../../DESIGN.md` first. It lists every component (labels, stat tiles, comparison bars, tables, stage cards, value rows, answered-question slides) and the deck rules.
2. **Understand the goal:** audience (lecturer, investors, classmates), length (minutes or slide count), language. Ask once if it is unclear; default 8–12 slides.
3. **Outline first.** Write the story as one sentence per slide, each a takeaway ("Fund the pilot first, scale only after students stay."). Typical arc: title → problem → why it matters → solution / key idea → evidence or numbers → how it works → risks or limits → the ask / conclusion → sources.
4. **Build each slide** as `{ html: "<div class=\"screen\">…</div>" }`: 1 label → 1 headline → 1 visual → optional `.note`. Use an `answered` slide for questions the audience will ask. Interactive parts (calculator, chart) go in a slide with `init` and a function defined in your own `<script>` before `bite.js`.
5. **Numbers:** only from the user's material or reliable sources; label assumptions as assumptions; finish with a Sources slide when you used any.
6. **Save** as `<topic>-deck.html` (template: `../../llms.txt`, with `mode: "deck"`) and **open it** for the user. Mention that P (or the browser's print) saves every slide to PDF.

Do not copy another brand's look; stay within the Lingua Franca tokens and components. If the user explicitly needs an editable `.pptx` file, say so and use a pptx tool instead; this skill makes web decks.
