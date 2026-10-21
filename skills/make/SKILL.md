---
name: make
description: Make any page in the Lingua Franca design language — posters, flyers, social posts, cheat sheets, chat-style "learn by texting" pages, one-pagers, or a custom layout — using the Lingua Franca UI kit. Use when the user asks for a visual or interactive page in this style that is not a lesson, quiz or slide deck ("make a poster", "flyer for the seminar", "cheat sheet of this chapter", "teach me by texting").
---

# Lingua Franca · make

The general entry point. Pick the closest ready-made mode; if none fits, build freely with the kit's design language.

## Route the request
| Request | Use |
|---|---|
| Lesson with material + exercise | the `lesson` skill |
| Quiz, flashcards, timed sprint | the `quiz` skill |
| Presentation / pitch deck | the `ppt` skill |
| One-page cheat sheet / summary | `mode: "sheet"` (see `../../llms.txt`) |
| Learn by texting, step by step | `mode: "chat"` (see `../../llms.txt`) |
| Poster, flyer, social post, one-pager, anything else | free page (below) |

## Free pages
1. Read `../../DESIGN.md` (tokens, components, canvases, writing rules).
2. Load the kit (`kit.css` + `kit.js` from `https://cdn.jsdelivr.net/gh/Sbnnzz/lingua-franca@2/`), use `<body class="canvas-page">` with a `.canvas` of the right size (`a4`, `a3`, `wide`, `square`, `story`) for print and social formats.
3. Compose: kicker → display headline → one strong visual → 3 short points → clear call to action → small note. Leave white space.
4. Add your own CSS only for layout details the kit lacks; reuse the kit's variables (`var(--green)`, `var(--line)` …) so it stays on-brand and works in dark mode.
5. Save as `<topic>-<kind>.html`, open it for the user, and say how to export (print to PDF, or screenshot for PNG).

## Always
- Content from the user's material; no invented numbers; assumptions labeled.
- Real images only through `Kit.pic("search term")` or files the user provided.
- The user's language; no emojis.
