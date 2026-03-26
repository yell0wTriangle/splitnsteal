import React, { useState, useEffect, useRef } from "react";

const POWERUP_CATALOG = [
  {
    id: "OP_GLIMPSE",
    backendKey: "serum",
    title: "SYS.GLIMPSE",
    desc: "Intercept AI logic. Reveals a 50% probability map of their next move.",
    color: "#d18a45",
    cost: 15000,
    hex: "0x0A1",
    maxUses: 2,
  },
  {
    id: "OP_SURGE",
    backendKey: "multiplier",
    title: "POT.SURGE",
    desc: "Inject false funds. Multiplies current round bounty by 2x this cycle.",
    color: "#9e342a",
    cost: 35000,
    hex: "0x0B2",
    maxUses: 2,
  },
  {
    id: "OP_WARD",
    backendKey: "insurance",
    title: "DEF.WARD",
    desc: "If AI steals while you split, you recover +$50,000 this round.",
    color: "#8a8e90",
    cost: 25000,
    hex: "0x0C3",
    maxUses: 2,
  },
  {
    id: "OP_TRUST",
    backendKey: "trust_boost",
    title: "TRUST.BOOST",
    desc: "Instantly increases AI trust by +20 before this round starts.",
    color: "#687d61",
    cost: 20000,
    hex: "0x0D4",
    maxUses: 2,
  },
  {
    id: "OP_PUNISH",
    backendKey: "punishment",
    title: "PUNISH.EXE",
    desc: "If AI steals this round, it is fined $100,000.",
    color: "#c96a30",
    cost: 45000,
    hex: "0x0E5",
    maxUses: 1,
  },
];

const POWERUP_MAP = {
  OP_GLIMPSE: "serum",
  OP_SURGE: "multiplier",
  OP_WARD: "insurance",
  OP_TRUST: "trust_boost",
  OP_PUNISH: "punishment",
};

