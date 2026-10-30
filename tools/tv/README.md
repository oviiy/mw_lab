# 轻TV

单页网页播放器，iPhone Safari、电脑浏览器都能用。读取 TVBox 配置（如饭太硬）里的苹果CMS源，多源并行搜索，**只显示确认能播放的结果**。

## 文件
- `index.html`：整个应用，一个文件
- `worker.mjs`：CORS 代理（Cloudflare Worker）
- `serve.mjs`：本地服务器（页面 + 代理），用来在电脑或同一 WiFi 下的手机上使用

## 用法一：电脑本地 + 同一 WiFi 的 iPhone
```bash
node serve.mjs
```
电脑打开 `http://localhost:8787`，iPhone 打开终端里显示的 `http://电脑IP:8787`。代理会自动配置好。

## 用法二：随时随地用（不依赖电脑）
1. 打开 Cloudflare 控制台 → Workers → 新建 Worker，把 `worker.mjs` 的内容粘贴进去并部署，得到类似 `https://xxx.workers.dev` 的地址
2. 把 `index.html` 放到任意静态托管（GitHub Pages、Cloudflare Pages 等）
3. 打开页面 → ⚙︎ 设置 → 代理填 `https://xxx.workers.dev/?url=`
4. iPhone Safari：分享 → 添加到主屏幕，用起来像个 App

## 设置
- **配置地址**：TVBox 配置 JSON，支持多仓、图片内藏 base64 的配置。加密配置不支持
- **自定义接口**：每行一个 `名称,https://.../api.php/provide/vod/`
- **隐藏不可播放的结果**：默认开启

## 怎么减少"点进去看不了"
1. 只用苹果CMS（type 0/1）源，jar 爬虫源直接跳过
2. 启动时检测每个源，失效的源 12 小时内不再搜索
3. 只保留 m3u8 / mp4 直链，需要网页解析的线路直接丢掉
4. 搜索后逐条线路实际请求一次 m3u8 来检测，不可播的结果默认隐藏，可播的排在前面
5. 播放失败时自动切换到下一条可用线路，并尽量接上同一集同一进度
6. 自动记录观看历史和进度，播完自动下一集
