/**
 * 定理图书馆 · 数学 + 物理 双库
 */
(function () {
  const app = document.getElementById("app");
  const theorems = window.THEOREMS || [];

  // 默认数学
  theorems.forEach((t) => {
    if (!t.field) t.field = "math";
  });

  const difficultyClass = {
    easy: "easy",
    medium: "medium",
    hard: "hard"
  };

  const FIELD_LABEL = {
    math: "数学",
    physics: "物理"
  };

  function route() {
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#\/?/, "").split("/");
    const page = parts[0] || "";
    const id = parts[1] || "";

    if (page === "theorem" && id) {
      renderDetail(id);
    } else if (page === "list") {
      renderCatalog(parts[1] || "all");
    } else if (page === "physics") {
      renderHome("physics");
    } else if (page === "math") {
      renderHome("math");
    } else {
      renderHome("all");
    }
    updateNav(page || "home");
    window.scrollTo(0, 0);
  }

  function updateNav(page) {
    document.querySelectorAll(".nav a").forEach((a) => {
      const key = a.getAttribute("data-nav");
      let on = false;
      if (key === "home") on = page === "" || page === "home" || page === "all";
      else if (key === "math") on = page === "math";
      else if (key === "physics") on = page === "physics";
      else if (key === "list") on = page === "list";
      else on = key === page;
      a.classList.toggle("active", !!on);
    });
  }

  function go(path) {
    location.hash = path;
  }

  function findTheorem(id) {
    return theorems.find((t) => t.id === id);
  }

  function countByField(field) {
    if (field === "all") return theorems.length;
    return theorems.filter((t) => (t.field || "math") === field).length;
  }

  function filterList(field, diffFilter, query) {
    const q = (query || "").trim().toLowerCase();
    return theorems.filter((t) => {
      const f = t.field || "math";
      if (field !== "all" && f !== field) return false;
      if (diffFilter !== "all" && t.difficulty !== diffFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.subtitle || "").toLowerCase().includes(q) ||
        t.oneLiner.toLowerCase().includes(q) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(q)) ||
        (t.people || []).some((p) => p.name.toLowerCase().includes(q)) ||
        f.includes(q) ||
        (FIELD_LABEL[f] || "").includes(q)
      );
    });
  }

  function paintCards(grid, list) {
    if (!list.length) {
      grid.innerHTML = `<div class="empty">无匹配结果</div>`;
      return;
    }
    grid.innerHTML = list
      .map((t) => {
        const field = t.field || "math";
        return `
      <button class="card" data-id="${t.id}" type="button">
        <div class="card-top">
          <div class="card-icon ${t.iconClass || ""}">${t.emoji || "•"}</div>
          <div class="card-badges">
            <span class="field-badge field-${field}">${FIELD_LABEL[field] || field}</span>
            <span class="difficulty ${difficultyClass[t.difficulty]}">${t.difficultyLabel || ""}</span>
          </div>
        </div>
        <h3>${t.title}</h3>
        <p>${t.oneLiner}</p>
        <div class="card-meta">
          ${(t.tags || []).slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <div class="card-footer">
          <span>${t.era || ""}</span>
        </div>
      </button>`;
      })
      .join("");

    grid.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => go(`#/theorem/${card.dataset.id}`));
    });
  }

  function bindToolbar(field, paint) {
    let diffFilter = "all";
    let query = "";
    const search = document.getElementById("search");
    const chips = document.getElementById("chips");
    const fieldTabs = document.getElementById("field-tabs");

    search.addEventListener("input", (e) => {
      query = e.target.value;
      paint(field, diffFilter, query);
    });
    chips.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        diffFilter = chip.dataset.filter;
        paint(field, diffFilter, query);
      });
    });
    if (fieldTabs) {
      fieldTabs.querySelectorAll("[data-field]").forEach((tab) => {
        tab.addEventListener("click", () => {
          const f = tab.getAttribute("data-field");
          if (f === "all") go("#/");
          else go(`#/${f}`);
        });
      });
    }
  }

  function fieldTabsHtml(active) {
    const items = [
      { id: "all", label: "全部", n: countByField("all") },
      { id: "math", label: "数学", n: countByField("math") },
      { id: "physics", label: "物理", n: countByField("physics") }
    ];
    return `
      <div class="field-tabs" id="field-tabs" role="tablist">
        ${items
          .map(
            (it) => `
          <button type="button" class="field-tab ${active === it.id ? "active" : ""}" data-field="${it.id}" role="tab">
            <span class="field-tab-label">${it.label}</span>
            <span class="field-tab-count">${it.n}</span>
          </button>`
          )
          .join("")}
      </div>`;
  }

  function renderHome(field) {
    field = field || "all";
    const title =
      field === "physics" ? "物理定理" : field === "math" ? "数学定理" : "定理图书馆";
    const sub =
      field === "physics"
        ? `${countByField("physics")} 条 · 力学 · 热学 · 电磁 · 光学 · 相对论 · 量子`
        : field === "math"
          ? `${countByField("math")} 条 · 大白话 · 证明与公式`
          : `${theorems.length} 条经典 · 数学 + 物理 · 大白话讲清楚`;

    app.innerHTML = `
      <div class="container library">
        <header class="lib-head">
          <div>
            <h1 class="lib-title">${title}</h1>
            <p class="lib-meta">${sub}</p>
          </div>
        </header>

        ${fieldTabsHtml(field)}

        <div class="toolbar">
          <div class="search">
            <input id="search" type="search" placeholder="搜：牛顿、熵、麦克斯韦、相对论、勾股…" aria-label="搜索" />
          </div>
          <div class="chips" id="chips">
            <button type="button" class="chip active" data-filter="all">全部难度</button>
            <button type="button" class="chip" data-filter="easy">好上手</button>
            <button type="button" class="chip" data-filter="medium">费点脑子</button>
            <button type="button" class="chip" data-filter="hard">硬核挑战</button>
          </div>
        </div>

        <div class="card-grid" id="card-grid"></div>
      </div>
    `;

    const grid = document.getElementById("card-grid");
    const paint = (f, d, q) => paintCards(grid, filterList(f, d, q));
    bindToolbar(field, paint);
    paint(field, "all", "");
  }

  function renderCatalog(fieldFilter) {
    fieldFilter = fieldFilter || "all";
    const groups = [
      { id: "math", title: "数学" },
      { id: "physics", title: "物理" }
    ];
    app.innerHTML = `
      <div class="container library">
        <header class="lib-head">
          <h1 class="lib-title">目录</h1>
          <p class="lib-meta">按学科浏览全部条目</p>
        </header>
        ${fieldTabsHtml(fieldFilter === "all" ? "all" : fieldFilter)}
        ${groups
          .filter((g) => fieldFilter === "all" || fieldFilter === g.id)
          .map((g) => {
            const list = theorems.filter((t) => (t.field || "math") === g.id);
            return `
            <section class="catalog-section">
              <h2 class="catalog-h">${g.title} <span class="catalog-n">${list.length}</span></h2>
              <ol class="catalog">
                ${list
                  .map(
                    (t, i) =>
                      `<li><a href="#/theorem/${t.id}"><span class="cat-i">${i + 1}</span>${t.title}</a><span class="cat-diff">${t.difficultyLabel || ""}</span></li>`
                  )
                  .join("")}
              </ol>
            </section>`;
          })
          .join("")}
      </div>
    `;
    const fieldTabs = document.getElementById("field-tabs");
    if (fieldTabs) {
      fieldTabs.querySelectorAll("[data-field]").forEach((tab) => {
        tab.addEventListener("click", () => {
          const f = tab.getAttribute("data-field");
          if (f === "all") go("#/list");
          else if (f === "math") go("#/math");
          else if (f === "physics") go("#/physics");
        });
      });
    }
  }

  function kickMath() {
    if (!window.MathRender || typeof window.MathRender.render !== "function") return;
    window.MathRender.render(app);
    setTimeout(() => window.MathRender.render(app), 50);
    setTimeout(() => window.MathRender.render(app), 300);
  }

  function detailHeroHtml(t) {
    const field = t.field || "math";
    return (
      '<header class="detail-hero">' +
      '<div class="labels">' +
      `<span class="field-badge field-${field}">${FIELD_LABEL[field]}</span>` +
      `<span class="difficulty ${difficultyClass[t.difficulty]}">${t.difficultyLabel || ""}</span>` +
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

  function section(id, title, lead, body) {
    return (
      `<section class="block" id="${id}">` +
      `<h2>${title}</h2>` +
      `<p class="sec-lead">${lead}</p>` +
      (body || "") +
      "</section>"
    );
  }

  function detailArticleHtml(s) {
    return (
      '<article class="article">' +
      section("sec-story", "背景与动机", "用日常语言讲：问题从哪来、谁在关心。", s.story) +
      section("sec-statement", "定理陈述", "先抓住结论，再看精确写法（公式用规范排版）。", s.statement) +
      (s.setup ? section("sec-setup", "记号与预备", "读证明前需要的符号和概念。", s.setup) : "") +
      (s.lemmas ? section("sec-lemmas", "预备引理", "后面证明会反复用到的小结论。", s.lemmas) : "") +
      section("sec-proof", "证明思路", "人话讲清「在干什么」，再跟上步骤与公式。", s.proof) +
      (s.deep ? section("sec-deep", "深入补充", "另一条路、历史或更强结论。", s.deep) : "") +
      section("sec-why", "意义与应用", "学它有什么用、连着哪些大问题。", s.why) +
      section("sec-try", "练习", "自己动手验一下，比只看有用。", s.try) +
      "</article>"
    );
  }

  function tocItem(num, title, sub, href) {
    return (
      `<a href="#${href}"><span class="toc-num">${num}</span>` +
      `<span class="toc-text"><strong>${title}</strong><small>${sub}</small></span></a>`
    );
  }

  function detailSidebarHtml(t, s, related) {
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
    const field = t.field || "math";

    return (
      '<aside class="sidebar">' +
      '<div class="side-card toc-pro">' +
      '<div class="toc-head"><h3>本页导读</h3>' +
      `<span class="toc-badge">${t.difficultyLabel || ""}</span></div>` +
      `<nav class="toc-nav" aria-label="本页章节">${items.join("")}</nav></div>` +
      '<div class="side-card side-meta"><h3>卡片信息</h3><dl class="meta-dl">' +
      `<div><dt>学科</dt><dd>${FIELD_LABEL[field]}</dd></div>` +
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
              const fb = FIELD_LABEL[r.field || "math"] || "";
              return `<button type="button" data-id="${r.id}"><span class="rel-title">${r.title}</span><span class="rel-sub">[${fb}] ${sub}${more}</span></button>`;
            })
            .join("") +
          "</div>"
        : "") +
      "</aside>"
    );
  }

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

    const s = t.sections || {};
    const related = (t.related || []).map((rid) => findTheorem(rid)).filter(Boolean);

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

  window.addEventListener("hashchange", route);
  route();
})();
