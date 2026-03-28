import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { careflowAPI } from '../../api/client';

export default function ApprovedDecisions() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careflowAPI.getAllProposals()
      .then(r => setProposals(r.data.filter(p => p.status !== 'Pending')))
      .catch(() => setProposals([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <ClipboardList className="text-clinical-success" size={26} />
          Approved Decisions
        </h2>
        <p className="text-gray-400 mt-1">All resolved risk proposals and their doctor decisions.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading decisions...</div>
      ) : proposals.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-500">
          <ClipboardList size={40} className="mx-auto mb-4 opacity-30" />
          <p>No resolved decisions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <div key={p.proposal_id} className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {p.status === 'Approved' ? (
                      <CheckCircle size={18} className="text-clinical-success shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-clinical-danger shrink-0" />
                    )}
                    <span className="font-semibold text-gray-200">{p.patient_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      p.status === 'Approved'
                        ? 'bg-clinical-success/20 text-clinical-success'
                        : 'bg-clinical-danger/20 text-clinical-danger'
                    }`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-7">
                    Action: <span className="text-gray-300">{p.suggested_action}</span> •
                    Risk Score: <span className="font-mono text-clinical-warning">{p.score}</span>
                  </p>
                  {p.decision?.comment && (
                    <div className="ml-7 mt-2 flex items-start gap-2 bg-clinical-900/50 rounded-lg px-3 py-2 text-sm text-gray-300">
                      <MessageSquare size={14} className="text-clinical-accent mt-0.5 shrink-0" />
                      <span>{p.decision.comment}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">
                    {p.decision ? new Date(p.decision.decision_timestamp).toLocaleString() : '—'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    By: {p.decision?.approver_type || '—'} #{p.decision?.approver_id}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
