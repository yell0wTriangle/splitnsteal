const ACTIONS = {
  SPLIT: "SPLIT",
  STEAL: "STEAL",
};

const PERSONALITIES = ["cooperative", "manipulative", "aggressive"];

const POWERUPS = {
  insurance: { maxUses: 2, cost: 25000 },
  trust_boost: { maxUses: 2, cost: 20000 },
  punishment: { maxUses: 1, cost: 45000 },
  serum: { maxUses: 2, cost: 15000 },
  multiplier: { maxUses: 2, cost: 35000 },
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const pick = (items) => items[Math.floor(Math.random() * items.length)];

function choosePersonality() {
  return pick(PERSONALITIES);
}

function getAiOpening({ trust, personality }) {
  if (trust > 70) return pick(["Let us keep this clean and profitable.", "I am open to a fair split this round."]);
  if (trust < 35) return pick(["I need proof, not promises.", "Trust is low, so choose carefully."]);
  if (personality === "aggressive") return pick(["No sloppy plays. Keep this controlled.", "One reckless move and this pot burns."]);
  return pick(["We can still make this a good round.", "Stay predictable and both of us gain."]);
}

function negotiateReply({ message, trust }) {
  const text = String(message || "").toLowerCase();
  let trustDelta = 0;
  let persuasionDelta = 0;
  if (/(split|fair|deal|cooperate|promise)/.test(text)) trustDelta += 2;
  if (/(steal|betray|lie|cheat|take all)/.test(text)) trustDelta -= 3;
  if (/(split|fair|deal|cooperate|promise|trust|both win|together|safe|honest)/.test(text)) {
    persuasionDelta += 6;
  }
  if (/(steal|betray|lie|cheat|take all|threat|greed|screw|crush|dominate)/.test(text)) {
    persuasionDelta -= 7;
  }

  const replies = {
    pos: [
      "That sounds reasonable. Keep that energy at decision time.",
      "Good. Consistency is worth more than big words.",
      "If you stay fair, this stays profitable.",
    ],
    neg: [
      "That kind of line makes me defensive.",
      "You are pushing this toward zero for both of us.",
      "Talk is cheap. Your move will prove it.",
    ],
    neu: [
      "Noted. We still have a clean path here.",
      "I hear you. What matters is what you click next.",
      "Keep it practical and this works out.",
    ],
  };

  const bucket = trustDelta > 0 ? "pos" : trustDelta < 0 ? "neg" : "neu";
  return {
    aiMessage: pick(replies[bucket]),
    trustDelta,
    persuasionDelta,
  };
}

function computeAiStealChance({ trust, personality, round, totalRounds, chatBias = 0 }) {
  // Balanced baseline:
  // trust=50 => ~50% steal chance, high trust lowers it, low trust raises it.
  let stealChance = clamp((100 - trust) / 100, 0.1, 0.9);
  // Positive chatBias lowers steal chance (persuasion working), negative raises it.
  stealChance -= clamp(chatBias, -40, 40) * 0.006;
  if (personality === "aggressive") stealChance += 0.08;
  if (personality === "cooperative") stealChance -= 0.08;
  if (round === totalRounds) stealChance += 0.08;
  return clamp(stealChance, 0.08, 0.92);
}

function computeAiAction({ trust, personality, round, totalRounds, chatBias = 0 }) {
  const baseStealChance = computeAiStealChance({
    trust,
    personality,
    round,
    totalRounds,
    chatBias,
  });

  // Add per-decision randomness so behavior is influenced, not guaranteed.
  const jitter = (Math.random() - 0.5) * 0.16; // +/- 8%
  const finalStealChance = clamp(baseStealChance + jitter, 0.05, 0.95);
  return Math.random() < finalStealChance ? ACTIONS.STEAL : ACTIONS.SPLIT;
}

function resolveRound({ playerAction, aiAction, pot, trust, powerup, playerName, aiName }) {
  let playerReward = 0;
  let aiReward = 0;
  let trustDelta = 0;

  if (playerAction === ACTIONS.SPLIT && aiAction === ACTIONS.SPLIT) {
    playerReward = Math.floor(pot * 0.5);
    aiReward = Math.floor(pot * 0.5);
    trustDelta = 8;
  } else if (playerAction === ACTIONS.SPLIT && aiAction === ACTIONS.STEAL) {
    playerReward = 0;
    aiReward = pot;
    trustDelta = -12;
  } else if (playerAction === ACTIONS.STEAL && aiAction === ACTIONS.SPLIT) {
    playerReward = pot;
    aiReward = 0;
    trustDelta = -6;
  } else {
    playerReward = 0;
    aiReward = 0;
    trustDelta = -10;
  }

  const effects = [];

  if (powerup === "insurance" && playerAction === ACTIONS.SPLIT && aiAction === ACTIONS.STEAL) {
    playerReward += 50000;
    effects.push("Insurance triggered: +$50,000 recovery");
  }

  if (powerup === "punishment" && aiAction === ACTIONS.STEAL) {
    aiReward -= 100000;
    effects.push("Punishment triggered: AI fined $100,000");
  }

  return {
    playerReward,
    aiReward,
    trustAfter: clamp(trust + trustDelta, 0, 100),
    trustDelta,
    outcome: `${playerName} ${playerAction} / ${aiName} ${aiAction}`,
    effects,
  };
}

function isValidPowerup(key) {
  return key === null || key === undefined || Object.prototype.hasOwnProperty.call(POWERUPS, key);
}

function isPowerupUsable(state, key) {
  if (!key) return true;
  if (!POWERUPS[key]) return false;
  const used = state.powerupUses[key] || 0;
  return used < POWERUPS[key].maxUses;
}

export {
  ACTIONS,
  POWERUPS,
  choosePersonality,
  getAiOpening,
  negotiateReply,
  computeAiStealChance,
  computeAiAction,
  resolveRound,
  isValidPowerup,
  isPowerupUsable,
  clamp,
};
