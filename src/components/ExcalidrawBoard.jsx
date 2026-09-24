import { lazy, Suspense, useMemo, useRef } from 'react';
import '@excalidraw/excalidraw/index.css';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ExcalidrawLazy = lazy(() =>
  import('@excalidraw/excalidraw').then((m) => ({ default: m.Excalidraw }))
);

export default function ExcalidrawBoard({ noteId }) {
  const [saved, setSaved] = useLocalStorage(`eduhub_excalidraw_${noteId}`, null);
  const saveTimer = useRef(null);

  const initialData = useMemo(() => {
    try {
      if (saved && saved.elements) {
        return {
          elements: typeof saved.elements === 'string' ? JSON.parse(saved.elements) : saved.elements,
          files: saved.files && typeof saved.files === 'string'
            ? JSON.parse(saved.files)
            : (saved.files || undefined),
          appState: {
            theme: 'dark',
            viewBackgroundColor: '#12161f',
            gridSize: null,
            collaborators: [],
          },
        };
      }
    } catch (e) {
      console.warn('Failed to restore Excalidraw board:', e);
    }
    return {
      appState: { theme: 'dark', viewBackgroundColor: '#12161f', gridSize: null },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const handleChange = (_elements, _appState, files) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        setSaved({
          elements: JSON.stringify(_elements),
          files: JSON.stringify(files || {}),
          savedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Excalidraw save failed:', e);
      }
    }, 700);
  };

  return (
    <div
      className="h-full w-full"
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
    >
      <Suspense
        fallback={
          <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
            <span className="flex items-center gap-3">
              <span className="h-4 w-4 border-2 border-blue-400/60 border-t-transparent rounded-full animate-spin" />
              Loading Modern Board…
            </span>
          </div>
        }
      >
        <ExcalidrawLazy
          key={noteId}
          initialData={initialData}
          onChange={handleChange}
          autoFocus
          zenModeEnabled={false}
          isCollaborating={false}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              export: true,
            },
          }}
        />
      </Suspense>
    </div>
  );
}