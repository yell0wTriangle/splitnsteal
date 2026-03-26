import TrustMeter from "./TrustMeter";

const currency = (n) => `$${Number(n || 0).toLocaleString("en-US")}`;

export default function ScoreBoard({ state }) {
  return (
    <section className="glass rounded-2xl p-4 md:p-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Round" value={`${state.round}/${state.settings.rounds}`} />
        <Card label={state.settings.playerName} value={currency(state.playerScore)} />
        <Card label={state.aiName} value={currency(state.aiScore)} />
        <Card label="Pot" value={currency(state.settings.pot)} />
      </div>
      <div className="mt-4">
        <TrustMeter trust={state.trust} />
      </div>
    </section>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-3">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-100 md:text-xl">{value}</p>
    </div>
  );
}
