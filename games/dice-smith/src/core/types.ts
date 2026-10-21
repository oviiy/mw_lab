import type { Rng } from './rng';

// ---------- dice ----------

export type MarkId = 'jade' | 'iron' | 'gold' | 'glass' | 'echo' | 'wild' | 'mirror' | 'cinnabar' | 'ink';
export type Material = 'wood' | 'ivory' | 'ebony' | 'lacquer';

export interface Face {
  v: number;
  mark?: MarkId;
}

/** Faces are stored so that face i is opposite face 5 − i (a fresh die reads 1..6). */
export interface Die {
  id: string;
  faces: Face[];
  material: Material;
}

// ---------- hands ----------

export type HandType = 'high' | 'pair' | 'twopair' | 'straight' | 'triple' | 'longstraight' | 'quad';

// ---------- scoring ----------

export interface Effect {
  chips?: number;
  mult?: number;
  xmult?: number;
  money?: number;
}

export type Step =
  | { k: 'base'; chips: number; mult: number }
  | { k: 'die'; i: number; label: string; fx: Effect; chips: number; mult: number }
  | { k: 'art'; a: number; label: string; fx: Effect; chips: number; mult: number }
  | { k: 'rule'; label: string; chips: number; mult: number };

export interface ScoreResult {
  type: HandType;
  scoring: number[];
  /** Effective values per die after rules (what the hand was formed from). */
  vals: number[];
  steps: Step[];
  chips: number;
  mult: number;
  total: number;
  money: number;
  /** [die index, face index] of glass faces that broke. */
  shattered: [number, number][];
}

// ---------- run pieces ----------

export interface ArtifactInst {
  uid: number;
  id: string;
  /** Per-instance counters for scaling artifacts. */
  n: number;
}

export type ConsumableKind = 'carve' | 'star' | 'talisman';

export interface Consumable {
  uid: number;
  kind: ConsumableKind;
  id: string;
}

export type BlindKind = 'small' | 'big' | 'boss';

export interface Rolled {
  face: number;
  held: boolean;
}

export interface Round {
  kind: BlindKind;
  opponent: string;
  boss?: string;
  /** For the final boss: index into its rotating rules. */
  rule?: string;
  target: number;
  score: number;
  hands: number;
  rerolls: number;
  handsPlayed: number;
  rolled: Rolled[];
  rerolledThisHand: boolean;
  /** Rerolls spent during the current hand. */
  handRerolls: number;
  anyReroll: boolean;
  /** Compass flip used this hand / free flip (翻掌) used this hand. */
  flipped: boolean;
  freeFlipped: boolean;
  hidden: boolean;
  /** Artifact index disabled this hand (钟馗). */
  disabled: number | null;
  playedTypes: HandType[];
  /** 铁算盘 accumulator, reset each round. */
  roundMult: number;
  bounty?: { id: string; done: boolean };
  /** Die index kept from the previous hand (留骰). */
  kept: number | null;
  /** Scripted faces for upcoming rolls (tutorial). −1 = random. */
  script?: number[][];
  phase: 'rolling' | 'won' | 'lost';
  last?: ScoreResult;
}

export type PackKind = 'carve' | 'star' | 'artifact' | 'talisman';

export type Offer =
  | { kind: 'artifact'; id: string; price: number; sold?: boolean }
  | { kind: 'consumable'; c: ConsumableKind; id: string; price: number; sold?: boolean }
  | { kind: 'pack'; pack: PackKind; size: number; picks: number; price: number; sold?: boolean };

export interface Shop {
  offers: Offer[];
  rerollCost: number;
}

export interface CashLine {
  label: string;
  amount: number;
}

export type Screen =
  | { t: 'augment'; tier: 'silver' | 'gold' | 'prism'; options: string[]; then: 'select' | 'shop' }
  | { t: 'select' }
  | { t: 'round' }
  | { t: 'cashout'; lines: CashLine[] }
  | { t: 'shop' }
  | { t: 'pack'; pack: PackKind; options: Offer[]; picks: number }
  | { t: 'over'; won: boolean };

export interface Stats {
  hands: number;
  best: number;
  bestType: HandType | null;
  rounds: number;
  carves: number;
  played: Partial<Record<HandType, number>>;
}

export interface Run {
  version: number;
  seed: number;
  rng: Rng;
  money: number;
  dice: Die[];
  artifacts: ArtifactInst[];
  consumables: Consumable[];
  artifactSlots: number;
  consumableSlots: number;
  levels: Record<HandType, number>;
  augments: string[];
  act: number;
  blind: number;
  /** Boss id per act (index 0 = act 1). */
  bosses: string[];
  /** Opponent ids for this act's small and big blind. */
  opponents: string[];
  /** Bounty ids for this act's small and big blind. */
  bounties: string[];
  /** Tags earned by skipping, waiting to be applied. */
  tags: string[];
  /** Tags offered for skipping small / big this act. */
  skipTags: string[];
  round: Round | null;
  shop: Shop | null;
  screen: Screen;
  /** Streak of identical hand types (走马灯). */
  streak: { type: HandType | null; count: number };
  stats: Stats;
  nextUid: number;
  /** First-ever run: the opening round is scripted for teaching. */
  tutorial: boolean;
  /** Markets visited (drives what the market stocks early on). */
  shops: number;
  /** Difficulty: 0 寻常, 1 加注, 2 豪赌. */
  stake: number;
  /** Playing on past the final headliner (加演). */
  endless: boolean;
}

/** Things the UI needs to animate after an action. */
export type GEvent =
  | { t: 'roll'; dice: number[] }
  | { t: 'flip'; die: number }
  | { t: 'score'; result: ScoreResult }
  | { t: 'money'; amount: number }
  | { t: 'reroll+'; amount: number }
  | { t: 'shatter'; die: number }
  | { t: 'change'; die: number }
  | { t: 'carve'; die: number; face: number }
  | { t: 'bounty'; id: string }
  | { t: 'won' }
  | { t: 'lost' };
