import { useState } from 'react';
import { uid } from '../hooks/useLocalStorage';

export default function SubjectsManager({ subjects, setSubjects }) {
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [expanded, setExpanded] = useState({});

  const addSubject = (e) => {
    e.preventDefault();
    const name = newSubject.trim();
    if (!name || subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSubjects([...subjects, { id: uid(), name, topics: [] }]);
    setNewSubject('');
  };

  const renameSubject = (id, oldName) => {
    const nextName = window.prompt('Rename subject:', oldName)?.trim();
    if (!nextName) return;
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, name: nextName } : s)));
  };

  const deleteSubject = (id) => {
    const subject = subjects.find((s) => s.id === id);
    if (!window.confirm(`Delete subject "${subject.name}" and all its topics?`)) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const addTopic = (subjectId) => {
    const name = newTopic.trim();
    if (!name) return;
    setSubjects(subjects.map((s) =>
      s.id === subjectId
        ? { ...s, topics: [...s.topics, { id: uid(), name }] }
        : s
    ));
    setNewTopic('');
  };

  const renameTopic = (sid, tid, oldName) => {
    const nextName = window.prompt('Rename topic:', oldName)?.trim();
    if (!nextName) return;
    setSubjects(subjects.map((s) =>
      s.id === sid
        ? { ...s, topics: s.topics.map((t) => (t.id === tid ? { ...t, name: nextName } : t)) }
        : s
    ));
  };

  const deleteTopic = (sid, tid, tname) => {
    if (!window.confirm(`Delete topic "${tname}"?`)) return;
    setSubjects(subjects.map((s) =>
      s.id === sid ? { ...s, topics: s.topics.filter((t) => t.id !== tid) } : s
    ));
  };

  const countTotalTopics = () => subjects.reduce((n, s) => n + s.topics.length, 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Subjects &amp; Topics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Your academic building blocks — everything else links here.
        </p>
      </header>

      <form onSubmit={addSubject} className="card flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Add a new subject… e.g. Cardiology"
          className="flex-1"
        />
        <button type="submit" className="btn-primary">Add Subject</button>
      </form>

      {subjects.length === 0 ? (
        <div className="card border-dashed border-2 text-center py-16">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Create your first subject above — then add topics like{" "}
            <em>Heart Failure</em> or <em>Antibiotic Classes</em> underneath it.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">
              {subjects.length} subject{subjects.length !== 1 && 's'} ·{' '}
              {countTotalTopics()} topic{countTotalTopics() !== 1 && 's'}
            </p>
          </div>

          <div className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="card">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpanded({ ...expanded, [subject.id]: !expanded[subject.id] })}
                    className="text-slate-400 hover:text-slate-200 shrink-0"
                    title={expanded[subject.id] ? 'Collapse' : 'Expand'}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${expanded[subject.id] ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-lg">{subject.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <h2 className="font-semibold flex-1 truncate">{subject.name}</h2>
                  <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-2.5 py-1">
                    {subject.topics.length} topic{subject.topics.length !== 1 && 's'}
                  </span>
                  <button
                    onClick={() => renameSubject(subject.id, subject.name)}
                    className="text-slate-500 hover:text-blue-400 p-2"
                    title="Rename subject"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteSubject(subject.id)}
                    className="text-slate-500 hover:text-red-400 p-2"
                    title="Delete subject"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {expanded[subject.id] && (
                  <div className="mt-4 pl-7">
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <input
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTopic(subject.id)}
                        placeholder={`Add topic to ${subject.name}…`}
                        className="flex-1 text-sm"
                      />
                      <button className="btn-secondary btn-sm" onClick={() => addTopic(subject.id)}>
                        Add topic
                      </button>
                    </div>

                    {subject.topics.length === 0 && (
                      <p className="text-slate-500 text-sm py-2 italic">
                        No topics yet — add one above.
                      </p>
                    )}

                    <ul className="space-y-2">
                      {subject.topics.map((topic) => (
                        <li
                          key={topic.id}
                          className="group flex items-center gap-2 bg-slate-800/50 border border-slate-800 rounded-xl px-3 py-2"
                        >
                          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                          </svg>
                          <span className="flex-1 text-sm truncate">{topic.name}</span>
                          <button
                            onClick={() => renameTopic(subject.id, topic.id, topic.name)}
                            className="text-slate-500 hover:text-blue-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Rename topic"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteTopic(subject.id, topic.id, topic.name)}
                            className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete topic"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}