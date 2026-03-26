export default function TrustMeter({ trust }) {
  const pct = Math.max(0, Math.min(100, trust));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-300">AI Trust</span>
        <span className="text-sm font-semibold text-slate-100">{pct}/100</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 transition-all duration-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
