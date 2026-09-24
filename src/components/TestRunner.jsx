import { useState, useEffect, useRef } from 'react';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function TestRunner({ test, subjects, onFinish, onQuit }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [timeLeft, setTimeLeft] = useState((test.timeLimit || 0) * 60);
  const endedRef = useRef(false);

  const questions = test.questions;
  const q = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const subject = subjects.find((s) => s.id === test.subjectId);

  const finish = (answersSnapshot, withIndex, selectedNow) => {
    if (endedRef.current) return;
    endedRef.current = true;
    const correctCount = questions.reduce((acc, qq, i) => {
      const sel = i === withIndex ? selectedNow : answersSnapshot[qq.id];
      return acc + (sel === qq.correctIndex ? 1 : 0);
    }, 0);
    const missed = questions.filter((qq, i) => {
      const sel = i === withIndex ? selectedNow : answersSnapshot[qq.id];
      return sel !== qq.correctIndex;
    });
    const result = {
      id: Date.now().toString(36),
      testId: test.id,
      testTitle: test.title,
      score: correctCount,
      total,
      bookmarks,
      missedIds: missed.map((qq) => qq.id),
      createdAt: new Date().toISOString(),
    };
    onFinish(result, missed);
  };

  // timer
  useEffect(() => {
    if (!timeLeft || endedRef.current) return;
    if (timeLeft <= 0) {
      finish(answers, index, selected);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const toggleBookmark = () => {
    setBookmarks((b) => (b.includes(q.id) ? b.filter((x) => x !== q.id) : [...b, q.id]));
  };

  const check = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  const next = () => {
    const snapshot = { ...answers, [q.id]: selected };
    setAnswers(snapshot);
    if (isLast) {
      finish(snapshot, index, selected);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setRevealed(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timed = (test.timeLimit || 0) > 0;
  const low = timed && timeLeft <= 60;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onQuit} className="btn-secondary btn-sm">Exit</button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">{test.title}</h1>
          {subject && <p className="text-xs text-emerald-400">{subject.name}</p>}
        </div>
        {timed && (
          <span className={`text-sm font-mono font-bold px-2 py-1 rounded-lg border ${
            low ? 'text-red-400 border-red-500/40 bg-red-500/10' : 'text-slate-300 border-slate-700 bg-slate-800/60'
          }`}>
            ⏱ {mins}:{String(secs).padStart(2, '0')}
          </span>
        )}
        <span className="text-sm text-slate-400">
          {index + 1} / {total}
        </span>
      </div>

      {/* progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${((index + (revealed || selected !== null ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="card space-y-5">
        <div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500/15 text-blue-400 rounded-lg w-8 h-8 flex items-center justify-center font-bold shrink-0">
              {index + 1}
            </span>
            <p className="font-medium leading-relaxed whitespace-pre-wrap flex-1">{q.text}</p>
            <button
              onClick={toggleBookmark}
              className={`shrink-0 p-1.5 rounded-lg border transition-all ${
                bookmarks.includes(q.id)
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-amber-300'
              }`}
              title={bookmarks.includes(q.id) ? 'Remove bookmark' : 'Bookmark question'}
            >
              <svg className="w-4 h-4" fill={bookmarks.includes(q.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt, oi) => {
            const isSelected = selected === oi;
            const isCorrect = oi === q.correctIndex;
            let cls = 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 text-slate-200';
            if (revealed) {
              if (isCorrect) cls = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300';
              else if (isSelected) cls = 'bg-red-500/15 border-red-500/60 text-red-300';
              else cls = 'bg-slate-800/40 border-slate-800 text-slate-500';
            } else if (isSelected) {
              cls = 'bg-blue-500/15 border-blue-500/60 text-blue-300';
            }
            return (
              <button
                key={oi}
                onClick={() => !revealed && setSelected(oi)}
                disabled={revealed}
                className={`w-full flex items-start gap-3 text-left border rounded-xl px-4 py-3 transition-all ${cls}`}
              >
                <span className="font-bold text-sm mt-0.5">{OPTION_LABELS[oi]}.</span>
                <span className="flex-1 text-sm leading-relaxed">{opt}</span>
                {revealed && isCorrect && (
                  <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                )}
                {revealed && isSelected && !isCorrect && (
                  <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className={`rounded-xl p-4 border ${
            selected === q.correctIndex
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <p className={`font-semibold text-sm mb-1.5 ${
              selected === q.correctIndex ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {selected === q.correctIndex ? 'Correct!' : `Incorrect — answer was ${OPTION_LABELS[q.correctIndex]}.`}
            </p>
            {q.explanation && (
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
            )}
            {selected !== q.correctIndex && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Added to your Revision Hub mistakes queue.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          {revealed ? (
            <button className="btn-success w-full" onClick={next} disabled={!!endedRef.current}>
              {isLast ? 'Finish test' : 'Next question'}
            </button>
          ) : (
            <button className="btn-primary w-full" onClick={check} disabled={selected === null || endedRef.current}>
              {selected === null ? 'Select an answer first' : 'Check answer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}