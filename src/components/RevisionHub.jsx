import { useState } from 'react';
import { useLocalStorage, uid } from '../hooks/useLocalStorage';
import FlashcardReviewer from './FlashcardReviewer';

export default function RevisionHub({ subjects, flashcards, setFlashcards }) {
  const [tab, setTab] = useState('all');
  const [mastery, setMastery] = useLocalStorage('eduhub_mastery', {});
  const [reviewing, setReviewing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');

  const list = Array.isArray(flashcards) ? flashcards : [];
  const mistakes = list.filter((c) => c.type === 'mistake');
  const due = list.filter((c) => !mastery[c.id] || new Date(mastery[c.id].due) <= new Date());

  const stats = {
    dueCount: due.length,
    byBox: [1, 2, 3, 4, 5].map((b) => Object.values(mastery || {}).filter((v) => (v.box || 1) === b).length),
  };

  const addCard = (e) => {
    e.preventDefault();
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) { alert('Both front and back are required.'); return; }
    setFlashcards([
      ...list,
      { id: uid(), front: f, back: b, subjectId, topicId, type: 'custom', createdAt: new Date().toISOString() },
    ]);
    setFront('');
    setBack('');
    setShowForm(false);
  };

  const deleteCard = (id) => {
    if (!window.confirm('Delete this flashcard?')) return;
    setFlashcards(list.filter((c) => c.id !== id));
    const m = { ...mastery };
    delete m[id];
    setMastery(m);
  };

  const dueCards = (
    tab === 'mistakes' ? mistakes : due
  );

  const deckForReview = tab === 'mistakes' ? mistakes : due;

  const subjectNameOf = (card) => subjects.find((s) => s.id === card.subjectId)?.name;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Revision Hub</h1>
          <p className="text-slate-400 text-sm mt-1">
            Flashcards powered by spaced repetition — plus every mistake from your tests, waiting for review.
          </p>
        </div>
        {dueCards.length > 0 && !reviewing && (
          <button className="btn-success" onClick={() => setReviewing(true)}>
            Review {dueCards.length} card{dueCards.length !== 1 && 's'} →
          </button>
        )}
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-2xl font-bold text-blue-400">{list.length}</p>
          <p className="text-xs text-slate-400">Total cards</p>
        </div>
        <div className="card p-4">
          <p className={`text-2xl font-bold ${stats.dueCount ? 'text-emerald-400' : 'text-slate-500'}`}>
            {stats.dueCount}
          </p>
          <p className="text-xs text-slate-400">Due now</p>
        </div>
        <div className="card p-4">
          <p className={`text-2xl font-bold ${mistakes.length ? 'text-red-400' : 'text-slate-500'}`}>
            {mistakes.length}
          </p>
          <p className="text-xs text-slate-400">Auto-captured mistakes</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.byBox[0]}</p>
          <p className="text-xs text-slate-400">Stuck in box 1</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Leitner deck health</p>
        <div className="flex gap-2">
          {[1, 2, 4, 8, 16].map((days, i) => (
            <div key={days} className="flex-1">
              <div className="h-16 bg-slate-800/60 rounded-lg relative overflow-hidden" title={`Box ${i + 1} · every ${days} day${days !== 1 ? 's' : ''}`}>
                <div
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-emerald-500/60 to-emerald-400/20"
                  style={{ height: `${list.length ? Math.max(8, (stats.byBox[i] / Math.max(1, list.length)) * 100) : 8}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-1.5">
                {days}d
                <br />
                <span className="text-slate-400 font-semibold">{stats.byBox[i]}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Hard answers demote a card to box 1 (1 day). Easy answers promote it toward box 5 (16 days).
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          My cards
        </button>
        <button className={`tab-btn ${tab === 'mistakes' ? 'active' : ''}`} onClick={() => setTab('mistakes')}>
          Mistakes queue
          {mistakes.length > 0 && (
            <span className="ml-1.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full px-1.5 py-0.5">
              {mistakes.length}
            </span>
          )}
        </button>
        <div className="flex-1" />
        {tab === 'all' && (
          <button className="btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ New card'}
          </button>
        )}
      </div>

      {tab === 'all' && showForm && (
        <form onSubmit={addCard} className="card space-y-4 mb-5">
          <h3 className="font-semibold text-blue-400">Create flashcard</h3>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Front (concept / question)</label>
            <textarea value={front} onChange={(e) => setFront(e.target.value)} rows={2} className="w-full"
              placeholder="What is the most common cause of right-sided heart failure in the elderly?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Back (answer / high-yield fact)</label>
            <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={2} className="w-full"
              placeholder="Ischemic heart disease — most commonly from inferior MI." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
              <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopicId(''); }} className="w-full">
                <option value="">— None —</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Topic</label>
              <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className="w-full" disabled={!subjectId}>
                <option value="">— None —</option>
                {subjects.find((s) => s.id === subjectId)?.topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-success" type="submit">Save card</button>
        </form>
      )}

      {tab === 'all' && list.length === 0 && (
        <div className="card border-dashed border-2 text-center py-14">
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="text-lg font-semibold mb-2">Your deck is empty</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Create cards with "+ New card" — or take a test; missed questions are added here automatically.
          </p>
        </div>
      )}

      {tab === 'mistakes' && mistakes.length === 0 && (
        <div className="card border-dashed border-2 text-center py-14">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold mb-2">No mistakes to review</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Every question you miss in a test lands here as a flashcard. Keep it clean by reviewing often!
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {(tab === 'all' ? list : mistakes).map((card) => {
          const m = mastery[card.id];
          const boxNow = m?.box || (m && m.repetition ? 1 : 1);
          const isDue = !m || new Date(m.due) <= new Date();
          return (
            <div key={card.id} className="card flex flex-col gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {card.type === 'mistake' ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/25">
                    From test
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
                    Custom
                  </span>
                )}
                {subjectNameOf(card) && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {subjectNameOf(card)}
                  </span>
                )}
                <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/20">
                  box {boxNow}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isDue ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDue ? 'due' : 'reviewed'}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">Q: {card.front}</p>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed whitespace-pre-wrap">A: {card.back}</p>
              </div>

              <div className="flex gap-2 mt-auto">
                <button className="btn-secondary btn-sm flex-1" onClick={() => deleteCard(card.id)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {reviewing && (
        <FlashcardReviewer
          key={deckForReview.map((c) => c.id).join(',')}
          cards={deckForReview}
          mastery={mastery}
          setMastery={setMastery}
          onDone={() => setReviewing(false)}
        />
      )}
    </div>
  );
}