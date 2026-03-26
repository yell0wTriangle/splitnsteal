import { POWERUPS } from "../types/game";

export default function PowerupPanel({ selected, onSelect, uses }) {
  const list = Object.values(POWERUPS);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {list.map((p) => {
        const used = uses[p.key] || 0;
        const exhausted = used >= p.maxUses;
        const active = selected === p.key;
        return (
          <button
            key={p.key}
            onClick={() => !exhausted && onSelect(p.key)}
            disabled={exhausted}
            className={[
              "rounded-xl border p-3 text-left transition",
              exhausted ? "border-slate-700 bg-slate-900/30 opacity-45" : "border-slate-600 bg-slate-900/40 hover:border-slate-400",
              active ? "ring-2 ring-emerald-400" : "",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-100">{p.name}</p>
              <span className="text-xs text-slate-400">{used}/{p.maxUses}</span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{p.description}</p>
          </button>
        );
      })}
    </div>
  );
}
