import React, { useState, useEffect, useRef } from "react";

const StartPage = ({ onStart, pending, error }) => {
  const [playerName, setPlayerName] = useState("");
  const [rounds, setRounds] = useState("5");
  const [pot, setPot] = useState("100000");
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

  const handleRandomize = () => {
    setRounds(String(Math.floor(Math.random() * 10) + 3)); // 3 to 12 rounds
    setPot(String(Math.floor(Math.random() * 20) * 50000 + 50000)); // Randomized up to 1,000,000

    // Fake player names for flavor
    const aliases = ["GHOST_99", "N30", "CIPHER", "MUTE", "VOID_WALKER"];
    setPlayerName(aliases[Math.floor(Math.random() * aliases.length)]);
  };

  const handleStart = () => {
    const parsedRounds = Math.min(12, Math.max(1, parseInt(rounds, 10) || 1));
    const parsedPot = Math.min(1000000, Math.max(0, parseInt(pot, 10) || 0));
    setRounds(String(parsedRounds));
    setPot(String(parsedPot));
    onStart && onStart({ playerName, rounds: parsedRounds, pot: parsedPot });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#030303] text-[#1a1a1a] font-mono overflow-x-hidden cursor-crosshair relative pb-10 flex items-center justify-center selection:bg-fuchsia-500 selection:text-white"
    >
      {/* --- INJECTED GLOBAL STYLES FOR DYSTOPIAN EFFECTS --- */}
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

        .interactive-element {
          transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), filter 0.2s;
        }
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

        /* Custom Input Styling */
        input[type="text"], input[type="number"] {
          background: rgba(0,0,0,0.1); border: 2px solid #1a1a1a; outline: none; transition: all 0.2s; color: #1a1a1a; caret-color: #1a1a1a;
        }
        input[type="text"]:focus, input[type="number"]:focus {
          background: #000; color: #d18a45; caret-color: #d18a45; border-color: #d18a45;
        }
        input[type="text"]::placeholder, input[type="number"]::placeholder {
          color: rgba(26, 26, 26, 0.5);
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
          opacity: 1;
          width: 1.2rem;
          height: 2.25rem;
          background:
            linear-gradient(45deg, transparent 50%, #d18a45 50%) top 40% center/8px 8px no-repeat,
            linear-gradient(135deg, #d18a45 50%, transparent 50%) top 40% center/8px 8px no-repeat,
            linear-gradient(225deg, transparent 50%, #d18a45 50%) bottom 35% center/8px 8px no-repeat,
            linear-gradient(315deg, #d18a45 50%, transparent 50%) bottom 35% center/8px 8px no-repeat,
            #111;
          border-left: 2px solid #d18a45;
          cursor: pointer;
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
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-8 relative z-10 pt-12 md:pt-0">
        {/* PANEL 1: TITLE & RULES (Left/Top) */}
        <div className="md:col-span-5 bg-[#9e342a] dystopian-panel rounded-[1.5rem] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden glitch-hover">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="mono text-lg font-black border-2 border-black px-2 bg-black text-[#9e342a] uppercase tracking-widest glitch-target">
                SYS_PROTOCOL
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-right opacity-80 glitch-target">
                P-DILEMMA
                <br />
                v.1.0
              </span>
            </div>

            <h1 className="heavy-title text-6xl md:text-7xl font-black leading-[0.85] tracking-tighter uppercase mb-4 glitch-target">
              Split
              <br />& Steal
            </h1>
            <p className="mono text-xs md:text-sm font-bold opacity-80 mb-8 max-w-sm glitch-target border-l-4 border-black pl-3 py-1">
              "A Prisoner’s Dilemma game against an adaptive AI. Trust is a
              liability."
            </p>
          </div>

          {/* Payoff Matrix */}
          <div className="bg-black/10 border-2 border-black p-4 mt-4 relative z-10">
            <h3 className="mono text-xs font-black uppercase mb-3 border-b-2 border-black pb-1 glitch-target flex justify-between">
              <span>Payoff_Matrix</span>
              <span className="opacity-50">REF:0x1A</span>
            </h3>

            <div className="grid grid-cols-3 gap-[2px] bg-black border-2 border-black font-mono text-[9px] md:text-[10px] font-bold text-center">
              {/* Header */}
              <div className="bg-[#9e342a] p-1.5 md:p-2 flex items-center justify-center">
                YOU \ AI
              </div>
              <div className="bg-[#9e342a] p-1.5 md:p-2 flex items-center justify-center glitch-target">
                SPLIT
              </div>
              <div className="bg-[#9e342a] p-1.5 md:p-2 flex items-center justify-center glitch-target">
                STEAL
              </div>

              {/* Row 1 */}
              <div className="bg-[#9e342a] p-1.5 md:p-2 flex items-center justify-center glitch-target">
                SPLIT
              </div>
              <div className="bg-[#9e342a] p-2 flex flex-col items-center justify-center glitch-target">
                <span>50%</span>
                <span className="opacity-50 border-t border-black/30 w-full mt-0.5 pt-0.5">
                  50%
                </span>
              </div>
              <div className="bg-[#9e342a] p-2 flex flex-col items-center justify-center glitch-target text-black/40">
                <span className="text-black">0%</span>
                <span className="opacity-50 border-t border-black/30 w-full mt-0.5 pt-0.5 text-[#ff00ff]">
                  100%
                </span>
              </div>

              {/* Row 2 */}
              <div className="bg-[#9e342a] p-1.5 md:p-2 flex items-center justify-center glitch-target">
                STEAL
              </div>
              <div className="bg-[#9e342a] p-2 flex flex-col items-center justify-center glitch-target text-[#00ffff]">
                <span>100%</span>
                <span className="opacity-50 border-t border-black/30 w-full mt-0.5 pt-0.5 text-black">
                  0%
                </span>
              </div>
              <div className="bg-[#9e342a] p-2 flex flex-col items-center justify-center glitch-target opacity-50">
                <span>0%</span>
                <span className="opacity-50 border-t border-black/30 w-full mt-0.5 pt-0.5">
                  0%
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-[-10%] opacity-10 pointer-events-none transform -rotate-12 translate-y-1/4">
            <h1 className="heavy-title text-9xl">DILEMMA</h1>
          </div>
        </div>

        {/* PANEL 2: CONFIGURATION & ACTIONS (Right/Bottom) */}
        <div className="md:col-span-7 grid grid-rows-12 gap-6">
          {/* Settings Card */}
          <div className="row-span-8 bg-[#d18a45] dystopian-panel rounded-[1.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden glitch-hover">
            <div className="flex justify-between items-start mb-6 border-b-2 border-black/20 pb-4">
              <h2 className="heavy-title text-4xl md:text-5xl font-black uppercase tracking-tighter mix-blend-multiply opacity-90 glitch-target">
                CONFIG_
              </h2>
              <div className="border-2 border-black p-1 rotate-6 opacity-60">
                <span className="border border-black px-2 py-0.5 mono text-[10px] font-black uppercase">
                  AWAITING_INPUT
                </span>
              </div>
            </div>

            <div className="flex-grow flex flex-col gap-6 justify-center max-w-md w-full mx-auto">
              {/* Input: Player Name */}
              <div className="flex flex-col gap-1 relative group">
                <label className="mono text-[10px] font-black uppercase tracking-widest glitch-target opacity-70">
                  Target_Alias [Opt]
                </label>
                <div className="flex items-center">
                  <span className="bg-black text-[#d18a45] px-3 py-3 mono font-black border-2 border-r-0 border-black">
                    ID:
                  </span>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) =>
                      setPlayerName(e.target.value.toUpperCase())
                    }
                    placeholder="ENTER_NAME"
                    className="w-full px-4 py-3 mono font-bold uppercase text-xl placeholder-black/30 focus:text-[#d18a45]"
                  />
                </div>
              </div>

              {/* Input: Rounds */}
              <div className="flex flex-col gap-1 relative group">
                <label className="mono text-[10px] font-black uppercase tracking-widest glitch-target opacity-70">
                  Execution_Cycles
                </label>
                <div className="flex items-center">
                  <span className="bg-black text-[#d18a45] px-3 py-3 mono font-black border-2 border-r-0 border-black">
                    CYC
                  </span>
                  <input
                    type="number"
                    value={rounds}
                    onChange={(e) =>
                      setRounds(e.target.value)
                    }
                    onBlur={() =>
                      setRounds((prev) => {
                        const parsed = Math.min(12, Math.max(1, parseInt(prev, 10) || 1));
                        return String(parsed);
                      })
                    }
                    min="1"
                    max="12"
                    className="w-full px-4 py-3 mono font-bold text-xl focus:text-[#d18a45]"
                  />
                </div>
              </div>

              {/* Input: Pot */}
              <div className="flex flex-col gap-1 relative group">
                <label className="mono text-[10px] font-black uppercase tracking-widest glitch-target opacity-70">
                  Bounty_Per_Cycle (Cr)
                </label>
                <div className="flex items-center">
                  <span className="bg-black text-[#d18a45] px-3 py-3 mono font-black border-2 border-r-0 border-black">
                    $CR
                  </span>
                  <input
                    type="number"
                    value={pot}
                    onChange={(e) =>
                      setPot(e.target.value)
                    }
                    onBlur={() =>
                      setPot((prev) => {
                        const parsed = Math.min(1000000, Math.max(0, parseInt(prev, 10) || 0));
                        return String(parsed);
                      })
                    }
                    min="0"
                    max="1000000"
                    step="1000"
                    className="w-full px-4 py-3 mono font-bold text-xl focus:text-[#d18a45]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="row-span-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Randomize Button */}
            <button
              onClick={handleRandomize}
              className="interactive-element bg-[#8a8e90] dystopian-panel rounded-[1.5rem] p-6 flex flex-col justify-between items-start text-left relative overflow-hidden glitch-hover"
            >
              <div className="mono text-[10px] font-black opacity-40 uppercase tracking-widest flex justify-between w-full">
                <span>Function_Call</span>
                <span>0xRND</span>
              </div>
              <div className="mt-4">
                <span className="heavy-title text-3xl font-black leading-none uppercase tracking-tighter glitch-target inline-block">
                  RND_CFG
                </span>
                <p className="mono text-[9px] font-bold mt-2 opacity-60 uppercase">
                  Inject chaotic variables
                </p>
              </div>
            </button>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={pending}
              className="interactive-element bg-[#687d61] dystopian-panel rounded-[1.5rem] p-6 flex flex-col justify-between items-end text-right relative overflow-hidden glitch-hover group"
            >
              <div className="mono text-[10px] font-black opacity-50 uppercase tracking-widest flex justify-between w-full border-b-2 border-black/20 pb-2">
                <span className="animate-pulse text-black">READY</span>
                <span>SEQ_00</span>
              </div>
              <div className="mt-4 flex flex-col items-end">
                <span className="heavy-title text-4xl md:text-5xl font-black leading-none uppercase tracking-tighter glitch-target group-hover:text-white transition-colors">
                  INITIATE
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="mono text-[10px] font-bold uppercase border border-black px-1">
                    Connect
                  </span>
                  <div className="w-8 h-8 border-2 border-black flex items-center justify-center bg-black group-hover:bg-white transition-colors">
                    <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-[#687d61] border-b-4 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            </button>
          </div>
          {error ? (
            <div className="mt-2 border-2 border-[#9e342a] bg-black/50 px-4 py-3 mono text-xs font-black uppercase tracking-wide text-[#ff7a6f]">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StartPage;
