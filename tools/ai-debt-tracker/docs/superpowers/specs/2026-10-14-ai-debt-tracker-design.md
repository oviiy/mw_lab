# AI Debt Tracker — 设计文档

- 日期：2026-10-14
- 作者：Michael Wang
- 状态：待审阅

## 1. 目标与读者

**一句话**：用固定收益的视角，把「AI 扩张靠借钱」这件事一笔一笔理清楚并可视化——*The chips wear out in five years. The bonds last forty.*

**读者**
- 学术读者（教授、同行）：要求口径清晰、可追溯、可复现、可引用。
- 开发者 / AI 社区：要求首屏有冲击力、图可以直接截图传播、交互好玩。

**成功标准**
- 访客 10 秒内获得一个可转述的结论（招牌图：服务器寿命 vs 债券期限）。
- 学术读者 5 分钟内能看懂口径与方法，并能点到每个数据点的 SEC 原文。
- 零服务器、零运维：静态站点 + 每周自动更新。
- 作为开源项目可独立成立：干净的仓库、可复现的管线、可引用的数据集。

**非目标（v1 不做）**
- 单只债券的二级市场利差（FINRA TRACE 无免费批量接口）。
- 资金循环网络图（Nvidia / OpenAI / Oracle / CoreWeave，只能靠新闻整理）。
- 用户账号、实时行情、数据库、后端 API。

## 2. 范围与口径

**发行人名单（v1）**：Meta、Microsoft、Alphabet、Amazon、Oracle、CoreWeave，以及其他 AI 重资本开支公司（最终名单在 `issuers.yaml` 中维护，每家附入选理由）。时间范围为 2024-01-01 至今。

**「AI 债务」口径**
- **主口径**：名单内发行人在时间范围内发行的全部公开债券。网页措辞统一为「为 AI 扩张而借的钱」（debt raised by AI's biggest spenders），不使用「AI 专用债」的说法。
- **ai_flag 标记**：由 LLM 阅读募集用途原文，打 `explicit`（明确提及 AI / 数据中心 / 算力）或 `general` 标签。网页提供「只看 explicit」开关。
- **表外 / 私募交易**（如 Meta–Blue Owl Hyperion SPV）：不计入主口径总额，单独列为一张手工维护的小表，每条附公开来源链接。
- 口径、局限性和已知遗漏写入 Method 页。

## 3. 数据源

所有数据源均免费、无需 API key（2026-10-14 已实测可访问）。

| 数据源 | 用途 | 接口 |
|---|---|---|
| SEC EDGAR 全文搜索 | 发现 FWP / 424B2 定价文件 | `efts.sec.gov/LATEST/search-index` |
| SEC EDGAR 文件 | 债券条款原文 | `www.sec.gov/Archives/...` |
| SEC XBRL API | 资本开支、经营现金流、长期债务 | `data.sec.gov/api/xbrl/companyconcept` |
| FRED | ICE BofA IG / HY OAS 指数、美债收益率 | `fred.stlouisfed.org/graph/fredgraph.csv` |
| 手工 YAML | 服务器折旧年限（引用 10-K 原文）、表外交易 | 仓库内维护 |

SEC 访问规范：带 User-Agent（含联系邮箱），每秒不超过 10 次请求。

## 4. 网站体验

**视觉方向**：Editorial Paper（FT / Economist 数据新闻风）。米色纸张背景，衬线标题，红 `#990f3d` / 蓝 `#0f5499` 双色强调，正文与数字使用无衬线字体。

**页面结构（单页）**
1. **首屏**：标题 + AI 债务总额（从 0 计数到当前值）+ 发行人数 / 交易数。两个入口：Read the story ↓ / Explore the data →。
2. **五章滚动叙事**：左侧文字滚动，右侧图表固定并随段落变化（高亮、缩放、注释）。手机端改为上下排列。
   - Ch1 How much：按发行人堆叠的累计发行面积图。
   - Ch2 Who's borrowing：气泡时间线（x = 发行日，y = 发行人，大小 = 金额）。
   - Ch3 What the market charges：AI 新债发行利差（T+bp）散点 vs IG OAS 指数线。
   - Ch4 Where the money goes：资本开支 = 经营现金流 + 新增债务的瀑布图，以及「债务融资比例」。
   - Ch5 The mismatch ★：服务器寿命条 vs 最长债券期限条依次生长，下方接到期墙。
