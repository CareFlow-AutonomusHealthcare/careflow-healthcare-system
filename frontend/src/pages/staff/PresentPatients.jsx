import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { careflowAPI } from '../../api/client';

const MOCK = [
  { patient_id: 1, full_name: 'Arthur Pendelton', chronic_conditions: { diabetes: true, hypertension: true } },
  { patient_id: 2, full_name: 'Sarah Jenkins', chronic_conditions: { asthma: true } },
  { patient_id: 3, full_name: 'Michael Chang', chronic_conditions: {} },
];

export default function PresentPatients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    careflowAPI.listPatients()
      .then(r => setPatients(r.data))
      .catch(() => setPatients(MOCK));
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Users className="text-clinical-success" size={26} />
          Present Patients
        </h2>
        <p className="text-gray-400 mt-1">Current patients in the system.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="grid grid-cols-4 px-6 py-3 border-b border-clinical-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Patient</div>
          <div>ID</div>
          <div>Conditions</div>
          <div>Status</div>
        </div>
        {patients.map(p => {
          const condCount = Object.keys(p.chronic_conditions || {}).length;
          return (
            <div key={p.patient_id} className="grid grid-cols-4 px-6 py-4 border-b border-clinical-border/50 last:border-0 hover:bg-clinical-700/30 transition-colors">
              <div className="font-medium text-gray-200">{p.full_name}</div>
              <div className="text-gray-400 font-mono text-sm">{String(p.patient_id).padStart(5, '0')}</div>
              <div className="text-sm text-gray-400">
                {condCount > 0 ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={12} className="text-clinical-warning" />
                    {condCount} condition{condCount > 1 ? 's' : ''}
                  </span>
                ) : 'None'}
              </div>
              <div>
                <span className="px-2 py-1 rounded-full text-xs bg-clinical-success/20 text-clinical-success border border-clinical-success/30">
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
