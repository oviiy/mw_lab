# 聪明钱追踪器 · 第一阶段实施计划（13F 核心）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 SEC 公开的 13F 数据，构建一个静态站点，包含总览、20 位精选经理的档案页、个股透视页和方法页。数据由 Python 预计算，前端用 ECharts 渲染。

**Architecture:**
- `smart-money/build/` 是 Python 构建管线：下载 SEC 13F 批量数据，用 DuckDB 清洗；然后用 OpenFIGI 映射代码、从 SEC 取行业和流通股本、从 yfinance 取价格和拆股；计算各项指标和克隆回测；最后写出分片 JSON 到 `smart-money/data/`。
- `smart-money/index.html` 加 `js/` 是无构建步骤的 ES module 前端，用 hash 路由，按需加载 JSON。

**Tech Stack:**
- 构建：Python 3.12（venv）、duckdb、pandas、pyarrow、requests、pyyaml、yfinance、jsonschema、pytest。
- 前端：原生 JS（ES modules）、ECharts 5.5.1（CDN），用 Node 自带的 `node --test` 测试。

**Spec:** `smart-money/docs/specs/2026-10-15-smart-money-design.md`

## Global Constraints

- 只用公开数据源：SEC EDGAR、OpenFIGI、yfinance。不使用任何雇主的数据、代码或账号。
- SEC 请求头格式为 `User-Agent: smart-money research <个人邮箱>`。邮箱从 `smart-money/.env` 的 `SEC_CONTACT_EMAIL` 读取，`.env` 不提交。全局限速不超过 10 次/秒（请求间隔 ≥0.11 秒）。
- 原始下载放在 `smart-money/build/cache/`，已 gitignore。仓库只提交 `smart-money/data/*.json`，行情只保留展示用的周频收盘价。
- 2023-01-03 之前申报的 13F `VALUE` 单位是千美元，之后是美元，按申报日期换算。
- 持仓变动阈值默认 2%（`settings.yaml: change_threshold`）。
- 体积预算：`data/` 总计不超过 50 MB，单个经理 JSON 不超过 300 KB，单只股票 JSON 不超过 100 KB。
- 第一阶段范围：20 位精选经理、最近 20 个完整季度。Form ADV 推迟到第二阶段，档案卡只显示 13F 市值。
- 视觉沿用 execution-tca 的浅色配色：`--bg #f7f8f5`，强调色 `#0f766e`；字体为 Inter、JetBrains Mono、Source Serif 4。界面文字用中文。
- 前端是 ES modules，必须通过 http 访问，不能直接 file:// 打开。`smart-money/package.json` 中声明 `"type":"module"`。
- 本机 shell 的 `NODE_OPTIONS` 与 node 默认参数冲突，所有 node 命令都写成 `env -u NODE_OPTIONS node ...`。
- 头像只用首字母徽章，不用照片。每条经理简介事实都要有公开来源 URL。

## Review Focus

以下五类情况没有被任何单一任务的主流程覆盖，但最容易出问题，各自的测试已加到对应任务里：

1. **经理漏报某个季度：** 不能把下一季度显示成"全部清仓"再"全部新建"。应该和上一次实际申报做比较，漏报季度显示为空。测试在 Task 7 和 Task 9。
2. **CUSIP 映射不到代码：** 页面上显示发行人名称，不生成链接，不崩溃；股票页不为它生成文件。测试在 Task 9。
3. **两季度之间发生拆股：** 不能误判为加仓或减仓。测试在 Task 7 和 Task 9。
4. **访问未收录的股票或不存在的经理 CIK：** 显示中文错误卡片和"返回总览"链接，不白屏。由 Task 11 的路由错误处理负责，在 Task 15 中手动验证。
5. **回测缺价格或季度太少：** 缺价格的持仓按权重剔除，并显示覆盖率；少于 2 次再平衡时 `backtest` 为 `null`，页面给出说明。测试在 Task 8 和 Task 9。

---

## 文件结构

```
smart-money/
  .gitignore  .env.example  package.json  README.md
  index.html  styles.css
  js/
    calc.js          纯函数：格式化、路由解析、搜索、排序、桑基数据（有测试）
    calc.test.js
    core.js          JSON 加载与缓存、DOM 辅助函数、表格组件
    charts.js        ECharts 挂载、统一销毁、主题
    main.js          启动、路由、搜索框
    page-home.js  page-manager.js  page-stock.js  page-methods.js
  data/              构建产物（提交）
  build/
    requirements.txt  pytest.ini  conftest.py  run.py  check_links.py
    sic_sectors.csv
    config/settings.yaml  config/managers.yaml
    sm/
      __init__.py
      config.py      路径、配置加载、.env
      sec.py         SEC 限速、缓存客户端
      ingest_13f.py  索引页解析、zip 转 parquet
      clean.py       申报筛选、修订合并、持仓表、完整季度
      figi.py        OpenFIGI 映射
      companies.py   SEC 代码/CIK、SIC、流通股本
      sectors.py     SIC 到行业
      prices.py      价格源接口、yfinance、拆股因子
      metrics.py     变动分类、经理指标、个股面板、拥挤度
      backtest.py    克隆回测
      schemas.py     JSON schema
      export.py      组装并写出全部 JSON
    tests/
      fixtures/brk/{SUBMISSION,COVERPAGE,SUMMARYPAGE,INFOTABLE}.tsv
      make_fixtures.py
      tiny.py        export 测试用的小数据集
      test_*.py
  docs/
```

## JSON 数据契约（Task 9 写出，Task 11–14 读取）

```jsonc
// data/meta.json
{"generated_at":"2026-10-15T08:00:00Z","latest_period":"2026-06-30","periods":["2021-09-30", "..."],
 "managers":[{"cik":1067983,"name":"Berkshire Hathaway","person":"Warren Buffett / Greg Abel","style":["价值"],"value":274160086701,"n":110}],
 "stocks":[{"t":"AAPL","n":"APPLE INC","s":"信息技术"}],
 "coverage":{"figi_value_pct":0.97,"price_value_pct":0.95,"unmapped_cusips":312},
 "universe":{"filers":9876,"total_value":46000000000000}}

// data/home.json
{"period":"2026-06-30",
 "most_bought":[{"t":"AAPL","n":"APPLE INC","new":3,"add":2,"trim":1,"exit":0,"net":3,"who":["Pershing Square"]}],
 "most_sold":  [{"t":"...","n":"...","new":0,"add":0,"trim":2,"exit":3,"net":3,"who":["..."]}],
 "crowded":[{"t":"AAPL","n":"APPLE INC","s":"信息技术","holders":4123,"pct":0.62,"value":1.2e12,"score":91.5}],
 "sector_flows":{"buys":{"信息技术":1.2e9},"sells":{"金融":8.0e8}}}

// data/managers/<cik>.json
{"cik":1067983,"name":"...","person":"...","style":["..."],"founded":null,"bio":["..."],
 "sources":[{"label":"...","url":"..."}],"city":"OMAHA","state":"NE",
 "periods":["2021-09-30", "..."],
 "series":{"value":[],"n":[],"top10":[],"hhi":[],"turnover":[],"hold_q":[]},      // 与 periods 对齐，漏报为 null
 "sectors":{"names":["信息技术", "..."],"weights":[[0.4,0.1], "..."]},          // weights[期][行业]，漏报整行为 null
 "latest":{"period":"2026-06-30","rows":[{"c":"037833100","t":"AAPL","n":"APPLE INC","s":"信息技术","sh":1,"v":1,"w":0.2,"k":"hold"}],"other_w":0.03},
 "changes":{"period":"2026-06-30","prev_period":"2026-03-31","rows":[{"c":"...","t":"...","n":"...","k":"new","sh0":0,"sh":1,"dv":1,"w0":0,"w":0.01}]},
 "race":{"frames":[[{"t":"AAPL","v":1}]]},                                         // 与 periods 对齐；漏报为 []
 "options":[{"t":"AAPL","n":"APPLE INC","pc":"PUT","v":1}],
 "backtest":null | {"dates":["2021-11-19", "..."],"filing":[],"ideal":[],"bench":[],
   "stats":{"filing":{"cagr":0.1,"vol":0.2,"sharpe":0.5,"mdd":-0.3},"ideal":{},"bench":{}},"coverage":[0.98]},
 "similar":[{"cik":1,"name":"...","score":0.42}]}

// data/stocks/<ticker>.json
{"t":"AAPL","n":"APPLE INC","cusip":"037833100","s":"信息技术","is_etf":false,
 "price":{"dates":[],"close":[]},
 "holders":{"periods":[],"count":[],"pct":[],"value":[]},
 "flows":{"period":"2026-06-30","items":[{"kind":"new","group":"curated","dollars":1.2e8,"n":2}]},
 "curated":[{"cik":1067983,"name":"Berkshire Hathaway","sh":1,"w":0.2,"k":"hold","first":"2021-09-30"}],
 "crowding":{"score":88.1,"history":[]}}
```

---

### Task 1：项目骨架与配置

**Files:**
- Create: `smart-money/.gitignore`, `smart-money/.env.example`, `smart-money/build/requirements.txt`, `smart-money/build/pytest.ini`, `smart-money/build/conftest.py`, `smart-money/build/sm/__init__.py`, `smart-money/build/sm/config.py`, `smart-money/build/config/settings.yaml`, `smart-money/build/config/managers.yaml`, `smart-money/build/check_links.py`
- Test: `smart-money/build/tests/test_config.py`

**Interfaces:**
- Produces:
  - `sm.config`：`BUILD_DIR, ROOT_DIR, CONFIG_DIR, CACHE_DIR, REPORTS_DIR, DATA_DIR`（Path）
  - `Source(label, url)`
  - `Manager(cik:int, name, person, style:list[str], founded:int|None, bio:list[str], sources:list[Source])`
  - `Settings(quarters, change_threshold, stock_universe_top_n, holdings_per_quarter, changes_per_quarter, manager_json_max_kb, stock_json_max_kb, data_dir_max_mb)`
  - `load_settings(path=None) -> Settings`、`load_managers(path=None) -> list[Manager]`、`read_dotenv(path=None) -> dict`、`sec_user_agent() -> str`

- [ ] **Step 1：建目录、虚拟环境和依赖**

```bash
cd "smart-money" && mkdir -p build/sm build/config build/tests/fixtures build/cache data docs
cat > .gitignore <<'EOF'
.env
build/.venv/
build/cache/
build/reports/
__pycache__/
.pytest_cache/
EOF
cat > .env.example <<'EOF'
# 必填：SEC 要求在 User-Agent 中声明联系邮箱（请用个人邮箱）
SEC_CONTACT_EMAIL=
# 可选：OpenFIGI 免费 API key，有 key 时映射速度快约 25 倍 https://www.openfigi.com/api
OPENFIGI_API_KEY=
EOF
cat > build/requirements.txt <<'EOF'
duckdb>=1.1
pandas>=2.2
pyarrow>=16
requests>=2.32
pyyaml>=6
yfinance>=1.2
jsonschema>=4.22
pytest>=8
EOF
cat > build/pytest.ini <<'EOF'
[pytest]
testpaths = tests
EOF
printf '# Makes `sm` importable from tests (pytest inserts this directory into sys.path).\n' > build/conftest.py
touch build/sm/__init__.py
/opt/homebrew/bin/python3.12 -m venv build/.venv && build/.venv/bin/pip install -q -r build/requirements.txt
```

然后让用户把个人邮箱写进 `smart-money/.env`：`cp .env.example .env`，填入 `SEC_CONTACT_EMAIL`。**这一步需要用户本人完成，不要替用户填写。**

- [ ] **Step 2：写失败测试 `build/tests/test_config.py`**

```python
import pytest
from sm import config


def test_settings_load():
    s = config.load_settings()
    assert s.quarters == 20
    assert s.change_threshold == 0.02
    assert s.manager_json_max_kb == 300


def test_managers_load_and_are_valid():
    ms = config.load_managers()
    assert len(ms) == 20
    assert len({m.cik for m in ms}) == 20
    brk = next(m for m in ms if m.cik == 1067983)
    assert brk.name == "Berkshire Hathaway"
    assert all(m.sources and m.bio and m.style for m in ms)


def test_duplicate_cik_rejected(tmp_path):
    p = tmp_path / "m.yaml"
    entry = "  - {cik: 1, name: A, person: P, style: [x], founded: null, bio: [b], sources: [{label: l, url: 'https://x'}]}\n"
    p.write_text("managers:\n" + entry + entry)
    with pytest.raises(ValueError, match="duplicate"):
        config.load_managers(p)


def test_user_agent_reads_dotenv(monkeypatch, tmp_path):
    monkeypatch.delenv("SEC_CONTACT_EMAIL", raising=False)
    monkeypatch.setattr(config, "ROOT_DIR", tmp_path)
    (tmp_path / ".env").write_text("# c\nSEC_CONTACT_EMAIL=me@example.com\n")
    assert config.sec_user_agent() == "smart-money research me@example.com"


def test_user_agent_missing_raises(monkeypatch, tmp_path):
    monkeypatch.delenv("SEC_CONTACT_EMAIL", raising=False)
    monkeypatch.setattr(config, "ROOT_DIR", tmp_path)
    with pytest.raises(RuntimeError, match="SEC_CONTACT_EMAIL"):
        config.sec_user_agent()
```

- [ ] **Step 3：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_config.py -q`
Expected: FAIL，报 `AttributeError: module 'sm.config' has no attribute 'load_settings'` 或 ImportError。

- [ ] **Step 4：实现 `build/sm/config.py`**

```python
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import yaml

BUILD_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BUILD_DIR.parent
CONFIG_DIR = BUILD_DIR / "config"
CACHE_DIR = BUILD_DIR / "cache"
REPORTS_DIR = BUILD_DIR / "reports"
DATA_DIR = ROOT_DIR / "data"


@dataclass(frozen=True)
class Source:
    label: str
    url: str


@dataclass(frozen=True)
class Manager:
    cik: int
    name: str
    person: str
    style: list[str]
    founded: int | None
    bio: list[str]
    sources: list[Source]


@dataclass(frozen=True)
class Settings:
    quarters: int
    change_threshold: float
    stock_universe_top_n: int
    holdings_per_quarter: int
    changes_per_quarter: int
    manager_json_max_kb: int
    stock_json_max_kb: int
    data_dir_max_mb: int


def load_settings(path: Path | None = None) -> Settings:
    raw = yaml.safe_load(Path(path or CONFIG_DIR / "settings.yaml").read_text())
    return Settings(**raw)


def load_managers(path: Path | None = None) -> list[Manager]:
    raw = yaml.safe_load(Path(path or CONFIG_DIR / "managers.yaml").read_text(encoding="utf-8"))
    out = [
        Manager(
            cik=int(m["cik"]), name=m["name"], person=m["person"], style=list(m["style"]),
            founded=int(m["founded"]) if m.get("founded") else None, bio=list(m["bio"]),
            sources=[Source(**s) for s in m["sources"]],
        )
        for m in raw["managers"]
    ]
    ciks = [m.cik for m in out]
    if len(set(ciks)) != len(ciks):
        raise ValueError("duplicate CIK in managers.yaml")
    for m in out:
        if not m.sources:
            raise ValueError(f"manager {m.cik} has no sources")
    return out


def read_dotenv(path: Path | None = None) -> dict[str, str]:
    p = Path(path or ROOT_DIR / ".env")
    if not p.exists():
        return {}
    out = {}
    for line in p.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip().strip('"')
    return out


def sec_user_agent() -> str:
    email = os.environ.get("SEC_CONTACT_EMAIL") or read_dotenv().get("SEC_CONTACT_EMAIL")
    if not email:
        raise RuntimeError("Set SEC_CONTACT_EMAIL in smart-money/.env (a personal email; SEC requires it in the User-Agent)")
    return f"smart-money research {email}"
```

- [ ] **Step 5：写 `build/config/settings.yaml`**

```yaml
quarters: 20
change_threshold: 0.02
stock_universe_top_n: 1500
holdings_per_quarter: 150
changes_per_quarter: 100
manager_json_max_kb: 300
stock_json_max_kb: 100
data_dir_max_mb: 50
```

- [ ] **Step 6：写 `build/config/managers.yaml`**

CIK 已经在 2026-02 的 SEC 13F 数据集里逐一核对过申报人名称。城市和州不写在这里，构建时从 13F 封面页读取。导出时会自动给每位经理追加一条 "SEC EDGAR 13F 申报"来源链接。

```yaml
managers:
  - cik: 1067983
    name: Berkshire Hathaway
    person: Warren Buffett / Greg Abel
    style: [价值, 长期持有]
    founded: null
    bio:
      - Warren Buffett 自 1965 年起掌控伯克希尔，把一家纺织企业改造成以保险为核心的控股集团。
      - Greg Abel 于 2026 年 1 月 1 日接任 CEO，Buffett 继续担任董事长。
    sources:
      - {label: Wikipedia · Berkshire Hathaway, url: "https://en.wikipedia.org/wiki/Berkshire_Hathaway"}
  - cik: 1336528
    name: Pershing Square
    person: Bill Ackman
    style: [激进投资, 集中持仓]
    founded: 2004
    bio:
      - Bill Ackman 于 2004 年创立，以少数集中持仓和公开推动公司变革著称。
    sources:
      - {label: Wikipedia · Pershing Square, url: "https://en.wikipedia.org/wiki/Pershing_Square_Capital_Management"}
  - cik: 1656456
    name: Appaloosa
    person: David Tepper
    style: [困境投资, 宏观]
    founded: 1993
    bio:
      - David Tepper 于 1993 年创立 Appaloosa，以 2009 年押注美国银行股复苏闻名。
    sources:
      - {label: Wikipedia · David Tepper, url: "https://en.wikipedia.org/wiki/David_Tepper"}
  - cik: 1536411
    name: Duquesne Family Office
    person: Stanley Druckenmiller
    style: [宏观, 成长]
    founded: 2010
    bio:
      - Druckenmiller 于 1981 年创立 Duquesne Capital，2010 年关闭对外基金，转为家族办公室。
    sources:
      - {label: Wikipedia · Stanley Druckenmiller, url: "https://en.wikipedia.org/wiki/Stanley_Druckenmiller"}
  - cik: 1350694
    name: Bridgewater Associates
    person: Ray Dalio（创始人）
    style: [宏观, 系统化]
    founded: 1975
    bio:
      - Ray Dalio 于 1975 年创立，是全球规模最大的对冲基金之一。
    sources:
      - {label: Wikipedia · Bridgewater Associates, url: "https://en.wikipedia.org/wiki/Bridgewater_Associates"}
  - cik: 1037389
    name: Renaissance Technologies
    person: Jim Simons（创始人）
    style: [量化]
    founded: 1982
    bio:
      - 数学家 Jim Simons 创立的量化投资公司，旗下 Medallion 基金以长期极高收益著称。
    sources:
      - {label: Wikipedia · Renaissance Technologies, url: "https://en.wikipedia.org/wiki/Renaissance_Technologies"}
  - cik: 1061768
    name: Baupost Group
    person: Seth Klarman
    style: [价值, 安全边际]
    founded: 1982
    bio:
      - Seth Klarman 于 1982 年创立，著有价值投资经典《安全边际》（Margin of Safety，1991）。
    sources:
      - {label: Wikipedia · Baupost Group, url: "https://en.wikipedia.org/wiki/Baupost_Group"}
  - cik: 1040273
    name: Third Point
    person: Dan Loeb
    style: [事件驱动, 激进投资]
    founded: 1995
    bio:
      - Dan Loeb 于 1995 年创立，以致董事会的公开信推动公司变革著称。
    sources:
      - {label: Wikipedia · Third Point, url: "https://en.wikipedia.org/wiki/Third_Point_Management"}
  - cik: 1167483
    name: Tiger Global
    person: Chase Coleman
    style: [成长, 科技]
    founded: 2001
    bio:
      - Chase Coleman 于 2001 年创立，出身 Julian Robertson 的老虎基金（"小老虎"之一）。
    sources:
      - {label: Wikipedia · Tiger Global, url: "https://en.wikipedia.org/wiki/Tiger_Global_Management"}
  - cik: 1135730
    name: Coatue Management
    person: Philippe Laffont
    style: [科技, 成长]
    founded: 1999
    bio:
      - Philippe Laffont 于 1999 年创立，出身老虎基金，专注科技股。
    sources:
      - {label: Wikipedia · Coatue Management, url: "https://en.wikipedia.org/wiki/Coatue_Management"}
  - cik: 1061165
    name: Lone Pine Capital
    person: Stephen Mandel（创始人）
    style: [成长, 多空]
    founded: 1997
    bio:
      - Stephen Mandel 于 1997 年创立，出身老虎基金。
    sources:
      - {label: Wikipedia · Lone Pine Capital, url: "https://en.wikipedia.org/wiki/Lone_Pine_Capital"}
  - cik: 1103804
    name: Viking Global
    person: Andreas Halvorsen
    style: [多空, 基本面]
    founded: 1999
    bio:
      - Andreas Halvorsen 于 1999 年创立，出身老虎基金。
    sources:
      - {label: Wikipedia · Viking Global Investors, url: "https://en.wikipedia.org/wiki/Viking_Global_Investors"}
  - cik: 1709323
    name: Himalaya Capital
    person: 李录 Li Lu
    style: [价值, 长期持有]
    founded: 1997
    bio:
      - 李录于 1997 年创立；查理·芒格曾把部分家族资产交给他管理。
    sources:
      - {label: Wikipedia · Li Lu, url: "https://en.wikipedia.org/wiki/Li_Lu"}
  - cik: 1549575
    name: Dalal Street (Pabrai)
    person: Mohnish Pabrai
    style: [价值, 集中持仓]
    founded: 1999
    bio:
      - Mohnish Pabrai 的投资管理公司；Pabrai 投资基金成立于 1999 年。他著有《憨夺型投资者》（The Dhandho Investor）。
    sources:
      - {label: Wikipedia · Mohnish Pabrai, url: "https://en.wikipedia.org/wiki/Mohnish_Pabrai"}
  - cik: 1569205
    name: Fundsmith
    person: Terry Smith
    style: [质量成长, 长期持有]
    founded: 2010
    bio:
      - Terry Smith 于 2010 年在伦敦创立，投资信条是"买好公司、别买贵、什么都不做"。
    sources:
      - {label: Wikipedia · Fundsmith, url: "https://en.wikipedia.org/wiki/Fundsmith"}
  - cik: 1112520
    name: Akre Capital Management
    person: Chuck Akre（创始人）
    style: [质量复利, 长期持有]
    founded: 1989
    bio:
      - Chuck Akre 于 1989 年创立，以长期持有"复利机器"型公司著称。
    sources:
      - {label: Wikipedia · Chuck Akre, url: "https://en.wikipedia.org/wiki/Chuck_Akre"}
  - cik: 921669
    name: Carl Icahn
    person: Carl Icahn
    style: [激进投资]
    founded: null
    bio:
      - 美国最早一批激进投资者之一，13F 以其个人名义（ICAHN CARL C）申报。
    sources:
      - {label: Wikipedia · Carl Icahn, url: "https://en.wikipedia.org/wiki/Carl_Icahn"}
  - cik: 1791786
    name: Elliott Investment Management
    person: Paul Singer
    style: [激进投资, 困境投资]
    founded: 1977
    bio:
      - Paul Singer 于 1977 年创立，以激进投资和困境债务投资著称。
    sources:
      - {label: Wikipedia · Elliott Investment Management, url: "https://en.wikipedia.org/wiki/Elliott_Investment_Management"}
  - cik: 1029160
    name: Soros Fund Management
    person: George Soros
    style: [宏观]
    founded: 1970
    bio:
      - George Soros 于 1970 年创立，以 1992 年做空英镑闻名，2011 年转为家族办公室。
    sources:
      - {label: Wikipedia · Soros Fund Management, url: "https://en.wikipedia.org/wiki/Soros_Fund_Management"}
  - cik: 1418814
    name: ValueAct Capital
    person: Mason Morfit
    style: [激进投资, 价值]
    founded: 2000
    bio:
      - Jeffrey Ubben 等人于 2000 年创立，以进入董事会推动变革的"建设性激进"著称。
    sources:
      - {label: Wikipedia · ValueAct Capital, url: "https://en.wikipedia.org/wiki/ValueAct_Capital"}
```

- [ ] **Step 7：写 `build/check_links.py` 并运行**

```python
"""Check every source URL in managers.yaml resolves (HTTP 200). Exit 1 listing failures."""
import sys

import requests

from sm.config import load_managers


def main() -> int:
    bad = []
    for m in load_managers():
        for s in m.sources:
            try:
                r = requests.get(s.url, timeout=20, headers={"User-Agent": "smart-money link check"})
                ok = r.status_code == 200
            except requests.RequestException:
                ok = False
            if not ok:
                bad.append(f"{m.cik} {m.name}: {s.url}")
    print("\n".join(bad) if bad else "all links OK")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
```

Run: `cd smart-money/build && .venv/bin/python check_links.py`
Expected: `all links OK`。如果有失败的链接，换成能支持同一事实的 Wikipedia 页面或官网；找不到就删掉对应的简介句子。改完重跑，直到全部通过。

- [ ] **Step 8：运行测试，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_config.py -q`
Expected: `5 passed`

- [ ] **Step 9：提交**

