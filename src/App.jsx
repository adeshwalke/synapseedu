import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSync } from './hooks/useSync';
import TopNav from './components/TopNav';
import SubjectsManager from './components/SubjectsManager';
import Notebook from './components/Notebook';
import TestsModule from './components/TestsModule';
import RevisionHub from './components/RevisionHub';
import AiCopilot from './components/AiCopilot';
import SettingsModal from './components/SettingsModal';

const DEFAULT_CONFIG = {
  name: 'SynapseAI',
  persona: 'attending',
  specialty: 'general',
  online: false,
  apiKey: '',
  model: 'gemini-2.0-flash',
};

export default function App() {
  const [view, setView] = useState('subjects');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [subjects, setSubjects] = useLocalStorage('eduhub_subjects', []);
  const [tests, setTests] = useLocalStorage('eduhub_tests', []);
  const [testResults, setTestResults] = useLocalStorage('eduhub_results', []);
  const [flashcards, setFlashcards] = useLocalStorage('eduhub_flashcards', []);
  const [textNotes, setTextNotes] = useLocalStorage('eduhub_textnotes', []);
  const [mastery] = useLocalStorage('eduhub_mastery', {});
  const [config, setConfig] = useLocalStorage('eduhub_config', DEFAULT_CONFIG);

  const sync = useSync();

  useEffect(() => {
    sync.boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sync.schedulePush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, tests, testResults, flashcards, textNotes]);

  const dueCount = useMemo(() => {
    const cards = Array.isArray(flashcards) ? flashcards : [];
    return cards.filter((c) => !mastery[c.id] || new Date(mastery[c.id].due) <= new Date()).length;
  }, [flashcards, mastery]);

  const lastMistakes = useMemo(() => {
    const results = Array.isArray(testResults) ? testResults : [];
    const latest = [...results].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    if (!latest?.missedIds?.length) return null;
    const test = (Array.isArray(tests) ? tests : []).find((t) => t.id === latest.testId);
    if (!test) return null;
    return test.questions.filter((q) => latest.missedIds.includes(q.id));
  }, [tests, testResults]);

  const addTestFromAI = useCallback((test) => {
    setTests((t) => [...(Array.isArray(t) ? t : []), test]);
  }, [setTests]);

  const addTextNoteFromAI = useCallback((note) => {
    setTextNotes((n) => [...(Array.isArray(n) ? n : []), note]);
  }, [setTextNotes]);

  const addFlashcardsFromAI = useCallback((cards) => {
    setFlashcards((f) => [...(Array.isArray(f) ? f : []), ...cards]);
  }, [setFlashcards]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TopNav
        view={view}
        setView={setView}
        syncState={{ ...sync.state, aiName: config.name }}
        openCopilot={() => setCopilotOpen(true)}
        openSettings={() => setSettingsOpen(true)}
        dueCount={dueCount}
      />

      <main>
        {view === 'subjects' && (
          <SubjectsManager subjects={subjects} setSubjects={setSubjects} />
        )}
        {view === 'notebook' && (
          <Notebook subjects={subjects} textNotes={textNotes} setTextNotes={setTextNotes} />
        )}
        {view === 'tests' && (
          <TestsModule
            subjects={subjects}
            setSubjects={setSubjects}
            tests={tests}
            setTests={setTests}
            testResults={testResults}
            setTestResults={setTestResults}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
          />
        )}
        {view === 'revision' && (
          <RevisionHub subjects={subjects} flashcards={flashcards} setFlashcards={setFlashcards} />
        )}
      </main>

      {copilotOpen && (
        <AiCopilot
          config={config}
          setConfig={setConfig}
          onClose={() => setCopilotOpen(false)}
          onAddTest={addTestFromAI}
          onAddTextNote={addTextNoteFromAI}
          onAddFlashcards={addFlashcardsFromAI}
          lastMistakes={lastMistakes}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          config={config}
          setConfig={setConfig}
          onClose={() => setSettingsOpen(false)}
          syncState={sync.state}
          syncNow={sync.syncNow}
        />
      )}
    </div>
  );
}