/* AI Credit Monitor — interactive story. Charts are d3 + SVG, drawn lazily as they approach the
   viewport and redrawn on resize at the container's real width (so 12px text stays 12px). */
(() => {
const D = window.STORY;
const NAME = Object.fromEntries(D.issuers.map(d => [d.id, d.name]));
const C = id => `var(--${id})`;
const IG4 = ["meta", "alphabet", "amazon", "oracle"];
const RIDX = {aa_oas: "AA index", bbb_oas: "BBB index", hy_oas: "high-yield index"};
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DUR = reduced ? 0 : 750;
const parse = s => new Date(s.length === 7 ? s + "-01T00:00:00Z" : s + "T00:00:00Z");
const fDate = d => (d instanceof Date ? d : parse(d)).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric", timeZone: "UTC"});
const fMon = d => (d instanceof Date ? d : parse(d)).toLocaleDateString("en-GB", {month: "short", year: "numeric", timeZone: "UTC"});
const bp = v => v == null || isNaN(v) ? "–" : (v < 1 && v > -1 && v !== 0 ? (Math.abs(v) < 0.1 ? "<0.1" : v.toFixed(1)) : Math.round(v).toLocaleString("en-US"));
const sbp = v => v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(Math.round(v));
const usd = v => v >= 1000 ? "$" + (v / 1000).toFixed(2) + "T" : "$" + Math.round(v).toLocaleString("en-US") + "B";
const deals = D.deals.map(d => ({...d, t: parse(d.date)}));
const dealsOf = id => deals.filter(d => d.issuer_id === id).sort((a, b) => a.t - b.t);
const series = arr => arr.map(([d, v]) => ({t: parse(d), v}));
const sc = Object.fromEntries(D.scenarios.map(s => [s.issuer_id, s]));

/* ---------- tooltip ---------- */
const tip = document.getElementById("tip");
let tipRaf = 0;
function showTip(ev, html) {
  tip.innerHTML = html; tip.classList.add("on");
  cancelAnimationFrame(tipRaf);
  tipRaf = requestAnimationFrame(() => {
    const r = tip.getBoundingClientRect(), pad = 14;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - pad;
    if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - pad;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  });
}
const hideTip = () => tip.classList.remove("on");
const row = (k, v) => `<div class="r"><span>${k}</span><b>${v}</b></div>`;
const head = (id, t) => `<div class="t">${id ? `<span class="mark" style="--c:${C(id)}"></span>` : ""}${t}</div>`;

/* ---------- lazy draw + responsive redraw ---------- */
const charts = [];
function chart(el, draw) {
  const c = {el, draw, w: 0, state: null, drawn: false};
  charts.push(c);
  return c;
}
function render(c) {
  const w = Math.round(c.el.clientWidth);
  if (!w) return;
  c.w = w; c.drawn = true;
  c.draw(c, w);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const c = charts.find(c => c.el === e.target);
  if (c && !c.drawn) render(c);
  io.unobserve(e.target);
}), {rootMargin: "400px 0px"});
let resizeRaf = 0;
const ro = new ResizeObserver(() => {
  cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => charts.forEach(c => { if (c.drawn && Math.abs(c.el.clientWidth - c.w) > 4) render(c); }));
});
function mount() { charts.forEach(c => { io.observe(c.el); ro.observe(c.el); }); }

function svgFor(el, w, h) {
  let s = d3.select(el).select("svg.chart");
  if (s.empty()) s = d3.select(el).append("svg").attr("class", "chart").attr("role", "img");
  s.attr("viewBox", `0 0 ${w} ${h}`).attr("width", w).attr("height", h);
  return s;
}
function layer(s, name) { let g = s.select(`g.${name}`); if (g.empty()) g = s.append("g").attr("class", name); return g; }
function yGrid(g, y, x0, x1, ticks, fmt = d => d) {
  g.attr("class", g.attr("class") + " axis").selectAll("g.tk").data(ticks, d => d).join(
    en => { const t = en.append("g").attr("class", "tk"); t.append("line"); t.append("text").attr("text-anchor", "end").attr("dy", "0.32em"); return t; })
    .attr("transform", d => `translate(0,${y(d)})`)
    .call(t => t.select("line").attr("x1", x0).attr("x2", x1))
    .call(t => t.select("text").attr("x", x0 - 8).text(fmt));
}
function xTimeAxis(g, x, y0, ticks, fmt) {
  g.selectAll("text.xt").data(ticks, d => +d).join("text").attr("class", "xt").attr("text-anchor", "middle")
    .attr("x", d => x(d)).attr("y", y0 + 18).text(fmt);
  g.selectAll("line.xt").data(ticks, d => +d).join("line").attr("class", "xt").attr("stroke", "var(--grid)")
    .attr("x1", d => x(d)).attr("x2", d => x(d)).attr("y1", y0).attr("y2", y0 + 5);
}
const years = (a, b) => d3.range(a, b + 1).map(y => new Date(Date.UTC(y, 0, 1)));