3. **Explorer**：筛选器（发行人 / 年份 / 券种 / 期限 / ai_flag）+ 期限 × 利差散点（可刷选）+ 可排序明细表，三者联动；筛选状态写入 URL。
4. **Data & Method**：口径、方法、LLM 抽取与校验、局限性、数据集下载（CSV / JSON）、BibTeX、嵌入代码。

**通用交互**
- 悬停弹出债券卡片（金额 / 票息 / 期限 / 利差 / 抽取依据原文），附「查看 EDGAR 原文 ↗」。
- 点击图例切换发行人。
- 每张图右上角提供：分享（带数据的 OG 卡片）、嵌入（iframe，`/embed/[chart]`）、下载 PNG。

**体验质量**
- 每张图提供数据表格作为无障碍替代；支持键盘导航。
- 开启 `prefers-reduced-motion` 时关闭动画。
- 数据文件小于 1MB；Lighthouse 性能评分不低于 95。

## 5. 数据管线

```
issuers.yaml ─▶ 1 Discover ─▶ 2 Fetch ─▶ 3 Extract (Claude) ─▶ 4 Validate ─┬▶ 5 Enrich ─▶ 6 Publish ─▶ 7 Ship
                                                                          └▶ review 队列 ─(overrides.yaml)─┘
```

1. **Discover**：按 CIK 名单搜索 2024 年以来的 FWP / 424B2 文件。
2. **Fetch**：下载原文，按内容哈希缓存（缓存目录不提交）。
3. **Extract**：Claude 结构化输出（JSON schema），一份文件可能抽出多个 tranche。字段见第 6 节；同时保存 `extract_quote`（抽取依据的原文片段）。
4. **Validate**
   - 各 tranche 金额之和 = 文件声明的发行总额。
   - 到期日晚于发行日；票息在 0–15% 之间；利差在 0–1000bp 之间。
   - **收益率交叉验证**：由票息、价格、期限算出收益率，减去同期基准美债收益率（FRED），与文件声明的 T+bp 相差不超过 5bp。
   - 失败的记录进入 `review/queue.csv`，人工通过 `overrides.yaml` 修正后才能发布。
5. **Enrich**：用 CUSIP 去重（同一笔交易的 FWP 与 424B2）；合并 FRED 指数、XBRL 财务数据、折旧年限。
6. **Publish**：输出 `data/public/{bonds.csv, bonds.json, issuers.json, metrics.json, offbalance.json}`，带数据集版本号与生成时间。
7. **Ship**：GitHub Action 每周运行；数据有变化时开 PR，附变更摘要（如「本周新增 3 只债，+$12B」）。人工合并后 Astro 构建并部署到 Vercel。

## 6. 数据模型

**bonds**（一行 = 一个 tranche）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | str | `{cusip}` 或 `{accession}-{n}` |
| issuer, cik | str | |
| cusip | str? | 去重键 |
| issue_date, maturity | date | |
| tenor_years | float | 派生字段 |
| amount_usd | int | |
| currency | str | 非美元按发行日汇率折算，保留原币种 |
| coupon | float | % |
| price | float? | 发行价 |
| spread_bp | int? | 相对基准美债 |
| benchmark | str? | 如 `UST 30Y` |
| bond_type | enum | `ig_senior` / `hy` / `convertible` / `abs` / `other` |
| proceeds_text | str | 募集用途原文 |
| ai_flag | enum | `explicit` / `general` |
| source_url | str | EDGAR 原文链接 |
| extract_quote | str | 抽取依据的原文片段 |
| validation | enum | `pass` / `override` |

