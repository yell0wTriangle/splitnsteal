import React, { useState, useEffect, useRef } from "react";

const FinalSummary = ({ state, onRestart }) => {
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

  // Placeholder Data: Player dominated the AI via ruthless stealing
  const dynamicVerdict =
    (state?.trust ?? 50) >= 70
      ? "Outcome indicates high cooperative alignment. AI trust metrics stabilized over the simulation."
      : (state?.trust ?? 50) >= 40
        ? "Outcome indicates mixed strategy pressure. AI trust metrics remain adaptive but uncertain."
        : "Outcome indicates high volatility and repeated hostile signaling. AI trust metrics degraded significantly.";

  const summaryData = {
    playerTotal: state?.playerScore ?? 0,
    aiTotal: state?.aiScore ?? 0,
    aiName: state?.aiName ?? "AI Opponent",
    verdict: dynamicVerdict,
    history: (state?.history || []).map((h) => ({
      cycle: h.round,
      p: h.playerAction,
      ai: h.aiAction,
      pot: h.pot ?? state?.settings?.pot ?? 100000,
      pGain: h.playerReward,
      aiGain: h.aiReward,
    })),
  };

  const playerWon = summaryData.playerTotal > summaryData.aiTotal;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#030303] text-[#1a1a1a] font-mono overflow-x-hidden cursor-crosshair relative pb-10 flex flex-col items-center justify-center selection:bg-fuchsia-500 selection:text-white pt-12 md:pt-8"
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
      <div className="max-w-5xl w-full flex flex-col gap-6 p-4 md:p-8 relative z-10">
        {/* HEADER */}
        <div className="bg-black/60 border-2 border-black p-4 flex flex-col md:flex-row justify-between items-center glitch-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#9e342a] border-2 border-black flex items-center justify-center animate-pulse">
              <span className="heavy-title text-2xl font-black text-black">
                !
              </span>
            </div>
            <div>
              <h1 className="heavy-title text-3xl md:text-5xl font-black text-white uppercase tracking-tighter glitch-target">
                SIMULATION TERMINATED
              </h1>
              <span className="mono text-[10px] font-black uppercase tracking-widest text-[#d18a45] glitch-target">
                FINAL_LEDGER_EXPORT_COMPLETE
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 opacity-50">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="glitch-target"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        {/* FINAL SCORE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PLAYER SCORE */}
          <div
            className={`dystopian-panel rounded-[1.5rem] p-8 flex flex-col justify-center relative overflow-hidden glitch-hover ${playerWon ? "bg-[#d18a45]" : "bg-[#8a8e90]"}`}
          >
            <span className="absolute top-4 left-4 mono text-[10px] font-black uppercase opacity-60 glitch-target border border-black/30 px-2">
              USR_01
            </span>
            {playerWon && (
              <span className="absolute top-4 right-4 mono text-xs font-black uppercase animate-pulse">
                VICTORIOUS
              </span>
            )}

            <span className="mono text-sm font-black uppercase opacity-80 mb-1 mt-6">
              Total Extraction
            </span>
            <h2 className="heavy-title text-5xl md:text-7xl font-black tracking-tighter uppercase glitch-target text-black leading-none">
              <span className="text-3xl opacity-50 block mb-1">$CR</span>
              {(summaryData.playerTotal / 1000).toFixed(0)}K
            </h2>
            <div className="mt-4 h-2 w-full bg-black/20">
              <div
                className="h-full bg-black"
                style={{
                  width: playerWon
                    ? "100%"
                    : `${(summaryData.playerTotal / summaryData.aiTotal) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* AI SCORE */}
          <div
            className={`dystopian-panel rounded-[1.5rem] p-8 flex flex-col justify-center relative overflow-hidden glitch-hover ${!playerWon ? "bg-[#d18a45]" : "bg-[#8a8e90]"}`}
          >
            <span className="absolute top-4 right-4 mono text-[10px] font-black uppercase opacity-60 glitch-target border border-black/30 px-2">
              {summaryData.aiName}
            </span>
            {!playerWon && (
              <span className="absolute top-4 left-4 mono text-xs font-black uppercase animate-pulse">
                VICTORIOUS
              </span>
            )}

            <span className="mono text-sm font-black uppercase opacity-80 mb-1 mt-6 text-right">
              Total Extraction
            </span>
            <h2 className="heavy-title text-5xl md:text-7xl font-black tracking-tighter uppercase glitch-target text-black leading-none text-right">
              <span className="text-3xl opacity-50 block mb-1">$CR</span>
              {(summaryData.aiTotal / 1000).toFixed(0)}K
            </h2>
            <div className="mt-4 h-2 w-full bg-black/20 flex justify-end">
              <div
                className="h-full bg-black"
                style={{
                  width: !playerWon
                    ? "100%"
                    : `${(summaryData.aiTotal / summaryData.playerTotal) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* AI VERDICT REPORT */}
          <div className="lg:col-span-5 bg-[#1a1a1a] border-l-8 border-[#9e342a] p-6 relative overflow-hidden glitch-hover dystopian-panel h-full flex flex-col">
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #9e342a 0, #9e342a 10px, transparent 10px, transparent 20px)",
              }}
            ></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="border-b-2 border-[#8a8e90]/30 pb-2 mb-4">
                <span className="mono text-sm font-black text-white uppercase flex justify-between">
                  <span>SYSTEM_VERDICT</span>
                  <span className="text-[#9e342a]">ERROR_0x99</span>
                </span>
              </div>
              <p className="mono text-sm font-bold text-[#8a8e90] leading-relaxed glitch-target flex-grow">
                {summaryData.verdict}
              </p>
              <div className="mt-4 pt-4 border-t border-[#8a8e90]/20 text-right">
                <span className="mono text-[10px] font-black uppercase text-[#9e342a] bg-[#9e342a]/10 px-2 py-1">
                  THREAT_LEVEL: MAXIMUM
                </span>
              </div>
            </div>
          </div>

          {/* CYCLE LEDGER */}
          <div className="lg:col-span-7 bg-[#8a8e90] dystopian-panel p-6 overflow-hidden glitch-hover">
            <h3 className="heavy-title text-3xl font-black uppercase tracking-tighter border-b-4 border-black pb-2 mb-4 glitch-target">
              CYCLE_LEDGER
            </h3>
            <div className="flex flex-col gap-2">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-2 mono text-[10px] font-black uppercase border-b-2 border-black/40 pb-1 px-2 opacity-60">
                <div className="col-span-1">CYC</div>
                <div className="col-span-2 text-center">USR_01</div>
                <div className="col-span-2 text-center">
                  {summaryData.aiName}
                </div>
                <div className="col-span-1 text-right">POT</div>
              </div>

              {/* Rows */}
              {summaryData.history.map((row) => (
                <div
                  key={row.cycle}
                  className="grid grid-cols-6 gap-2 mono text-xs md:text-sm font-bold uppercase bg-black/10 px-2 py-3 border border-black/20 hover:bg-black hover:text-[#d18a45] transition-colors glitch-target"
                >
                  <div className="col-span-1 flex items-center">
                    0{row.cycle}
                  </div>

                  <div className="col-span-2 flex flex-col items-center border-l border-black/20 pl-2">
                    <span
                      className={
                        row.p === "STEAL"
                          ? "px-2 py-0.5 rounded bg-[#5a1611] text-[#ffd7d2] border border-[#2a0806]"
                          : "px-2 py-0.5 rounded bg-[#2e4a2b] text-[#d9f3cd] border border-[#1a2918]"
                      }
                    >
                      {row.p}
                    </span>
                    <span className="text-[10px] opacity-80">
                      ${(row.pGain / 1000).toFixed(0)}K
                    </span>
                  </div>

                  <div className="col-span-2 flex flex-col items-center border-l border-black/20 pl-2">
                    <span
                      className={
                        row.ai === "STEAL"
                          ? "px-2 py-0.5 rounded bg-[#5a1611] text-[#ffd7d2] border border-[#2a0806]"
                          : "px-2 py-0.5 rounded bg-[#2e4a2b] text-[#d9f3cd] border border-[#1a2918]"
                      }
                    >
                      {row.ai}
                    </span>
                    <span className="text-[10px] opacity-80">
                      ${(row.aiGain / 1000).toFixed(0)}K
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center justify-end border-l border-black/20 opacity-60">
                    ${(row.pot / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ACTION / REBOOT */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="mono text-[10px] text-[#8a8e90] uppercase font-bold max-w-sm text-center md:text-left">
            {">"} All localized memory will be wiped upon reboot. Do you wish to
            engage a new neural network?
          </div>
          <button
            onClick={() => onRestart && onRestart()}
            className="interactive-element bg-[#687d61] text-black dystopian-panel rounded-xl px-12 py-6 flex items-center justify-center gap-4 relative overflow-hidden glitch-hover w-full md:w-auto"
          >
            <span className="heavy-title text-4xl font-black uppercase tracking-tighter glitch-target">
              REBOOT_SYS
            </span>
            <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="3"
                strokeLinecap="square"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21v-5h5" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalSummary;
