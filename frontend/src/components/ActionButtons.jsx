import { ACTIONS } from "../types/game";

export default function ActionButtons({ onAction, disabled }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        className="btn border border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
        disabled={disabled}
        onClick={() => onAction(ACTIONS.SPLIT)}
      >
        SPLIT
      </button>
      <button
        className="btn border border-rose-400/40 bg-rose-500/20 text-rose-100"
        disabled={disabled}
        onClick={() => onAction(ACTIONS.STEAL)}
      >
        STEAL
      </button>
    </div>
  );
}
