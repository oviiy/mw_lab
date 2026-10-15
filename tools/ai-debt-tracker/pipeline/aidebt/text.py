"""HTML filing -> readable plain text, plus section windows."""
from __future__ import annotations

import html
import re
from typing import List

_TAG = re.compile(r"<[^>]+>")
_BLOCK = re.compile(r"</?(p|div|tr|br|li|h\d|table)[^>]*>", re.I)


def html_to_text(raw: bytes) -> str:
    s = raw.decode("utf-8", errors="replace") if b"\xe2\x80" in raw else raw.decode("latin-1")
    s = re.sub(r"(?is)<(script|style).*?</\1>", " ", s)
    s = _BLOCK.sub("\n", s)
    s = re.sub(r"(?i)</t[dh]>", " | ", s)
    s = _TAG.sub(" ", s)
    s = html.unescape(s).replace("\xa0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\s*\|\s*(\|\s*)+", " | ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    return s.strip()


def sections(text: str, heading: str, length: int = 1500, limit: int = 2) -> List[str]:
    """Return text windows following standalone occurrences of a heading.

    Prospectus supplements list "Use of Proceeds" in the table of contents
    first, then in the supplement body, then again in the base prospectus.
    We drop the table-of-contents hit and return the next `limit` windows.
    """
    hits = [m.start() for m in re.finditer(rf"(?im)^\s*{heading}\s*$", text)]
    if len(hits) > 1:
        hits = hits[1:]
    return [text[h : h + length].strip() for h in hits[:limit]]
