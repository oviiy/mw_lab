# ZIP 上传与归档说明

以后直接把项目 ZIP 上传到这个仓库的 `docker/` 文件夹。这个文件夹平时只保留本说明；ZIP 处理完成并确认部署成功后，从仓库中删除。

## 命名和目标位置

建议命名为 `<分类>--<项目目录>.zip`，分类使用 `games`、`tools` 或 `knowledge`。例如：

| 上传文件 | 解压目标 |
| --- | --- |
| `games--hexloop.zip` | `games/hexloop/`，更新现有游戏 |
| `games--proverbs.zip` | `games/proverbs/`，新增游戏 |
| `tools--my-tool.zip` | `tools/my-tool/` |
| `knowledge--my-notes.zip` | `knowledge/my-notes/` |

ZIP 内最好有一个同名顶层文件夹。如果文件名没有分类，就先看 ZIP 内的 README、入口文件和现有目录，再决定目标；不能确定时先询问，不要覆盖同名但无关的项目。

## 处理步骤

1. 拉取 `mw_lab/main`，检查 ZIP 的文件清单与目标目录。已有项目更新到原目录；新项目放到对应分类目录。
2. 解压项目源码和可访问的成品文件。游戏需包含能在 GitHub Pages 直接打开的 `index.html` 或 `dist/index.html`。不要提交 `.git/`、`node_modules/`、`.env`、`.DS_Store` 或 `__MACOSX/`。
3. 对比旧版，确认要替换或删除的文件；保留无关项目。更新根目录 `README.md` 的项目链接，并运行 `python scripts/build-file-index.py` 更新文件浏览器清单。
4. 检查页面与相对路径，提交并推送 `mw_lab/main`，确认 Pages 部署和项目直链可访问。
5. 成功后删除上传的 ZIP，再提交并推送删除。不要把私有资料上传到这个公开仓库。

本次示例：`hexloop.zip` 覆盖 `games/hexloop/`；`proverbs.zip` 新增 `games/proverbs/`。以后 ZIP 直接传到这里，不需要经过 MWPrivate。
