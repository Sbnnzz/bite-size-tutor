# Lingua Franca

One design language for study and presentation pages: a tiny Duolingo-style UI kit plus a Claude Code plugin that uses it. Write a `DATA` object, pick a **mode**, load `bite.js`. Done.

## Claude Code plugin

```text
/plugin install lingua-franca --marketplace Sbnnzz/lingua-franca
```

| Command | Makes |
|---|---|
| `/lingua-franca:lesson` | material + image + one exercise per screen, from your slides |
| `/lingua-franca:quiz` | quiz, flashcards or a timed sprint |
| `/lingua-franca:ppt` | a click-through slide deck / pitch deck, print to PDF |
| `/lingua-franca:make` | anything else: poster, flyer, cheat sheet, learn-by-texting, custom pages |

You can also just ask ("make a quiz from this PDF") and Claude picks the right skill.

**Standalone skill** (one `/lingua-franca` skill for claude.ai, the Claude desktop chat, Gemini, or `~/.claude/skills/` without the plugin): run `powershell -File standalone\build.ps1` and upload `dist\lingua-franca.zip`. It is built from `standalone/SKILL.md`, `DESIGN.md` and `llms.txt`, so it stays in sync with the kit. The look is defined in [`DESIGN.md`](DESIGN.md); the data formats in [`llms.txt`](llms.txt).

No build step, no framework, no server: one HTML file works in a browser, in Gemini Canvas, in a Claude artifact, or offline from disk.

```html
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My lesson</title></head>
<body>
<script>
const DATA = { mode: "lesson", lang: "en", chapter: "Ch1 · Anemia", units: [ /* ... */ ] };
</script>
<script src="https://cdn.jsdelivr.net/gh/Sbnnzz/lingua-franca@2/bite.js"></script>
</body></html>
```

## Modes

| Mode | What it is | Demo |
|---|---|---|
| `lesson` | Material + real image on the left, one exercise on the right, CHECK, feedback bar, recap every 5 | `demo/lesson.html` |
| `quiz` | One exercise per screen without material, untimed, missed ones come back | `demo/quiz.html` |
| `deck` | Click-through slides: you write free HTML per slide with kit components; navigation, progress, keys and print-to-PDF are built in | `demo/deck.html` |
| `chat` | Learn by texting: bubbles with a typing indicator, Back / Why? / Example / Simpler / Next, quizzes in the thread | `demo/chat.html` |
| `cards` | Flip flashcards, Again / Got it, missed cards come back | `demo/cards.html` |
| `sprint` | Timed rapid-fire, the progress bar is the clock | `demo/sprint.html` |
| `sheet` | One-page cheat sheet, print or save as PDF, copy as text | `demo/sheet.html` |

`demo/index.html` links them all; `demo/components.html` shows every building block live.
Every mode has light/dark (follows the device, remembered), keyboard shortcuts, phone layout, and English/Indonesian labels (`lang: "en" | "id"`).

The full `DATA` schema for each mode is in [`llms.txt`](llms.txt). It is written for AI assistants, but it is the clearest reference for people too.

## Shared building blocks

- **Text:** wrap key terms in `**double asterisks**`, the kit highlights them.
- **Real images:** `img: "spherocytes blood smear"` searches Wikimedia Commons at runtime and shows a free-licensed photo with author/license credit, tap-to-zoom and an "Other image" button. Main subject first, then the image kind.
- **Material blocks** (lesson, sheet): `text`, `points`, `flow`, `table`.
- **Exercises** (lesson, chat, sprint): `mcq` (default), `gap`, `tf`, `match`, `order`, each with optional `hint` and `why`.

## Building a new mode

```
bite.js          loader: reads DATA.mode, loads kit/kit.css, kit/kit.js, modes/<mode>.js, calls Kit.run(DATA)
kit/kit.css      design tokens (light + dark) and every component
kit/kit.js       Kit.* helpers: shell, view, footer, btn, feedback, material, pic, session, ex, rows, endScreen, store, theme, t
modes/*.js       each mode: Kit.mode("name", { start(data) { ... } })
```

A mode is one small file. The smallest useful one:

```js
(() => {
  Kit.mode("hello", {
    start(data) {
      Kit.view(`<div class="center"><h1 class="big">${Kit.esc(data.chapter)}</h1>${Kit.pic(data.img)}</div>`, { single: true });
      Kit.footer(`<span></span>${Kit.btn("Done", { act: "hello-done", id: "go" })}`);
      Kit.on("hello-done", () => Kit.feedback({ ok: true, title: "Nice!", why: "That was a **mode**." }));
    }
  });
})();
```

Save it as `modes/hello.js` and use `mode: "hello"`. Use `data-act` + `Kit.on` for clicks (no inline handlers), `Kit.t` / `Kit.addText` for labels, and `Kit.session` + `Kit.ex` if the mode asks questions.

## Versions

- `@2` → this kit (`bite.js`). Recommended.
- `@1` → the original single-mode `engine.js` / `engine.css`, kept frozen at tag `v1.0.1` so existing lesson pages keep working.

To ship a change: commit, tag `v2.x.y`, push, then purge `https://purge.jsdelivr.net/gh/Sbnnzz/lingua-franca@2/<file>` for each changed file.

Images come from Wikimedia Commons under their own licenses; the credit shown under each image links to its source page. Icons: Lucide (ISC). Font: Nunito (OFL).
