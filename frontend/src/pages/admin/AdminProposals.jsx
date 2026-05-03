import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

export default function AdminProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    careflowAPI.getAllProposals().then(r => setProposals(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? proposals : proposals.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Proposal History</h2>
        <p className="text-on-surface-variant mt-1">Complete audit of all AI-generated risk proposals and clinical decisions.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: proposals.length, color: 'text-on-surface' },
          { label: 'Pending', value: proposals.filter(p=>p.status==='Pending').length, color: 'text-tertiary' },
          { label: 'Approved', value: proposals.filter(p=>p.status==='Approved').length, color: 'text-green-700' },
          { label: 'Rejected', value: proposals.filter(p=>p.status==='Rejected').length, color: 'text-error' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{s.label}</p>
            <p className={`font-headline text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="bg-surface-container p-1 rounded-lg flex gap-1 w-fit">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-md text-xs font-bold transition-all ${filter === f ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16"><span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span></div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-primary-fixed border-b border-primary/10 flex items-center justify-between">
            <h3 className="font-headline font-bold text-on-primary-fixed">
              {filter === 'All' ? 'All Proposals' : `${filter} Proposals`}
            </h3>
            <span className="text-xs text-on-primary-fixed-variant font-bold">{filtered.length} records</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Action</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.proposal_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                        {(p.patient_name||'P').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{p.patient_name}</p>
                        <p className="text-xs text-on-surface-variant">#{String(p.patient_id||'').padStart(5,'0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-on-surface-variant">{p.suggested_action}</td>
                  <td><span className="font-mono font-bold text-sm text-error">{p.score}</span></td>
                  <td>
                    <span className={p.status==='Pending' ? 'chip-medium' : p.status==='Approved' ? 'chip-success' : 'chip-high'}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-sm text-on-surface-variant max-w-xs">
                    {p.decision?.comment
                      ? <span className="flex items-start gap-1"><span className="material-symbols-outlined text-sm text-primary">chat</span><span className="truncate">{p.decision.comment}</span></span>
                      : <span className="text-outline">—</span>}
                  </td>
                  <td className="text-xs text-on-surface-variant whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
