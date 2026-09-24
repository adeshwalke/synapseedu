/**
 * SynapseEdu local Wi-Fi Sync Hub
 *
 * Serves the built app (dist/) over the LAN and provides a shared dataset
 * endpoint that any device on the same network can pull/push.
 *
 *   GET  /api/sync  → { updatedAt, data }
 *   POST /api/sync  → merge client data, return merged snapshot
 *
 * Run:  node desktop-server.js   (or: npm run serve / npm start)
 * Data: synapse-shared-data.json
 */
import { createServer } from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 5183);
const HOST = '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_FILE = path.join(__dirname, 'synapse-shared-data.json');

const SYNC_KEYS = [
  'eduhub_subjects',
  'eduhub_notes',
  'eduhub_tests',
  'eduhub_results',
  'eduhub_flashcards',
  'eduhub_mastery',
  'eduhub_textnotes',
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

// ------- shared dataset -------

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { updatedAt: null, data: {} };
  }
}

function writeData(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

// id-based union for arrays (newest updatedAt wins), shallow-merge for maps.
function mergeValue(key, local, remote) {
  if (Array.isArray(remote)) {
    const localList = Array.isArray(local) ? local : [];
    const map = new Map();
    for (const item of localList) if (item && item.id) map.set(item.id, item);
    for (const item of remote) {
      if (!item || !item.id) continue;
      const existing = map.get(item.id);
      if (!existing) { map.set(item.id, item); continue; }
      const le = existing.updatedAt || existing.createdAt || '';
      const re = item.updatedAt || item.createdAt || '';
      map.set(item.id, re >= le ? item : existing);
    }
    return [...map.values()];
  }
  if (remote && typeof remote === 'object' && !Array.isArray(remote)) {
    return { ...(local && typeof local === 'object' ? local : {}), ...remote };
  }
  return remote;
}

function mergeStore(store, incoming) {
  const data = store.data || {};
  for (const k of SYNC_KEYS) {
    if (!incoming || !(k in incoming)) continue;
    data[k] = mergeValue(k, data[k], incoming[k]);
  }
  store.data = data;
  store.updatedAt = new Date().toISOString();
  return store;
}

// ------- static files -------

function serveStatic(req, res, pathname) {
  // SPA: unknown /unprefixed deep routes fall back to index.html
  let filePath;
  if (pathname === '/' || pathname === '') {
    filePath = path.join(DIST_DIR, 'index.html');
  } else if (pathname.startsWith('/api/')) {
    return null; // handled by router
  } else {
    filePath = path.join(DIST_DIR, decodeURIComponent(pathname.replace(/^\//, '')));
  }

  // Path traversal guard
  if (!filePath.startsWith(DIST_DIR)) {
    send(res, 403, 'application/json', JSON.stringify({ error: 'forbidden' }));
    return true;
  }

  let stat;
  try { stat = fs.statSync(filePath); } catch { stat = null; }

  if (stat && stat.isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const body = fs.readFileSync(filePath);
    // cache-busted built assets can be cached aggressively
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(body);
    return true;
  }

  // Missing asset under /assets/: cache-busting means a 404 is a hard error
  if (pathname.startsWith('/assets/')) {
    send(res, 404, 'application/json', JSON.stringify({ error: 'not found', path: pathname }));
    return true;
  }

  // SPA fallback for client-side routes
  try {
    const body = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': MIME['.html'] });
    res.end(body);
    return true;
  } catch {
    send(res, 404, 'application/json', JSON.stringify({ error: 'build output missing — run "npm run build" first' }));
    return true;
  }
}

function send(res, code, type, body) {
  res.writeHead(code, { 'Content-Type': type });
  res.end(body);
}

// ------- router -------

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname === '/api/sync') {
    const store = readData();
    return send(res, 200, 'application/json', JSON.stringify({
      updatedAt: store.updatedAt,
      data: store.data || {},
      serverTime: new Date().toISOString(),
    }));
  }

  if (req.method === 'POST' && pathname === '/api/sync') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 5e7) req.destroy(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const store = readData();
        mergeStore(store, payload && payload.data);
        writeData(store);
        return send(res, 200, 'application/json', JSON.stringify({
          updatedAt: store.updatedAt,
          data: store.data || {},
        }));
      } catch (e) {
        return send(res, 400, 'application/json', JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'HEAD') { res.writeHead(200); return res.end(); }

  if (!['GET', 'HEAD'].includes(req.method)) {
    return send(res, 405, 'application/json', JSON.stringify({ error: 'method not allowed' }));
  }

  return serveStatic(req, res, pathname);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n✗ Port ${PORT} is already in use.`);
    console.error('  Another process is listening on 5183 (possibly the older synapse-edu server).');
    console.error('  Options: stop that process, or run with:  PORT=5184 node desktop-server.js\n');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  const ifaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) ips.push(iface.address);
    }
  }
  console.log('');
  console.log('  SynapseEdu Wi-Fi Sync Hub running');
  console.log('  ─────────────────────────────────');
  console.log(`  Local:   http://localhost:${PORT}`);
  ips.forEach((ip) => console.log(`  LAN:     http://${ip}:${PORT}`));
  console.log(`  Shared data: ${DATA_FILE}`);
  console.log('');
});