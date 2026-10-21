/* Bite-Size Kit · mode "lesson": material + image on the left, one exercise on the right, CHECK, feedback bar.
 * DATA: { mode: "lesson", lang, chapter, units: [{ title, slide, img?, text?|points?|flow?|table?, q }] }
 */
(() => {
const { $, esc, ic } = Kit;
let D, U, S, mode = "intro";
const rowOf = i => ({ title: U[i].title, text: U[i].q.why, meta: U[i].slide, miss: S.missed.has(i) });

function start(data) { D = data; U = data.units || []; Kit.keys(key); intro(); }

function intro() {
  mode = "intro"; S = Kit.session(U.map((_, i) => i)); Kit.sync(S);
  Kit.view(`<div class="center"><div class="hero"><div class="ic">${ic("book-open")}</div><div class="bubble">${esc(D.chapter || "")}</div></div><p class="meta">${ic("layers")} ${U.length} ${esc(Kit.t("units"))} · ~${Math.max(2, Math.round(U.length * 0.6))} ${esc(Kit.t("min"))}</p><p class="keys">${esc(Kit.t("keys"))}</p></div>`, { single: true });
  Kit.footer(`<span></span>${Kit.btn(Kit.t("start"), { act: "next", id: "go" })}`);
}

function next() {
  const list = mode === "checked" ? S.takeRecap(5) : null;
  if (list) return recap(list);
  if (S.advance() == null) return end();
  unit();
}

function unit() {
  mode = "unit";
  const u = U[S.id], q = u.q, t = Kit.qtype(q);
  Kit.ex.onReady = on => { const c = $("#check"); if (c) c.disabled = !on; };
  Kit.ex.onDone = checked;
  const body = Kit.ex.render(q);
  Kit.view(`<section class="learn">${Kit.pic(u.img)}<div class="bubble"><span class="tag">${ic("file-text")} ${esc(u.slide || "")}</span><h2>${esc(u.title)}</h2>${Kit.material(u)}</div></section>` +
    `<section class="ask">${Kit.tag(S.isRepeat() ? "prev" : "new")}<h1 class="inst">${esc(Kit.t("inst")[t])}</h1>${body}</section>`);
  Kit.footer(`<div class="left">${Kit.btn(Kit.t("hint"), { act: "hint", tone: "white", icon: "lightbulb", id: "hintbtn" })}</div>${t === "match" ? `<span class="keys">${esc(Kit.t("keys"))}</span>` : Kit.btn(Kit.t("check"), { act: "check", id: "check", disabled: true })}`);
  Kit.sync(S);
}

function checked(ok, slips) {
  mode = "checked";
  const q = U[S.id].q, isMatch = Kit.qtype(q) === "match";
  const { requeued } = S.grade(ok, { hinted: Kit.ex.hinted, slips });
  const title = ok ? (slips ? Kit.t("almost", slips) : Kit.pickOne(Kit.t("praise"))) : (isMatch ? Kit.t("mism", slips) : Kit.t("sol"));
  Kit.feedback({ ok, title, solution: ok || isMatch ? "" : Kit.ex.solution(q), why: q.why, note: requeued ? `${ic("rotate-ccw")} ${esc(Kit.t("retry"))}` : "" });
  Kit.sync(S);
}

function recap(list) {
  mode = "recap";
  Kit.view(`<div class="center"><p class="meta">${ic("brain")} ${esc(Kit.t("recap"))}</p>${Kit.rows(list.map(rowOf))}</div>`, { single: true });
  Kit.footer(`<span></span>${Kit.btn(Kit.t("cont"), { act: "next", id: "go" })}`);
}

function end() {
  mode = "end";
  const miss = S.missedIds();
  Kit.endScreen({
    stats: Kit.scoreStats(S), rows: S.R.map(rowOf), missed: miss.length,
    result: `RESULT ${Kit.plain(D.chapter || "")}: ${S.score}/${S.R.length}${S.R.length < U.length ? " (retry round)" : ""} · missed: ${miss.map(i => Kit.plain(U[i].title)).join("; ") || "none"}`
  });
  Kit.sync(S);
}

function play(ids) { S = Kit.session(ids); mode = "start"; next(); }

function key(e) {
  if (mode !== "unit") return false;
  if (Kit.ex.key(e)) return true;
  if (e.key === "Enter") { const c = $("#check"); if (c && !c.disabled) { e.preventDefault(); c.click(); } return true; }
  return false;
}

Kit.on({ next: () => next(), check: () => Kit.ex.check(), hint: () => Kit.ex.hint(), "retry-missed": () => play(S.missedIds()), restart: () => play(U.map((_, i) => i)) });
Kit.mode("lesson", { start });
})();
