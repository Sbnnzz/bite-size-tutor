/* Bite-Size Tutor engine. Load AFTER a <script> that defines: const DATA = { lang, chapter, units: [...] } */
document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&display=swap">');
document.body.insertAdjacentHTML("afterbegin", `<header>
  <button class="iconbtn" id="theme" onclick="toggleTheme()" title="Light / dark"></button>
  <div class="bar" id="bar"><i style="width:0"></i></div>
  <span class="flame" id="flame"></span>
</header>
<main id="app"></main>
<footer id="foot"><div class="in" id="footin"></div></footer>
<div class="lb" id="lb" onclick="this.classList.remove('show')"></div>`);
(() => { const s = document.createElement("script"); s.src = "https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"; s.onload = () => paintIcons(); document.head.appendChild(s); })();

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<mark>$1</mark>");
const plain = s => String(s ?? "").replace(/\*\*/g, "");
const ic = n => `<i data-lucide="${n}"></i>`;
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const T = DATA.lang === "id"
  ? { start: "Mulai", units: "unit", min: "menit", check: "Cek", cont: "Lanjut", hint: "Petunjuk", newc: "Konsep baru", prev: "Kesalahan sebelumnya", inRow: n => `${n} BERUNTUN`, inst: { mcq: "Pilih jawaban yang benar", gap: "Isi bagian kosong", tf: "Benar atau salah?", match: "Pasangkan yang cocok", order: "Urutkan langkahnya" }, tru: "Benar", fals: "Salah", praise: ["Mantap!", "Keren!", "Tepat sekali!", "Hebat!"], sol: "Jawaban yang benar:", retry: "Soal ini diulang di akhir.", recap: "Rekap singkat", done: "Pelajaran selesai!", score: "Skor", acc: "Akurasi", best: "Beruntun", copy: "Salin hasil", copied: "Tersalin!", again: "Ulangi yang salah", restart: "Ulangi semua", paste: "Tempel hasil ini ke chat, lalu ketik next", other: "Gambar lain", oneOut: "Satu pilihan salah sudah disingkirkan.", almost: n => `Hampir sempurna! ${n} kali salah`, mism: n => `${n} kali salah pasang`, keys: "1–9 memilih · H petunjuk · Enter cek/lanjut" }
  : { start: "Start", units: "units", min: "min", check: "Check", cont: "Continue", hint: "Hint", newc: "New concept", prev: "Previous mistake", inRow: n => `${n} IN A ROW`, inst: { mcq: "Select the correct answer", gap: "Fill in the blank", tf: "True or false?", match: "Tap the matching pairs", order: "Put the steps in order" }, tru: "True", fals: "False", praise: ["Awesome!", "Nice!", "Great job!", "Excellent!"], sol: "Correct solution:", retry: "This one comes back at the end.", recap: "Quick recap", done: "Lesson complete!", score: "Score", acc: "Accuracy", best: "Best streak", copy: "Copy result", copied: "Copied!", again: "Retry missed", restart: "Start over", paste: "Paste this result into the chat, then type next", other: "Other image", oneOut: "One wrong option has been removed.", almost: n => `Almost! ${n} slip`, mism: n => `${n} mismatches`, keys: "1–9 to pick · H for hint · Enter to check/continue" };
const U = DATA.units;
let R = U.map((_, i) => i), queue = [...R], pos = -1, streak = 0, best = 0, score = 0, mode = "intro", hinted = false, sel = null, view = {};
const seen = new Set(), missed = new Set(), retried = new Set(), pics = {}, picP = {};
let sinceRecap = [];

