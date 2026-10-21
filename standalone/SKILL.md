---
name: lingua-franca
description: Make study and presentation pages in the Lingua Franca design language (clean, Duolingo-style) from slides, PDFs, notes or a topic — lessons (material + image + one exercise per screen), quizzes, flashcards, timed sprints, slide decks / pitch decks, cheat sheets, learn-by-texting pages, posters and flyers. Use when the user says "lingua-franca", or asks to study, be quizzed, make flashcards, a PPT / presentation / pitch deck, a cheat sheet, a poster or flyer in this style ("quiz me on this PDF", "bikin PPT dari slide ini", "belajar dari materi ini").
---

# Lingua Franca

One design language for every page. The look and the interaction logic live in a hosted kit; you write content (a `DATA` object, or free HTML using the kit's components) and save one HTML file.

- `references/formats.md`: the page template and the exact `DATA` format of every mode. **Read the part for your mode before writing.**
- `references/DESIGN.md`: tokens, components, deck and poster rules. **Read it before any free-form page (deck, poster, flyer, custom).**

## 1. Route the request
The user may name a mode right after the skill name ("lingua-franca ppt …") or just describe what they want.

| Asked for | Build | Mode |
|---|---|---|
| `lesson`, "teach me", "study this step by step" | material + real image on the left, one exercise on the right | `lesson` |
| `quiz`, "quiz me", "buat soal" | one exercise per screen, untimed | `quiz` |
| "flashcards", memorize terms | flip cards, Again / Got it | `cards` |
| "rapid fire", "before my exam", timed | timed sprint | `sprint` |
| `ppt`, presentation, slides, pitch deck | click-through deck, print to PDF | `deck` |
| cheat sheet, summary page, one-pager of a chapter | two-column sheet | `sheet` |
| "teach me by texting", chat style | bubbles with Next / Back / Why / Example / Simpler | `chat` |
| poster, flyer, social post, anything else | free page on a `.canvas` | none (free page) |

If nothing is named and it is unclear, default to `lesson` for study material and `deck` for "presentation".

## 2. Shared steps
1. **Get the material.** Read the files given (PDF: read directly; PPTX: extract slide text, e.g. `python -c "from pptx import Presentation; …"` with python-pptx). No file → use the topic or notes in the chat.
2. **Ask at most one question**, only if something essential is missing: language (English / Indonesian), length (minutes, slide count, number of questions) or audience. Otherwise use defaults: the user's language; lesson 6–12 units; quiz 10 questions; cards 15; sprint 20 questions / 60 s; deck 8–12 slides.
3. **Triage.** Keep what matters most: for study, what is likely to be tested (definitions, classifications, mechanisms, distinguishing features, "most common" facts, key numbers on the slides, traps students confuse); for decks, the story and the evidence. Skip intros, history, outlines.
4. **Write** the content following `references/formats.md` (modes) or `references/DESIGN.md` (decks and free pages).
5. **Check before saving:**
   - every `answer` index exists in `options`; mcq/gap have exactly 4 options; gap prompts contain `___`; tf answers are booleans
   - match/order material does not show the same pairs or sequence
   - every unit, question or slide that comes from the user's slides has `slide`
   - no invented numbers, no image URLs (use `img` search terms), no emojis, no citation markers like [cite: 3]
6. **Save** one HTML file named `<topic>-<mode>.html` next to the source file (or in the current folder), using the page template from `references/formats.md` (script: `https://cdn.jsdelivr.net/gh/Sbnnzz/lingua-franca@2/bite.js`).
7. **Show it:** open it for the user if you can (browser preview), otherwise give the path. Say in one line what it covers and what was skipped. Decks: P (or browser print) saves every slide to PDF.

## 3. Mode notes
- **lesson / quiz:** mix exercise types (about a third gap, tf, match or order). Prompts should make the student think: a consequence, a mini case, or "Which is NOT…". Every question has `why`; add a `hint` that does not give the answer away.
- **cards:** front = cue or question ≤ 15 words; back = answer with the key term in `**bold**`.
- **sprint:** short prompts, mostly mcq / tf / gap.
- **deck:** outline first, one takeaway sentence per slide (the `h2` is the takeaway, not a topic). Each slide: 1 label → 1 headline → 1 visual (stat tiles, bars, table, stage cards, value rows) → optional `.note` with sources. Use `answered` slides for questions the audience will ask; interactive parts go in a slide with `init`. End with a Sources slide when you used numbers.
- **sheet:** high-yield first, 4–12 sections.
- **chat:** 1–3 short bubbles per beat, ≤ 60 words; `why` / `example` / `simpler` as optional extras; a quick `q` on about a third of beats.
- **free pages:** `<body class="canvas-page">` + `<div class="canvas a4|a3|wide|square|story">`; kicker → display headline → one strong visual → 3 short points → call to action → small note. Reuse the kit's CSS variables for any extra styling.

## 4. After the user studies
If the user pastes a `RESULT …` line, build a follow-up in the same mode: the missed concepts first, with new wording (not the same questions).

## Notes
- Pages load the kit from the internet (jsDelivr). They work in Claude Code, a browser, Gemini Canvas, or as a file sent to friends. In claude.ai Artifacts the kit's GitHub CDN path may be blocked; there, say so and save the file instead.
- If the user explicitly needs an editable .pptx, say this skill makes web decks and use a pptx tool instead.
- The user's language throughout; keep technical terms in their standard form.
