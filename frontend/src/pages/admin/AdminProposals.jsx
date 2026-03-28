import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { careflowAPI } from '../../api/client';

const STATUS_STYLES = {
  Pending: 'text-clinical-warning bg-clinical-warning/10 border-clinical-warning/30',
  Approved: 'text-clinical-success bg-clinical-success/10 border-clinical-success/30',
  Rejected: 'text-clinical-danger bg-clinical-danger/10 border-clinical-danger/30',
};

export default function AdminProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    careflowAPI.getAllProposals()
      .then(r => setProposals(r.data))
      .catch(() => setProposals([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? proposals : proposals.filter(p => p.status === filter);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <ClipboardCheck className="text-purple-400" size={26} /> All Proposals
        </h2>
        <p className="text-gray-400 mt-1">Complete history of all risk proposals and decisions.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-clinical-800 text-gray-400 border border-clinical-border hover:text-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-500">No proposals found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.proposal_id} className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-200">{p.patient_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${STATUS_STYLES[p.status] || ''}`}>
                      {p.status}
                    </span>
                    <span className="text-xs text-gray-500 bg-clinical-700 px-2 py-0.5 rounded">{p.suggested_action}</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Patient ID: {String(p.patient_id || '').padStart(5,'0')} •
                    Risk: <span className="font-mono text-clinical-warning">{p.score}</span>
                  </p>
                  {p.decision?.comment && (
                    <div className="mt-2 flex items-start gap-2 bg-clinical-900/50 rounded-lg px-3 py-2 text-sm text-gray-300">
                      <MessageSquare size={14} className="text-clinical-accent mt-0.5 shrink-0" />
                      <span>{p.decision.comment}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</p>
                  {p.decision && (
                    <p className="text-xs text-gray-600 mt-1">
                      Decided: {new Date(p.decision.decision_timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
