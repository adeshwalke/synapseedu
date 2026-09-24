import { useState } from 'react';

const BOX_INTERVALS_DAYS = [1, 2, 4, 8, 16];

// Leitner: new cards start box 1. Easy → next box; Good → same box; Hard → back to box 1.
function schedule(mastery, cardId, rating) {
  const prev = mastery[cardId] || { box: 1, repetition: 0 };
  let box = prev.box || 1;
  if (rating === 'easy') box = Math.min(5, box + 1);
  else if (rating === 'hard') box = 1; // Hard always resets to box 1
  const interval = BOX_INTERVALS_DAYS[box - 1];
  const due = new Date(Date.now() + interval * 86400000).toISOString();
  return {
    [cardId]: {
      box,
      due,
      interval,
      lastRating: rating,
      repetition: (prev.repetition || 0) + 1,
      updatedAt: new Date().toISOString(),
    },
  };
}

export default function FlashcardReviewer({ cards, mastery, setMastery, onDone }) {
  const [queue] = useState(() => [...(cards || [])].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [summary, setSummary] = useState({ hard: 0, medium: 0, easy: 0 });
  const [finished, setFinished] = useState(false);

  const card = queue[idx];
  const boxNow = mastery[card?.id]?.box || 1;

  const rate = (rating) => {
    const merged = { ...mastery, ...schedule(mastery, card.id, rating) };
    setMastery(merged);
    setSummary((s) => ({ ...s, [rating]: s[rating] + 1 }));
    setFlipped(false);
    if (idx + 1 >= queue.length) setFinished(true);
    else setIdx(idx + 1);
  };

  const close = () => {
    if (finished) onDone();
    else if (window.confirm('Leave review session?')) onDone();
  };

  if (queue.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <p className="font-semibold mb-4">Nothing due right now — enjoy the win. 🎉</p>
          <button className="btn-primary" onClick={onDone}>Close</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const total = summary.hard + summary.medium + summary.easy;
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center space-y-5">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold">Session complete!</h2>
          <p className="text-sm text-slate-400">You reviewed {total} card{total !== 1 && 's'} with the Leitner system.</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-red-500/10 border border-red-500/25 py-3">
              <p className="text-2xl font-bold text-red-400">{summary.hard}</p>
              <p className="text-xs text-slate-400">Hard → box 1</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 py-3">
              <p className="text-2xl font-bold text-amber-400">{summary.medium}</p>
              <p className="text-xs text-slate-400">Good → same box</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 py-3">
              <p className="text-2xl font-bold text-emerald-400">{summary.easy}</p>
              <p className="text-xs text-slate-400">Easy → next box</p>
            </div>
          </div>
          <button className="btn-success w-full" onClick={onDone}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <button className="btn-secondary btn-sm" onClick={close}>Exit</button>
          <span className="text-sm text-slate-300 font-medium">
            Card {idx + 1} of {queue.length} · Box {boxNow}
          </span>
          <span className="w-16" />
        </div>

        <div className="h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${(idx / queue.length) * 100}%` }}
          />
        </div>

        {/* Leitner box ladder */}
        <div className="flex items-center gap-1 mb-4 justify-center">
          {BOX_INTERVALS_DAYS.map((d, i) => (
            <div key={d} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                i + 1 <= boxNow
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-500'
              }`}>
                {d}d
              </div>
              {i < 4 && <div className="w-2.5 h-px bg-slate-700" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="[perspective:1200px] cursor-pointer select-none" onClick={() => setFlipped(!flipped)}>
          <div
            className="relative min-h-[280px] transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front */}
            <div className="absolute inset-0 [backface-visibility:hidden] card flex flex-col items-center justify-center text-center p-8 gap-3 border-blue-500/20">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Question</span>
              <p className="text-xl font-semibold leading-relaxed whitespace-pre-wrap">{card.front}</p>
              <span className="text-xs text-blue-400/70 mt-2">Tap to flip</span>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 [backface-visibility:hidden] card flex flex-col items-center justify-center text-center p-8 gap-3 border-emerald-500/20"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500/70">Answer</span>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{card.back}</p>
              {flipped && (
                <span className="text-xs text-slate-500 mt-1">Tap to flip back</span>
              )}
            </div>
          </div>
        </div>

        {/* Rating buttons */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <button
            onClick={() => rate('hard')}
            disabled={!flipped}
            className="rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-300 font-semibold py-3.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            <span className="text-2xl block mb-1">🔴</span>
            Hard
          </button>
          <button
            onClick={() => rate('medium')}
            disabled={!flipped}
            className="rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-semibold py-3.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            <span className="text-2xl block mb-1">🟡</span>
            Good
          </button>
          <button
            onClick={() => rate('easy')}
            disabled={!flipped}
            className="rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-300 font-semibold py-3.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            <span className="text-2xl block mb-1">🟢</span>
            Easy
          </button>
        </div>
        <p className="text-center text-xs text-slate-500 mt-3">
          Leitner intervals: 1 → 2 → 4 → 8 → 16 days. Hard demotes to box 1 · Easy promotes a box.
        </p>
      </div>
    </div>
  );
}