const PowerUpSelection = ({ state, onContinue, onSkip, pending }) => {
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });
  const [dataDump, setDataDump] = useState("");
  const [selectedPowerup, setSelectedPowerup] = useState(null);
  const [visiblePowerups, setVisiblePowerups] = useState([]);
  const containerRef = useRef(null);

  // Mouse tracking for the "flashlight" grid glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: `${e.clientX}px`, y: `${e.clientY}px` });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const uses = state?.powerupUses || {};
    const shuffled = [...POWERUP_CATALOG].sort(() => Math.random() - 0.5);
    const usable = shuffled.filter((p) => (uses[p.backendKey] || 0) < p.maxUses);
    const exhausted = shuffled.filter((p) => (uses[p.backendKey] || 0) >= p.maxUses);
    const picked = [...usable.slice(0, 3)];
    if (picked.length < 3) {
      picked.push(...exhausted.slice(0, 3 - picked.length));
    }
    setVisiblePowerups(picked);
    setSelectedPowerup(null);
  }, [state?.round, state?.sessionId, state?.powerupUses]);

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
  const gameState = {
    round: state?.round ?? 3,
    pot: state?.settings?.pot ?? 150000,
  };
  const availableCredits = state?.playerScore ?? 0;

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
        .interactive-element:active { transform: scale(0.98); }

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
      <div className="max-w-5xl w-full flex flex-col gap-8 p-4 md:p-8 relative z-10">
        {/* HEADER */}
        <div className="bg-black/80 border-2 border-[#9e342a] p-6 text-center relative overflow-hidden glitch-hover shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#9e342a] animate-pulse"></div>
          <span className="mono text-[10px] font-black uppercase tracking-widest text-[#9e342a] glitch-target block mb-2">
            // ILLEGAL_OPERATION_DETECTED
          </span>
          <h1 className="heavy-title text-4xl md:text-5xl font-black text-white uppercase tracking-tighter glitch-target">
            SELECT OVERRIDE PROTOCOL
          </h1>
          <p className="mono text-xs md:text-sm text-[#8a8e90] mt-2 max-w-lg mx-auto glitch-target">
            You have a brief window to inject corrupted scripts into the matrix
            for Cycle 0{gameState.round}. Choose wisely.
          </p>
          <p className="mono text-[11px] font-black uppercase tracking-widest text-[#d18a45] mt-3">
            AVAILABLE CREDITS: ${availableCredits.toLocaleString("en-US")}
          </p>
          {state?.error ? (
            <p className="mono text-[10px] font-black uppercase tracking-widest text-[#ff6b6b] mt-2">
              {state.error}
            </p>
          ) : null}
        </div>

        {/* POWERUP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visiblePowerups.map((p) => {
            const isSelected = selectedPowerup === p.id;
            const used = state?.powerupUses?.[p.backendKey] || 0;
            const exhausted = used >= p.maxUses;
            const unaffordable = availableCredits < p.cost;
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (!exhausted && !unaffordable) setSelectedPowerup(p.id);
                }}
                disabled={exhausted || unaffordable || pending}
                className={`interactive-element dystopian-panel rounded-[1.5rem] p-6 flex flex-col relative overflow-hidden glitch-hover text-left transition-all duration-300 ${
                  isSelected
                    ? "scale-[1.02] border-4"
                    : "border-4 border-transparent"
                }`}
                style={{
                  backgroundColor: isSelected ? "#000" : p.color,
                  borderColor: isSelected ? p.color : "transparent",
                  color: isSelected ? p.color : "#000",
                  opacity: exhausted || unaffordable ? 0.45 : 1,
                }}
              >
                {/* Header */}
                <div
                  className="flex justify-between items-start mb-8 border-b-2 pb-2"
                  style={{
                    borderColor: isSelected ? p.color : "rgba(0,0,0,0.2)",
                  }}
                >
                  <span className="mono text-[10px] font-black uppercase opacity-60 glitch-target">
                    {p.hex}
                  </span>
                  {isSelected && (
                    <span className="mono text-[10px] font-black uppercase animate-pulse">
                      [EQUIPPED]
                    </span>
                  )}
                  {exhausted && (
                    <span className="mono text-[10px] font-black uppercase animate-pulse">
                      [EXHAUSTED]
                    </span>
                  )}
                  {!exhausted && unaffordable && (
                    <span className="mono text-[10px] font-black uppercase animate-pulse">
                      [INSUFFICIENT]
                    </span>
                  )}
                </div>

                {/* Title & Desc */}
                <div className="flex-grow">
                  <h2 className="heavy-title text-4xl font-black tracking-tighter uppercase glitch-target leading-none mb-4">
                    {p.title.split(".")[0]}.<br />
                    {p.title.split(".")[1]}
                  </h2>
                  <p
                    className={`mono text-xs font-bold leading-relaxed glitch-target ${isSelected ? "opacity-80" : "opacity-70"}`}
                  >
                    {p.desc}
                  </p>
                </div>

                {/* Footer/Cost */}
                <div
                  className="mt-8 pt-4 border-t-2 flex items-center gap-2"
                  style={{
                    borderColor: isSelected ? p.color : "rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    className="w-3 h-3 border-2 flex items-center justify-center"
                    style={{ borderColor: isSelected ? p.color : "#000" }}
                  >
                    <div
                      className={`w-1 h-1 ${isSelected ? "bg-current" : "bg-black"}`}
                    ></div>
                  </div>
                  <span className="mono text-[10px] font-black uppercase tracking-widest glitch-target">
                    COST: ${p.cost.toLocaleString("en-US")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTION FOOTER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <button
            onClick={() => onSkip && onSkip()}
            className="w-full sm:w-auto mono text-xs font-black text-[#8a8e90] uppercase tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
          >
            Skip Injection [Resume Standard Cycle]
          </button>

          <button
            disabled={!selectedPowerup || pending}
            onClick={() => {
              const mapped = POWERUP_MAP[selectedPowerup];
              if (onContinue) onContinue(mapped || null);
            }}
            className={`interactive-element dystopian-panel rounded-xl px-8 py-4 flex items-center justify-center gap-4 relative overflow-hidden glitch-hover transition-all ${
              selectedPowerup
                ? "bg-[#687d61] text-black cursor-pointer"
                : "bg-[#1a1a1a] text-[#8a8e90] cursor-not-allowed border border-[#333]"
            }`}
          >
            <span className="heavy-title text-2xl font-black uppercase tracking-tighter glitch-target">
              EXECUTE OVERRIDE
            </span>
            {selectedPowerup && (
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center bg-black">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-[#687d61] border-b-[4px] border-b-transparent ml-0.5"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerUpSelection;
