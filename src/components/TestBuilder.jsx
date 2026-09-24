import { useState } from 'react';
import { uid } from '../hooks/useLocalStorage';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function TestBuilder({ subjects, initial, onSave, onCancel }) {
  const makeQuestion = () => ({
    id: uid(),
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
  });

  const [title, setTitle] = useState(initial?.title || '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId || '');
  const [topicId, setTopicId] = useState(initial?.topicId || '');
  const [timeLimit, setTimeLimit] = useState(initial?.timeLimit || 0);
  const [questions, setQuestions] = useState(initial?.questions?.length ? initial.questions : [makeQuestion()]);

  const subject = subjects.find((s) => s.id === subjectId);
  const topics = subject?.topics || [];

  const updateQ = (i, patch) => {
    setQuestions(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  };

  const removeQ = (i) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const save = () => {
    const titleTrim = title.trim();
    const cleaned = questions.map((q) => ({
      ...q,
      text: q.text.trim(),
      options: q.options.map((o) => o.trim()),
      explanation: q.explanation.trim(),
    }));
    const valid = cleaned.every(
      (q) => q.text && q.options.every((o) => o) &&
        q.correctIndex >= 0 && q.correctIndex < 4
    );
    if (!titleTrim) { alert('Give the test a title.'); return; }
    if (!valid) { alert('Every question needs text, all four options (A–D), and a correct answer.'); return; }
    onSave({
      id: initial?.id || uid(),
      title: titleTrim,
      subjectId,
      topicId,
      timeLimit: Math.max(0, Number(timeLimit) || 0),
      questions: cleaned,
      createdAt: initial?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="btn-secondary btn-sm">← Back</button>
        <h1 className="text-2xl font-bold">{initial ? 'Edit test' : 'Build a test'}</h1>
      </div>

      <div className="space-y-4">
        <div className="card">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Test title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cardiology Block — Valvular Disease"
            className="w-full"
          />
          <label className="block text-sm font-medium text-slate-300 mb-1.5 mt-3">
            Time limit <span className="text-slate-500 font-normal">(minutes · 0 = untimed exam)</span>
          </label>
          <input
            type="number"
            min="0"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            placeholder="0"
            className="w-32"
          />
        </div>

        <div className="card grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => { setSubjectId(e.target.value); setTopicId(''); }}
              className="w-full"
            >
              <option value="">— Choose subject —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Topic (optional)</label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full"
              disabled={!subjectId}
            >
              <option value="">— Choose topic —</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          {!subjectId && (
            <p className="text-xs text-amber-400/90 sm:col-span-2 -mt-1">
              Tip: create a subject &amp; topic first in the Subjects tab so your notes and flashcards link correctly.
            </p>
          )}
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="card space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-400">Q{qi + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQ(qi)} className="ml-auto btn-danger btn-sm">
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Question</label>
              <textarea
                value={q.text}
                onChange={(e) => updateQ(qi, { text: e.target.value })}
                rows={2}
                placeholder={`A 52-year-old man presents with…\nWhich of the following is the most likely diagnosis?`}
                className="w-full"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {q.options.map((opt, oi) => (
                <div key={oi}>
                  <label className="block text-sm text-slate-400 mb-1">
                    Option {OPTION_LABELS[oi]}
                  </label>
                  <input
                    value={opt}
                    onChange={(e) =>
                      updateQ(qi, { options: q.options.map((o, idx) => (idx === oi ? e.target.value : o)) })
                    }
                    placeholder={`Option ${OPTION_LABELS[oi]}`}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Correct answer
                </label>
                <select
                  value={q.correctIndex}
                  onChange={(e) => updateQ(qi, { correctIndex: Number(e.target.value) })}
                  className="w-full"
                >
                  {OPTION_LABELS.map((lbl, oi) => (
                    <option key={oi} value={oi}>
                      {lbl} — {q.options[oi] || '(empty)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Explanation (shown after answering)
                </label>
                <textarea
                  value={q.explanation}
                  onChange={(e) => updateQ(qi, { explanation: e.target.value })}
                  rows={1}
                  placeholder="Why is this the right answer?"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={() => setQuestions([...questions, makeQuestion()])}>
            + Add question
          </button>
          <div className="flex-1" />
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-success" onClick={save}>
            {initial ? 'Save changes' : 'Save test'}
          </button>
        </div>
      </div>
    </div>
  );
}