/* Bite-Size Kit v2 · loader
 * Put this AFTER a <script> that defines `const DATA = { mode, lang, ... }`.
 * It loads kit/kit.css, kit/kit.js and modes/<mode>.js from the same place this file came from, then runs the mode.
 */
(() => {
  const me = document.currentScript;
  const base = me ? me.src.replace(/bite\.js(\?.*)?$/, "") : "./";
  let data;
  try { data = DATA; } catch (e) { data = window.DATA; }
  if (!data) { document.body.insertAdjacentHTML("beforeend", '<p style="font:16px system-ui;padding:24px">Bite-Size Kit: no DATA found. Define <code>const DATA = {...}</code> before bite.js.</p>'); return; }
  const mode = String(data.mode || "lesson").replace(/[^a-z0-9-]/gi, "");
  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = base + "kit/kit.css"; document.head.appendChild(css);
  const load = src => new Promise((ok, fail) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => fail(new Error(src)); document.head.appendChild(s); });
  load(base + "kit/kit.js")
    .then(() => load(base + "modes/" + mode + ".js"))
    .then(() => Kit.run(data))
    .catch(err => document.body.insertAdjacentHTML("beforeend", `<p style="font:16px system-ui;padding:24px">Bite-Size Kit could not load <b>${mode}</b> (${err.message}). Check your connection or the mode name.</p>`));
})();
