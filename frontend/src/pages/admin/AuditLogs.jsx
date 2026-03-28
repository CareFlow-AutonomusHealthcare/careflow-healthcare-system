import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { careflowAPI } from '../../api/client';

const ACTION_COLORS = {
  INSERT: 'text-clinical-success bg-clinical-success/10 border-clinical-success/30',
  UPDATE: 'text-clinical-warning bg-clinical-warning/10 border-clinical-warning/30',
  DELETE: 'text-clinical-danger bg-clinical-danger/10 border-clinical-danger/30',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    careflowAPI.getAuditLogs(200)
      .then(r => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ScrollText className="text-purple-400" size={26} /> Audit Logs
          </h2>
          <p className="text-gray-400 mt-1">Immutable record of all system changes.</p>
        </div>
        <button onClick={load} disabled={loading} className="clinical-btn-outline text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-500">
          <ScrollText size={40} className="mx-auto mb-4 opacity-30" />
          <p>No audit logs yet.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="grid grid-cols-5 px-6 py-3 border-b border-clinical-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Table</div>
            <div>Entity ID</div>
            <div>Action</div>
            <div>Timestamp</div>
            <div className="text-right">Payload</div>
          </div>
          {logs.map(log => (
            <React.Fragment key={log.audit_id}>
              <div
                className="grid grid-cols-5 px-6 py-3 border-b border-clinical-border/50 hover:bg-clinical-700/20 transition-colors items-center cursor-pointer"
                onClick={() => setExpanded(expanded === log.audit_id ? null : log.audit_id)}
              >
                <div className="font-mono text-sm text-gray-300">{log.table_name}</div>
                <div className="font-mono text-sm text-gray-400">#{log.entity_id}</div>
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${ACTION_COLORS[log.action_type] || ''}`}>
                    {log.action_type}
                  </span>
                </div>
                <div className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</div>
                <div className="flex justify-end">
                  {expanded === log.audit_id ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                </div>
              </div>
              {expanded === log.audit_id && (
                <div className="px-6 py-4 bg-clinical-900/50 border-b border-clinical-border/50">
                  <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
                    {log.old_payload && (
                      <div>
                        <p className="text-gray-500 mb-1">Old Payload</p>
                        <pre className="bg-clinical-800 rounded p-3 text-gray-300 overflow-auto">
                          {JSON.stringify(log.old_payload, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_payload && (
                      <div>
                        <p className="text-gray-500 mb-1">New Payload</p>
                        <pre className="bg-clinical-800 rounded p-3 text-gray-300 overflow-auto">
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
  );
}
