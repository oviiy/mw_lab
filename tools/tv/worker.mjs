// 轻TV 的 CORS 代理：可直接粘贴到 Cloudflare Workers，也被 serve.mjs 本地复用
// 用法：GET https://<你的worker>/?url=<编码后的目标地址>
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': '*',
};

export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const target = new URL(req.url).searchParams.get('url');
    if (!target || !/^https?:\/\//i.test(target)) return new Response('need ?url=', { status: 400, headers: CORS });

    const headers = { 'User-Agent': 'okhttp/3.12.0' };
    const range = req.headers.get('Range');
    if (range) headers.Range = range;

    let r;
    try {
      r = await fetch(target, { headers, redirect: 'follow' });
    } catch (e) {
      return new Response('fetch failed: ' + e.message, { status: 502, headers: CORS });
    }
    const h = new Headers(r.headers);
    for (const [k, v] of Object.entries(CORS)) h.set(k, v);
    // fetch 已经解压过，去掉这些头避免浏览器重复解码
    for (const k of ['content-encoding', 'content-length', 'content-security-policy', 'x-frame-options', 'set-cookie']) h.delete(k);
    return new Response(r.body, { status: r.status, headers: h });
  },
};