/* ---------- frame actions: copy link, save image, download data ---------- */
function frameActions() {
  document.querySelectorAll(".frame[data-id]").forEach(fr => {
    const bar = fr.querySelector(".frame-actions");
    if (!bar) return;
    bar.innerHTML = `<button type="button" data-a="link">Copy link</button><button type="button" data-a="png">Save image</button>${fr.dataset.csv ? '<button type="button" data-a="csv">Data</button>' : ""}`;
    bar.addEventListener("click", async e => {
      const a = e.target.dataset.a; if (!a) return;
      const id = fr.dataset.id;
      if (a === "link") {
        const url = location.href.split("#")[0] + "#" + id;
        try { await navigator.clipboard.writeText(url); flash(e.target, "Link copied"); } catch { location.hash = id; }
      } else if (a === "png") {
        savePNG(fr, id).then(() => flash(e.target, "Saved"));
      } else if (a === "csv") {
        const rows = CSV[fr.dataset.csv]();
        const blob = new Blob([rows.map(r => r.map(v => typeof v === "string" && /[,"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v ?? "").join(",")).join("\n")], {type: "text/csv"});
        download(URL.createObjectURL(blob), `ai-credit-${id}.csv`);
      }
    });
  });
}
function flash(btn, txt) { const o = btn.textContent; btn.textContent = txt; setTimeout(() => btn.textContent = o, 1400); }
function download(href, name) { const a = document.createElement("a"); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
const STYLE_PROPS = ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "fill-opacity", "stroke-opacity", "font-family", "font-size", "font-weight", "font-style", "text-anchor", "paint-order", "stroke-linejoin", "stroke-linecap"];
function inline(src, dst) {
  const cs = getComputedStyle(src);
  dst.setAttribute("style", STYLE_PROPS.map(p => `${p}:${cs.getPropertyValue(p)}`).join(";"));
  for (let i = 0; i < src.children.length; i++) inline(src.children[i], dst.children[i]);
}
async function savePNG(fr, id) {
  const svgs = [...fr.querySelectorAll("svg.chart")];
  if (!svgs.length) return;
  const title = fr.querySelector(".frame-title")?.textContent || "";
  const pad = 32, scale = 2;
  const boxes = svgs.map(s => s.getBoundingClientRect());
  const left = Math.min(...boxes.map(b => b.left)), top = Math.min(...boxes.map(b => b.top));
  const W = Math.max(...boxes.map(b => b.right)) - left, H = Math.max(...boxes.map(b => b.bottom)) - top;
  const cv = document.createElement("canvas"); cv.width = (W + pad * 2) * scale; cv.height = (H + pad * 2 + 70) * scale;
  const ctx = cv.getContext("2d"); ctx.scale(scale, scale);
  ctx.fillStyle = getComputedStyle(document.body).backgroundColor; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = "#1c1a17"; ctx.font = "600 17px Spectral, Georgia, serif"; ctx.fillText(title, pad, pad + 8);
  for (let i = 0; i < svgs.length; i++) {
    const s = svgs[i], b = boxes[i], clone = s.cloneNode(true);
    inline(s, clone); clone.setAttribute("width", b.width); clone.setAttribute("height", b.height);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], {type: "image/svg+xml"}));
    const img = new Image(); await new Promise(r => { img.onload = r; img.src = url; });
    ctx.drawImage(img, pad + b.left - left, pad + 24 + b.top - top, b.width, b.height); URL.revokeObjectURL(url);
  }
  ctx.fillStyle = "#6e655b"; ctx.font = "12px 'IBM Plex Sans Condensed', sans-serif";
  ctx.fillText("AI Credit Monitor · public data: SEC EDGAR, FRED (ICE BofA), Yahoo Finance · " + D.meta.price_last, pad, H + pad + 52);
  download(cv.toDataURL("image/png"), `ai-credit-${id}.png`);
}
const CSV = {
  deals: () => [["issuer", "date", "size_bn", "spread_5y_bp", "rating_index", "rating_index_bp", "5y_vs_rating_bp", "spread_30y_bp", "market_15y_plus_bp", "30y_vs_market_bp"],
    ...deals.map(d => [NAME[d.issuer_id], d.date, d.size_bn?.toFixed(2), d.s5, RIDX[d.rating_index], d.rating_oas, d.s5_vs_rating, d.s30, d.mkt_long, d.s30_vs_market])],
  tranches: () => [["issuer", "priced", "maturity", "name", "years", "coupon_pct", "spread_bp", "rating_index_bp", "vs_rating_bp", "same_maturity_index_bp", "vs_same_maturity_bp", "amount_usd", "cusip", "source"],
    ...D.tranches.map(t => [NAME[t.issuer_id], t.trade_date, t.maturity_date, t.name, t.tenor_years, t.coupon_pct, t.spread, t.rating_oas, t.vs_rating?.toFixed(1), t.bucket_oas, t.vs_bucket?.toFixed(1), t.amount_usd, t.cusip, t.source_url])],
  equity: () => [["issuer", "week", "stock_implied_5y_spread_bp"],
    ...Object.entries(D.equity).flatMap(([id, e]) => e.spr5.map(p => [NAME[id], p[0], p[1]]))],
  scenarios: () => [["issuer", "market_value_bn", "debt_bn", "operating_leases_bn", "signed_leases_face_bn", "asset_vol", "spread_now_bp", "value_added_since_chatgpt", "value_added_net_of_sp500"],
    ...D.scenarios.map(s => [s.name, (s.E / 1e9).toFixed(1), (s.debt / 1e9).toFixed(1), (s.op_lease / 1e9).toFixed(1), (s.lease_face / 1e9).toFixed(1), s.sV?.toFixed(3), s.spr_now?.toFixed(2), s.value_added_share?.toFixed(3), s.value_added_net_share?.toFixed(3)])],
  iceberg: () => [["issuer", "debt_bn", "operating_leases_bn", "signed_not_started_face_bn", "source"],
    ...D.scenarios.map(s => [s.name, (s.debt / 1e9).toFixed(1), (s.op_lease / 1e9).toFixed(1), (s.lease_face / 1e9).toFixed(1), D.commitments.find(c => c.issuer_id === s.issuer_id)?.source_url])],
};

/* =====================================================================
   HERO ART — bump chart: each company's 30-year bond vs the long index, first deal → latest
   ===================================================================== */
chart(document.getElementById("hero-art"), (c, w) => {
  const rows = IG4.map(id => { const ds = dealsOf(id).filter(d => d.s30_vs_market != null); const a = ds[0], b = ds[ds.length - 1];
    return {id, a, b, va: a.s30_vs_market, vb: b.s30_vs_market, name: NAME[id].replace(" Platforms", "")}; });
  const narrow = w < 460;
  const h = Math.round(Math.max(270, Math.min(340, w * .56))), m = {l: narrow ? 92 : 112, r: narrow ? 96 : 116, t: 30, b: 14};
  const s = svgFor(c.el, w, h);
  const y = d3.scaleLinear().domain([-75, 105]).range([h - m.b, m.t]);
  const x0 = m.l, x1 = w - m.r;
  // two zones, above and below the market average
  let defs = s.select("defs"); if (defs.empty()) defs = s.append("defs");
  [["gUp", "var(--claret)"], ["gDn", "var(--blue)"]].forEach(([id, col]) => {
    const lg = defs.selectAll(`#${id}`).data([0]).join("linearGradient").attr("id", id).attr("x1", 0).attr("x2", 1);
    lg.selectAll("stop").data([0, 1]).join("stop").attr("offset", d => d).attr("stop-color", col).attr("stop-opacity", d => d ? .11 : .03);
  });
  const Z = layer(s, "zones");
  Z.selectAll("rect.up").data([0]).join("rect").attr("class", "up").attr("x", x0).attr("width", x1 - x0).attr("y", m.t).attr("height", y(0) - m.t).attr("fill", "url(#gUp)").attr("rx", 4);
  Z.selectAll("rect.dn").data([0]).join("rect").attr("class", "dn").attr("x", x0).attr("width", x1 - x0).attr("y", y(0)).attr("height", h - m.b - y(0)).attr("fill", "url(#gDn)").attr("rx", 4);
  Z.selectAll("text.zt").data([[narrow ? "Paid more ↑" : "Paid more than the market ↑", m.t + 14, "var(--claret)"], ["Paid less ↓", h - m.b - 7, "var(--blue)"]]).join("text")
    .attr("class", "zt").attr("x", (x0 + x1) / 2).attr("y", d => d[1]).attr("text-anchor", "middle")
    .style("font-size", "10.5px").style("letter-spacing", ".06em").style("text-transform", "uppercase").style("font-weight", 600).style("fill", d => d[2]).style("opacity", .75).text(d => d[0]);
  Z.selectAll("line.z0").data([0]).join("line").attr("class", "z0").attr("x1", x0).attr("x2", x1).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", "var(--ink-2)").attr("stroke-width", 1).attr("stroke-dasharray", "2 3");
  Z.selectAll("text.colh").data([["First deal", x0], ["Latest deal", x1]]).join("text").attr("class", "colh").attr("x", d => d[1]).attr("y", 14)
    .attr("text-anchor", "middle").style("font-size", "11px").style("font-weight", 600).style("letter-spacing", ".05em").style("text-transform", "uppercase").style("fill", "var(--muted)").text(d => d[0]);
  // labels kept apart on each side
  const place = key => { const p = rows.map(r => ({id: r.id, y: y(r[key])})).sort((u, v) => u.y - v.y);
    for (let i = 1; i < p.length; i++) p[i].y = Math.max(p[i].y, p[i - 1].y + 19);
    const over = p[p.length - 1].y - (h - m.b - 4); if (over > 0) p.forEach(q => q.y -= over);
    return new Map(p.map(q => [q.id, q.y])); };
  const la = place("va"), lb = place("vb");
  const curve = (ya, yb) => { const mx = (x1 - x0) * .5; return `M${x0},${ya}C${x0 + mx},${ya} ${x1 - mx},${yb} ${x1},${yb}`; };
  const animate = !c.state; c.state = 1;
  const R = layer(s, "rows").selectAll("g.r").data(rows, d => d.id).join(en => {
    const r = en.append("g").attr("class", "r");
    r.append("path").attr("class", "glow"); r.append("path").attr("class", "ln");
    r.append("line").attr("class", "ta"); r.append("line").attr("class", "tb");
    r.append("circle").attr("class", "ca"); r.append("circle").attr("class", "cb");
    const ta = r.append("text").attr("class", "la"); ta.append("tspan").attr("class", "n"); ta.append("tspan").attr("class", "v");
    const tb = r.append("text").attr("class", "lb"); tb.append("tspan").attr("class", "v"); tb.append("tspan").attr("class", "n");
    return r;
  });
  R.select(".glow").attr("d", d => curve(y(d.va), y(d.vb))).attr("fill", "none").attr("stroke", d => C(d.id)).attr("stroke-width", 9).attr("stroke-opacity", .12).attr("stroke-linecap", "round");
  R.select(".ln").attr("d", d => curve(y(d.va), y(d.vb))).attr("fill", "none").attr("stroke", d => C(d.id)).attr("stroke-width", 3).attr("stroke-linecap", "round");
  R.select(".ta").attr("x1", x0 - 8).attr("x2", x0 - 14).attr("y1", d => y(d.va)).attr("y2", d => la.get(d.id)).attr("stroke", "var(--rule)");
  R.select(".tb").attr("x1", x1 + 8).attr("x2", x1 + 14).attr("y1", d => y(d.vb)).attr("y2", d => lb.get(d.id)).attr("stroke", "var(--rule)");
  R.select(".ca").attr("cx", x0).attr("cy", d => y(d.va)).attr("r", 5.5).attr("fill", "var(--paper-hi)").attr("stroke", d => C(d.id)).attr("stroke-width", 2.5);
  R.select(".cb").attr("cx", x1).attr("cy", d => y(d.vb)).attr("r", 7).attr("fill", d => C(d.id)).attr("stroke", "var(--paper-hi)").attr("stroke-width", 2.5);
  const la_ = R.select(".la").attr("text-anchor", "end").attr("x", x0 - 18).attr("y", d => la.get(d.id) + 4).style("font-size", "12.5px");
  la_.select(".n").style("fill", "var(--ink-2)").text(d => d.name + " ");
  la_.select(".v").style("fill", "var(--ink)").style("font-weight", 600).text(d => sbp(d.va));
  const lb_ = R.select(".lb").attr("x", x1 + 18).attr("y", d => lb.get(d.id) + 4).style("font-size", "12.5px");
  lb_.select(".v").style("fill", "var(--ink)").style("font-weight", 600).text(d => sbp(d.vb) + " ");
  lb_.select(".n").style("fill", "var(--ink-2)").text(d => d.name);
  // annotate the biggest swing
  const big = rows.reduce((p, q) => (q.vb - q.va > p.vb - p.va ? q : p));
  const A = layer(s, "annot");
  A.selectAll("text").data([big]).join("text").attr("class", "annot").attr("x", x0 + (x1 - x0) * .5 + 8).attr("y", d => y((d.va + d.vb) / 2) + 18)
    .text(d => narrow ? `${Math.round(d.vb - d.va)} bp swing` : `${d.name}: ${Math.round(d.vb - d.va)} bp swing`).style("font-size", "12.5px");
  if (animate && !reduced) {
    R.select(".ln").each(function () { const L = this.getTotalLength(); d3.select(this).attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L); });
    R.select(".glow").attr("opacity", 0); R.selectAll(".cb,.lb,.tb").attr("opacity", 0); A.select("text").attr("opacity", 0);
    const t = R.transition().duration(1400).delay((d, i) => 350 + i * 170).ease(d3.easeCubicInOut);
    t.select(".ln").attr("stroke-dashoffset", 0);
    t.select(".glow").attr("opacity", 1);
    R.transition().delay((d, i) => 1450 + i * 170).duration(400).selectAll(".cb,.lb,.tb").attr("opacity", 1);
    A.select("text").transition().delay(2300).duration(500).attr("opacity", 1);
  }
  layer(s, "hits").selectAll("path").data(rows).join("path").attr("class", "hit").attr("fill", "none").attr("stroke", "transparent").attr("stroke-width", 20)
    .attr("d", d => curve(y(d.va), y(d.vb)))
    .on("mouseenter", (ev, d) => R.transition().duration(200).style("opacity", r => r.id === d.id ? 1 : .22))
    .on("mousemove", (ev, d) => showTip(ev, head(d.id, NAME[d.id] + ": 30-year bond") + row(fDate(d.a.t), `${d.a.s30.toFixed(0)} vs ${d.a.mkt_long.toFixed(0)} → ${sbp(d.va)}`) + row(fDate(d.b.t), `${d.b.s30.toFixed(0)} vs ${d.b.mkt_long.toFixed(0)} → ${sbp(d.vb)}`) + `<div class="s">bp over Treasuries vs the ICE BofA 15+ year index that day</div>`))
    .on("mouseleave", () => { hideTip(); R.transition().duration(200).style("opacity", 1); });
});

/* =====================================================================
   HERO — two verdicts per company: 5-year bond vs rating peers, longest bond vs the long index
   ===================================================================== */
chart(document.getElementById("hero-chart"), (c, w) => {
  const narrow = w < 720;
  const panels = [
    {k: "s5_vs_rating", title: "5-year bond vs its rating peers", dom: [-55, 35], ticks: [-50, -25, 0, 25], zero: "same as peers", peer: d => RIDX[d.rating_index]},
    {k: "s30_vs_market", title: "30-year bond vs the average long bond", dom: [-70, 100], ticks: [-50, 0, 50, 100], zero: "same as the market", peer: () => "15y+ index"},
  ];
  const rows = IG4.map(id => ({id, ...Object.fromEntries(panels.map(p => { const ds = dealsOf(id).filter(d => d[p.k] != null); return [p.k, {ds, a: ds[0], b: ds[ds.length - 1]}]; }))}));
  const rh = 46, lab = narrow ? 66 : 128, gap = 34, top = 44, bottom = 30;
  const pw = narrow ? w - lab : (w - lab - gap) / 2;
  const ph = top + bottom + rh * rows.length, h = narrow ? ph * 2 + 16 : ph;
  const s = svgFor(c.el, w, h);
  const animate = !c.state; c.state = 1;
  const P = s.selectAll("g.panel").data(panels).join("g").attr("class", "panel")
    .attr("transform", (p, i) => narrow ? `translate(${lab},${i * (ph + 16)})` : `translate(${lab + i * (pw + gap)},0)`);
  P.each(function (p, pi) {
    const g = d3.select(this), x = d3.scaleLinear().domain(p.dom).range([8, pw - (narrow ? 56 : 70)]);
    g.selectAll("text.pt").data([p.title]).join("text").attr("class", "pt lbl-strong").attr("x", 8).attr("y", 14).text(t => t);
    g.selectAll("line.v").data(p.ticks).join("line").attr("class", "v").attr("stroke", v => v === 0 ? "var(--ink-2)" : "var(--grid)").attr("x1", x).attr("x2", x).attr("y1", top - 6).attr("y2", ph - bottom + 4);
    g.selectAll("text.v").data(p.ticks).join("text").attr("class", "v").attr("text-anchor", "middle").attr("x", x).attr("y", ph - bottom + 20).text(v => sbp(v) + (v === p.ticks[p.ticks.length - 1] ? " bp" : ""));
    g.selectAll("text.z").data([p.zero]).join("text").attr("class", "z lbl").attr("x", x(0) + 5).attr("y", top - 10).style("font-size", "11px").text(t => t);
    const R = g.selectAll("g.row").data(rows, d => d.id).join(en => {
      const r = en.append("g").attr("class", "row");
      r.append("text").attr("class", "lbl-strong name").attr("text-anchor", "end");
      r.append("line").attr("class", "track").attr("stroke-width", 3).attr("stroke-linecap", "round");
      r.append("g").attr("class", "mid"); r.append("circle").attr("class", "a").attr("r", 6);
      r.append("path").attr("class", "head"); r.append("text").attr("class", "lbl-strong v1");
      return r;
    }).attr("transform", (d, i) => `translate(0,${top + i * rh + rh / 2})`);
    R.select(".name").attr("x", -lab + (narrow ? lab - 6 : lab - 14)).attr("y", 4).text(d => pi === 0 || narrow ? (narrow ? NAME[d.id].replace(" Platforms", "") : NAME[d.id]) : "");
    R.select(".a").attr("cx", d => x(d[p.k].a[p.k])).attr("fill", "var(--paper)").attr("stroke", d => C(d.id)).attr("stroke-width", 2);
    R.select(".mid").selectAll("circle").data(d => d[p.k].ds.slice(1, -1).map(q => ({...q, id: d.id}))).join("circle").attr("r", 3.2)
      .attr("cx", q => x(q[p.k])).attr("fill", "var(--paper)").attr("stroke", q => C(q.id)).attr("stroke-width", 1.4);
    const xe = d => x(d[p.k].b[p.k]), x0 = d => x(d[p.k].a[p.k]);
    const head = (d, X) => { const dir = X >= x0(d) ? 1 : -1; return `M${X - 9 * dir},-6L${X},0L${X - 9 * dir},6`; };
    R.select(".track").attr("stroke", d => C(d.id)).attr("y1", 0).attr("y2", 0).attr("x1", x0);
    R.select(".head").attr("fill", "none").attr("stroke", d => C(d.id)).attr("stroke-width", 3).attr("stroke-linejoin", "round").attr("stroke-linecap", "round");
    R.select(".v1").attr("y", 4).text(d => sbp(d[p.k].b[p.k]));
    if (animate) { R.select(".track").attr("x2", x0); R.select(".head").attr("d", d => head(d, x0(d))).attr("opacity", 0); R.select(".v1").attr("opacity", 0).attr("x", d => x0(d) + 12); }
    const t = R.transition().duration(animate ? DUR * 1.8 : 0).delay((d, i) => animate ? 250 + pi * 220 + i * 140 : 0).ease(d3.easeCubicOut);
    t.select(".track").attr("x2", xe);
    t.select(".head").attr("d", d => head(d, xe(d))).attr("opacity", 1);
    t.select(".v1").attr("opacity", 1).attr("x", d => Math.max(xe(d), ...d[p.k].ds.map(q => x(q[p.k]))) + 12);
    g.selectAll("rect.hit").data(rows).join("rect").attr("class", "hit").attr("x", 0).attr("width", pw).attr("y", (d, i) => top + i * rh).attr("height", rh)
      .on("mousemove", (ev, d) => showTip(ev, head(d.id, `${NAME[d.id]}: ${p.title.toLowerCase()}`) + d[p.k].ds.map(q => row(fDate(q.t), `${(p.k === "s30_vs_market" ? q.s30 : q.s5).toFixed(0)} vs ${(p.k === "s30_vs_market" ? q.mkt_long : q.rating_oas).toFixed(0)} → ${sbp(q[p.k])}`)).join("") + `<div class="s">bp over Treasuries: new bond vs ${p.peer(d[p.k].a)} that day</div>`))
      .on("mouseleave", hideTip);
  });
  function head(id, t) { return `<div class="t"><span class="mark" style="--c:${C(id)}"></span>${t}</div>`; }
});

/* =====================================================================
   CHAPTER 1 (scrolly) — 5-year spreads over time against the rating index
   ===================================================================== */
const s1 = chart(document.getElementById("fig-five"), (c, w) => {
  const step = c.state ?? 0;
  const h = Math.max(300, Math.min(470, w * .62)), m = {l: 40, r: w < 520 ? 74 : 116, t: 20, b: 34};
  const s = svgFor(c.el, w, h);
  const x = d3.scaleUtc().domain([new Date(Date.UTC(2024, 5, 1)), parse(D.meta.price_last)]).range([m.l, w - m.r]);
  const y = d3.scaleLinear().domain([0, 140]).range([h - m.b, m.t]);
  yGrid(layer(s, "yg"), y, m.l, w - m.r, [0, 20, 40, 60, 80, 100, 120, 140]);
  xTimeAxis(layer(s, "xg"), x, h - m.b, years(2025, 2026).concat([new Date(Date.UTC(2024, 6, 1))]), d => d.getUTCMonth() === 6 ? "2024" : d.getUTCFullYear());
  const line = d3.line().x(p => x(p.t)).y(p => y(p.v)).curve(d3.curveMonotoneX);
  const idx = k => series(D.index[k]).filter(p => p.t >= x.domain()[0]);
  const L = layer(s, "lines");
  const lines = [{k: "aa_oas", show: true, label: "AA index"}, {k: "bbb_oas", show: step >= 3, label: "BBB index"}];
  L.selectAll("path.ix").data(lines, d => d.k).join("path").attr("class", "ix").attr("fill", "none")
    .attr("stroke", "var(--index)").attr("stroke-width", 2).attr("stroke-dasharray", d => d.k === "bbb_oas" ? "5 4" : null)
    .attr("d", d => line(idx(d.k))).transition().duration(DUR).attr("opacity", d => d.show ? 1 : 0);
  L.selectAll("text.ixl").data(lines, d => d.k).join("text").attr("class", "ixl lbl halo")
    .attr("x", m.l + 6).attr("y", d => { const a = idx(d.k); return y(a[0].v) - 8; }).text(d => d.label)
    .transition().duration(DUR).attr("opacity", d => d.show ? 1 : 0);
  const vis = {0: [], 1: ["alphabet"], 2: ["alphabet", "amazon", "meta"], 3: IG4}[step];
  const pts = deals.filter(d => IG4.includes(d.issuer_id) && d.s5 != null);
  // gap sticks: deal spread vs index that day
  L.selectAll("line.gap").data(pts, d => d.issuer_id + d.date).join("line").attr("class", "gap")
    .attr("x1", d => x(d.t)).attr("x2", d => x(d.t)).attr("y1", d => y(d.rating_oas)).attr("y2", d => y(d.s5))
    .attr("stroke", d => C(d.issuer_id)).attr("stroke-width", 1.5).attr("stroke-dasharray", "2 2")
    .transition().duration(DUR).attr("opacity", d => vis.includes(d.issuer_id) ? .9 : 0);
  const P = layer(s, "pts");
  P.selectAll("circle.pt").data(pts, d => d.issuer_id + d.date).join(en => en.append("circle").attr("class", "pt").attr("r", 0))
    .attr("cx", d => x(d.t)).attr("cy", d => y(d.s5)).attr("fill", d => C(d.issuer_id)).attr("stroke", "var(--paper)").attr("stroke-width", 2)
    .transition().duration(DUR).delay((d, i) => reduced ? 0 : i * 25).attr("r", d => vis.includes(d.issuer_id) ? 6 : 0);
  // end labels in the right margin, stacked so they never overlap, with a leader to the latest deal
  const ends = IG4.map(id => { const a = pts.filter(p => p.issuer_id === id); const l = a[a.length - 1]; return {id, x: x(l.t), y: y(l.s5), ly: y(l.s5)}; }).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) ends[i].ly = Math.max(ends[i].ly, ends[i - 1].ly + 15);
  const E = P.selectAll("g.end").data(ends, d => d.id).join(en => { const g = en.append("g").attr("class", "end"); g.append("line"); g.append("text").attr("class", "lbl-strong halo"); return g; });
  E.select("line").attr("x1", d => d.x + 7).attr("y1", d => d.y).attr("x2", w - m.r + 4).attr("y2", d => d.ly).attr("stroke", "var(--rule)");
  E.select("text").attr("x", w - m.r + 8).attr("y", d => d.ly + 4).text(d => NAME[d.id].replace(" Platforms", ""));
  E.transition().duration(DUR).attr("opacity", d => vis.includes(d.id) ? 1 : 0);
  layer(s, "hits").selectAll("circle").data(pts, d => d.issuer_id + d.date).join("circle").attr("class", "hit").attr("r", 13)
    .attr("cx", d => x(d.t)).attr("cy", d => y(d.s5)).style("pointer-events", d => vis.includes(d.issuer_id) ? "all" : "none")
    .on("mousemove", (ev, d) => showTip(ev, head(d.issuer_id, `${NAME[d.issuer_id]} · ${fDate(d.t)}`) + row("5-year bond spread", d.s5.toFixed(0) + " bp") + row(RIDX[d.rating_index] + " that day", d.rating_oas.toFixed(0) + " bp") + row("Versus peers", sbp(d.s5_vs_rating) + " bp") + row("Deal size", "$" + d.size_bn.toFixed(1) + "B")))
    .on("mouseleave", hideTip);
});

