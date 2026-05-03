import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';

const PresenceBadge = ({ present }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${present ? 'bg-green-50 text-green-700' : 'bg-surface-container-highest text-on-surface-variant'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${present ? 'bg-green-500' : 'bg-slate-400'}`}></span>
    {present ? 'ON-DUTY' : 'OFF-DUTY'}
  </span>
);

export default function StaffPresence() {
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    careflowAPI.getDoctors().then(r => setDoctors(r.data)).catch(() => {});
    careflowAPI.getNursingStaff().then(r => setStaff(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Staff & Doctor Presence</h2>
        <p className="text-on-surface-variant mt-1">Real-time shift tracking and availability.</p>
      </div>

      {/* Doctors */}
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">stethoscope</span>
          Physicians ({doctors.filter(d=>d.is_present).length} on duty)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(d => (
            <div key={d.doctor_id} className={`bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform relative overflow-hidden ${!d.is_present ? 'opacity-60' : ''}`}>
              <div className="absolute top-3 right-3">
                <div className={`w-2.5 h-2.5 rounded-full ${d.is_present ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}`}></div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-lg">
                  {d.full_name.replace('Dr. ','').charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{d.full_name}</p>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{d.specialty}</p>
                </div>
              </div>
              <PresenceBadge present={d.is_present} />
            </div>
          ))}
        </div>
      </div>

      {/* Staff */}
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">badge</span>
          Nursing Staff ({staff.filter(s=>s.is_present).length} on duty)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(s => (
            <div key={s.staff_id} className={`bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform relative overflow-hidden ${!s.is_present ? 'opacity-60' : ''}`}>
              <div className="absolute top-3 right-3">
                <div className={`w-2.5 h-2.5 rounded-full ${s.is_present ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}`}></div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-700 font-bold text-lg">
                  {s.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{s.full_name}</p>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{s.shift} Shift</p>
                </div>
              </div>
              <PresenceBadge present={s.is_present} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
