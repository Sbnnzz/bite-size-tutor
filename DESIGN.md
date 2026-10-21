# Lingua Franca · design language

Everything made with Lingua Franca should look like it belongs to one family: clean, friendly, lots of white space, Duolingo-style "pressable" shapes, one idea per screen. Use this guide when you build **freely** (decks, posters, flyers, one-off pages). For quizzes and lessons, use the modes instead (see `llms.txt`).

## Load the kit

Free page (poster, flyer, any custom layout):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Sbnnzz/lingua-franca@2/kit/kit.css">
<script src="https://cdn.jsdelivr.net/gh/Sbnnzz/lingua-franca@2/kit/kit.js"></script>
<script>Kit.theme.set("light"); Kit.paint();</script>   <!-- at the end of <body>: draws icons and loads images -->
```
Deck (slides with navigation, progress, keys, print-to-PDF): use `mode: "deck"` with `bite.js` and put free HTML in each slide (see "Decks").

## Tokens (CSS variables, light and dark built in)
| Token | Use |
|---|---|
| `--bg` `--hover` `--line` | page, subtle fills, all borders (2px) |
| `--text` `--strong` `--muted` | body text, headings, captions |
| `--green` / `--green-d` | primary action, good, money in |
| `--red` / `--red-d` | wrong, risk, money out |
| `--blue` `--purple` `--orange` `--gold` | accents: info, key terms, warnings, highlights |
| `--okbg` `--badbg` `--selbg` | soft fills behind good / bad / selected |

Font: Nunito 600–900 (loaded by the kit). Icons: Lucide, written as `<i data-lucide="name"></i>`.

## Components (class names)
| Need | Markup |
|---|---|
| Section label | `<span class="label money"><span class="dot"><i data-lucide="coins"></i></span>The ask</span>` · tones: `money` (green), `warn` (orange), `quest` (purple), `info` (blue), `new`, `prev` |
| Headline + lead | `<h2>…</h2><p class="lead">…</p>` inside `<div class="screen">` |
| Key term | `<mark>term</mark>` (dotted purple underline) |
| Card | `<div class="bubble">…</div>` (lists inside get blue square bullets) |
| Stat tiles | `<div class="stats"><div class="stat" style="--c:#58cc02"><div class="h">Label</div><div class="v big">$20k</div><div class="d">one-line meaning</div></div>…</div>` |
| Comparison bars | `<div class="hbars"><div class="hb"><div class="top"><span>Label</span><span>value</span></div><div class="trk"><i style="width:55%;--c:#58cc02"></i></div><div class="sub">note</div></div></div>` |
| Table | plain `<table>`; `td.pos` green, `td.neg` red |
| Rows with a value | `<div class="rows"><div class="row val"><div><b>Risk</b><span>detail</span></div><em>−$1k</em></div></div>` (`em.pos` for green) |
| Stages / timeline | `<div class="stagecard"><div class="t"><b>Stage 1</b><em>$20k</em></div><p>…</p><div class="gate">Gate: …</div></div>` |
| Choices | `<div class="choices"><div class="choice ok"><kbd>1</kbd><span>…</span></div></div>` · states `sel ok bad dim` · `.choices.two` for two big buttons |
| Statement | `<div class="statement">…</div>` |
| Chips | `<span class="chip"><i data-lucide="timer"></i> 60s</span>` |
| Buttons | `<button class="btn">Go</button>` · `.red` `.white` `.sm` `.ghost` |
| Hero | `<div class="hero"><div class="ic"><i data-lucide="zap"></i></div><div><p class="meta">Kicker</p><h1>Title</h1></div></div>` |
| Big icon tile | `<div class="bigicon" style="--c:#ff9600"><i data-lucide="timer"></i></div>` |
| Real photo | `Kit.pic("spherocytes blood smear")` → Wikimedia image with credit and zoom |
| Layout helpers | `.grid2` `.grid3` (stack on phones), `.center`, `.note` (small grey source line), `.meta` (small caps kicker) |

`demo/components.html` renders all of these live.

## Decks (`mode: "deck"`)
```js
const DATA = { mode: "deck", lang: "en", title: "…", slides: [
  { cta: "Start", html: `<div class="screen">…hero…</div>` },
  { html: `<div class="screen">…label, h2, stats…</div>` },
  { answered: { label: "Common question", kind: "tf", prompt: "…", options: ["True", "False"], answer: 1, take: "…" } },
  { init: "myChart", html: `…` }          // runs window.myChart() after the slide renders
]};
```
Slide rules:
- **One message per slide.** The `h2` is the takeaway as a full sentence ("Fund the pilot first, scale only after students stay."), not a topic ("Funding").
- 1 label → 1 headline → 1 visual (stats, bars, table, stages, rows) → optional `.note` with sources/assumptions.
- 3 stat tiles max per row; numbers big, meaning in `.d`.
- Use an `answered` slide for the questions your audience will ask; it shows the answer in the green bar.
- Put sources and assumptions in `.note` lines and on a final "Sources" slide. Never invent numbers.
- Interactive bits (sliders, charts) go in a slide with `init`; define the function in your own `<script>` before `bite.js`.
- Arrows / Enter move, P prints every slide to PDF (one slide per page).

## Posters, flyers, social posts
```html
<body class="canvas-page">
  <div class="canvas a4"> … </div>          <!-- a4 · a3 · wide (1920×1080) · square (1080) · story (1080×1920) -->
</body>
```
Inside: `.kicker` → `.display` headline → one visual block (stats, hero icon, photo) → 3 short points → a clear call to action (`.btn` or a big line) → small `.note` at the bottom. Leave at least a quarter of the canvas empty. Print to PDF from the browser, or screenshot for PNG.

## Writing rules (all outputs)
- Short: one idea per screen, headline ≤ 12 words, bullets ≤ 10 words.
- Concrete numbers with units; label assumptions as assumptions.
- Plain words first, technical term in `<mark>`.
- No emojis; use Lucide icons.
- Match the user's language (English or Indonesian), keep technical terms standard.