```bash
git add smart-money/.gitignore smart-money/.env.example smart-money/build/requirements.txt smart-money/build/pytest.ini smart-money/build/conftest.py smart-money/build/sm/__init__.py smart-money/build/sm/config.py smart-money/build/config smart-money/build/check_links.py smart-money/build/tests/test_config.py
git commit -m "feat(smart-money): build scaffold, settings and curated manager config"
```

---

### Task 2：SEC 客户端

**Files:**
- Create: `smart-money/build/sm/sec.py`
- Test: `smart-money/build/tests/test_sec.py`

**Interfaces:**
- Consumes: `sm.config.CACHE_DIR`、`sec_user_agent()`
- Produces:
  - `SecError(RuntimeError)`
  - `SecClient(cache_dir=CACHE_DIR/"http", *, session=None, user_agent=None, min_interval=0.11, retries=3, sleep=time.sleep, clock=time.monotonic)`，方法有：
    - `get_bytes(url, *, max_age_s=None) -> bytes`
    - `get_json(url, *, max_age_s=None)`
    - `download(url, dest: Path) -> Path`

- [ ] **Step 1：写失败测试 `build/tests/test_sec.py`**

```python
import pytest

from sm.sec import SecClient, SecError


class FakeResp:
    def __init__(self, status, content=b""):
        self.status_code = status
        self.content = content

    def iter_content(self, n):
        yield self.content


class FakeSession:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def get(self, url, headers=None, timeout=None, stream=False):
        self.calls.append((url, headers))
        return self.responses.pop(0)


def make(tmp_path, responses):
    s = FakeSession(responses)
    sleeps = []
    c = SecClient(tmp_path / "http", session=s, user_agent="smart-money research me@example.com",
                  sleep=sleeps.append, clock=lambda: 0.0)
    return c, s, sleeps


def test_sends_user_agent_and_caches(tmp_path):
    c, s, _ = make(tmp_path, [FakeResp(200, b'{"a": 1}')])
    assert c.get_json("https://x/a.json") == {"a": 1}
    assert c.get_json("https://x/a.json") == {"a": 1}
    assert len(s.calls) == 1
    assert s.calls[0][1]["User-Agent"] == "smart-money research me@example.com"


def test_throttles_between_requests(tmp_path):
    c, s, sleeps = make(tmp_path, [FakeResp(200, b"1"), FakeResp(200, b"2")])
    c.get_bytes("https://x/1")
    c.get_bytes("https://x/2")
    assert sleeps == [pytest.approx(0.11)]


def test_retries_and_slows_down_on_429(tmp_path):
    c, s, sleeps = make(tmp_path, [FakeResp(429), FakeResp(200, b"ok")])
    assert c.get_bytes("https://x/b") == b"ok"
    assert len(s.calls) == 2
    assert c.min_interval > 0.11
    assert 1 in sleeps


def test_404_fails_fast(tmp_path):
    c, s, _ = make(tmp_path, [FakeResp(404)])
    with pytest.raises(SecError, match="404"):
        c.get_bytes("https://x/missing")
    assert len(s.calls) == 1


def test_gives_up_after_retries(tmp_path):
    c, s, _ = make(tmp_path, [FakeResp(500)] * 4)
    with pytest.raises(SecError, match="giving up"):
        c.get_bytes("https://x/c")
    assert len(s.calls) == 4


def test_download_writes_file_once(tmp_path):
    c, s, _ = make(tmp_path, [FakeResp(200, b"zipbytes")])
    p = c.download("https://x/f.zip", tmp_path / "d" / "f.zip")
    assert p.read_bytes() == b"zipbytes"
    c.download("https://x/f.zip", p)
    assert len(s.calls) == 1
```

- [ ] **Step 2：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_sec.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'sm.sec'`

- [ ] **Step 3：实现 `build/sm/sec.py`**

```python
"""Rate-limited, caching HTTP client for sec.gov (SEC fair access: <=10 req/s with a declared User-Agent)."""
from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path

import requests

from .config import CACHE_DIR, sec_user_agent


class SecError(RuntimeError):
    pass


class SecClient:
    def __init__(self, cache_dir: Path = CACHE_DIR / "http", *, session=None, user_agent: str | None = None,
                 min_interval: float = 0.11, retries: int = 3, sleep=time.sleep, clock=time.monotonic):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.session = session or requests.Session()
        self.headers = {"User-Agent": user_agent or sec_user_agent(), "Accept-Encoding": "gzip, deflate"}
        self.min_interval = min_interval
        self.retries = retries
        self._sleep = sleep
        self._clock = clock
        self._last = None

    def _throttle(self) -> None:
        if self._last is not None:
            wait = self._last + self.min_interval - self._clock()
            if wait > 0:
                self._sleep(wait)
        self._last = self._clock()

    def _request(self, url: str, stream: bool = False):
        err: Exception | None = None
        for attempt in range(self.retries + 1):
            self._throttle()
            try:
                resp = self.session.get(url, headers=self.headers, timeout=120, stream=stream)
            except requests.RequestException as e:
                resp, err = None, e
            if resp is not None:
                if resp.status_code == 200:
                    return resp
                if resp.status_code == 404:
                    raise SecError(f"404 Not Found: {url}")
                if resp.status_code in (403, 429):
                    self.min_interval = min(self.min_interval * 2, 2.0)
                err = SecError(f"HTTP {resp.status_code}: {url}")
            if attempt < self.retries:
                self._sleep(2 ** attempt)
        raise SecError(f"giving up after {self.retries + 1} attempts: {url}") from err

    def _cache_path(self, url: str) -> Path:
        return self.cache_dir / (hashlib.sha1(url.encode()).hexdigest() + ".bin")

    def get_bytes(self, url: str, *, max_age_s: float | None = None) -> bytes:
        p = self._cache_path(url)
        if p.exists() and (max_age_s is None or time.time() - p.stat().st_mtime < max_age_s):
            return p.read_bytes()
        data = self._request(url).content
        p.write_bytes(data)
        return data

    def get_json(self, url: str, *, max_age_s: float | None = None):
        return json.loads(self.get_bytes(url, max_age_s=max_age_s))

    def download(self, url: str, dest: Path) -> Path:
        dest = Path(dest)
        if dest.exists():
            return dest
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_name(dest.name + ".part")
        resp = self._request(url, stream=True)
        with open(tmp, "wb") as f:
            for chunk in resp.iter_content(1 << 20):
                f.write(chunk)
        tmp.rename(dest)
        return dest
```

- [ ] **Step 4：运行，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_sec.py -q`
Expected: `6 passed`

- [ ] **Step 5：提交**

```bash
git add smart-money/build/sm/sec.py smart-money/build/tests/test_sec.py
git commit -m "feat(smart-money): rate-limited caching SEC client"
```

---

### Task 3：13F 批量数据下载与转换

**Files:**
- Create: `smart-money/build/sm/ingest_13f.py`
- Test: `smart-money/build/tests/test_ingest_13f.py`

**Interfaces:**
- Consumes: `SecClient.get_bytes`、`SecClient.download`
- Produces:
  - `DatasetFile(url, name, start: date, end: date)`
  - `parse_range(name) -> (date, date)`、`parse_index(html) -> list[DatasetFile]`
  - `select_files(files, first_period_end: date) -> list[DatasetFile]`
  - `zip_to_parquet(zip_path, out_dir) -> Path`：写出 `submission.parquet`、`coverpage.parquet`、`summarypage.parquet`、`infotable.parquet`，全部为字符串列，只保留 `TABLES` 中的列
  - `ingest(client, first_period_end, root=CACHE_DIR/"13f") -> list[Path]`：返回各数据集的 parquet 目录
  - `shift_quarter_end(d: date, k: int) -> date`

背景：SEC 数据集索引页上，2024 年前的文件名是 `2022q4_form13f.zip`（按申报所在自然季度），之后是 `01dec2025-28feb2026_form13f.zip`（按申报日期滚动 3 个月）。链接路径前缀也不统一，所以一律用页面上的 href。

- [ ] **Step 1：写失败测试 `build/tests/test_ingest_13f.py`**

```python
import zipfile
from datetime import date

import pandas as pd
import pytest

from sm.ingest_13f import (TABLES, parse_index, parse_range, select_files, shift_quarter_end,
                           zip_to_parquet)


def test_parse_range_both_formats():
    assert parse_range("2022q4_form13f.zip") == (date(2022, 10, 1), date(2022, 12, 31))
    assert parse_range("01dec2025-28feb2026_form13f.zip") == (date(2025, 12, 1), date(2026, 2, 28))
    with pytest.raises(ValueError):
        parse_range("readme.zip")


def test_parse_index_and_select():
    html = '''<a href="/files/structureddata/data/form-13f-data-sets/2022q4_form13f.zip">x</a>
      <a href="/files/datastandardsinnovation/data/form-13f-data-sets/01jun2026-31aug2026_form13f.zip">y</a>
      <a href="/files/structureddata/data/form-13f-data-sets/2022q4_form13f.zip">dup</a>'''
    files = parse_index(html)
    assert [f.name for f in files] == ["2022q4_form13f.zip", "01jun2026-31aug2026_form13f.zip"]
    assert files[1].url.startswith("https://www.sec.gov/files/datastandardsinnovation/")
    assert [f.name for f in select_files(files, date(2023, 3, 31))] == ["01jun2026-31aug2026_form13f.zip"]


def test_shift_quarter_end():
    assert shift_quarter_end(date(2026, 10, 15), 0) == date(2026, 12, 31)
    assert shift_quarter_end(date(2026, 10, 15), -1) == date(2026, 9, 30)
    assert shift_quarter_end(date(2026, 2, 1), -2) == date(2025, 9, 30)


def _write_zip(path, tables):
    with zipfile.ZipFile(path, "w") as z:
        for name, text in tables.items():
            z.writestr(f"{name}.tsv", text)


def _minimal_tables(infotable_rows):
    sub = "ACCESSION_NUMBER\tFILING_DATE\tSUBMISSIONTYPE\tCIK\tPERIODOFREPORT\nA-1\t14-NOV-2022\t13F-HR\t0000000001\t30-SEP-2022\n"
    cov = ("ACCESSION_NUMBER\tISAMENDMENT\tAMENDMENTTYPE\tFILINGMANAGER_NAME\tFILINGMANAGER_CITY\tFILINGMANAGER_STATEORCOUNTRY\tEXTRA\n"
           "A-1\tN\t\tAlpha\tNYC\tNY\tz\n")
    summ = "ACCESSION_NUMBER\tTABLEENTRYTOTAL\tTABLEVALUETOTAL\nA-1\t1\t5\n"
    info = "\t".join(TABLES["INFOTABLE"] + ["FIGI"]) + "\n" + infotable_rows
    return {"SUBMISSION": sub, "COVERPAGE": cov, "SUMMARYPAGE": summ, "INFOTABLE": info}


def test_zip_to_parquet_keeps_quotes_and_selected_columns(tmp_path):
    row = "A-1\t7\tO\"REILLY AUTOMOTIVE\tCOM\t67103H107\t5\t10\tSH\t\tfigi\n"
    zp = tmp_path / "t.zip"
    _write_zip(zp, _minimal_tables(row))
    out = zip_to_parquet(zp, tmp_path / "out")
    info = pd.read_parquet(out / "infotable.parquet")
    assert list(info.columns) == TABLES["INFOTABLE"]
    assert info.loc[0, "NAMEOFISSUER"] == 'O"REILLY AUTOMOTIVE'
    assert info.loc[0, "PUTCALL"] == ""
    cov = pd.read_parquet(out / "coverpage.parquet")
    assert "EXTRA" not in cov.columns


def test_zip_to_parquet_rejects_schema_change(tmp_path):
    t = _minimal_tables("")
    t["INFOTABLE"] = "ACCESSION_NUMBER\tCUSIP\n"
    zp = tmp_path / "bad.zip"
    _write_zip(zp, t)
    with pytest.raises(ValueError, match="missing columns"):
        zip_to_parquet(zp, tmp_path / "out")
```

- [ ] **Step 2：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_ingest_13f.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'sm.ingest_13f'`

- [ ] **Step 3：实现 `build/sm/ingest_13f.py`**

```python
"""Download SEC Form 13F bulk data sets and convert the tables we use to Parquet (all string columns)."""
from __future__ import annotations

import calendar
import csv
import re
import zipfile
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

from .config import CACHE_DIR
from .sec import SecClient

INDEX_URL = "https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets"
SEC_ROOT = "https://www.sec.gov"
# Order matters: INFOTABLE last, so its parquet existing means the whole directory is complete.
TABLES = {
    "SUBMISSION": ["ACCESSION_NUMBER", "FILING_DATE", "SUBMISSIONTYPE", "CIK", "PERIODOFREPORT"],
    "COVERPAGE": ["ACCESSION_NUMBER", "ISAMENDMENT", "AMENDMENTTYPE", "FILINGMANAGER_NAME",
                  "FILINGMANAGER_CITY", "FILINGMANAGER_STATEORCOUNTRY"],
    "SUMMARYPAGE": ["ACCESSION_NUMBER", "TABLEENTRYTOTAL", "TABLEVALUETOTAL"],
    "INFOTABLE": ["ACCESSION_NUMBER", "INFOTABLE_SK", "NAMEOFISSUER", "TITLEOFCLASS", "CUSIP", "VALUE",
                  "SSHPRNAMT", "SSHPRNAMTTYPE", "PUTCALL"],
}


@dataclass(frozen=True)
class DatasetFile:
    url: str
    name: str
    start: date
    end: date


def parse_range(name: str) -> tuple[date, date]:
    m = re.fullmatch(r"(\d{4})q([1-4])_form13f\.zip", name)
    if m:
        y, q = int(m[1]), int(m[2])
        last = 3 * q
        return date(y, last - 2, 1), date(y, last, calendar.monthrange(y, last)[1])
    m = re.fullmatch(r"(\d{2}[a-z]{3}\d{4})-(\d{2}[a-z]{3}\d{4})_form13f\.zip", name)
    if m:
        parse = lambda s: datetime.strptime(s, "%d%b%Y").date()  # noqa: E731
        return parse(m[1]), parse(m[2])
    raise ValueError(f"unrecognised 13F data set file name: {name}")


def parse_index(html: str) -> list[DatasetFile]:
    out: dict[str, DatasetFile] = {}
    for href in re.findall(r'href="([^"]*_form13f\.zip)"', html):
        name = href.rsplit("/", 1)[-1]
        if name in out:
            continue
        start, end = parse_range(name)
        out[name] = DatasetFile(SEC_ROOT + href if href.startswith("/") else href, name, start, end)
    return sorted(out.values(), key=lambda f: f.start)


def select_files(files: list[DatasetFile], first_period_end: date) -> list[DatasetFile]:
    """Filings for a period are made after the period ends, so only files ending after it can hold them."""
    return [f for f in files if f.end > first_period_end]


def shift_quarter_end(d: date, k: int) -> date:
    idx = d.year * 4 + (d.month - 1) // 3 + k
    y, q = divmod(idx, 4)
    m = 3 * q + 3
    return date(y, m, calendar.monthrange(y, m)[1])


def zip_to_parquet(zip_path: Path, out_dir: Path) -> Path:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as z:
        for table, cols in TABLES.items():
            dest = out_dir / f"{table.lower()}.parquet"
            if dest.exists():
                continue
            with z.open(f"{table}.tsv") as fh:
                header = fh.readline().decode("utf-8", "replace").rstrip("\r\n").split("\t")
            missing = [c for c in cols if c not in header]
            if missing:
                raise ValueError(f"{Path(zip_path).name}/{table}.tsv missing columns {missing}; header is {header}")
            tmp = dest.with_name(dest.name + ".part")
            writer = None
            with z.open(f"{table}.tsv") as fh:
                reader = pd.read_csv(fh, sep="\t", dtype=str, usecols=cols, quoting=csv.QUOTE_NONE,
                                     keep_default_na=False, chunksize=1_000_000, encoding="utf-8",
                                     encoding_errors="replace", on_bad_lines="warn")
                for chunk in reader:
                    t = pa.Table.from_pandas(chunk[cols], preserve_index=False)
                    if writer is None:
                        writer = pq.ParquetWriter(tmp, t.schema)
                    writer.write_table(t)
            if writer is None:
                pd.DataFrame({c: pd.Series(dtype=str) for c in cols}).to_parquet(tmp, index=False)
            else:
                writer.close()
            tmp.rename(dest)
    return out_dir


def ingest(client: SecClient, first_period_end: date, root: Path = CACHE_DIR / "13f") -> list[Path]:
    html = client.get_bytes(INDEX_URL, max_age_s=86400).decode("utf-8", "replace")
    files = select_files(parse_index(html), first_period_end)
    if not files:
        raise RuntimeError("no 13F data set files found on the SEC index page")
    dirs = []
    for f in files:
        out_dir = Path(root) / f.name.removesuffix(".zip")
        if not (out_dir / "infotable.parquet").exists():
            print(f"[13f] downloading {f.name}")
            zp = client.download(f.url, Path(root) / "zips" / f.name)
            zip_to_parquet(zp, out_dir)
            zp.unlink()
        dirs.append(out_dir)
    return dirs
```

- [ ] **Step 4：运行，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_ingest_13f.py -q`
Expected: `5 passed`

- [ ] **Step 5：提交**

```bash
git add smart-money/build/sm/ingest_13f.py smart-money/build/tests/test_ingest_13f.py
git commit -m "feat(smart-money): 13F bulk data set index parsing and zip-to-parquet"
```

---

### Task 4：13F 清洗（修订、单位、持仓表）与伯克希尔金标准测试

**Files:**
- Create: `smart-money/build/sm/clean.py`, `smart-money/build/tests/make_fixtures.py`, `smart-money/build/tests/fixtures/brk/*.tsv`（由脚本生成）
- Test: `smart-money/build/tests/test_clean.py`

**Interfaces:**
- Consumes: `zip_to_parquet`（测试中使用）
- Produces:
  - `VALUE_IN_DOLLARS_FROM = date(2023, 1, 3)`
  - `load_submissions(dirs) -> DataFrame`，列为 `[acc, cik:int64, filing_date:date, period:date, is_amendment:bool, amendment_type:str, name, city, state]`
  - `effective_accessions(subs) -> DataFrame`，列为 `[cik, period, acc, filing_date, first_filing_date]`
  - `build_holdings(dirs, eff) -> DataFrame`，列为 `[cik, period:date, cusip, put_call('', 'PUT', 'CALL'), issuer, title, shares:float, value_usd:float]`，只保留 `SSHPRNAMTTYPE='SH'`
  - `complete_periods(eff, n) -> list[date]`
  - `filings_table(subs, eff) -> DataFrame`，列为 `[cik, period, first_filing_date, name, city, state]`，每个 (cik, period) 一行

修订规则：
- 同一 (cik, period) 下，按申报日期排序后，取最后一份"原始申报或 RESTATEMENT"作为基准，再追加它之后的所有 NEW HOLDINGS 修订。
- 类型为空的修订按 RESTATEMENT 处理。
- 只有 NEW HOLDINGS、没有基准的组合直接丢弃。
- `first_filing_date` 取该期最早的申报日期，因为那是信息首次公开的日子。

- [ ] **Step 1：写夹具生成脚本 `build/tests/make_fixtures.py` 并运行**

```python
"""One-off: copy Berkshire's 2022Q3 and 2025Q4 13F rows from SEC bulk files into small TSV fixtures (SEC data is public domain)."""
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sm.config import CACHE_DIR  # noqa: E402
from sm.sec import SecClient  # noqa: E402

BASE = "https://www.sec.gov/files/structureddata/data/form-13f-data-sets/"
PICKS = {"2022q4_form13f.zip": "0000950123-22-012275", "01dec2025-28feb2026_form13f.zip": "0001193125-26-054580"}
TABLES = ["SUBMISSION", "COVERPAGE", "SUMMARYPAGE", "INFOTABLE"]
OUT = Path(__file__).resolve().parent / "fixtures" / "brk"


def main() -> None:
    client = SecClient()
    OUT.mkdir(parents=True, exist_ok=True)
    headers: dict[str, str] = {}
    rows: dict[str, list[str]] = {t: [] for t in TABLES}
    for name, acc in PICKS.items():
        zp = client.download(BASE + name, CACHE_DIR / "zips" / name)
        with zipfile.ZipFile(zp) as z:
            for t in TABLES:
                with z.open(f"{t}.tsv") as fh:
                    h = fh.readline().decode()
                    if t in headers and headers[t] != h:
                        raise SystemExit(f"{t} header differs between files; fixture would be inconsistent")
                    headers[t] = h
                    rows[t] += [ln.decode() for ln in fh if ln.startswith(acc.encode())]
    for t in TABLES:
        (OUT / f"{t}.tsv").write_text(headers[t] + "".join(rows[t]))
        print(t, len(rows[t]), "rows")


if __name__ == "__main__":
    main()
```

Run: `cd smart-money/build && .venv/bin/python tests/make_fixtures.py`
Expected: 共约 150 MB 下载。输出 `SUBMISSION 2 rows`、`COVERPAGE 2 rows`、`SUMMARYPAGE 2 rows`、`INFOTABLE 289 rows`（2022 年 179 行 + 2025 年 110 行）。

- [ ] **Step 2：写失败测试 `build/tests/test_clean.py`**

```python
import zipfile
from datetime import date
from pathlib import Path

import pandas as pd
import pytest

from sm.clean import build_holdings, complete_periods, effective_accessions, filings_table, load_submissions
from sm.ingest_13f import zip_to_parquet

FIX = Path(__file__).parent / "fixtures" / "brk"


@pytest.fixture(scope="module")
def brk_dir(tmp_path_factory):
    tmp = tmp_path_factory.mktemp("brk")
    zp = tmp / "brk.zip"
    with zipfile.ZipFile(zp, "w") as z:
        for t in ["SUBMISSION", "COVERPAGE", "SUMMARYPAGE", "INFOTABLE"]:
            z.write(FIX / f"{t}.tsv", f"{t}.tsv")
    return zip_to_parquet(zp, tmp / "pq")


def test_berkshire_golden(brk_dir):
    subs = load_submissions([brk_dir])
    assert set(subs.period) == {date(2022, 9, 30), date(2025, 12, 31)}
    eff = effective_accessions(subs)
    h = build_holdings([brk_dir], eff)
    eq = h[h.put_call == ""]
    q25 = eq[eq.period == date(2025, 12, 31)].set_index("cusip")
    q22 = eq[eq.period == date(2022, 9, 30)].set_index("cusip")
    # 2025Q4: VALUE already in dollars (filed 2026-02-17). Totals match SUMMARYPAGE TABLEVALUETOTAL.
    assert q25.loc["037833100", "shares"] == 227_917_808
    assert q25.loc["037833100", "value_usd"] == 61_961_735_283
    assert q25.value_usd.sum() == 274_160_086_701
    top10 = list(q25.value_usd.nlargest(10).index)
    assert top10[:4] == ["037833100", "025816109", "060505104", "191216100"]  # AAPL, AXP, BAC, KO
    # 2022Q3: filed 2022-11-14, VALUE in thousands -> multiplied by 1000.
    assert q22.loc["037833100", "shares"] == 894_802_319
    assert q22.loc["037833100", "value_usd"] == 123_661_679_000
    assert q22.value_usd.sum() == 296_096_640_000


def _subs(rows):
    df = pd.DataFrame(rows, columns=["acc", "cik", "filing_date", "period", "is_amendment", "amendment_type"])
    df["name"] = "X"; df["city"] = ""; df["state"] = ""
    return df


P = date(2025, 6, 30)


def test_restatement_replaces_original():
    subs = _subs([("a", 1, date(2025, 8, 1), P, False, ""), ("b", 1, date(2025, 9, 1), P, True, "RESTATEMENT")])
    eff = effective_accessions(subs)
    assert list(eff.acc) == ["b"]
    assert eff.first_filing_date.iloc[0] == date(2025, 8, 1)


def test_new_holdings_appends():
    subs = _subs([("a", 1, date(2025, 8, 1), P, False, ""), ("b", 1, date(2025, 9, 1), P, True, "NEW HOLDINGS")])
    assert sorted(effective_accessions(subs).acc) == ["a", "b"]


def test_new_holdings_before_restatement_dropped_and_blank_type_is_restatement():
    subs = _subs([
        ("a", 1, date(2025, 8, 1), P, False, ""),
        ("b", 1, date(2025, 8, 5), P, True, "NEW HOLDINGS"),
        ("c", 1, date(2025, 9, 1), P, True, ""),
        ("d", 1, date(2025, 9, 9), P, True, "NEW HOLDINGS"),
    ])
    assert sorted(effective_accessions(subs).acc) == ["c", "d"]


def test_orphan_new_holdings_dropped():
    subs = _subs([("a", 1, date(2025, 8, 1), P, True, "NEW HOLDINGS")])
    assert effective_accessions(subs).empty


def test_complete_periods_drops_partial_tail():
    rows = []
    for i, (p, n) in enumerate([(date(2025, 3, 31), 100), (date(2025, 6, 30), 100), (date(2025, 9, 30), 100),
                                (date(2025, 12, 31), 100), (date(2026, 3, 31), 100), (date(2026, 6, 30), 30)]):
        rows += [{"cik": c, "period": p, "acc": f"{i}-{c}"} for c in range(n)]
    eff = pd.DataFrame(rows)
    assert complete_periods(eff, 3) == [date(2025, 9, 30), date(2025, 12, 31), date(2026, 3, 31)]


def test_filings_table_uses_latest_name(brk_dir):
    subs = load_submissions([brk_dir])
    ft = filings_table(subs, effective_accessions(subs))
    row = ft[ft.period == date(2025, 12, 31)].iloc[0]
    assert row["name"] == "Berkshire Hathaway Inc" and row["cik"] == 1067983
```

