/* Bite-Size Kit v2 · core
 * Shared building blocks for every mode: text helpers, i18n, theme, page shell,
 * buttons/feedback, real images (Wikimedia Commons), session scoring, the 5 exercise
 * types, end screen, storage. Modes register with Kit.mode(name, { start(data) }).
 */
(() => {
"use strict";
const Kit = window.Kit = { version: "2.0.0" };

/* ---------- text helpers ---------- */
const $ = Kit.$ = (s, r = document) => r.querySelector(s);
const $$ = Kit.$$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = Kit.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const md = Kit.md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<mark>$1</mark>");
Kit.plain = s => String(s ?? "").replace(/\*\*/g, "");
Kit.unhtml = h => new DOMParser().parseFromString(String(h ?? ""), "text/html").body.textContent;
Kit.shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
Kit.pickOne = a => a[Math.floor(Math.random() * a.length)];
Kit.sleep = ms => new Promise(r => setTimeout(r, ms));
const ic = Kit.ic = n => `<i data-lucide="${esc(n)}"></i>`;

/* ---------- i18n ---------- */
const TEXT = {
  en: { start: "Start", next: "Next", back: "Back", check: "Check", cont: "Continue", hint: "Hint", newc: "New concept", prev: "Previous mistake", inRow: n => `${n} IN A ROW`, praise: ["Awesome!", "Nice!", "Great job!", "Excellent!"], sol: "Correct solution:", wrong: "Not quite", retry: "This one comes back at the end.", almost: n => `Almost! ${n} slip`, mism: n => `${n} mismatches`, oneOut: "One wrong option has been removed.", tru: "True", fals: "False",
    inst: { mcq: "Select the correct answer", gap: "Fill in the blank", tf: "True or false?", match: "Tap the matching pairs", order: "Put the steps in order" },
    recap: "Quick recap", done: "Lesson complete!", score: "Score", acc: "Accuracy", best: "Best streak", copy: "Copy result", copied: "Copied!", again: "Retry missed", restart: "Start over", paste: "Paste this result into the chat, then type next", other: "Other image", units: "units", min: "min",
    keys: "1–9 to pick · H for hint · Enter to check/continue", loadFail: "Could not load this mode. Check your connection." },
  id: { start: "Mulai", next: "Lanjut", back: "Kembali", check: "Cek", cont: "Lanjut", hint: "Petunjuk", newc: "Konsep baru", prev: "Kesalahan sebelumnya", inRow: n => `${n} BERUNTUN`, praise: ["Mantap!", "Keren!", "Tepat sekali!", "Hebat!"], sol: "Jawaban yang benar:", wrong: "Belum tepat", retry: "Soal ini diulang di akhir.", almost: n => `Hampir sempurna! ${n} kali salah`, mism: n => `${n} kali salah pasang`, oneOut: "Satu pilihan salah sudah disingkirkan.", tru: "Benar", fals: "Salah",
    inst: { mcq: "Pilih jawaban yang benar", gap: "Isi bagian kosong", tf: "Benar atau salah?", match: "Pasangkan yang cocok", order: "Urutkan langkahnya" },
    recap: "Rekap singkat", done: "Pelajaran selesai!", score: "Skor", acc: "Akurasi", best: "Beruntun", copy: "Salin hasil", copied: "Tersalin!", again: "Ulangi yang salah", restart: "Ulangi semua", paste: "Tempel hasil ini ke chat, lalu ketik next", other: "Gambar lain", units: "unit", min: "menit",
    keys: "1–9 memilih · H petunjuk · Enter cek/lanjut", loadFail: "Mode ini gagal dimuat. Periksa koneksi kamu." }
};
Kit.lang = "en";
Kit.t = (k, ...a) => { const d = TEXT[Kit.lang] || TEXT.en; const v = k in d ? d[k] : TEXT.en[k]; if (v === undefined) return k; return typeof v === "function" ? v(...a) : v; };
Kit.addText = (lang, dict) => { TEXT[lang] = Object.assign(TEXT[lang] || {}, dict); };

/* ---------- assets: font + icons ---------- */
document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&display=swap">');
const paintIcons = Kit.paintIcons = () => { if (window.lucide) window.lucide.createIcons(); };
(() => { const s = document.createElement("script"); s.src = "https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"; s.onload = paintIcons; document.head.appendChild(s); })();
Kit.paint = () => { paintIcons(); loadPics(); };

/* ---------- storage (never throws) ---------- */
Kit.store = {
  get(k, d = null) { try { const v = localStorage.getItem("bst:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { if (v == null) localStorage.removeItem("bst:" + k); else localStorage.setItem("bst:" + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- theme ---------- */
Kit.theme = {
  get: () => document.documentElement.dataset.theme || "light",
  set(t) { document.documentElement.dataset.theme = t; Kit.store.set("theme", t); const b = $("#theme"); if (b) b.innerHTML = ic(t === "dark" ? "sun" : "moon"); paintIcons(); },
  toggle() { this.set(this.get() === "dark" ? "light" : "dark"); },
  init() { this.set(Kit.store.get("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")); }
};

/* ---------- actions (event delegation) + keys ---------- */
const acts = {};
Kit.on = (name, fn) => { if (typeof name === "object") Object.assign(acts, name); else acts[name] = fn; };
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const fn = acts[el.dataset.act];
  if (fn) { if (el.tagName !== "A" || el.getAttribute("href") === "#") e.preventDefault(); fn(el, e); }
});
let keyFn = null;
Kit.keys = fn => { keyFn = fn; };
document.addEventListener("keydown", e => {
  if (e.target.matches && e.target.matches("input,textarea,select")) return;
  const lb = $("#lb");
  if (lb && lb.classList.contains("show")) { if (e.key === "Escape" || e.key === "Enter") lb.classList.remove("show"); return; }
  if (keyFn && keyFn(e) === true) return;
  if (e.key === "Enter") { const b = $("#go"); if (b && !b.disabled) { e.preventDefault(); b.click(); } }
});

/* ---------- page shell ---------- */
Kit.shell = () => {
  if ($("#app")) return;
  document.body.insertAdjacentHTML("afterbegin", `<header><button class="iconbtn" id="theme" data-act="theme" title="Light / dark"></button><div class="bar" id="bar"><i style="width:0"></i></div><span class="flame" id="flame"></span></header><main id="app"></main><footer id="foot"><div class="in" id="footin"></div></footer><div class="lb" id="lb" data-act="unzoom"></div>`);
};
Kit.progress = (frac, { streak = 0, low = false, time = false } = {}) => {
  const b = $("#bar"); if (!b) return;
  const hot = streak >= 3;
  b.classList.toggle("hot", hot && !low); b.classList.toggle("low", low); b.classList.toggle("time", time);
  b.innerHTML = `<i style="width:${Math.max(0, Math.min(1, frac)) * 100}%"></i>${hot && !time ? `<span class="inrow">${esc(Kit.t("inRow", streak))}</span>` : ""}`;
};
Kit.status = (html, hot = false) => { const f = $("#flame"); if (!f) return; f.className = "flame" + (hot ? " hot" : ""); f.innerHTML = html; paintIcons(); };
Kit.view = (html, { single = false, cls = "" } = {}) => { const a = $("#app"); a.className = [single ? "single" : "", cls].join(" ").trim(); a.innerHTML = html; window.scrollTo(0, 0); Kit.paint(); };
Kit.footer = (html, tone = "") => { $("#foot").className = tone; $("#footin").innerHTML = html; Kit.paint(); };
Kit.btn = (label, { act = "", tone = "", icon = "", iconAfter = "", id = "", disabled = false, data = {} } = {}) =>
  `<button class="btn ${tone}"${id ? ` id="${id}"` : ""}${act ? ` data-act="${act}"` : ""}${Object.entries(data).map(([k, v]) => ` data-${k}="${esc(v)}"`).join("")}${disabled ? " disabled" : ""}>${icon ? ic(icon) + " " : ""}${esc(label)}${iconAfter ? " " + ic(iconAfter) : ""}</button>`;
Kit.tag = kind => `<span class="label ${kind === "prev" ? "prev" : "new"}"><span class="dot">${ic(kind === "prev" ? "repeat" : "sparkles")}</span>${esc(Kit.t(kind === "prev" ? "prev" : "newc"))}</span>`;
Kit.feedback = ({ ok, title, solution = "", why = "", note = "", label = Kit.t("cont"), act = "next" }) =>
  Kit.footer(`<div class="fb"><span class="ficon">${ic(ok ? "check" : "x")}</span><div><b>${esc(title)}</b>${solution ? `<p class="sol">${solution}</p>` : ""}${why ? `<p>${md(why)}</p>` : ""}${note ? `<small>${note}</small>` : ""}</div></div>${Kit.btn(label, { act, tone: ok ? "" : "red", id: "go" })}`, ok ? "ok" : "bad");

/* ---------- material blocks: text, points, flow, table ---------- */
Kit.material = u => {
  let h = "";
  if (u.text) h += `<p>${md(u.text)}</p>`;
  if (u.points) h += `<ul>${u.points.map(p => `<li><span>${md(p)}</span></li>`).join("")}</ul>`;
  if (u.flow) h += `<div class="chain">${u.flow.map(s => `<span class="st">${md(s)}</span>`).join(`<span class="ar">${ic("arrow-right")}</span>`)}</div>`;
  if (u.table) h += `<table><tr>${u.table.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr>${u.table.rows.map(r => `<tr>${r.map(c => `<td>${md(c)}</td>`).join("")}</tr>`).join("")}</table>`;
  return h;
};

/* ---------- real images (Wikimedia Commons, free licenses, credit shown) ---------- */
const pics = {}, picP = {};
Kit.pic = term => term ? `<figure class="imgcard"><div class="pic" data-q="${esc(term)}"></div></figure>` : "";
const findPics = term => picP[term] || (picP[term] = searchPics(term));
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
const credit = (s, p, other) => `<div class="credit"><a href="${esc(p.page)}" target="_blank" rel="noopener">${esc(p.credit)}</a>${other && s.list.length > 1 ? ` · <a href="#" data-act="otherpic">${esc(Kit.t("other"))}</a>` : ""}</div>`;
function showPic(el) {
  const s = pics[el.dataset.q], p = s && s.list[s.i];
  if (!p) { (el.closest(".imgcard") || el).remove(); return; }
  el.innerHTML = `<img src="${esc(p.src)}" alt="" data-act="zoom" onerror="Kit._picFail(this)"><span class="zoomhint">${ic("zoom-in")}</span>${credit(s, p, true)}`;
  paintIcons();
}
function nextPic(from, failed) {
  const el = from.closest(".pic"), s = pics[el.dataset.q];
  s.i++;
  if (s.i >= s.list.length) s.i = failed ? s.list.length : 0;
  showPic(el);
}
Kit._picFail = img => nextPic(img, true);
function zoom(img) { const el = img.closest(".pic"), s = pics[el.dataset.q], p = s.list[s.i]; $("#lb").innerHTML = `<img src="${esc(p.src)}" alt="">${credit(s, p, false)}`; $("#lb").classList.add("show"); }
async function loadPics() {
  for (const el of $$(".pic[data-q]")) { if (el.querySelector("img")) continue; await findPics(el.dataset.q); if (el.isConnected && !el.querySelector("img")) showPic(el); }
}
Kit.on({ theme: () => Kit.theme.toggle(), zoom: el => zoom(el), otherpic: el => nextPic(el), unzoom: () => $("#lb").classList.remove("show") });

/* ---------- session: queue, scoring, streak, retry ---------- */
Kit.session = ids => ({
  R: [...ids], queue: [...ids], pos: -1, streak: 0, best: 0, score: 0,
  seen: new Set(), missed: new Set(), retried: new Set(), since: [],
  get id() { return this.queue[this.pos]; },
  advance() { this.pos++; return this.pos < this.queue.length ? this.id : null; },
  isRepeat(id = this.id) { return this.seen.has(id); },
  grade(ok, { hinted = false, slips = 0, retry = true } = {}) {
    const id = this.id, first = !this.seen.has(id);
    if (first) { this.seen.add(id); this.since.push(id); if (ok) this.score++; }
    let requeued = false;
    if (ok) { if (!hinted && !slips) { this.streak++; this.best = Math.max(this.best, this.streak); } }
    else { this.streak = 0; this.missed.add(id); if (retry && !this.retried.has(id)) { this.retried.add(id); this.queue.push(id); requeued = true; } }
    return { first, requeued };
  },
  frac() { return this.seen.size / this.R.length; },
  takeRecap(n) { if (this.since.length >= n && this.pos < this.queue.length - 1) { const l = this.since; this.since = []; return l; } return null; },
  missedIds() { return this.R.filter(i => this.missed.has(i)); }
});
Kit.sync = S => { Kit.progress(S.frac(), { streak: S.streak }); Kit.status(`${ic("flame")} ${S.streak}`, S.streak > 0); };

/* ---------- exercises: mcq, gap, tf, match, order ---------- */
const qtype = Kit.qtype = q => q.type || "mcq";
let uid = 0;
const EX = Kit.ex = { q: null, t: "", sel: null, v: {}, hinted: false, instant: false, locked: false, onDone: null, onReady: null, id: "" };
const root = () => document.getElementById(EX.id);
const inEx = s => { const r = root(); return r ? $(s, r) : null; };
const allEx = s => { const r = root(); return r ? $$(s, r) : []; };
EX.render = (q, { instant = false } = {}) => {
  Object.assign(EX, { q, t: qtype(q), sel: null, v: {}, hinted: false, instant, locked: false, id: "ex" + (++uid) });
  const t = EX.t;
  let h = "";
  if (t === "mcq") h = `${q.prompt ? `<p class="prompt">${md(q.prompt)}</p>` : ""}<div class="choices">${q.options.map((o, i) => `<button class="choice" data-act="ex-pick" data-i="${i}"><kbd>${i + 1}</kbd><span>${md(o)}</span></button>`).join("")}</div>`;
  if (t === "tf") h = `<div class="statement">${md(q.prompt)}</div><div class="choices two"><button class="choice" data-act="ex-pick" data-i="0">${ic("check")} ${esc(Kit.t("tru"))}</button><button class="choice" data-act="ex-pick" data-i="1">${ic("x")} ${esc(Kit.t("fals"))}</button></div>`;
  if (t === "gap") h = `<p class="sentence">${String(q.prompt).split("___").map(md).join(`<span class="gap" data-act="ex-ungap"></span>`)}</p><div class="tiles">${q.options.map((o, i) => `<button class="tile" data-act="ex-gap" data-i="${i}">${esc(o)}</button>`).join("")}</div>`;
  if (t === "order") {
    EX.v.bank = Kit.shuffle(q.steps.map((_, i) => i)); EX.sel = [];
    h = `${q.prompt ? `<p class="prompt">${md(q.prompt)}</p>` : ""}<div class="line"></div><div class="tiles">${EX.v.bank.map((s, k) => `<button class="tile" data-act="ex-order" data-i="${k}">${esc(q.steps[s])}</button>`).join("")}</div>`;
  }
  if (t === "match") {
    Object.assign(EX.v, { L: Kit.shuffle(q.pairs.map((_, i) => i)), R: Kit.shuffle(q.pairs.map((_, i) => i)), a: null, b: null, done: new Set(), mist: 0 });
    h = `${q.prompt ? `<p class="prompt">${md(q.prompt)}</p>` : ""}<div class="pairs"><div class="col">${EX.v.L.map((p, k) => `<button class="tile" data-act="ex-match" data-side="a" data-i="${k}">${esc(q.pairs[p][0])}</button>`).join("")}</div><div class="col">${EX.v.R.map((p, k) => `<button class="tile" data-act="ex-match" data-side="b" data-i="${k}">${esc(q.pairs[p][1])}</button>`).join("")}</div></div>`;
  }
  return `<div class="ex ex-${t}" id="${EX.id}">${h}<div class="hintslot"></div></div>`;
};
const ready = on => { if (EX.onReady) EX.onReady(on); };
EX.pick = i => {
  if (EX.locked) return;
  EX.sel = i; allEx(".choice").forEach((b, j) => b.classList.toggle("sel", j === i));
  if (EX.instant) EX.check(); else ready(true);
};
EX.gap = i => {
  if (EX.locked) return;
  const tiles = allEx(".tiles .tile"); if (!tiles[i] || tiles[i].disabled) return;
  EX.sel = i; tiles.forEach((b, j) => b.classList.toggle("ghost", j === i));
  const g = inEx(".gap"); g.className = "gap filled"; g.textContent = EX.q.options[i];
  if (EX.instant) EX.check(); else ready(true);
};
EX.ungap = () => {
  if (EX.locked || EX.sel == null || EX.t !== "gap") return;
  EX.sel = null; const g = inEx(".gap"); g.className = "gap"; g.textContent = "";
  allEx(".tiles .tile").forEach(b => b.classList.remove("ghost")); ready(false);
};
const drawOrder = () => {
  const q = EX.q;
  inEx(".line").innerHTML = EX.sel.map((k, n) => `<button class="tile" data-act="ex-unorder" data-i="${n}"><span class="n">${n + 1}</span>${esc(q.steps[EX.v.bank[k]])}</button>`).join("");
  allEx(".tiles .tile").forEach(b => b.classList.toggle("ghost", EX.sel.includes(+b.dataset.i)));
  ready(EX.sel.length === q.steps.length);
};
EX.order = k => { if (EX.locked || EX.sel.includes(k) || k >= EX.q.steps.length) return; EX.sel.push(k); drawOrder(); };
EX.unorder = n => { if (EX.locked) return; EX.sel.splice(n, 1); drawOrder(); };
EX.match = (side, k) => {
  if (EX.locked) return;
  const v = EX.v, btn = inEx(`.tile[data-side="${side}"][data-i="${k}"]`);
  if (!btn || btn.classList.contains("done")) return;
  v[side] = k; allEx(`.tile[data-side="${side}"]`).forEach(b => b.classList.toggle("sel", +b.dataset.i === k));
  if (v.a == null || v.b == null) return;
  const A = inEx(`.tile[data-side="a"][data-i="${v.a}"]`), B = inEx(`.tile[data-side="b"][data-i="${v.b}"]`);
  if (v.L[v.a] === v.R[v.b]) {
    v.done.add(v.L[v.a]);
    [A, B].forEach(x => { x.classList.remove("sel"); x.classList.add("ok"); x.disabled = true; setTimeout(() => { x.classList.remove("ok"); x.classList.add("done"); }, 350); });
  } else {
    v.mist++;
    [A, B].forEach(x => { x.classList.remove("sel"); x.classList.add("bad"); setTimeout(() => x.classList.remove("bad"), 450); });
  }
  v.a = v.b = null;
  if (v.done.size === EX.q.pairs.length) { EX.locked = true; setTimeout(() => finish(v.mist <= 1, v.mist), 450); }
};
EX.check = () => {
  if (EX.locked) return;
  const { q, t, sel } = EX; let ok;
  if (t === "mcq" || t === "gap") { if (sel == null) return; ok = sel === q.answer; }
  if (t === "tf") { if (sel == null) return; ok = (sel === 0) === !!q.answer; }
  if (t === "order") { if (sel.length !== q.steps.length) return; ok = sel.every((k, n) => EX.v.bank[k] === n); }
  if (ok === undefined) return;
  finish(ok, 0);
};
function finish(ok, slips) {
  EX.locked = true;
  const { q, t, sel } = EX;
  allEx("button").forEach(b => b.disabled = true);
  if (t === "mcq" || t === "tf") { const right = t === "tf" ? (q.answer ? 0 : 1) : q.answer; allEx(".choice").forEach((b, j) => { b.classList.remove("sel", "dim"); b.classList.add(j === right ? "ok" : j === sel ? "bad" : "dim"); }); }
  if (t === "gap") { const g = inEx(".gap"); g.className = "gap filled " + (ok ? "ok" : "bad"); }
  if (t === "order") allEx(".line .tile").forEach((b, n) => b.classList.add(EX.v.bank[sel[n]] === n ? "ok" : "bad"));
  const hb = $("#hintbtn"); if (hb) hb.disabled = true;
  if (EX.onDone) EX.onDone(ok, slips);
}
EX.solution = (q = EX.q) => {
  const t = qtype(q);
  if (t === "mcq" || t === "gap") return md(q.options[q.answer]);
  if (t === "tf") return esc(q.answer ? Kit.t("tru") : Kit.t("fals"));
  if (t === "order") return q.steps.map(esc).join(" → ");
  if (t === "match") return q.pairs.map(p => `${esc(p[0])} = ${esc(p[1])}`).join(" · ");
  return "";
};
EX.hint = () => {
  if (EX.locked || EX.hinted || !root()) return false;
  EX.hinted = true;
  const { q, t } = EX;
  if (t === "mcq" || t === "gap") {
    const opts = allEx(t === "mcq" ? ".choice" : ".tiles .tile"), wrong = opts.map((_, j) => j).filter(j => j !== q.answer && j !== EX.sel);
    const out = Kit.pickOne(wrong); if (out != null) { opts[out].disabled = true; opts[out].classList.add("dim"); }
  }
  inEx(".hintslot").innerHTML = `<div class="hintbar">${ic("lightbulb")}<span>${q.hint ? md(q.hint) : esc(Kit.t("oneOut"))}</span></div>`;
  const hb = $("#hintbtn"); if (hb) hb.disabled = true;
  paintIcons(); return true;
};
EX.key = e => {
  if (EX.locked || !root()) return false;
  const t = EX.t, d = +e.key;
  if (d >= 1 && d <= 9) {
    if (t === "mcq" || t === "tf") { const b = allEx(".choice")[d - 1]; if (b && !b.disabled) EX.pick(d - 1); return true; }
    if (t === "gap") { EX.gap(d - 1); return true; }
    if (t === "order") { EX.order(d - 1); return true; }
  }
  if (e.key === "Backspace") { if (t === "order" && EX.sel.length) EX.unorder(EX.sel.length - 1); if (t === "gap") EX.ungap(); return true; }
  if (e.key.toLowerCase() === "h") { EX.hint(); return true; }
  return false;
};
Kit.on({ "ex-pick": el => EX.pick(+el.dataset.i), "ex-gap": el => EX.gap(+el.dataset.i), "ex-ungap": () => EX.ungap(), "ex-order": el => EX.order(+el.dataset.i), "ex-unorder": el => EX.unorder(+el.dataset.i), "ex-match": el => EX.match(el.dataset.side, +el.dataset.i) });

/* ---------- recap rows, end screen, copy ---------- */
Kit.rows = list => `<div class="rows">${list.map(r => `<div class="row ${r.miss ? "miss" : ""}"><span class="s">${ic(r.miss ? "x" : "check")}</span><div><b>${esc(r.title)}</b><span>${md(r.text || "")}</span></div><em>${esc(r.meta || "")}</em></div>`).join("")}</div>`;
Kit.stat = ({ label, value, icon = "star", color = "#ffc800" }) => `<div class="stat" style="--c:${color}"><div class="h">${esc(label)}</div><div class="v">${ic(icon)} ${esc(value)}</div></div>`;
Kit.scoreStats = S => [
  { label: Kit.t("score"), value: `${S.score}/${S.R.length}`, icon: "star", color: "#ffc800" },
  { label: Kit.t("acc"), value: `${Math.round(S.score / Math.max(1, S.R.length) * 100)}%`, icon: "target", color: "#58cc02" },
  { label: Kit.t("best"), value: String(S.best), icon: "flame", color: "#ff9600" }
];
Kit.endScreen = ({ title = Kit.t("done"), stats = [], rows = [], result = "", missed = 0 }) => {
  Kit.view(`<div class="center"><h1 class="big">${esc(title)}</h1>${stats.length ? `<div class="stats">${stats.map(Kit.stat).join("")}</div>` : ""}${Kit.rows(rows)}${result ? `<p class="keys">${esc(Kit.t("paste"))}</p><textarea id="res" readonly>${esc(result)}</textarea>` : ""}</div>`, { single: true });
  Kit.footer(`<div class="left">${missed ? Kit.btn(`${Kit.t("again")} (${missed})`, { act: "retry-missed", tone: "white", icon: "rotate-ccw" }) : ""}${Kit.btn(Kit.t("restart"), { act: "restart", tone: "white", icon: "refresh-cw" })}</div>${result ? Kit.btn(Kit.t("copy"), { act: "copy", icon: "copy", id: "go" }) : ""}`);
};
Kit.copy = (text, btn) => {
  const done = () => { if (btn) btn.textContent = Kit.t("copied"); };
  const fallback = () => { const t = $("#res"); if (t) { t.select(); document.execCommand("copy"); } done(); };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
};
Kit.on("copy", el => { const t = $("#res"); if (t) Kit.copy(t.value, el); });

/* ---------- modes ---------- */
const modes = {};
Kit.mode = (name, def) => { modes[name] = def; };
Kit.run = data => {
  Kit.data = data; Kit.lang = data.lang || "en";
  document.documentElement.lang = Kit.lang;
  Kit.shell(); Kit.theme.init();
  const m = modes[data.mode || "lesson"];
  if (!m) { Kit.view(`<div class="center"><p class="keys">${esc(Kit.t("loadFail"))} (${esc(data.mode)})</p></div>`, { single: true }); return; }
  m.start(data);
};
})();
