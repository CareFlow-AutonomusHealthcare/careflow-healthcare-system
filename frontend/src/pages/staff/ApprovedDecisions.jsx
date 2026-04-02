import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { careflowAPI } from '../../api/client';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#2d3133',color:'#eff1f3',fontSize:11,padding:'6px 10px',borderRadius:8}}>
      <p style={{fontWeight:'bold',marginBottom:2}}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{color:p.color}}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function ApprovedDecisions() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careflowAPI.getAllProposals()
      .then(r => setProposals(r.data.filter(p => p.status !== 'Pending')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approved = proposals.filter(p => p.status === 'Approved').length;
  const rejected = proposals.filter(p => p.status === 'Rejected').length;

  const actionData = [
    { name: 'Escalate', Approved: proposals.filter(p => p.suggested_action === 'Escalate' && p.status === 'Approved').length, Rejected: proposals.filter(p => p.suggested_action === 'Escalate' && p.status === 'Rejected').length },
    { name: 'Follow-up', Approved: proposals.filter(p => p.suggested_action === 'Follow-up' && p.status === 'Approved').length, Rejected: proposals.filter(p => p.suggested_action === 'Follow-up' && p.status === 'Rejected').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Approved Decisions</h2>
        <p className="text-on-surface-variant mt-1">All resolved risk proposals and doctor decisions.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Total Resolved', value: proposals.length, border: 'border-secondary', text: 'text-on-surface' },
          { label: 'Approved', value: approved, border: 'border-green-600', text: 'text-green-700' },
          { label: 'Rejected', value: rejected, border: 'border-error', text: 'text-error' },
        ].map(s => (
          <div key={s.label} className={`stat-card border-t-4 ${s.border}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{s.label}</p>
            <p className={`font-headline text-4xl font-extrabold ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {proposals.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
          <h3 className="font-headline font-bold text-on-surface mb-1">By Action Type</h3>
          <p className="text-xs text-on-surface-variant mb-4">Approval vs rejection per risk category</p>
          <div className="flex gap-4 text-xs font-bold mb-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-600"></span>Approved</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-error"></span>Rejected</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={actionData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c2c6d4" strokeOpacity={0.3} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#424752' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="Approved" fill="#2e7d32" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Rejected" fill="#ba1a1a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-16 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-20">task_alt</span>
          <p className="font-semibold">No resolved decisions yet.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-primary-fixed border-b border-primary/10 flex items-center justify-between">
            <h3 className="font-headline font-bold text-on-primary-fixed">Decision History</h3>
            <div className="flex gap-4 text-xs font-bold text-on-primary-fixed-variant">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>{approved} Approved</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span>{rejected} Rejected</span>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Patient</th><th>Action</th><th>Decision</th><th>Comment</th><th>Date</th></tr>
            </thead>
            <tbody>
              {proposals.map(p => (
                <tr key={p.proposal_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                        {(p.patient_name || 'P').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{p.patient_name}</p>
                        <p className="text-xs text-on-surface-variant font-mono">Risk: {p.score}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-on-surface-variant">{p.suggested_action}</td>
                  <td>
                    <span className={p.status === 'Approved' ? 'chip-success' : 'chip-high'}>
                      {p.status === 'Approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td className="text-sm text-on-surface-variant max-w-xs">
                    {p.decision?.comment || <span className="text-outline">—</span>}
                  </td>
                  <td className="text-xs text-on-surface-variant whitespace-nowrap">
                    {p.decision ? new Date(p.decision.decision_timestamp).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