**issuers**：`cik, name, ticker, inclusion_reason, server_useful_life_years, useful_life_source_url`，以及按年的 `capex`、`operating_cash_flow`、`long_term_debt`。

**metrics**：首屏总额、按发行人与年份的汇总、到期墙分桶、IG / HY OAS 时间序列。

## 7. 仓库结构

```
ai-debt-tracker/
├─ pipeline/               # Python 3.12 + uv
│  ├─ aidebt/ discover.py fetch.py extract.py validate.py enrich.py publish.py
│  ├─ config/ issuers.yaml useful_life.yaml off_balance_sheet.yaml overrides.yaml
│  └─ tests/  fixtures/    # 真实 FWP 原文样本，测试时不联网
├─ eval/                   # 手工标注的抽取评测集（约 15 份文件）
├─ data/public/            # 发布的数据集（CC-BY 4.0）
├─ web/                    # Astro + React islands + D3 + Motion
│  ├─ src/charts/          # 每张图一个独立组件，只接收数据作为 props
│  ├─ src/story/           # 各章节 MDX 文案
│  └─ src/pages/embed/[chart].astro
├─ .github/workflows/ ci.yml update-data.yml
├─ README.md  CONTRIBUTING.md  CITATION.cff  LICENSE (MIT)  DATA_LICENSE (CC-BY-4.0)
```

## 8. 错误处理

- EDGAR 或 FRED 访问失败：保留上一版数据集，Action 报错停止，不发布部分数据。
- 抽取或校验失败：记录进入复核队列，不出现在网站上。
- 网站只读取一个完整的数据集版本（原子发布）。
- LLM 调用设置超时与重试；API key 存放在 GitHub Secret 中。

## 9. 测试

- **抽取评测**：在 `eval/` 中的标注集上，关键字段（金额、到期日、票息、利差）准确率必须达到 100%，否则 CI 失败。评测结果写入 README。
- **管线单元测试**：校验规则、收益率交叉验证、CUSIP 去重、汇总计算，全部使用本地 fixtures。
- **前端**：Vitest 测数据转换函数；Playwright 做冒烟测试，并对每张图做截图快照。
- **CI**：类型检查、lint、测试、构建、Lighthouse。

## 10. 开源包装

- README 首屏放演示 GIF 与一句话结论；附「如何复现」三条命令。
- 代码使用 MIT 许可，数据使用 CC-BY 4.0。
- 提供 `CITATION.cff`；每个数据集版本发布 GitHub Release，并同步到 Zenodo 获取 DOI。
- `CONTRIBUTING.md`：新增发行人只需修改 YAML 并提 PR。

## 11. 成本

- 首次抽取几百份文件，Claude API 费用约几美元；之后每周增量更新，几乎可以忽略。
- 托管：Vercel / GitHub Pages 免费额度。

## 12. 里程碑

| 版本 | 内容 | 可发布 |
|---|---|---|
| v0.1 | 数据管线 + 数据集 + 抽取评测集 | 数据集 |
| v0.2 | 首屏 + Ch5 期限错配图 + 分享卡片 | ✅ 首次传播 |
| v0.3 | Ch1–Ch4 | |
| v1.0 | Explorer、嵌入、Method 页、DOI | ✅ 正式发布 |

## 13. 风险与待定事项

- **FWP 格式不统一**：不同承销商的模板差异较大 → 依靠评测集 + 复核队列兜底。
- **非公开发行（144A）**：CoreWeave 等公司的部分债券没有 FWP → 从 8-K / 10-Q 补录，标记 `source_type = filing_note`。
- **口径争议**：「大公司的一般公司用途债不算 AI 债」 → 用 ai_flag 开关 + Method 页正面回应。
- **折旧年限变化**：公司会调整服务器折旧年限（如延长或缩短） → `useful_life.yaml` 按年份记录，并在图上注明。
- **发行人最终名单**：v0.1 开始时确认。

## 14. Implementation notes (2026-10-14)

Deviations from the plan above, decided while building:

