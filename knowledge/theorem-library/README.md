# 定理图书馆 · Theorem Library

大白话讲经典数学定理：背景、人物、证明思路、KaTeX 公式与交互图解。

当前约 **30+** 条（含费马小定理、贝叶斯、柯西–施瓦茨、二项式、余弦定理、七桥、泰勒、夹逼等）。

## 打开

浏览器打开本目录下的 [`index.html`](./index.html) 即可（纯静态，无需后端）。

公式渲染依赖 CDN 上的 KaTeX，首次打开需联网。

## 结构

```
theorem-library/
├── index.html
├── css/style.css
├── js/
│   ├── theorems.js          # 定理正文
│   ├── theorems-extra.js    # 扩展定理 + 图示注入
│   ├── plain-talk.js        # 大白话层
│   ├── diagrams.js          # 交互图示
│   ├── diagrams-detail.js   # 细交互
│   ├── math-render.js       # KaTeX
│   └── main.js              # 路由与页面
└── README.md
```

## 在 mw_lab 中的位置

`knowledge/theorem-library/` — 与 `knowledge/itv.html` 同属知识区。
