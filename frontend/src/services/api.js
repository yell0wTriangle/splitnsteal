const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 20000);

async function request(path, { method = "GET", body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(`Request timed out after ${Math.round(API_TIMEOUT_MS / 1000)}s`);
    }
    throw new Error("Network error. Please check backend URL/CORS and try again.");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // noop
    }
    throw new Error(message);
  }

  return res.json();
}

export async function apiStartGame(payload) {
  return request("/api/game/start", { method: "POST", body: payload });
}

export async function apiGetState(sessionId) {
  return request(`/api/game/${sessionId}/state`);
}

export async function apiApplyPowerup(sessionId, powerupKey) {
  return request(`/api/game/${sessionId}/powerup`, {
    method: "POST",
    body: { powerupKey: powerupKey ?? null },
  });
}

export async function apiNegotiate(sessionId, message) {
  return request(`/api/game/${sessionId}/negotiate`, {
    method: "POST",
    body: { message },
  });
}

export async function apiSubmitAction(sessionId, action) {
  return request(`/api/game/${sessionId}/action`, {
    method: "POST",
    body: { action },
  });
}

export async function apiNextRound(sessionId) {
  return request(`/api/game/${sessionId}/next-round`, {
    method: "POST",
  });
}