/* =====================================================================
   CHAPTER 2 — curve explorer: one deal's spread at every maturity vs the market curve that day
   ===================================================================== */
const cx = {id: "meta", i: null};
const curveChart = chart(document.getElementById("fig-curve"), (c, w) => {
  const ds = dealsOf(cx.id).filter(d => d.n >= 3);
  if (cx.i == null || cx.i >= ds.length) cx.i = ds.length - 1;
  const d = ds[cx.i];
  const tr = D.tranches.filter(t => t.issuer_id === cx.id && t.trade_date === d.date).sort((a, b) => a.tenor_years - b.tenor_years);
  const h = Math.max(300, Math.min(430, w * .55)), m = {l: 40, r: w < 520 ? 84 : 120, t: 18, b: 40};
  const s = svgFor(c.el, w, h);
  const x = d3.scaleLog().domain([1.8, 55]).range([m.l, w - m.r]);
  const y = d3.scaleLinear().domain([0, 210]).range([h - m.b, m.t]);
  yGrid(layer(s, "yg"), y, m.l, w - m.r, [0, 50, 100, 150, 200]);
  const xg = layer(s, "xg");
  xg.selectAll("text").data([2, 3, 5, 7, 10, 20, 30, 40, 50]).join("text").attr("text-anchor", "middle").attr("x", x).attr("y", h - m.b + 18).text(v => v + "y");
  xg.selectAll("text.cap").data([0]).join("text").attr("class", "cap lbl").attr("x", (m.l + w - m.r) / 2).attr("y", h - 2).attr("text-anchor", "middle").text("Years to maturity (log scale)");
  const G = layer(s, "curves");
  // earlier deals as faint ghosts
  const ghosts = ds.filter((_, j) => j !== cx.i).map(g => ({key: g.date, pts: D.tranches.filter(t => t.issuer_id === cx.id && t.trade_date === g.date).sort((a, b) => a.tenor_years - b.tenor_years)}));
  const ln = d3.line().x(t => x(t.tenor_years)).y(t => y(t.spread)).curve(d3.curveMonotoneX);
  G.selectAll("path.ghost").data(ghosts, g => g.key).join("path").attr("class", "ghost").attr("fill", "none").attr("stroke", C(cx.id))
    .attr("stroke-width", 1.5).attr("opacity", .22).attr("d", g => ln(g.pts));
  const mk = d.mkt_curve.map(([t, v]) => ({tenor_years: t, spread: v}));
  const mline = d3.line().x(t => x(t.tenor_years)).y(t => y(t.spread)).curve(d3.curveMonotoneX);
  G.selectAll("path.mkt").data([mk]).join("path").attr("class", "mkt").attr("fill", "none").attr("stroke", "var(--index)").attr("stroke-width", 2)
    .transition().duration(DUR).attr("d", mline);
  G.selectAll("text.mktl").data([mk[mk.length - 1]]).join("text").attr("class", "mktl lbl halo").attr("x", w - m.r + 8)
    .transition().duration(DUR).attr("y", p => y(p.spread) + 4).text("All-IG index");
  G.selectAll("line.rx").data([d]).join("line").attr("class", "rx").attr("stroke", "var(--index)").attr("stroke-dasharray", "5 4").attr("x1", m.l).attr("x2", w - m.r)
    .transition().duration(DUR).attr("y1", p => y(p.rating_oas)).attr("y2", p => y(p.rating_oas));
  G.selectAll("text.rxl").data([d]).join("text").attr("class", "rxl lbl halo").attr("x", w - m.r + 8)
    .transition().duration(DUR).attr("y", p => y(p.rating_oas) + 4).text(p => RIDX[p.rating_index]);
  const path = G.selectAll("path.cur").data([tr]).join("path").attr("class", "cur").attr("fill", "none").attr("stroke", C(cx.id)).attr("stroke-width", 2.5).attr("d", ln);
  if (!reduced) { const L = path.node().getTotalLength(); path.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L).transition().duration(DUR * 1.3).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0); }
  G.selectAll("circle.tr").data(tr, t => t.tenor_years).join(en => en.append("circle").attr("class", "tr").attr("r", 0).attr("cx", t => x(t.tenor_years)).attr("cy", t => y(t.spread)))
    .attr("fill", C(cx.id)).attr("stroke", "var(--paper)").attr("stroke-width", 2)
    .transition().duration(DUR).attr("cx", t => x(t.tenor_years)).attr("cy", t => y(t.spread)).attr("r", t => 3 + Math.sqrt(t.amount_usd / 1e9) * 2.2);
  const last = tr[tr.length - 1];
  G.selectAll("text.curl").data([last]).join("text").attr("class", "curl lbl-strong halo").attr("x", w - m.r + 8)
    .transition().duration(DUR).attr("y", p => y(p.spread) + 4).text(`${fMon(d.t)}`);
  layer(s, "hits").selectAll("circle").data(tr, t => t.tenor_years).join("circle").attr("class", "hit").attr("r", 13).attr("cx", t => x(t.tenor_years)).attr("cy", t => y(t.spread))
    .on("mousemove", (ev, t) => showTip(ev, head(cx.id, t.name) + row("Priced", fDate(t.trade_date)) + row("Spread over Treasuries", t.spread.toFixed(0) + " bp") + row(`All-IG ${t.bucket_label} index`, t.bucket_oas.toFixed(0) + " bp") + row(RIDX[t.rating_index], t.rating_oas.toFixed(0) + " bp") + row("Size", "$" + (t.amount_usd / 1e9).toFixed(2) + "B")))
    .on("mouseleave", hideTip);
  // readout
  const ro = document.getElementById("curve-readout");
  ro.innerHTML = `<b>${NAME[cx.id]}, ${fDate(d.t)}</b> · ${d.n} USD tranches, $${d.size_bn.toFixed(1)}B. ` +
    (d.s5 != null ? `5-year: <b>${d.s5.toFixed(0)} bp</b>, ${sbp(d.s5_vs_rating)} vs the ${RIDX[d.rating_index]}. ` : "") +
    (d.s30 != null ? `30-year: <b>${d.s30.toFixed(0)} bp</b>, ${sbp(d.s30_vs_market)} vs the average 15-year-plus investment-grade bond.` : "");
  // deal picker
  const pick = document.getElementById("curve-deals");
  pick.innerHTML = ds.map((p, j) => `<button type="button" class="${j === cx.i ? "on" : ""}" data-j="${j}">${fMon(p.t)}</button>`).join("");
});
document.getElementById("curve-issuers").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  cx.id = b.dataset.id; cx.i = null;
  e.currentTarget.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
  render(curveChart);
});
document.getElementById("curve-deals").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  cx.i = +b.dataset.j; render(curveChart);
});

