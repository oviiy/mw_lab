import type { Die, Face, MarkId, Material } from './types';

export const MAX_PIPS = 9;
export const MAX_DICE = 4;

export const opposite = (face: number) => 5 - face;

export interface MarkInfo {
  glyph: string;
  name: string;
  desc: string;
}

export const MARKS: Record<MarkId, MarkInfo> = {
  jade: { glyph: '玉', name: '玉印', desc: '计分时 +4 倍' },
  iron: { glyph: '铁', name: '铁印', desc: '计分时 +20 筹' },
  gold: { glyph: '金', name: '金印', desc: '计分时 +2 金' },
  glass: { glyph: '璃', name: '琉璃印', desc: '计分时 ×2 倍；¼ 概率碎裂，这一面变为 0' },
  echo: { glyph: '回', name: '回印', desc: '这颗骰子再计分一次' },
  wild: { glyph: '万', name: '万印', desc: '组牌型时可算任意点数' },
  mirror: { glyph: '镜', name: '镜印', desc: '取左邻骰子的点数' },
  cinnabar: { glyph: '朱', name: '朱印', desc: '算作红面；计分时 +2 倍' },
  ink: { glyph: '墨', name: '墨印', desc: '掷出这一面时，重掷 +1' },
};

export const MATERIALS: Record<Material, { name: string; desc: string }> = {
  wood: { name: '白木', desc: '普通的白木骰。' },
  ivory: { name: '象牙', desc: '每次计分 +10 筹' },
  ebony: { name: '黑檀', desc: '每次计分 +2 倍' },
  lacquer: { name: '金漆', desc: '每次计分 ×1.5 倍' },
};

export function makeDie(id: string): Die {
  return { id, faces: [1, 2, 3, 4, 5, 6].map((v) => ({ v })), material: 'wood' };
}

export function cloneFace(f: Face): Face {
  return f.mark ? { v: f.v, mark: f.mark } : { v: f.v };
}

export function isRedValue(v: number) {
  return v === 1 || v === 4;
}
