import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage, uid } from '../hooks/useLocalStorage';

const COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#f472b6', '#a78bfa', '#ffffff'];
const WIDTHS = [2, 4, 6, 10, 16];

function DrawLayer({ elements, containerRef }) {
  const canvasRef = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTick((t) => t + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const el = containerRef.current;
    if (!canvas || !el) return;
    const dpr = window.devicePixelRatio || 1;
    const w = el.clientWidth;
    const h = el.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const list = Array.isArray(elements) ? elements : [];
    for (const elm of list) {
      if (elm.type === 'stroke') {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (elm.eraser) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = '#000';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = elm.color;
        }
        ctx.lineWidth = elm.width;
        elm.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (elm.type === 'text') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = `700 ${elm.size}px 'ui-sans-serif', 'Segoe UI', sans-serif`;
        ctx.fillStyle = elm.color;
        ctx.fillText(elm.content, elm.x, elm.y);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [elements, containerRef, tick]);

  return <canvas ref={canvasRef} />;
}

export default function Whiteboard({ noteId }) {
  const [elements, setElements] = useLocalStorage(`eduhub_note_${noteId || 'default'}`, []);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [textContent, setTextContent] = useState('');
  const containerRef = useRef(null);
  const drawingRef = useRef(null);
  const isDown = useRef(false);

  useEffect(() => {
    if (!Array.isArray(elements)) setElements([]);
  }, [elements, setElements]);

  const getPos = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const updateStroke = useCallback((stroke) => {
    setElements((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const idx = base.findIndex((el) => el.id === stroke.id);
      if (idx === -1) return [...base, stroke];
      return base.map((el) => (el.id === stroke.id ? stroke : el));
    });
  }, [setElements]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (tool === 'text') {
      const p = getPos(e);
      const content = textContent.trim();
      if (content) {
        const size = 22 + strokeWidth * 3;
        setElements((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          { id: uid(), type: 'text', content, x: p.x, y: p.y, color, size },
        ]);
        setTextContent('');
      }
      return;
    }
    containerRef.current?.setPointerCapture?.(e.pointerId);
    isDown.current = true;
    const p = getPos(e);
    drawingRef.current = {
      id: uid(),
      type: 'stroke',
      color,
      width: tool === 'eraser' ? strokeWidth * 3.5 : strokeWidth,
      points: [p],
      eraser: tool === 'eraser',
    };
  };

  const handlePointerMove = (e) => {
    if (!isDown.current || !drawingRef.current) return;
    const p = getPos(e);
    const pts = drawingRef.current.points;
    const last = pts[pts.length - 1];
    if (last && Math.abs(last.x - p.x) < 1 && Math.abs(last.y - p.y) < 1) return;
    pts.push(p);
    updateStroke(drawingRef.current);
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    if (!isDown.current || !drawingRef.current) return;
    drawingRef.current.points.push(getPos(e));
    updateStroke(drawingRef.current);
    drawingRef.current = null;
    isDown.current = false;
  };

  const undo = () => {
    setElements((prev) => (Array.isArray(prev) && prev.length ? prev.slice(0, -1) : prev));
  };

  const clearAll = () => {
    if (window.confirm('Clear the entire board?')) {
      setElements([]);
    }
  };

  const toolButton = (id, label, d) => (
    <button
      key={id}
      onClick={() => setTool(id)}
      className={`px-3 py-2 rounded-xl text-sm font-medium border flex items-center gap-1.5 ${
        tool === id
          ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
          : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
      }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2 p-2.5 border-b border-slate-800 bg-slate-900/80">
        {toolButton('pen', 'Pen', 'M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z')}
        {toolButton('eraser', 'Eraser', 'M20 12a8 8 0 1 1-2.343-5.657M20 12h-4m4 0v-4')}
        {toolButton('text', 'Text', 'M4 7V5h16v2M12 5v14M9 19h6')}

        {tool === 'pen' && (
          <>
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/70 rounded-xl border border-slate-700">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-5 h-5 rounded-full transition-transform"
                  style={{
                    backgroundColor: c,
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 2px #0f172a, 0 0 0 4px ${c}` : 'none',
                  }}
                  title={c}
                />
              ))}
              <label
                className="relative w-5 h-5 rounded-full border border-slate-600 cursor-pointer flex items-center justify-center overflow-hidden"
                style={{ background: 'conic-gradient(#f87171, #fbbf24, #34d399, #38bdf8, #a78bfa, #f87171)' }}
                title="Custom color"
              >
                <span className="text-[9px] font-bold text-white drop-shadow">+</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/70 rounded-xl border border-slate-700">
              {WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                    strokeWidth === w ? 'bg-blue-500/20' : 'hover:bg-slate-700'
                  }`}
                  title={`${w}px`}
                >
                  <span
                    className={`rounded-full ${strokeWidth === w ? 'bg-blue-400' : 'bg-slate-400'}`}
                    style={{ width: Math.max(3, w), height: Math.max(3, w) }}
                  />
                </button>
              ))}
            </div>
          </>
        )}

        {tool === 'text' && (
          <input
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setTool('pen');
            }}
            placeholder="Type text, then click the canvas…"
            className="w-full sm:w-64 text-sm bg-slate-800/70 border-slate-700 py-1.5"
          />
        )}

        <div className="flex-1" />
        <button
          onClick={undo}
          className="px-3 py-2 rounded-xl text-sm font-medium bg-slate-800/70 border border-slate-700 text-slate-300 hover:text-slate-100 disabled:opacity-40"
          disabled={!Array.isArray(elements) || elements.length === 0}
          title="Undo last stroke"
        >
          Undo
        </button>
        <button
          onClick={clearAll}
          className="px-3 py-2 rounded-xl text-sm font-medium bg-red-600/15 border border-red-600/30 text-red-400 hover:bg-red-600/25"
          title="Clear board"
        >
          Clear
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-[#0b1120]"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <DrawLayer elements={elements} containerRef={containerRef} />

        {tool === 'text' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-900/90 border border-blue-500/40 text-blue-300 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
            Click anywhere on the board to place text
          </div>
        )}
      </div>
    </div>
  );
}