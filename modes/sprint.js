/* Bite-Size Kit · mode "sprint": timed rapid-fire. Tap to answer, it moves on by itself; the bar is the clock.
 * DATA: { mode: "sprint", lang, chapter, seconds?: 60, questions: [q] }   (q types: mcq, tf, gap work best)
 */
(() => {
const { $, esc, ic } = Kit;
Kit.addText("en", { sec: "s", questions: "questions", go: "Go!", skip: "Skip", timeUp: "Time's up!", allDone: "Sprint complete!", correct: "Correct", answered: "Answered", sprintKeys: "1–9 to answer · S to skip · be quick" });
Kit.addText("id", { sec: "dtk", questions: "soal", go: "Mulai!", skip: "Lewati", timeUp: "Waktu habis!", allDone: "Sprint selesai!", correct: "Benar", answered: "Dijawab", sprintKeys: "1–9 menjawab · S lewati · cepat!" });
let D, Q, S, total = 60, left = 60, timer = null, mode = "intro", answered = 0, endedByTime = false;

function start(data) { D = data; Q = data.questions || []; total = data.seconds || 60; Kit.keys(key); intro(); }

function intro() {
  mode = "intro"; Kit.progress(1, { time: true }); Kit.status("");
  Kit.view(`<div class="center"><div class="bigicon" style="--c:#ff9600">${ic("timer")}</div><h1 class="big" style="color:var(--strong)">${esc(D.chapter || "")}</h1><p class="meta">${ic("zap")} ${total} ${esc(Kit.t("sec"))} · ${Q.length} ${esc(Kit.t("questions"))}</p><p class="keys">${esc(Kit.t("sprintKeys"))}</p></div>`, { single: true });
  Kit.footer(`<span></span>${Kit.btn(Kit.t("go"), { act: "sprint-go", id: "go", icon: "zap" })}`);
}

function go(ids) {
  S = Kit.session(Kit.shuffle(ids)); answered = 0; left = total; endedByTime = false; mode = "run";
  clearInterval(timer);
  timer = setInterval(tick, 250);
  tick(); nextQ();
}

function tick() {
  left = Math.max(0, left - 0.25);
  Kit.progress(left / total, { time: true, low: left <= 10 });
  Kit.status(`${ic("timer")} ${Math.ceil(left)}${esc(Kit.t("sec"))} · ${ic("check")} ${S.score}`, left <= 10);
  if (left <= 0 && mode === "run") { endedByTime = true; Kit.ex.locked = true; end(); }
}

function nextQ() {
  if (mode !== "run") return;
  if (S.advance() == null) return end();
  const q = Q[S.id];
  Kit.ex.onReady = null;
  Kit.ex.onDone = ok => {
    answered++; S.grade(ok, { retry: false });
    $("#app").classList.add(ok ? "flash-ok" : "flash-bad");
    setTimeout(nextQ, ok ? 350 : 900);
  };
  Kit.view(`<div class="sprint ask"><h1 class="inst">${esc(Kit.t("inst")[Kit.qtype(q)])}</h1>${Kit.ex.render(q, { instant: true })}</div>`, { single: true });
  Kit.footer(`<span class="keys">${esc(Kit.t("sprintKeys"))}</span>${Kit.btn(Kit.t("skip"), { act: "sprint-skip", tone: "white", iconAfter: "skip-forward" })}`);
}

function skip() { if (mode !== "run" || Kit.ex.locked) return; Kit.ex.locked = true; answered++; S.grade(false, { retry: false }); nextQ(); }

function end() {
  if (mode === "end") return;
  mode = "end"; clearInterval(timer);
  const miss = S.missedIds();
  Kit.endScreen({
    title: endedByTime ? Kit.t("timeUp") : Kit.t("allDone"),
    stats: [{ label: Kit.t("correct"), value: String(S.score), icon: "star", color: "#ffc800" }, { label: Kit.t("answered"), value: `${answered}/${S.R.length}`, icon: "zap", color: "#1cb0f6" }, { label: Kit.t("acc"), value: `${Math.round(S.score / Math.max(1, answered) * 100)}%`, icon: "target", color: "#58cc02" }],
    rows: miss.map(i => ({ title: Kit.plain(Q[i].prompt || ""), text: `**${Kit.unhtml(Kit.ex.solution(Q[i]))}**${Q[i].why ? " · " + Q[i].why : ""}`, miss: true })),
    missed: miss.length,
    result: `RESULT sprint ${Kit.plain(D.chapter || "")}: ${S.score} correct of ${answered} answered in ${total}s · missed: ${miss.map(i => Kit.plain(Q[i].prompt || "").slice(0, 60)).join("; ") || "none"}`
  });
  Kit.progress(left / total, { time: true, low: left <= 10 });
}

function key(e) {
  if (mode === "run") { if (e.key.toLowerCase() === "s") { skip(); return true; } return Kit.ex.key(e); }
  return false;
}

Kit.on({ "sprint-go": () => go(Q.map((_, i) => i)), "sprint-skip": () => skip(), "retry-missed": () => go(S.missedIds()), restart: () => go(Q.map((_, i) => i)) });
Kit.mode("sprint", { start });
})();
