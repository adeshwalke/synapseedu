import { useCallback, useRef, useState } from 'react';

export const SYNC_KEYS = [
  'eduhub_subjects',
  'eduhub_notes',
  'eduhub_tests',
  'eduhub_results',
  'eduhub_flashcards',
  'eduhub_mastery',
  'eduhub_textnotes',
];

function readLS(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return undefined; }
}
function writeLS(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { console.warn(key, e); }
}

// id-based union for arrays (newest updatedAt wins), shallow-merge for maps.
export function mergeValue(key, local, remote) {
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

export function useSync() {
  const [state, setState] = useState({ enabled: Boolean(window.__SYNAPSE_SYNC__), lastSync: null });
  const timer = useRef(null);

  const isEnabled = () => Boolean(window.__SYNAPSE_SYNC__) || location.port === '5183';

  const snapshot = useCallback(() => {
    const data = {};
    for (const k of SYNC_KEYS) {
      const v = readLS(k);
      if (v !== undefined) data[k] = v;
    }
    return data;
  }, []);

  const applyMerged = useCallback((remote) => {
    let incoming = 0;
    for (const k of SYNC_KEYS) {
      if (!(k in remote)) continue;
      const local = readLS(k);
      const merged = mergeValue(k, local, remote[k]);
      const localStr = JSON.stringify(local ?? null);
      const mergedStr = JSON.stringify(merged);
      if (localStr !== mergedStr) incoming++;
      writeLS(k, merged);
    }
    return incoming;
  }, []);

  const pull = useCallback(async () => {
    const res = await fetch('/api/sync');
    if (!res.ok) throw new Error(`sync GET → ${res.status}`);
    const json = await res.json();
    const incoming = json?.data ? applyMerged(json.data) : 0;
    return incoming;
  }, [applyMerged]);

  const push = useCallback(async () => {
    const data = snapshot();
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: 'synapseedu', data }),
    });
    if (!res.ok) throw new Error(`sync POST → ${res.status}`);
    const json = await res.json();
    return json?.data ? applyMerged(json.data) : 0;
  }, [snapshot, applyMerged]);

  const syncNow = useCallback(async () => {
    if (!isEnabled()) throw new Error('Not running from the sync server (port 5183)');
    const outgoing = Object.keys(snapshot()).length;
    const incomingFromServer = await pull();
    const incomingBack = await push();
    const ts = new Date().toISOString();
    setState({ enabled: true, lastSync: ts });
    return { outgoing, incoming: incomingFromServer + incomingBack };
  }, [pull, push, snapshot]);

  const schedulePush = useCallback(() => {
    if (!isEnabled()) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      push().catch((e) => console.warn('auto-push failed', e));
    }, 4000);
  }, [push]);

  const boot = useCallback(async () => {
    if (!isEnabled()) return;
    schedulePush(); // upload local history promptly
    try {
      const n = await pull();
      setState({ enabled: true, lastSync: new Date().toISOString() });
      if (n > 0) console.log(`[sync] merged ${n} remote keys`);
    } catch (e) {
      console.warn('initial sync pull failed', e);
    }
  }, [pull, schedulePush]);

  return { state, syncNow, schedulePush, boot, snapshot, applyMerged, isEnabled };
}