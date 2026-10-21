---
name: lesson
description: Turn lecture slides, a PDF, notes or a topic into a Duolingo-style lesson page — a short piece of material with a real image on the left and one quick exercise on the right, unit by unit. Use when the user wants to study or learn material step by step, especially from their own slides ("teach me this deck", "make a lesson from this PDF", "belajar dari slide ini").
---

# Lingua Franca · lesson

Build one HTML page in `mode: "lesson"` of the Lingua Franca kit. You write only the `DATA` object; the kit renders everything.

## Steps
1. **Get the material.** Read the files the user gave (PDF: read directly; PPTX: extract the slide text, e.g. with python-pptx or the pptx skill). No file → use the topic or notes they wrote.
2. **Ask once, only if unclear:** language (English / Indonesian) and which chapter or how many minutes. Defaults: the user's language, first chapter, 6–12 units.
3. **Triage.** Rank content by how likely it is to be tested: definitions, classifications, mechanisms, distinguishing features, "most common" facts, key numbers on the slides. Skip intros, history, outlines. One unit = one fact or concept.
4. **Write DATA** following the `mode: "lesson"` and "Exercises" sections of `../../llms.txt` (read it before writing). Mix exercise types: about a third should be gap, tf, match or order. For match/order the material must not show the same pairs or sequence.
5. **Check before saving:** every `answer` index exists in `options`; gap prompts contain `___`; tf answers are booleans; every unit has `slide` when the source has slides; no invented numbers, URLs, emojis or citation markers.
6. **Save** as `<topic>-lesson.html` next to the source file (or in the current folder) using the page template in `../../llms.txt` (script tag: `https://cdn.jsdelivr.net/gh/Sbnnzz/lingua-franca@2/bite.js`).
7. **Open it** for the user (browser preview if available) and say in one line what it covers and what was skipped.

## After the lesson
If the user pastes a `RESULT …` line, build a short review lesson: the missed concepts first, with new exercises (not the same questions), then 2–3 related units.

Larger decks: one page per chapter. Offer the next chapter when one is done.