- [ ] **Step 3：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_clean.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'sm.clean'`

- [ ] **Step 4：实现 `build/sm/clean.py`**

```python
"""Turn raw 13F tables into one clean holdings table: effective filings only, values in USD."""
from __future__ import annotations

from datetime import date
from pathlib import Path

import duckdb
import pandas as pd

VALUE_IN_DOLLARS_FROM = date(2023, 1, 3)  # filings on/after this date report VALUE in dollars, before in $1000s


def _concat(dirs: list[Path], table: str) -> pd.DataFrame:
    return pd.concat([pd.read_parquet(Path(d) / f"{table}.parquet") for d in dirs], ignore_index=True)


def load_submissions(dirs: list[Path]) -> pd.DataFrame:
    subs = _concat(dirs, "submission").drop_duplicates("ACCESSION_NUMBER")
    cover = _concat(dirs, "coverpage").drop_duplicates("ACCESSION_NUMBER")
    df = subs.merge(cover, on="ACCESSION_NUMBER", how="left")
    df = df[df["SUBMISSIONTYPE"].isin(["13F-HR", "13F-HR/A"])]
    out = pd.DataFrame({
        "acc": df["ACCESSION_NUMBER"],
        "cik": df["CIK"].astype("int64"),
        "filing_date": pd.to_datetime(df["FILING_DATE"], format="%d-%b-%Y").dt.date,
        "period": pd.to_datetime(df["PERIODOFREPORT"], format="%d-%b-%Y").dt.date,
        "is_amendment": (df["SUBMISSIONTYPE"] == "13F-HR/A") | (df["ISAMENDMENT"].fillna("") == "Y"),
        "amendment_type": df["AMENDMENTTYPE"].fillna("").str.upper().str.strip(),
        "name": df["FILINGMANAGER_NAME"].fillna(""),
        "city": df["FILINGMANAGER_CITY"].fillna(""),
        "state": df["FILINGMANAGER_STATEORCOUNTRY"].fillna(""),
    })
    return out.reset_index(drop=True)


def effective_accessions(subs: pd.DataFrame) -> pd.DataFrame:
    cols = ["cik", "period", "acc", "filing_date", "first_filing_date"]
    out = []
    ordered = subs.sort_values(["filing_date", "acc"])
    for (cik, period), g in ordered.groupby(["cik", "period"], sort=False):
        rows = g.to_dict("records")
        bases = [i for i, r in enumerate(rows) if not r["is_amendment"] or r["amendment_type"] != "NEW HOLDINGS"]
        if not bases:
            continue
        b = bases[-1]
        eff = [rows[b]] + [r for r in rows[b + 1:] if r["is_amendment"] and r["amendment_type"] == "NEW HOLDINGS"]
        first = rows[0]["filing_date"]
        out += [{"cik": cik, "period": period, "acc": r["acc"], "filing_date": r["filing_date"],
                 "first_filing_date": first} for r in eff]
    return pd.DataFrame(out, columns=cols)


def build_holdings(dirs: list[Path], eff: pd.DataFrame) -> pd.DataFrame:
    con = duckdb.connect()
    reg = eff[["acc", "cik", "period", "filing_date"]].assign(
        period=pd.to_datetime(eff["period"]), filing_date=pd.to_datetime(eff["filing_date"]))
    con.register("eff", reg)
    files = ", ".join("'" + str(Path(d) / "infotable.parquet").replace("'", "''") + "'" for d in dirs)
    df = con.execute(f"""
        WITH it AS (
            SELECT i.*, e.cik, e.period, e.filing_date
            FROM read_parquet([{files}]) i JOIN eff e ON i.ACCESSION_NUMBER = e.acc
            QUALIFY row_number() OVER (PARTITION BY i.ACCESSION_NUMBER, i.INFOTABLE_SK) = 1)
        SELECT cik, period, upper(trim(CUSIP)) AS cusip, upper(trim(PUTCALL)) AS put_call,
               any_value(NAMEOFISSUER) AS issuer, any_value(TITLEOFCLASS) AS title,
               sum(TRY_CAST(SSHPRNAMT AS DOUBLE)) AS shares,
               sum(TRY_CAST(VALUE AS DOUBLE)
                   * CASE WHEN filing_date >= DATE '{VALUE_IN_DOLLARS_FROM.isoformat()}' THEN 1 ELSE 1000 END) AS value_usd
        FROM it
        WHERE upper(trim(SSHPRNAMTTYPE)) = 'SH'
        GROUP BY ALL
    """).df()
    df["period"] = pd.to_datetime(df["period"]).dt.date
    df["cik"] = df["cik"].astype("int64")
    return df


def complete_periods(eff: pd.DataFrame, n: int) -> list[date]:
    counts = eff.drop_duplicates(["cik", "period"]).groupby("period")["cik"].count().sort_index()
    ps = [p for p in counts.index if (p.month, p.day) in {(3, 31), (6, 30), (9, 30), (12, 31)}]
    while len(ps) > 4 and counts[ps[-1]] < 0.9 * max(counts[p] for p in ps[-5:-1]):
        ps.pop()
    return ps[-n:]


def filings_table(subs: pd.DataFrame, eff: pd.DataFrame) -> pd.DataFrame:
    first = eff.drop_duplicates(["cik", "period"])[["cik", "period", "first_filing_date"]]
    names = (subs.sort_values(["filing_date", "acc"]).drop_duplicates(["cik", "period"], keep="last")
             [["cik", "period", "name", "city", "state"]])
    return first.merge(names, on=["cik", "period"], how="left").reset_index(drop=True)
```

- [ ] **Step 5：运行，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_clean.py -q`
Expected: `7 passed`

- [ ] **Step 6：提交**

```bash
git add smart-money/build/sm/clean.py smart-money/build/tests/make_fixtures.py smart-money/build/tests/fixtures/brk smart-money/build/tests/test_clean.py
git commit -m "feat(smart-money): 13F cleaning — amendments, value units, holdings table, Berkshire golden test"
```

---

### Task 5：证券主数据（OpenFIGI、SEC 公司信息、行业）

**Files:**
- Create: `smart-money/build/sm/figi.py`, `smart-money/build/sm/companies.py`, `smart-money/build/sm/sectors.py`, `smart-money/build/sic_sectors.csv`
- Test: `smart-money/build/tests/test_secmaster.py`

**Interfaces:**
- Consumes: `SecClient.get_json`、`SecError`、`read_dotenv`
- Produces:
  - `FigiRecord(cusip, ticker, name, exch_code, security_type, market_sector)`，属性有：
    - `.yf_ticker`：`/` 和空格都换成 `-`
    - `.is_equity`
    - `.is_etf`
  - `pick_record(cusip, data) -> FigiRecord | None`
  - `FigiMapper(cache_path=CACHE_DIR/"figi.json", *, session=None, api_key=None, sleep=time.sleep).map(cusips) -> dict[str, FigiRecord | None]`
  - `ticker_to_cik(client) -> dict[str, int]`
  - `sic_for(client, cik) -> int | None`
  - `shares_outstanding_series(client, cik) -> DataFrame[end: Timestamp, shares: float]`
  - `load_sic_sectors(path=None) -> list[tuple[int, int, str]]`
  - `sector_for(sic, table, is_etf=False) -> str`

- [ ] **Step 1：写 `build/sic_sectors.csv`**

规则是第一条匹配优先，所以更具体的区间放在前面。

```csv
lo,hi,sector
1300,1399,能源
2900,2999,能源
2830,2836,医疗保健
2840,2844,必需消费
3841,3851,医疗保健
3630,3639,可选消费
3711,3716,可选消费
3570,3579,信息技术
3600,3699,信息技术
3812,3812,工业
3800,3899,信息技术
5122,5122,医疗保健
5140,5149,必需消费
5400,5499,必需消费
5912,5912,必需消费
6798,6798,房地产
7310,7319,通信服务
7370,7379,信息技术
7990,7999,可选消费
100,999,必需消费
1000,1499,原材料
1500,1799,工业
2000,2199,必需消费
2200,2399,可选消费
2400,2499,原材料
2500,2599,可选消费
2600,2699,原材料
2700,2799,通信服务
2800,2899,原材料
3000,3099,原材料
3100,3199,可选消费
3200,3399,原材料
3400,3569,工业
3580,3599,工业
3700,3799,工业
3900,3999,可选消费
4000,4799,工业
4800,4899,通信服务
4900,4999,公用事业
5000,5199,工业
5200,5999,可选消费
6000,6499,金融
6500,6599,房地产
6700,6799,金融
7000,7299,可选消费
7300,7399,工业
7800,7989,通信服务
8000,8099,医疗保健
8200,8299,可选消费
8700,8799,工业
```

- [ ] **Step 2：写失败测试 `build/tests/test_secmaster.py`**

```python
import json

import pytest

from sm.companies import sic_for, shares_outstanding_series, ticker_to_cik
from sm.figi import FigiMapper, FigiRecord, pick_record
from sm.sec import SecError
from sm.sectors import load_sic_sectors, sector_for


def test_pick_record_prefers_us_composite():
    data = [{"ticker": "AAPL", "exchCode": "UW", "securityType": "Common Stock", "marketSector": "Equity", "name": "APPLE INC"},
            {"ticker": "AAPL", "exchCode": "US", "securityType": "Common Stock", "marketSector": "Equity", "name": "APPLE INC"}]
    r = pick_record("037833100", data)
    assert r.exch_code == "US" and r.is_equity and not r.is_etf
    assert pick_record("x", []) is None


def test_yf_ticker_and_types():
    r = FigiRecord("084670702", "BRK/B", "BERKSHIRE HATHAWAY INC-CL B", "US", "Common Stock", "Equity")
    assert r.yf_ticker == "BRK-B"
    assert FigiRecord("c", "SPY", "SPDR", "US", "ETP", "Equity").is_etf
    assert not FigiRecord("c", "X", "X", "US", "Equity Option", "Equity").is_equity


class FakePost:
    def __init__(self, payloads):
        self.payloads = list(payloads)
        self.bodies = []

    def post(self, url, json=None, headers=None, timeout=None):
        self.bodies.append(json)
        status, body = self.payloads.pop(0)

        class R:
            status_code = status
            text = "t"

            def json(self_inner):
                return body
        return R()


def test_figi_mapper_batches_caches_and_skips_errors(tmp_path):
    # Jobs are sent in sorted CUSIP order: 000000000, 037833100, BADBADBAD.
    s = FakePost([(200, [{"warning": "No identifier found."},
                         {"data": [{"ticker": "AAPL", "exchCode": "US", "securityType": "Common Stock", "marketSector": "Equity", "name": "APPLE"}]},
                         {"error": "Invalid idValue"}])])
    m = FigiMapper(tmp_path / "figi.json", session=s, api_key="k", sleep=lambda _: None)
    out = m.map(["037833100", "000000000", "BADBADBAD"])
    assert out["037833100"].ticker == "AAPL"
    assert out["000000000"] is None and out["BADBADBAD"] is None
    cached = json.loads((tmp_path / "figi.json").read_text())
    assert "000000000" in cached and cached["000000000"] is None   # definitive miss cached
    assert "BADBADBAD" not in cached                                # error not cached, retried next run
    m2 = FigiMapper(tmp_path / "figi.json", session=FakePost([]), api_key="k", sleep=lambda _: None)
    assert m2.map(["037833100"])["037833100"].ticker == "AAPL"      # served from cache, no HTTP


def test_figi_mapper_retries_429(tmp_path):
    s = FakePost([(429, None), (200, [{"warning": "No identifier found."}])])
    sleeps = []
    m = FigiMapper(tmp_path / "f.json", session=s, api_key="k", sleep=sleeps.append)
    assert m.map(["X"]) == {"X": None}
    assert sleeps[0] == 10


class FakeClient:
    def __init__(self, routes):
        self.routes = routes

    def get_json(self, url, max_age_s=None):
        if url not in self.routes:
            raise SecError("404 Not Found: " + url)
        return self.routes[url]


def test_company_lookups():
    c = FakeClient({
        "https://www.sec.gov/files/company_tickers.json": {"0": {"cik_str": 320193, "ticker": "AAPL", "title": "Apple"},
                                                           "1": {"cik_str": 1067983, "ticker": "BRK-B", "title": "BRK"}},
        "https://data.sec.gov/submissions/CIK0000320193.json": {"sic": "3571", "sicDescription": "Electronic Computers"},
        "https://data.sec.gov/api/xbrl/companyconcept/CIK0001652044/dei/EntityCommonStockSharesOutstanding.json": {"units": {"shares": [
            {"end": "2025-01-31", "val": 100, "accn": "a1", "filed": "2025-02-05"},
            {"end": "2025-01-31", "val": 50, "accn": "a1", "filed": "2025-02-05"},   # second share class, same filing
            {"end": "2025-04-20", "val": 160, "accn": "a2", "filed": "2025-04-25"},
            {"end": "2025-04-20", "val": 161, "accn": "a3", "filed": "2025-05-01"},  # later re-filing wins
        ]}},
    })
    assert ticker_to_cik(c) == {"AAPL": 320193, "BRK-B": 1067983}
    assert sic_for(c, 320193) == 3571
    so = shares_outstanding_series(c, 1652044)
    assert list(so.shares) == [150, 161]
    assert shares_outstanding_series(c, 999).empty


def test_sectors():
    t = load_sic_sectors()
    assert sector_for(3571, t) == "信息技术"
    assert sector_for(2834, t) == "医疗保健"
    assert sector_for(1311, t) == "能源"
    assert sector_for(6022, t) == "金融"
    assert sector_for(6798, t) == "房地产"
    assert sector_for(None, t) == "其他"
    assert sector_for(9995, t) == "其他"
    assert sector_for(3571, t, is_etf=True) == "ETF/基金"
```

- [ ] **Step 3：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_secmaster.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'sm.companies'`

- [ ] **Step 4：实现 `build/sm/figi.py`**

```python
"""CUSIP -> ticker via the OpenFIGI mapping API, with a permanent JSON cache."""
from __future__ import annotations

import json
import os
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import requests

from .config import CACHE_DIR, read_dotenv

OPENFIGI_URL = "https://api.openfigi.com/v3/mapping"
NON_EQUITY_TYPES = {"Equity Option", "Index Option", "Warrant", "Right"}


@dataclass(frozen=True)
class FigiRecord:
    cusip: str
    ticker: str
    name: str
    exch_code: str
    security_type: str
    market_sector: str

    @property
    def yf_ticker(self) -> str:
        return self.ticker.replace("/", "-").replace(" ", "-")

    @property
    def is_equity(self) -> bool:
        return self.market_sector == "Equity" and self.security_type not in NON_EQUITY_TYPES

    @property
    def is_etf(self) -> bool:
        return self.security_type == "ETP"


def pick_record(cusip: str, data: list[dict]) -> FigiRecord | None:
    if not data:
        return None
    best = next((d for d in data if d.get("exchCode") == "US"), data[0])
    return FigiRecord(cusip, best.get("ticker") or "", best.get("name") or "", best.get("exchCode") or "",
                      best.get("securityType") or "", best.get("marketSector") or "")


class FigiMapper:
    def __init__(self, cache_path: Path = CACHE_DIR / "figi.json", *, session=None, api_key: str | None = None,
                 sleep=time.sleep):
        self.cache_path = Path(cache_path)
        self.cache: dict = json.loads(self.cache_path.read_text()) if self.cache_path.exists() else {}
        self.session = session or requests.Session()
        self.api_key = api_key if api_key is not None else (
            os.environ.get("OPENFIGI_API_KEY") or read_dotenv().get("OPENFIGI_API_KEY") or "")
        # Public limits: with key 25 req / 6 s and 100 jobs per request; without key 25 req / min and 10 jobs.
        self.batch = 100 if self.api_key else 10
        self.interval = 0.25 if self.api_key else 2.5
        self._sleep = sleep

    def map(self, cusips) -> dict[str, FigiRecord | None]:
        cusips = list(cusips)
        todo = sorted({c for c in cusips if c not in self.cache})
        for i in range(0, len(todo), self.batch):
            chunk = todo[i:i + self.batch]
            for c, res in zip(chunk, self._post(chunk)):
                if "error" in res:
                    continue
                rec = pick_record(c, res.get("data") or [])
                self.cache[c] = asdict(rec) if rec else None
            self._save()
            self._sleep(self.interval)
            if (i // self.batch) % 20 == 0:
                print(f"[figi] {min(i + self.batch, len(todo))}/{len(todo)}")
        return {c: (FigiRecord(**self.cache[c]) if self.cache.get(c) else None) for c in cusips}

    def _post(self, chunk: list[str]) -> list[dict]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-OPENFIGI-APIKEY"] = self.api_key
        jobs = [{"idType": "ID_CUSIP", "idValue": c} for c in chunk]
        for attempt in range(4):
            r = self.session.post(OPENFIGI_URL, json=jobs, headers=headers, timeout=60)
            if r.status_code == 200:
                return r.json()
            if r.status_code == 429:
                self._sleep(10 * (attempt + 1))
                continue
            raise RuntimeError(f"OpenFIGI HTTP {r.status_code}: {r.text[:200]}")
        raise RuntimeError("OpenFIGI rate limit: giving up")

    def _save(self) -> None:
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.cache_path.with_name(self.cache_path.name + ".part")
        tmp.write_text(json.dumps(self.cache))
        tmp.replace(self.cache_path)
```

- [ ] **Step 5：实现 `build/sm/companies.py`**

```python
"""Issuer facts from SEC: ticker->CIK, SIC industry code, shares outstanding history."""
from __future__ import annotations

import pandas as pd

from .sec import SecClient, SecError

TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik:010d}.json"
SHARES_URL = "https://data.sec.gov/api/xbrl/companyconcept/CIK{cik:010d}/dei/EntityCommonStockSharesOutstanding.json"
MONTH = 30 * 86400


def ticker_to_cik(client: SecClient) -> dict[str, int]:
    raw = client.get_json(TICKERS_URL, max_age_s=7 * 86400)
    return {v["ticker"].upper(): int(v["cik_str"]) for v in raw.values()}


def sic_for(client: SecClient, cik: int) -> int | None:
    try:
        j = client.get_json(SUBMISSIONS_URL.format(cik=cik), max_age_s=MONTH)
    except SecError:
        return None
    sic = j.get("sic")
    return int(sic) if sic else None


def shares_outstanding_series(client: SecClient, cik: int) -> pd.DataFrame:
    empty = pd.DataFrame({"end": pd.Series(dtype="datetime64[ns]"), "shares": pd.Series(dtype=float)})
    try:
        j = client.get_json(SHARES_URL.format(cik=cik), max_age_s=MONTH)
    except SecError:
        return empty
    df = pd.DataFrame(j.get("units", {}).get("shares", []))
    if df.empty:
        return empty
    df["end"] = pd.to_datetime(df["end"])
    # Multi-class issuers report one value per class in the same filing: sum them; then keep the latest filing per date.
    g = df.groupby(["accn", "end", "filed"], as_index=False)["val"].sum()
    g = g.sort_values("filed").drop_duplicates("end", keep="last").sort_values("end")
    return g.rename(columns={"val": "shares"})[["end", "shares"]].astype({"shares": float}).reset_index(drop=True)
```

- [ ] **Step 6：实现 `build/sm/sectors.py`**

```python
"""Map SEC SIC codes to 11 GICS-style sectors (approximate; first matching range wins)."""
from __future__ import annotations

import csv
from pathlib import Path

from .config import BUILD_DIR


def load_sic_sectors(path: Path | None = None) -> list[tuple[int, int, str]]:
    with open(path or BUILD_DIR / "sic_sectors.csv", encoding="utf-8") as f:
        return [(int(r["lo"]), int(r["hi"]), r["sector"]) for r in csv.DictReader(f)]


def sector_for(sic: int | None, table: list[tuple[int, int, str]], is_etf: bool = False) -> str:
    if is_etf:
        return "ETF/基金"
    if sic is None:
        return "其他"
    for lo, hi, sector in table:
        if lo <= sic <= hi:
            return sector
    return "其他"
```

- [ ] **Step 7：运行，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_secmaster.py -q`
Expected: `6 passed`

- [ ] **Step 8：提交**

```bash
git add smart-money/build/sm/figi.py smart-money/build/sm/companies.py smart-money/build/sm/sectors.py smart-money/build/sic_sectors.csv smart-money/build/tests/test_secmaster.py
git commit -m "feat(smart-money): security master — OpenFIGI mapping, SEC issuer facts, SIC sectors"
```

---

### Task 6：价格与拆股

**Files:**
- Create: `smart-money/build/sm/prices.py`
- Test: `smart-money/build/tests/test_prices.py`

**Interfaces:**
- Produces:
  - `PRICE_COLS = ["date", "ticker", "close", "adj_close", "split"]`。`date` 是 datetime64；`close` 是拆股复权价；`adj_close` 是全收益复权价；`split` 是拆股比例，没有拆股为 0。
  - `PriceSource` Protocol，`.fetch(tickers, start, end) -> DataFrame[PRICE_COLS]`
  - `YFinanceSource`
  - `update_prices(source, tickers, start, end, path=CACHE_DIR/"prices.parquet", chunk=200, today=None) -> DataFrame`
  - `split_factors(prices, ticker_by_cusip: dict[str, str], periods: list[date]) -> DataFrame[cusip, pi, factor]`：`factor` 是 (periods[pi−1], periods[pi]] 区间内全部拆股比例的乘积，只输出不等于 1 的行
  - `wide_adj_close(prices) -> DataFrame`：行是日期，列是代码，已向前填充

- [ ] **Step 1：写失败测试 `build/tests/test_prices.py`**

```python
from datetime import date

import pandas as pd

from sm.prices import PRICE_COLS, split_factors, update_prices, wide_adj_close


class FakeSource:
    def __init__(self):
        self.calls = []

    def fetch(self, tickers, start, end):
        self.calls.append(list(tickers))
        d = pd.to_datetime(["2025-07-31", "2025-08-01"])
        return pd.DataFrame([(dt, t, 1.0, 1.0, 0.0) for t in tickers for dt in d], columns=PRICE_COLS)


def test_update_prices_fetches_only_missing_when_fresh(tmp_path):
    p = tmp_path / "px.parquet"
    src = FakeSource()
    update_prices(src, ["AAA", "BBB"], date(2025, 7, 1), date(2025, 8, 1), p, today=date(2025, 8, 2))
    update_prices(src, ["AAA", "BBB", "CCC"], date(2025, 7, 1), date(2025, 8, 1), p, today=date(2025, 8, 2))
    assert src.calls == [["AAA", "BBB"], ["CCC"]]
    assert set(pd.read_parquet(p).ticker) == {"AAA", "BBB", "CCC"}


def test_update_prices_refetches_all_when_stale(tmp_path):
    p = tmp_path / "px.parquet"
    src = FakeSource()
    update_prices(src, ["AAA"], date(2025, 7, 1), date(2025, 8, 1), p, today=date(2025, 8, 2))
    update_prices(src, ["AAA"], date(2025, 7, 1), date(2025, 9, 1), p, today=date(2025, 9, 2))
    assert src.calls == [["AAA"], ["AAA"]]


def test_split_factors_bucket_by_period():
    periods = [date(2025, 3, 31), date(2025, 6, 30), date(2025, 9, 30)]
    px = pd.DataFrame([
        (pd.Timestamp("2025-06-30"), "AAA", 1, 1, 2.0),   # on period end -> belongs to (Mar 31, Jun 30] -> pi 1
        (pd.Timestamp("2025-08-01"), "AAA", 1, 1, 3.0),   # pi 2
        (pd.Timestamp("2025-02-01"), "AAA", 1, 1, 5.0),   # before first period -> ignored
        (pd.Timestamp("2025-08-01"), "ZZZ", 1, 1, 4.0),   # ticker not in map -> ignored
    ], columns=PRICE_COLS)
    f = split_factors(px, {"C1": "AAA", "C2": "AAA"}, periods)
    got = {(r.cusip, r.pi): r.factor for r in f.itertuples()}
    assert got == {("C1", 1): 2.0, ("C1", 2): 3.0, ("C2", 1): 2.0, ("C2", 2): 3.0}


def test_wide_adj_close_forward_fills():
    px = pd.DataFrame([(pd.Timestamp("2025-01-02"), "A", 1, 10, 0), (pd.Timestamp("2025-01-03"), "B", 1, 5, 0),
                       (pd.Timestamp("2025-01-02"), "B", 1, 4, 0)], columns=PRICE_COLS)
    w = wide_adj_close(px)
    assert w.loc["2025-01-03", "A"] == 10 and w.loc["2025-01-02", "B"] == 4
```

- [ ] **Step 2：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_prices.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'sm.prices'`

- [ ] **Step 3：实现 `build/sm/prices.py`**

```python
"""Daily prices and split events behind a swappable PriceSource (default: yfinance)."""
from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path
from typing import Protocol

import pandas as pd

from .config import CACHE_DIR

PRICE_COLS = ["date", "ticker", "close", "adj_close", "split"]


