import React, { useState, useEffect, useRef } from "react";

import { ACTIONS } from "../types/game";

const GameRound = ({ state, onSubmitAction, onSendMessage }) => {
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });
  const [dataDump, setDataDump] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const containerRef = useRef(null);

  // Mouse tracking for the "flashlight" grid glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: `${e.clientX}px`, y: `${e.clientY}px` });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate background data sludge
  useEffect(() => {
    const chars = "01X_<>[]{}/\\%$#@!ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const generateDump = () => {
      let content = "";
      for (let i = 0; i < 3000; i++) {
        content += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i % 80 === 0) content += " ";
      }
      return content;
    };
    setDataDump(generateDump());

    const interval = setInterval(() => {
      setDataDump((prev) => {
        const index = Math.floor(Math.random() * prev.length);
        return (
          prev.substring(0, index) +
          chars.charAt(Math.floor(Math.random() * chars.length)) +
          prev.substring(index + 1)
        );
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Placeholder Data
  const effectiveRoundPot = state?.selectedPowerup === "multiplier"
    ? (state?.settings?.pot ?? 150000) * 2
    : (state?.settings?.pot ?? 150000);
  const gameState = {
    round: state?.round ?? 3,
    totalRounds: state?.settings?.rounds ?? 5,
    pot: effectiveRoundPot,
    playerScore: state?.playerScore ?? 50000,
    aiScore: state?.aiScore ?? 100000,
    aiName: state?.aiName ?? "VOID_WALKER",
    trustLevel: state?.trust ?? 35,
  };
  const powerupLabelMap = {
    insurance: "DEF.WARD",
    trust_boost: "TRUST.BOOST",
    punishment: "PUNISHMENT",
    serum: "SYS.GLIMPSE",
    multiplier: "POT.SURGE",
  };
  const activePowerup = state?.selectedPowerup || null;
  const activePowerupLabel = activePowerup
    ? powerupLabelMap[activePowerup] || activePowerup.toUpperCase()
    : null;

  const chatMessages = [
    { sender: "SYS", text: "COMM_LINK_ESTABLISHED" },
    ...((state?.chat || []).map((m) => ({ sender: m.from, text: m.text }))),
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#030303] text-[#1a1a1a] font-mono overflow-x-hidden cursor-crosshair relative pb-10 flex items-center justify-center selection:bg-fuchsia-500 selection:text-white pt-12 md:pt-4"
    >
      {/* --- INJECTED GLOBAL STYLES --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800;900&family=Orbitron:wght@800;900&display=swap');
        
        body { margin: 0; background: #030303; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .heavy-title { font-family: 'Orbitron', sans-serif; letter-spacing: -0.05em; }

        .math-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: linear-gradient(rgba(180, 190, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(180, 190, 255, 0.05) 1px, transparent 1px);
          background-size: 15px 15px;
        }

        .data-dump {
          position: fixed; inset: 0; padding: 20px; font-size: 8px;
          color: rgba(180, 190, 255, 0.02); text-transform: uppercase;
          word-break: break-all; z-index: -1; user-select: none; overflow: hidden; line-height: 1;
        }

        .noise-overlay {
          position: fixed; inset: 0; z-index: 100; opacity: 0.12;
          pointer-events: none; mix-blend-mode: overlay;
        }

        .crt-overlay {
          position: fixed; inset: 0; z-index: 110; pointer-events: none; opacity: 0.2;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%);
          background-size: 100% 2px;
        }

        .dystopian-panel {
          border-bottom: 8px solid rgba(0,0,0,0.3);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
        }

        .interactive-element { transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), filter 0.2s; }
        .interactive-element:hover { transform: translateY(-2px); filter: brightness(1.1) contrast(1.1); }
        .interactive-element:active { transform: scale(0.98); filter: invert(1) grayscale(1); }

        .glitch-hover:hover .glitch-target { animation: glitch-vivid 0.3s infinite; }

        @keyframes glitch-vivid {
          0% { transform: translate(0); text-shadow: none; }
          20% { transform: translate(-2px, 1px); text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
          40% { transform: translate(-1px, -1px); text-shadow: -1px 0 #ff00ff, 1px 0 #00ffff; }
          60% { transform: translate(2px, 2px); opacity: 0.8; }
          80% { transform: translate(1px, -2px); text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
          100% { transform: translate(0); }
        }

        /* Trust Bar Segmentation */
        .trust-segment { border-right: 2px solid #000; }
        .trust-segment:last-child { border-right: none; }
      `}</style>

      {/* --- BACKGROUND LAYERS --- */}
      <div className="data-dump mono">{dataDump}</div>
      <div className="math-grid"></div>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 350px at ${mousePos.x} ${mousePos.y}, rgba(255, 200, 230, 0.08), transparent 80%)`,
        }}
      ></div>

      {/* --- FILTERS --- */}
      <svg className="noise-overlay" aria-hidden="true">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
      <div className="crt-overlay"></div>

      {/* --- MAIN APP CONTAINER --- */}
      <div className="max-w-6xl w-full flex flex-col gap-4 p-4 md:p-8 relative z-10 h-full">
        {/* HUD ROW (Top) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Round Indicator */}
          <div className="bg-[#d18a45] dystopian-panel rounded-xl p-4 flex flex-col justify-center relative overflow-hidden glitch-hover">
            <span className="mono text-[10px] font-black uppercase tracking-widest opacity-60 glitch-target">
              Cycle
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="heavy-title text-3xl font-black leading-none glitch-target">
                0{gameState.round}
              </span>
              <span className="mono text-sm font-bold opacity-50">
                / 0{gameState.totalRounds}
              </span>
            </div>
          </div>

          {/* Current Pot */}
          <div className="bg-[#e5b354] dystopian-panel rounded-xl p-4 flex flex-col justify-center relative overflow-hidden glitch-hover">
            <span className="mono text-[10px] font-black uppercase tracking-widest opacity-60 glitch-target">
              Active_Bounty
            </span>
            <span className="heavy-title text-2xl font-black leading-none mt-1 tracking-tighter glitch-target">
              $CR {gameState.pot.toLocaleString()}
            </span>
          </div>

          {/* Scores */}
          <div className="bg-[#8a8e90] dystopian-panel rounded-xl p-3 flex flex-col justify-center relative overflow-hidden border-2 border-black">
            <div className="flex justify-between items-center border-b border-black/20 pb-1 mb-1">
              <span className="mono text-[9px] font-black uppercase opacity-60">
                USR_SCORE
              </span>
              <span className="mono text-sm font-black">
                $CR {(gameState.playerScore / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="mono text-[9px] font-black uppercase opacity-60 text-[#9e342a]">
                AI_SCORE
              </span>
              <span className="mono text-sm font-black text-[#9e342a]">
                $CR {(gameState.aiScore / 1000).toFixed(0)}K
              </span>
            </div>
          </div>

          {/* Trust Meter */}
          <div className="bg-[#030303] border-2 border-[#8a8e90] rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center mb-1">
              <span className="mono text-[9px] font-black uppercase text-[#8a8e90]">
                AI_Trust_Index
              </span>
              <span className="mono text-[9px] font-black text-[#d18a45] animate-pulse">
                WARNING
              </span>
            </div>
            {/* Segmented Bar */}
            <div className="h-4 w-full border border-[#8a8e90] flex p-[1px] gap-[1px]">
              {/* Generate 10 segments */}
              {[...Array(10)].map((_, i) => {
                const isActive = i * 10 < gameState.trustLevel;
                // Color logic: Red (low trust), Orange (med), Green (high)
                let bgColor = "#1a1a1a"; // default inactive
                if (isActive) {
                  if (gameState.trustLevel <= 30) bgColor = "#9e342a";
                  else if (gameState.trustLevel <= 70) bgColor = "#d18a45";
                  else bgColor = "#687d61";
                }
                return (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: bgColor }}
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN SPLIT - CHAT VS ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow min-h-[500px]">
          {/* LEFT: NEGOTIATION TERMINAL */}
          <div className="md:col-span-7 bg-[#8a8e90] dystopian-panel rounded-[1.5rem] p-1 flex flex-col relative overflow-hidden">
            {/* Terminal Window Header */}
            <div className="bg-black text-[#8a8e90] px-4 py-2 rounded-t-[1.3rem] flex justify-between items-center border-b-2 border-black">
              <span className="mono text-[10px] font-black uppercase tracking-widest">
                COMM_LINK // {gameState.aiName}
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#8a8e90] rounded-sm"></div>
                <div className="w-2 h-2 bg-[#8a8e90] rounded-sm opacity-50"></div>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="bg-[#1a1a1a] flex-grow p-6 flex flex-col gap-4 overflow-y-auto relative rounded-b-[1.3rem] border-4 border-t-0 border-[#8a8e90]">
              {/* Scanline specifically for terminal */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`relative z-20 flex flex-col ${msg.sender === "SYS" ? "items-center opacity-50" : "items-start"}`}
                >
                  {msg.sender !== "SYS" && (
                    <span className="mono text-[8px] font-black text-[#d18a45] mb-1 uppercase tracking-widest border border-[#d18a45] px-1">
                      {msg.sender}
                    </span>
                  )}
                  <p
                    className={`mono text-sm md:text-base font-bold leading-relaxed ${msg.sender === "SYS" ? "text-white text-[10px]" : "text-[#8a8e90] border-l-2 border-[#d18a45] pl-3"}`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}

              {/* Blinking cursor */}
              <div className="relative z-20 mt-auto flex items-center gap-2">
                <span className="mono text-xs text-[#8a8e90] animate-pulse">
                  _AWAITING_RESPONSE
                </span>
              </div>

              <div className="relative z-20 mt-3 flex gap-2 border-t border-[#8a8e90]/25 pt-3">
                <input
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder="Transmit negotiation message..."
                  className="w-full border border-[#8a8e90]/40 bg-black/40 px-3 py-2 text-xs text-[#8a8e90] outline-none"
                />
                <button
                  onClick={() => {
                    const text = messageDraft.trim();
                    if (!text || state?.pending) return;
                    setMessageDraft("");
                    if (typeof onSendMessage === "function") onSendMessage(text);
                  }}
                  disabled={state?.pending}
                  className="border border-[#d18a45] bg-[#d18a45]/20 px-3 py-2 text-xs font-black text-[#d18a45] disabled:opacity-40"
                >
                  SEND
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: DECISION MATRIX */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Title / Status */}
            <div className="bg-black/80 border-2 border-black p-4 text-center">
              <h2 className="heavy-title text-2xl font-black text-white uppercase tracking-tighter">
                EXECUTE_DECISION
              </h2>
              <p className="mono text-[10px] font-black text-[#d18a45] mt-1">
                TIME REMAINING: INFINITE
              </p>
              {activePowerup === "serum" ? (
                <p className="mono text-[10px] font-black uppercase tracking-widest text-[#00ffff] mt-2 border border-[#00ffff]/40 bg-[#00ffff]/10 px-2 py-1">
                  TRUTH SERUM REVEAL: {state?.aiLean || "UNKNOWN"}
                </p>
              ) : null}
            </div>

            {/* SPLIT BUTTON */}
            <button
              onClick={() => onSubmitAction && onSubmitAction(ACTIONS.SPLIT)}
              disabled={state?.pending}
              className="flex-1 interactive-element bg-[#687d61] dystopian-panel rounded-[1.5rem] p-6 flex flex-col justify-center items-center relative overflow-hidden glitch-hover group"
            >
              <div className="absolute top-4 left-4 mono text-[10px] font-black opacity-40 uppercase">
                OPT_01
              </div>
              <div className="absolute top-4 right-4 w-4 h-4 border border-black rounded-full group-hover:bg-black transition-colors"></div>

              <h1 className="heavy-title text-6xl md:text-7xl font-black uppercase tracking-tighter glitch-target mb-2 text-black/90">
                SPLIT
              </h1>
              <p className="mono text-xs font-bold uppercase opacity-80 border-t-2 border-black/30 pt-2 glitch-target">
                Cooperate. Share 50%.
              </p>

              {/* Background texture */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 8px)",
                }}
              ></div>
            </button>

            {/* STEAL BUTTON */}
            <button
              onClick={() => onSubmitAction && onSubmitAction(ACTIONS.STEAL)}
              disabled={state?.pending}
              className="flex-1 interactive-element bg-[#9e342a] dystopian-panel rounded-[1.5rem] p-6 flex flex-col justify-center items-center relative overflow-hidden glitch-hover group"
            >
              <div className="absolute top-4 left-4 mono text-[10px] font-black opacity-40 uppercase">
                OPT_02
              </div>
              <div className="absolute top-4 right-4 w-4 h-4 border border-black rounded-sm group-hover:bg-black transition-colors flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-sm opacity-0 group-hover:opacity-100"></div>
              </div>

              <h1 className="heavy-title text-6xl md:text-7xl font-black uppercase tracking-tighter glitch-target mb-2 text-black/90">
                STEAL
              </h1>
              <p className="mono text-xs font-bold uppercase opacity-80 border-t-2 border-black/30 pt-2 glitch-target text-center">
                Betray. Take 100%.
                <br />
                Risk everything.
              </p>
            </button>

            {/* Powerup Placeholder (For next phase) */}
            <div
              className={`bg-[#030303] border-2 rounded-xl p-3 flex justify-center items-center ${
                activePowerup
                  ? "border-[#d18a45]/70"
                  : "border-dashed border-[#8a8e90]/30 opacity-50"
              }`}
            >
              <span
                className={`mono text-[10px] font-black uppercase tracking-widest ${
                  activePowerup ? "text-[#d18a45]" : "text-[#8a8e90]"
                }`}
              >
                {activePowerup ? `ACTIVE_OVERRIDE: ${activePowerupLabel}` : "NO_ACTIVE_OVERRIDES"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRound;
