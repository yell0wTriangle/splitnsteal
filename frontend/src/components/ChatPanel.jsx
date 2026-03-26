import { useState } from "react";

export default function ChatPanel({ messages, onSend, disabled }) {
  const [text, setText] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    setText("");
    await onSend(value);
  };

  return (
    <section className="glass rounded-2xl p-4 md:p-5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">Negotiation</h3>
      <div className="max-h-72 min-h-52 space-y-2 overflow-auto rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
        {messages.map((m, idx) => (
          <div key={`${m.from}-${idx}`} className={m.from === "AI Opponent" ? "text-emerald-200" : "text-slate-100"}>
            <span className="font-semibold">{m.from}:</span> <span>{m.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a negotiation message..."
          className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
          disabled={disabled}
        />
        <button className="btn bg-slate-100 px-4 text-slate-900" type="submit" disabled={disabled}>
          Send
        </button>
      </form>
    </section>
  );
}