def _empty() -> pd.DataFrame:
    return pd.DataFrame({"date": pd.Series(dtype="datetime64[ns]"), "ticker": pd.Series(dtype=str),
                         "close": pd.Series(dtype=float), "adj_close": pd.Series(dtype=float),
                         "split": pd.Series(dtype=float)})


class PriceSource(Protocol):
    def fetch(self, tickers: list[str], start: date, end: date) -> pd.DataFrame: ...


class YFinanceSource:
    def fetch(self, tickers: list[str], start: date, end: date) -> pd.DataFrame:
        import yfinance as yf

        raw = yf.download(tickers, start=start.isoformat(), end=(end + timedelta(days=1)).isoformat(),
                          actions=True, auto_adjust=False, progress=False, threads=True, group_by="column")
        if raw is None or raw.empty:
            return _empty()
        parts = [raw[col].stack(future_stack=True).rename(name)
                 for col, name in (("Close", "close"), ("Adj Close", "adj_close"), ("Stock Splits", "split"))]
        df = pd.concat(parts, axis=1).reset_index()
        df.columns = PRICE_COLS
        df = df.dropna(subset=["close"])
        df["split"] = df["split"].fillna(0.0)
        return df


def update_prices(source: PriceSource, tickers, start: date, end: date, path: Path = CACHE_DIR / "prices.parquet",
                  chunk: int = 200, today: date | None = None) -> pd.DataFrame:
    path = Path(path)
    today = today or date.today()
    have = pd.read_parquet(path) if path.exists() else _empty()
    stale = have.empty or have["date"].max().date() < min(end, today) - timedelta(days=4)
    wanted = sorted(set(tickers))
    need = wanted if stale else sorted(set(wanted) - set(have["ticker"].unique()))
    frames = [have[~have["ticker"].isin(need)]] if not have.empty else []
    for i in range(0, len(need), chunk):
        print(f"[prices] {i + len(need[i:i + chunk])}/{len(need)}")
        frames.append(source.fetch(need[i:i + chunk], start, end))
    out = pd.concat(frames, ignore_index=True) if frames else _empty()
    out = out.drop_duplicates(["date", "ticker"], keep="last").sort_values(["ticker", "date"]).reset_index(drop=True)
    path.parent.mkdir(parents=True, exist_ok=True)
    out.to_parquet(path, index=False)
    return out


def split_factors(prices: pd.DataFrame, ticker_by_cusip: dict[str, str], periods: list[date]) -> pd.DataFrame:
    cols = ["cusip", "pi", "factor"]
    sp = prices[prices["split"] > 0]
    if sp.empty:
        return pd.DataFrame(columns=cols)
    ends = pd.to_datetime(pd.Series(periods)).values
    pi = ends.searchsorted(sp["date"].values, side="left")
    sp = sp.assign(pi=pi)
    sp = sp[(sp["pi"] >= 1) & (sp["pi"] < len(periods))]
    by_t = sp.groupby(["ticker", "pi"])["split"].prod().rename("factor").reset_index()
    m = pd.DataFrame(list(ticker_by_cusip.items()), columns=["cusip", "ticker"])
    out = m.merge(by_t, on="ticker")[cols]
    return out[out["factor"] != 1].reset_index(drop=True)


def wide_adj_close(prices: pd.DataFrame) -> pd.DataFrame:
    w = prices.pivot_table(index="date", columns="ticker", values="adj_close", aggfunc="last").sort_index()
    return w.ffill()
```

- [ ] **Step 4：运行，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_prices.py -q`
Expected: `4 passed`

- [ ] **Step 5：提交**

```bash
git add smart-money/build/sm/prices.py smart-money/build/tests/test_prices.py
git commit -m "feat(smart-money): price cache, split factors per period, yfinance source"
```

---

### Task 7：指标（变动分类、经理指标、个股面板、拥挤度）

**Files:**
- Create: `smart-money/build/sm/metrics.py`
- Test: `smart-money/build/tests/test_metrics.py`

**Interfaces:**
- Produces:
  - `classify(prev_shares: Series, curr_shares: Series, factor: Series | None, thr) -> DataFrame[prev_adj, curr, chg, kind]`，以 cusip 为索引，kind 取值 `new/add/trim/exit/hold`
  - `hhi(w) -> float`、`top_n_weight(w, n=10) -> float`
  - `turnover(cls, px_curr, px_prev, v_prev, v_curr) -> float | None`
  - `manager_history(hm, n_periods, fac_wide, thr) -> (series: dict[str, list], changes: dict[int, (DataFrame, prev_pi)])`
    - `hm` 是单个经理的股票持仓，列为 `[pi, cusip, shares, value_usd]`
    - `fac_wide` 行是 cusip、列是 pi，值为拆股因子
  - `stock_panel(h_eq, filers, factors, curated: set[int], thr) -> (holders, flows)`
    - `holders` 列为 `[cusip, pi, holders, shares, value]`
    - `flows` 列为 `[cusip, pi, kind, grp, dollars, n]`
  - `crowding_scores(df[curated_holders, pct_held, avg_curated_w]) -> Series`，取值 0–100

- [ ] **Step 1：写失败测试 `build/tests/test_metrics.py`**

```python
import numpy as np
import pandas as pd
import pytest

from sm.metrics import classify, crowding_scores, hhi, manager_history, stock_panel, top_n_weight, turnover


def S(d):
    return pd.Series(d, dtype=float)


def test_classify_handles_split_and_all_kinds():
    cls = classify(S({"A": 100, "B": 50, "D": 10}), S({"A": 200, "B": 100, "C": 5}), S({"A": 2.0}), 0.02)
    assert cls.kind.to_dict() == {"A": "hold", "B": "add", "C": "new", "D": "exit"}
    assert cls.loc["B", "chg"] == 50 and cls.loc["A", "prev_adj"] == 200


def test_classify_threshold():
    cls = classify(S({"A": 100, "B": 100, "C": 100}), S({"A": 101, "B": 103, "C": 97}), None, 0.02)
    assert cls.kind.to_dict() == {"A": "hold", "B": "add", "C": "trim"}


def test_turnover():
    cls = classify(S({"A": 100, "B": 50, "D": 10}), S({"A": 200, "B": 100, "C": 5}), S({"A": 2.0}), 0.02)
    t = turnover(cls, S({"A": 13, "B": 22, "C": 50}), S({"A": 5, "B": 20, "D": 7}), 2000, 3000)
    assert t == pytest.approx(70 / 2500)   # buys 1350, sells 70


def test_concentration():
    assert hhi(S({"a": .5, "b": .5})) == pytest.approx(.5)
    assert top_n_weight(S({"a": .5, "b": .3, "c": .2}), 2) == pytest.approx(.8)


def test_manager_history_skips_missing_quarter():
    hm = pd.DataFrame([(0, "A", 10, 100.0), (2, "A", 10, 130.0), (2, "U", 5, 50.0)],
                      columns=["pi", "cusip", "shares", "value_usd"])
    series, changes = manager_history(hm, 3, pd.DataFrame(), 0.02)
    assert series["value"] == [100.0, None, 180.0]
    assert series["n"] == [1, None, 2]
    assert list(changes) == [2]
    cls, prev_pi = changes[2]
    assert prev_pi == 0 and cls.kind.to_dict() == {"A": "hold", "U": "new"}
    assert series["hold_q"][2] == pytest.approx(1.0)   # run resets after a gap


def test_manager_history_consecutive_runs_and_split():
    hm = pd.DataFrame([(0, "A", 100, 1000.0), (1, "A", 200, 1300.0)], columns=["pi", "cusip", "shares", "value_usd"])
    fac = pd.DataFrame({1: [2.0]}, index=["A"])
    series, changes = manager_history(hm, 2, fac, 0.02)
    assert changes[1][0].kind["A"] == "hold"
    assert series["hold_q"] == [1.0, 2.0]
    assert series["turnover"] == [None, 0.0]


def test_stock_panel_flows_require_both_filings():
    h = pd.DataFrame([
        (3, 0, "BBB", 1000, 20000), (3, 1, "BBB", 1000, 22000), (3, 2, "BBB", 500, 11500),
        (1, 1, "BBB", 100, 2200), (1, 2, "AAA", 200, 2600),
    ], columns=["cik", "pi", "cusip", "shares", "value_usd"]).astype({"shares": float, "value_usd": float})
    filers = pd.DataFrame([(3, 0), (3, 1), (3, 2), (1, 1), (1, 2)], columns=["cik", "pi"])
    holders, flows = stock_panel(h, filers, pd.DataFrame(columns=["cusip", "pi", "factor"]), {1}, 0.02)
    b2 = flows[(flows.cusip == "BBB") & (flows.pi == 2)].set_index(["kind", "grp"])
    assert b2.loc[("exit", "curated"), "dollars"] == pytest.approx(2200)
    assert b2.loc[("trim", "other"), "dollars"] == pytest.approx(11500)
    assert flows[(flows.cusip == "BBB") & (flows.pi == 1)].empty   # cik1 did not file at pi 0; cik3 held flat
    assert holders.set_index(["cusip", "pi"]).loc[("BBB", 2), "holders"] == 1


def test_crowding_scores():
    df = pd.DataFrame({"curated_holders": [0, 1, 2], "pct_held": [0.1, 0.2, np.nan], "avg_curated_w": [0, .01, .05]})
    assert list(crowding_scores(df)) == [38.9, 77.8, 100.0]
```

- [ ] **Step 2：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_metrics.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'sm.metrics'`

- [ ] **Step 3：实现 `build/sm/metrics.py`**

```python
"""Position-change classification, manager style metrics, cross-filer stock panel, crowding score."""
from __future__ import annotations

import duckdb
import numpy as np
import pandas as pd

KINDS = ("new", "add", "trim", "exit", "hold")


def classify(prev_shares: pd.Series, curr_shares: pd.Series, factor: pd.Series | None, thr: float) -> pd.DataFrame:
    idx = prev_shares.index.union(curr_shares.index)
    f = factor.reindex(idx).fillna(1.0) if factor is not None else 1.0
    p = prev_shares.reindex(idx).fillna(0.0) * f
    c = curr_shares.reindex(idx).fillna(0.0)
    ratio = np.where(p > 0, c / np.where(p > 0, p, 1.0) - 1.0, np.nan)
    kind = np.select([(p == 0) & (c > 0), (p > 0) & (c == 0), ratio > thr, ratio < -thr],
                     ["new", "exit", "add", "trim"], default="hold")
    return pd.DataFrame({"prev_adj": p, "curr": c, "chg": c - p, "kind": kind}, index=idx)


def hhi(w: pd.Series) -> float:
    return float((w ** 2).sum())


def top_n_weight(w: pd.Series, n: int = 10) -> float:
    return float(w.nlargest(n).sum())


def turnover(cls: pd.DataFrame, px_curr: pd.Series, px_prev: pd.Series, v_prev: float, v_curr: float) -> float | None:
    px = px_curr.reindex(cls.index).fillna(px_prev.reindex(cls.index))
    buys = float((cls["chg"].clip(lower=0) * px).sum())
    sells = float(((-cls["chg"]).clip(lower=0) * px).sum())
    avg = (v_prev + v_curr) / 2
    return min(buys, sells) / avg if avg > 0 else None


def _factor(fac_wide: pd.DataFrame, cusips: pd.Index, a: int, b: int) -> pd.Series:
    """Cumulative split factor per cusip over periods (a, b]."""
    if fac_wide is None or fac_wide.empty:
        return pd.Series(1.0, index=cusips)
    cols = [c for c in range(a + 1, b + 1) if c in fac_wide.columns]
    if not cols:
        return pd.Series(1.0, index=cusips)
    return fac_wide.reindex(index=cusips, columns=cols).fillna(1.0).prod(axis=1)


def manager_history(hm: pd.DataFrame, n_periods: int, fac_wide: pd.DataFrame, thr: float):
    keys = ("value", "n", "top10", "hhi", "turnover", "hold_q")
    series = {k: [None] * n_periods for k in keys}
    changes: dict[int, tuple[pd.DataFrame, int]] = {}
    by_pi = {int(pi): g.groupby("cusip")[["shares", "value_usd"]].sum() for pi, g in hm.groupby("pi")}
    prev_pi, run = None, pd.Series(dtype=float)
    for pi in range(n_periods):
        g = by_pi.get(pi)
        if g is None or g["value_usd"].sum() <= 0:
            continue
        v = float(g["value_usd"].sum())
        w = g["value_usd"] / v
        series["value"][pi], series["n"][pi] = v, int(len(g))
        series["top10"][pi], series["hhi"][pi] = top_n_weight(w), hhi(w)
        if prev_pi is not None:
            p = by_pi[prev_pi]
            f = _factor(fac_wide, g.index.union(p.index), prev_pi, pi)
            cls = classify(p["shares"], g["shares"], f, thr)
            px_curr = g["value_usd"] / g["shares"]
            px_prev = (p["value_usd"] / p["shares"]) / f.reindex(p.index).fillna(1.0)
            series["turnover"][pi] = turnover(cls, px_curr, px_prev, float(p["value_usd"].sum()), v)
            changes[pi] = (cls, prev_pi)
        run = run.reindex(g.index).fillna(0) + 1 if prev_pi == pi - 1 else pd.Series(1.0, index=g.index)
        series["hold_q"][pi] = float((w * run.reindex(w.index)).sum())
        prev_pi = pi
    return series, changes


def stock_panel(h_eq: pd.DataFrame, filers: pd.DataFrame, factors: pd.DataFrame, curated: set[int], thr: float):
    con = duckdb.connect()
    con.register("h", h_eq[["cik", "pi", "cusip", "shares", "value_usd"]])
    con.register("filers", filers[["cik", "pi"]].drop_duplicates())
    con.register("f", factors[["cusip", "pi", "factor"]].astype({"factor": float}) if len(factors)
                 else pd.DataFrame({"cusip": pd.Series(dtype=str), "pi": pd.Series(dtype="int64"),
                                    "factor": pd.Series(dtype=float)}))
    con.register("cur", pd.DataFrame({"cik": pd.Series(sorted(curated), dtype="int64")}))
    holders = con.execute("""SELECT cusip, pi, count(*) AS holders, sum(shares) AS shares, sum(value_usd) AS value
                             FROM h WHERE shares > 0 GROUP BY 1, 2""").df()
    flows = con.execute(f"""
        WITH both_filed AS (
            SELECT a.cik, a.pi FROM filers a JOIN filers b ON a.cik = b.cik AND b.pi = a.pi - 1),
        pairs AS (
            SELECT coalesce(c.cik, p.cik) AS cik, coalesce(c.pi, p.pi + 1) AS pi, coalesce(c.cusip, p.cusip) AS cusip,
                   c.shares AS cs, c.value_usd AS cv, p.shares AS ps, p.value_usd AS pv
            FROM h c FULL OUTER JOIN h p ON c.cik = p.cik AND c.cusip = p.cusip AND c.pi = p.pi + 1),
        x AS (
            SELECT pr.cik, pr.pi, pr.cusip,
                   coalesce(pr.ps, 0) * coalesce(f.factor, 1) AS prev_adj, coalesce(pr.cs, 0) AS curr,
                   coalesce(pr.cv / nullif(pr.cs, 0), pr.pv / nullif(pr.ps, 0) / coalesce(f.factor, 1)) AS px
            FROM pairs pr JOIN both_filed bo ON bo.cik = pr.cik AND bo.pi = pr.pi
            LEFT JOIN f ON f.cusip = pr.cusip AND f.pi = pr.pi),
        k AS (
            SELECT *, CASE WHEN prev_adj = 0 AND curr > 0 THEN 'new'
                           WHEN prev_adj > 0 AND curr = 0 THEN 'exit'
                           WHEN curr / prev_adj - 1 > {thr} THEN 'add'
                           WHEN curr / prev_adj - 1 < -{thr} THEN 'trim'
                           ELSE 'hold' END AS kind
            FROM x)
        SELECT k.cusip, k.pi, k.kind, CASE WHEN cur.cik IS NULL THEN 'other' ELSE 'curated' END AS grp,
               sum(abs(curr - prev_adj) * px) AS dollars, count(*) AS n
        FROM k LEFT JOIN cur ON cur.cik = k.cik
        WHERE kind <> 'hold'
        GROUP BY ALL
    """).df()
    return holders, flows


def crowding_scores(df: pd.DataFrame) -> pd.Series:
    r = df[["curated_holders", "pct_held", "avg_curated_w"]].rank(pct=True)
    return (r.mean(axis=1, skipna=True) * 100).round(1)
```

- [ ] **Step 4：运行，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_metrics.py -q`
Expected: `8 passed`

- [ ] **Step 5：提交**

```bash
git add smart-money/build/sm/metrics.py smart-money/build/tests/test_metrics.py
git commit -m "feat(smart-money): change classification, manager metrics, stock panel, crowding score"
```

---

### Task 8：13F 克隆回测

**Files:**
- Create: `smart-money/build/sm/backtest.py`
- Test: `smart-money/build/tests/test_backtest.py`

**Interfaces:**
- Consumes: `wide_adj_close` 的输出，即向前填充后的宽表
- Produces:
  - `Rebalance(date: Timestamp, weights: dict[str, float], coverage: float)`
  - `trading_day_after(index, d) -> Timestamp | None`、`trading_day_on_or_before(index, d) -> Timestamp | None`
  - `make_rebalance(day, positions: Series[ticker->value], total_value, px) -> Rebalance | None`：空代码或缺价格的持仓被剔除，权重重新归一化
  - `run_clone(rebs, px, end) -> Series`：按日的组合净值，从 1.0 开始
  - `perf_stats(v) -> {cagr, vol, sharpe, mdd}`：夏普比率按无风险利率 0 计算

- [ ] **Step 1：写失败测试 `build/tests/test_backtest.py`**

```python
import pandas as pd
import pytest

from sm.backtest import (Rebalance, make_rebalance, perf_stats, run_clone, trading_day_after,
                         trading_day_on_or_before)

IDX = pd.to_datetime(["2025-01-06", "2025-01-07", "2025-01-08", "2025-01-09", "2025-01-10"])
PX = pd.DataFrame({"A": [10, 11, 12, 12, 13], "B": [20, 20, 22, 24, 24]}, index=IDX, dtype=float)


def test_run_clone_hand_computed():
    rebs = [Rebalance(IDX[0], {"A": .5, "B": .5}, 1.0), Rebalance(IDX[2], {"A": 1.0}, 1.0)]
    v = run_clone(rebs, PX, IDX[-1])
    assert list(v.index) == list(IDX)
    assert list(v.round(6)) == [1.0, 1.05, 1.15, 1.15, round(1.15 * 13 / 12, 6)]


def test_make_rebalance_drops_unpriced_and_reports_coverage():
    px = PX.assign(C=[float("nan")] * 5)
    r = make_rebalance(IDX[0], pd.Series({"A": 60.0, "C": 20.0, "": 20.0}), 100.0, px)
    assert r.weights == {"A": 1.0}
    assert r.coverage == pytest.approx(0.6)
    assert make_rebalance(IDX[0], pd.Series({"C": 1.0}), 1.0, px) is None


def test_trading_day_helpers():
    sat = pd.Timestamp("2025-01-11")
    assert trading_day_after(IDX, pd.Timestamp("2025-01-04")) == IDX[0]   # Saturday filing -> Monday
    assert trading_day_after(IDX, IDX[0]) == IDX[1]                       # filed during the day -> next close
    assert trading_day_after(IDX, sat) is None
    assert trading_day_on_or_before(IDX, sat) == IDX[-1]
    assert trading_day_on_or_before(IDX, pd.Timestamp("2025-01-01")) is None


def test_perf_stats():
    v = pd.Series([1.0, 1.2, 0.9, 1.0], index=pd.to_datetime(["2020-01-01", "2020-06-01", "2020-09-01", "2021-01-01"]))
    s = perf_stats(v)
    assert s["mdd"] == pytest.approx(0.9 / 1.2 - 1)
    assert s["cagr"] == pytest.approx(0.0, abs=1e-12)
```

- [ ] **Step 2：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_backtest.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'sm.backtest'`

- [ ] **Step 3：实现 `build/sm/backtest.py`**

```python
"""Buy-and-hold clone of a manager's reported long book, rebalanced at each disclosure."""
from __future__ import annotations

import math
from dataclasses import dataclass

import pandas as pd


@dataclass
class Rebalance:
    date: pd.Timestamp
    weights: dict[str, float]
    coverage: float


def trading_day_after(index: pd.DatetimeIndex, d) -> pd.Timestamp | None:
    pos = index.searchsorted(pd.Timestamp(d), side="right")
    return index[pos] if pos < len(index) else None


def trading_day_on_or_before(index: pd.DatetimeIndex, d) -> pd.Timestamp | None:
    pos = index.searchsorted(pd.Timestamp(d), side="right") - 1
    return index[pos] if pos >= 0 else None


def make_rebalance(day: pd.Timestamp, positions: pd.Series, total_value: float, px: pd.DataFrame) -> Rebalance | None:
    priced = {}
    for t, v in positions.items():
        if t and t in px.columns and pd.notna(px.at[day, t]) and v > 0:
            priced[t] = float(v)
    s = sum(priced.values())
    if s <= 0 or total_value <= 0:
        return None
    return Rebalance(day, {t: v / s for t, v in priced.items()}, s / total_value)


def run_clone(rebs: list[Rebalance], px: pd.DataFrame, end: pd.Timestamp) -> pd.Series:
    rebs = sorted({r.date: r for r in rebs}.values(), key=lambda r: r.date)
    parts, level = [], 1.0
    for i, r in enumerate(rebs):
        stop = rebs[i + 1].date if i + 1 < len(rebs) else end
        seg = px.loc[r.date:stop, list(r.weights)]
        rel = (seg / seg.iloc[0]).mul(pd.Series(r.weights)).sum(axis=1)
        vals = level * rel
        level = float(vals.iloc[-1])
        parts.append(vals.iloc[:-1] if i + 1 < len(rebs) else vals)
    return pd.concat(parts)


def perf_stats(v: pd.Series) -> dict:
    r = v.pct_change().dropna()
    years = (v.index[-1] - v.index[0]).days / 365.25
    cagr = (v.iloc[-1] / v.iloc[0]) ** (1 / years) - 1 if years > 0 else None
    vol = float(r.std() * math.sqrt(252)) if len(r) > 1 else None
    sharpe = float(r.mean() * 252 / vol) if vol else None
    mdd = float((v / v.cummax() - 1).min())
    return {"cagr": None if cagr is None else float(cagr), "vol": vol, "sharpe": sharpe, "mdd": mdd}
```

- [ ] **Step 4：运行，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_backtest.py -q`
Expected: `4 passed`

- [ ] **Step 5：提交**

```bash
git add smart-money/build/sm/backtest.py smart-money/build/tests/test_backtest.py
git commit -m "feat(smart-money): 13F clone backtest with disclosure-date rebalancing"
```

---

### Task 9：导出 JSON（契约、schema、体积预算）

**Files:**
- Create: `smart-money/build/sm/schemas.py`, `smart-money/build/sm/export.py`, `smart-money/build/tests/tiny.py`
- Test: `smart-money/build/tests/test_export.py`

**Interfaces:**
- Consumes：Task 5–8 的所有函数，以及 `Manager`、`Settings`
- Produces:
  - `BuildInputs(periods, holdings, filings, secmeta, shares_out, prices)`
    - `holdings`：Task 4 的输出
    - `filings`：Task 4 `filings_table` 的输出
    - `secmeta`：列为 `[cusip, ticker|None, name|None, sector, is_equity|None, is_etf|None]`
    - `shares_out`：列为 `[ticker, end, shares]`
    - `prices`：列为 `PRICE_COLS`
  - `export_all(inp, settings, managers, out_dir) -> dict`：返回统计信息，并按"JSON 数据契约"写出全部文件
  - `BudgetError`

- [ ] **Step 1：写 `build/sm/schemas.py`**

```python
"""Minimal JSON schemas for the files the front end reads (shape checks, not business rules)."""
NUM = {"type": ["number", "null"]}
NUMS = {"type": "array", "items": NUM}
STR_ARR = {"type": "array", "items": {"type": "string"}}

META = {"type": "object", "required": ["generated_at", "latest_period", "periods", "managers", "stocks", "coverage", "universe"],
        "properties": {"periods": STR_ARR,
                       "managers": {"type": "array", "items": {"type": "object", "required": ["cik", "name", "person", "style", "value", "n"]}},
                       "stocks": {"type": "array", "items": {"type": "object", "required": ["t", "n", "s"]}}}}
HOME = {"type": "object", "required": ["period", "most_bought", "most_sold", "crowded", "sector_flows"],
        "properties": {"sector_flows": {"type": "object", "required": ["buys", "sells"]}}}
MANAGER = {"type": "object",
           "required": ["cik", "name", "person", "style", "bio", "sources", "periods", "series", "sectors", "latest",
                        "changes", "race", "options", "backtest", "similar"],
           "properties": {"series": {"type": "object", "required": ["value", "n", "top10", "hhi", "turnover", "hold_q"],
                                     "additionalProperties": NUMS},
                          "backtest": {"type": ["object", "null"]}}}
STOCK = {"type": "object", "required": ["t", "n", "cusip", "s", "is_etf", "price", "holders", "flows", "curated", "crowding"],
         "properties": {"holders": {"type": "object", "required": ["periods", "count", "pct", "value"]}}}
```

- [ ] **Step 2：写小数据集 `build/tests/tiny.py`**