- **Extraction cache.** Every LLM extraction is committed to `pipeline/extractions/<accession>.json` and stamped with the hash of the source text it was made from. When the source changes, the cached extraction is treated as stale. The Claude API is only called for filings not yet in the cache. The initial 52 extractions were produced by Claude agents in a development session using the same prompt and schema.
- **Evaluation.** The gold set was labelled by a different model, blind to the pipeline output: 16 filings, 87 tranches. Score: 100% on tranche recall, precision, amount, maturity, coupon and spread. A test injects errors to confirm the eval is not vacuous.
- **Validation** additionally recomputes YTM from price, coupon and dates, to within 5bp.
- **Scope.** Microsoft is tracked even though it issued no bonds. Its finance-lease growth (+$51.7B) is the counterpoint in chapter 2. Meta's Louisiana JV figures come from Meta's own 10-K.
- **Hosting** is GitHub Pages via `deploy.yml`, with a configurable `BASE_PATH`. Vercel works unchanged.
- **Share cards.** A single OG image is rendered from live data by `web/scripts/make_og.py`. Per-chart PNGs are produced client-side by the "Save image" button.

## 15. Chapter: where the money goes, how the gap is filled, can it be serviced (2026-10-15)

**Goal.** Extend the debt-side story with the asset side, in the same paper: capex (quarterly), the funding gap and what fills it, and debt-service capacity. The headline numbers and their definitions are unchanged; everything here adds new files and new `metrics.json` keys.

**Pipeline.**
- `quarterly.py` reads XBRL company facts (one request per issuer). YTD cash-flow facts are differenced into single quarters (Q4 = FY − 9M). Direct ~90-day facts are used when reported. Fiscal years are found from the shared start date of YTD facts and named for the calendar year they end in. Tags are tried in order per period, and a derived quarter may combine tags across a re-tag (recorded as `TagA-TagB`).
- `segments.py` reads cloud revenue from inline XBRL (segment / product members), plus Microsoft's Azure growth sentence. Each candidate is validated: its quote must be verbatim in the filing and must contain the number. All candidates are written to `data/review/segments_queue.json`; only validated ones are published.
- `lease_commitments.yaml` holds hand-curated entries with verbatim quotes, re-verified on every run. A newer filing that discloses not-yet-commenced leases flags the entry for update. This flag already caught Amazon's 10-Q update ($96B → $137B).
- `assets.py` holds pure functions: funding gap (identity gap + net_debt + cash_drawdown + other = 0, with a rule for assumed zeros), capex intensity, YoY growth, TTM interest coverage, and the depreciation wave (half-year straight-line, life by vintage from `useful_life.yaml` history, server share from `assumptions.yaml`).
- New `metrics.json` keys: `funding_gap`, `capex_intensity`, `capex_vs_cloud_growth`, `interest_coverage`, `depreciation_wave`. New files: `quarterly.json`, `segments.json`, `commitments.json`.

**Site.** A new chapter 5 after Figure 6 adds Figures 7–11 (quarterly capex with intensity, waterfall, growth small multiples, coverage, depreciation wave with sliders) and Table 2 (commitments). Figure and table numbers come from one registry (`web/src/lib/figures.ts`); later figures renumber to 12–14 and the sensitivity table to Table 3. Cash flow and revenue use a third neutral ink, `--flow`. Every new figure has an embed page, PNG export, notes and a linked source.

**Verification.** Pipeline: 40 tests, including YTD differencing for June and May fiscal years, tag fallback, the gap identity, depreciation, and quote rejection. Web: browser/pipeline parity for the depreciation wave. Eval gate still 100%. The latest-quarter capex and OCF for all six issuers were checked against the printed 10-Q/10-K cash-flow statements.

**Decisions.**
- `SEC_USER_AGENT` is required. The SEC returns 403 without a real contact email, so there is no default.
- Meta has no cloud segment, so total revenue is used instead.
- Oracle's measure is "cloud revenues (IaaS + SaaS)", `orcl:CloudRevenuesMember`.
