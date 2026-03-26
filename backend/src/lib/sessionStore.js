import { nanoid } from "nanoid";
import {
  ACTIONS,
  POWERUPS,
  choosePersonality,
  computeAiAction,
  computeAiStealChance,
  getAiOpening,
  isPowerupUsable,
  isValidPowerup,
  negotiateReply,
  resolveRound,
  clamp,
} from "./gameRules.js";

const DEFAULTS = { rounds: 5, pot: 100000, playerName: "You" };

function createState({ rounds, pot, playerName }) {
  const personality = choosePersonality();
  const trust = 50;
  const aiName = "AI Opponent";

  return {
    phase: "round",
    pending: false,
    settings: { rounds, pot, playerName },
    round: 1,
    playerScore: 0,
    aiScore: 0,
    trust,
    betrayalCount: 0,
    personality,
    aiName,
    selectedPowerup: null,
    powerupUses: {},
    roundChatBias: 0,
    aiLean: "UNKNOWN",
    aiPlannedAction: null,
    chat: [{ from: aiName, text: getAiOpening({ trust, personality }) }],
    lastResult: null,
    history: [],
  };
}

export class SessionStore {
  constructor({ ttlMs = 60 * 60 * 1000, llmClient = null } = {}) {
    this.ttlMs = ttlMs;
    this.llmClient = llmClient;
    this.sessions = new Map();
  }

  createGame(input = {}) {
    const rounds = clamp(Number(input.rounds) || DEFAULTS.rounds, 1, 12);
    const pot = clamp(Number(input.pot) || DEFAULTS.pot, 0, 1000000);
    const playerName = String(input.playerName || "").trim() || DEFAULTS.playerName;

    const id = nanoid(16);
    const state = createState({ rounds, pot, playerName });
    const now = Date.now();
    this.sessions.set(id, { id, state, createdAt: now, updatedAt: now });
    return this.get(id);
  }

