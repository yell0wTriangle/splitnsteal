import React, { useState, useEffect, useRef } from "react";

const RoundResult = ({ state, onNext, pending }) => {
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });
  const [dataDump, setDataDump] = useState("");
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

  // Placeholder Data: Player betrays an AI that tried to cooperate
  const r = state?.lastResult;
  const resultData = r
    ? {
        round: r.round,
        pot: r.pot ?? state?.settings?.pot ?? 150000,
        playerChoice: r.playerAction,
        aiChoice: r.aiAction,
        aiName: state?.aiName ?? "VOID_WALKER",
        playerPayout: r.playerReward,
        aiPayout: r.aiReward,
        trustChange: r.trustDelta,
        newTrustLevel: (state?.trust ?? 50) < 30 ? "CRITICAL" : (state?.trust ?? 50) < 70 ? "UNSTABLE" : "STABLE",
      }
    : null;

  if (!resultData) return null;
  const trustIsPositive = resultData.trustChange >= 0;
  const consequenceText = trustIsPositive
    ? `Cooperation signal detected. ${resultData.aiName} trust pathways stabilizing...`
    : `Betrayal detected. ${resultData.aiName} logic pathways updating...`;
  const trustToneClass = trustIsPositive ? "text-[#687d61]" : "text-[#9e342a]";
  const statusBgClass = trustIsPositive ? "bg-[#687d61]" : "bg-[#9e342a]";

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#030303] text-[#1a1a1a] font-mono overflow-x-hidden cursor-crosshair relative pb-10 flex flex-col items-center justify-center selection:bg-fuchsia-500 selection:text-white pt-12 md:pt-4"
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
      <div className="max-w-4xl w-full flex flex-col gap-6 p-4 md:p-8 relative z-10 mt-8">
        {/* HEADER */}
        <div className="flex justify-between items-end border-b-2 border-[#8a8e90]/30 pb-4 glitch-hover">
          <div>
            <span className="mono text-[10px] font-black uppercase tracking-widest text-[#d18a45] glitch-target bg-[#d18a45]/10 px-2 py-0.5 border border-[#d18a45]/30">
              SYS_RESOLUTION
            </span>
            <h1 className="heavy-title text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mt-2 glitch-target">
              CYCLE 0{resultData.round}
            </h1>
          </div>
          <div className="text-right pb-1">
            <span className="mono text-[10px] font-black uppercase text-[#8a8e90]">
              Bounty_Contested
            </span>
            <h2 className="mono text-2xl font-black text-[#d18a45]">
              $CR {resultData.pot.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* VERSUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-center my-4">
          {/* PLAYER CARD */}
          <div
            className={`dystopian-panel rounded-[1.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden glitch-hover ${resultData.playerChoice === "STEAL" ? "bg-[#9e342a]" : "bg-[#687d61]"}`}
          >
            <span className="absolute top-4 left-4 mono text-[10px] font-black uppercase opacity-60 glitch-target">
              USR_01
            </span>
            <span className="mono text-sm font-black uppercase opacity-80 mb-2">
              You Chose
            </span>
            <h2 className="heavy-title text-6xl font-black tracking-tighter uppercase glitch-target text-black">
              {resultData.playerChoice}
            </h2>
            <div className="mt-4 bg-black/20 border-2 border-black px-4 py-2 text-center w-full">
              <span className="mono text-[10px] uppercase font-black opacity-80 block">
                Payout
              </span>
              <span className="mono text-xl font-black">
                ${resultData.playerPayout.toLocaleString()}
              </span>
            </div>
          </div>

          {/* VS SEPARATOR */}
          <div className="flex justify-center items-center py-4 md:py-0 relative z-10">
            <div className="w-16 h-16 rounded-full border-4 border-[#8a8e90] bg-[#030303] flex items-center justify-center transform rotate-12 shadow-[0_0_20px_rgba(0,0,0,1)]">
              <span className="heavy-title text-2xl font-black text-[#8a8e90] uppercase glitch-target italic">
                VS
              </span>
            </div>
          </div>

          {/* AI CARD */}
          <div
            className={`dystopian-panel rounded-[1.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden glitch-hover ${resultData.aiChoice === "STEAL" ? "bg-[#9e342a]" : "bg-[#687d61]"}`}
          >
            <span className="absolute top-4 right-4 mono text-[10px] font-black uppercase opacity-60 glitch-target">
              {resultData.aiName}
            </span>
            <span className="mono text-sm font-black uppercase opacity-80 mb-2">
              AI Chose
            </span>
            <h2 className="heavy-title text-6xl font-black tracking-tighter uppercase glitch-target text-black">
              {resultData.aiChoice}
            </h2>
            <div className="mt-4 bg-black/20 border-2 border-black px-4 py-2 text-center w-full">
              <span className="mono text-[10px] uppercase font-black opacity-80 block">
                Payout
              </span>
              <span className="mono text-xl font-black">
                ${resultData.aiPayout.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* CONSEQUENCE LOG */}
        <div className="bg-[#1a1a1a] border-l-4 border-[#9e342a] p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          {/* Subtle warning stripe background */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #9e342a 0, #9e342a 10px, transparent 10px, transparent 20px)",
            }}
          ></div>

          <div className="relative z-10">
            <h3 className="mono text-sm font-black text-white uppercase mb-1">
              System Consequence
            </h3>
            <p className="mono text-xs font-bold text-[#8a8e90]">
              {consequenceText}
            </p>
          </div>

          <div className="relative z-10 text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-[#8a8e90]/30 pt-3 sm:pt-0">
            <span className="mono text-[10px] font-black uppercase text-[#8a8e90]">
              Trust Adjust
            </span>
            <span className={`mono text-xl font-black ${trustToneClass}`}>
              {resultData.trustChange > 0 ? `+${resultData.trustChange}` : resultData.trustChange}
            </span>
            <span className={`mono text-[9px] font-black text-black px-1 mt-1 animate-pulse ${statusBgClass}`}>
              STATUS: {resultData.newTrustLevel}
            </span>
          </div>
        </div>

        {/* ACTION / CONTINUE */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onNext && onNext()}
            disabled={pending}
            className="interactive-element bg-[#8a8e90] text-black dystopian-panel rounded-xl px-10 py-5 flex items-center justify-center gap-4 relative overflow-hidden glitch-hover"
          >
            <span className="heavy-title text-3xl font-black uppercase tracking-tighter glitch-target">
              INITIATE CYCLE 0{resultData.round + 1}
            </span>
            <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent ml-1"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundResult;
