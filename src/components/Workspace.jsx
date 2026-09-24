import { useState, useRef } from 'react';
import { useLocalStorage, uid } from '../hooks/useLocalStorage';
import Whiteboard from './Whiteboard';
import PdfViewer from './PdfViewer';

export default function Workspace({ subjects }) {
  const [notes, setNotes] = useLocalStorage('eduhub_notes', []);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [showPdf, setShowPdf] = useState(true);
  const fileRef = useRef(null);
  const containerRef = useRef(null);

  const list = Array.isArray(notes) ? notes : [];
  const activeNote = list.find((n) => n.id === activeNoteId) || null;

  const createNote = () => {
    const id = uid();
    const next = {
      id,
      title: 'Untitled board',
      subjectId: '',
      topicId: '',
      pdf: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([...list, next]);
    setActiveNoteId(id);
  };

  const updateNote = (patch) => {
    if (!activeNote) return;
    setNotes(
      list.map((n) =>
        n.id === activeNote.id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
      )
    );
  };

  const deleteNote = () => {
    if (!activeNote) return;
    if (!window.confirm(`Delete board "${activeNote.title}" and its drawings?`)) return;
    const id = activeNote.id;
    setNotes(list.filter((n) => n.id !== id));
    try { window.localStorage.removeItem(`eduhub_note_${id}`); } catch {}
    setActiveNoteId(list.find((n) => n.id !== id)?.id ?? null);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please choose a valid PDF file.');
      return;
    }
    if (file.size > 3.5 * 1024 * 1024) {
      alert('This PDF is larger than ~3.5 MB. Browser storage limits may fail to save it — try a smaller file.');
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateNote({ pdf: reader.result });
      setShowPdf(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const subjectName = subjects.find((s) => s.id === activeNote?.subjectId)?.name;
  const topicName = activeNote?.subjectId
    ? subjects.find((s) => s.id === activeNote?.subjectId)?.topics.find(
        (t) => t.id === activeNote.topicId
      )?.name
    : undefined;

  const renameTitle = () => {
    if (!activeNote) return;
    const title = window.prompt('Board title:', activeNote.title)?.trim();
    if (title) updateNote({ title });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header / note tabs */}
      <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2 max-w-6xl mx-auto">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">
              {activeNote ? activeNote.title : 'Canvas Notebook'}
            </h1>
            {(subjectName || topicName) && (
              <p className="text-xs text-emerald-400">
                {subjectName}{topicName ? ` · ${topicName}` : ''}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {activeNote && (
              <>
                <button className="btn-secondary btn-sm" onClick={renameTitle}>
                  Rename
                </button>
                <button
                  className={`btn-secondary btn-sm ${showPdf ? 'text-blue-400 border-blue-500/40' : ''}`}
                  onClick={() => setShowPdf(!showPdf)}
                >
                  PDF pane
                </button>
                <button className="btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                  Upload PDF
                </button>
                <button className="btn-danger btn-sm" onClick={deleteNote}>
                  Delete
                </button>
              </>
            )}
            <button className="btn-primary btn-sm" onClick={createNote}>
              New board
            </button>
          </div>
        </div>

        {list.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2 -mx-1 px-1">
            {list.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveNoteId(n.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-sm border text-left max-w-[180px] truncate ${
                  n.id === activeNoteId
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={n.title}
              >
                {n.title || 'Untitled'}
              </button>
            ))}
          </div>
        )}
      </div>

      <input type="file" accept="application/pdf" ref={fileRef} onChange={onFile} className="hidden" />

      {/* Body: whiteboard + pdf side by side */}
      <div className="flex-1 min-h-0 p-3 sm:p-4">
        {!activeNote ? (
          <div className="card h-full flex flex-col items-center justify-center text-center gap-3 border-dashed border-2">
            <div className="text-6xl">🎨</div>
            <h3 className="text-lg font-semibold">Open a board or create a new one</h3>
            <p className="text-slate-400 text-sm max-w-md">
              Draw clinical diagrams, annotate lecture slides, and review your notes next to
              reference PDFs — all saved offline on this device.
            </p>
            <button className="btn-primary mt-2" onClick={createNote}>
              Create your first board
            </button>
          </div>
        ) : (
          <div
            ref={containerRef}
            className={`grid h-full gap-3 ${showPdf ? 'lg:grid-cols-2 grid-rows-[1fr_1fr] lg:grid-rows-1' : 'grid-rows-1'}`}
          >
            <div className="min-h-0 card p-0 overflow-hidden">
              <Whiteboard key={activeNote.id} noteId={activeNote.id} />
            </div>
            {showPdf && (
              <div className="min-h-0 card p-0 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                    Reference PDF
                  </span>
                  {activeNote.pdf ? (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                  ) : (
                    <span className="text-xs text-slate-500">No file attached</span>
                  )}
                </div>
                <div className="flex-1 min-h-0">
                  <PdfViewer fileData={activeNote.pdf} containerRef={containerRef} />
                </div>
                {!activeNote.pdf && (
                  <button
                    className="m-3 btn-secondary btn-sm mx-auto"
                    onClick={() => fileRef.current?.click()}
                  >
                    Browse for a PDF
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}