import { useState } from 'react';
import { parseImport } from '../utils/csvImport.js';

export default function Importer({ subjects, setSubjects, flashcards, setFlashcards, tests, setTests, onClose }) {
  const [type, setType] = useState('flashcards');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const doImport = () => {
    const { items, errors } = parseImport(text, type);
    if (!items.length) { setResult({ ok: false, errors: errors.length ? errors : ['Nothing was parsed.'] }); return; }
    if (type === 'flashcards') {
      const cards = items.map((it) => ({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8), front: it.front, back: it.back, type: 'custom', createdAt: new Date().toISOString() }));
      setFlashcards([...(Array.isArray(flashcards) ? flashcards : []), ...cards]);
    } else if (type === 'questions') {
      const test = {
        id: Date.now().toString(36),
        title: `Imported bank ${new Date().toLocaleDateString()}`,
        subjectId: '',
        topicId: '',
        questions: items.map((q) => ({ ...q, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8) })),
        createdAt: new Date().toISOString(),
        source: 'import',
      };
      setTests([...(Array.isArray(tests) ? tests : []), test]);
    } else if (type === 'subjects') {
      const merged = [...(Array.isArray(subjects) ? subjects : [])];
      for (const s of items) {
        const ex = merged.find((m) => m.name.toLowerCase() === s.name.toLowerCase());
        if (ex) {
          for (const t of s.topics) {
            if (!ex.topics.some((x) => x.name.toLowerCase() === t.toLowerCase())) {
              ex.topics.push({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8), name: t });
            }
          }
        } else {
          merged.push({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8), name: s.name, topics: s.topics.map((t) => ({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8), name: t })) });
        }
      }
      setSubjects(merged);
    }
    setResult({ ok: true, count: items.length, errors });
    setText('');
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setText(r.result);
    r.readAsText(f);
    e.target.value = '';
  };

  const sample = {
    flashcards: 'front,back\n"Most common cause of right-sided HF","Ischemic heart disease (inferior MI)"',
    questions: 'question,A,B,C,D,correct,explanation\n"Best initial drug in AF with rapid rate","Digoxin","Verapamil","Beta-blocker","Amiodarone","C","Rate control or cardioversion depending on stability"',
    subjects: 'name,topic\nCardiology,Heart Failure\nCardiology,Arrhythmias',
  }[type];

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col p-0! overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold">Bulk importer</h2>
          <button className="btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {[['flashcards', 'Flashcards'], ['questions', 'MCQ questions'], ['subjects', 'Subjects & topics']].map(([id, label]) => (
              <button key={id} onClick={() => { setType(id); setResult(null); }}
                className={`tab-btn ${type === id ? 'active' : ''}`}>{label}</button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Paste JSON/CSV or upload a file</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} placeholder={sample}
              className="w-full font-mono text-xs" />
            <div className="flex items-center gap-2 mt-2">
              <button className="btn-primary btn-sm" onClick={doImport} disabled={!text.trim()}>Import</button>
              <label className="btn-secondary btn-sm cursor-pointer">
                Upload file
                <input type="file" accept=".csv,.json,.txt" onChange={onFile} className="hidden" />
              </label>
              <button className="btn-secondary btn-sm" onClick={() => { setText(sample); setResult(null); }}>Load sample</button>
            </div>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            <p className="font-medium text-slate-400 mb-1">Formats</p>
            <p><b>Flashcards:</b> JSON <code>[{{"front":"Q","back":"A"}}]</code> or CSV <code>front,back</code>.</p>
            <p><b>MCQs:</b> JSON <code>[{{"question":"...","options":[4],"answer":"C","explanation":"..."}}]</code> (answer A-D) or CSV <code>question,A,B,C,D,correct,explanation</code>.</p>
            <p><b>Subjects:</b> JSON <code>[{{"name":"Cardiology","topics":["Heart Failure"]}}]</code> or CSV <code>subject,topic</code>.</p>
          </div>

          {result && (
            <div className={`rounded-xl p-3 text-sm border ${result.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
              {result.ok ? `✓ Imported ${result.count} item${result.count !== 1 ? 's' : ''}.` : 'Import failed.'}
              {result.errors?.length > 0 && (
                <ul className="mt-1 list-disc ml-5 text-xs">
                  {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}