/* theme */
function setTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem("bst-theme", t); } catch (e) {} $("#theme").innerHTML = ic(t === "dark" ? "sun" : "moon"); paint(); }
function toggleTheme() { setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"); }

/* real images from Wikimedia Commons (free licenses, credit shown) */
function findPics(term) { return picP[term] || (picP[term] = searchPics(term)); }
async function searchPics(term) {
  pics[term] = { list: [], i: 0 };
  try {
    const url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json&origin=*&gsrsearch=" + encodeURIComponent(term + " filetype:bitmap");
    const r = await fetch(url).then(r => r.json());
    const words = term.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const hits = r.query ? Object.values(r.query.pages).sort((a, b) => a.index - b.index) : [];
    pics[term].list = hits.map(p => {
      const ii = p.imageinfo[0], m = ii.extmetadata || {}, t = p.title.toLowerCase();
      const artist = new DOMParser().parseFromString(m.Artist?.value || "", "text/html").body.textContent.trim();
      return { subject: !words[0] || t.includes(words[0].slice(0, 6)), score: words.filter(w => t.includes(w)).length, src: ii.thumburl || ii.url, page: ii.descriptionurl, credit: [artist, m.LicenseShortName?.value].filter(Boolean).join(" · ") || "Wikimedia Commons" };
    }).filter(p => p.subject).sort((a, b) => b.score - a.score);
  } catch (e) {}
  return pics[term];
}
function credit(s, p) { return `<div class="credit"><a href="${esc(p.page)}" target="_blank">${esc(p.credit)}</a>${s.list.length > 1 ? ` · <a href="#" onclick="nextPic(this);return false">${T.other}</a>` : ""}</div>`; }
function showPic(el) {
  const s = pics[el.dataset.q], p = s && s.list[s.i];
  if (!p) { el.closest(".imgcard").remove(); return; }
  el.innerHTML = `<img src="${esc(p.src)}" alt="" onclick="zoom(this)" onerror="nextPic(this)"><span class="zoomhint">${ic("zoom-in")}</span>${credit(s, p)}`;
  paintIcons();
}
function nextPic(from) {
  const el = from.closest(".pic"), s = pics[el.dataset.q];
  s.i++;
  if (s.i >= s.list.length) s.i = from.tagName === "IMG" ? s.list.length : 0;
  showPic(el);
}
function zoom(img) { const el = img.closest(".pic"), s = pics[el.dataset.q], p = s.list[s.i]; $("#lb").innerHTML = `<img src="${esc(p.src)}" alt="">${credit({ list: [] }, p)}`; $("#lb").classList.add("show"); }
async function loadPics() {
  for (const el of $$(".pic[data-q]")) { if (el.querySelector("img")) continue; await findPics(el.dataset.q); if (el.isConnected && !el.querySelector("img")) showPic(el); }
}
function paintIcons() { if (window.lucide) lucide.createIcons(); }
function paint() { paintIcons(); loadPics(); }

/* chrome */
function chrome() {
  const b = $("#bar");
  b.classList.toggle("hot", streak >= 3);
  b.innerHTML = `<i style="width:${seen.size / R.length * 100}%"></i>${streak >= 3 ? `<span class="inrow">${T.inRow(streak)}</span>` : ""}`;
  $("#flame").className = "flame" + (streak ? " hot" : "");
  $("#flame").innerHTML = `${ic("flame")} ${streak}`;
}
function screen(html, single) { $("#app").className = single ? "single" : ""; $("#app").innerHTML = html; window.scrollTo(0, 0); }
function foot(html, cls) { $("#foot").className = cls || ""; $("#footin").innerHTML = html; chrome(); paint(); }

/* material: any of text, points, flow, table. **word** = key term */
function material(u) {
  let h = "";
  if (u.text) h += `<p>${md(u.text)}</p>`;
  if (u.points) h += `<ul>${u.points.map(p => `<li><span>${md(p)}</span></li>`).join("")}</ul>`;
  if (u.flow) h += `<div class="chain">${u.flow.map(s => `<span class="st">${md(s)}</span>`).join(`<span class="ar">${ic("arrow-right")}</span>`)}</div>`;
  if (u.table) h += `<table><tr>${u.table.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr>${u.table.rows.map(r => `<tr>${r.map(c => `<td>${md(c)}</td>`).join("")}</tr>`).join("")}</table>`;
  return h;
}
const qtype = q => q.type || "mcq";

/* screens */
function intro() {
  mode = "intro";
  screen(`<div class="center"><div class="hero"><div class="ic">${ic("book-open")}</div><div class="bubble">${esc(DATA.chapter)}</div></div><p class="meta">${ic("layers")} ${U.length} ${T.units} · ~${Math.max(2, Math.round(U.length * 0.6))} ${T.min}</p><p class="keys">${T.keys}</p></div>`, true);
  foot(`<span></span><button class="btn" id="go" onclick="advance()">${T.start}</button>`);
}
function unit() {
  mode = "unit"; hinted = false; sel = null; view = {};
  const idx = queue[pos], u = U[idx], q = u.q, t = qtype(q);
  const label = seen.has(idx) ? `<span class="label prev"><span class="dot">${ic("repeat")}</span>${T.prev}</span>` : `<span class="label new"><span class="dot">${ic("sparkles")}</span>${T.newc}</span>`;
  let body = "";
  if (t === "mcq") body = `${q.prompt ? `<p class="prompt">${esc(q.prompt)}</p>` : ""}<div class="choices">${q.options.map((o, i) => `<button class="choice" onclick="pick(${i})"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join("")}</div>`;
  if (t === "tf") body = `<div class="statement">${md(q.prompt)}</div><div class="choices two"><button class="choice" onclick="pick(0)">${ic("check")} ${T.tru}</button><button class="choice" onclick="pick(1)">${ic("x")} ${T.fals}</button></div>`;
  if (t === "gap") body = `<p class="sentence">${q.prompt.split("___").map(md).join(`<span class="gap" id="gap" onclick="ungap()"></span>`)}</p><div class="tiles">${q.options.map((o, i) => `<button class="tile" onclick="pickGap(${i})">${esc(o)}</button>`).join("")}</div>`;
  if (t === "order") { view.bank = shuffle(q.steps.map((_, i) => i)); sel = []; body = `${q.prompt ? `<p class="prompt">${esc(q.prompt)}</p>` : ""}<div class="line" id="line"></div><div class="tiles">${view.bank.map((s, k) => `<button class="tile" data-k="${k}" onclick="pickOrder(${k})">${esc(q.steps[s])}</button>`).join("")}</div>`; }
  if (t === "match") { view.L = shuffle(q.pairs.map((_, i) => i)); view.R = shuffle(q.pairs.map((_, i) => i)); view.a = null; view.b = null; view.done = new Set(); view.mist = 0; body = `${q.prompt ? `<p class="prompt">${esc(q.prompt)}</p>` : ""}<div class="pairs"><div class="col">${view.L.map((p, k) => `<button class="tile" data-side="a" data-k="${k}" onclick="pickMatch('a',${k})">${esc(q.pairs[p][0])}</button>`).join("")}</div><div class="col">${view.R.map((p, k) => `<button class="tile" data-side="b" data-k="${k}" onclick="pickMatch('b',${k})">${esc(q.pairs[p][1])}</button>`).join("")}</div></div>`; }
  screen(`<section class="learn">${u.img ? `<figure class="imgcard"><div class="pic" data-q="${esc(u.img)}"></div></figure>` : ""}<div class="bubble"><span class="tag">${ic("file-text")} ${esc(u.slide)}</span><h2>${esc(u.title)}</h2>${material(u)}</div></section>` +
    `<section class="ask">${label}<h1 class="inst">${T.inst[t]}</h1>${body}<div id="hintslot"></div></section>`);
  foot(`<div class="left"><button class="btn white" id="hintbtn" onclick="hint()">${ic("lightbulb")} ${T.hint}</button></div>${t === "match" ? `<span class="keys">${T.keys}</span>` : `<button class="btn" id="check" disabled onclick="check()">${T.check}</button>`}`);
}
function ready(on) { const c = $("#check"); if (c) c.disabled = !on; }
function pick(i) { if (mode !== "unit") return; sel = i; $$(".choice").forEach((b, j) => b.classList.toggle("sel", j === i)); ready(true); }
function pickGap(i) {
  if (mode !== "unit" || $$(".tile")[i].disabled) return;
  sel = i; $$(".tile").forEach((b, j) => b.classList.toggle("ghost", j === i));
  const g = $("#gap"); g.className = "gap filled"; g.textContent = U[queue[pos]].q.options[i]; ready(true);
}
function ungap() { if (mode !== "unit" || sel == null) return; sel = null; $("#gap").className = "gap"; $("#gap").textContent = ""; $$(".tile").forEach(b => b.classList.remove("ghost")); ready(false); }
function pickOrder(k) {
  if (mode !== "unit" || sel.includes(k)) return;
  sel.push(k); drawOrder();
}
function unorder(n) { if (mode !== "unit") return; sel.splice(n, 1); drawOrder(); }
function drawOrder() {
  const q = U[queue[pos]].q;
  $("#line").innerHTML = sel.map((k, n) => `<button class="tile" onclick="unorder(${n})"><span class="n">${n + 1}</span>${esc(q.steps[view.bank[k]])}</button>`).join("");
  $$(".tiles .tile").forEach(b => b.classList.toggle("ghost", sel.includes(+b.dataset.k)));
  ready(sel.length === q.steps.length);
}
function pickMatch(side, k) {
  if (mode !== "unit") return;
  const btn = $(`.tile[data-side="${side}"][data-k="${k}"]`);
  if (btn.classList.contains("done")) return;
  view[side] = k; $$(`.tile[data-side="${side}"]`).forEach(b => b.classList.toggle("sel", +b.dataset.k === k));
  if (view.a == null || view.b == null) return;
  const A = $(`.tile[data-side="a"][data-k="${view.a}"]`), B = $(`.tile[data-side="b"][data-k="${view.b}"]`);
  if (view.L[view.a] === view.R[view.b]) {
    view.done.add(view.L[view.a]);
    [A, B].forEach(x => { x.classList.remove("sel"); x.classList.add("ok"); setTimeout(() => { x.classList.remove("ok"); x.classList.add("done"); x.disabled = true; }, 350); });
  } else {
    view.mist++;
    [A, B].forEach(x => { x.classList.remove("sel"); x.classList.add("bad"); setTimeout(() => x.classList.remove("bad"), 450); });
  }
  view.a = view.b = null;
  if (view.done.size === U[queue[pos]].q.pairs.length) setTimeout(() => grade(view.mist <= 1, view.mist), 450);
}
function hint() {
  if (mode !== "unit" || hinted) return;
  hinted = true;
  const q = U[queue[pos]].q, t = qtype(q);
  if (t === "mcq" || t === "gap") {
    const opts = $$(t === "mcq" ? ".choice" : ".tiles .tile"), wrong = opts.map((_, j) => j).filter(j => j !== q.answer && j !== sel);
    const out = wrong[Math.floor(Math.random() * wrong.length)]; opts[out].disabled = true; opts[out].classList.add("dim");
  }
  $("#hintslot").innerHTML = `<div class="hintbar">${ic("lightbulb")}<span>${q.hint ? md(q.hint) : T.oneOut}</span></div>`;
  $("#hintbtn").disabled = true; paintIcons();
}
function check() {
  if (mode !== "unit") return;
  const q = U[queue[pos]].q, t = qtype(q);
  if (t === "mcq") grade(sel === q.answer);
  if (t === "tf") grade((sel === 0) === !!q.answer);
  if (t === "gap") grade(sel === q.answer);
  if (t === "order") grade(sel.every((k, n) => view.bank[k] === n));
}
function solution(q) {
  const t = qtype(q);
  if (t === "mcq" || t === "gap") return esc(q.options[q.answer]);
  if (t === "tf") return q.answer ? T.tru : T.fals;
  if (t === "order") return q.steps.map(esc).join(" → ");
  if (t === "match") return q.pairs.map(p => `${esc(p[0])} = ${esc(p[1])}`).join(" · ");
}
function grade(ok, slips = 0) {
  mode = "checked";
  const idx = queue[pos], u = U[idx], q = u.q, t = qtype(q);
  if (!seen.has(idx)) { seen.add(idx); sinceRecap.push(idx); if (ok) score++; }
  let note = "";
  if (ok) { if (!hinted && !slips) { streak++; best = Math.max(best, streak); } }
  else { streak = 0; missed.add(idx); if (!retried.has(idx)) { retried.add(idx); queue.push(idx); note = `<small>${ic("rotate-ccw")} ${T.retry}</small>`; } }
  $$(".ask button").forEach(b => b.disabled = true);
  if (t === "mcq" || t === "tf") { const right = t === "tf" ? (q.answer ? 0 : 1) : q.answer; $$(".choice").forEach((b, j) => { b.classList.remove("sel", "dim"); b.classList.add(j === right ? "ok" : j === sel ? "bad" : "dim"); }); }
  if (t === "gap") { const g = $("#gap"); g.className = "gap filled " + (ok ? "ok" : "bad"); }
  if (t === "order") $$("#line .tile").forEach((b, n) => b.classList.add(view.bank[sel[n]] === n ? "ok" : "bad"));
  const isMatch = t === "match";
  const title = ok ? (slips ? T.almost(slips) : T.praise[Math.floor(Math.random() * T.praise.length)]) : (isMatch ? T.mism(slips) : T.sol);
  foot(`<div class="fb"><span class="ficon">${ic(ok ? "check" : "x")}</span><div><b>${title}</b>${ok || isMatch ? "" : `<p class="sol">${solution(q)}</p>`}<p>${md(q.why)}</p>${note}</div></div><button class="btn ${ok ? "" : "red"}" id="go" onclick="advance()">${T.cont}</button>`, ok ? "ok" : "bad");
}
function advance() {
  if (mode === "checked" && sinceRecap.length >= 5 && pos < queue.length - 1) { const list = sinceRecap; sinceRecap = []; return recap(list); }
  pos++;
  if (pos >= queue.length) return end();
  unit();
}
function rows(list) {
  return `<div class="rows">${list.map(i => `<div class="row ${missed.has(i) ? "miss" : ""}"><span class="s">${ic(missed.has(i) ? "x" : "check")}</span><div><b>${esc(U[i].title)}</b><span>${md(U[i].q.why)}</span></div><em>${esc(U[i].slide)}</em></div>`).join("")}</div>`;
}
function recap(list) {
  mode = "recap";
  screen(`<div class="center"><p class="meta">${ic("brain")} ${T.recap}</p>${rows(list)}</div>`, true);
  foot(`<span></span><button class="btn" id="go" onclick="advance()">${T.cont}</button>`);
}
function end() {
  mode = "end";
  const miss = R.filter(i => missed.has(i));
  const result = `RESULT ${DATA.chapter}: ${score}/${R.length}${R.length < U.length ? " (retry round)" : ""} · missed: ${miss.map(i => plain(U[i].title)).join("; ") || "none"}`;
  screen(`<div class="center"><h1 class="big">${T.done}</h1><div class="stats"><div class="stat" style="--c:#ffc800"><div class="h">${T.score}</div><div class="v">${ic("star")} ${score}/${R.length}</div></div><div class="stat" style="--c:#58cc02"><div class="h">${T.acc}</div><div class="v">${ic("target")} ${Math.round(score / R.length * 100)}%</div></div><div class="stat" style="--c:#ff9600"><div class="h">${T.best}</div><div class="v">${ic("flame")} ${best}</div></div></div>${rows(R)}<p class="keys">${T.paste}</p><textarea id="res" readonly>${esc(result)}</textarea></div>`, true);
  foot(`<div class="left">${miss.length ? `<button class="btn white" onclick="play([${miss}])">${ic("rotate-ccw")} ${T.again} (${miss.length})</button>` : ""}<button class="btn white" onclick="play(U.map((_, i) => i))">${ic("refresh-cw")} ${T.restart}</button></div><button class="btn" id="go" onclick="copyRes(this)">${ic("copy")} ${T.copy}</button>`);
}
function play(list) {
  R = list; queue = [...list]; pos = -1; streak = 0; score = 0; sinceRecap = [];
  seen.clear(); missed.clear(); retried.clear(); mode = "start"; advance();
}
function copyRes(btn) {
  const t = $("#res"); t.select();
  const done = () => { btn.textContent = T.copied; };
  if (navigator.clipboard) navigator.clipboard.writeText(t.value).then(done, () => { document.execCommand("copy"); done(); });
  else { document.execCommand("copy"); done(); }
}
document.addEventListener("keydown", e => {
  if ($("#lb").classList.contains("show")) { if (e.key === "Escape" || e.key === "Enter") $("#lb").classList.remove("show"); return; }
  if (mode === "unit") {
    const q = U[queue[pos]].q, t = qtype(q), d = +e.key;
    if (d >= 1 && d <= 9) {
      if (t === "mcq" || t === "tf") { const b = $$(".choice")[d - 1]; if (b && !b.disabled) pick(d - 1); }
      if (t === "gap") { const b = $$(".tiles .tile")[d - 1]; if (b && !b.disabled) pickGap(d - 1); }
      if (t === "order" && d <= q.steps.length) pickOrder(d - 1);
    }
    if (e.key === "Backspace") { if (t === "order" && sel.length) unorder(sel.length - 1); if (t === "gap") ungap(); }
    if (e.key.toLowerCase() === "h") hint();
    if (e.key === "Enter") { const c = $("#check"); if (c && !c.disabled) { e.preventDefault(); c.click(); } }
    return;
  }
  if (e.key === "Enter") { const b = $("#go"); if (b) { e.preventDefault(); b.click(); } }
});
let saved = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; try { saved = localStorage.getItem("bst-theme") || saved; } catch (e) {}
setTheme(saved);
intro();
