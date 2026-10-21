/* Bite-Size Kit · mode "cards": flip flashcards. "Again" sends the card to the back of the deck, "Got it" keeps the streak.
 * DATA: { mode: "cards", lang, chapter, cards: [{ front, back, img?, imgSide?: "front"|"back", slide?, hint? }] }
 */
(() => {
const { $, esc, md, ic } = Kit;
Kit.addText("en", { flip: "Flip", know: "Got it", againCard: "Again", flipKeys: "Space or tap to flip · 1 again · 2 got it", front: "Question", backSide: "Answer", cardsDone: "Deck complete!", firstTry: "Known first time", cards: "cards" });
Kit.addText("id", { flip: "Balik", know: "Sudah hafal", againCard: "Ulangi", flipKeys: "Spasi atau ketuk untuk membalik · 1 ulangi · 2 sudah hafal", front: "Pertanyaan", backSide: "Jawaban", cardsDone: "Kartu selesai!", firstTry: "Hafal di percobaan pertama", cards: "kartu" });
let D, C, S, mode = "intro";

function start(data) { D = data; C = data.cards || []; Kit.keys(key); intro(); }

function intro() {
  mode = "intro"; S = Kit.session(C.map((_, i) => i)); Kit.sync(S);
  Kit.view(`<div class="center"><div class="hero"><div class="ic" style="background:#ce82ff;box-shadow:0 6px 0 #a560d8">${ic("layers")}</div><div class="bubble">${esc(D.chapter || "")}</div></div><p class="meta">${ic("copy")} ${C.length} ${esc(Kit.t("cards"))}</p><p class="keys">${esc(Kit.t("flipKeys"))}</p></div>`, { single: true });
  Kit.footer(`<span></span>${Kit.btn(Kit.t("start"), { act: "next", id: "go" })}`);
}

function next() { if (S.advance() == null) return end(); card(); }

function face(c, side) {
  const img = c.img && (c.imgSide || "back") === side ? Kit.pic(c.img) : "";
  const txt = side === "front" ? c.front : c.back;
  return `<div class="face ${side}"><span class="side">${esc(Kit.t(side === "front" ? "front" : "backSide"))}${c.slide ? ` · ${esc(c.slide)}` : ""}</span>${img}<div class="cardtext">${md(txt)}</div>${side === "front" && c.hint ? `<span class="chip">${ic("lightbulb")} ${md(c.hint)}</span>` : ""}</div>`;
}

function card() {
  mode = "front";
  const c = C[S.id];
  Kit.view(`<div class="center">${S.isRepeat() ? Kit.tag("prev") : ""}<div class="flip" id="card" data-act="flip"><div class="inner">${face(c, "front")}${face(c, "back")}</div></div><p class="keys">${esc(Kit.t("flipKeys"))}</p></div>`, { single: true });
  Kit.footer(`<span></span>${Kit.btn(Kit.t("flip"), { act: "flip", id: "go", icon: "refresh-cw" })}`);
  Kit.sync(S);
}

function flip() {
  const el = $("#card"); if (!el) return;
  el.classList.toggle("on");
  if (mode === "front") {
    mode = "back";
    Kit.footer(`<div class="left">${Kit.btn(Kit.t("againCard"), { act: "again", tone: "white", icon: "rotate-ccw" })}</div>${Kit.btn(Kit.t("know"), { act: "know", id: "go", icon: "check" })}`);
  }
}

function rate(ok) { if (mode !== "back") return; mode = "rated"; S.grade(ok); Kit.sync(S); next(); }

const rowOf = i => ({ title: Kit.plain(C[i].front), text: C[i].back, meta: C[i].slide, miss: S.missed.has(i) });
function end() {
  mode = "end";
  const miss = S.missedIds();
  Kit.endScreen({
    title: Kit.t("cardsDone"),
    stats: [{ label: Kit.t("firstTry"), value: `${S.score}/${S.R.length}`, icon: "star", color: "#ffc800" }, { label: Kit.t("acc"), value: `${Math.round(S.score / Math.max(1, S.R.length) * 100)}%`, icon: "target", color: "#58cc02" }, { label: Kit.t("best"), value: String(S.best), icon: "flame", color: "#ff9600" }],
    rows: S.R.map(rowOf), missed: miss.length,
    result: `RESULT cards ${Kit.plain(D.chapter || "")}: ${S.score}/${S.R.length} known first time · again: ${miss.map(i => Kit.plain(C[i].front)).join("; ") || "none"}`
  });
  Kit.sync(S);
}

function play(ids) { S = Kit.session(ids); next(); }

function key(e) {
  if (e.key === " " && (mode === "front" || mode === "back")) { e.preventDefault(); flip(); return true; }
  if (mode === "back" && e.key === "1") { rate(false); return true; }
  if (mode === "back" && (e.key === "2" || e.key === "Enter")) { e.preventDefault(); rate(true); return true; }
  return false;
}

Kit.on({ next: () => next(), flip: (el, e) => { if (e.target.closest("[data-act=zoom],[data-act=otherpic],a")) return; flip(); }, again: () => rate(false), know: () => rate(true), "retry-missed": () => play(S.missedIds()), restart: () => play(C.map((_, i) => i)) });
Kit.mode("cards", { start });
})();
