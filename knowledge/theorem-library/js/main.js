/**
 * 定理图书馆 · 精简界面
 */
(function () {
  const app = document.getElementById("app");
  const theorems = window.THEOREMS || [];

  const difficultyClass = {
    easy: "easy",
    medium: "medium",
    hard: "hard"
  };

  function route() {
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#\/?/, "").split("/");
    const page = parts[0] || "";
    const id = parts[1] || "";

    if (page === "theorem" && id) {
      renderDetail(id);
    } else if (page === "list") {
      renderCatalog();
    } else {
      renderHome();
    }
    updateNav(page || "home");
    window.scrollTo(0, 0);
  }

  function updateNav(page) {
    document.querySelectorAll(".nav a").forEach((a) => {
      const key = a.getAttribute("data-nav");
      const on =
        key === "home" && (page === "" || page === "home" || !page) ||
        key === page;
      a.classList.toggle("active", !!on);
    });
  }

  function go(path) {
    location.hash = path;
  }

  function findTheorem(id) {
    return theorems.find((t) => t.id === id);
  }

  function filterList(filter, query) {
    const q = (query || "").trim().toLowerCase();
    return theorems.filter((t) => {
      const okDiff = filter === "all" || t.difficulty === filter;
      if (!okDiff) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.oneLiner.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.people.some((p) => p.name.toLowerCase().includes(q))
      );
    });
  }

  function paintCards(grid, list) {
    if (!list.length) {
      grid.innerHTML = `<div class="empty">无匹配结果</div>`;
      return;
    }
    grid.innerHTML = list
      .map(
        (t) => `
      <button class="card" data-id="${t.id}" type="button">
        <div class="card-top">
          <div class="card-icon ${t.iconClass || ""}">${t.emoji}</div>
          <span class="difficulty ${difficultyClass[t.difficulty]}">${t.difficultyLabel}</span>
        </div>
        <h3>${t.title}</h3>
        <p>${t.oneLiner}</p>
        <div class="card-meta">
          ${t.tags.slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <div class="card-footer">
          <span>${t.era}</span>
        </div>
      </button>`
      )
      .join("");

    grid.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => go(`#/theorem/${card.dataset.id}`));
    });
  }

  function bindToolbar(paint) {
    let filter = "all";
    let query = "";
    const search = document.getElementById("search");
    const chips = document.getElementById("chips");
    search.addEventListener("input", (e) => {
      query = e.target.value;
      paint(filter, query);
    });
    chips.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        filter = chip.dataset.filter;
        paint(filter, query);
      });
    });
  }

  /* ---------- HOME：直接图书馆 ---------- */
  function renderHome() {
    app.innerHTML = `
      <div class="container library">
        <header class="lib-head">
          <div>
            <h1 class="lib-title">定理图书馆</h1>
            <p class="lib-meta">${theorems.length} 条经典 · 大白话讲清楚 · 公式与证明都在</p>
          </div>
        </header>

        <div class="toolbar">
          <div class="search">
            <input id="search" type="search" placeholder="搜：勾股、质数、挂谷、谁证明的…" aria-label="搜索" />
          </div>
          <div class="chips" id="chips">
            <button type="button" class="chip active" data-filter="all">全部</button>
            <button type="button" class="chip" data-filter="easy">好上手</button>
            <button type="button" class="chip" data-filter="medium">费点脑子</button>
            <button type="button" class="chip" data-filter="hard">硬核挑战</button>
          </div>
        </div>

        <div class="card-grid" id="card-grid"></div>
      </div>
    `;

    const grid = document.getElementById("card-grid");
    const paint = (filter, query) => paintCards(grid, filterList(filter, query));
    bindToolbar(paint);
    paint("all", "");
  }

  function renderCatalog() {
    app.innerHTML = `
      <div class="container library">
        <header class="lib-head">
          <h1 class="lib-title">目录</h1>
        </header>
        <ol class="catalog">
          ${theorems
            .map(
              (t, i) =>
                `<li><a href="#/theorem/${t.id}"><span class="cat-i">${i + 1}</span>${t.title}</a><span class="cat-diff">${t.difficultyLabel}</span></li>`
            )
            .join("")}
        </ol>
      </div>
    `;
  }

  /* ---------- DETAIL ---------- */
  function renderDetail(id) {
    const t = findTheorem(id);
    if (!t) {
      app.innerHTML = `
        <div class="container library">
          <a class="back-link" href="#/">← 返回</a>
          <div class="empty">未找到该定理</div>
        </div>`;
      return;
    }

    const s = t.sections;
    const related = (t.related || []).map((rid) => findTheorem(rid)).filter(Boolean);

    // 用字符串拼接而不是套一层 template，避免正文里的 $ { } 被误解析
    app.innerHTML = [
      '<div class="container detail">',
      '<a class="back-link" href="#/">← 图书馆</a>',
      detailHeroHtml(t),
      '<div class="content-grid">',
      detailArticleHtml(s),
      detailSidebarHtml(t, s, related),
      "</div></div>"
    ].join("");

    app.querySelectorAll(".related button").forEach((btn) => {
      btn.addEventListener("click", () => go(`#/theorem/${btn.dataset.id}`));
    });

    if (window.Diagrams && typeof window.Diagrams.mount === "function") {
      window.Diagrams.mount(app);
    }
    kickMath();
  }

  function kickMath() {
    if (!window.MathRender || typeof window.MathRender.render !== "function") return;
    window.MathRender.render(app);
    setTimeout(() => window.MathRender.render(app), 50);
    setTimeout(() => window.MathRender.render(app), 300);
  }

  function detailHeroHtml(t) {
    return (
      '<header class="detail-hero">' +
      '<div class="labels">' +
      `<span class="difficulty ${difficultyClass[t.difficulty]}">${t.difficultyLabel}</span>` +
      (t.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("") +
      "</div>" +
      `<h1>${t.title}</h1>` +
      `<p class="one-liner">${t.oneLiner}</p>` +
      '<div class="people">' +
      (t.people || [])
        .map(
          (p) =>
            `<div class="person"><div class="role">${p.role}</div><div class="name">${p.name}</div><div class="years">${p.years}</div></div>`
        )
        .join("") +
      "</div></header>"
    );
  }

  function detailArticleHtml(s) {
    return (
      '<article class="article">' +
      section("sec-story", "背景与动机", "用日常语言讲：问题从哪来、谁在关心。", s.story) +
      section("sec-statement", "定理陈述", "先抓住结论，再看精确写法（公式用规范排版）。", s.statement) +
      (s.setup
        ? section("sec-setup", "记号与预备", "读证明前需要的符号和概念。", s.setup)
        : "") +
      (s.lemmas
        ? section("sec-lemmas", "预备引理", "后面证明会反复用到的小结论。", s.lemmas)
        : "") +
      section("sec-proof", "证明思路", "人话讲清「在干什么」，再跟上步骤与公式。", s.proof) +
      (s.deep
        ? section("sec-deep", "深入补充", "另一条路、历史或更强结论。", s.deep)
        : "") +
      section("sec-why", "意义与应用", "学它有什么用、连着哪些大问题。", s.why) +
      section("sec-try", "练习", "自己动手验一下，比只看有用。", s.try) +
      "</article>"
    );
  }

  function section(id, title, lead, body) {
    return (
      `<section class="block" id="${id}">` +
      `<h2>${title}</h2>` +
      `<p class="sec-lead">${lead}</p>` +
      (body || "") +
      "</section>"
    );
  }

  function detailSidebarHtml(t, s, related) {
    const nSetup = s.setup ? 1 : 0;
    const nLem = s.lemmas ? 1 : 0;
    let n = 1;
    const items = [];
    items.push(tocItem(String(n++).padStart(2, "0"), "背景与动机", "问题从哪来、谁在关心", "sec-story"));
    items.push(tocItem(String(n++).padStart(2, "0"), "定理陈述", "精确说法与符号", "sec-statement"));
    if (s.setup) items.push(tocItem(String(n++).padStart(2, "0"), "记号与预备", "读证明前要懂的词", "sec-setup"));
    if (s.lemmas) items.push(tocItem(String(n++).padStart(2, "0"), "预备引理", "证明会用到的小结论", "sec-lemmas"));
    items.push(tocItem(String(n++).padStart(2, "0"), "证明思路", "为什么结论成立", "sec-proof"));
    if (s.deep) items.push(tocItem("+", "深入补充", "另一条路 / 历史备注", "sec-deep"));
    items.push(tocItem("·", "意义与应用", "学它有什么用", "sec-why"));
    items.push(tocItem("·", "练习", "自己动手验一下", "sec-try"));

    const people = (t.people || [])
      .slice(0, 3)
      .map((p) => p.name)
      .join("；");

    return (
      '<aside class="sidebar">' +
      '<div class="side-card toc-pro">' +
      '<div class="toc-head"><h3>本页导读</h3>' +
      `<span class="toc-badge">${t.difficultyLabel || ""}</span></div>` +
      `<nav class="toc-nav" aria-label="本页章节">${items.join("")}</nav></div>` +
      '<div class="side-card side-meta"><h3>卡片信息</h3><dl class="meta-dl">' +
      `<div><dt>时代</dt><dd>${t.era || "—"}</dd></div>` +
      `<div><dt>领域</dt><dd>${(t.tags || []).slice(0, 3).join(" · ") || "—"}</dd></div>` +
      `<div><dt>难度</dt><dd>${t.difficultyLabel || "—"}</dd></div>` +
      (people ? `<div><dt>关键人物</dt><dd>${people}</dd></div>` : "") +
      "</dl></div>" +
      (related.length
        ? '<div class="side-card related"><h3>相关阅读</h3><p class="side-hint">同一思想圈里的其它定理</p>' +
          related
            .map((r) => {
              const sub = (r.oneLiner || "").slice(0, 42);
              const more = (r.oneLiner || "").length > 42 ? "…" : "";
              return `<button type="button" data-id="${r.id}"><span class="rel-title">${r.title}</span><span class="rel-sub">${sub}${more}</span></button>`;
            })
            .join("") +
          "</div>"
        : "") +
      "</aside>"
    );
  }

  function tocItem(num, title, sub, href) {
    return (
      `<a href="#${href}"><span class="toc-num">${num}</span>` +
      `<span class="toc-text"><strong>${title}</strong><small>${sub}</small></span></a>`
    );
  }

  window.addEventListener("hashchange", route);
  route();
})();
