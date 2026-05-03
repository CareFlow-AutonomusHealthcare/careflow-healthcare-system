import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { careflowAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-inverse-surface text-inverse-on-surface text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [allProposals, setAllProposals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    careflowAPI.getPendingProposals().then(r => setProposals(r.data)).catch(() => {});
    careflowAPI.listPatients().then(r => setPatients(r.data)).catch(() => {});
    careflowAPI.getAllProposals().then(r => setAllProposals(r.data)).catch(() => {});
  }, []);

  const runEngine = async () => {
    setScoring(true);
    try {
      await careflowAPI.triggerBatchScoring();
      const [p, all] = await Promise.all([careflowAPI.getPendingProposals(), careflowAPI.getAllProposals()]);
      setProposals(p.data); setAllProposals(all.data);
    } catch {}
    finally { setScoring(false); }
  };

  const highRisk = proposals.filter(p => p.suggested_action === 'Escalate').length;

  // Build 7-day proposal trend from allProposals
  const trendData = (() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), day: d.toDateString(), Escalate: 0, 'Follow-up': 0 };
    });
    allProposals.forEach(p => {
      const pd = new Date(p.created_at).toDateString();
      const slot = days.find(d => d.day === pd);
      if (slot) slot[p.suggested_action] = (slot[p.suggested_action] || 0) + 1;
    });
    return days;
  })();

  // Risk distribution bar chart
  const riskDist = [
    { name: 'High Risk', count: allProposals.filter(p => p.suggested_action === 'Escalate').length, fill: '#ba1a1a' },
    { name: 'Follow-up', count: allProposals.filter(p => p.suggested_action === 'Follow-up').length, fill: '#793100' },
    { name: 'Approved', count: allProposals.filter(p => p.status === 'Approved').length, fill: '#2e7d32' },
    { name: 'Rejected', count: allProposals.filter(p => p.status === 'Rejected').length, fill: '#4a6178' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Clinical Dashboard</h2>
          <p className="text-on-surface-variant mt-1">Welcome back, {user?.full_name}. Here's your patient overview.</p>
        </div>
        <button onClick={runEngine} disabled={scoring} className="clinical-btn-primary px-5 py-2.5 disabled:opacity-60">
          <span className={`material-symbols-outlined text-lg ${scoring ? 'animate-spin' : ''}`}>
            {scoring ? 'progress_activity' : 'refresh'}
          </span>
          {scoring ? 'Scoring...' : 'Run Risk Engine'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Active Patients', value: patients.length || 0, icon: 'person', color: 'border-primary', accent: 'text-primary' },
          { label: 'Pending Proposals', value: proposals.length, icon: 'description', color: 'border-tertiary', accent: 'text-tertiary' },
          { label: 'Escalations', value: highRisk, icon: 'priority_high', color: 'border-error', accent: 'text-error' },
          { label: 'Total Resolved', value: allProposals.filter(p => p.status !== 'Pending').length, icon: 'verified', color: 'border-secondary', accent: 'text-secondary' },
        ].map(s => (
          <div key={s.label} className={`stat-card border-t-4 ${s.color}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{s.label}</span>
              <span className={`material-symbols-outlined text-xl ${s.accent}`}>{s.icon}</span>
            </div>
            <p className={`text-4xl font-extrabold font-headline ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 7-day proposal trend */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-headline font-bold text-on-surface">Proposal Trend</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Last 7 days — escalations vs follow-ups</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-error"></span>Escalate</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>Follow-up</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="escalateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="followupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#793100" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#793100" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#c2c6d4" strokeOpacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Escalate" stroke="#ba1a1a" strokeWidth={2} fill="url(#escalateGrad)" />
              <Area type="monotone" dataKey="Follow-up" stroke="#793100" strokeWidth={2} fill="url(#followupGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution bar */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
          <div className="mb-5">
            <h3 className="font-headline font-bold text-on-surface">Risk Distribution</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">All-time proposal breakdown by category</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskDist} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c2c6d4" strokeOpacity={0.3} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {riskDist.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending proposals table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-primary-fixed border-b border-primary/10">
          <h3 className="font-headline font-bold text-on-primary-fixed text-lg">Pending Risk Proposals</h3>
          <a href="/doctor/proposals" className="text-xs font-bold text-primary hover:underline">View All →</a>
        </div>
        {proposals.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">check_circle</span>
            <p className="text-sm">All proposals resolved. Run the risk engine to generate new ones.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Risk Level</th><th>Suggested Action</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {proposals.slice(0, 5).map(p => (
                <tr key={p.proposal_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">
                        {(p.patient_name || 'P').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{p.patient_name || `Patient #${p.patient_id}`}</p>
                        <p className="text-xs text-on-surface-variant">ID: #{String(p.patient_id || '').padStart(5, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={p.suggested_action === 'Escalate' ? 'chip-high' : 'chip-medium'}>{p.suggested_action === 'Escalate' ? 'High Risk' : 'Moderate'}</span></td>
                  <td className="text-sm text-on-surface-variant">{p.suggested_action}</td>
                  <td className="text-right"><a href="/doctor/proposals" className="clinical-btn-primary px-4 py-1.5 text-xs inline-flex">Review</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
