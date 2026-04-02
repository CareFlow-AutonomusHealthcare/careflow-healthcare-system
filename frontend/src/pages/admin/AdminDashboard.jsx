import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { careflowAPI } from '../../api/client';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-inverse-surface text-inverse-on-surface text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    careflowAPI.listPatients().then(r => setPatients(r.data)).catch(() => {});
    careflowAPI.listUsers().then(r => setUsers(r.data)).catch(() => {});
    careflowAPI.getAllProposals().then(r => setProposals(r.data)).catch(() => {});
    careflowAPI.getInventory().then(r => setInventory(r.data)).catch(() => {});
  }, []);

  const runEngine = async () => {
    setScoring(true);
    try { await careflowAPI.triggerBatchScoring(); await careflowAPI.getAllProposals().then(r => setProposals(r.data)); }
    catch {}
    finally { setScoring(false); }
  };

  const pending = proposals.filter(p => p.status === 'Pending').length;
  const highRisk = proposals.filter(p => p.suggested_action === 'Escalate' && p.status === 'Pending').length;
  const criticalItems = inventory.filter(i => i.quantity_in_stock <= 10).length;
  const doctors = users.filter(u => u.role === 'doctor').length;

  // 30-day proposal trend (detected vs resolved)
  const trendData = (() => {
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (7 - i) * 4);
      return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), day: d.getTime(), Detected: 0, Resolved: 0 };
    });
    proposals.forEach(p => {
      const t = new Date(p.created_at).getTime();
      const slot = weeks.reduce((prev, curr) => Math.abs(curr.day - t) < Math.abs(prev.day - t) ? curr : prev);
      slot.Detected++;
      if (p.status !== 'Pending') slot.Resolved++;
    });
    return weeks;
  })();

  // Inventory bar chart — top 8 items by stock
  const inventoryChart = inventory
    .sort((a, b) => a.quantity_in_stock - b.quantity_in_stock)
    .slice(0, 8)
    .map(i => ({ name: i.item_name.length > 14 ? i.item_name.slice(0, 14) + '…' : i.item_name, qty: i.quantity_in_stock, fill: i.quantity_in_stock <= 10 ? '#ba1a1a' : i.quantity_in_stock <= 50 ? '#793100' : '#00478d' }));

  // Decision outcome pie
  const decisionPie = [
    { name: 'Approved', value: proposals.filter(p => p.status === 'Approved').length, color: '#2e7d32' },
    { name: 'Rejected', value: proposals.filter(p => p.status === 'Rejected').length, color: '#ba1a1a' },
    { name: 'Pending', value: pending, color: '#793100' },
  ].filter(d => d.value > 0);

  // User role pie
  const userPie = [
    { name: 'Doctors', value: users.filter(u => u.role === 'doctor').length, color: '#00478d' },
    { name: 'Staff', value: users.filter(u => u.role === 'staff').length, color: '#4a6178' },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#793100' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Global Health Analytics</h2>
          <p className="text-on-surface-variant mt-1">Real-time system-wide monitoring of clinical risks, supply chains, and infrastructure.</p>
        </div>
        <button onClick={runEngine} disabled={scoring} className="clinical-btn-primary px-5 py-2.5 disabled:opacity-60">
          <span className={`material-symbols-outlined text-lg ${scoring ? 'animate-spin' : ''}`}>
            {scoring ? 'progress_activity' : 'refresh'}
          </span>
          {scoring ? 'Scoring...' : 'Run Risk Engine'}
        </button>
      </div>

      {/* Hero + tech panel */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-error/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-error mb-2 block">Current Status</span>
                <h3 className="font-headline text-3xl font-extrabold text-on-surface">
                  System Risk: {highRisk > 5 ? 'Elevated' : highRisk > 0 ? 'Moderate' : 'Normal'}
                </h3>
              </div>
              <div className="text-right">
                <div className="font-headline text-5xl font-extrabold text-error">{Math.min(highRisk * 5 + 40, 99)}<span className="text-xl font-medium text-outline">/100</span></div>
                <div className="text-xs text-on-surface-variant mt-1">Severity Index</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                { label: 'Active High-Risk', value: highRisk, sub: 'Pending escalations', color: 'text-error' },
                { label: 'Unresolved Proposals', value: pending, sub: `${proposals.length - pending} addressed`, color: 'text-on-surface' },
                { label: 'Total Patients', value: patients.length, sub: 'Under monitoring', color: 'text-primary' },
              ].map(s => (
                <div key={s.label} className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-sm text-on-surface-variant mb-1">{s.label}</p>
                  <p className={`font-headline text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-inverse-surface text-white rounded-xl p-8 shadow-sm">
          <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-fixed">memory</span>
            Technical Infrastructure
          </h3>
          <div className="space-y-5">
            {[
              { label: 'DATABASE CLUSTER', value: '99.98% UPTIME', bar: 99 },
              { label: 'RISK ENGINE', value: 'ACTIVE', bar: 100 },
              { label: 'API LATENCY', value: '42ms', bar: 85 },
            ].map(t => (
              <div key={t.label}>
                <div className="flex justify-between text-xs mb-2 text-slate-400 font-medium">
                  <span>{t.label}</span>
                  <span className="text-green-400">{t.value}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${t.bar}%` }}></div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Total Users</span><span className="font-mono">{users.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Doctors</span><span className="font-mono">{doctors}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Critical Inventory</span><span className={`font-mono ${criticalItems > 0 ? 'text-red-400' : 'text-green-400'}`}>{criticalItems} items</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk trajectory chart */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-headline font-bold text-on-surface">Risk Trajectory</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Detected vs. Resolved proposal trends (30 days)</p>
          </div>
          <div className="flex gap-5 text-xs font-bold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span>Detected</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>Resolved</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00478d" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00478d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c2c6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c2c6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#c2c6d4" strokeOpacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Detected" stroke="#00478d" strokeWidth={2.5} fill="url(#detectedGrad)" />
            <Area type="monotone" dataKey="Resolved" stroke="#c2c6d4" strokeWidth={2} fill="url(#resolvedGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom charts row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Inventory bar */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm p-6">
          <div className="mb-5">
            <h3 className="font-headline font-bold text-on-surface">Inventory Levels</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Lowest stock items — color coded by severity</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={inventoryChart} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c2c6d4" strokeOpacity={0.3} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                {inventoryChart.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Decision outcome pie */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-headline font-bold text-on-surface">Decision Outcomes</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">All-time proposal resolution breakdown</p>
          </div>
          {decisionPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={decisionPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {decisionPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#2d3133', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-on-surface-variant text-sm">No proposals yet</div>
          )}
        </div>

        {/* User distribution */}
        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-headline font-bold text-on-surface">Staff Distribution</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{users.length} total system users</p>
          </div>
          {userPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={userPie} cx="50%" cy="50%" outerRadius={65} paddingAngle={3} dataKey="value">
                  {userPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#2d3133', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : null}
          <div className="space-y-2 mt-2">
            {userPie.map(r => (
              <div key={r.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: r.color }}></span>
                  <span className="text-on-surface-variant">{r.name}</span>
                </div>
                <span className="font-bold">{r.value}</span>
              </div>
            ))}
          </div>
          <a href="/admin/users" className="clinical-btn-ghost w-full mt-4 py-2 border border-outline-variant/30 rounded-lg text-xs justify-center">
            Manage Users →
          </a>
        </div>
      </div>
    </div>
  );
}
