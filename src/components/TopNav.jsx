export default function TopNav({ view, setView, syncState, openCopilot, openSettings, dueCount }) {
  const tabs = [
    ['subjects', 'Subjects', '📚'],
    ['notebook', 'Notebook', '✏️'],
    ['tests', 'Tests', '🧠'],
    ['revision', 'Revision', '🗂️'],
  ];
  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <button onClick={() => setView('subjects')} className="flex items-center gap-2 shrink-0 mr-2">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-black text-sm shadow-lg shadow-blue-500/20">
            S
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-bold leading-tight">SynapseEdu</span>
            <span className="block text-[10px] text-slate-500 leading-tight">offline learning suite</span>
          </span>
        </button>

        <nav className="flex items-center gap-1">
          {tabs.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`px-2.5 sm:px-4 py-2 rounded-xl text-sm transition-all ${
                view === id
                  ? 'bg-blue-500/15 text-blue-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="hidden sm:inline mr-1.5">{icon}</span>
              {label}
              {id === 'revision' && dueCount > 0 && (
                <span className="ml-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full px-1.5 py-0.5">
                  {dueCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        <button
          onClick={openCopilot}
          className="relative group flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-white font-semibold text-sm overflow-hidden animate-pulse-slow"
          style={{
            background: 'linear-gradient(120deg, #3b82f6, #10b981 60%, #3b82f6)',
            backgroundSize: '200% 100%',
            boxShadow: '0 0 24px rgba(56,189,248,0.45)',
          }}
        >
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
          <span className="relative">✦</span>
          <span className="relative hidden sm:inline">{syncState?.aiName || 'SynapseAI'}</span>
          <span className="relative text-[10px] font-normal opacity-80">Ask</span>
        </button>

        <button onClick={openSettings} className="btn-secondary btn-sm px-2.5" title="Settings">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}