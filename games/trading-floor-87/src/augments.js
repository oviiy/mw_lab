// Augments: between phases the floor freezes and you pick 1 of 3. Each bends the rules.
// Tiers follow the hextech convention: silver < gold < prismatic.

export const TIERS = {
  silver: { name: 'SILVER', color: '#c9d3dc' },
  gold: { name: 'GOLD', color: '#ffc94a' },
  prismatic: { name: 'PRISMATIC', color: '#d98bff' },
};

export const AUGMENTS = [
  // Silver
  { id: 'quick', tier: 'silver', icon: '⏱', name: 'Quick Hands', desc: 'Every shouted deal stays open 1 second longer.', apply: (m) => { m.ttlAdd += 1; } },
  { id: 'cool', tier: 'silver', icon: '❄', name: 'Cool Head', desc: 'Holding contracts heats your tube 30% slower.', apply: (m) => { m.heatMul *= 0.7; } },
  { id: 'cheap', tier: 'silver', icon: '✂', name: 'Floor Membership', desc: 'Exchange fees are halved.', apply: (m) => { m.feeMul *= 0.5; } },
  { id: 'loud', tier: 'silver', icon: '📣', name: 'Loud Voice', desc: 'One more trader shouts at you at a time, and deals arrive 20% faster.', apply: (m) => { m.maxDealsAdd += 1; m.spawnMul *= 0.8; } },
  { id: 'thick', tier: 'silver', icon: '🛡', name: 'Deep Pockets', desc: 'The clerk only closes you out below $50k instead of $100k.', apply: (m) => { m.bust = 50000; } },
  // Gold
  { id: 'fat', tier: 'gold', icon: '✋', name: 'Fat Finger', desc: 'Trade 10 contracts per click. The tube holds 60.', apply: (m) => { m.lot = 10; } },
  { id: 'tape', tier: 'gold', icon: '↗', name: 'Tape Reader', desc: 'Deals that trade WITH the market\'s move get a ↗ badge.', apply: (m) => { m.tape = true; } },
  { id: 'saver', tier: 'gold', icon: '♥', name: 'Second Wind', desc: 'Once per phase, a losing trade does not break your streak.', apply: (m) => { m.saver = 1; } },
  { id: 'hot', tier: 'gold', icon: '🔥', name: 'Hot Hand', desc: 'Streak bonuses pay 60% more.', apply: (m) => { m.bonusMul *= 1.6; } },
  { id: 'radar', tier: 'gold', icon: '💧', name: 'Sweat Radar', desc: 'Desperate traders (★ good prices) shout twice as often.', apply: (m) => { m.takerW *= 2; } },
  { id: 'ice', tier: 'gold', icon: '🧊', name: 'Ice Pack', desc: 'Your tube cools 3× faster when you\'re flat.', apply: (m) => { m.coolMul *= 3; } },
  // Prismatic
  { id: 'parachute', tier: 'prismatic', icon: '🪂', name: 'Golden Parachute', desc: 'Once today, getting closed out resets you to $200k instead of ending your day.', apply: (m) => { m.parachute += 1; } },
  { id: 'whisper', tier: 'prismatic', icon: '👂', name: 'Market Whisperer', desc: 'Every short squeeze is announced 5 seconds before it hits.', apply: (m) => { m.whisper = true; } },
  { id: 'double', tier: 'prismatic', icon: '✦', name: 'Double Down', desc: 'Streak tiers start one trade earlier and every streak bonus is doubled.', apply: (m) => { m.streakStart = 2; m.bonusMul *= 2; } },
  { id: 'touch', tier: 'prismatic', icon: '★', name: 'Golden Touch', desc: 'Every ★ good-price deal you take pays a $750 tip from your clerk.', apply: (m) => { m.tip += 750; } },
];

export function baseMods() {
  return {
    ttlAdd: 0, heatMul: 1, feeMul: 1, maxDealsAdd: 0, spawnMul: 1, bust: 100000,
    lot: 5, tape: false, saver: 0, bonusMul: 1, takerW: 3, coolMul: 1,
    parachute: 0, whisper: false, streakStart: 3, tip: 0,
  };
}

// Rarity odds by pick number (0 = first pick at the morning chop … 4 = freefall).
const ODDS = [[70, 27, 3], [58, 35, 7], [45, 43, 12], [32, 48, 20], [20, 50, 30]];

export function rollOffer(rng, pickIndex, taken) {
  const odds = ODDS[Math.min(pickIndex, ODDS.length - 1)];
  const offer = [];
  for (let guard = 0; offer.length < 3 && guard < 200; guard++) {
    const r = rng.float(0, 100);
    const tier = r < odds[0] ? 'silver' : r < odds[0] + odds[1] ? 'gold' : 'prismatic';
    const pool = AUGMENTS.filter((a) => a.tier === tier && !taken.includes(a.id) && !offer.includes(a));
    if (pool.length) offer.push(rng.pick(pool));
  }
  return offer;
}

// Streak tiers: [minimum streak, name, bonus as a share of the trade's profit].
export function streakTier(n, start = 3) {
  const shift = 3 - start;
  if (n >= 10 - shift) return { level: 3, name: 'LEGEND', rate: 1.0 };
  if (n >= 6 - shift) return { level: 2, name: 'ON FIRE', rate: 0.5 };
  if (n >= 3 - shift) return { level: 1, name: 'HOT', rate: 0.25 };
  return { level: 0, name: '', rate: 0 };
}
