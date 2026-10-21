/* Bite-Size Kit · mode "sheet": a one-page cheat sheet. Cards in two columns, real images, print-friendly.
 * DATA: { mode: "sheet", lang, chapter, subtitle?, sections: [{ title, slide?, img?, text?|points?|flow?|table? }] }
 */
(() => {
const { $, esc, ic } = Kit;
Kit.addText("en", { print: "Print / PDF", copyText: "Copy as text", sheetLbl: "Cheat sheet", sections: "sections" });
Kit.addText("id", { print: "Cetak / PDF", copyText: "Salin teks", sheetLbl: "Ringkasan", sections: "bagian" });
const ACC = ["#a560d8", "#58a700", "#e08600", "#1899d6", "#d6418e"];
let D;

function start(data) {
  D = data; const secs = data.sections || [];
  const bar = $("#bar"); if (bar) bar.style.visibility = "hidden";
  Kit.status("");
  Kit.view(`<div class="sheet-head"><div><p class="meta">${ic("file-text")} ${esc(Kit.t("sheetLbl"))} · ${secs.length} ${esc(Kit.t("sections"))}</p><h1>${esc(D.chapter || "")}</h1>${D.subtitle ? `<p class="keys" style="font-size:15px">${Kit.md(D.subtitle)}</p>` : ""}</div></div>` +
    `<div class="sheet-grid">${secs.map((s, i) => `<section class="bubble sheet-card" style="--acc:${ACC[i % ACC.length]}">${s.slide ? `<span class="tag">${ic("file-text")} ${esc(s.slide)}</span>` : ""}<h2>${esc(s.title)}</h2>${Kit.pic(s.img)}${Kit.material(s)}</section>`).join("")}</div>`, { cls: "sheetpage" });
  Kit.footer(`<div class="left">${Kit.btn(Kit.t("copyText"), { act: "sheet-copy", tone: "white", icon: "copy" })}</div>${Kit.btn(Kit.t("print"), { act: "sheet-print", id: "go", icon: "printer" })}`);
}

function asText() {
  const lines = [Kit.plain(D.chapter || ""), ""];
  for (const s of D.sections || []) {
    lines.push(`## ${Kit.plain(s.title)}${s.slide ? ` (${s.slide})` : ""}`);
    if (s.text) lines.push(Kit.plain(s.text));
    if (s.points) s.points.forEach(p => lines.push("- " + Kit.plain(p)));
    if (s.flow) lines.push(s.flow.map(Kit.plain).join(" -> "));
    if (s.table) { lines.push(s.table.cols.join(" | ")); s.table.rows.forEach(r => lines.push(r.map(Kit.plain).join(" | "))); }
    lines.push("");
  }
  return lines.join("\n");
}

Kit.on({ "sheet-print": () => window.print(), "sheet-copy": el => Kit.copy(asText(), el) });
Kit.mode("sheet", { start });
})();
