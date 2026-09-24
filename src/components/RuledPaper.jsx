import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage, uid } from '../hooks/useLocalStorage';

export const PAPER_TINTS = {
  white: '#fdfdf8',
  ivory: '#fbf3e2',
  mint: '#f0f8f0',
  sky: '#eef3fb',
};
export const PAPER_RULES = ['ruled', 'grid', 'dots', 'blank'];

const RULE_LINE = '#b7cfe6';
const RULE_MARGIN = '#f0b6b6';
const GRID_LINE = '#d5dced';
const DOT_COLOR = '#b9c2d6';
const LINE_SPACING = 38;

function buildPaper(ctx, w, h, rule, tint, dpr) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = PAPER_TINTS[tint] || PAPER_TINTS.white;
  ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 1;
  if (rule === 'ruled') {
    ctx.strokeStyle = RULE_MARGIN;
    ctx.beginPath();
    ctx.moveTo(72.5, 0);
    ctx.lineTo(72.5, h);
    ctx.stroke();
    ctx.strokeStyle = RULE_LINE;
    for (let y = LINE_SPACING; y < h; y += LINE_SPACING) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
  } else if (rule === 'grid') {
    ctx.strokeStyle = GRID_LINE;
    for (let x = LINE_SPACING; x < w; x += LINE_SPACING) {
      ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke();
    }
    for (let y = LINE_SPACING; y < h; y += LINE_SPACING) {
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
    }
  } else if (rule === 'dots') {
    ctx.fillStyle = DOT_COLOR;
    for (let x = LINE_SPACING; x < w; x += LINE_SPACING) {
      for (let y = LINE_SPACING; y < h; y += LINE_SPACING) {
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function PaperCanvas({ elements, page, containerRef }) {
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
    const needH = 1200;
    const maxY = (Array.isArray(elements) ? elements : []).reduce((m, el) => {
      if (el.type === 'stroke') {
        for (const p of el.points) if (p.y > m) m = p.y;
      } else if (el.type === 'text') {
        if (el.y > m) m = el.y;
      }
      return m;
    }, 0);
    const h = Math.max(needH, Math.ceil(maxY + 420));
    const w = Math.max(1460, Math.ceil(el.clientWidth));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    buildPaper(ctx, w, h, page.rule, page.tint, dpr);

    const list = Array.isArray(elements) ? elements : [];
    for (const elm of list) {
      if (elm.type === 'stroke') {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (elm.eraser) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = '#000';
        } else if (elm.highlight) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.strokeStyle = elm.color;
          ctx.globalAlpha = 0.55;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = elm.color;
          ctx.globalAlpha = 1;
        }
        ctx.lineWidth = elm.width;
        elm.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (elm.type === 'text') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.font = `600 ${elm.size}px 'ui-sans-serif', 'Segoe UI', sans-serif`;
        ctx.fillStyle = elm.color;
        ctx.fillText(elm.content, elm.x, elm.y);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [elements, page.rule, page.tint, tick, containerRef]);

  return <canvas ref={canvasRef} className="block" />;
}

const TOOL_ICONS = {
  pen: 'M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  highlighter: 'M8 4h9l-6 8-1.5 2.5L8 12 4 8l4-4m2.5 6.5L20 5m-8 11l-3.5 6 3.5 2 3.5-8',
  eraser: 'M20 12a8 8 0 1 1-2.343-5.657M20 12h-4m4 0v-4',
  text: 'M4 7V5h16v2M12 5v14M9 19h6',
  space: 'M12 3v7m0 0l-3.5-3.5M12 10l3.5-3.5M5 21h14M5 21V12a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9',
};

export default function RuledPaper({ noteId, pageId, page, onChangePage }) {
  const [elements, setElements] = useLocalStorage(`eduhub_pg_${noteId}_${pageId}`, []);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#1f2937');
  const [width, setWidth] = useState(4);
  const [text, setText] = useState('');
  const controllerRef = useRef(null);
  const isDown = useRef(false);
  const drawRef = useRef(null);
  const undoRef = useRef([]);
  const redoRef = useRef([]);

  const norm = useCallback(
    (v) => (Array.isArray(v) ? v : []),
    []
  );

  useEffect(() => {
    undoRef.current = [];
    redoRef.current = [];
  }, [pageId, noteId]);

  const getPos = (e) => {
    const el = controllerRef.current;
    const rect = el.getBoundingClientRect();
    return {
      x: e.clientX - rect.left + el.scrollLeft,
      y: e.clientY - rect.top + el.scrollTop,
    };
  };

  const updateStroke = useCallback(
    (stroke) => {
      setElements((prev) => {
        const base = norm(prev);
        const idx = base.findIndex((el) => el.id === stroke.id);
        if (idx === -1) return [...base, stroke];
        return base.map((el) => (el.id === stroke.id ? stroke : el));
      });
    },
    [setElements, norm]
  );

  const onPointerDown = (e) => {
    e.preventDefault();
    const p = getPos(e);
    if (tool === 'text') {
      const content = text.trim();
      if (content) {
        const size = 24 + (width > 6 ? Math.min(22, width * 2) : 20);
        setElements([...norm(elements), { id: uid(), type: 'text', content, x: p.x, y: p.y, color, size }]);
        setText('');
      }
      return;
    }
    if (tool === 'space') {
      const shiftY = 260;
      setElements(
        norm(elements).map((el) => {
          if (el.type === 'stroke') {
            const below = el.points.some((pt) => pt.y >= p.y);
            return below
              ? { ...el, points: el.points.map((pt) => (pt.y >= p.y ? { ...pt, y: pt.y + shiftY } : pt)) }
              : el;
          }
          return el.y >= p.y
            ? { ...el, y: el.y + shiftY }
            : el;
        })
      );
      setTool('pen');
      return;
    }
    controllerRef.current?.setPointerCapture?.(e.pointerId);
    isDown.current = true;
    drawRef.current = {
      id: uid(),
      type: 'stroke',
      color,
      width: tool === 'eraser' ? width * 4 : tool === 'highlighter' ? width * 3.2 : width,
      points: [p],
      eraser: tool === 'eraser',
      highlight: tool === 'highlighter',
    };
  };

  const onPointerMove = (e) => {
    if (!isDown.current || !drawRef.current) return;
    const p = getPos(e);
    const pts = drawRef.current.points;
    const last = pts[pts.length - 1];
    if (last && Math.abs(last.x - p.x) < 1 && Math.abs(last.y - p.y) < 1) return;
    pts.push(p);
    updateStroke(drawRef.current);
  };

  const onPointerUp = (e) => {
    e.preventDefault();
    if (!isDown.current || !drawRef.current) return;
    drawRef.current.points.push(getPos(e));
    updateStroke(drawRef.current);
    undoRef.current.push(drawRef.current);
    redoRef.current = [];
    drawRef.current = null;
    isDown.current = false;
  };

  const undo = () => {
    setElements((prev) => {
      const base = norm(prev);
      if (!base.length) return prev;
      undoRef.current.push(base[base.length - 1]);
      redoRef.current.push(base[base.length - 1]);
      return base.slice(0, -1);
    });
  };

  const redo = () => {
    const item = redoRef.current.pop();
    if (!item) return;
    undoRef.current = [];
    setElements([...norm(elements), item]);
  };

  const clearPage = () => {
    if (window.confirm(`Clear page "${page.name}"?`)) {
      setElements([]);
      undoRef.current = [];
      redoRef.current = [];
    }
  };

  const exportPng = () => {
    const el = controllerRef.current;
    const dpr = 2;
    const maxY = norm(elements).reduce((m, elm) => {
      if (elm.type === 'stroke') for (const p of elm.points) m = Math.max(m, p.y);
      else if (elm.type === 'text') m = Math.max(m, elm.y);
      return m;
    }, 0);
    const h = Math.max(1200, Math.ceil(maxY + 420));
    const w = Math.max(1460, Math.ceil(el.clientWidth));
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    c.width = w * dpr;
    c.height = h * dpr;
    buildPaper(ctx, w, h, page.rule, page.tint, dpr);
    for (const elm of elements) {
      if (elm.type === 'stroke') {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (elm.eraser) { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; }
        else if (elm.highlight) { ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = elm.color; ctx.globalAlpha = 0.55; }
        else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = elm.color; ctx.globalAlpha = 1; }
        ctx.lineWidth = elm.width;
        elm.points.forEach((pt, i) => { if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); });
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = `600 ${elm.size}px 'ui-sans-serif', 'Segoe UI', sans-serif`;
        ctx.fillStyle = elm.color;
        ctx.fillText(elm.content, elm.x, elm.y);
      }
    }
    const a = document.createElement('a');
    a.download = `${page.name || 'notebook-page'}.png`;
    a.href = c.toDataURL('image/png');
    a.click();
  };

  const toolBtn = (id, label) => (
    <button
      onClick={() => setTool(id)}
      className={`px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-1.5 shrink-0 ${
        tool === id
          ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
          : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
      }`}
      title={label}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={TOOL_ICONS[id]} />
      </svg>
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-slate-800 bg-slate-900/80">
        {toolBtn('pen', 'Pen')}
        {toolBtn('highlighter', 'Highlight')}
        {toolBtn('eraser', 'Eraser')}
        {toolBtn('text', 'Text')}
        {toolBtn('space', 'Insert Space')}

        <div className="flex items-center gap-1 px-1.5 py-1 bg-slate-800/70 rounded-lg border border-slate-700">
          {['#1f2937', '#3b82f6', '#059669', '#dc2626', '#d97706', '#7c3aed', '#db2777'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-4 h-4 rounded-full transition-transform"
              style={{
                background: c,
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
                boxShadow: color === c ? `0 0 0 2px #0f172a, 0 0 0 3.5px ${c}` : 'none',
              }}
            />
          ))}
          <label className="relative w-4 h-4 rounded-full border border-slate-600 cursor-pointer flex items-center justify-center overflow-hidden"
            style={{ background: 'conic-gradient(#dc2626,#d97706,#059669,#3b82f6,#7c3aed,#dc2626)' }}>
            <span className="text-[7px] font-bold text-white">+</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
        </div>

        <div className="flex items-center gap-1 px-1.5 py-1 bg-slate-800/70 rounded-lg border border-slate-700">
          {[2, 4, 7, 11, 16].map((w) => (
            <button key={w} onClick={() => setWidth(w)}
              className={`w-6 h-6 rounded-md flex items-center justify-center ${width === w ? 'bg-blue-500/20' : 'hover:bg-slate-700'}`}
              title={`${w}px`}>
              <span className="rounded-full" style={{ width: Math.max(2.5, w), height: Math.max(2.5, w), background: width === w ? '#60a5fa' : '#94a3b8' }} />
            </button>
          ))}
        </div>

        {tool === 'text' && (
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setTool('pen')}
            placeholder="Type then tap the page…"
            className="w-full sm:w-52 text-sm py-1.5" />
        )}

        <div className="flex-1" />

        {/* paper rule + tint */}
        <div className="flex items-center gap-1.5">
          <select value={page.rule} onChange={(e) => onChangePage({ rule: e.target.value })}
            className="text-xs py-1.5 rounded-lg bg-slate-800/70 border-slate-700" title="Paper pattern">
            <option value="ruled">Ruled</option>
            <option value="grid">Grid</option>
            <option value="dots">Dots</option>
            <option value="blank">Blank</option>
          </select>
          <select value={page.tint} onChange={(e) => onChangePage({ tint: e.target.value })}
            className="text-xs py-1.5 rounded-lg bg-slate-800/70 border-slate-700" title="Paper tint">
            <option value="white">White</option>
            <option value="ivory">Ivory</option>
            <option value="mint">Mint</option>
            <option value="sky">Sky</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={undo} disabled={!elements.length} className="btn-secondary btn-sm" title="Undo">↶</button>
          <button onClick={redo} disabled={!redoRef.current.length} className="btn-secondary btn-sm" title="Redo">↷</button>
          <button onClick={exportPng} className="btn-secondary btn-sm" title="Export PNG">⤓ PNG</button>
          <button onClick={clearPage} className="btn-danger btn-sm" title="Clear page">✕</button>
        </div>
      </div>

      <div
        ref={controllerRef}
        className="flex-1 min-h-0 overflow-auto bg-slate-950"
        style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <PaperCanvas elements={elements} page={page} containerRef={controllerRef} />

        {tool === 'space' && (
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-900/95 border border-blue-500/40 text-blue-300 text-xs px-3 py-1.5 rounded-lg z-20">
            Tap below any row to insert vertical space
          </div>
        )}
      </div>
    </div>
  );
}