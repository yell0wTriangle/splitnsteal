export const ACTIONS = {
  SPLIT: "SPLIT",
  STEAL: "STEAL",
};

export const DEFAULTS = {
  rounds: 5,
  pot: 100000,
  playerName: "You",
};

export const PERSONALITIES = ["cooperative", "manipulative", "aggressive"];

export const POWERUPS = {
  insurance: {
    key: "insurance",
    name: "Insurance",
    description: "If you SPLIT and AI STEALS, recover $50,000.",
    maxUses: 2,
  },
  trust_boost: {
    key: "trust_boost",
    name: "Trust Boost",
    description: "Instantly boosts AI trust by +20.",
    maxUses: 2,
  },
  punishment: {
    key: "punishment",
    name: "Vindictive Punishment",
    description: "If AI STEALS this round, AI loses $100,000.",
    maxUses: 1,
  },
  serum: {
    key: "serum",
    name: "Truth Serum",
    description: "Reveal AI lean before your decision.",
    maxUses: 2,
  },
  multiplier: {
    key: "multiplier",
    name: "Pot Multiplier",
    description: "Double round pot but reduce trust by 10.",
    maxUses: 2,
  },
};
