import React, { useState, useEffect } from 'react';
import { UserCheck, Stethoscope, Circle } from 'lucide-react';
import { careflowAPI } from '../../api/client';

export default function StaffPresence() {
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    careflowAPI.getDoctors().then(r => setDoctors(r.data)).catch(() => setDoctors([
      { doctor_id: 1, full_name: 'Dr. Sarah Smith', specialty: 'Cardiology', is_present: true },
      { doctor_id: 2, full_name: 'Dr. Marcus Jones', specialty: 'Internal Medicine', is_present: false },
    ]));
    careflowAPI.getNursingStaff().then(r => setStaff(r.data)).catch(() => setStaff([
      { staff_id: 1, full_name: 'Coordinator Lisa Chen', shift: 'Day', is_present: true },
    ]));
  }, []);

  const PresenceBadge = ({ present }) => (
    <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
      present ? 'bg-clinical-success/20 text-clinical-success' : 'bg-gray-700 text-gray-500'
    }`}>
      <Circle size={6} fill="currentColor" />
      {present ? 'On Shift' : 'Off Shift'}
    </span>
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <UserCheck className="text-clinical-success" size={26} />
          Staff & Doctor Presence
        </h2>
        <p className="text-gray-400 mt-1">Current shift status for all clinical personnel.</p>
      </div>

      {/* Doctors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-clinical-warning">
          <Stethoscope size={18} /> Doctors
        </h3>
        <div className="glass-panel overflow-hidden">
          <div className="grid grid-cols-3 px-6 py-3 border-b border-clinical-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Name</div>
            <div>Specialty</div>
            <div>Status</div>
          </div>
          {doctors.map(d => (
            <div key={d.doctor_id} className="grid grid-cols-3 px-6 py-4 border-b border-clinical-border/50 last:border-0 hover:bg-clinical-700/30 transition-colors">
              <div className="font-medium text-gray-200">{d.full_name}</div>
              <div className="text-sm text-gray-400">{d.specialty || '—'}</div>
              <div><PresenceBadge present={d.is_present} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Nursing Staff */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-clinical-success">
          <UserCheck size={18} /> Nursing Staff
        </h3>
        <div className="glass-panel overflow-hidden">
          <div className="grid grid-cols-3 px-6 py-3 border-b border-clinical-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Name</div>
            <div>Shift</div>
            <div>Status</div>
          </div>
          {staff.map(s => (
            <div key={s.staff_id} className="grid grid-cols-3 px-6 py-4 border-b border-clinical-border/50 last:border-0 hover:bg-clinical-700/30 transition-colors">
              <div className="font-medium text-gray-200">{s.full_name}</div>
              <div className="text-sm text-gray-400">{s.shift}</div>
              <div><PresenceBadge present={s.is_present} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
