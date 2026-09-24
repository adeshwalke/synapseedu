import { useState, useRef } from 'react';
import { useLocalStorage, uid } from '../hooks/useLocalStorage';
import RuledPaper from './RuledPaper';
import PdfViewer from './PdfViewer';
import BoardErrorBoundary from './BoardErrorBoundary';
import ExcalidrawBoard from './ExcalidrawBoard';

const newPage = (n) => ({
  id: uid(),
  name: `Page ${n}`,
  rule: 'ruled',
  tint: 'white',
});

const defaultNote = (id) => ({
  id,
  title: 'Untitled notebook',
  subjectId: '',
  topicId: '',
  pdf: null,
  engine: 'ruled',
  layout: 'split',
  pages: [newPage(1)],
  activePage: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function ensureNote(n) {
  let m = n;
  if (!Array.isArray(m.pages) || m.pages.length === 0) {
    m = { ...m, pages: [newPage(1)], activePage: null };
  }
  if (!m.activePage || !m.pages.some((p) => p.id === m.activePage)) {
    m = { ...m, activePage: m.pages[0].id };
  }
  return { ...m, engine: m.engine || 'ruled', layout: m.layout || 'split', subjectId: m.subjectId || '', topicId: m.topicId || '' };
}

function EnginePill({ engine }) {
  return engine === 'modern' ? (
    <span className="px-2 py-1 text-xs rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300">✦ Modern Board</span>
  ) : (
    <span className="px-2 py-1 text-xs rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">≣ Ruled Paper</span>
  );
}

export default function Notebook({ subjects, textNotes, setTextNotes }) {
  const [notes, setNotes] = useLocalStorage('eduhub_notes', []);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [editingPageId, setEditingPageId] = useState(null);
  const [pageDraft, setPageDraft] = useState('');
  const [viewingNote, setViewingNote] = useState(null);
  const fileRef = useRef(null);
  const containerRef = useRef(null);

  const list = (Array.isArray(notes) ? notes : []).map(ensureNote);
  const activeNote = list.find((n) => n.id === activeNoteId) || null;
  const activePage = activeNote?.pages.find((p) => p.id === activeNote.activePage) || activeNote?.pages[0];

  const updateNote = (id, patch) =>
    setNotes(list.map((n) => (n.id === id ? ensureNote({ ...n, ...patch, updatedAt: new Date().toISOString() }) : n)));

  const createNote = () => {
    const id = uid();
    setNotes([...list, defaultNote(id)]);
    setActiveNoteId(id);
  };

  const deleteNote = () => {
    if (!activeNote) return;
    if (!window.confirm(`Delete notebook "${activeNote.title}" and all its pages?`)) return;
    const id = activeNote.id;
    for (const p of activeNote.pages) {
      try { window.localStorage.removeItem(`eduhub_pg_${id}_${p.id}`); } catch {}
    }
    try { window.localStorage.removeItem(`eduhub_excalidraw_${id}`); } catch {}
    setNotes(list.filter((n) => n.id !== id));
    setActiveNoteId(list.find((n) => n.id !== id)?.id ?? null);
  };

  const renameNote = () => {
    const t = window.prompt('Notebook title:', activeNote.title)?.trim();
    if (t) updateNote(activeNote.id, { title: t });
  };

  const addPage = () => {
    const p = newPage(activeNote.pages.length + 1);
    updateNote(activeNote.id, { pages: [...activeNote.pages, p], activePage: p.id });
  };

  const commitPageName = (pageId) => {
    updateNote(activeNote.id, {
      pages: activeNote.pages.map((p) => (p.id === pageId ? { ...p, name: pageDraft.trim() || p.name } : p)),
    });
    setEditingPageId(null);
  };

  const deletePage = (page) => {
    if (activeNote.pages.length <= 1) { alert('A notebook needs at least one page.'); return; }
    if (!window.confirm(`Delete page "${page.name}"?`)) return;
    try { window.localStorage.removeItem(`eduhub_pg_${activeNote.id}_${page.id}`); } catch {}
    const rest = activeNote.pages.filter((p) => p.id !== page.id);
    updateNote(activeNote.id, {
      pages: rest,
      activePage: page.id === activeNote.activePage ? rest[0].id : activeNote.activePage,
    });
  };

  const setPagePatch = (patch) =>
    updateNote(activeNote.id, {
      pages: activeNote.pages.map((p) => (p.id === activePage.id ? { ...p, ...patch } : p)),
    });

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') { alert('Please choose a valid PDF file.'); return; }
    if (file.size > 3.5 * 1024 * 1024) alert('This PDF is ~3.5MB+ — browser storage may fail to save it. Try a smaller file.');
    const reader = new FileReader();
    reader.onload = () => updateNote(activeNote.id, { pdf: reader.result, layout: 'split' });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const subject = subjects.find((s) => s.id === activeNote?.subjectId);
  const topic = subject?.topics.find((t) => t.id === activeNote?.topicId);

  const layoutBtn = (mode, label) => (
    <button
      onClick={() => updateNote(activeNote.id, { layout: mode })}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        activeNote.layout === mode
          ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
          : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  const pdfPane = activeNote && (
    <div className={`min-h-0 card p-0 overflow-hidden flex flex-col ${activeNote.layout === 'pdf' ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Lecture slides</span>
        {activeNote.pdf ? <span className="text-xs text-emerald-400">attached</span> : <span className="text-xs text-slate-500">no file</span>}
      </div>
      <div className="flex-1 min-h-0">
        <PdfViewer fileData={activeNote.pdf} containerRef={containerRef} />
      </div>
      {!activeNote.pdf && (
        <button className="m-3 btn-secondary btn-sm mx-auto" onClick={() => fileRef.current?.click()}>Browse for a PDF</button>
      )}
    </div>
  );

  const boardPane = activeNote && (
    <div className={`min-h-0 card p-0 overflow-hidden flex flex-col ${activeNote.layout === 'board' ? 'h-full' : ''}`}>
      <div className="flex-1 min-h-0">
        {activeNote.engine === 'modern' ? (
          <BoardErrorBoundary
            onRetry={() => updateNote(activeNote.id, { engine: 'modern' })}
            onFallback={() => updateNote(activeNote.id, { engine: 'ruled' })}
          >
            <ExcalidrawBoard noteId={activeNote.id} />
          </BoardErrorBoundary>
        ) : (
          <RuledPaper
            key={`${activeNote.id}_${activePage?.id}`}
            noteId={activeNote.id}
            pageId={activePage?.id}
            page={activePage}
            onChangePage={setPagePatch}
          />
        )}
      </div>
    </div>
  );

  const body = activeNote && (
    <div className="max-w-[1800px] mx-auto">
      {activeNote.layout === 'split' && (
        <div className="grid lg:grid-cols-2 grid-rows-2 lg:grid-rows-1 gap-3 h-full min-h-0">
          {boardPane}
          {pdfPane}
        </div>
      )}
      {activeNote.layout === 'board' && (
        <div className="h-full min-h-0">{boardPane}</div>
      )}
      {activeNote.layout === 'pdf' && (
        <div className="h-full min-h-0">{pdfPane}</div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* header + notebook selector */}
      <div className="px-3 sm:px-5 pt-3 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{activeNote ? activeNote.title : 'Canvas Notebook'}</h1>
            {(subject || topic) && <p className="text-xs text-emerald-400">{subject?.name}{topic ? ` · ${topic.name}` : ''}</p>}
          </div>
          {activeNote && <EnginePill engine={activeNote.engine} />}
          {activeNote && (
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary btn-sm" onClick={renameNote}>Rename</button>
              <button className="btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>PDF</button>
              <button className="btn-danger btn-sm" onClick={deleteNote}>Delete</button>
            </div>
          )}
          <button className="btn-primary btn-sm" onClick={createNote}>+ Notebook</button>
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
                {n.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* engine PAGES strip + engine/layout toolbar */}
      {activeNote && (
        <div className="px-3 sm:px-5 py-2 border-b border-slate-800 bg-slate-900/40">
          <div className="flex flex-wrap items-center gap-2 max-w-7xl mx-auto">
            <button
              onClick={() => updateNote(activeNote.id, { engine: activeNote.engine === 'ruled' ? 'modern' : 'ruled' })}
              className="btn-secondary btn-sm flex items-center gap-1.5"
              title="Switch board engine"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
              </svg>
              <span className="hidden sm:inline">Engine</span>
            </button>

            {activeNote.engine === 'ruled' ? (
              <div className="flex items-center gap-1 overflow-x-auto max-w-full order-3 w-full sm:w-auto sm:order-none">
                {activeNote.pages.map((p) =>
                  editingPageId === p.id ? (
                    <span key={p.id} className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/40 rounded-lg px-2 py-1 shrink-0">
                      <input autoFocus value={pageDraft}
                        onChange={(e) => setPageDraft(e.target.value)}
                        onBlur={() => commitPageName(p.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitPageName(p.id); }}
                        className="w-24 text-xs py-0.5 px-1.5" />
                    </span>
                  ) : (
                    <span
                      key={p.id}
                      className={`group shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer select-none ${
                        p.id === activeNote.activePage
                          ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                          : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      onClick={() => updateNote(activeNote.id, { activePage: p.id })}
                      onDoubleClick={() => { setEditingPageId(p.id); setPageDraft(p.name); }}
                    >
                      <span className="truncate max-w-[80px]">{p.name}</span>
                      <button
                        className={`opacity-0 group-hover:opacity-100 text-red-400 pl-0.5 ${p.id === activeNote.activePage ? 'opacity-70' : ''}`}
                        onClick={(e) => { e.stopPropagation(); deletePage(p); }}
                        title="Delete page"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  )
                )}
                <button onClick={addPage} className="btn-secondary btn-sm" title="Add page">+ Page</button>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Infinite canvas · pinch/2-finger pan · minimap · shape tools</span>
            )}

            <div className="flex-1" />

            <div className="flex items-center gap-1.5">
              <span className="hidden md:inline text-xs text-slate-500">Layout:</span>
              {layoutBtn('board', 'Board only')}
              {layoutBtn('split', 'Split 50/50')}
              {layoutBtn('pdf', 'PDF only')}
            </div>
          </div>
        </div>
      )}

      {/* lecture notes strip (SynapseAI saves) */}
      {!activeNote && (
        <div className="max-w-7xl mx-auto w-full px-5 pt-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-2">Lecture notes from SynapseAI</h2>
          {Array.isArray(textNotes) && textNotes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {textNotes.map((n) => (
                <button key={n.id} onClick={() => setViewingNote(n)}
                  className="px-3 py-2 rounded-xl text-left text-sm border bg-slate-800/60 border-slate-700 hover:border-blue-500/40 max-w-[240px]">
                  <span className="block font-medium truncate">{n.title}</span>
                  <span className="text-xs text-slate-500">{new Date(n.updatedAt).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Use SynapseAI → "Write Notes" and save here.</p>
          )}
        </div>
      )}
      {!activeNote && list.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-8">
          <div className="text-6xl">📓</div>
          <h3 className="text-lg font-semibold">Dual-engine digital notebook</h3>
          <p className="text-slate-400 text-sm max-w-md">
            Ruled-paper multi-page notebook with insert-space ink, or the Modern Board infinite canvas.
            Review lecture PDFs side by side. Everything is saved offline on this device.
          </p>
          <button className="btn-primary" onClick={createNote}>Create notebook</button>
        </div>
      )}

      {/* main body when a note is open */}
      {activeNote && (
        <div className="flex-1 min-h-0 p-3 sm:p-4">
          {body}
        </div>
      )}

      <input type="file" accept="application/pdf" ref={fileRef} onChange={onFile} className="hidden" />

      {/* text note viewer modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingNote(null)}>
          <div className="card max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <h3 className="font-bold flex-1 truncate">{viewingNote.title}</h3>
              <button
                className="btn-danger btn-sm"
                onClick={() => { setTextNotes(textNotes.filter((n) => n.id !== viewingNote.id)); setViewingNote(null); }}
              >
                Delete
              </button>
              <button className="btn-secondary btn-sm" onClick={() => setViewingNote(null)}>Close</button>
            </div>
            <div className="overflow-y-auto py-4 [&_h1]:font-bold [&_h1]:text-xl [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:font-semibold [&_h3]:text-slate-300 [&_li]:list-disc [&_li]:ml-5 [&_ul]:my-2 [&_li]:my-1 text-sm leading-relaxed">
              <div className="whitespace-pre-wrap text-slate-200">{viewingNote.content}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}