/* =====================================================================
   CHAPTER 4 — what the stock market says
   ===================================================================== */
chart(document.getElementById("fig-equity"), (c, w) => {
  const ids = ["meta", "alphabet", "amazon", "microsoft", "oracle", "coreweave"];
  const cols = w < 560 ? 1 : w < 860 ? 2 : 3, gap = 22, pw = (w - gap * (cols - 1)) / cols, ph = 180, m = {l: 40, r: 10, t: 28, b: 24};
  const rows = Math.ceil(ids.length / cols), h = rows * (ph + 14);
  const s = svgFor(c.el, w, h);
  const x0 = new Date(Date.UTC(2023, 0, 1)), x1 = parse(D.meta.price_last);
  const P = s.selectAll("g.p").data(ids).join("g").attr("class", "p").attr("transform", (d, i) => `translate(${(i % cols) * (pw + gap)},${Math.floor(i / cols) * (ph + 14)})`);
  P.each(function (id) {
    const g = d3.select(this), cw = id === "coreweave";
    const x = d3.scaleUtc().domain([x0, x1]).range([m.l, pw - m.r]);
    const y = d3.scaleLinear().domain(cw ? [0, 1400] : [0, 250]).range([ph - m.b, m.t]);
    const eq = series(D.equity[id].spr5).filter(p => p.t >= x0);
    g.selectAll("text.ti").data([id]).join("text").attr("class", "ti lbl-strong").attr("x", 0).attr("y", 14).text(NAME[id] + (cw ? "  (own scale)" : ""));
    yGrid(layer(g, "yg"), y, m.l, pw - m.r, cw ? [0, 500, 1000] : [0, 100, 200], v => v);
    xTimeAxis(layer(g, "xg"), x, ph - m.b, years(2023, 2026), d => "'" + String(d.getUTCFullYear()).slice(2));
    g.selectAll("path.area").data([eq]).join("path").attr("class", "area").attr("fill", C(id)).attr("opacity", .12)
      .attr("d", d3.area().x(p => x(p.t)).y0(y(0)).y1(p => y(Math.min(p.v, y.domain()[1]))));
    g.selectAll("path.l").data([eq]).join("path").attr("class", "l").attr("fill", "none").attr("stroke", C(id)).attr("stroke-width", 2)
      .attr("d", d3.line().x(p => x(p.t)).y(p => y(Math.min(p.v, y.domain()[1]))));
    const bonds = deals.filter(d => d.issuer_id === id && d.s5 != null && d.t >= x0);
    g.selectAll("rect.b").data(bonds).join("rect").attr("class", "b").attr("width", 9).attr("height", 9).attr("transform", d => `translate(${x(d.t)},${y(d.s5)}) rotate(45) translate(-4.5,-4.5)`)
      .attr("fill", "var(--paper)").attr("stroke", "var(--ink)").attr("stroke-width", 1.6);
    const last = eq[eq.length - 1];
    g.selectAll("text.now").data([last]).join("text").attr("class", "now lbl-strong halo").attr("text-anchor", "end").attr("x", pw - m.r).attr("y", m.t + 2).text(p => `now ${bp(p.v)} bp`);
    const hit = g.selectAll("rect.hit").data([0]).join("rect").attr("class", "hit").attr("x", m.l).attr("y", m.t).attr("width", pw - m.l - m.r).attr("height", ph - m.t - m.b);
    const cross = g.selectAll("line.cr").data([0]).join("line").attr("class", "cr").attr("stroke", "var(--ink-2)").attr("y1", m.t).attr("y2", ph - m.b).attr("opacity", 0);
    hit.on("mousemove", ev => {
      const [mx] = d3.pointer(ev, this), t = x.invert(mx), i = d3.bisector(p => p.t).center(eq, t), p = eq[i];
      cross.attr("x1", x(p.t)).attr("x2", x(p.t)).attr("opacity", .5);
      const nb = bonds.find(b => Math.abs(b.t - p.t) < 864e5 * 10);
      showTip(ev, head(id, `${NAME[id]} · week of ${fDate(p.t)}`) + row("Implied by share price", bp(p.v) + " bp") + (nb ? row("5-year bond sold that week", nb.s5.toFixed(0) + " bp") : ""));
    }).on("mouseleave", () => { cross.attr("opacity", 0); hideTip(); });
  });
});

