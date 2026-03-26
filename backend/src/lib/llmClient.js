const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function extractText(payload) {
  const candidates = payload?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return "";
  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) return "";
  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join(" ")
    .trim();
  return text;
}

export class GeminiClient {
  constructor({
    apiKey = process.env.GEMINI_API_KEY || "",
    model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview",
    timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 15000),
  } = {}) {
    this.apiKey = String(apiKey || "").trim();
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  get available() {
    return Boolean(this.apiKey);
  }

  async generateNegotiationReply({
    playerMessage,
    trust,
    personality,
    aiName,
    recentMessages = [],
  }) {
    if (!this.available) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const prompt = [
        "You are an AI opponent in a Split/Steal negotiation game.",
        "Stay in character and respond with plain text only.",
        "Keep response concise (1-3 sentences).",
        "Do not mention being an AI model or policies.",
        "Do not reveal guaranteed final move.",
        `AI name: ${aiName}`,
        `Personality: ${personality}`,
        `Trust score: ${trust}/100`,
        `Recent chat: ${recentMessages.join(" | ") || "[none]"}`,
        `Player said: ${playerMessage}`,
      ].join("\n");

      const url = `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 180,
          },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log(`[Gemini API Error ${response.status}] ${text}`);
        return null;
      }

      const json = await response.json();
      const reply = extractText(json);
      return reply || null;
    } catch (err) {
      const msg = err?.name === "AbortError" ? "Gemini timeout" : String(err?.message || err);
      console.log(`[Gemini Error] ${msg}`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

