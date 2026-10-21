/* Bite-Size Kit · mode "chat": learn by texting. Short bubbles with a typing indicator, one beat at a time,
 * with Back / Why? / Example / Simpler / Next buttons and optional quick quizzes inside the thread.
 * DATA: { mode: "chat", lang, chapter, beats: [{ title, bubbles: [..], slide?, img?, why?, example?, simpler?, q? }] }
 */
(() => {
const { $, $$, esc, md, ic } = Kit;
Kit.addText("en", { why: "Why?", example: "Example", simpler: "Simpler", whyK: "Why", exK: "Example", simpK: "Simpler", beats: "beats", chatDone: "All caught up!", quizLbl: "Quiz", beatsLbl: "Beats", chatKeys: "N next · B back · W why · E example · S simpler", checkAns: "Check" });
Kit.addText("id", { why: "Kenapa?", example: "Contoh", simpler: "Lebih simpel", whyK: "Kenapa", exK: "Contoh", simpK: "Lebih simpel", beats: "bagian", chatDone: "Selesai!", quizLbl: "Kuis", beatsLbl: "Bagian", chatKeys: "N lanjut · B kembali · W kenapa · E contoh · S simpel", checkAns: "Cek" });
let D, B, S, idx = -1, busy = false, mode = "intro";
const blocks = [], used = {}, answered = new Set();
const thread = () => $("#thread");
const scroll = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

function start(data) { D = data; B = data.beats || []; Kit.keys(key); intro(); }

function intro() {
  mode = "intro";
  S = Kit.session(B.map((_, i) => i).filter(i => B[i].q));
  Kit.progress(0); Kit.status("");
  Kit.view(`<div class="center"><div class="hero"><div class="ic" style="background:#1cb0f6;box-shadow:0 6px 0 #1899d6">${ic("message-circle")}</div><div class="bubble">${esc(D.chapter || "")}</div></div><p class="meta">${ic("list")} ${B.length} ${esc(Kit.t("beats"))}</p><p class="keys">${esc(Kit.t("chatKeys"))}</p></div>`, { single: true });
  Kit.footer(`<span></span>${Kit.btn(Kit.t("start"), { act: "chat-next", id: "go" })}`);
}

async function say(block, html, cls = "bot") {
  const typing = document.createElement("div");
  typing.className = "msg bot typing"; typing.innerHTML = "<i></i><i></i><i></i>";
  block.appendChild(typing); scroll();
  await Kit.sleep(280 + Math.min(String(html).length * 5, 650));
  typing.remove();
  const m = document.createElement("div");
  m.className = "msg " + cls; m.innerHTML = html;
  block.appendChild(m); Kit.paint(); scroll();
  return m;
}

function bar() {
  const b = B[idx] || {}, u = used[idx] || new Set(), quizOpen = b.q && !answered.has(idx);
  const extra = (k, label) => Kit.btn(label, { act: "chat-extra", tone: "white sm", data: { k }, disabled: busy || !b[k] || u.has(k) });
  Kit.footer(`<div class="toolbar">${Kit.btn(Kit.t("back"), { act: "chat-back", tone: "white sm", icon: "arrow-left", disabled: busy || idx <= 0 })}${extra("why", Kit.t("why"))}${extra("example", Kit.t("example"))}${extra("simpler", Kit.t("simpler"))}</div>${Kit.btn(idx >= B.length - 1 ? Kit.t("cont") : Kit.t("next"), { act: "chat-next", id: "go", iconAfter: "arrow-right", disabled: busy || quizOpen })}`);
  Kit.progress((idx + 1) / B.length, { streak: S.streak });
  Kit.status(`${ic("message-circle")} ${idx + 1}/${B.length}`);
}

async function beat(i) {
  if (busy) return;
  busy = true; idx = i; mode = "beat";
  if (!thread()) Kit.view(`<div class="thread" id="thread"></div>`, { single: true });
  const b = B[i], block = document.createElement("div");
  block.className = "thread"; blocks.push(block); thread().appendChild(block);
  block.insertAdjacentHTML("beforeend", `<div class="beat-div">${i + 1}/${B.length} · ${esc(b.title || "")}${b.slide ? ` · ${esc(b.slide)}` : ""}</div>`);
  bar();
  if (b.img) await say(block, Kit.pic(b.img), "bot pic");
  for (const t of b.bubbles || []) await say(block, md(t));
  if (b.q && !answered.has(i)) {
    Kit.ex.onReady = on => { const c = block.querySelector("[data-act=chat-check]"); if (c) c.disabled = !on; };
    Kit.ex.onDone = (ok, slips) => graded(block, i, ok, slips);
    const t = Kit.qtype(b.q), needsCheck = t === "order";
    await say(block, `<span class="k">${esc(Kit.t("inst")[t])}</span>${Kit.ex.render(b.q, { instant: true })}${needsCheck ? `<div style="margin-top:12px">${Kit.btn(Kit.t("checkAns"), { act: "chat-check", tone: "sm", disabled: true })}</div>` : ""}`, "bot quiz");
  }
  busy = false; bar();
}

async function graded(block, i, ok, slips) {
  answered.add(i);
  S.pos = S.queue.indexOf(i);
  if (S.pos >= 0) S.grade(ok, { slips, retry: false });
  const q = B[i].q, isMatch = Kit.qtype(q) === "match";
  const head = ok ? esc(slips ? Kit.t("almost", slips) : Kit.pickOne(Kit.t("praise"))) : (isMatch ? esc(Kit.t("mism", slips)) : `${esc(Kit.t("wrong"))}: ${Kit.ex.solution(q)}.`);
  busy = true; bar();
  await say(block, `<b>${head}</b>${q.why ? ` ${md(q.why)}` : ""}`, "bot " + (ok ? "ok" : "bad"));
  busy = false; bar();
}

async function extra(k) {
  const u = used[idx] || (used[idx] = new Set());
  if (busy || u.has(k) || !B[idx][k]) return;
  u.add(k); busy = true; bar();
  const label = { why: "whyK", example: "exK", simpler: "simpK" }[k];
  await say(blocks[blocks.length - 1], `<span class="k">${esc(Kit.t(label))}</span>${md(B[idx][k])}`, "bot extra");
  busy = false; bar();
}

function back() {
  if (busy || idx <= 0) return;
  blocks.pop().remove(); idx--;
  bar(); scroll();
}

function next() {
  if (busy) return;
  if (mode === "intro" || mode === "end") { reset(); return beat(0); }
  if (B[idx].q && !answered.has(idx)) return;
  if (idx >= B.length - 1) return end();
  beat(idx + 1);
}

function reset() { blocks.length = 0; answered.clear(); Object.keys(used).forEach(k => delete used[k]); idx = -1; S = Kit.session(B.map((_, i) => i).filter(i => B[i].q)); Kit.view(`<div class="thread" id="thread"></div>`, { single: true }); }

function end() {
  mode = "end";
  const quizzes = S.R.length, miss = S.missedIds();
  Kit.endScreen({
    title: Kit.t("chatDone"),
    stats: [{ label: Kit.t("beatsLbl"), value: String(B.length), icon: "message-circle", color: "#1cb0f6" }, ...(quizzes ? [{ label: Kit.t("quizLbl"), value: `${S.score}/${quizzes}`, icon: "star", color: "#ffc800" }, { label: Kit.t("best"), value: String(S.best), icon: "flame", color: "#ff9600" }] : [])],
    rows: B.map((b, i) => ({ title: b.title, text: (b.bubbles || [])[0] || "", meta: b.slide, miss: S.missed.has(i) })),
    missed: 0,
    result: `RESULT chat ${Kit.plain(D.chapter || "")}: ${B.length} beats${quizzes ? ` · quiz ${S.score}/${quizzes}` : ""} · missed: ${miss.map(i => Kit.plain(B[i].title)).join("; ") || "none"}`
  });
}

function key(e) {
  const k = e.key.toLowerCase();
  if (mode === "beat" && B[idx] && B[idx].q && !answered.has(idx) && Kit.ex.key(e)) return true;
  if (mode !== "beat") return false;
  if (k === "n" || e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); const g = $("#go"); if (g && !g.disabled) next(); return true; }
  if (k === "b" || e.key === "ArrowLeft") { back(); return true; }
  if (k === "w") { extra("why"); return true; }
  if (k === "e") { extra("example"); return true; }
  if (k === "s") { extra("simpler"); return true; }
  return false;
}

Kit.on({ "chat-next": () => next(), "chat-back": () => back(), "chat-extra": el => extra(el.dataset.k), "chat-check": () => Kit.ex.check(), restart: () => { reset(); beat(0); } });
Kit.mode("chat", { start });
})();
