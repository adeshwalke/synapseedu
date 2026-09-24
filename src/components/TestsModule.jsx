import { useState } from 'react';
import { uid } from '../hooks/useLocalStorage';
import TestRunner from './TestRunner';
import TestBuilder from './TestBuilder';
import Importer from './Importer';

export default function TestsModule({ subjects, setSubjects, tests, setTests, testResults, setTestResults, flashcards, setFlashcards }) {
  const [mode, setMode] = useState('list'); // list | builder | runner
  const [editingTest, setEditingTest] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const list = Array.isArray(tests) ? tests : [];

  const startTest = (test) => {
    setActiveTest(test);
    setMode('runner');
  };

  const onFinish = (result, mistakes) => {
    setTestResults([...Array.isArray(testResults) ? testResults : [], result]);
    // persist bookmark flags back onto the test's questions
    if (result.bookmarks?.length) {
      setTests(list.map((t) =>
        t.id === activeTest.id
          ? { ...t, questions: t.questions.map((q) => ({ ...q, bookmarked: result.bookmarks.includes(q.id) })) }
          : t
      ));
    }
    if (mistakes.length) {
      const existing = Array.isArray(flashcards) ? flashcards : [];
      const fresh = [];
      for (const q of mistakes) {
        const dup = existing.some((f) => f.sourceQuestionId === q.id) ||
                    fresh.some((f) => f.sourceQuestionId === q.id);
        if (!dup) fresh.push({
          id: uid(),
          front: q.text,
          back: `Correct answer: ${q.options[q.correctIndex]}\n\n${q.explanation || 'No explanation provided.'}`,
          subjectId: activeTest.subjectId,
          topicId: activeTest.topicId,
          type: 'mistake',
          sourceTestId: activeTest.id,
          sourceQuestionId: q.id,
          createdAt: new Date().toISOString(),
        });
      }
      if (fresh.length) setFlashcards([...existing, ...fresh]);
    }
    setMode('list');
  };

  const filtered = list.filter((test) => {
    if (subjectFilter && test.subjectId !== subjectFilter) return false;
    if (bookmarkedOnly && !test.questions.some((q) => q.bookmarked)) return false;
    if (search && !test.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      {mode === 'list' && (
        <>
          <header className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Tests</h1>
              <p className="text-slate-400 text-sm mt-1">
                Build MCQs, practice anywhere, and let missed questions flow into your Revision Hub.
              </p>
            </div>
            <button className="btn-secondary" onClick={() => setShowImporter(true)}>
              Import
            </button>
            <button className="btn-primary" onClick={() => setMode('builder')}>
              + New test
            </button>
          </header>

          {list.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests…"
                className="flex-1 min-w-40"
              />
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-auto">
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={() => setBookmarkedOnly((b) => !b)}
                className={`btn-sm border rounded-lg transition-all ${
                  bookmarkedOnly
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'border-slate-700 text-slate-400 hover:text-amber-300'
                }`}
              >
                ⭐ Bookmarked
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="card border-dashed border-2 text-center py-16">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">{list.length === 0 ? 'No tests yet' : 'No matching tests'}</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                {list.length === 0
                  ? 'Create a test for a subject and topic, add your questions, then run it to see instant feedback. Or import a question bank as CSV/JSON.'
                  : 'Adjust your filters, or press “Import” to bulk-load a question bank.'}
              </p>
              {list.length === 0 && (
                <button className="btn-primary mt-4" onClick={() => setMode('builder')}>
                  Build a test
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((test) => {
                const subject = subjects.find((s) => s.id === test.subjectId);
                const topic = subject?.topics.find((t) => t.id === test.topicId);
                const attempts = (Array.isArray(testResults) ? testResults : []).filter(
                  (r) => r.testId === test.id
                );
                const best = attempts.length
                  ? Math.max(...attempts.map((a) => (a.score / a.total) * 100))
                  : null;
                const bookmarked = test.questions.filter((q) => q.bookmarked).length;
                return (
                  <div key={test.id} className="card flex flex-col gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {subject?.name || 'Unlinked'}
                        </span>
                        {topic && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {topic.name}
                          </span>
                        )}
                        {test.timeLimit > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            ⏱ {test.timeLimit} min
                          </span>
                        )}
                        {bookmarked > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ⭐ {bookmarked}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold leading-snug">{test.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {test.questions.length} question{test.questions.length !== 1 && 's'}
                        {attempts.length > 0 &&
                          ` · best ${best.toFixed(0)}% · ${attempts.length} attempt${attempts.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-success btn-sm flex-1" onClick={() => startTest(test)}>
                        Start test
                      </button>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => { setEditingTest(test); setMode('builder'); }}
                        title="Edit test"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          if (window.confirm(`Delete test "${test.title}"?`)) {
                            setTests(list.filter((t) => t.id !== test.id));
                          }
                        }}
                        title="Delete test"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {mode === 'builder' && (
        <TestBuilder
          subjects={subjects}
          initial={editingTest}
          onCancel={() => { setMode('list'); setEditingTest(null); }}
          onSave={(test) => {
            const exists = list.some((t) => t.id === test.id);
            if (exists) setTests(list.map((t) => (t.id === test.id ? test : t)));
            else setTests([...list, test]);
            setMode('list');
            setEditingTest(null);
          }}
        />
      )}

      {mode === 'runner' && activeTest && (
        <TestRunner
          test={activeTest}
          subjects={subjects}
          onFinish={onFinish}
          onQuit={() => setMode('list')}
        />
      )}

      {showImporter && (
        <Importer
          subjects={subjects}
          setSubjects={setSubjects}
          flashcards={flashcards}
          setFlashcards={setFlashcards}
          tests={tests}
          setTests={setTests}
          onClose={() => setShowImporter(false)}
        />
      )}
    </div>
  );
}