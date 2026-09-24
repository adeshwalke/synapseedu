import { useLocalStorage } from '../hooks/useLocalStorage';

const NAV = [
  { id: 'subjects', label: 'Subjects', icon: 'folders' },
  { id: 'workspace', label: 'Whiteboard', icon: 'pen' },
  { id: 'tests', label: 'Tests', icon: 'clip' },
  { id: 'revision', label: 'Revision Hub', icon: 'brain' },
];

function Icon({ name, className }) {
  const cls = `w-5 h-5 ${className || ''}`;
  switch (name) {
    case 'folders':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a2 2 0 0 1 2-2h5l2 3h6a2 2 0 0 1 2 2v13" />
        </svg>
      );
    case 'pen':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case 'clip':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-6-8h3M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        </svg>
      );
    case 'brain':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.674M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 15 18.25V19a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.75c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ view, setView, mobileOpen, setMobileOpen }) {
  const [mastery] = useLocalStorage('eduhub_mastery', {});
  const stats = Object.values(mastery);
  const reviewDue = stats.filter(
    (m) => m.due && new Date(m.due) <= new Date()
  ).length;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static z-40 lg:z-auto top-0 left-0 h-full
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">EduHub</h1>
            <p className="text-xs text-slate-500">Study smarter</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`sidebar-link w-full ${view === item.id ? 'active' : ''}`}
            >
              <Icon name={item.icon} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'revision' && reviewDue > 0 && (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full px-2 py-0.5">
                  {reviewDue}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 leading-relaxed flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Offline-first · Data stored on this device
          </div>
        </div>
      </aside>

      <button
        className="fixed bottom-4 right-4 z-50 lg:hidden w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-2xl shadow-blue-500/30 flex items-center justify-center"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </>
  );
}