/* value added since ChatGPT: market-wide part vs company-specific part */
chart(document.getElementById("fig-value"), (c, w) => {
  const ids = ["meta", "alphabet", "amazon", "microsoft", "oracle"];
  const rows = ids.map(id => { const r = sc[id]; const pre = r.E * r.nov22_ratio / 1e9, mkt = r.E * r.mkt_only_ratio / 1e9, now = r.E / 1e9; return {id, pre, mkt, now}; });
  const m = {l: Math.min(130, w * .22), r: 90, t: 8, b: 30}, rh = 40, h = m.t + m.b + rh * rows.length;
  const s = svgFor(c.el, w, h);
  const x = d3.scaleLinear().domain([0, 4200]).range([m.l, w - m.r]);
  const g = layer(s, "grid");
  g.selectAll("line").data([0, 1000, 2000, 3000, 4000]).join("line").attr("stroke", "var(--grid)").attr("x1", x).attr("x2", x).attr("y1", m.t).attr("y2", h - m.b);
  g.selectAll("text").data([0, 1000, 2000, 3000, 4000]).join("text").attr("text-anchor", "middle").attr("x", x).attr("y", h - m.b + 18).text(v => v ? "$" + v / 1000 + "T" : "0");
  const R = layer(s, "rows").selectAll("g").data(rows).join(en => { const r = en.append("g"); r.append("text").attr("class", "lbl-strong n").attr("text-anchor", "end"); ["pre", "mkt", "ex"].forEach(k => r.append("rect").attr("class", k)); r.append("text").attr("class", "lbl v"); return r; })
    .attr("transform", (d, i) => `translate(0,${m.t + i * rh + 8})`);
  const bh = 22;
  R.select(".n").attr("x", m.l - 12).attr("y", bh / 2 + 4).text(d => NAME[d.id]);
  R.select(".pre").attr("x", x(0)).attr("height", bh).attr("rx", 2).attr("fill", "var(--index)").attr("opacity", .55).attr("width", d => x(Math.min(d.pre, d.now)) - x(0));
  R.select(".mkt").attr("height", bh).attr("fill", "var(--index)").attr("opacity", .25).attr("x", d => x(d.pre) + 1).attr("width", d => Math.max(0, x(Math.min(d.mkt, d.now)) - x(d.pre) - 1));
  R.select(".ex").attr("height", bh).attr("rx", 2).attr("fill", d => C(d.id)).attr("x", d => x(d.mkt) + 1).attr("width", d => Math.max(0, x(d.now) - x(d.mkt) - 1));
  R.select(".v").attr("x", d => x(Math.max(d.now, d.mkt)) + 8).attr("y", bh / 2 + 4).text(d => d.now > d.mkt ? `${Math.round((1 - d.mkt / d.now) * 100)}% beyond the market` : "lagged the market");
  layer(s, "hits").selectAll("rect").data(rows).join("rect").attr("class", "hit").attr("x", 0).attr("width", w).attr("y", (d, i) => m.t + i * rh).attr("height", rh)
    .on("mousemove", (ev, d) => showTip(ev, head(d.id, NAME[d.id] + ": stock-market value") + row("30 Nov 2022", usd(d.pre)) + row("If it had matched the S&P 500", usd(d.mkt)) + row("Today", usd(d.now)) + row("Added beyond the market", d.now > d.mkt ? usd(d.now - d.mkt) : "none")))
    .on("mouseleave", hideTip);
});

