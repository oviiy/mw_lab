# 冰与火地图集 · 恢复说明 / Restore guide

本导出包含 3 个压缩包（每个都小于 25 MB）和本说明文件。

| 文件 | 大小 | 内容 | 是否必需 |
|---|---|---|---|
| `westeros-atlas-1-source.zip` | ~1.1 MB | 全部源码、数据、文档、工具（不含 `dist`、`node_modules`） | 修改/重新构建时必需 |
| `westeros-atlas-2-site.zip` | ~1.1 MB | 已构建好的网站 `dist/`（可直接部署） | 只想看网站时只要这一个 |
| `westeros-atlas-3-node_modules.zip` | ~23 MB | 依赖包 `node_modules/`（three、esbuild、playwright-core） | 可选：离线恢复用；联网时可用 `npm install` 代替 |

三个包都以 `westeros-atlas/` 为顶层目录，解压到**同一个位置**会自动合并成一个完整项目。

---

## 方式 A：只看网站（最简单）

1. 解压 `westeros-atlas-2-site.zip`，得到 `westeros-atlas/dist/`。
2. 在终端运行：
   ```bash
   cd westeros-atlas
   python3 -m http.server 8000 -d dist
   ```
3. 浏览器打开 <http://localhost:8000>。

> 不能直接双击 `index.html`：浏览器会阻止 `file://` 下的模块加载，必须通过本地服务或网站托管打开。
> 也可以把 `dist/` 里的全部文件上传到任意静态托管（GitHub Pages、Netlify、Vercel、S3 等）。

## 方式 B：完整恢复项目（可修改、可重新构建）

1. 把三个 zip 放在同一个文件夹，全部解压到这里（会合并成一个 `westeros-atlas/`）：
   ```bash
   unzip westeros-atlas-1-source.zip
   unzip westeros-atlas-2-site.zip
   unzip westeros-atlas-3-node_modules.zip
   ```
   - 如果不想用第 3 个包，可以跳过它，改为联网安装依赖：`cd westeros-atlas && npm install`
2. 需要 **Node.js 18 或更高版本**（构建时测试过 Node 26）。
3. 常用命令（在 `westeros-atlas/` 目录里运行）：
   ```bash
   npm test          # 校验数据：地点、家族、族谱引用、中英文是否齐全
   npm run build     # 重新构建网站到 dist/
   npm run dev       # 开发模式：自动重建 + 本地服务 http://localhost:5173
   ```

### 常见问题
- **`node: either --use-openssl-ca or --use-system-ca can be used, not both`**：先运行 `unset NODE_OPTIONS` 再执行 npm/node 命令。
- **esbuild 报平台不匹配**（在另一种系统/芯片上恢复时，例如从 Mac 换到 Windows）：删除 `node_modules` 后运行 `npm install`，不要用第 3 个包。
- **截图/端到端测试工具**（`tools/shot.mjs`、`tools/e2e.mjs`、`tools/mapview.mjs`）调用本机的 Google Chrome，路径写的是 macOS 默认位置；只用于开发验证，网站本身不需要。

## 项目结构速览
- `src/data/places/`、`src/data/houses/`：地名录与家族/族谱数据（格式见 `docs/PLACES_SCHEMA.md`）
- `src/scenes/`、`src/content/`：40 个 3D 地点的场景与中英文内容
- `src/map/`：羊皮纸世界地图（坐标与比例见 `docs/MAP_GRID.md`）
- `docs/`：出处说明、术语表、覆盖表、进度记录
- `README.md`：更完整的英文说明
