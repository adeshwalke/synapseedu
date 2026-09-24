import { useState, useEffect, useRef, useCallback } from 'react';

/* Lazy-loads pdfjs and renders pages to PNG slices so the notebook can
   display lecture slides side by side with either board engine. */

async function loadPdf(dataUrl) {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  } catch { /* fall through */ }

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: dataUrlToArrayBuffer(dataUrl) }).promise;
  } catch {
    const raw = dataUrl.split(',')[1] || '';
    const base64 = decodeURIComponent(
      raw.replace(/\+/g, '%20').replace(/%([0-9A-F]{2})/g,
        (_m, hex) => String.fromCharCode(parseInt(hex, 16))
      )
    );
    doc = await pdfjs.getDocument({ data: atob(base64) }).promise;
  }
  return doc;
}

function dataUrlToArrayBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export default function PdfViewer({ fileData, containerRef }) {
  const [pages, setPages] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useRef(0);

  const renderPdf = useCallback(async (dataUrl) => {
    const t = ++token.current;
    setLoading(true);
    setError(null);
    setPages([]);
    setPage(1);
    try {
      const doc = await loadPdf(dataUrl);
      if (t !== token.current) return;
      setNumPages(doc.numPages);
      const holder = containerRef.current?.getBoundingClientRect();
      const width = Math.min(holder?.width ?? 720, 1000);
      const scale = width / 720;
      const imgs = [];
      for (let p = 1; p <= doc.numPages; p++) {
        const pg = await doc.getPage(p);
        const viewport = pg.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await pg.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        imgs.push({ url: canvas.toDataURL('image/png'), w: viewport.width, h: viewport.height });
      }
      if (t !== token.current) return;
      setPages(imgs);
    } catch (e) {
      console.error(e);
      if (t === token.current) setError('Could not render this PDF. Make sure it is a valid PDF file.');
    } finally {
      if (t === token.current) setLoading(false);
    }
  }, [containerRef]);

  useEffect(() => {
    setPage(1);
    if (fileData) renderPdf(fileData);
  }, [fileData, renderPdf]);

  return (
    <div className="h-full flex flex-col min-h-0">
      {numPages > 0 && !loading && (
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800 bg-slate-900/80 gap-1.5">
          <div className="flex items-center gap-1">
            <button className="btn-secondary btn-sm !px-2" disabled={page <= 1} onClick={() => setPage(page - 1)} title="Previous page">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-xs text-slate-300 whitespace-nowrap">
              {page} / {numPages}
            </span>
            <button className="btn-secondary btn-sm !px-2" disabled={page >= numPages} onClick={() => setPage(page + 1)} title="Next page">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            <input
              type="number"
              min="1"
              max={numPages}
              value={page}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 1 && v <= numPages) setPage(v);
              }}
              className="w-12 text-xs py-1 px-1.5"
              title="Jump to page"
            />
          </div>
          <div className="flex items-center gap-1">
            <button className="btn-secondary btn-sm !px-2" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} title="Zoom out">−</button>
            <span className="text-xs text-slate-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button className="btn-secondary btn-sm !px-2" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} title="Zoom in">+</button>
            <button className="btn-secondary btn-sm !px-2" onClick={() => setZoom(1)} title="Reset zoom">1:1</button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto bg-slate-950/60">
        {loading && (
          <div className="flex items-center justify-center gap-3 h-24 text-slate-400 text-sm">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Rendering PDF…
          </div>
        )}
        {error && <p className="text-red-400 text-sm p-4">{error}</p>}
        {!loading && !error && pages.length === 0 && (
          <div className="flex items-center justify-center h-24 text-slate-500 text-sm">
            No PDF loaded
          </div>
        )}
        {!loading &&
          pages.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={`Page ${idx + 1}`}
              className="shadow-lg shadow-black/40 block"
              style={{ width: `${img.w * zoom}px`, maxWidth: 'none' }}
            />
          ))}
      </div>
    </div>
  );
}