/* =====================================================================
   CHAPTER 5 — stress lab (signature interactive)
   ===================================================================== */
const lab = {id: "meta", preset: "now", move: null, ops: true, signed: true, pvShare: D.meta.lease_pv, lgd: 0.6, vol: null};
function labClaims(r) {
  const parts = [{k: "debt", label: "Debt and finance leases", v: r.debt}];
  if (lab.ops) parts.push({k: "ops", label: "Operating leases on the balance sheet", v: r.op_lease});
  if (lab.signed) parts.push({k: "signed", label: "Signed leases not yet started (present value)", v: r.lease_face * lab.pvShare});
  return parts;
}
function labRatio(r) {
  if (lab.move != null) return 1 + lab.move;
  if (lab.preset === "now") return 1;
  if (lab.preset === "mkt") return r.mkt_only_ratio ?? 1;
  if (lab.preset === "nov22") return r.nov22_ratio ?? 1;
  return 1;
}
function labCompute(r, ratio, claims) {
  const F = d3.sum(claims, p => p.v);
  return Merton.spreadAtAssetVol(r.E * ratio, F, lab.vol ?? r.sV, r.r, r.r, 5, lab.lgd).spread;
}
const labChart = chart(document.getElementById("lab-chart"), (c, w) => {
  const r = sc[lab.id], claims = labClaims(r), ratio = Math.max(0.05, labRatio(r)), spr = labCompute(r, ratio, claims);
  // readout
  document.getElementById("lab-big").innerHTML = `${bp(spr)}<small>bp</small>`;
  const band = document.getElementById("lab-band"), mult = spr / Math.max(r.spr_now, 0.1);
  band.textContent = `vs ${bp(r.spr_now)} bp at today's price, debt only`;
  band.className = "band" + (spr > 100 ? " hot" : spr > 20 ? " warm" : "");
  const E = r.E * ratio / 1e9, F = d3.sum(claims, p => p.v) / 1e9;
  document.getElementById("lab-explain").innerHTML = `${NAME[lab.id].replace(" Platforms", "")}'s stock-market value would be <b>${usd(E)}</b> (${ratio >= 1 ? "+" : "−"}${Math.abs(Math.round((ratio - 1) * 100))}% from today) against <b>${usd(F)}</b> owed ahead of shareholders: a cushion of <b>${(E / F).toFixed(1)}×</b>.`;
  const slider = document.getElementById("lab-move");
  slider.value = Math.round((ratio - 1) * 100); slider.style.setProperty("--p", ((+slider.value - +slider.min) / (+slider.max - +slider.min) * 100) + "%");
  document.getElementById("lab-move-val").textContent = `${ratio >= 1 ? "+" : "−"}${Math.abs(Math.round((ratio - 1) * 100))}%`;
  // chart 1: claims vs equity bars
  const h1 = 120, m = {l: 10, r: 10, t: 22, b: 8};
  const s = svgFor(c.el, w, h1 + 250);
  const xmax = Math.max(E, F, r.E / 1e9) * 1.05;
  const x = d3.scaleLinear().domain([0, xmax]).range([m.l, w - m.r]);
  const B = layer(s, "bars");
  const eqRows = [{k: "eq", label: "Stock-market value in this scenario", v: E, y: m.t}];
  let acc = 0; const cl = claims.map(p => { const o = {...p, x0: acc, v: p.v / 1e9}; acc += p.v / 1e9; return o; });
  const fills = {debt: "var(--ink)", ops: "var(--ink-2)", signed: "var(--claret)"};
  B.selectAll("text.h").data(["Claims ahead of shareholders", "Stock-market value"]).join("text").attr("class", "h lbl").attr("x", m.l).attr("y", (d, i) => i ? m.t + 62 : m.t - 6).text(d => d);
  B.selectAll("rect.cl").data(cl, d => d.k).join(en => en.append("rect").attr("class", "cl").attr("height", 24).attr("y", m.t).attr("x", x(0)).attr("width", 0))
    .attr("fill", d => fills[d.k]).on("mousemove", (ev, d) => showTip(ev, head(null, d.label) + row("Amount", usd(d.v)))).on("mouseleave", hideTip)
    .transition().duration(reduced ? 0 : 420).ease(d3.easeCubicOut).attr("x", d => x(d.x0) + (d.x0 ? 1 : 0)).attr("width", d => Math.max(0, x(d.x0 + d.v) - x(d.x0) - (d.x0 ? 1 : 0)));
  B.selectAll("rect.eq").data(eqRows).join(en => en.append("rect").attr("class", "eq").attr("height", 24).attr("y", m.t + 68).attr("x", x(0)).attr("width", 0).attr("rx", 2))
    .attr("fill", C(lab.id)).on("mousemove", (ev, d) => showTip(ev, head(lab.id, d.label) + row("Amount", usd(d.v)))).on("mouseleave", hideTip)
    .transition().duration(reduced ? 0 : 420).ease(d3.easeCubicOut).attr("width", d => x(d.v) - x(0));
  B.selectAll("line.today").data([r.E / 1e9]).join("line").attr("class", "today").attr("stroke", "var(--ink-2)").attr("stroke-dasharray", "3 3").attr("y1", m.t + 62).attr("y2", m.t + 98)
    .transition().duration(reduced ? 0 : 420).attr("x1", x).attr("x2", x);
  B.selectAll("text.today").data([r.E / 1e9]).join("text").attr("class", "today lbl").attr("y", m.t + 110).attr("text-anchor", "end").text("today's value").transition().duration(reduced ? 0 : 420).attr("x", v => x(v) + 2);
  B.selectAll("text.cv").data([F]).join("text").attr("class", "cv lbl-strong").attr("y", m.t + 17).text(usd(F)).transition().duration(reduced ? 0 : 420).attr("x", v => Math.min(x(v) + 6, w - m.r - 50));
  // value label: outside the bar when there is room, otherwise inside its end in white
  const evIn = x(E) > w - m.r - 60;
  B.selectAll("text.ev").data([E]).join("text").attr("class", "ev lbl-strong").attr("y", m.t + 85).text(usd(E))
    .attr("text-anchor", evIn ? "end" : "start").style("fill", evIn ? "#fff" : null)
    .transition().duration(reduced ? 0 : 420).attr("x", v => evIn ? x(v) - 8 : x(v) + 6);
  // chart 2: implied spread as the share price moves (log y)
  const top = h1 + 30, h2 = 210, m2 = {l: 44, r: 16, b: 34};
  const xs = d3.scaleLinear().domain([-90, 30]).range([m2.l, w - m2.r]);
  const ys = d3.scaleLog().domain([0.1, 2000]).range([top + h2 - m2.b, top]).clamp(true);
  const G = layer(s, "curve");
  G.selectAll("text.h2").data([0]).join("text").attr("class", "h2 lbl").attr("x", m.l).attr("y", top - 10).text(w < 560 ? "Model spread (bp, log) as the share price moves" : "Model spread (bp, log scale) as the share price moves, with these claims");
  yGrid(layer(G, "yg"), ys, m2.l, w - m2.r, [0.1, 1, 10, 100, 1000], v => v < 1 ? "<1" : v);
  G.selectAll("text.xt").data([-80, -60, -40, -20, 0, 20]).join("text").attr("class", "xt").attr("text-anchor", "middle").attr("x", xs).attr("y", top + h2 - m2.b + 18).text(v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "%");
  const pts = d3.range(-90, 31, 2.5).map(p => ({p, v: labCompute(r, 1 + p / 100, claims)}));
  G.selectAll("path.cv").data([pts]).join("path").attr("class", "cv").attr("fill", "none").attr("stroke", C(lab.id)).attr("stroke-width", 2.5)
    .attr("d", d3.line().x(q => xs(q.p)).y(q => ys(Math.max(q.v, .1))).curve(d3.curveMonotoneX));
  const presets = [{k: "now", l: "today", ratio: 1}, {k: "mkt", l: "matched S&P", ratio: r.mkt_only_ratio}, {k: "nov22", l: "Nov 2022", ratio: r.nov22_ratio}].filter(p => p.ratio != null && (p.ratio - 1) * 100 >= -90 && (p.ratio - 1) * 100 <= 30);
  G.selectAll("g.pr").data(presets, p => p.k).join(en => { const g = en.append("g").attr("class", "pr"); g.append("line"); g.append("text").attr("class", "lbl"); return g; })
    .call(g => g.select("line").attr("stroke", "var(--rule)").attr("y1", top).attr("y2", top + h2 - m2.b).attr("x1", p => xs((p.ratio - 1) * 100)).attr("x2", p => xs((p.ratio - 1) * 100)))
    .call(g => g.select("text").attr("x", p => xs((p.ratio - 1) * 100) + 4).attr("y", (p, i) => top + 12 + i * 14).text(p => p.l));
  const here = {p: (ratio - 1) * 100, v: spr};
  G.selectAll("circle.here").data([here]).join(en => en.append("circle").attr("class", "here").attr("r", 7).attr("fill", "var(--paper)").attr("stroke", "var(--claret)").attr("stroke-width", 3))
    .transition().duration(reduced ? 0 : 300).attr("cx", q => xs(Math.max(-90, Math.min(30, q.p)))).attr("cy", q => ys(Math.max(q.v, .1)));
  G.selectAll("rect.hit").data([0]).join("rect").attr("class", "hit").attr("x", m2.l).attr("y", top).attr("width", w - m2.l - m2.r).attr("height", h2 - m2.b)
    .on("mousemove", ev => { const [mx] = d3.pointer(ev); const p = Math.round(xs.invert(mx)); showTip(ev, head(lab.id, `Share price ${p >= 0 ? "+" : "−"}${Math.abs(p)}% from today`) + row("Model spread", bp(labCompute(r, 1 + p / 100, claims)) + " bp") + `<div class="s">Click to set</div>`); })
    .on("click", ev => { const [mx] = d3.pointer(ev); lab.move = Math.round(xs.invert(mx)) / 100; syncLab(); })
    .on("mouseleave", hideTip);
});
function syncLab() {
  document.querySelectorAll("#lab-issuers button").forEach(b => b.classList.toggle("on", b.dataset.id === lab.id));
  document.querySelectorAll("#lab-presets button").forEach(b => { b.classList.toggle("on", lab.move == null && b.dataset.p === lab.preset); b.disabled = lab.id === "coreweave" && b.dataset.p !== "now"; });
  document.querySelectorAll("#lab-lgd button").forEach(b => b.classList.toggle("on", +b.dataset.v === lab.lgd));
  document.getElementById("lab-ops").checked = lab.ops; document.getElementById("lab-signed").checked = lab.signed;
  const vs = document.getElementById("lab-vol"), r0 = sc[lab.id]; vs.value = Math.round((lab.vol ?? r0.sV) * 100);
  vs.style.setProperty("--p", ((+vs.value - +vs.min) / (+vs.max - +vs.min) * 100) + "%");
  document.getElementById("lab-vol-val").textContent = `${vs.value}% a year${lab.vol == null ? " (today's estimate)" : ""}`;
  const pv = document.getElementById("lab-pv"); pv.disabled = !lab.signed; pv.value = Math.round(lab.pvShare * 100);
  pv.style.setProperty("--p", pv.value + "%"); document.getElementById("lab-pv-val").textContent = pv.value + "% of face";
  render(labChart);
}
document.getElementById("lab-issuers").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; lab.id = b.dataset.id; if (lab.id === "coreweave") { lab.preset = "now"; } lab.move = null; lab.vol = null; syncLab(); });
document.getElementById("lab-vol").addEventListener("input", e => { lab.vol = +e.target.value / 100; syncLab(); });
document.getElementById("lab-presets").addEventListener("click", e => { const b = e.target.closest("button"); if (!b || b.disabled) return; lab.preset = b.dataset.p; lab.move = null; syncLab(); });
document.getElementById("lab-lgd").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; lab.lgd = +b.dataset.v; syncLab(); });
document.getElementById("lab-move").addEventListener("input", e => { lab.move = +e.target.value / 100; syncLab(); });
document.getElementById("lab-ops").addEventListener("change", e => { lab.ops = e.target.checked; syncLab(); });
document.getElementById("lab-signed").addEventListener("change", e => { lab.signed = e.target.checked; syncLab(); });
document.getElementById("lab-pv").addEventListener("input", e => { lab.pvShare = +e.target.value / 100; syncLab(); });

