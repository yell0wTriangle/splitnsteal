import "dotenv/config";
import express from "express";
import cors from "cors";
import { SessionStore } from "./lib/sessionStore.js";
import { createGameRouter } from "./routes/game.js";
import { GeminiClient } from "./lib/llmClient.js";

const app = express();

const port = Number(process.env.PORT || 8787);
const frontendOriginRaw = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const allowedOrigins = frontendOriginRaw
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowVercelPreviewOrigins = String(process.env.ALLOW_VERCEL_PREVIEW_ORIGINS || "false") === "true";
const ttlMinutes = Number(process.env.SESSION_TTL_MINUTES || 60);

const llmClient = new GeminiClient();
const store = new SessionStore({ ttlMs: ttlMinutes * 60 * 1000, llmClient });

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (allowVercelPreviewOrigins && /^https:\/\/.+\.vercel\.app$/.test(origin)) return cb(null, true);
    return cb(new Error("CORS blocked"));
  },
  credentials: false,
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "split-steal-api",
    gemini: {
      enabled: llmClient.available,
      model: llmClient.model,
    },
  });
});

app.use("/api/game", createGameRouter(store));

app.use((err, _req, res, _next) => {
  if (err?.message === "CORS blocked") {
    return res.status(403).json({ error: "CORS blocked for this origin" });
  }
  return res.status(500).json({ error: "Internal server error" });
});

setInterval(() => {
  store.cleanupExpired();
}, 5 * 60 * 1000).unref();

app.listen(port, () => {
  console.log(`split-steal api running on :${port}`);
});
