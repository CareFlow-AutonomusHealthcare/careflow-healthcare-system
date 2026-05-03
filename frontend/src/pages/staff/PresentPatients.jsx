import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';

export default function PresentPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    careflowAPI.listPatients().then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const filtered = patients.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Present Patients</h2>
          <p className="text-on-surface-variant mt-1">Current inpatient census — {patients.length} patients.</p>
        </div>
        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
            className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>MRN</th>
              <th>Chronic Conditions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const conds = Object.keys(p.chronic_conditions || {});
              return (
                <tr key={p.patient_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">
                        {p.full_name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <p className="text-sm font-semibold text-on-surface">{p.full_name}</p>
                    </div>
                  </td>
                  <td className="font-mono text-sm text-on-surface-variant">#{String(p.patient_id).padStart(5,'0')}</td>
                  <td>
                    {conds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {conds.slice(0,2).map(c => (
                          <span key={c} className="px-2 py-0.5 bg-surface-container-highest rounded-full text-xs text-on-surface-variant capitalize">
                            {c.replace(/_/g,' ')}
                          </span>
                        ))}
                        {conds.length > 2 && <span className="text-xs text-on-surface-variant">+{conds.length-2}</span>}
                      </div>
                    ) : <span className="text-xs text-on-surface-variant">None</span>}
                  </td>
                  <td><span className="chip-success">Active</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
