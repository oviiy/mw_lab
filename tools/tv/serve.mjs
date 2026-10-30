// 本地运行：node serve.mjs  → 打开 http://localhost:8787（同一 WiFi 的 iPhone 用 http://电脑IP:8787）
// 同时提供页面和 /proxy 代理，无需另外部署 Worker
import http from 'node:http';
import os from 'node:os';
import { readFile } from 'node:fs/promises';
import worker from './worker.mjs';

const PORT = Number(process.env.PORT) || 8787;

http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/proxy')) {
      const r = await worker.fetch(new Request('http://local' + req.url, {
        method: req.method,
        headers: req.headers.range ? { range: req.headers.range } : {},
      }));
      res.writeHead(r.status, Object.fromEntries(r.headers));
      if (r.body && req.method !== 'HEAD') for await (const chunk of r.body) res.write(chunk);
      return res.end();
    }
    const html = await readFile(new URL('./index.html', import.meta.url));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (e) {
    if (!res.headersSent) res.writeHead(500);
    res.end(String(e));
  }
}).listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter(i => i?.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log(`轻TV 已启动：http://localhost:${PORT}`);
  for (const ip of ips) console.log(`  手机访问：http://${ip}:${PORT}`);
});
