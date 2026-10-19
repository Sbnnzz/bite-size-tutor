# Bite-Size Tutor

A tap-through study app for lecture slides: short bursts of material, real images (Wikimedia Commons) and quick exercises (multiple choice, fill the gap, true/false, match pairs, order the steps).

An AI (e.g. a Gemini skill) writes only the lesson content as a small `DATA` object. The design and logic load from this repository:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Sbnnzz/bite-size-tutor@1/engine.css">
<script>const DATA = { lang: "en", chapter: "...", units: [ ... ] };</script>
<script src="https://cdn.jsdelivr.net/gh/Sbnnzz/bite-size-tutor@1/engine.js"></script>
```

- `engine.css`, `engine.js`: the app
- `lesson-shell.html`: the page an AI fills in
- `data-example.js`: an example `DATA` object showing every exercise type

Images are loaded live from Wikimedia Commons with author and license credit.
