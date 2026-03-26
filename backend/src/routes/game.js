import express from "express";

export function createGameRouter(store) {
  const router = express.Router();

  router.post("/start", (req, res) => {
    const session = store.createGame(req.body || {});
    res.status(201).json({ sessionId: session.id, state: session.state });
  });

  router.get("/:sessionId/state", (req, res) => {
    const session = store.get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    store.touch(session.id);
    return res.json({ sessionId: session.id, state: session.state });
  });

  router.post("/:sessionId/powerup", (req, res) => {
    const key = req.body?.powerupKey ?? null;
    const out = store.applyPowerup(req.params.sessionId, key);
    if (out.error === "not_found") return res.status(404).json({ error: "Session not found" });
    if (out.error === "invalid_powerup") return res.status(400).json({ error: "Invalid powerup" });
    if (out.error === "powerup_exhausted") return res.status(400).json({ error: "Powerup exhausted" });
    if (out.error === "insufficient_funds") return res.status(400).json({ error: "Insufficient funds for this powerup" });
    return res.json({ sessionId: out.session.id, state: out.session.state });
  });

  router.post("/:sessionId/negotiate", async (req, res) => {
    const out = await store.negotiate(req.params.sessionId, req.body?.message);
    if (out.error === "not_found") return res.status(404).json({ error: "Session not found" });
    return res.json({ sessionId: out.session.id, state: out.session.state });
  });

  router.post("/:sessionId/action", (req, res) => {
    const out = store.submitAction(req.params.sessionId, req.body?.action);
    if (out.error === "not_found") return res.status(404).json({ error: "Session not found" });
    if (out.error === "invalid_action") return res.status(400).json({ error: "Invalid action" });
    return res.json({ sessionId: out.session.id, state: out.session.state });
  });

  router.post("/:sessionId/next-round", (req, res) => {
    const out = store.nextRound(req.params.sessionId);
    if (out.error === "not_found") return res.status(404).json({ error: "Session not found" });
    return res.json({ sessionId: out.session.id, state: out.session.state });
  });

  return router;
}
