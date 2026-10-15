import { el } from './core.js';
import { fmtPct, fmtNum, quarterLabel } from './calc.js';
import { getLang } from './i18n.js';

const COPY = {
  zh: {
    title: '方法与数据',
    intro: (m) => `覆盖 ${quarterLabel(m.periods[0])} 至 ${quarterLabel(m.latest_period)} 共 ${m.periods.length} 个季度，最新季度有 ${fmtNum(m.universe.filers)} 家机构申报 13F。`,
    sources: ['数据来源', [
      'SEC Form 13F 数据集：机构持仓。按申报日期批量发布，申报期取自 PERIODOFREPORT。',
      'OpenFIGI：CUSIP 到股票代码和证券类型的映射。',
      'SEC EDGAR：SIC 行业代码、流通股本（dei:EntityCommonStockSharesOutstanding）。',
      'Yahoo Finance（yfinance）：日线复权价和拆股记录，用于拆股调整、回测和价格图。']],
    rules: ['处理规则', [
      '金额单位：2023-01-03 之前申报的金额以千美元为单位，统一换算成美元。',
      '修订：RESTATEMENT 替换原申报；NEW HOLDINGS 追加到原申报；类型为空的修订按 RESTATEMENT 处理。',
      '变动分类：先按拆股调整上期股数，然后：上期为 0 记为新建；本期为 0 记为清仓；变化超过 +2% 记为加仓，低于 −2% 记为减仓；其余记为不变。',
      '经理漏报某季度时，该季度留空；下一季度和最近一次实际申报比较。',
      '换手率 = min(买入额, 卖出额) ÷ 两期平均组合市值。金额按 13F 申报价（市值 ÷ 股数）估算。',
      '拥挤度 = 三项横截面百分位的平均：持有它的精选经理数、13F 持股占比、精选经理平均权重。',
      '克隆回测：每份 13F 首次申报日的下一个交易日，按申报市值权重买入前 150 大持仓，持有到下一次申报。"理想化"版本在季末建仓，用来衡量披露延迟的代价。基准为 SPY 全收益，夏普比率按无风险利率 0 计算。']],
    coverage: (c) => ['覆盖率', [
      `精选经理最新持仓中，能映射到股票代码的市值占比：${fmtPct(c.figi_value_pct)}`,
      `其中有价格数据的市值占比：${fmtPct(c.price_value_pct)}`,
      `未能映射的 CUSIP：${fmtNum(c.unmapped_cusips)} 个（多为债券、权证、已退市或外国证券）`]],
    limits: ['已知局限', [
      '13F 只披露美国上市的多头头寸，不含空头、现金和大部分外国股票；期权按标的名义价值申报。',
      '申报最多可在季末 45 天后才公开，看到时持仓可能已经变化。',
      '免费价格源可能缺少已退市股票，回测会因此偏乐观；页面显示每次再平衡的价格覆盖率。',
      '13F 持股占比用公司全部股本作分母；多类股公司（如 GOOGL/GOOG）会因此偏低。比例超过 120% 视为数据冲突，不显示。',
      'SIC 到行业是近似映射，不等于 GICS 官方分类。']],
    congress: ['国会议员交易', [
      '众议院：书记员办公室每年的披露索引（FD.zip）加上每份交易报告（PTR）的 PDF。电子申报用文字层解析，兼容 2021 年起的两种版式；纸质扫描件跳过。',
      '参议院：eFD 系统（efdsearch.senate.gov）的电子交易报告 HTML 表格。访问前需接受网站的使用声明：数据不得用于商业或募捐目的。',
      '议员资料：unitedstates/congress-legislators 公开数据集（党派、州、选区、委员会），照片来自同一项目，属美国政府公有领域作品。',
      '收益：以报告的提交日为信息公开日，从下一个交易日起计算相对 SPY 的超额收益（1、3、6 个月）；只对股票交易计算胜率和事件研究。',
      '局限：金额只有区间；同一笔交易可能拆成多行；交易日期明显错误（早于 2012 年或晚于申报日）的记录被剔除。']],
    insiders: ['内部人交易（Form 4）', [
      '数据：SEC 内部人交易数据集（Insider Transactions Data Sets，按季度发布的 Form 3/4/5 表格），加上当前季度 EDGAR 每日索引里的 Form 4 原文 XML。只用原始 Form 4；修订版 4/A 会重复计数，不使用。',
      '信号只用非衍生品表里的公开市场买入（P）和卖出（S）。期权行权（M）、授予（A）、扣税（F）、赠与（G）等只在个人档案里计数。同一份申报的多行交易合并成一笔，价格取成交量加权均价。',
      '联合申报（如基金和它的普通合伙人一起申报）只归到一位申报人：优先高管或董事，否则取 CIK 最小者，避免重复计算人数和金额。',
      '10b5-1：2023 年 4 月起 Form 4 有 10b5-1 勾选框，以勾选为准；更早的申报（以及少数漏勾的）在脚注或备注里提到 Rule 10b5-1 计划时也标记为计划交易。计划交易单独标出，不计入集中买入。',
      '集中买入：同一公司在 30 个自然日内（含首尾）至少 3 位不同内部人公开市场买入，合计至少 10 万美元。按申报顺序回放，事件日期是让条件成立的那份 Form 4 的申报日；之后 30 天内的新买入并入同一事件。窗口、人数、金额都可在 settings.yaml 中调整。',
      '事件研究：第 0 天是 Form 4 申报日之后的第一个交易日（Form 4 常在收盘后提交，这是第一个能实际跟进的收盘价）。计算第 −20 到 +250 个交易日相对 SPY 的累计超额收益，阴影是均值的 95% 置信区间（正态近似）。第 0 天之前的值是“从那天到第 0 天的超额涨幅”取负，所以事前上涨的股票曲线向上走到 0。每个交易日的横截面两端各截尾 0.1%，剔除免费价格源里的错误报价（例如一年涨 1,900 倍）。',
      '市值分组：事件前最近一次申报的流通股本（SEC dei:EntityCommonStockSharesOutstanding）乘以内部人申报的成交价（不用复权收盘价，以免日后的合股把市值放大）；小盘 < 20 亿美元，中盘 20–100 亿，大盘 > 100 亿。职务分组：头衔含 CEO/CFO 的归 CEO/CFO，其次高管、董事、10% 大股东。',
      '胜率：买入后 3、6、12 个月（63、126、250 个交易日）跑赢 SPY 的比例，只统计已满期的买入。',
      '基准是大盘指数 SPY：这段时间小盘股整体大幅跑输大盘，所以以小盘为主的集中买入即使没有信息含量，超额收益也会偏负。按市值分组可以部分看出这一点。',
      '局限：交易代码 P 同时涵盖公开市场买入和私下认购（如参与定向增发），Form 4 无法区分；免费价格源缺少很多已退市的小盘股，这些事件不进入收益统计；股票代码按发行人 CIK 对应到 SEC 当前代码，代码被别的公司重用时不计算收益。']],
    lab: ['策略实验室怎么算', [
      '照着买：每笔公开的买入，在公开后的下一个交易日收盘价等权买入，持有 3 个月（63 个交易日）或 1 年（252 个交易日）。同时持有多笔时，每天按当天在持的仓位等权平均；没有持仓时为现金（收益 0）。',
      '“有战绩”是滚动检验（walk-forward）：只看这位交易人此前已经有结果的买入（至少 5 笔、结果在当天之前已知），平均跑赢 SPY 才算。不会用到未来的数据。',
      '四条规则：有战绩的经理买入近 3 个月涨 ≥10% 的股票；过往买入平均跑赢 SPY ≥2% 的经理；60 天内至少 3 位议员买同一只股票；内部人买入后 60 天内有基金或议员也买。',
      '这些阈值是在看过 2022–2026 年的数据之后设定的，所以存在过拟合风险；真正的检验是之后的表现。年化收益按复利计算，未扣交易成本和税；低于 2 美元的股票不计入，单日涨跌超过 ±50% 的价格按 ±50% 处理（避免免费行情数据的错误）。',
      '基准：SPY（标普 500 市值加权）、RSP（标普 500 等权）、IWM（罗素 2000 小盘股）、QQQ（纳斯达克 100），都是含分红的全收益。']],
    disclaimer: '本站仅供研究与教育用途，不构成投资建议。',
  },
  en: {
    title: 'Methods & data',
    intro: (m) => `Covers ${m.periods.length} quarters from ${quarterLabel(m.periods[0])} to ${quarterLabel(m.latest_period)}; ${fmtNum(m.universe.filers)} institutions filed a 13F in the latest quarter.`,
    sources: ['Sources', [
      'SEC Form 13F data sets: institutional holdings, published in bulk by filing date; the report period comes from PERIODOFREPORT.',
      'OpenFIGI: maps CUSIPs to tickers and security types.',
      'SEC EDGAR: SIC industry codes and shares outstanding (dei:EntityCommonStockSharesOutstanding).',
      'Yahoo Finance (yfinance): daily adjusted prices and splits, used for split adjustment, backtests and price charts.']],
    rules: ['Processing rules', [
      'Units: filings made before 2023-01-03 report value in thousands of dollars; everything is converted to dollars.',
      'Amendments: RESTATEMENT replaces the original; NEW HOLDINGS is added to it; amendments with no type are treated as restatements.',
      'Change types: last quarter’s shares are split-adjusted first. Zero before means New; zero now means Sold out; above +2% is Added, below −2% is Trimmed; anything else is Unchanged.',
      'If a manager skips a quarter, that quarter is left blank and the next one is compared with the last actual filing.',
      'Turnover = min(buys, sells) ÷ average book value of the two quarters, priced at the 13F implied price (value ÷ shares).',
      'Crowding = average of three cross-sectional percentiles: tracked managers holding it, share held by 13F filers, and average tracked-manager weight.',
      'Clone backtest: on the trading day after each 13F is first filed, buy the top 150 positions at reported value weights and hold until the next filing. The idealised version buys at quarter end, which shows the cost of the disclosure lag. Benchmark is SPY total return; Sharpe uses a 0% risk-free rate.']],
    coverage: (c) => ['Coverage', [
      `Share of tracked managers’ latest equity value mapped to a ticker: ${fmtPct(c.figi_value_pct)}`,
      `Share with price data: ${fmtPct(c.price_value_pct)}`,
      `Unmapped CUSIPs: ${fmtNum(c.unmapped_cusips)} (mostly bonds, warrants, delisted or foreign securities)`]],
    limits: ['Known limitations', [
      '13F covers long positions in US-listed securities only: no shorts, cash or most foreign stocks. Options are reported at underlying notional.',
      'Filings can arrive up to 45 days after quarter end, so positions may already have changed.',
      'Free price sources can miss delisted stocks, which flatters backtests; each rebalance shows its price coverage.',
      'Share held by 13F filers uses total shares outstanding, so multi-class companies (e.g. GOOGL/GOOG) read low. Ratios above 120% are treated as data conflicts and hidden.',
      'The SIC-to-sector mapping is approximate and is not the official GICS classification.']],
    congress: ['Congress trades', [
      'House: the Clerk’s yearly disclosure index (FD.zip) plus one PDF per periodic transaction report. E-filed PDFs are parsed from their text layer, covering both layouts used since 2021; scanned paper filings are skipped.',
      'Senate: electronic PTR tables from eFD (efdsearch.senate.gov). Searching requires accepting the site’s notice that the data may not be used for commercial or fundraising purposes.',
      'Member data: the public unitedstates/congress-legislators dataset (party, state, district, committees); photos come from the same project and are US government works in the public domain.',
      'Returns: the report’s filing date is treated as the day the trade became public; excess returns vs SPY run from the next trading day (1, 3 and 6 months). Hit rates and the event study use stock trades only.',
      'Limits: amounts are ranges; one trade can be split across lines; records with impossible trade dates (before 2012 or after the filing date) are dropped.']],
    insiders: ['Insider trades (Form 4)', [
      'Data: SEC Insider Transactions Data Sets (quarterly Form 3/4/5 tables), plus the raw Form 4 XML listed in EDGAR’s daily index for the current quarter. Original Form 4s only; 4/A amendments restate earlier filings and would double count.',
      'Signals use open-market purchases (P) and sales (S) from the non-derivative table only. Option exercises (M), grants (A), tax withholding (F), gifts (G) and the rest are only counted on insider profiles. Lines in one filing are combined into a single trade at the volume-weighted price.',
      'Joint filings (say, a fund and its general partner) are credited to one reporting owner: an officer or director if there is one, otherwise the lowest CIK, so insiders and dollars aren’t double counted.',
      '10b5-1: since April 2023 Form 4 has a 10b5-1 checkbox, which is used when present. Earlier filings (and a few with the box left unticked) are flagged when a footnote or remark mentions a Rule 10b5-1 plan. Plan trades are labelled and never count towards cluster buys.',
      'Cluster buy: at least 3 different insiders buying on the open market within 30 calendar days (inclusive), $100k or more combined. Filings are replayed in filing order and the event is dated by the Form 4 that completed the cluster; buys within 30 days after that join the same event. Window, head count and amount are set in settings.yaml.',
      'Event study: day 0 is the first trading day after the Form 4 filing date (many are filed after the close, so this is the first close you could actually trade at). Cumulative excess return vs SPY runs from day −20 to +250; the band is a 95% confidence interval for the mean (normal approximation). Before day 0 the value is minus the excess return from that day into day 0, so a stock that rallied into the event climbs to 0. Each day’s cross-section is winsorized at 0.1% in each tail to remove bad prints in the free price feed (such as a 1,900-fold gain in a year).',
      'Market cap groups: the latest reported shares outstanding (SEC dei:EntityCommonStockSharesOutstanding) times the price insiders paid (not the split-adjusted close, which a later reverse split would inflate); small < $2B, mid $2–10B, large > $10B. Role groups: titles naming CEO/CFO first, then other officers, directors and 10% owners.',
      'Hit rate: share of buys that beat SPY 3, 6 and 12 months later (63, 126 and 250 trading days), counting only buys old enough to score.',
      'The benchmark is SPY, a large-cap index. Small caps lagged it badly over this period, so cluster buys (mostly small caps) would show negative excess returns even with no information in them; the market-cap split shows part of this.',
      'Limits: code P covers both open-market and private purchases (such as joining a placement), which Form 4 doesn’t distinguish. The free price source misses many delisted small caps, so those events drop out of return statistics. Tickers come from SEC’s current CIK-to-ticker list; when a symbol now belongs to another company no return is computed.']],
    lab: ['How the Strategy Lab works', [
      'Copying: every disclosed buy is bought equal-weight at the close of the next trading day after disclosure and held for 3 months (63 trading days) or 1 year (252). When several positions are open, each day’s return is the equal-weighted average of the open positions; with nothing open the portfolio is in cash (0%).',
      '“Proven” is walk-forward: a trader counts as proven only if their earlier buys whose 3-month outcome was already known on that day (at least 5) beat SPY on average. No future data is used.',
      'The four rules: proven managers buying stocks up ≥10% over the prior 3 months; managers whose earlier buys beat SPY by ≥2% on average; at least 3 members of Congress buying the same stock within 60 days; an insider buy that a fund or member of Congress also bought within 60 days.',
      'These thresholds were set after looking at 2022–2026 data, so they carry overfitting risk; the real test is how they do from here. Annual returns are compounded and exclude trading costs and taxes. Stocks under $2 are skipped and single-day moves beyond ±50% are capped (free price data has glitches).',
      'Benchmarks: SPY (S&P 500, cap-weighted), RSP (S&P 500 equal-weight), IWM (Russell 2000 small caps) and QQQ (Nasdaq-100), all total return including dividends.']],
    disclaimer: 'For research and education only. Not investment advice.',
  },
};

export async function render(app, _p, { meta }) {
  const c = COPY[getLang()];
  const section = ([h, items]) => [el('h2', {}, h), el('ul', {}, items.map(x => el('li', {}, x)))];
  app.append(el('div', { class: 'doc' },
    el('h1', { class: 'section-title' }, c.title),
    el('p', {}, c.intro(meta)),
    section(c.sources), section(c.rules), section(c.coverage(meta.coverage)), section(c.lab), section(c.limits), section(c.congress), section(c.insiders),
    el('p', { class: 'muted' }, c.disclaimer)));
}
