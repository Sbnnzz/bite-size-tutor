---
name: quiz
description: Make a Duolingo-style quiz page from slides, a PDF, notes or a topic — multiple choice, fill the gap, true/false, match pairs and order the steps, one question per screen, with hints, explanations, retries and a score. Also flashcards and timed sprints. Use when the user asks to be quizzed or tested ("quiz me on this", "buat soal dari PDF ini", "flashcards", "rapid fire before my exam").
---

# Lingua Franca · quiz

Build one HTML page with the Lingua Franca kit. You write only the `DATA` object.

## Pick the mode
| User wants | Mode |
|---|---|
| A normal quiz (default) | `quiz`: untimed, one question per screen, CHECK, feedback, missed ones come back |
| Flashcards, memorize terms | `cards`: flip cards, Again / Got it |
| Fast review right before an exam | `sprint`: timed rapid-fire (default 60 s) |

## Steps
1. **Get the material** (files, notes or topic). PDF: read directly; PPTX: extract the slide text.
2. **Ask once, only if unclear:** language and how many questions. Defaults: the user's language, 10 questions (quiz), 15 cards, 20 sprint questions.
3. **Pick what to test:** the highest-yield facts and the traps students confuse (similar names, opposite findings).
4. **Write DATA** following `../../llms.txt` ("Exercises" plus the section for the chosen mode; read it first).
   - quiz: mix all five types; prompts should make the student think (consequence, mini case, "Which is NOT…").
   - cards: front = cue or question ≤ 15 words, back = answer with the key term in `**bold**`.
   - sprint: short prompts, mostly mcq / tf / gap.
   - Every question has `why`; add `hint` for quiz questions.
5. **Check before saving:** answer indexes exist, gap prompts contain `___`, tf answers are booleans, 4 options for mcq/gap, no invented numbers, emojis or citation markers.
6. **Save** as `<topic>-<mode>.html` next to the source (or in the current folder) with the page template from `../../llms.txt`.
7. **Open it** for the user and say in one line what it covers.

If the user pastes a `RESULT …` line, make a follow-up quiz focused on what they missed, with new wording.
