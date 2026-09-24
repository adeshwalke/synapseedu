import { useState, useEffect } from 'react';
import { SPECIALTIES, SPECIALTY_LABELS, KNOWLEDGE_BASE, PERSONAS } from '../knowledge/knowledgeBase';
import { makeTest, makeNotes, makeFlashcards, diagnoseMistakes, askCopilot, resolveCurriculum } from '../knowledge/aiEngine';
import Md from './Md';

const MODULES = [
  { id: 'tests', label: 'Make Tests', icon: '📝', desc: 'Auto-generate clinical vignette MCQs' },
  { id: 'notes', label: 'Write Notes', icon: '📖', desc: 'Structured lecture guide' },
  { id: 'flash', label: 'Flashcards', icon: '💡', desc: 'High-yield Q&A deck' },
  { id: 'fix', label: 'Fix Mistakes', icon: '🩹', desc: 'Diagnose cognitive traps & remediate' },
  { id: 'ask', label: 'Ask Anything', icon: '💬', desc: 'Interactive medical Q&A' },
];

export default function AiCopilot({
  config,
  setConfig,
  onClose,
  onAddTest,
  onAddTextNote,
  onAddFlashcards,
  lastMistakes,
}) {
  const [module, setModule] = useState('tests');
  const [specialty, setSpecialty] = useState(config?.specialty || 'cardiology');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(3);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState(null);

  const topics = KNOWLEDGE_BASE[specialty]?.topics || [];

  useEffect(() => {
    setTopic('');
    setResult(null);
    setPrompt('');
  }, [module, specialty]);

  const generate = () => {
    if (module === 'tests') {
      const t = makeTest({ specialty, topic, count });
      onAddTest(t);
      setResult({ kind: 'test', test: t });
      setMeta({ label: 'Test generated & added to MCQ Hub', done: true });
      return;
    }
    if (module === 'notes') {
      const content = makeNotes({ specialty, topic, persona: config.persona });
      setResult({ kind: 'notes', content, title: makeNotesTitle(specialty, topic) });
      setMeta({ label: 'Lecture guide ready', done: false });
      return;
    }
    if (module === 'flash') {
      const cards = makeFlashcards({ specialty, topic, count, persona: config.persona });
      setResult({ kind: 'flash', cards });
      setMeta({ label: `${cards.length} flashcards ready`, done: false });
      return;
    }
    if (module === 'fix') {
      const text = diagnoseMistakes(lastMistakes || []);
      setResult({ kind: 'text', text });
      setMeta({ label: 'Mistake diagnosis ready', done: false });
      return;
    }
    if (module === 'ask') {
      setBusy(true);
      askCopilot({
        query: prompt,
        specialty,
        topic,
        persona: config.persona,
        api: config.online ? { key: config.apiKey } : null,
        model: config.model,
      })
        .then((r) => {
          setResult({ kind: 'text', text: r.text, online: r.online });
          setMeta({ label: r.online ? 'Answered via Google Gemini' : 'Answered from offline curriculum', done: false });
        })
        .catch((e) => {
          setResult({ kind: 'text', text: `**Gemini error:** ${e.message}\n\nConnecting an API failed — showing offline results instead.`, online: false });
          setMeta({ label: 'Fell back to offline', done: false });
        })
        .finally(() => setBusy(false));
      return;
    }
  };

  const makeNotesTitle = (sp, tp) => `${resolveCurriculum(sp).label}${tp ? ` — ${tp}` : ''}`;

  const saveNotes = () => {
    if (!result?.content) return;
    const title = window.prompt('Save lecture note as:', makeNotesTitle(specialty, topic)) || makeNotesTitle(specialty, topic);
    onAddTextNote(title, result.content, specialty, topic);
    setMeta({ label: 'Saved to notebook (Lecture notes)', done: true });
  };

  const addCards = () => {
    if (!result?.cards?.length) return;
    onAddFlashcards(result.cards, specialty);
    setMeta({ label: 'Pushed into Revision Hub (due now)', done: true });
  };

  const persona = PERSONAS.find((p) => p.id === config.persona) || PERSONAS[0];
  const aiName = config.name || 'SynapseAI';

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6" onClick={onClose}>
      <div className="card w-full max-w-3xl max-h-[92vh] flex flex-col p-0! overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-emerald-600/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-lg shadow-lg shadow-blue-500/30 relative animate-pulse-slow">
            🧠
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${config.online ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate">{aiName}</h2>
            <p className="text-xs text-slate-400 truncate">
              {persona.label} · {config.online ? 'Gemini online' : 'offline curriculum'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="text-xs py-1.5">
              <option value="general">General</option>
              {SPECIALTIES.map((s) => <option key={s} value={s}>{SPECIALTY_LABELS[s]}</option>)}
            </select>
            <select value={persona.id} onChange={(e) => setConfig({ ...config, persona: e.target.value })} className="text-xs py-1.5">
              {PERSONAS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <button onClick={onClose} className="btn-secondary btn-sm">✕</button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
          {/* module rail */}
          <div className="flex sm:flex-col gap-1 p-2 border-b sm:border-b-0 sm:border-r border-slate-800 overflow-x-auto sm:overflow-visible shrink-0">
            {MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => setModule(m.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm shrink-0 whitespace-nowrap ${
                  module === m.id ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400 hover:bg-slate-800/70'
                }`}
              >
                <span className="mr-1.5">{m.icon}</span>{m.label}
              </button>
            ))}
            {module !== 'fix' && (
              <div className="hidden sm:block mt-auto pt-1 text-[11px] text-slate-500 leading-relaxed">
                {MODULES.find((m) => m.id === module)?.desc}
              </div>
            )}
          </div>

          {/* body */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="p-3 border-b border-slate-800 space-y-2">
              {module !== 'ask' && (
                <div className="flex flex-wrap items-center gap-2">
                  <select value={topic} onChange={(e) => setTopic(e.target.value)} className="text-xs py-1.5 flex-1 min-w-[140px]">
                    <option value="">Any {resolveCurriculum(specialty).label} topic</option>
                    {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {module === 'tests' && (
                    <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="text-xs py-1.5">
                      {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} questions</option>)}
                    </select>
                  )}
                  {module === 'flash' && (
                    <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="text-xs py-1.5">
                      {[3, 4, 6, 8].map((n) => <option key={n} value={n}>{n} cards</option>)}
                    </select>
                  )}
                </div>
              )}
              {module === 'ask' && (
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && prompt.trim() && generate()}
                  placeholder="e.g. Explain why verapamil is dangerous in WPW with AF…"
                  className="w-full"
                />
              )}
              {module === 'fix' && (
                <p className="text-xs text-slate-500">
                  Analyzes the {(lastMistakes || []).length} question{(lastMistakes || []).length !== 1 && 's'} you missed in your most recent test run.
                </p>
              )}
              <div className="flex items-center gap-2">
                <button className="btn-primary btn-sm" onClick={generate} disabled={busy || (module === 'ask' && !prompt.trim())}>
                  {busy ? 'Thinking…' : module === 'ask' ? 'Ask' : 'Generate'}
                </button>
                {meta && <span className="text-xs text-emerald-400">{meta.label}</span>}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              {busy && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  {aiName} is generating…
                </div>
              )}
              {!busy && result?.kind === 'test' && result.test && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-emerald-400">
                    ✓ Added "{result.test.title}" ({result.test.questions.length} Qs) to the MCQ catalog.
                  </p>
                  {result.test.questions.map((q, i) => (
                    <div key={q.id} className="rounded-xl bg-slate-800/60 border border-slate-700 p-3">
                      <p className="text-xs text-slate-400 mb-1">Q{i + 1} · {q.topic || 'clinical vignette'}</p>
                      <p className="text-sm text-slate-200 leading-relaxed">{q.text}</p>
                      <div className="mt-2 space-y-1">
                        {q.options.map((o, oi) => (
                          <p key={oi} className={`text-sm ${oi === q.correctIndex ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
                            {['A', 'B', 'C', 'D'][oi]}. {o}{oi === q.correctIndex ? ' ✓' : ''}
                          </p>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{q.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
              {!busy && result?.kind === 'notes' && (
                <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4"><Md text={result.content} /></div>
              )}
              {!busy && result?.kind === 'flash' && (
                <div className="space-y-2">
                  {result.cards.map((c) => (
                    <div key={c.id} className="rounded-xl bg-slate-800/60 border border-slate-700 p-3">
                      <p className="font-medium text-sm text-blue-300">Q: {c.front}</p>
                      <p className="text-sm text-slate-300 mt-1">A: {c.back}</p>
                    </div>
                  ))}
                </div>
              )}
              {!busy && result?.kind === 'text' && (
                <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4"><Md text={result.text} /></div>
              )}
              {!busy && result?.error && <p className="text-red-400 text-sm">Error: {result.error}</p>}
            </div>

            {/* action buttons */}
            {!busy && meta && !meta.done && (result?.kind === 'notes' || result?.kind === 'flash') && (
              <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/60 flex justify-end gap-2">
                {result.kind === 'notes' && (
                  <button className="btn-success btn-sm" onClick={saveNotes}>💾 Save to My Notes</button>
                )}
                {result.kind === 'flash' && (
                  <button className="btn-success btn-sm" onClick={addCards}>🗂 Add to Revision Hub</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}