// Global source register. Per-landmark notes (in src/content/*.js) cite these ids and say how each claim was checked.
// IMPORTANT HONESTY NOTE: the authors of this atlas had no direct access to the novels' text. Claims come from recollection of the
// books, official-companion knowledge and web-search summaries. `checked` records exactly that; nothing is marked "verified against the book".
export const SOURCES = {
  agot: { tier: 1, title: { en: 'A Game of Thrones (1996)', zh: '《冰与火之歌·卷一：权力的游戏》（1996）' }, author: 'George R. R. Martin', kind: 'novel' },
  acok: { tier: 1, title: { en: 'A Clash of Kings (1998)', zh: '《冰与火之歌·卷二：列王的纷争》（1998）' }, author: 'George R. R. Martin', kind: 'novel' },
  asos: { tier: 1, title: { en: 'A Storm of Swords (2000)', zh: '《冰与火之歌·卷三：冰雨的风暴》（2000）' }, author: 'George R. R. Martin', kind: 'novel' },
  affc: { tier: 1, title: { en: 'A Feast for Crows (2005)', zh: '《冰与火之歌·卷四：群鸦的盛宴》（2005）' }, author: 'George R. R. Martin', kind: 'novel' },
  adwd: { tier: 1, title: { en: 'A Dance with Dragons (2011)', zh: '《冰与火之歌·卷五：魔龙的狂舞》（2011）' }, author: 'George R. R. Martin', kind: 'novel' },
  maps: { tier: 2, title: { en: 'Official published maps (endpapers; Jonathan Roberts and others)', zh: '官方出版地图（书中附图，乔纳森·罗伯茨等绘）' }, author: 'Official', kind: 'map' },
  author: { tier: 2, title: { en: 'Statements by the author (interviews, notes)', zh: '作者公开说明（访谈、笔记）' }, author: 'George R. R. Martin', kind: 'author' },
  twoiaf: { tier: 3, title: { en: 'The World of Ice & Fire (2014)', zh: '《冰与火之歌的世界》（2014）' }, author: 'Martin, García Jr., Antonsson', kind: 'companion' },
  awoiaf: { tier: 4, title: { en: 'A Wiki of Ice and Fire (discovery index)', zh: 'A Wiki of Ice and Fire 冰与火维基（检索用）' }, author: 'Community', kind: 'index' },
  concordance: { tier: 4, title: { en: 'Westeros.org Concordance (chapter-cited index)', zh: 'Westeros.org 词条索引（注明章节出处）' }, author: 'Westeros.org', kind: 'index' },
};
export const CHECKED = {
  memory: { en: 'Recalled from the novels (text not re-read)', zh: '凭对小说的记忆（未重读原文）' },
  'search-snippet': { en: 'Confirmed via a web-search summary', zh: '经网络搜索摘要核实' },
  'not-accessed': { en: 'Primary text not accessed', zh: '未能查阅原文' },
};
export const CONFIDENCE = {
  high: { en: 'High confidence', zh: '可信度高' },
  medium: { en: 'Medium confidence', zh: '可信度中等' },
  low: { en: 'Low confidence', zh: '可信度较低' },
};
