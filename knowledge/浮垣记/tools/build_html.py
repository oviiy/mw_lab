#!/usr/bin/env python3
"""把《浮垣记》的 Markdown 文稿打包成一个单文件 HTML（浮垣记.html）。

用法：在任意目录运行
    python3 浮垣记/tools/build_html.py
    python3 浮垣记/tools/build_html.py --src 另一个放稿子的文件夹
改了正文或世界集以后，重新运行一次即可。
"""
import html
import json
import re
from pathlib import Path

import sys

HERE = Path(__file__).resolve().parent
# 稿子所在的文件夹：默认是 tools 的上一级；也可以用 --src 指定
ROOT = Path(sys.argv[sys.argv.index("--src") + 1]).resolve() if "--src" in sys.argv else HERE.parent
TEMPLATE = HERE / "template.html"
OUT = HERE.parent / "浮垣记.html"

# ---------------------------------------------------------------- markdown

LINK_MAP = {
    "14_这是个什么世界.md": "#world/guide",
    "13_读者手册.md": "#world/words",
}


def link_target(url):
    name = url.split("/")[-1]
    if name in LINK_MAP:
        return LINK_MAP[name]
    m = re.match(r"(\d\d)_", name)
    if m and "短篇/" in url:
        return "#read/%d" % int(m.group(1))
    return None


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<em>\1</em>", text)

    def _link(m):
        label, url = m.group(1), m.group(2)
        target = link_target(html.unescape(url))
        if target:
            return '<a href="%s">%s</a>' % (target, label)
        return label

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", _link, text)
    return text


def table(lines):
    rows = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines]
    head, body = rows[0], [r for r in rows[2:]]
    out = ["<div class=\"tbl\"><table><thead><tr>"]
    out += ["<th>%s</th>" % inline(c) for c in head]
    out.append("</tr></thead><tbody>")
    for r in body:
        out.append("<tr>" + "".join("<td>%s</td>" % inline(c) for c in r) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def md(src):
    lines = src.split("\n")
    out, i = [], 0
    para = []

    def flush():
        if para:
            out.append("<p>%s</p>" % "<br>".join(inline(l.strip()) for l in para))
            para.clear()

    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if not s:
            flush(); i += 1; continue
        if s.startswith("```"):
            flush(); j = i + 1; buf = []
            while j < len(lines) and not lines[j].strip().startswith("```"):
                buf.append(lines[j]); j += 1
            out.append("<pre>%s</pre>" % html.escape("\n".join(buf)))
            i = j + 1; continue
        m = re.match(r"(#{1,4})\s+(.*)", s)
        if m:
            flush(); lvl = len(m.group(1))
            out.append("<h%d>%s</h%d>" % (lvl, inline(m.group(2)), lvl)); i += 1; continue
        if re.fullmatch(r"-{3,}", s):
            flush(); out.append("<hr>"); i += 1; continue
        if s.startswith(">"):
            flush(); buf = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                buf.append(re.sub(r"^\s*>\s?", "", lines[i])); i += 1
            inner = "\n".join(buf)
            if inner.lstrip().startswith("【途经】"):
                body = inner.lstrip()[len("【途经】"):]
                out.append('<aside class="transit"><div class="transit-h">途经</div>%s</aside>' % md(body))
            else:
                out.append("<blockquote>%s</blockquote>" % md(inner))
            continue
        if s.startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            flush(); buf = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                buf.append(lines[i]); i += 1
            out.append(table(buf)); continue
        if re.match(r"^(\s*)([-*]|\d+\.)\s+", line):
            flush(); ordered = bool(re.match(r"^\s*\d+\.", line))
            items = []
            while i < len(lines) and lines[i].strip() and (re.match(r"^\s*([-*]|\d+\.)\s+", lines[i]) or lines[i].startswith("   ")):
                l = lines[i]
                mm = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)", l)
                if mm:
                    items.append([len(mm.group(1)), mm.group(3)])
                elif items:
                    items[-1][1] += "<br>" + l.strip()
                i += 1
            tag = "ol" if ordered else "ul"
            html_items, base = [], items[0][0] if items else 0
            for ind, txt in items:
                cls = ' class="sub"' if ind > base else ""
                html_items.append("<li%s>%s</li>" % (cls, inline(txt) if "<br>" not in txt else "<br>".join(inline(t) for t in txt.split("<br>"))))
            out.append("<%s>%s</%s>" % (tag, "".join(html_items), tag))
            continue
        para.append(line); i += 1
    flush()
    return "\n".join(out)


# ---------------------------------------------------------------- content

def chapter(path):
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")
    title = lines[0].lstrip("# ").strip()
    meta = lines[2].strip().strip("*") if len(lines) > 2 else ""
    body = "\n".join(lines[3:])
    end = ""
    m = re.search(r"\n\*（(.+?)）\*\s*$", body)
    if m:
        end = m.group(1)
        body = body[: m.start()]
    body = re.sub(r"\n---\s*$", "", body.rstrip())
    return {"title": title, "meta": meta, "end": end, "html": md(body)}


def world_doc(name, drop_sections=(), spoiler_heading=None):
    text = (ROOT / name).read_text(encoding="utf-8")
    text = re.sub(r"^# .*\n", "", text, count=1)
    for sec in drop_sections:
        text = re.sub(r"\n## " + re.escape(sec) + r".*?(?=\n## |\Z)", "\n", text, flags=re.S)
    h = md(text)
    if spoiler_heading:
        start = h.find("<h2>" + spoiler_heading)
        if start >= 0:
            nxt = h.find("<h2>", start + 4)
            nxt = len(h) if nxt < 0 else nxt
            inner = h[start:nxt]
            h = (h[:start] + '<details class="spoiler"><summary>作者机密：含全书剧透，读完十二篇再打开</summary>'
                 + inner + "</details>" + h[nxt:])
    return h


def main():
    stories = sorted((ROOT / "短篇").glob("[0-9][0-9]_*.md"))
    chapters = [chapter(p) for p in stories]
    book = {
        "chapters": chapters,
        "world": {
            "guide": world_doc("14_这是个什么世界.md"),
            "words": world_doc("13_读者手册.md", drop_sections=("一页看懂这个世界", "三种人", "主要人物")),
        },
    }
    data = json.dumps(book, ensure_ascii=False).replace("</", "<\\/")
    tpl = TEMPLATE.read_text(encoding="utf-8").replace("/*__ART_JS__*/", (HERE / "art.js").read_text(encoding="utf-8"))
    OUT.write_text(tpl.replace("/*__BOOK_DATA__*/null", data), encoding="utf-8")
    print("写好了：%s（%d KB，%d 篇）" % (OUT, OUT.stat().st_size // 1024, len(chapters)))


if __name__ == "__main__":
    main()