/* =====================================================================
   CHAPTER 6 — the iceberg
   ===================================================================== */
const ice = {sel: "meta"};
const iceChart = chart(document.getElementById("fig-iceberg"), (c, w) => {
  const ids = ["microsoft", "oracle", "meta", "amazon", "alphabet", "coreweave"];
  const rows = ids.map(id => { const r = sc[id]; return {id, debt: r.debt / 1e9, ops: r.op_lease / 1e9, signed: r.lease_face / 1e9}; });
  const h = Math.max(380, Math.min(480, w * .55)), m = {l: 48, r: 10, t: 24, b: 34};
  const s = svgFor(c.el, w, h);
  const x = d3.scaleBand().domain(ids).range([m.l, w - m.r]).padding(.38);
  const up = 260, down = 360;
  const wl = m.t + (h - m.t - m.b) * up / (up + down);
  const yU = d3.scaleLinear().domain([0, up]).range([wl, m.t]), yD = d3.scaleLinear().domain([0, down]).range([wl, h - m.b]);
  const G = layer(s, "g");
  G.selectAll("rect.sea").data([0]).join("rect").attr("class", "sea").attr("x", m.l - 8).attr("width", w - m.l - m.r + 16).attr("y", wl).attr("height", h - m.b - wl).attr("fill", "var(--blue-soft)").attr("opacity", .45);
  G.selectAll("line.wl").data([0]).join("line").attr("class", "wl").attr("x1", m.l - 8).attr("x2", w - m.r + 8).attr("y1", wl).attr("y2", wl).attr("stroke", "var(--blue)").attr("stroke-width", 1.5);
  G.selectAll("text.wlt").data(["▲ On the balance sheet", "▼ Signed, not started: off the balance sheet"]).join("text").attr("class", "wlt lbl halo").attr("text-anchor", "end").attr("x", w - m.r).attr("y", (d, i) => i ? wl + 16 : wl - 8).text(d => d);
  yGrid(layer(s, "yu"), yU, m.l, w - m.r, [100, 200], v => "$" + v + "B");
  yGrid(layer(s, "yd"), yD, m.l, w - m.r, [100, 200, 300], v => "$" + v + "B");
  const bw = Math.min(x.bandwidth(), 54);
  const cols = G.selectAll("g.col").data(rows, d => d.id).join(en => { const g = en.append("g").attr("class", "col"); ["debt", "ops", "signed"].forEach(k => g.append("rect").attr("class", k)); g.append("text").attr("class", "lbl-strong n").attr("text-anchor", "middle"); g.append("text").attr("class", "lbl sv").attr("text-anchor", "middle"); g.append("rect").attr("class", "hit"); return g; })
    .attr("transform", d => `translate(${x(d.id) + (x.bandwidth() - bw) / 2},0)`);
  cols.select(".debt").attr("width", bw).attr("fill", "var(--ink)").attr("y", d => yU(d.debt)).attr("height", d => wl - yU(d.debt));
  cols.select(".ops").attr("width", bw).attr("fill", "var(--ink-2)").attr("opacity", .55).attr("y", d => yU(d.debt + d.ops)).attr("height", d => Math.max(0, yU(d.debt) - yU(d.debt + d.ops) - 1));
  cols.select(".signed").attr("width", bw).attr("fill", d => C(d.id)).attr("y", wl + 1).attr("height", d => yD(d.signed) - wl).attr("opacity", d => d.id === ice.sel ? 1 : .55);
  cols.select(".n").attr("x", bw / 2).attr("y", d => yU(d.debt + d.ops) - 8).text(d => NAME[d.id].replace(" Platforms", ""));
  cols.select(".sv").attr("x", bw / 2).attr("y", d => yD(d.signed) + 15).text(d => usd(d.signed));
  cols.select(".hit").attr("width", bw + 14).attr("x", -7).attr("y", m.t).attr("height", h - m.t - m.b)
    .on("mousemove", (ev, d) => showTip(ev, head(d.id, NAME[d.id]) + row("Debt + finance leases", usd(d.debt)) + row("Operating leases (on balance sheet)", usd(d.ops)) + row("Signed, not started (face)", usd(d.signed)) + `<div class="s">Click for the filing</div>`))
    .on("mouseleave", hideTip).on("click", (ev, d) => { ice.sel = d.id; render(iceChart); });
  const r = sc[ice.sel], cm = D.commitments.find(x => x.issuer_id === ice.sel), ob = D.offbalance.find(x => x.issuer_id === ice.sel);
  document.getElementById("ice-card").innerHTML = `<div class="panel-label"><span class="mark" style="--c:${C(ice.sel)}"></span>${NAME[ice.sel]}</div>` +
    (cm ? `<p class="sans" style="font-size:var(--t-sm);margin:.4rem 0">“${cm.quotes?.[0] ?? cm.description}”</p><p class="caveat">${cm.form}, as of ${fDate(cm.as_of)}. ${cm.description}.${cm.subsequent_usd ? ` Plus ${usd(cm.subsequent_usd / 1e9)} signed after the quarter: ${cm.subsequent_note}.` : ""} <a href="${cm.source_url}" target="_blank" rel="noopener">Filing</a></p>` : "") +
    (ob ? `<p class="caveat" style="margin-top:.6rem">Also: ${ob.name}. ${ob.structure} Maximum exposure ${usd(ob.max_exposure_usd / 1e9)} (may overlap with the leases above). <a href="${ob.source_url}" target="_blank" rel="noopener">Filing</a></p>` : "");
});

