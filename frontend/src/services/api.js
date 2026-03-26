const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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