```python
"""Hand-built 3-period universe used by export tests. See test_export.py for the expected numbers."""
from datetime import date

import numpy as np
import pandas as pd

from sm.config import Manager, Settings, Source
from sm.export import BuildInputs
from sm.prices import PRICE_COLS

PERIODS = [date(2025, 3, 31), date(2025, 6, 30), date(2025, 9, 30)]
SETTINGS = Settings(quarters=3, change_threshold=0.02, stock_universe_top_n=10, holdings_per_quarter=150,
                    changes_per_quarter=100, manager_json_max_kb=300, stock_json_max_kb=100, data_dir_max_mb=50)
MANAGERS = [
    Manager(1, "Alpha Capital", "Ann Alpha", ["价值"], 2001, ["Fact."], [Source("src", "https://example.com/a")]),
    Manager(2, "Beta Partners", "Bob Beta", ["成长"], None, ["Fact."], [Source("src", "https://example.com/b")]),
]


def inputs() -> BuildInputs:
    p0, p1, p2 = PERIODS
    rows = [
        (1, p0, "A1", "", "AAA CORP", 100, 1000), (1, p0, "B1", "", "BBB INC", 50, 1000),
        (1, p1, "A1", "", "AAA CORP", 100, 1200), (1, p1, "B1", "", "BBB INC", 100, 2200),
        (1, p2, "A1", "", "AAA CORP", 200, 2600), (1, p2, "C1", "", "CCC LTD", 10, 500),
        (1, p2, "A1", "PUT", "AAA CORP", 100, 300),
        (2, p0, "A1", "", "AAA CORP", 10, 100),
        (2, p2, "A1", "", "AAA CORP", 20, 260), (2, p2, "U1", "", "MYSTERY CO", 5, 50),
        (3, p0, "B1", "", "BBB INC", 1000, 20000), (3, p1, "B1", "", "BBB INC", 1000, 22000),
        (3, p2, "B1", "", "BBB INC", 500, 11500), (3, p2, "C1", "", "CCC LTD", 100, 5000),
    ]
    holdings = pd.DataFrame(rows, columns=["cik", "period", "cusip", "put_call", "issuer", "shares", "value_usd"])
    holdings["title"] = "COM"
    holdings = holdings.astype({"shares": float, "value_usd": float})
    fil = [(1, p0), (1, p1), (1, p2), (2, p0), (2, p2), (3, p0), (3, p1), (3, p2)]
    first = {p0: date(2025, 5, 10), p1: date(2025, 8, 9), p2: date(2025, 11, 8)}   # Saturdays
    filings = pd.DataFrame([{"cik": c, "period": p, "first_filing_date": first[p], "name": {1: "ALPHA CAPITAL LLC", 2: "BETA PARTNERS LP", 3: "GAMMA"}[c],
                             "city": "NEW YORK", "state": "NY"} for c, p in fil])
    secmeta = pd.DataFrame([
        ("A1", "AAA", "AAA CORP", "信息技术", True, False), ("B1", "BBB", "BBB INC", "金融", True, False),
        ("C1", "CCC", "CCC LTD", "能源", True, False), ("U1", None, None, "其他", None, None),
    ], columns=["cusip", "ticker", "name", "sector", "is_equity", "is_etf"])
    shares_out = pd.DataFrame([("AAA", pd.Timestamp("2025-01-01"), 1000.0), ("BBB", pd.Timestamp("2025-01-01"), 10000.0)],
                              columns=["ticker", "end", "shares"])
    days = pd.bdate_range("2025-03-03", "2025-12-31")
    n = len(days)
    series = {"AAA": np.linspace(10, 13, n), "BBB": np.full(n, 20.0), "CCC": np.full(n, 50.0), "SPY": np.linspace(500, 550, n)}
    px = [(d, t, v[i], v[i], 2.0 if (t == "AAA" and d == pd.Timestamp("2025-08-01")) else 0.0)
          for t, v in series.items() for i, d in enumerate(days)]
    prices = pd.DataFrame(px, columns=PRICE_COLS)
    return BuildInputs(PERIODS, holdings, filings, secmeta, shares_out, prices)
```

- [ ] **Step 3：写失败测试 `build/tests/test_export.py`**

```python
import json

import pytest

from sm import export as ex
from tests import tiny


@pytest.fixture(scope="module")
def out(tmp_path_factory):
    d = tmp_path_factory.mktemp("data")
    stats = ex.export_all(tiny.inputs(), tiny.SETTINGS, tiny.MANAGERS, d)
    return d, stats


def J(d, rel):
    return json.loads((d / rel).read_text(encoding="utf-8"))


def test_files_written(out):
    d, stats = out
    assert (d / "meta.json").exists() and (d / "home.json").exists()
    assert sorted(p.name for p in (d / "managers").iterdir()) == ["1.json", "2.json"]
    assert sorted(p.name for p in (d / "stocks").iterdir()) == ["AAA.json", "BBB.json", "CCC.json"]
    assert stats["stocks"] == 3


def test_manager_alpha(out):
    m = J(out[0], "managers/1.json")
    assert m["periods"] == ["2025-03-31", "2025-06-30", "2025-09-30"]
    assert m["series"]["n"] == [2, 2, 2]
    assert m["series"]["turnover"][1] == 0.0
    kinds = {r["t"] or r["n"]: r["k"] for r in m["changes"]["rows"]}
    assert kinds == {"AAA": "hold", "CCC": "new", "BBB": "exit"}   # 2:1 split on AAA is not an add
    assert m["changes"]["prev_period"] == "2025-06-30"
    assert m["options"] == [{"t": "AAA", "n": "AAA CORP", "pc": "PUT", "v": 300}]
    assert m["city"] == "NEW YORK"
    assert m["sources"][-1]["url"].startswith("https://www.sec.gov/cgi-bin/browse-edgar")
    assert m["backtest"] is not None and len(m["backtest"]["coverage"]) == 3
    assert m["race"]["frames"][2][0] == {"t": "AAA", "v": 2600}


def test_manager_beta_missing_quarter_and_unmapped(out):
    m = J(out[0], "managers/2.json")
    assert m["series"]["value"] == [100, None, 310]
    assert m["sectors"]["weights"][1] is None
    assert m["race"]["frames"][1] == []
    rows = {r["n"]: r for r in m["changes"]["rows"]}
    assert rows["MYSTERY CO"]["k"] == "new" and rows["MYSTERY CO"]["t"] is None
    assert rows["AAA CORP"]["k"] == "hold"
    assert m["changes"]["prev_period"] == "2025-03-31"
    assert m["backtest"]["coverage"][-1] == pytest.approx(260 / 310, abs=1e-3)


def test_stock_bbb(out):
    s = J(out[0], "stocks/BBB.json")
    assert s["holders"]["count"] == [2, 2, 1]
    assert s["holders"]["pct"][0] == pytest.approx(0.105)
    items = {(i["kind"], i["group"]): i["dollars"] for i in s["flows"]["items"]}
    assert items == {("exit", "curated"): 2200, ("trim", "other"): 11500}
    assert s["curated"] == []
    assert len(s["price"]["dates"]) == len(s["price"]["close"]) > 30


def test_stock_aaa_curated_holders(out):
    s = J(out[0], "stocks/AAA.json")
    names = {c["name"]: c for c in s["curated"]}
    assert set(names) == {"Alpha Capital", "Beta Partners"}
    assert names["Alpha Capital"]["first"] == "2025-03-31"
    assert 0 <= s["crowding"]["score"] <= 100


def test_home(out):
    h = J(out[0], "home.json")
    bought = {r["t"]: r for r in h["most_bought"]}
    assert bought["CCC"]["new"] == 1 and bought["CCC"]["who"] == ["Alpha Capital"]
    sold = {r["t"]: r for r in h["most_sold"]}
    assert sold["BBB"]["exit"] == 1 and sold["BBB"]["net"] == 1
    assert h["sector_flows"]["sells"]["金融"] == 2200
    assert h["sector_flows"]["buys"]["能源"] == 500


def test_meta(out):
    m = J(out[0], "meta.json")
    assert m["latest_period"] == "2025-09-30"
    assert [x["cik"] for x in m["managers"]] == [1, 2]
    assert {s["t"] for s in m["stocks"]} == {"AAA", "BBB", "CCC"}
    assert m["universe"]["filers"] == 3
    assert m["coverage"]["unmapped_cusips"] == 1


def test_budget_enforced(tmp_path):
    small = tiny.SETTINGS.__class__(**{**tiny.SETTINGS.__dict__, "stock_json_max_kb": 0})
    with pytest.raises(ex.BudgetError, match="stocks/"):
        ex.export_all(tiny.inputs(), small, tiny.MANAGERS, tmp_path)
```

- [ ] **Step 4：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_export.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'sm.export'` 或 `ImportError`

- [ ] **Step 5：实现 `build/sm/export.py`**

```python
"""Assemble every JSON file the front end reads (see the plan's "JSON 数据契约")."""
from __future__ import annotations

import json
import math
import shutil
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path

import jsonschema
import numpy as np
import pandas as pd

from . import schemas
from .backtest import make_rebalance, perf_stats, run_clone, trading_day_after, trading_day_on_or_before
from .config import Manager, Settings
from .metrics import crowding_scores, manager_history, stock_panel
from .prices import split_factors, wide_adj_close

EDGAR_13F = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik:010d}&type=13F-HR"
BENCH = "SPY"


class BudgetError(RuntimeError):
    pass


@dataclass
class BuildInputs:
    periods: list[date]
    holdings: pd.DataFrame
    filings: pd.DataFrame
    secmeta: pd.DataFrame
    shares_out: pd.DataFrame
    prices: pd.DataFrame


def _f(x, nd: int = 4):
    if x is None or (isinstance(x, float) and not math.isfinite(x)) or (isinstance(x, (np.floating,)) and not np.isfinite(x)):
        return None
    if pd.isna(x):
        return None
    return round(float(x), nd)


def _i(x):
    v = _f(x, 0)
    return None if v is None else int(v)


def _s(x):
    return None if x is None or (isinstance(x, float) and math.isnan(x)) or pd.isna(x) else str(x)


def _write(path: Path, obj, schema) -> None:
    jsonschema.validate(obj, schema)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":"), allow_nan=False), encoding="utf-8")


def _prepare(inp: BuildInputs):
    pidx = {p: i for i, p in enumerate(inp.periods)}
    h = inp.holdings.copy()
    h["pi"] = h["period"].map(pidx)
    h = h.dropna(subset=["pi"]).astype({"pi": int})
    meta = inp.secmeta.set_index("cusip")
    h = h.join(meta[["ticker", "name", "sector", "is_equity", "is_etf"]], on="cusip")
    h["sector"] = h["sector"].fillna("其他")
    h["ticker"] = h["ticker"].where(h["ticker"].notna(), None)
    is_eq = h["is_equity"].map(lambda v: True if v is None or pd.isna(v) else bool(v))
    eq = h[(h["put_call"] == "") & (h["shares"] > 0) & is_eq].copy()
    opts = h[h["put_call"].isin(["PUT", "CALL"])].copy()
    filers = inp.filings.assign(pi=inp.filings["period"].map(pidx)).dropna(subset=["pi"]).astype({"pi": int})
    return pidx, eq, opts, filers


def _universe(secmeta: pd.DataFrame, holders: pd.DataFrame, last_pi: int) -> pd.DataFrame:
    """One row per ticker: mapped equity cusips; if a ticker has several cusips keep the most-held one."""
    sm = secmeta[secmeta["ticker"].notna() & secmeta["is_equity"].fillna(False).astype(bool)].copy()
    latest = holders[holders["pi"] == last_pi].set_index("cusip")["holders"]
    sm["h"] = sm["cusip"].map(latest).fillna(0)
    return sm.sort_values("h", ascending=False).drop_duplicates("ticker").reset_index(drop=True)


def _shares_asof(shares_out: pd.DataFrame, ticker: str, d: date):
    s = shares_out[shares_out["ticker"] == ticker]
    s = s[s["end"] <= pd.Timestamp(d)]
    return float(s.sort_values("end")["shares"].iloc[-1]) if len(s) else None


def _weekly(series: pd.Series) -> pd.Series:
    return series.resample("W-FRI").last().dropna()


def _backtest(hm: pd.DataFrame, first_filing: dict[int, date], periods: list[date], px: pd.DataFrame, top_k: int):
    if BENCH not in px.columns or px.empty:
        return None
    idx = px.index
    reb_f, reb_i = [], []
    for pi, g in hm.groupby("pi"):
        total = float(g["value_usd"].sum())
        top = g.nlargest(top_k, "value_usd")
        pos = top.groupby(top["ticker"].fillna(""))["value_usd"].sum()
        d_f = trading_day_after(idx, first_filing[pi]) if pi in first_filing else None
        d_i = trading_day_on_or_before(idx, periods[pi])
        for day, bucket in ((d_f, reb_f), (d_i, reb_i)):
            if day is not None:
                r = make_rebalance(day, pos, total, px)
                if r is not None:
                    bucket.append(r)
    if len(reb_f) < 2 or len(reb_i) < 2:
        return None
    end = idx[-1]
    vf = run_clone(reb_f, px, end)
    start = vf.index[0]
    vi = run_clone(reb_i, px, end).loc[start:]
    vi = vi / vi.iloc[0]
    vb = px[BENCH].loc[start:end]
    vb = vb / vb.iloc[0]
    wk = pd.DataFrame({"filing": _weekly(vf), "ideal": _weekly(vi), "bench": _weekly(vb)}).dropna()
    return {
        "dates": [d.date().isoformat() for d in wk.index],
        "filing": [_f(v) for v in wk["filing"]], "ideal": [_f(v) for v in wk["ideal"]], "bench": [_f(v) for v in wk["bench"]],
        "stats": {k: {kk: _f(vv) for kk, vv in perf_stats(s).items()} for k, s in (("filing", vf), ("ideal", vi), ("bench", vb))},
        "coverage": [_f(r.coverage, 3) for r in sorted(reb_f, key=lambda r: r.date)],
    }


def export_all(inp: BuildInputs, settings: Settings, managers: list[Manager], out_dir: Path) -> dict:
    out_dir = Path(out_dir)
    for sub in ("managers", "stocks"):
        shutil.rmtree(out_dir / sub, ignore_errors=True)
    periods = inp.periods
    n, last = len(periods), len(periods) - 1
    P = [p.isoformat() for p in periods]
    thr = settings.change_threshold
    curated = {m.cik for m in managers}
    names = {m.cik: m.name for m in managers}
    pidx, eq, opts, filers = _prepare(inp)

    ticker_by_cusip = {r.cusip: r.ticker for r in inp.secmeta.itertuples() if r.ticker}
    factors = split_factors(inp.prices, ticker_by_cusip, periods)
    fac_wide = factors.pivot_table(index="cusip", columns="pi", values="factor", aggfunc="prod") if len(factors) else pd.DataFrame()
    holders, flows = stock_panel(eq[["cik", "pi", "cusip", "shares", "value_usd"]], filers[["cik", "pi"]], factors, curated, thr)
    px = wide_adj_close(inp.prices) if len(inp.prices) else pd.DataFrame()
    label = eq.drop_duplicates("cusip").set_index("cusip")
    lab = lambda c: (_s(label.at[c, "ticker"]) if c in label.index else None)  # noqa: E731
    nm = lambda c: (_s(label.at[c, "name"]) or _s(label.at[c, "issuer"])) if c in label.index else c  # noqa: E731
    sec = lambda c: (label.at[c, "sector"] if c in label.index else "其他")  # noqa: E731

    # ---- managers ----
    weights_latest: dict[int, pd.Series] = {}
    latest_changes = []           # rows for home: cik, cusip, kind, dollars
    curated_pos = []              # rows for stock pages: cik, pi, cusip, shares, w
    meta_managers = []
    for m in managers:
        hm = eq[eq["cik"] == m.cik]
        fm = filers[filers["cik"] == m.cik].set_index("pi")
        series, changes = manager_history(hm, n, fac_wide, thr)
        sectors = sorted(hm["sector"].unique())
        sw = []
        for pi in range(n):
            g = hm[hm["pi"] == pi]
            if g.empty:
                sw.append(None)
                continue
            w = g.groupby("sector")["value_usd"].sum() / g["value_usd"].sum()
            sw.append([_f(w.get(s, 0.0)) for s in sectors])
            gw = g.groupby("cusip")["value_usd"].sum() / g["value_usd"].sum()
            gs = g.groupby("cusip")["shares"].sum()
            curated_pos += [{"cik": m.cik, "pi": pi, "cusip": c, "shares": float(gs[c]), "w": float(gw[c])} for c in gw.index]
        frames = []
        for pi in range(n):
            g = hm[hm["pi"] == pi].groupby("cusip")["value_usd"].sum().nlargest(15)
            frames.append([{"t": lab(c) or nm(c), "v": _i(v)} for c, v in g.items()])
        last_pi = max((pi for pi in range(n) if series["value"][pi] is not None), default=None)
        latest = {"period": None, "rows": [], "other_w": 0.0}
        chg = {"period": None, "prev_period": None, "rows": []}
        if last_pi is not None:
            g = hm[hm["pi"] == last_pi].groupby("cusip")[["shares", "value_usd"]].sum()
            tot = g["value_usd"].sum()
            kinds = changes[last_pi][0]["kind"] if last_pi in changes else pd.Series(dtype=str)
            top = g.nlargest(settings.holdings_per_quarter, "value_usd")
            latest = {"period": P[last_pi], "other_w": _f(1 - top["value_usd"].sum() / tot),
                      "rows": [{"c": c, "t": lab(c), "n": nm(c), "s": sec(c), "sh": _i(r.shares), "v": _i(r.value_usd),
                                "w": _f(r.value_usd / tot), "k": kinds.get(c, "hold")} for c, r in top.iterrows()]}
            weights_latest[m.cik] = g["value_usd"] / tot
            if last_pi in changes:
                cls, prev_pi = changes[last_pi]
                pg = hm[hm["pi"] == prev_pi].groupby("cusip")[["shares", "value_usd"]].sum()
                ptot = pg["value_usd"].sum()
                px_c = (g["value_usd"] / g["shares"]).reindex(cls.index)
                px_p = (pg["value_usd"] / pg["shares"]).reindex(cls.index)
                fac = (cls["prev_adj"] / pg["shares"].reindex(cls.index)).fillna(1.0)
                price = px_c.fillna(px_p / fac)
                moved = cls[cls["kind"] != "hold"].assign(dv=lambda d: d["chg"] * price.reindex(d.index))
                rows = cls.assign(dv=cls["chg"] * price, absdv=(cls["chg"] * price).abs()).sort_values("absdv", ascending=False)
                rows = rows.head(settings.changes_per_quarter)
                chg = {"period": P[last_pi], "prev_period": P[prev_pi], "rows": [
                    {"c": c, "t": lab(c), "n": nm(c), "k": r.kind, "sh0": _i(r.prev_adj), "sh": _i(r.curr), "dv": _i(r.dv),
                     "w0": _f(pg["value_usd"].get(c, 0.0) / ptot), "w": _f(g["value_usd"].get(c, 0.0) / tot)}
                    for c, r in rows.iterrows()]}
                if last_pi == last:
                    latest_changes += [{"cik": m.cik, "cusip": c, "kind": r.kind, "dv": float(r.dv)} for c, r in moved.iterrows()]
        mo = opts[(opts["cik"] == m.cik) & (opts["pi"] == last_pi)] if last_pi is not None else opts.iloc[0:0]
        mo = mo.groupby(["cusip", "put_call"])["value_usd"].sum().reset_index().sort_values("value_usd", ascending=False)
        first_filing = {int(pi): r["first_filing_date"] for pi, r in fm.iterrows()}
        bt = _backtest(hm, first_filing, periods, px, settings.holdings_per_quarter)
        city = fm["city"].iloc[-1] if len(fm) else ""
        state = fm["state"].iloc[-1] if len(fm) else ""
        doc = {
            "cik": m.cik, "name": m.name, "person": m.person, "style": m.style, "founded": m.founded, "bio": m.bio,
            "sources": [{"label": s.label, "url": s.url} for s in m.sources]
                       + [{"label": "SEC EDGAR 13F 申报", "url": EDGAR_13F.format(cik=m.cik)}],
            "city": city, "state": state, "periods": P,
            "series": {"value": [_i(v) for v in series["value"]], "n": series["n"],
                       "top10": [_f(v) for v in series["top10"]], "hhi": [_f(v) for v in series["hhi"]],
                       "turnover": [_f(v) for v in series["turnover"]], "hold_q": [_f(v, 2) for v in series["hold_q"]]},
            "sectors": {"names": sectors, "weights": sw},
            "latest": latest, "changes": chg, "race": {"frames": frames},
            "options": [{"t": lab(r.cusip), "n": nm(r.cusip), "pc": r.put_call, "v": _i(r.value_usd)} for r in mo.itertuples()],
            "backtest": bt, "similar": [],
        }
        _write(out_dir / "managers" / f"{m.cik}.json", doc, schemas.MANAGER)
        meta_managers.append({"cik": m.cik, "name": m.name, "person": m.person, "style": m.style,
                              "value": _i(series["value"][last_pi]) if last_pi is not None else None,
                              "n": series["n"][last_pi] if last_pi is not None else None})

    # similar managers: cosine similarity of latest weight vectors (second pass, rewrite files)
    for m in managers:
        if m.cik not in weights_latest:
            continue
        a = weights_latest[m.cik]
        sims = []
        for o, b in weights_latest.items():
            if o == m.cik:
                continue
            idx = a.index.union(b.index)
            va, vb = a.reindex(idx).fillna(0).values, b.reindex(idx).fillna(0).values
            denom = np.linalg.norm(va) * np.linalg.norm(vb)
            sims.append((float(va @ vb / denom) if denom else 0.0, o))
        p = out_dir / "managers" / f"{m.cik}.json"
        doc = json.loads(p.read_text(encoding="utf-8"))
        doc["similar"] = [{"cik": o, "name": names[o], "score": _f(s, 3)} for s, o in sorted(sims, reverse=True)[:5]]
        _write(p, doc, schemas.MANAGER)

    # ---- stocks ----
    uni = _universe(inp.secmeta, holders, last)
    cp = pd.DataFrame(curated_pos, columns=["cik", "pi", "cusip", "shares", "w"])
    hold_idx = holders.set_index(["cusip", "pi"])
    crowd_rows = []
    for pi in range(n):
        cpi = cp[cp["pi"] == pi]
        ch = cpi.groupby("cusip")["cik"].nunique()
        aw = cpi.groupby("cusip")["w"].sum() / max(len(managers), 1)
        for u in uni.itertuples():
            sh13 = hold_idx["shares"].get((u.cusip, pi))
            so = _shares_asof(inp.shares_out, u.ticker, periods[pi])
            pct = sh13 / so if (sh13 is not None and so) else None
            crowd_rows.append({"cusip": u.cusip, "pi": pi, "curated_holders": float(ch.get(u.cusip, 0)),
                               "pct_held": pct if (pct is not None and pct <= 1.2) else np.nan,
                               "avg_curated_w": float(aw.get(u.cusip, 0.0))})
    crowd = pd.DataFrame(crowd_rows)
    if len(crowd):
        crowd["score"] = crowd.groupby("pi", group_keys=False).apply(crowding_scores)
    close = inp.prices.pivot_table(index="date", columns="ticker", values="close", aggfunc="last").sort_index()
    close = close.loc[pd.Timestamp(periods[0]) - pd.Timedelta(days=95):]
    first_held = cp.groupby(["cik", "cusip"])["pi"].min()
    for u in uni.itertuples():
        cr = crowd[crowd["cusip"] == u.cusip].set_index("pi")
        f_last = flows[(flows["cusip"] == u.cusip) & (flows["pi"] == last)]
        cur_last = cp[(cp["cusip"] == u.cusip) & (cp["pi"] == last)]
        kinds_last = {(r["cik"]): r["kind"] for r in latest_changes if r["cusip"] == u.cusip}
        wk = _weekly(close[u.ticker]) if u.ticker in close.columns else pd.Series(dtype=float)
        doc = {
            "t": u.ticker, "n": _s(u.name) or u.ticker, "cusip": u.cusip, "s": u.sector, "is_etf": bool(u.is_etf) if u.is_etf is not None and not pd.isna(u.is_etf) else False,
            "price": {"dates": [d.date().isoformat() for d in wk.index], "close": [_f(v, 2) for v in wk.values]},
            "holders": {"periods": P,
                        "count": [_i(hold_idx["holders"].get((u.cusip, pi))) for pi in range(n)],
                        "pct": [_f(cr["pct_held"].get(pi)) for pi in range(n)],
                        "value": [_i(hold_idx["value"].get((u.cusip, pi))) for pi in range(n)]},
            "flows": {"period": P[last], "items": [{"kind": r.kind, "group": r.grp, "dollars": _i(r.dollars), "n": int(r.n)}
                                                    for r in f_last.itertuples()]},
            "curated": [{"cik": int(r.cik), "name": names[int(r.cik)], "sh": _i(r.shares), "w": _f(r.w),
                         "k": kinds_last.get(int(r.cik), "hold"), "first": P[int(first_held[(r.cik, u.cusip)])]}
                        for r in cur_last.sort_values("w", ascending=False).itertuples()],
            "crowding": {"score": _f(cr["score"].get(last), 1), "history": [_f(cr["score"].get(pi), 1) for pi in range(n)]},
        }
        _write(out_dir / "stocks" / f"{u.ticker}.json", doc, schemas.STOCK)

    # ---- home ----
    lc = pd.DataFrame(latest_changes, columns=["cik", "cusip", "kind", "dv"])
    agg = []
    for c, g in lc.groupby("cusip"):
        cnt = g["kind"].value_counts()
        k = {x: int(cnt.get(x, 0)) for x in ("new", "add", "trim", "exit")}
        agg.append({"t": lab(c) or nm(c), "n": nm(c), **k, "c": c,
                    "buy_who": [names[x] for x in g[g["kind"].isin(["new", "add"])]["cik"]],
                    "sell_who": [names[x] for x in g[g["kind"].isin(["trim", "exit"])]["cik"]]})
    bought = sorted([a for a in agg if a["new"] - a["exit"] > 0 or (a["new"] == a["exit"] and a["add"] > a["trim"])],
                    key=lambda a: (a["new"] - a["exit"], a["add"] - a["trim"]), reverse=True)[:15]
    sold = sorted([a for a in agg if a["exit"] - a["new"] > 0 or (a["new"] == a["exit"] and a["trim"] > a["add"])],
                  key=lambda a: (a["exit"] - a["new"], a["trim"] - a["add"]), reverse=True)[:15]
    pack = lambda a, net, who: {"t": a["t"], "n": a["n"], "new": a["new"], "add": a["add"], "trim": a["trim"],  # noqa: E731
                                "exit": a["exit"], "net": net, "who": who}
    lc["sector"] = lc["cusip"].map(sec)
    buys = lc[lc["dv"] > 0].groupby("sector")["dv"].sum()
    sells = (-lc[lc["dv"] < 0].groupby("sector")["dv"].sum())
    crowd_last = crowd[crowd["pi"] == last].merge(uni[["cusip", "ticker", "name", "sector"]], on="cusip") if len(crowd) else crowd
    crowded = []
    for r in crowd_last.sort_values("score", ascending=False).head(20).itertuples() if len(crowd_last) else []:
        crowded.append({"t": r.ticker, "n": _s(r.name) or r.ticker, "s": r.sector,
                        "holders": _i(hold_idx["holders"].get((r.cusip, last))), "pct": _f(r.pct_held),
                        "value": _i(hold_idx["value"].get((r.cusip, last))), "score": _f(r.score, 1)})
    home = {"period": P[last],
            "most_bought": [pack(a, a["new"] - a["exit"], a["buy_who"]) for a in bought],
            "most_sold": [pack(a, a["exit"] - a["new"], a["sell_who"]) for a in sold],
            "crowded": crowded,
            "sector_flows": {"buys": {k: _i(v) for k, v in buys.items()}, "sells": {k: _i(v) for k, v in sells.items()}}}
    _write(out_dir / "home.json", home, schemas.HOME)

    # ---- meta ----
    cur_last = eq[(eq["cik"].isin(curated)) & (eq["pi"] == last)]
    tot = cur_last["value_usd"].sum()
    mapped = cur_last[cur_last["ticker"].notna()]
    priced = mapped[mapped["ticker"].isin(px.columns)] if len(px) else mapped.iloc[0:0]
    meta = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "latest_period": P[last], "periods": P, "managers": meta_managers,
        "stocks": [{"t": u.ticker, "n": _s(u.name) or u.ticker, "s": u.sector} for u in uni.itertuples()],
        "coverage": {"figi_value_pct": _f(mapped["value_usd"].sum() / tot if tot else None, 3),
                     "price_value_pct": _f(priced["value_usd"].sum() / tot if tot else None, 3),
                     "unmapped_cusips": int(inp.secmeta["ticker"].isna().sum())},
        "universe": {"filers": int(filers[filers["pi"] == last]["cik"].nunique()),
                     "total_value": _i(eq[eq["pi"] == last]["value_usd"].sum())},
    }
    _write(out_dir / "meta.json", meta, schemas.META)
    _check_budget(out_dir, settings)
    return {"managers": len(managers), "stocks": len(uni)}


