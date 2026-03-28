import React, { useState, useEffect } from 'react';
import { Activity, Users, Package, ClipboardCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { careflowAPI } from '../../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_PATIENTS = [
  { patient_id: 1, full_name: 'Arthur Pendelton', score: 9.2, risk: 'High', history: [4.5,5.2,7.8,8.5,9.2].map((s,i)=>({date:`W${i+1}`,score:s})) },
  { patient_id: 2, full_name: 'Sarah Jenkins', score: 6.5, risk: 'Moderate', history: [6.2,6.8,6.4,6.5,6.5].map((s,i)=>({date:`W${i+1}`,score:s})) },
  { patient_id: 3, full_name: 'Michael Chang', score: 2.1, risk: 'Low', history: [5.5,4.2,3.8,2.5,2.1].map((s,i)=>({date:`W${i+1}`,score:s})) },
];

export default function AdminDashboard() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [users, setUsers] = useState([]);
  const [isScoring, setIsScoring] = useState(false);

  useEffect(() => {
    careflowAPI.listUsers().then(r => setUsers(r.data)).catch(() => {});
    careflowAPI.listPatients().then(r => setPatients(r.data.map((p, i) => ({
      ...p, score: MOCK_PATIENTS[i % MOCK_PATIENTS.length]?.score || 5,
      risk: 'Moderate', history: MOCK_PATIENTS[i % MOCK_PATIENTS.length]?.history || []
    })))).catch(() => {});
  }, []);

  const handleBatchScore = async () => {
    setIsScoring(true);
    try { await careflowAPI.triggerBatchScoring(); } catch {}
    finally { setIsScoring(false); }
  };

  const doctorCount = users.filter(u => u.role === 'doctor').length;
  const staffCount = users.filter(u => u.role === 'staff').length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-gray-400">Full system overview.</p>
        </div>
        <button onClick={handleBatchScore} disabled={isScoring} className="clinical-btn-primary">
          <RefreshCw size={16} className={isScoring ? 'animate-spin' : ''} />
          {isScoring ? 'Scoring...' : 'Run Risk Engine'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: patients.length, icon: Activity, color: 'text-clinical-accent' },
          { label: 'Doctors', value: doctorCount, icon: Users, color: 'text-clinical-warning' },
          { label: 'Staff', value: staffCount, icon: Users, color: 'text-clinical-success' },
          { label: 'High Risk', value: patients.filter(p => p.risk === 'High').length, icon: AlertTriangle, color: 'text-clinical-danger' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon size={22} className={`${stat.color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* Patient Table */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="text-clinical-accent" size={18} /> Patient Risk Overview
        </h3>
        <div className="space-y-2">
          {patients.map(p => (
            <div key={p.patient_id} className="flex items-center justify-between p-3 hover:bg-clinical-700/30 rounded-lg transition-colors">
              <div className="w-1/3">
                <p className="font-medium text-gray-200">{p.full_name}</p>
                <p className="text-xs text-gray-500">ID: {String(p.patient_id).padStart(5,'0')}</p>
              </div>
              <div className="w-1/3 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={p.history || []}>
                    <Line type="monotone" dataKey="score" stroke={p.risk === 'High' ? '#EF4444' : p.risk === 'Moderate' ? '#F59E0B' : '#10B981'} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/3 text-right">
                <span className={`text-xl font-bold ${p.risk === 'High' ? 'text-clinical-danger' : p.risk === 'Moderate' ? 'text-clinical-warning' : 'text-clinical-success'}`}>
                  {typeof p.score === 'number' ? p.score.toFixed(1) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
