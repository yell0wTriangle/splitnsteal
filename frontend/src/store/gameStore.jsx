import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULTS } from "../types/game";
import {
  apiApplyPowerup,
  apiNegotiate,
  apiNextRound,
  apiStartGame,
  apiSubmitAction,
} from "../services/api";

const GameContext = createContext(null);

const initialState = {
  phase: "start",
  pending: false,
  error: "",
  sessionId: null,
  settings: { ...DEFAULTS },
  round: 1,
  playerScore: 0,
  aiScore: 0,
  trust: 50,
  betrayalCount: 0,
  personality: "manipulative",
  aiName: "AI Opponent",
  selectedPowerup: null,
  powerupUses: {},
  aiLean: "UNKNOWN",
  aiPlannedAction: null,
  chat: [],
  lastResult: null,
  history: [],
};

function mergeState(prev, next, sessionId) {
  return {
    ...prev,
    ...next,
    sessionId: sessionId ?? prev.sessionId,
    pending: false,
    error: "",
  };
}

export function GameProvider({ children }) {
  const [state, setState] = useState(initialState);

  const startGame = useCallback(async (form) => {
    setState((prev) => ({ ...prev, pending: true, error: "" }));
    try {
      const rounds = Number(form.rounds) || DEFAULTS.rounds;
      const pot = Number(form.pot) || DEFAULTS.pot;
      const playerName = (form.playerName || "").trim() || DEFAULTS.playerName;

      const res = await apiStartGame({ rounds, pot, playerName });
      setState((prev) => mergeState(prev, res.state, res.sessionId));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        pending: false,
        error: err?.message || "Failed to start game",
      }));
    }
  }, []);

  const pickPowerup = useCallback((key) => {
    setState((prev) => ({ ...prev, selectedPowerup: key || null }));
  }, []);

  const continueWithPowerup = useCallback(async (powerupKey = null) => {
    setState((prev) => ({ ...prev, pending: true, error: "" }));
    try {
      const key = powerupKey === undefined ? (state.selectedPowerup ?? null) : powerupKey;
      const res = await apiApplyPowerup(state.sessionId, key);
      setState((prev) => mergeState(prev, res.state, res.sessionId));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        pending: false,
        error: err?.message || "Failed to apply powerup",
      }));
    }
  }, [state.selectedPowerup, state.sessionId]);

  const skipPowerup = useCallback(async () => {
    await continueWithPowerup(null);
  }, [continueWithPowerup]);

  const sendMessage = useCallback(async (text) => {
    const cleaned = (text || "").trim();
    if (!cleaned || !state.sessionId) return;

    setState((prev) => ({ ...prev, pending: true, error: "" }));
    try {
      const res = await apiNegotiate(state.sessionId, cleaned);
      setState((prev) => mergeState(prev, res.state, res.sessionId));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        pending: false,
        error: err?.message || "Failed to send message",
      }));
    }
  }, [state.sessionId]);

  const submitAction = useCallback(async (playerAction) => {
    if (!state.sessionId) return;
    setState((prev) => ({ ...prev, pending: true, error: "" }));
    try {
      const res = await apiSubmitAction(state.sessionId, playerAction);
      setState((prev) => mergeState(prev, res.state, res.sessionId));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        pending: false,
        error: err?.message || "Failed to submit action",
      }));
    }
  }, [state.sessionId]);

  const nextRound = useCallback(async () => {
    if (!state.sessionId) return;
    setState((prev) => ({ ...prev, pending: true, error: "" }));
    try {
      const res = await apiNextRound(state.sessionId);
      setState((prev) => mergeState(prev, res.state, res.sessionId));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        pending: false,
        error: err?.message || "Failed to move to next round",
      }));
    }
  }, [state.sessionId]);

  const restart = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo(() => ({
    state,
    startGame,
    pickPowerup,
    skipPowerup,
    continueWithPowerup,
    sendMessage,
    submitAction,
    nextRound,
    restart,
  }), [
    state,
    startGame,
    pickPowerup,
    skipPowerup,
    continueWithPowerup,
    sendMessage,
    submitAction,
    nextRound,
    restart,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