def _check_budget(out_dir: Path, s: Settings) -> None:
    problems = []
    for sub, kb in (("managers", s.manager_json_max_kb), ("stocks", s.stock_json_max_kb)):
        for p in sorted((out_dir / sub).glob("*.json")):
            if p.stat().st_size > kb * 1024:
                problems.append(f"{sub}/{p.name}: {p.stat().st_size / 1024:.0f} KB > {kb} KB")
    total = sum(p.stat().st_size for p in out_dir.rglob("*.json"))
    if total > s.data_dir_max_mb * 1024 * 1024:
        problems.append(f"data/: {total / 1048576:.1f} MB > {s.data_dir_max_mb} MB")
    if problems:
        raise BudgetError("size budget exceeded:\n" + "\n".join(problems))
```

- [ ] **Step 6：运行，确认通过；失败时逐项排查到通过为止**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_export.py -q`
Expected: `8 passed`

`tests/tiny.py` 里写有预期数字的推导依据。BBB 的 pct：pi0 时 13F 持股 1050 ÷ 流通股本 10000 = 0.105。Beta 的 coverage：AAA 260 ÷ 总额 310（AAA 在 p0 之后 2:1 拆股）。如果测试失败，先核对推导，再改实现。**不要为了让测试通过而改预期值。**

- [ ] **Step 7：全部测试回归**

Run: `cd smart-money/build && .venv/bin/python -m pytest -q`
Expected: 全部通过（约 49 个）

- [ ] **Step 8：提交**

```bash
git add smart-money/build/sm/schemas.py smart-money/build/sm/export.py smart-money/build/tests/tiny.py smart-money/build/tests/test_export.py
git commit -m "feat(smart-money): JSON export — managers, stocks, home, meta with schemas and size budget"
```

---

### Task 10：构建编排 `run.py`，以及真实数据构建

**Files:**
- Create: `smart-money/build/run.py`
- Test: `smart-money/build/tests/test_run.py`

**Interfaces:**
- Consumes：Task 3–9 的全部函数
- Produces：
  - 命令行 `python run.py [--stage 13f|map|prices|export|all]`
  - 中间产物写在 `cache/derived/`：`holdings.parquet`、`filings.parquet`、`periods.json`、`secmeta.parquet`、`shares_out.parquet`
  - 报告写在 `reports/unmapped.csv`
  - `select_universe(h, n_periods, curated, top_n, top_k) -> set[str]`

- [ ] **Step 1：写失败测试 `build/tests/test_run.py`**

```python
import pandas as pd

from run import select_universe


def test_select_universe_union_of_top_held_and_curated_top_k():
    h = pd.DataFrame([
        (10, 1, "X", "", 1, 100.0), (11, 1, "X", "", 1, 100.0), (12, 1, "Y", "", 1, 100.0),
        (1, 0, "Z", "", 1, 5.0), (1, 0, "W", "", 1, 1.0), (1, 1, "P", "PUT", 1, 9.0),
    ], columns=["cik", "pi", "cusip", "put_call", "shares", "value_usd"])
    assert select_universe(h, 2, {1}, top_n=1, top_k=1) == {"X", "Z"}
```

- [ ] **Step 2：运行，确认失败**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_run.py -q`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'run'`

- [ ] **Step 3：实现 `build/run.py`**

```python
"""Build pipeline: python run.py [--stage 13f|map|prices|export|all]"""
from __future__ import annotations

import argparse
import json
from datetime import date, timedelta

import pandas as pd

from sm.clean import build_holdings, complete_periods, effective_accessions, filings_table, load_submissions
from sm.companies import shares_outstanding_series, sic_for, ticker_to_cik
from sm.config import CACHE_DIR, DATA_DIR, REPORTS_DIR, load_managers, load_settings
from sm.export import BuildInputs, export_all
from sm.figi import FigiMapper
from sm.ingest_13f import ingest, shift_quarter_end
from sm.prices import YFinanceSource, update_prices
from sm.sec import SecClient
from sm.sectors import load_sic_sectors, sector_for

DERIVED = CACHE_DIR / "derived"


def select_universe(h: pd.DataFrame, n_periods: int, curated: set[int], top_n: int, top_k: int) -> set[str]:
    eq = h[(h["put_call"] == "") & (h["shares"] > 0)]
    latest = eq[eq["pi"] == n_periods - 1]
    top = set(latest.groupby("cusip")["cik"].nunique().nlargest(top_n).index)
    cur = eq[eq["cik"].isin(curated)].sort_values("value_usd", ascending=False)
    return top | set(cur.groupby(["cik", "pi"]).head(top_k)["cusip"])


def _periods() -> list[date]:
    return [date.fromisoformat(s) for s in json.loads((DERIVED / "periods.json").read_text())]


def stage_13f(settings) -> None:
    client = SecClient()
    dirs = ingest(client, shift_quarter_end(date.today(), -(settings.quarters + 2)))
    subs = load_submissions(dirs)
    eff = effective_accessions(subs)
    periods = complete_periods(eff, settings.quarters)
    eff = eff[eff["period"].isin(periods)]
    print(f"[13f] periods {periods[0]} .. {periods[-1]} ({len(periods)}); building holdings")
    holdings = build_holdings(dirs, eff)
    DERIVED.mkdir(parents=True, exist_ok=True)
    holdings.to_parquet(DERIVED / "holdings.parquet", index=False)
    filings_table(subs, eff).to_parquet(DERIVED / "filings.parquet", index=False)
    (DERIVED / "periods.json").write_text(json.dumps([p.isoformat() for p in periods]))
    print(f"[13f] {len(holdings):,} holding rows, {holdings['cik'].nunique():,} filers")


def stage_map(settings, managers) -> None:
    periods = _periods()
    h = pd.read_parquet(DERIVED / "holdings.parquet")
    h["pi"] = h["period"].map({p: i for i, p in enumerate(periods)})
    cusips = select_universe(h, len(periods), {m.cik for m in managers}, settings.stock_universe_top_n,
                             settings.holdings_per_quarter)
    print(f"[map] {len(cusips):,} cusips to map")
    figi = FigiMapper().map(sorted(cusips))
    client = SecClient()
    t2c = ticker_to_cik(client)
    table = load_sic_sectors()
    rows, shares, seen = [], [], set()
    for i, (cusip, rec) in enumerate(figi.items()):
        if i % 250 == 0:
            print(f"[map] issuer facts {i}/{len(figi)}")
        if rec is None or not rec.ticker:
            rows.append({"cusip": cusip, "ticker": None, "name": None, "sector": "其他", "is_equity": None, "is_etf": None})
            continue
        t = rec.yf_ticker
        cik = t2c.get(t)
        sic = sic_for(client, cik) if (cik and not rec.is_etf) else None
        rows.append({"cusip": cusip, "ticker": t, "name": rec.name, "sector": sector_for(sic, table, rec.is_etf),
                     "is_equity": rec.is_equity, "is_etf": rec.is_etf})
        if cik and rec.is_equity and not rec.is_etf and t not in seen:
            seen.add(t)
            so = shares_outstanding_series(client, cik)
            if len(so):
                shares.append(so.assign(ticker=t))
    secmeta = pd.DataFrame(rows)
    secmeta.to_parquet(DERIVED / "secmeta.parquet", index=False)
    so = pd.concat(shares, ignore_index=True) if shares else pd.DataFrame(columns=["end", "shares", "ticker"])
    so.to_parquet(DERIVED / "shares_out.parquet", index=False)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    un = secmeta[secmeta["ticker"].isna()][["cusip"]].merge(
        h.groupby("cusip").agg(issuer=("issuer", "first"), value_usd=("value_usd", "sum")).reset_index(), on="cusip")
    un.sort_values("value_usd", ascending=False).to_csv(REPORTS_DIR / "unmapped.csv", index=False)
    print(f"[map] mapped {secmeta['ticker'].notna().sum():,}/{len(secmeta):,}; unmapped list in reports/unmapped.csv")


def stage_prices() -> None:
    periods = _periods()
    secmeta = pd.read_parquet(DERIVED / "secmeta.parquet")
    tickers = sorted(set(secmeta["ticker"].dropna()) | {"SPY"})
    update_prices(YFinanceSource(), tickers, periods[0] - timedelta(days=100), date.today())


def stage_export(settings, managers) -> None:
    inp = BuildInputs(
        periods=_periods(),
        holdings=pd.read_parquet(DERIVED / "holdings.parquet"),
        filings=pd.read_parquet(DERIVED / "filings.parquet"),
        secmeta=pd.read_parquet(DERIVED / "secmeta.parquet"),
        shares_out=pd.read_parquet(DERIVED / "shares_out.parquet"),
        prices=pd.read_parquet(CACHE_DIR / "prices.parquet"),
    )
    stats = export_all(inp, settings, managers, DATA_DIR)
    print(f"[export] wrote {stats['managers']} managers, {stats['stocks']} stocks to {DATA_DIR}")


def main(argv=None) -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", default="all", choices=["13f", "map", "prices", "export", "all"])
    stage = ap.parse_args(argv).stage
    settings, managers = load_settings(), load_managers()
    if stage in ("13f", "all"):
        stage_13f(settings)
    if stage in ("map", "all"):
        stage_map(settings, managers)
    if stage in ("prices", "all"):
        stage_prices()
    if stage in ("export", "all"):
        stage_export(settings, managers)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4：运行，确认通过**

Run: `cd smart-money/build && .venv/bin/python -m pytest tests/test_run.py -q`
Expected: `1 passed`

- [ ] **Step 5：真实数据构建，分阶段运行，每一步都要看输出**

前提：`smart-money/.env` 里已经有 `SEC_CONTACT_EMAIL`，由用户在 Task 1 填好。长任务放到后台运行。

```bash
cd smart-money/build && .venv/bin/python run.py --stage 13f
```
Expected：下载约 21 个 zip（约 1.7 GB，首次 15–40 分钟），最后打印 `[13f] periods 2021-09-30 .. 2026-06-30 (20)`，以及持仓行数和申报机构数。行数应该在千万级，机构数约 1 万。

```bash
cd smart-money/build && .venv/bin/python run.py --stage map
```
Expected：打印待映射的 CUSIP 数（几千），以及映射成功率。用 `head -20 reports/unmapped.csv` 抽查未映射清单，前几名应该是债券型、已退市或外国证券，**不应该**出现 AAPL 这类大盘股。

```bash
cd smart-money/build && .venv/bin/python run.py --stage prices && .venv/bin/python run.py --stage export
```
Expected：`[export] wrote 20 managers, N stocks`，N 在 1500–4000 之间，无 BudgetError。

如果出现 BudgetError：先把 `settings.yaml` 的 `holdings_per_quarter` 降到 100 再重跑 export。仍然超标就停下来，把超标的文件和大小报告给用户，不要擅自删除字段。

- [ ] **Step 6：抽查真实数据**

```bash
cd smart-money && python3 - <<'EOF'
import json
m = json.load(open("data/managers/1067983.json"))
print(m["latest"]["period"], [r["t"] for r in m["latest"]["rows"][:5]], m["series"]["n"][-1])
print("backtest", m["backtest"]["stats"]["filing"] if m["backtest"] else None)
meta = json.load(open("data/meta.json")); print(meta["coverage"], len(meta["stocks"]))
EOF
du -sh data
```
Expected：
- 伯克希尔最新季度前 5 大里有 AAPL、AXP 等。
- `coverage.figi_value_pct` 不低于 0.9。
- `data/` 小于 50 MB。

把这些输出贴进提交说明或汇报里。

- [ ] **Step 7：提交（含生成的数据）**

```bash
git add smart-money/build/run.py smart-money/build/tests/test_run.py smart-money/data
git commit -m "feat(smart-money): build orchestration and first full data build (20 quarters, 20 managers)"
```

---

### Task 11：前端骨架（外壳、样式、工具函数、路由、方法页）

**Files:**
- Create: `smart-money/package.json`, `smart-money/index.html`, `smart-money/styles.css`, `smart-money/js/calc.js`, `smart-money/js/core.js`, `smart-money/js/charts.js`, `smart-money/js/main.js`, `smart-money/js/page-methods.js`, 以及占位页 `smart-money/js/page-home.js`、`smart-money/js/page-manager.js`、`smart-money/js/page-stock.js`（各只导出一个显示"建设中"的 `render`，后续任务替换）
- Modify: `.claude/launch.json`（仓库根目录 `small/.claude/launch.json`，加一个 `smart-money` 配置）
- Test: `smart-money/js/calc.test.js`

**Interfaces:**
- Produces（供 Task 12–14 使用）：
  - `calc.js`：
    - 常量 `KIND_LABEL`、`KIND_COLOR`
    - 格式化：`fmtMoney(x)`、`fmtPct(x, d=1)`、`fmtNum(x)`、`quarterLabel(iso)`、`initials(name)`、`avatarColor(name)`
    - 路由与搜索：`parseRoute(hash) -> {page, params}`、`search(meta, q, limit=8)`
    - 数据处理：`sortRows(rows, key, dir)`、`sankeyFromFlows(items, ticker)`、`sectorSankey(flows)`
  - `core.js`：`loadJSON(path)`、`el(tag, attrs, ...kids)`、`card(title, sub, ...body)`、`chartDiv(size)`、`kpi(label, value)`、`kindBadge(k)`、`stockLink(t, label)`、`managerLink(cik, name)`、`table(cols, rows, opts)`
  - `charts.js`：`mount(el, option) -> echarts 实例`、`disposeAll()`、`onCleanup(fn)`、`PALETTE`、`colorFor(key)`
  - 每个页面模块都导出 `async render(app, params, ctx)`，其中 `ctx = {meta}`

- [ ] **Step 1：写 `smart-money/package.json`**

```json
{ "name": "smart-money", "private": true, "type": "module",
  "scripts": { "test": "node --test js/calc.test.js" } }
```

- [ ] **Step 2：写失败测试 `smart-money/js/calc.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, initials, parseRoute, search, sortRows,
         sankeyFromFlows, sectorSankey } from './calc.js';

test('formatters', () => {
  assert.equal(fmtMoney(274160086701), '$274.16B');
  assert.equal(fmtMoney(-1.5e6), '-$1.5M');
  assert.equal(fmtMoney(4.6e13), '$46.00T');
  assert.equal(fmtMoney(null), '—');
  assert.equal(fmtPct(0.1234), '12.3%');
  assert.equal(fmtPct(NaN), '—');
  assert.equal(fmtNum(1234567.4), '1,234,567');
  assert.equal(quarterLabel('2026-06-30'), '2026Q2');
  assert.equal(initials('Warren Buffett / Greg Abel'), 'WB');
  assert.equal(initials('李录 Li Lu'), 'LL');
  assert.equal(initials('???'), '?');
});

test('parseRoute', () => {
  assert.deepEqual(parseRoute(''), { page: 'home', params: {} });
  assert.deepEqual(parseRoute('#/'), { page: 'home', params: {} });
  assert.deepEqual(parseRoute('#/manager/1067983'), { page: 'manager', params: { cik: '1067983' } });
  assert.deepEqual(parseRoute('#/stock/brk-b'), { page: 'stock', params: { t: 'BRK-B' } });
  assert.deepEqual(parseRoute('#/methods'), { page: 'methods', params: {} });
  assert.deepEqual(parseRoute('#/nope'), { page: 'notfound', params: {} });
});

test('search ranks exact ticker, then prefix, then name; managers first', () => {
  const meta = { managers: [{ cik: 1, name: 'Appaloosa', person: 'David Tepper' }],
    stocks: [{ t: 'AAPLX', n: 'X' }, { t: 'AAPL', n: 'APPLE INC' }, { t: 'ZZZ', n: 'AAPL HOLDINGS' }] };
  assert.deepEqual(search(meta, 'aapl').map(r => r.label), ['AAPL', 'AAPLX', 'ZZZ']);
  assert.deepEqual(search(meta, 'tepper').map(r => r.href), ['#/manager/1']);
  assert.deepEqual(search(meta, '  '), []);
});

test('sortRows puts nulls last', () => {
  const rows = [{ v: 2 }, { v: null }, { v: 5 }];
  assert.deepEqual(sortRows(rows, 'v', 'desc').map(r => r.v), [5, 2, null]);
  assert.deepEqual(sortRows(rows, 'v', 'asc').map(r => r.v), [2, 5, null]);
});

test('sankeyFromFlows routes buys into and sells out of the stock', () => {
  const s = sankeyFromFlows([{ kind: 'new', group: 'curated', dollars: 10 }, { kind: 'exit', group: 'other', dollars: 5 },
                             { kind: 'trim', group: 'other', dollars: 0 }], 'AAPL');
  assert.deepEqual(s.links, [{ source: '新建·精选经理', target: 'AAPL', value: 10 }, { source: 'AAPL', target: '清仓·其他机构', value: 5 }]);
  assert.equal(s.nodes.length, 3);
});

test('sectorSankey', () => {
  const s = sectorSankey({ buys: { 能源: 5 }, sells: { 金融: 3, 能源: 0 } });
  assert.deepEqual(s.links, [{ source: '卖出·金融', target: '精选经理', value: 3 }, { source: '精选经理', target: '买入·能源', value: 5 }]);
});
```

- [ ] **Step 3：运行，确认失败**

Run: `cd smart-money && env -u NODE_OPTIONS node --test js/calc.test.js`
Expected: FAIL，报 `Cannot find module .../js/calc.js`

- [ ] **Step 4：实现 `smart-money/js/calc.js`**

```js
// Pure helpers shared by pages; no DOM access so they run under node --test.
export const KIND_LABEL = { new: '新建', add: '加仓', trim: '减仓', exit: '清仓', hold: '不变' };
export const KIND_COLOR = { new: '#157f52', add: '#5fa98a', trim: '#c98a3a', exit: '#b0403a', hold: '#9aa59a' };

const ok = x => x != null && Number.isFinite(x);

export function fmtMoney(x) {
  if (!ok(x)) return '—';
  const a = Math.abs(x), s = x < 0 ? '-' : '';
  if (a >= 1e12) return `${s}$${(a / 1e12).toFixed(2)}T`;
  if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(0)}K`;
  return `${s}$${a.toFixed(0)}`;
}
export const fmtPct = (x, d = 1) => (ok(x) ? `${(x * 100).toFixed(d)}%` : '—');
export const fmtNum = x => (ok(x) ? Math.round(x).toLocaleString('en-US') : '—');
export function quarterLabel(iso) {
  const [y, m] = iso.split('-').map(Number);
  return `${y}Q${Math.ceil(m / 3)}`;
}
export function initials(name) {
  const w = name.replace(/[^A-Za-z ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] ?? '') + (w[1]?.[0] ?? '')).toUpperCase() || '?';
}
export function avatarColor(name) {
  const colors = ['#0f766e', '#2f6fb0', '#6a4fa3', '#a06510', '#b0403a', '#157f52', '#4d7c8a', '#c25a8c'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return colors[h % colors.length];
}

export function parseRoute(hash) {
  const parts = (hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
  if (!parts.length) return { page: 'home', params: {} };
  if (parts[0] === 'manager' && parts[1]) return { page: 'manager', params: { cik: parts[1] } };
  if (parts[0] === 'stock' && parts[1]) return { page: 'stock', params: { t: decodeURIComponent(parts[1]).toUpperCase() } };
  if (parts[0] === 'methods') return { page: 'methods', params: {} };
  return { page: 'notfound', params: {} };
}

export function search(meta, q, limit = 8) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const out = [];
  for (const m of meta.managers)
    if (m.name.toLowerCase().includes(s) || m.person.toLowerCase().includes(s))
      out.push({ type: 'manager', href: `#/manager/${m.cik}`, label: m.name, tag: m.person });
  const exact = [], prefix = [], other = [];
  for (const st of meta.stocks) {
    const t = st.t.toLowerCase();
    if (t === s) exact.push(st);
    else if (t.startsWith(s)) prefix.push(st);
    else if (st.n.toLowerCase().includes(s)) other.push(st);
  }
  for (const st of [...exact, ...prefix, ...other])
    out.push({ type: 'stock', href: `#/stock/${encodeURIComponent(st.t)}`, label: st.t, tag: st.n });
  return out.slice(0, limit);
}

export function sortRows(rows, key, dir = 'desc') {
  const m = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[key], y = b[key];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    return (x < y ? -1 : x > y ? 1 : 0) * m;
  });
}

export function sankeyFromFlows(items, ticker) {
  const GROUP = { curated: '精选经理', other: '其他机构' };
  const nodes = new Map([[ticker, { name: ticker }]]);
  const links = [];
  for (const it of items) {
    if (!(it.dollars > 0) || it.kind === 'hold') continue;
    const name = `${KIND_LABEL[it.kind]}·${GROUP[it.group]}`;
    nodes.set(name, { name });
    if (it.kind === 'new' || it.kind === 'add') links.push({ source: name, target: ticker, value: it.dollars });
    else links.push({ source: ticker, target: name, value: it.dollars });
  }
  return { nodes: [...nodes.values()], links };
}

export function sectorSankey(flows) {
  const mid = '精选经理';
  const nodes = new Map([[mid, { name: mid }]]);
  const links = [];
  for (const [s, v] of Object.entries(flows.sells)) if (v > 0) { nodes.set(`卖出·${s}`, { name: `卖出·${s}` }); links.push({ source: `卖出·${s}`, target: mid, value: v }); }
  for (const [s, v] of Object.entries(flows.buys)) if (v > 0) { nodes.set(`买入·${s}`, { name: `买入·${s}` }); links.push({ source: mid, target: `买入·${s}`, value: v }); }
  return { nodes: [...nodes.values()], links };
}
```

- [ ] **Step 5：运行，确认通过**

Run: `cd smart-money && env -u NODE_OPTIONS node --test js/calc.test.js`
Expected: `# pass 6`，`# fail 0`