  get(id) {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (Date.now() - session.updatedAt > this.ttlMs) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  touch(id) {
    const session = this.sessions.get(id);
    if (!session) return null;
    session.updatedAt = Date.now();
    return session;
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.updatedAt > this.ttlMs) {
        this.sessions.delete(id);
      }
    }
  }

  applyPowerup(id, key) {
    const session = this.get(id);
    if (!session) return { error: "not_found" };
    if (!isValidPowerup(key)) return { error: "invalid_powerup" };
    if (!isPowerupUsable(session.state, key)) return { error: "powerup_exhausted" };
    if (key && (session.state.playerScore || 0) < (POWERUPS[key]?.cost || 0)) {
      return { error: "insufficient_funds" };
    }

    const state = session.state;
    let trust = state.trust;

    if (key === "trust_boost") trust = clamp(trust + 20, 0, 100);
    if (key === "multiplier") trust = clamp(trust - 10, 0, 100);

    const powerupUses = { ...state.powerupUses };
    if (key) powerupUses[key] = (powerupUses[key] || 0) + 1;
    const nextPlayerScore = key
      ? Math.max(0, state.playerScore - (POWERUPS[key]?.cost || 0))
      : state.playerScore;

    const roundChatBias = 0;
    const aiAction = computeAiAction({
      trust,
      personality: state.personality,
      round: state.round,
      totalRounds: state.settings.rounds,
      chatBias: roundChatBias,
    });
    const stealChance = computeAiStealChance({
      trust,
      personality: state.personality,
      round: state.round,
      totalRounds: state.settings.rounds,
      chatBias: roundChatBias,
    });

    session.state = {
      ...state,
      trust,
      playerScore: nextPlayerScore,
      selectedPowerup: key || null,
      powerupUses,
      roundChatBias,
      aiPlannedAction: aiAction,
      aiLean: stealChance >= 0.5 ? "STEAL_LEAN" : "SPLIT_LEAN",
      phase: "round",
      chat: [{ from: state.aiName, text: getAiOpening({ trust, personality: state.personality }) }],
      lastResult: null,
      pending: false,
    };

    this.touch(id);
    return { session: this.get(id) };
  }

  async negotiate(id, message) {
    const session = this.get(id);
    if (!session) return { error: "not_found" };
    const state = session.state;
    const text = String(message || "").trim();
    if (!text) return { session };

    const { aiMessage, trustDelta, persuasionDelta } = negotiateReply({ message: text, trust: state.trust });
    const llmReply = await this.llmClient?.generateNegotiationReply({
      playerMessage: text,
      trust: state.trust,
      personality: state.personality,
      aiName: state.aiName,
      recentMessages: state.chat.slice(-6).map((m) => `${m.from}: ${m.text}`),
    });
    const finalAiReply = llmReply || aiMessage;

    const nextTrust = clamp(state.trust + trustDelta, 0, 100);
    const nextChatBias = clamp((state.roundChatBias || 0) + persuasionDelta, -40, 40);
    const nextAiAction = computeAiAction({
      trust: nextTrust,
      personality: state.personality,
      round: state.round,
      totalRounds: state.settings.rounds,
      chatBias: nextChatBias,
    });
    const nextStealChance = computeAiStealChance({
      trust: nextTrust,
      personality: state.personality,
      round: state.round,
      totalRounds: state.settings.rounds,
      chatBias: nextChatBias,
    });

    session.state = {
      ...state,
      trust: nextTrust,
      roundChatBias: nextChatBias,
      aiPlannedAction: nextAiAction,
      aiLean: nextStealChance >= 0.5 ? "STEAL_LEAN" : "SPLIT_LEAN",
      chat: [
        ...state.chat,
        { from: state.settings.playerName, text },
        { from: state.aiName, text: finalAiReply },
      ],
      pending: false,
    };

    this.touch(id);
    return { session: this.get(id) };
  }

  submitAction(id, action) {
    const session = this.get(id);
    if (!session) return { error: "not_found" };
    if (![ACTIONS.SPLIT, ACTIONS.STEAL].includes(action)) return { error: "invalid_action" };

    const state = session.state;
    const aiAction = computeAiAction({
      trust: state.trust,
      personality: state.personality,
      round: state.round,
      totalRounds: state.settings.rounds,
      chatBias: state.roundChatBias || 0,
    });

    const effectivePot = state.selectedPowerup === "multiplier"
      ? state.settings.pot * 2
      : state.settings.pot;

    const result = resolveRound({
      playerAction: action,
      aiAction,
      pot: effectivePot,
      trust: state.trust,
      powerup: state.selectedPowerup,
      playerName: state.settings.playerName,
      aiName: state.aiName,
    });

    const row = {
      round: state.round,
      pot: effectivePot,
      playerAction: action,
      aiAction,
      playerReward: result.playerReward,
      aiReward: result.aiReward,
      trustBefore: state.trust,
      trustAfter: result.trustAfter,
      trustDelta: result.trustDelta,
      outcome: result.outcome,
      effects: result.effects,
    };

    session.state = {
      ...state,
      phase: "result",
      playerScore: state.playerScore + result.playerReward,
      aiScore: state.aiScore + result.aiReward,
      trust: result.trustAfter,
      betrayalCount: state.betrayalCount + (action === ACTIONS.STEAL ? 1 : 0),
      roundChatBias: 0,
      aiPlannedAction: null,
      history: [...state.history, row],
      lastResult: row,
      pending: false,
    };

    this.touch(id);
    return { session: this.get(id) };
  }

  nextRound(id) {
    const session = this.get(id);
    if (!session) return { error: "not_found" };

    const state = session.state;
    const isOver = state.round >= state.settings.rounds;

    if (isOver) {
      session.state = {
        ...state,
        phase: "summary",
        selectedPowerup: null,
        chat: [],
      };
      this.touch(id);
      return { session: this.get(id) };
    }

    session.state = {
      ...state,
      round: state.round + 1,
      phase: "powerup",
      selectedPowerup: null,
      chat: [],
      roundChatBias: 0,
      aiLean: "UNKNOWN",
      aiPlannedAction: null,
      lastResult: null,
      pending: false,
    };

    this.touch(id);
    return { session: this.get(id) };
  }

}
