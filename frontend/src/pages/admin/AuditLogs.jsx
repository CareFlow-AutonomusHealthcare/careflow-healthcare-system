import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';

const ACTION_STYLES = {
  INSERT: 'chip-success',
  UPDATE: 'chip-warning',
  DELETE: 'chip-high',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('All');

  const load = () => {
    setLoading(true);
    careflowAPI.getAuditLogs(200).then(r => setLogs(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'All' ? logs : logs.filter(l => l.action_type === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Audit & Compliance Log</h2>
          <p className="text-on-surface-variant mt-1">Immutable ledger of clinical proposals and system-wide state changes.</p>
        </div>
        <button onClick={load} disabled={loading} className="clinical-btn-secondary px-4 py-2.5">
          <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>refresh</span>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: logs.length, color: 'text-on-surface' },
          { label: 'Inserts', value: logs.filter(l=>l.action_type==='INSERT').length, color: 'text-green-700' },
          { label: 'Updates', value: logs.filter(l=>l.action_type==='UPDATE').length, color: 'text-tertiary' },
          { label: 'Deletes', value: logs.filter(l=>l.action_type==='DELETE').length, color: 'text-error' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{s.label}</p>
            <p className={`font-headline text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-surface-container p-1 rounded-lg flex gap-1 w-fit">
        {['All','INSERT','UPDATE','DELETE'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-md text-xs font-bold transition-all ${filter===f ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16"><span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span></div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-primary-fixed border-b border-primary/10 flex items-center justify-between">
            <h3 className="font-headline font-bold text-on-primary-fixed">Technical Audit Log</h3>
            <span className="text-xs text-on-primary-fixed-variant font-bold">{filtered.length} entries</span>
          </div>
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-3 block opacity-20">history_edu</span>
              <p>No audit logs yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {filtered.map(log => (
                <React.Fragment key={log.audit_id}>
                  <div
                    className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === log.audit_id ? null : log.audit_id)}
                  >
                    <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${log.action_type==='INSERT'?'bg-green-500':log.action_type==='UPDATE'?'bg-tertiary':'bg-error'}`}></div>
                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="font-mono text-sm font-semibold text-on-surface">{log.table_name}</p>
                        <p className="text-xs text-on-surface-variant">Entity #{log.entity_id}</p>
                      </div>
                      <div><span className={ACTION_STYLES[log.action_type] || 'chip-low'}>{log.action_type}</span></div>
                      <div className="text-xs text-on-surface-variant">{new Date(log.created_at).toLocaleString()}</div>
                      <div className="text-right">
                        <span className="material-symbols-outlined text-on-surface-variant text-lg">
                          {expanded === log.audit_id ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expanded === log.audit_id && (
                    <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/10">
                      <div className="grid md:grid-cols-2 gap-4">
                        {log.old_payload && (
                          <div>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Old Payload</p>
                            <pre className="bg-inverse-surface text-inverse-on-surface rounded-xl p-4 text-xs font-mono overflow-auto max-h-48">
                              {JSON.stringify(log.old_payload, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_payload && (
                          <div>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">New Payload</p>
                            <pre className="bg-inverse-surface text-inverse-on-surface rounded-xl p-4 text-xs font-mono overflow-auto max-h-48">
                              {JSON.stringify(log.new_payload, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