- [ ] **Step 6：写 `smart-money/js/core.js`**

```js
import { KIND_LABEL, sortRows } from './calc.js';

const cache = new Map();
export async function loadJSON(path) {
  if (!cache.has(path)) cache.set(path, fetch(path).then(r => { if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`); return r.json(); }));
  try { return await cache.get(path); } catch (e) { cache.delete(path); throw e; }
}

export function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) n.append(k instanceof Node ? k : String(k));
  return n;
}
export const card = (title, sub, ...body) =>
  el('div', { class: 'card' }, title ? el('h3', {}, title) : null, sub ? el('div', { class: 'sub' }, sub) : null, ...body);
export const chartDiv = (size = '') => el('div', { class: `chart ${size}`.trim() });
export const kpi = (label, value) => el('div', { class: 'card kpi' }, el('div', { class: 'label' }, label), el('div', { class: 'val' }, value));
export const kindBadge = k => el('span', { class: `kind kind-${k}` }, KIND_LABEL[k] ?? k);
export const stockLink = (t, label) => (t ? el('a', { href: `#/stock/${encodeURIComponent(t)}`, class: 'mono' }, label ?? t) : el('span', { class: 'muted' }, label ?? '—'));
export const managerLink = (cik, name) => el('a', { href: `#/manager/${cik}` }, name);

