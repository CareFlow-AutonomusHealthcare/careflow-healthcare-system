import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { careflowAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-inverse-surface text-inverse-on-surface text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [staffing, setStaffing] = useState([]);

  useEffect(() => {
    careflowAPI.listPatients().then(r => setPatients(r.data)).catch(() => {});
    careflowAPI.getDoctors().then(r => setDoctors(r.data)).catch(() => {});
    careflowAPI.getNursingStaff().then(r => setStaff(r.data)).catch(() => {});
    careflowAPI.getAllProposals().then(r => setDecisions(r.data.filter(p => p.status !== 'Pending').slice(0, 5))).catch(() => {});
    careflowAPI.getStaffing().then(r => setStaffing(r.data)).catch(() => {});
  }, []);

  const onDutyDoctors = doctors.filter(d => d.is_present).length;
  const onDutyStaff = staff.filter(s => s.is_present).length;

  // Staffing capacity chart — current vs required per dept
  const staffingChart = staffing.slice(0, 6).map((s, i) => ({
    name: `Dept ${s.department_id}`,
    Current: s.current_staff_count,
    Required: s.required_staff_count,
  }));

  // Condition distribution from patients
  const condMap = {};
  patients.forEach(p => Object.keys(p.chronic_conditions || {}).forEach(c => { condMap[c] = (condMap[c] || 0) + 1; }));
  const condData = Object.entries(condMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  const PIE_COLORS = ['#00478d', '#793100', '#ba1a1a', '#4a6178', '#2e7d32'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Coordinator Dashboard</h2>
        <p className="text-on-surface-variant mt-1">Welcome, {user?.full_name}. Here's today's hospital overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Bed Occupancy', value: `${Math.min(Math.round(patients.length * 0.84), 100)}%`, icon: 'bed', color: 'border-primary', accent: 'text-primary' },
          { label: 'Doctors On-Duty', value: onDutyDoctors, icon: 'stethoscope', color: 'border-tertiary', accent: 'text-tertiary' },
          { label: 'Staff On-Duty', value: onDutyStaff, icon: 'badge', color: 'border-green-600', accent: 'text-green-700' },
          { label: 'Active Patients', value: patients.length, icon: 'person', color: 'border-secondary', accent: 'text-secondary' },
        ].map(s => (
          <div key={s.label} className={`stat-card border-l-4 ${s.color}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{s.label}</span>
              <span className={`material-symbols-outlined text-xl ${s.accent}`}>{s.icon}</span>
            </div>
            <p className={`text-4xl font-extrabold font-headline ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Staffing capacity chart */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
          <div className="mb-5">
            <h3 className="font-headline font-bold text-on-surface">Staffing Capacity</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Current vs required staff per department</p>
          </div>
          <div className="flex gap-4 text-xs font-bold mb-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>Current</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-outline-variant"></span>Required</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={staffingChart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c2c6d4" strokeOpacity={0.3} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#424752' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Current" fill="#00478d" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Required" fill="#c2c6d4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Condition distribution pie */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
          <div className="mb-5">
            <h3 className="font-headline font-bold text-on-surface">Top Chronic Conditions</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Distribution across patient population</p>
          </div>
          {condData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={condData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {condData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#2d3133', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={v => v.charAt(0).toUpperCase() + v.slice(1)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-on-surface-variant text-sm">No patient data yet</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inpatient census */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-primary-fixed border-b border-primary/10 flex items-center justify-between">
            <h3 className="font-headline font-bold text-on-primary-fixed">Current Inpatient Census</h3>
            <a href="/staff/patients" className="text-xs font-bold text-primary hover:underline">View All →</a>
          </div>
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Status</th><th>Conditions</th></tr></thead>
            <tbody>
              {patients.slice(0, 6).map(p => {
                const conds = Object.keys(p.chronic_conditions || {}).length;
                return (
                  <tr key={p.patient_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                          {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.full_name}</p>
                          <p className="text-xs text-on-surface-variant">#{String(p.patient_id).padStart(5, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="chip-success">STABLE</span></td>
                    <td className="text-sm text-on-surface-variant">{conds > 0 ? `${conds} condition${conds > 1 ? 's' : ''}` : 'None'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent decisions feed */}
        <div className="bg-surface-container-low rounded-xl p-6">
          <h3 className="font-headline font-bold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Clinical Decisions
          </h3>
          <div className="space-y-4 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
            {decisions.length === 0 ? (
              <p className="text-sm text-on-surface-variant pl-8">No decisions yet.</p>
            ) : decisions.map(d => (
              <div key={d.proposal_id} className="relative pl-8">
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-surface-container-low z-10 ${d.status === 'Approved' ? 'bg-green-100' : 'bg-error-container'}`}>
                  <span className={`material-symbols-outlined text-xs font-bold ${d.status === 'Approved' ? 'text-green-700' : 'text-error'}`}>
                    {d.status === 'Approved' ? 'check' : 'close'}
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-on-surface">{d.suggested_action}</p>
                    <span className="text-[10px] text-on-surface-variant">{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{d.patient_name} · <span className={d.status === 'Approved' ? 'text-green-700 font-bold' : 'text-error font-bold'}>{d.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