/* =====================================================================
   CHAPTER 7 — Oracle: AI beta and stock-implied spread
   ===================================================================== */
chart(document.getElementById("fig-oracle"), (c, w) => {
  const pw = w, ph = Math.max(220, Math.min(300, w * .3)), m = {l: 40, r: 14, t: 28, b: 26};
  const s = svgFor(c.el, w, ph);
  const x0 = new Date(Date.UTC(2023, 0, 1)), x1 = parse(D.meta.price_last);
  const panels = [
    {title: "Spread implied by Oracle's share price, bp (◆ = its new 5-year bonds)", data: series(D.equity.oracle.spr5).filter(p => p.t >= x0), dom: [0, 250], ticks: [0, 100, 200], bonds: true},
  ];
  const P = s.selectAll("g.p").data(panels).join("g").attr("class", "p").attr("transform", (d, i) => narrow ? `translate(0,${i * (ph + 16)})` : `translate(${i * (pw + 28)},0)`);
  P.each(function (p) {
    const g = d3.select(this), x = d3.scaleUtc().domain([x0, x1]).range([m.l, pw - m.r]), y = d3.scaleLinear().domain(p.dom).range([ph - m.b, m.t]);
    g.selectAll("text.ti").data([p.title]).join("text").attr("class", "ti lbl-strong").attr("x", 0).attr("y", 14).text(t => t);
    yGrid(layer(g, "yg"), y, m.l, pw - m.r, p.ticks, v => v);
    xTimeAxis(layer(g, "xg"), x, ph - m.b, years(2023, 2026), d => d.getUTCFullYear());
    if (p.zero) g.selectAll("line.z").data([0]).join("line").attr("class", "z zero").attr("x1", m.l).attr("x2", pw - m.r).attr("y1", y(0)).attr("y2", y(0));
    g.selectAll("path.l").data([p.data]).join("path").attr("class", "l").attr("fill", "none").attr("stroke", "var(--oracle)").attr("stroke-width", 2.2).attr("d", d3.line().x(q => x(q.t)).y(q => y(Math.min(q.v, p.dom[1]))));
    if (p.bonds) g.selectAll("rect.b").data(dealsOf("oracle").filter(d => d.s5 != null && d.t >= x0)).join("rect").attr("class", "b").attr("width", 9).attr("height", 9)
      .attr("transform", d => `translate(${x(d.t)},${y(d.s5)}) rotate(45) translate(-4.5,-4.5)`).attr("fill", "var(--paper)").attr("stroke", "var(--ink)").attr("stroke-width", 1.6);
    const cross = g.selectAll("line.cr").data([0]).join("line").attr("class", "cr").attr("stroke", "var(--ink-2)").attr("y1", m.t).attr("y2", ph - m.b).attr("opacity", 0);
    g.selectAll("rect.hit").data([0]).join("rect").attr("class", "hit").attr("x", m.l).attr("y", m.t).attr("width", pw - m.l - m.r).attr("height", ph - m.t - m.b)
      .on("mousemove", ev => { const [mx] = d3.pointer(ev, this); const i = d3.bisector(q => q.t).center(p.data, x.invert(mx)), q = p.data[i]; cross.attr("x1", x(q.t)).attr("x2", x(q.t)).attr("opacity", .5); showTip(ev, head("oracle", fDate(q.t)) + row(p.bonds ? "Implied spread" : "AI beta", p.bonds ? bp(q.v) + " bp" : q.v.toFixed(2))); })
      .on("mouseleave", () => { cross.attr("opacity", 0); hideTip(); });
  });
});

/* =====================================================================
   EXPLORER — every USD tranche
   ===================================================================== */
const ex = {issuers: new Set(IG4.concat(["coreweave"])), q: "", sort: "trade_date", dir: -1};
function drawExplorer() {
  const cols = [["issuer_id", "Company", "l"], ["trade_date", "Priced", "l"], ["tenor_years", "Years"], ["coupon_pct", "Coupon"], ["spread", "Spread (bp)"], ["vs_rating", "vs rating average"], ["vs_bucket", "vs same-maturity average"], ["amount_usd", "Size"], ["source_url", "Filing", "l"]];
  const q = ex.q.toLowerCase();
  const rows = D.tranches.filter(t => ex.issuers.has(t.issuer_id) && (!q || (t.name + " " + NAME[t.issuer_id] + " " + (t.cusip || "")).toLowerCase().includes(q)))
    .sort((a, b) => { const A = a[ex.sort], B = b[ex.sort]; return (A > B ? 1 : A < B ? -1 : 0) * ex.dir; });
  const cell = (t, k) => k === "issuer_id" ? `<span class="mark" style="--c:${C(t.issuer_id)}"></span> ${NAME[t.issuer_id]}` : k === "trade_date" ? fDate(t.trade_date) : k === "tenor_years" ? t.tenor_years.toFixed(1)
    : k === "coupon_pct" ? (t.coupon_pct?.toFixed(3) ?? "") + "%" : k === "spread" ? t.spread.toFixed(0) + (t.price_assumed ? "*" : "") : k === "vs_rating" || k === "vs_bucket" ? `<span class="${t[k] > 0 ? "pos" : "neg"}">${sbp(t[k])}</span>`
    : k === "amount_usd" ? "$" + (t.amount_usd / 1e9).toFixed(2) + "B" : `<a href="${t.source_url}" target="_blank" rel="noopener">SEC</a>`;
  document.getElementById("ex-table").innerHTML = `<thead><tr>${cols.map(([k, l, a]) => `<th class="${a || ""}"><button type="button" data-k="${k}" class="${ex.sort === k ? (ex.dir > 0 ? "asc" : "desc") : ""}">${l}</button></th>`).join("")}</tr></thead><tbody>${rows.map(t => `<tr>${cols.map(([k, , a]) => `<td class="${a || ""}">${cell(t, k)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  document.getElementById("ex-count").textContent = `${rows.length} of ${D.tranches.length} USD fixed-rate tranches`;
}
document.getElementById("ex-chips").innerHTML = IG4.concat(["coreweave"]).map(id => `<button type="button" class="chip on" data-id="${id}"><span class="mark" style="--c:${C(id)}"></span>${NAME[id]}</button>`).join("");
document.getElementById("ex-chips").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const id = b.dataset.id; ex.issuers.has(id) ? ex.issuers.delete(id) : ex.issuers.add(id); b.classList.toggle("on"); drawExplorer(); });
document.getElementById("ex-search").addEventListener("input", e => { ex.q = e.target.value; drawExplorer(); });
document.getElementById("ex-table").addEventListener("click", e => { const b = e.target.closest("th button"); if (!b) return; const k = b.dataset.k; ex.dir = ex.sort === k ? -ex.dir : (k === "issuer_id" || k === "source_url" ? 1 : -1); ex.sort = k; drawExplorer(); });

/* =====================================================================
   SCROLLY + chrome: steps, progress bar, nav highlight, reveals, counters
   ===================================================================== */
function scrolly(root, onStep) {
  const steps = [...root.querySelectorAll(".step")];
  const obs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const i = steps.indexOf(e.target);
    steps.forEach((s, j) => s.classList.toggle("on", j === i));
    onStep(i);
  }), {rootMargin: innerWidth <= 900 ? "-72% 0px -24% 0px" : "-48% 0px -48% 0px"});  // phones: trigger below the sticky chart
  steps.forEach(s => obs.observe(s));
}
scrolly(document.getElementById("scrolly-five"), i => { if (s1.state !== i) { s1.state = i; if (s1.drawn) render(s1); } });
const prog = document.querySelector(".progress"), navLinks = [...document.querySelectorAll(".masthead nav a")];
const secs = navLinks.map(a => document.querySelector(a.getAttribute("href")));
let scrollRaf = 0;
addEventListener("scroll", () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    let cur = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * .35) cur = i; });
    navLinks.forEach((a, i) => a.classList.toggle("on", i === cur));
  });
}, {passive: true});
const rev = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rev.unobserve(e.target); } }), {rootMargin: "0px 0px -8% 0px"});
document.querySelectorAll(".reveal").forEach(el => rev.observe(el));
const cnt = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cnt.unobserve(e.target);
  const el = e.target, to = +el.dataset.to, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
  if (reduced) { el.textContent = pre + to.toFixed(dec) + suf; return; }
  const t0 = performance.now(), dur = 1300;
  const tick = now => { const k = Math.min(1, (now - t0) / dur), v = to * d3.easeCubicOut(k); el.textContent = pre + (to < 0 ? "−" : "") + Math.abs(v).toFixed(dec) + suf; if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}), {threshold: .6});
document.querySelectorAll("[data-to]").forEach(el => { if (!reduced) el.textContent = (el.dataset.pre || "") + (0).toFixed(+(el.dataset.dec || 0)); cnt.observe(el); });

frameActions();
drawExplorer();
mount();
syncLab();
if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
})();