// cols: [{key, label, num?, fmt?(value,row) -> Node|string}]
export function table(cols, rows, { sortKey = null, dir = 'desc', limit = 0 } = {}) {
  const wrap = el('div', { class: 'tbl-wrap' });
  let key = sortKey, d = dir;
  const draw = () => {
    const data = key ? sortRows(rows, key, d) : rows;
    const shown = limit ? data.slice(0, limit) : data;
    const head = el('tr', {}, cols.map(c => el('th', {
      class: c.num ? 'num' : null,
      onclick: () => { d = key === c.key && d === 'desc' ? 'asc' : 'desc'; key = c.key; draw(); },
    }, c.label + (key === c.key ? (d === 'desc' ? ' ↓' : ' ↑') : ''))));
    const body = shown.map(r => el('tr', {}, cols.map(c => el('td', { class: c.num ? 'num' : null }, c.fmt ? c.fmt(r[c.key], r) : (r[c.key] ?? '—')))));
    wrap.replaceChildren(el('table', { class: 'tbl' }, el('thead', {}, head), el('tbody', {}, body)));
    if (!rows.length) wrap.append(el('div', { class: 'empty' }, '暂无数据'));
  };
  draw();
  return wrap;
}
```

- [ ] **Step 7：写 `smart-money/js/charts.js`**

```js
/* global echarts */
const live = new Set();
const cleanups = [];
export const PALETTE = ['#0f766e', '#2f6fb0', '#b0403a', '#a06510', '#6a4fa3', '#157f52', '#c25a8c', '#4d7c8a', '#8a7a2e', '#5c6b73', '#d08a3a', '#3b8c6e', '#7d5a50'];
const BASE = {
  color: PALETTE,
  textStyle: { fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif', color: '#3b443a' },
  tooltip: { backgroundColor: '#fff', borderColor: '#e2e6dc', textStyle: { color: '#1c2420' } },
};
export function colorFor(key) {
  let h = 0;
  for (const ch of String(key)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
export function mount(node, option) {
  const c = echarts.init(node, null, { renderer: 'canvas' });
  c.setOption({ ...BASE, ...option, tooltip: { ...BASE.tooltip, ...(option.tooltip || {}) } });
  live.add(c);
  return c;
}
export function onCleanup(fn) { cleanups.push(fn); }
export function disposeAll() {
  while (cleanups.length) cleanups.pop()();
  for (const c of live) c.dispose();
  live.clear();
}
window.addEventListener('resize', () => { for (const c of live) c.resize(); });
```

- [ ] **Step 8：写 `smart-money/index.html`**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>聪明钱追踪器 · Smart Money Tracker</title>
<meta name="description" content="用 SEC 公开 13F 数据追踪顶级基金经理的持仓、调仓和克隆组合表现。" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="styles.css" />
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<script type="module" src="js/main.js"></script>
</head>
<body>
<header class="topbar">
  <a class="brand" href="#/">聪明钱<span>追踪器</span></a>
  <nav><a href="#/">总览</a><a href="#/methods">方法与数据</a></nav>
  <div class="search">
    <input id="q" placeholder="搜索经理、股票代码或公司名…" autocomplete="off" aria-label="搜索" />
    <div id="qres" class="qres" hidden></div>
  </div>
</header>
<main id="app"><div class="empty">加载中…</div></main>
<footer class="foot">数据来源：SEC EDGAR Form 13F 数据集、OpenFIGI、Yahoo Finance。13F 只披露多头持仓，有最长 45 天延迟。本站仅供研究与教育用途，不构成投资建议。<span id="asof"></span></footer>
</body>
</html>
```

- [ ] **Step 9：写 `smart-money/styles.css`**

```css
:root{--bg:#f7f8f5;--card:#fff;--card2:#f1f3ee;--border:#e2e6dc;--border2:#ccd3c6;--text:#1c2420;--text2:#3b443a;--muted:#6b7466;--accent:#0f766e;--accent-soft:#eaf1ef;--green:#157f52;--amber:#a06510;--red:#b0403a;--shadow:0 1px 3px rgba(28,36,32,.06),0 6px 16px -8px rgba(28,36,32,.14)}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:14px}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.mono{font-family:"JetBrains Mono",ui-monospace,monospace;font-variant-numeric:tabular-nums}
.serif{font-family:"Source Serif 4",Georgia,serif}
.muted{color:var(--muted)}
.topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:24px;padding:12px 28px;background:rgba(247,248,245,.92);backdrop-filter:blur(6px);border-bottom:1px solid var(--border)}
.brand{font-family:"Source Serif 4",serif;font-size:20px;font-weight:600;color:var(--text)}.brand span{color:var(--accent)}.brand:hover{text-decoration:none}
.topbar nav{display:flex;gap:16px}.topbar nav a{color:var(--text2)}
.search{margin-left:auto;position:relative;width:340px}
.search input{width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;background:#fff;font:inherit}
.search input:focus{outline:2px solid var(--accent-soft);border-color:var(--accent)}
.qres{position:absolute;top:42px;left:0;right:0;background:#fff;border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow);max-height:380px;overflow:auto}
.qres a{display:flex;justify-content:space-between;gap:12px;padding:8px 12px;color:var(--text)}
.qres a:hover,.qres a.active{background:var(--accent-soft);text-decoration:none}
.qres .tag{color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
main{max-width:1280px;margin:0 auto;padding:24px 28px 48px}
.grid{display:grid;gap:16px}.g2{grid-template-columns:repeat(2,minmax(0,1fr))}.g3{grid-template-columns:repeat(3,minmax(0,1fr))}.g4{grid-template-columns:repeat(4,minmax(0,1fr))}
.mt{margin-top:16px}
@media (max-width:900px){.g2,.g3,.g4{grid-template-columns:1fr}.search{width:200px}.topbar{gap:12px;padding:10px 14px}main{padding:16px 14px}}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;box-shadow:var(--shadow);min-width:0}
.card h3{margin:0 0 4px;font-size:15px}.card .sub{color:var(--muted);font-size:12px;margin-bottom:10px}
.kpi .label{color:var(--muted);font-size:12px}.kpi .val{font:600 22px "JetBrains Mono",monospace;margin-top:4px}
.chart{width:100%;height:340px}.chart.tall{height:460px}.chart.short{height:220px}
.section-title{font-family:"Source Serif 4",serif;font-size:24px;font-weight:600;margin:28px 0 12px}
h1.section-title{margin-top:4px;font-size:30px}
.profile{display:flex;gap:20px;align-items:flex-start}
.avatar{flex:none;width:72px;height:72px;border-radius:50%;display:grid;place-items:center;font:600 26px "Source Serif 4",serif;color:#fff}
.avatar.sm{width:40px;height:40px;font-size:15px}
.tags{display:flex;gap:6px;flex-wrap:wrap}.tag-pill{padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent);font-size:12px}
.bio{margin:8px 0;padding-left:18px;color:var(--text2);line-height:1.7}.sources{font-size:12px;color:var(--muted)}
.tbl-wrap{overflow-x:auto}
table.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{text-align:left;color:var(--muted);font-weight:500;border-bottom:1px solid var(--border);padding:6px 8px;cursor:pointer;white-space:nowrap;user-select:none}
.tbl td{padding:6px 8px;border-bottom:1px solid var(--card2)}
.tbl td.num,.tbl th.num{text-align:right;font-family:"JetBrains Mono",monospace;font-variant-numeric:tabular-nums}
.tbl tr:hover td{background:#fafbf8}
.kind{display:inline-block;padding:1px 7px;border-radius:4px;font-size:12px;color:#fff}
.kind-new{background:#157f52}.kind-add{background:#5fa98a}.kind-trim{background:#c98a3a}.kind-exit{background:#b0403a}.kind-hold{background:#9aa59a}
.legend{display:flex;gap:10px;align-items:center;font-size:12px;color:var(--muted);margin-bottom:6px}
.tabs{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.tabs button,.btn{border:1px solid var(--border2);background:#fff;border-radius:6px;padding:4px 10px;font:inherit;cursor:pointer;color:var(--text2)}
.tabs button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.controls{display:flex;gap:10px;align-items:center;margin-bottom:8px}.controls input[type=range]{flex:1}
.mgr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.mgr-card{display:flex;gap:12px;align-items:center;color:var(--text)}.mgr-card:hover{border-color:var(--accent);text-decoration:none}
.mgr-card .nm{font-weight:600}.mgr-card .ps{color:var(--muted);font-size:12px}
.error{border-color:var(--red)}.error h3{color:var(--red)}
.empty{color:var(--muted);padding:24px;text-align:center}
.warn{color:var(--amber);font-size:12px;margin-top:6px}
.foot{max-width:1280px;margin:0 auto;padding:16px 28px 32px;color:var(--muted);font-size:12px;line-height:1.6}
.doc{max-width:860px;line-height:1.75;color:var(--text2)}.doc h2{font-family:"Source Serif 4",serif;color:var(--text);margin-top:28px}
.doc code{font-family:"JetBrains Mono",monospace;font-size:12px;background:var(--card2);padding:1px 5px;border-radius:4px}
```

- [ ] **Step 10：写 `smart-money/js/main.js`**

```js
import { loadJSON, el } from './core.js';
import { parseRoute, search, quarterLabel } from './calc.js';
import { disposeAll } from './charts.js';
import * as home from './page-home.js';
import * as manager from './page-manager.js';
import * as stock from './page-stock.js';
import * as methods from './page-methods.js';

const PAGES = { home, manager, stock, methods };
const app = document.getElementById('app');
let meta = null;

function errorCard(e) {
  return el('div', { class: 'card error' }, el('h3', {}, '无法显示这个页面'), el('p', {}, String(e?.message || e)), el('a', { href: '#/' }, '← 返回总览'));
}

async function route() {
  disposeAll();
  const { page, params } = parseRoute(location.hash);
  app.replaceChildren(el('div', { class: 'empty' }, '加载中…'));
  window.scrollTo(0, 0);
  try {
    if (page === 'notfound') throw new Error('页面不存在。');
    const frag = el('div');
    app.replaceChildren(frag);
    await PAGES[page].render(frag, params, { meta });
  } catch (e) {
    console.error(e);
    disposeAll();
    app.replaceChildren(errorCard(e));
  }
}

function wireSearch() {
  const q = document.getElementById('q'), box = document.getElementById('qres');
  let items = [], active = 0;
  const close = () => { box.hidden = true; };
  const draw = () => {
    items = search(meta, q.value);
    active = 0;
    box.replaceChildren(...items.map((it, i) => el('a', { href: it.href, class: i === 0 ? 'active' : null, onclick: () => { q.value = ''; close(); } },
      el('span', { class: it.type === 'stock' ? 'mono' : null }, it.label), el('span', { class: 'tag' }, it.type === 'manager' ? `经理 · ${it.tag}` : it.tag))));
    if (q.value.trim() && !items.length) box.replaceChildren(el('div', { class: 'empty' }, '没有匹配的经理或股票'));
    box.hidden = !q.value.trim();
  };
  q.addEventListener('input', draw);
  q.addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(); q.blur(); }
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      [...box.children].forEach((c, i) => c.classList.toggle('active', i === active));
    }
    if (e.key === 'Enter') { location.hash = items[active].href; q.value = ''; close(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) close(); });
}

async function boot() {
  try {
    meta = await loadJSON('data/meta.json');
  } catch (e) {
    app.replaceChildren(errorCard(new Error('找不到 data/meta.json。请先运行构建：cd build && .venv/bin/python run.py')));
    return;
  }
  document.getElementById('asof').textContent = ` 最新申报季度 ${quarterLabel(meta.latest_period)}，构建于 ${meta.generated_at.slice(0, 10)}。`;
  wireSearch();
  window.addEventListener('hashchange', route);
  route();
}
boot();
```

- [ ] **Step 11：写三个占位页和 `smart-money/js/page-methods.js`**

`page-home.js`、`page-manager.js`、`page-stock.js` 的占位内容相同，后续任务会整体替换：

```js
import { card } from './core.js';
export async function render(app) { app.append(card('建设中', '这个页面会在后续任务中实现。')); }
```

`page-methods.js`：

```js
import { el } from './core.js';
import { fmtPct, fmtNum, quarterLabel } from './calc.js';

export async function render(app, _p, { meta }) {
  const c = meta.coverage;
  const P = (...kids) => el('p', {}, ...kids);
  app.append(el('div', { class: 'doc' },
    el('h1', { class: 'section-title' }, '方法与数据'),
    P(`覆盖 ${quarterLabel(meta.periods[0])} 至 ${quarterLabel(meta.latest_period)} 共 ${meta.periods.length} 个季度，最新季度有 ${fmtNum(meta.universe.filers)} 家机构申报 13F。`),
    el('h2', {}, '数据来源'),
    el('ul', {},
      el('li', {}, 'SEC Form 13F 数据集：机构持仓。按申报日期批量发布，申报期取自 PERIODOFREPORT。'),
      el('li', {}, 'OpenFIGI：CUSIP 到股票代码和证券类型的映射。'),
      el('li', {}, 'SEC EDGAR：SIC 行业代码、流通股本（dei:EntityCommonStockSharesOutstanding）。'),
      el('li', {}, 'Yahoo Finance（yfinance）：日线复权价和拆股记录，用于拆股调整、回测和价格图。')),
    el('h2', {}, '处理规则'),
    el('ul', {},
      el('li', {}, '金额单位：2023-01-03 之前申报的金额以千美元为单位，统一换算成美元。'),
      el('li', {}, '修订：RESTATEMENT 替换原申报；NEW HOLDINGS 追加到原申报；类型为空的修订按 RESTATEMENT 处理。'),
      el('li', {}, '变动分类：先按拆股调整上期股数，然后：上期为 0 记为新建；本期为 0 记为清仓；变化超过 +2% 记为加仓，低于 −2% 记为减仓；其余记为不变。'),
      el('li', {}, '经理漏报某季度时，该季度留空；下一季度和最近一次实际申报比较。'),
      el('li', {}, '换手率 = min(买入额, 卖出额) ÷ 两期平均组合市值。金额按 13F 申报价（市值 ÷ 股数）估算。'),
      el('li', {}, '拥挤度 = 三项横截面百分位的平均：持有它的精选经理数、13F 持股占比、精选经理平均权重。'),
      el('li', {}, '克隆回测：每份 13F 首次申报日的下一个交易日，按申报市值权重买入前 150 大持仓，持有到下一次申报。"理想化"版本在季末建仓，用来衡量披露延迟的代价。基准为 SPY 全收益，夏普比率按无风险利率 0 计算。')),
    el('h2', {}, '覆盖率'),
    el('ul', {},
      el('li', {}, `精选经理最新持仓中，能映射到股票代码的市值占比：${fmtPct(c.figi_value_pct)}`),
      el('li', {}, `其中有价格数据的市值占比：${fmtPct(c.price_value_pct)}`),
      el('li', {}, `未能映射的 CUSIP：${fmtNum(c.unmapped_cusips)} 个（多为债券、权证、已退市或外国证券）`)),
    el('h2', {}, '已知局限'),
    el('ul', {},
      el('li', {}, '13F 只披露美国上市的多头头寸，不含空头、现金和大部分外国股票；期权按标的名义价值申报。'),
      el('li', {}, '申报最多可在季末 45 天后才公开，看到时持仓可能已经变化。'),
      el('li', {}, '免费价格源可能缺少已退市股票，回测会因此偏乐观；页面显示每次再平衡的价格覆盖率。'),
      el('li', {}, '13F 持股占比用公司全部股本作分母；多类股公司（如 GOOGL/GOOG）会因此偏低。比例超过 120% 视为数据冲突，不显示。'),
      el('li', {}, 'SIC 到行业是近似映射，不等于 GICS 官方分类。')),
    el('p', { class: 'muted' }, '本站仅供研究与教育用途，不构成投资建议。')));
}
```

- [ ] **Step 12：加 launch 配置，然后启动预览验证外壳**

在 `small/.claude/launch.json` 的 `configurations` 数组里追加：

```json
    {
      "name": "smart-money",
      "runtimeExecutable": "python3",
      "runtimeArgs": ["-m", "http.server", "8771", "--directory", "smart-money"],
      "port": 8771
    }
```

用 `preview_start {name: "smart-money"}` 打开预览，依次检查：
1. 控制台无错误（`read_console_messages`）。
2. 首页显示占位卡片。
3. 页脚显示最新申报季度。
4. 搜索框输入 `berk`，能列出 Berkshire Hathaway；输入 `aapl`，第一项是 AAPL。
5. 打开 `#/methods`，方法页内容完整。
6. 打开 `#/nope`，显示"页面不存在。"和返回链接。

- [ ] **Step 13：提交**

```bash
git add smart-money/package.json smart-money/index.html smart-money/styles.css smart-money/js .claude/launch.json
git commit -m "feat(smart-money): front-end shell — router, search, helpers, methods page"
```

---

### Task 12：总览页

**Files:**
- Modify（整体替换占位）: `smart-money/js/page-home.js`

**Interfaces:**
- Consumes：`data/home.json`、`meta.managers`；`calc.js`、`core.js`、`charts.js` 的函数

- [ ] **Step 1：实现 `smart-money/js/page-home.js`**

```js
import { loadJSON, el, card, chartDiv, kpi } from './core.js';
import { mount } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, initials, avatarColor, sectorSankey } from './calc.js';

const go = t => { location.hash = `#/stock/${encodeURIComponent(t)}`; };

function netBar(rows, color, whoLabel) {
  const data = [...rows].reverse();   // category axes draw bottom-up; keep #1 at the top
  return {
    grid: { left: 72, right: 36, top: 8, bottom: 24 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: data.map(r => r.t), axisLabel: { fontFamily: 'JetBrains Mono', fontSize: 11 } },
    tooltip: {
      trigger: 'item',
      formatter: p => {
        const r = data[p.dataIndex];
        return `<b>${r.t}</b> ${r.n}<br/>新建 ${r.new} · 加仓 ${r.add} · 减仓 ${r.trim} · 清仓 ${r.exit}<br/><span style="color:#6b7466">${whoLabel}：${r.who.join('、')}</span>`;
      },
    },
    series: [{ type: 'bar', data: data.map(r => r.net), itemStyle: { color, borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right' }, cursor: 'pointer' }],
  };
}

function crowdBubble(rows) {
  const maxV = Math.max(1, ...rows.map(r => r.value || 0));
  return {
    grid: { left: 60, right: 28, top: 20, bottom: 44 },
    xAxis: { type: 'value', name: '持有机构数', nameLocation: 'middle', nameGap: 28, scale: true },
    yAxis: { type: 'value', name: '13F 持股占比', scale: true, axisLabel: { formatter: v => fmtPct(v, 0) } },
    tooltip: { trigger: 'item', formatter: p => { const d = p.data; return `<b>${d.t}</b> ${d.n}<br/>机构 ${fmtNum(d.value[0])} · 持股 ${fmtPct(d.value[1])}<br/>13F 市值 ${fmtMoney(d.v)} · 拥挤度 ${d.score}`; } },
    series: [{
      type: 'scatter',
      data: rows.map(r => ({ value: [r.holders, r.pct ?? 0], t: r.t, n: r.n, v: r.value, score: r.score, symbolSize: 10 + 44 * Math.sqrt((r.value || 0) / maxV) })),
      itemStyle: { color: 'rgba(15,118,110,.55)', borderColor: '#0f766e' },
      label: { show: true, formatter: p => p.data.t, position: 'top', fontSize: 10, color: '#3b443a' },
      cursor: 'pointer',
    }],
  };
}

function managerGrid(managers) {
  return el('div', { class: 'mgr-grid' }, managers.map(m =>
    el('a', { class: 'card mgr-card', href: `#/manager/${m.cik}` },
      el('div', { class: 'avatar sm', style: { background: avatarColor(m.name) } }, initials(m.person)),
      el('div', { style: { minWidth: 0 } },
        el('div', { class: 'nm' }, m.name),
        el('div', { class: 'ps' }, `${m.person} · ${fmtMoney(m.value)} · ${fmtNum(m.n)} 只`),
        el('div', { class: 'tags', style: { marginTop: '4px' } }, m.style.map(s => el('span', { class: 'tag-pill' }, s)))))));
}

export async function render(app, _params, { meta }) {
  const home = await loadJSON('data/home.json');
  const q = quarterLabel(home.period);
  const boughtEl = chartDiv('tall'), soldEl = chartDiv('tall'), crowdEl = chartDiv('tall'), flowEl = chartDiv('tall');
  app.append(
    el('h1', { class: 'section-title' }, '聪明钱在买什么？'),
    el('p', { class: 'muted', style: { marginTop: '-6px' } }, `基于 ${q} 的 SEC 13F 申报。点击图中的股票查看透视。`),
    el('div', { class: 'grid g4' },
      kpi('最新申报季度', q), kpi('精选经理', String(meta.managers.length)),
      kpi('全部 13F 申报机构', fmtNum(meta.universe.filers)), kpi('13F 申报总市值', fmtMoney(meta.universe.total_value))),
    el('div', { class: 'grid g2 mt' },
      card('精选经理净买入', `${q}：新建仓数 − 清仓数（同分按加仓 − 减仓排序）`, boughtEl),
      card('精选经理净卖出', `${q}：清仓数 − 新建仓数`, soldEl)),
    el('div', { class: 'grid g2 mt' },
      card('拥挤度前 20', '横轴：持有机构数；纵轴：13F 持股占比；气泡大小：13F 市值', crowdEl),
      card('精选经理的行业资金流', '左：减仓、清仓的行业 → 右：新建、加仓的行业（按申报价估算）', flowEl)),
    el('h2', { class: 'section-title' }, '精选经理'),
    managerGrid(meta.managers));
  const b = mount(boughtEl, netBar(home.most_bought, '#157f52', '买入'));
  b.on('click', p => go([...home.most_bought].reverse()[p.dataIndex].t));
  const s = mount(soldEl, netBar(home.most_sold, '#b0403a', '卖出'));
  s.on('click', p => go([...home.most_sold].reverse()[p.dataIndex].t));
  mount(crowdEl, crowdBubble(home.crowded)).on('click', p => go(p.data.t));
  const sk = sectorSankey(home.sector_flows);
  mount(flowEl, {
    tooltip: { trigger: 'item', formatter: p => (p.dataType === 'edge' ? `${p.data.source} → ${p.data.target}<br/>${fmtMoney(p.data.value)}` : `${p.name}<br/>${fmtMoney(p.value)}`) },
    series: [{ type: 'sankey', data: sk.nodes, links: sk.links, nodeAlign: 'justify', emphasis: { focus: 'adjacency' },
               lineStyle: { color: 'gradient', opacity: 0.35 }, label: { fontSize: 12 }, left: 8, right: 90 }],
  });
}
```

- [ ] **Step 2：在预览中验证**

刷新 `http://localhost:8771/#/`，依次检查：
1. 控制台无错误。
2. 4 个 KPI 都有数值。
3. 净买入、净卖出两个条形图有数据，点击柱子能跳到个股页（此时还是占位页）。
4. 拥挤度气泡图带标签。
5. 桑基图从左到右三列。
6. 20 张经理卡片能点进经理页（占位）。

用 `resize_window {preset:'mobile'}` 检查窄屏下变成单列，检查完恢复 `desktop`。截图留作证据。

- [ ] **Step 3：提交**

```bash
git add smart-money/js/page-home.js
git commit -m "feat(smart-money): overview page — net buys/sells, crowding bubbles, sector flow sankey, manager grid"
```

---

### Task 13：基金经理档案页

**Files:**
- Modify（整体替换占位）: `smart-money/js/page-manager.js`

**Interfaces:**
- Consumes：`data/managers/<cik>.json`（字段见数据契约）

- [ ] **Step 1：实现 `smart-money/js/page-manager.js`**

```js
import { loadJSON, el, card, chartDiv, kpi, kindBadge, stockLink, managerLink, table } from './core.js';
import { mount, onCleanup, colorFor } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, initials, avatarColor, KIND_LABEL, KIND_COLOR } from './calc.js';

const last = a => [...a].reverse().find(v => v != null) ?? null;

function profile(m) {
  const where = [m.city, m.state].filter(Boolean).join(', ');
  return el('div', { class: 'card profile' },
    el('div', { class: 'avatar', style: { background: avatarColor(m.name) } }, initials(m.person)),
    el('div', { style: { flex: 1, minWidth: 0 } },
      el('h1', { class: 'serif', style: { margin: '0 0 2px', fontSize: '28px' } }, m.name),
      el('div', { style: { color: 'var(--text2)' } }, [m.person, where, m.founded ? `成立于 ${m.founded}` : null, `CIK ${m.cik}`].filter(Boolean).join(' · ')),
      el('div', { class: 'tags', style: { margin: '8px 0' } }, m.style.map(s => el('span', { class: 'tag-pill' }, s))),
      el('ul', { class: 'bio' }, m.bio.map(b => el('li', {}, b))),
      el('div', { class: 'sources' }, '来源：', m.sources.map((s, i) => [i ? ' · ' : '', el('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.label)]))));
}

function treemap(rows) {
  const by = new Map();
  for (const r of rows) {
    if (!by.has(r.s)) by.set(r.s, []);
    by.get(r.s).push({ name: r.t || r.n, value: r.v, w: r.w, k: r.k, n: r.n, t: r.t, itemStyle: { color: KIND_COLOR[r.k] } });
  }
  return {
    tooltip: { formatter: p => (p.data.k ? `<b>${p.data.name}</b> ${p.data.n}<br/>${fmtMoney(p.value)} · 权重 ${fmtPct(p.data.w)}<br/>本季：${KIND_LABEL[p.data.k]}` : `<b>${p.name}</b><br/>${fmtMoney(p.value)}`) },
    series: [{
      type: 'treemap', data: [...by].map(([s, children]) => ({ name: s, children })),
      roam: false, nodeClick: false, breadcrumb: { show: false }, top: 0, left: 0, right: 0, bottom: 0,
      label: { show: true, formatter: p => (p.data.w != null ? `${p.name}\n${fmtPct(p.data.w)}` : p.name), fontSize: 12, color: '#fff' },
      upperLabel: { show: true, height: 20, color: '#1c2420', fontSize: 12 },
      levels: [{ itemStyle: { borderWidth: 0, gapWidth: 4 } },
               { itemStyle: { borderColor: '#e2e6dc', borderWidth: 2, gapWidth: 1 }, upperLabel: { show: true } },
               { itemStyle: { borderColor: '#fff', borderWidth: 1 } }],
    }],
  };
}

function changesTable(rows) {
  const holder = el('div');
  let kind = 'all';
  const tabs = el('div', { class: 'tabs' });
  const draw = () => {
    tabs.replaceChildren(...['all', 'new', 'add', 'trim', 'exit'].map(k => el('button', { class: kind === k ? 'on' : null, onclick: () => { kind = k; draw(); } },
      k === 'all' ? `全部 ${rows.length}` : `${KIND_LABEL[k]} ${rows.filter(r => r.k === k).length}`)));
    const shown = kind === 'all' ? rows : rows.filter(r => r.k === kind);
    holder.replaceChildren(table([
      { key: 't', label: '股票', fmt: (v, r) => stockLink(v, v || r.n) },
      { key: 'n', label: '名称' },
      { key: 'k', label: '变动', fmt: v => kindBadge(v) },
      { key: 'sh0', label: '上季股数', num: true, fmt: fmtNum },
      { key: 'sh', label: '本季股数', num: true, fmt: fmtNum },
      { key: 'dv', label: '金额变化', num: true, fmt: v => el('span', { style: { color: v > 0 ? 'var(--green)' : v < 0 ? 'var(--red)' : null } }, fmtMoney(v)) },
      { key: 'w0', label: '上季权重', num: true, fmt: v => fmtPct(v) },
      { key: 'w', label: '本季权重', num: true, fmt: v => fmtPct(v) },
    ], shown, { limit: 60 }));
  };
  draw();
  return el('div', {}, tabs, holder);
}

function race(node, ctrl, m) {
  const frames = m.race.frames;
  const chart = mount(node, {
    grid: { left: 96, right: 90, top: 10, bottom: 28 },
    xAxis: { type: 'value', max: 'dataMax', axisLabel: { formatter: v => fmtMoney(v) } },
    yAxis: { type: 'category', inverse: true, max: 14, axisLabel: { fontFamily: 'JetBrains Mono', fontSize: 11 }, animationDuration: 300, animationDurationUpdate: 300 },
    dataset: { source: [] },
    series: [{ type: 'bar', realtimeSort: true, encode: { x: 1, y: 0 }, itemStyle: { color: p => colorFor(p.value[0]) },
               label: { show: true, position: 'right', valueAnimation: true, formatter: p => fmtMoney(p.value[1]) } }],
    animationDuration: 0, animationDurationUpdate: 900, animationEasing: 'linear', animationEasingUpdate: 'linear',
    graphic: { elements: [{ type: 'text', id: 'lbl', right: 100, bottom: 50, style: { text: '', font: '600 44px "Source Serif 4", serif', fill: 'rgba(28,36,32,.16)' } }] },
  });
  const slider = el('input', { type: 'range', min: 0, max: frames.length - 1, value: frames.length - 1 });
  const btn = el('button', { class: 'btn' }, '▶ 播放');
  let i = frames.length - 1, timer = null;
  const show = k => {
    i = k;
    slider.value = k;
    chart.setOption({ dataset: { source: frames[k].map(r => [r.t, r.v]) }, graphic: { elements: [{ id: 'lbl', style: { text: frames[k].length ? quarterLabel(m.periods[k]) : `${quarterLabel(m.periods[k])}（未申报）` } }] } });
  };
  const stop = () => { clearInterval(timer); timer = null; btn.textContent = '▶ 播放'; };
  btn.addEventListener('click', () => {
    if (timer) return stop();
    if (i >= frames.length - 1) show(0);
    btn.textContent = '⏸ 暂停';
    timer = setInterval(() => (i >= frames.length - 1 ? stop() : show(i + 1)), 1100);
  });
  slider.addEventListener('input', () => { stop(); show(Number(slider.value)); });
  onCleanup(stop);
  ctrl.append(btn, slider);
  show(i);
}

function backtestBlock(bt) {
  if (!bt) return [el('div', { class: 'empty' }, '申报季度不足两期，或持仓缺少价格数据，无法回测。')];
  const node = chartDiv();
  const lines = [['跟随申报（申报日次日建仓）', bt.filing, '#0f766e', 'solid'], ['理想化（季末建仓）', bt.ideal, '#9aa59a', 'dashed'], ['SPY', bt.bench, '#2f6fb0', 'solid']];
  const opt = {
    tooltip: { trigger: 'axis', valueFormatter: v => (v == null ? '—' : v.toFixed(3)) },
    legend: { bottom: 0 }, grid: { left: 48, right: 16, top: 16, bottom: 48 },
    xAxis: { type: 'time' }, yAxis: { type: 'value', scale: true, axisLabel: { formatter: v => v.toFixed(2) } },
    series: lines.map(([name, ys, color, type]) => ({ name, type: 'line', symbol: 'none', lineStyle: { color, type, width: 2 }, itemStyle: { color }, data: bt.dates.map((d, i) => [d, ys[i]]) })),
  };
  const rows = [['跟随申报', bt.stats.filing], ['理想化', bt.stats.ideal], ['SPY', bt.stats.bench]].map(([k, s]) => ({ k, ...s }));
  const low = bt.coverage.filter(c => c < 0.9).length;
  return [node, table([
    { key: 'k', label: '组合' },
    { key: 'cagr', label: '年化收益', num: true, fmt: v => fmtPct(v) },
    { key: 'vol', label: '年化波动', num: true, fmt: v => fmtPct(v) },
    { key: 'sharpe', label: '夏普（rf=0）', num: true, fmt: v => (v == null ? '—' : v.toFixed(2)) },
    { key: 'mdd', label: '最大回撤', num: true, fmt: v => fmtPct(v) },
  ], rows),
  low ? el('div', { class: 'warn' }, `注意：${bt.coverage.length} 次再平衡中有 ${low} 次的价格覆盖率低于 90%，回测结果可能失真。`) : null,
  { mountTo: node, option: opt }];
}

export async function render(app, { cik }, { meta }) {
  let m;
  try { m = await loadJSON(`data/managers/${cik}.json`); } catch { throw new Error(`没有找到 CIK ${cik} 的经理档案。目前只收录 ${meta.managers.length} 位精选经理。`); }
  const P = m.periods.map(quarterLabel);
  const treeEl = chartDiv('tall'), raceEl = chartDiv('tall'), raceCtrl = el('div', { class: 'controls' });
  const sectorEl = chartDiv(), styleEl = chartDiv();
  const bt = backtestBlock(m.backtest);
  const btMount = bt.find(x => x && x.mountTo);
  const legend = el('div', { class: 'legend' }, '颜色：', ['new', 'add', 'trim', 'hold'].map(k => kindBadge(k)));
  app.append(
    profile(m),
    el('div', { class: 'grid g4 mt' },
      kpi('13F 股票市值', fmtMoney(last(m.series.value))), kpi('持仓数量', fmtNum(last(m.series.n))),
      kpi('前十大集中度', fmtPct(last(m.series.top10))), kpi('最近季度换手率', fmtPct(last(m.series.turnover)))),
    el('h2', { class: 'section-title' }, `持仓全景 · ${m.latest.period ? quarterLabel(m.latest.period) : '—'}`),
    card(null, `按行业分组，面积表示市值；前 ${m.latest.rows.length} 大持仓之外的部分占 ${fmtPct(m.latest.other_w)}`, legend, treeEl),
    el('h2', { class: 'section-title' }, '本季度调仓'),
    card(null, m.changes.period ? `${quarterLabel(m.changes.period)} 对比 ${quarterLabel(m.changes.prev_period)}，按金额变化排序` : '只有一期申报，暂无对比', changesTable(m.changes.rows)),
    el('div', { class: 'grid g2 mt' },
      card('持仓演变', '前 15 大持仓，按季度播放', raceCtrl, raceEl),
      card('行业配置', '各季度股票持仓的行业权重', sectorEl)),
    el('div', { class: 'grid g2 mt' },
      card('风格指标', '集中度、换手率（左轴），加权持有季度数（右轴）', styleEl),
      card('克隆回测', '用公开 13F 复制组合，对比季末理想化建仓和 SPY', ...bt.filter(x => !(x && x.mountTo)))),
    el('div', { class: 'grid g2 mt' },
      card('相似经理', '按最新持仓权重的余弦相似度', m.similar.length
        ? table([{ key: 'name', label: '经理', fmt: (v, r) => managerLink(r.cik, v) }, { key: 'score', label: '相似度', num: true, fmt: v => v.toFixed(2) }], m.similar)
        : el('div', { class: 'empty' }, '暂无')),
      card('期权头寸', '13F 中的 PUT/CALL，按标的名义价值申报，不计入上面的股票权重', m.options.length
        ? table([{ key: 't', label: '标的', fmt: (v, r) => stockLink(v, v || r.n) }, { key: 'pc', label: '类型' }, { key: 'v', label: '名义价值', num: true, fmt: fmtMoney }], m.options, { limit: 20 })
        : el('div', { class: 'empty' }, '最新季度没有申报期权'))));

  if (m.latest.rows.length) mount(treeEl, treemap(m.latest.rows)); else treeEl.replaceWith(el('div', { class: 'empty' }, '暂无持仓'));
  race(raceEl, raceCtrl, m);
  mount(sectorEl, {
    tooltip: { trigger: 'axis', valueFormatter: v => fmtPct(v) }, legend: { type: 'scroll', bottom: 0 },
    grid: { left: 48, right: 16, top: 12, bottom: 48 },
    xAxis: { type: 'category', data: P, boundaryGap: false }, yAxis: { type: 'value', max: 1, axisLabel: { formatter: v => fmtPct(v, 0) } },
    series: m.sectors.names.map((s, j) => ({ name: s, type: 'line', stack: 'w', symbol: 'none', lineStyle: { width: 0 }, areaStyle: { opacity: 0.85 },
                                              data: m.sectors.weights.map(row => (row ? row[j] : null)) })),
  });
  mount(styleEl, {
    tooltip: { trigger: 'axis' }, legend: { bottom: 0 }, grid: { left: 48, right: 48, top: 16, bottom: 48 },
    xAxis: { type: 'category', data: P },
    yAxis: [{ type: 'value', axisLabel: { formatter: v => fmtPct(v, 0) } }, { type: 'value', name: '季度', splitLine: { show: false } }],
    series: [
      { name: '前十大集中度', type: 'line', data: m.series.top10, tooltip: { valueFormatter: v => fmtPct(v) } },
      { name: '换手率', type: 'line', data: m.series.turnover, tooltip: { valueFormatter: v => fmtPct(v) } },
      { name: '加权持有季度数', type: 'line', yAxisIndex: 1, data: m.series.hold_q, tooltip: { valueFormatter: v => (v == null ? '—' : v.toFixed(1)) } },
    ],
  });
  if (btMount) mount(btMount.mountTo, btMount.option);
}
```

- [ ] **Step 2：在预览中验证**

打开 `#/manager/1067983`（伯克希尔）、`#/manager/1037389`（Renaissance，持仓最多）、`#/manager/1336528`（Pershing，持仓最少）。

逐页检查：
1. 控制台无错误。
2. 档案卡的简介和来源链接都在。
3. 矩形树图按行业分组，有颜色图例。
4. 调仓表的标签切换和列排序都能用，无代码的行不是链接。
5. 赛跑图能播放、能暂停，拖动滑块会停止播放并跳转。
6. 行业面积图和风格指标正常。
7. 回测有三条线和统计表。
8. 离开页面后再返回，赛跑图不会重复播放（定时器已清理）。

另外打开 `#/manager/123`，应显示"没有找到 CIK 123 的经理档案"。每页截图留作证据。

- [ ] **Step 3：提交**

```bash
git add smart-money/js/page-manager.js
git commit -m "feat(smart-money): manager profile page — treemap, changes, bar race, sectors, style, clone backtest"
```

---

### Task 14：个股透视页

**Files:**
- Modify（整体替换占位）: `smart-money/js/page-stock.js`

**Interfaces:**
- Consumes：`data/stocks/<ticker>.json`；`calc.sankeyFromFlows`

- [ ] **Step 1：实现 `smart-money/js/page-stock.js`**

```js
import { loadJSON, el, card, chartDiv, kpi, kindBadge, managerLink, table } from './core.js';
import { mount } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, sankeyFromFlows } from './calc.js';

const last = a => [...a].reverse().find(v => v != null) ?? null;

export async function render(app, { t }) {
  let s;
  try { s = await loadJSON(`data/stocks/${encodeURIComponent(t)}.json`); }
  catch { throw new Error(`${t} 不在收录范围内。目前只收录 13F 持有机构数前 1,500 名的股票，以及精选经理重仓过的股票。`); }
  const P = s.holders.periods.map(quarterLabel);
  const priceEl = chartDiv('short'), holdEl = chartDiv(), flowEl = chartDiv(), gaugeEl = chartDiv('short'), crowdEl = chartDiv('short');
  const sk = sankeyFromFlows(s.flows.items, s.t);
  app.append(
    el('div', { class: 'card' },
      el('div', { style: { display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' } },
        el('h1', { class: 'mono', style: { margin: 0, fontSize: '30px' } }, s.t),
        el('span', { class: 'serif', style: { fontSize: '20px' } }, s.n),
        el('span', { class: 'tag-pill' }, s.s), s.is_etf ? el('span', { class: 'tag-pill' }, 'ETF') : null,
        el('span', { class: 'muted mono', style: { fontSize: '12px' } }, `CUSIP ${s.cusip}`)),
      s.price.dates.length ? priceEl : el('div', { class: 'empty' }, '暂无价格数据')),
    el('div', { class: 'grid g4 mt' },
      kpi('持有机构数', fmtNum(last(s.holders.count))), kpi('13F 持股占比', fmtPct(last(s.holders.pct))),
      kpi('13F 持仓市值', fmtMoney(last(s.holders.value))), kpi('拥挤度', s.crowding.score == null ? '—' : String(s.crowding.score))),
    el('div', { class: 'grid g2 mt' },
      card('机构持有人', '柱：持有机构数；线：13F 机构持股占流通股本的比例', holdEl),
      card(`本季度资金流 · ${quarterLabel(s.flows.period)}`, '左：新建、加仓 → 中：本股 → 右：减仓、清仓（按申报价估算）',
        sk.links.length ? flowEl : el('div', { class: 'empty' }, '本季度没有可比较的仓位变动'))),
    el('div', { class: 'grid g3 mt' },
      card('拥挤度', '0–100，越高越拥挤', gaugeEl),
      el('div', { style: { gridColumn: 'span 2' } }, card('拥挤度历史', '各季度的横截面百分位得分', crowdEl))),
    el('h2', { class: 'section-title' }, '精选经理持仓'),
    card(null, `${quarterLabel(s.flows.period)} 持有 ${s.t} 的精选经理`, table([
      { key: 'name', label: '经理', fmt: (v, r) => managerLink(r.cik, v) },
      { key: 'sh', label: '股数', num: true, fmt: fmtNum },
      { key: 'w', label: '占其组合', num: true, fmt: v => fmtPct(v) },
      { key: 'k', label: '本季变动', fmt: v => kindBadge(v) },
      { key: 'first', label: '首次出现', fmt: v => quarterLabel(v) },
    ], s.curated, { sortKey: 'w' })));

  if (s.price.dates.length) mount(priceEl, {
    grid: { left: 52, right: 16, top: 12, bottom: 24 }, tooltip: { trigger: 'axis', valueFormatter: v => (v == null ? '—' : `$${v.toFixed(2)}`) },
    xAxis: { type: 'time' }, yAxis: { type: 'value', scale: true },
    series: [{ type: 'line', symbol: 'none', lineStyle: { color: '#0f766e', width: 2 }, areaStyle: { color: 'rgba(15,118,110,.08)' },
               data: s.price.dates.map((d, i) => [d, s.price.close[i]]) }],
  });
  mount(holdEl, {
    tooltip: { trigger: 'axis' }, legend: { bottom: 0 }, grid: { left: 56, right: 56, top: 16, bottom: 48 },
    xAxis: { type: 'category', data: P },
    yAxis: [{ type: 'value', name: '机构数' }, { type: 'value', name: '持股占比', axisLabel: { formatter: v => fmtPct(v, 0) }, splitLine: { show: false } }],
    series: [
      { name: '持有机构数', type: 'bar', data: s.holders.count, itemStyle: { color: '#cfe3df' }, tooltip: { valueFormatter: fmtNum } },
      { name: '13F 持股占比', type: 'line', yAxisIndex: 1, data: s.holders.pct, itemStyle: { color: '#0f766e' }, tooltip: { valueFormatter: v => fmtPct(v) } },
    ],
  });
  if (sk.links.length) mount(flowEl, {
    tooltip: { trigger: 'item', formatter: p => (p.dataType === 'edge' ? `${p.data.source} → ${p.data.target}<br/>${fmtMoney(p.data.value)}` : `${p.name}<br/>${fmtMoney(p.value)}`) },
    series: [{ type: 'sankey', data: sk.nodes, links: sk.links, nodeAlign: 'justify', emphasis: { focus: 'adjacency' },
               lineStyle: { color: 'gradient', opacity: 0.35 }, left: 8, right: 100 }],
  });
  mount(gaugeEl, {
    series: [{ type: 'gauge', min: 0, max: 100, startAngle: 200, endAngle: -20, radius: '95%', center: ['50%', '62%'],
               progress: { show: true, width: 14, itemStyle: { color: '#0f766e' } }, axisLine: { lineStyle: { width: 14, color: [[1, '#e2e6dc']] } },
               axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, pointer: { show: false },
               detail: { valueAnimation: true, fontSize: 30, fontFamily: 'JetBrains Mono', offsetCenter: [0, '0%'], formatter: v => (v == null ? '—' : String(v)) },
               data: [{ value: s.crowding.score }] }],
  });
  mount(crowdEl, {
    grid: { left: 40, right: 16, top: 12, bottom: 28 }, tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: P }, yAxis: { type: 'value', min: 0, max: 100 },
    series: [{ type: 'line', data: s.crowding.history, smooth: true, itemStyle: { color: '#a06510' }, areaStyle: { color: 'rgba(160,101,16,.08)' } }],
  });
}
```

- [ ] **Step 2：在预览中验证**

打开 `#/stock/AAPL`、`#/stock/BRK-B`，以及一只小盘股（在 `data/stocks/` 里随便挑一个持有机构数少的）。

逐页检查：
1. 控制台无错误。
2. 价格图有数据。
3. 持有人双轴图正常。
4. 桑基图左进右出，或显示"没有可比较的仓位变动"。
5. 拥挤度仪表和历史线正常。
6. 精选经理表的链接能跳回经理页。

另外打开 `#/stock/NOTREAL`，应显示中文"不在收录范围内"错误卡片。在首页搜索框输入 `brk` 后回车，应进入 BRK-B 页面。截图留作证据。

- [ ] **Step 3：提交**

```bash
git add smart-money/js/page-stock.js
git commit -m "feat(smart-money): stock look-through page — price, holders, flow sankey, crowding, curated holders"
```

---

### Task 15：README、仓库索引、整体验收

**Files:**
- Create: `smart-money/README.md`
- Modify: `small/README.md`（在项目列表中加一节，开头的 "Four standalone" 改成 "Five standalone"）

- [ ] **Step 1：写 `smart-money/README.md`**

````markdown
# 聪明钱追踪器（smart-money）

用 SEC 公开的 13F 数据追踪 20 位知名基金经理：持仓全景、季度调仓、持仓演变动画、行业配置、风格指标，以及按真实披露日期复制组合的回测。另有个股透视页，展示谁持有一只股票、资金怎么流动、有多拥挤。

只用公开数据（SEC EDGAR、OpenFIGI、Yahoo Finance），不需要后端，用任意静态服务器（或 GitHub Pages）托管 `smart-money/` 目录即可。

## 本地查看

```bash
python3 -m http.server 8771 --directory smart-money
```

然后打开 http://localhost:8771/ 。（ES modules 需要 http 访问，不能直接双击打开 `index.html`。）

## 重新构建数据

```bash
cd smart-money
cp .env.example .env              # 填入个人邮箱 SEC_CONTACT_EMAIL；可选 OPENFIGI_API_KEY
cd build
/opt/homebrew/bin/python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python run.py           # 或分阶段：--stage 13f | map | prices | export
```

首次构建会下载约 1.7 GB 的 SEC 批量数据，缓存在 `build/cache/`（已 gitignore）。之后只需要增量更新。

## 测试

```bash
cd smart-money/build && .venv/bin/python -m pytest -q       # 构建管线，含伯克希尔 13F 金标准
cd smart-money && env -u NODE_OPTIONS node --test js/calc.test.js
```

## 新增一位经理

在 `build/config/managers.yaml` 加一条记录，CIK 可在 SEC EDGAR 上搜索到。每条简介事实都要附来源 URL。然后：

```bash
.venv/bin/python check_links.py && .venv/bin/python run.py --stage map && .venv/bin/python run.py --stage prices && .venv/bin/python run.py --stage export
```

## 方法与局限

详见站内"方法与数据"页，以及设计文档 `docs/specs/2026-10-15-smart-money-design.md`。
````

- [ ] **Step 2：更新 `small/README.md`**

把开头的 "Four standalone, single-page projects" 改成 "Five standalone, single-page projects"，并在 `treasury-factors` 那一节之后插入：

```markdown
## [`smart-money/`](smart-money/) — 聪明钱追踪器（Smart Money Tracker）

Track 20 well-known fund managers from public SEC 13F filings: holdings treemaps, quarter-over-quarter changes, an animated holdings race, sector allocation, style metrics, and a clone backtest that buys only after each real filing date. A stock look-through page shows who holds a name, how money moved, and how crowded it is. A Python build turns SEC bulk data into JSON; the site itself is static (ECharts, no backend).
```

- [ ] **Step 3：全量回归**

```bash
cd smart-money/build && .venv/bin/python -m pytest -q
cd .. && env -u NODE_OPTIONS node --test js/calc.test.js
du -sh data && ls data/stocks | wc -l
```
Expected：两套测试全部通过；`data` 小于 50 MB。

- [ ] **Step 4：整体浏览器验收（对应 spec 第 8 节的第一阶段完成标准）**

用 `preview_start {name:"smart-money"}` 依次走一遍下面的路径，每一步都检查 `read_console_messages` 没有错误：

1. 总览。
2. 点击净买入第一名，进入个股页。
3. 在个股页点击一位精选经理，进入经理页。
4. 在经理页播放赛跑图，然后点击一位相似经理。
5. 用搜索框找到 Pershing Square。
6. 方法页。
7. 依次访问 `#/stock/NOTREAL`、`#/manager/123`、`#/nope`，确认三种错误卡片都正常。

伯克希尔页面的所有图表都必须渲染。最后截取总览页和伯克希尔页面的截图作为交付证据。

- [ ] **Step 5：提交**

```bash
git add smart-money/README.md README.md
git commit -m "docs(smart-money): README and repo index entry"
```
