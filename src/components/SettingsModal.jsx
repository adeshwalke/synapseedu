import { useState } from 'react';
import { PERSONAS, SPECIALTIES, SPECIALTY_LABELS } from '../knowledge/knowledgeBase';

export default function SettingsModal({ config, setConfig, onClose, syncState, syncNow }) {
  const [tab, setTab] = useState('ai');
  const [apiDraft, setApiDraft] = useState(config.apiKey || '');
  const [syncMsg, setSyncMsg] = useState(null);

  const saveAi = () => {
    setConfig({ ...config, apiKey: apiDraft.trim(), online: Boolean(apiDraft.trim()) });
    setSyncMsg(null);
  };

  const exportAll = () => {
    const keys = [
      'eduhub_subjects', 'eduhub_notes', 'eduhub_tests', 'eduhub_results',
      'eduhub_flashcards', 'eduhub_mastery', 'eduhub_textnotes', 'eduhub_config',
    ];
    const data = {};
    for (const k of keys) {
      try { data[k] = JSON.parse(localStorage.getItem(k) || 'null'); } catch {}
    }
    const blob = new Blob([JSON.stringify({ app: 'SynapseEdu', exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `synapseedu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importAll = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const data = parsed?.data || parsed || {};
        let count = 0;
        for (const [k, v] of Object.entries(data)) {
          if (v === null || v === undefined) { localStorage.removeItem(k); continue; }
          try { localStorage.setItem(k, JSON.stringify(v)); count++; } catch {}
        }
        alert(`Restored ${count} storage keys. Reloading…`);
        window.location.reload();
      } catch (err) {
        alert('Invalid backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const doSync = async () => {
    setSyncMsg('Syncing…');
    try {
      const report = await syncNow();
      setSyncMsg(`✓ ${report.incoming} remote keys merged · ${report.outgoing} keys pushed · last sync ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      setSyncMsg(`✗ ${e.message}`);
    }
  };

  const input = 'w-full text-sm';

  return (
    <div className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] flex flex-col p-0! overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold">Settings</h2>
          <button className="btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="flex gap-1 px-3 pt-3">
          <button className={`tab-btn ${tab === 'ai' ? 'active' : ''}`} onClick={() => setTab('ai')}>SynapseAI</button>
          <button className={`tab-btn ${tab === 'sync' ? 'active' : ''}`} onClick={() => setTab('sync')}>Wi-Fi Sync</button>
          <button className={`tab-btn ${tab === 'data' ? 'active' : ''}`} onClick={() => setTab('data')}>Data</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'ai' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">AI name</label>
                <input className={input} value={config.name || 'SynapseAI'}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })} />
                <p className="text-xs text-slate-500 mt-1">e.g. SynapseAI, Dr. Synapse, Dr. House, Cortex</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Default specialty</label>
                <select className={input} value={config.specialty}
                  onChange={(e) => setConfig({ ...config, specialty: e.target.value })}>
                  <option value="general">General</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{SPECIALTY_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Persona</label>
                <div className="space-y-1.5">
                  {PERSONAS.map((p) => (
                    <label key={p.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2 cursor-pointer transition-all ${config.persona === p.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'}`}>
                      <input type="radio" name="persona" checked={config.persona === p.id}
                        onChange={() => setConfig({ ...config, persona: p.id })} className="accent-blue-500 mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">{p.label}</span>
                        <span className="block text-xs text-slate-500">{p.blurb}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Google Gemini API key (optional)</label>
                <input className={input} value={apiDraft} onChange={(e) => setApiDraft(e.target.value)}
                  placeholder="AIza… (stored only on this device)" />
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500">
                    {apiDraft.trim() ? 'Online generation will use Gemini when the key is saved.' : 'No key — SynapseAI runs fully offline from the built-in curriculum.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Model</label>
                  <select className={input} value={config.model || 'gemini-2.0-flash'}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="btn-primary btn-sm w-full" onClick={saveAi}>Save AI settings</button>
                </div>
              </div>
            </>
          )}

          {tab === 'sync' && (
            <>
              <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-sm leading-relaxed">
                <p className="font-medium mb-1">Local Wi-Fi Sync Hub</p>
                <p className="text-slate-400 text-xs">
                  Start the bundled Node server ({'desktop-server.js'}, port 5183) in the project root and open it
                  from any device on the same Wi-Fi: <code className="text-blue-300">http://&lt;this-pc-ip&gt;:5183</code>.
                  Notes, subjects, tests, and flashcard progress all sync through its /api/sync endpoint.
                </p>
              </div>
              <button className="btn-success w-full" onClick={doSync} disabled={syncNow ? false : undefined}>
                {syncNow ? 'Sync now' : 'Sync unavailable (not 5183)'}
              </button>
              {syncMsg && <p className="text-xs text-slate-400">{syncMsg}</p>}
              {syncState?.lastSync && <p className="text-xs text-slate-500">Last successful sync: {new Date(syncState.lastSync).toLocaleString()}</p>}
              <p className="text-xs text-slate-500">
                When running from port 5183 the app auto-pulls the shared dataset on load and pushes local changes
                automatically. This panel gives you a manual nudge button.
              </p>
            </>
          )}

          {tab === 'data' && (
            <>
              <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-sm text-slate-300">
                Backup everything (subjects, notebooks, tests, flashcards, progress) to a JSON file. Restore on any device.
              </div>
              <div className="flex gap-2 flex-wrap">
                <button className="btn-primary btn-sm" onClick={exportAll}>⬇ Export backup</button>
                <label className="btn-secondary btn-sm cursor-pointer">
                  ⬆ Import backup
                  <input type="file" accept="application/json" onChange={importAll} className="hidden" />
                </label>
              </div>
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer">Storage usage</summary>
                <ServerStorageReport />
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ServerStorageReport() {
  let total = 0;
  const rows = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    const bytes = (localStorage.getItem(k) || '').length * 2;
    total += bytes;
    if (k && k.startsWith('eduhub')) rows.push({ k, bytes });
  }
  return (
    <div className="mt-2">
      <p className="mb-1">Total SynapseEdu data: {(total / 1024).toFixed(1)} KB</p>
      <ul className="space-y-0.5">
        {rows.sort((a, b) => b.bytes - a.bytes).slice(0, 12).map((r) => (
          <li key={r.k} className="flex justify-between"><span className="truncate">{r.k}</span><span>{(r.bytes / 1024).toFixed(1)} KB</span></li>
        ))}
      </ul>
    </div>
  );
}