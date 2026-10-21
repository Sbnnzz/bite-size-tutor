/* Lingua Franca · mode "deck": a click-through presentation. The mode only does navigation, progress, keys,
 * Back / Continue and print-to-PDF. Each slide's content is free HTML written with kit classes (see DESIGN.md).
 * DATA: { mode: "deck", lang, title, slides: [
 *   { html: "<div class='screen'>…</div>", cta?: "Start", init?: "nameOfGlobalFunction" },
 *   { answered: { label?, kind?: "mc" | "tf", prompt, options: [..], answer, take } }   // a question shown already answered
 * ] }
 * `init` names a function you define in your own <script> before bite.js; it runs after that slide renders (charts, sliders…).
 */
(() => {
const { $, esc, md, ic } = Kit;
Kit.addText("en", { slide: "Slide", answer: "Answer", ask: "Common question", printPdf: "Print / PDF", deckKeys: "← → or Enter · P to print" });
Kit.addText("id", { slide: "Slide", answer: "Jawaban", ask: "Pertanyaan umum", printPdf: "Cetak / PDF", deckKeys: "← → atau Enter · P untuk cetak" });
let D, S = [], i = 0;

function answeredHtml(a) {
  const tf = a.kind === "tf" || (a.options || []).length === 2;
  const opts = a.options.map((o, k) => `<div class="choice ${k === a.answer ? "ok" : tf ? "bad" : "dim"}">${tf ? "" : `<kbd>${k + 1}</kbd>`}<span>${md(o)}</span></div>`).join("");
  return `<div class="screen"><span class="label quest"><span class="dot">${ic("circle-help")}</span>${esc(a.label || Kit.t("ask"))}</span>${tf ? `<div class="statement">${md(a.prompt)}</div>` : `<h2>${md(a.prompt)}</h2>`}<div class="choices ${tf ? "two" : ""}">${opts}</div></div>`;
}
const slideHtml = s => s.answered ? answeredHtml(s.answered) : (s.html || "");

function start(data) {
  D = data; S = data.slides || [];
  if (data.title) document.title = data.title;
  Kit.keys(key);
  document.body.insertAdjacentHTML("beforeend", `<div class="printall" id="printall"></div>`);
  window.addEventListener("beforeprint", fillPrint);
  render();
}

function render() {
  const s = S[i];
  Kit.view(`<div class="deck">${slideHtml(s)}</div>`, { single: true, cls: "deckpage" });
  Kit.progress(S.length > 1 ? i / (S.length - 1) : 1);
  Kit.status(`${esc(Kit.t("slide"))} ${i + 1} / ${S.length}`);
  const last = i === S.length - 1;
  const left = `<div class="left">${i > 0 ? Kit.btn(Kit.t("back"), { act: "deck-back", tone: "white", icon: "arrow-left" }) : ""}${s.answered ? `<div class="fb"><span class="ficon">${ic("check")}</span><div><b>${esc(Kit.t("answer"))}: ${md(s.answered.options[s.answered.answer])}</b><p>${md(s.answered.take || "")}</p></div></div>` : `<span class="keys">${esc(Kit.t("deckKeys"))}</span>`}</div>`;
  Kit.footer(`${left}${Kit.btn(s.cta || (last ? Kit.t("restart") : Kit.t("cont")), { act: "deck-next", id: "go", iconAfter: last ? "rotate-ccw" : "arrow-right" })}`, s.answered ? "ok" : "");
  if (s.init && typeof window[s.init] === "function") { try { window[s.init](); } catch (e) { console.error(e); } }
}

function go(n) { i = Math.max(0, Math.min(S.length - 1, n)); render(); }
function next() { go(i === S.length - 1 ? 0 : i + 1); }

function fillPrint() {
  $("#printall").innerHTML = S.map(s => `<section class="pslide">${slideHtml(s)}${s.answered ? `<p class="note"><b>${esc(Kit.t("answer"))}: ${md(s.answered.options[s.answered.answer])}.</b> ${md(s.answered.take || "")}</p>` : ""}</section>`).join("");
  Kit.paint();
}

function key(e) {
  if (e.target && e.target.type === "range") return false;
  if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); next(); return true; }
  if (e.key === "ArrowLeft" || e.key === "PageUp") { go(i - 1); return true; }
  if (e.key === "Home") { go(0); return true; }
  if (e.key === "End") { go(S.length - 1); return true; }
  if (e.key.toLowerCase() === "p") { fillPrint(); setTimeout(() => window.print(), 300); return true; }
  return false;
}

Kit.on({ "deck-next": () => next(), "deck-back": () => go(i - 1) });
Kit.mode("deck", { start });
})();
