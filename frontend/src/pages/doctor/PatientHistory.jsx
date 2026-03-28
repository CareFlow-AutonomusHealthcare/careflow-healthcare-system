import React, { useState, useEffect } from 'react';
import { Activity, ChevronRight, X, AlertTriangle, FlaskConical, Calendar } from 'lucide-react';
import { careflowAPI } from '../../api/client';

const MOCK_PATIENTS = [
  { patient_id: 1, full_name: 'Arthur Pendelton', chronic_conditions: { diabetes: true, hypertension: true } },
  { patient_id: 2, full_name: 'Sarah Jenkins', chronic_conditions: { asthma: true } },
  { patient_id: 3, full_name: 'Michael Chang', chronic_conditions: {} },
];

export default function PatientHistory() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    careflowAPI.listPatients()
      .then(r => setPatients(r.data))
      .catch(() => setPatients(MOCK_PATIENTS));
  }, []);

  const viewHistory = async (patient) => {
    setSelected(patient);
    setHistory(null);
    setLoadingHistory(true);
    try {
      const res = await careflowAPI.getPatientHistory(patient.patient_id);
      setHistory(res.data);
    } catch {
      setHistory({ labs: [], appointments: [] });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Activity className="text-clinical-warning" size={26} />
          Patient History
        </h2>
        <p className="text-gray-400 mt-1">View 90-day clinical history for any patient.</p>
      </div>

      <div className="flex gap-6">
        {/* Patient List */}
        <div className="w-80 shrink-0 space-y-2">
          {patients.map(p => (
            <button
              key={p.patient_id}
              onClick={() => viewHistory(p)}
              className={`w-full text-left glass-panel p-4 hover:border-clinical-warning/50 transition-all ${
                selected?.patient_id === p.patient_id ? 'border-clinical-warning' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-200">{p.full_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {String(p.patient_id).padStart(5, '0')} •{' '}
                    {Object.keys(p.chronic_conditions || {}).length} conditions
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>
          ))}
        </div>

        {/* History Panel */}
        <div className="flex-1">
          {!selected && (
            <div className="glass-panel p-12 text-center text-gray-500">
              <Activity size={40} className="mx-auto mb-4 opacity-30" />
              <p>Select a patient to view their history</p>
            </div>
          )}

          {selected && (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-100">{selected.full_name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Chronic conditions:{' '}
                    {Object.keys(selected.chronic_conditions || {}).length > 0
                      ? Object.keys(selected.chronic_conditions).join(', ')
                      : 'None recorded'}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {loadingHistory ? (
                <div className="text-center py-8 text-gray-500">Loading history...</div>
              ) : history ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Labs */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FlaskConical size={14} /> Lab Results
                    </h4>
                    {history.labs.length === 0 ? (
                      <p className="text-gray-600 text-sm">No lab records in window</p>
                    ) : (
                      <div className="space-y-2">
                        {history.labs.slice(0, 8).map((lab, i) => (
                          <div key={i} className="flex justify-between items-center bg-clinical-900/50 rounded-lg px-3 py-2 text-sm">
                            <span className="text-gray-300">{lab.test_type}</span>
                            <div className="text-right">
                              <span className="font-mono text-clinical-accent">{lab.test_value}</span>
                              <p className="text-xs text-gray-600">{new Date(lab.recorded_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Appointments */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar size={14} /> Appointments
                    </h4>
                    {history.appointments.length === 0 ? (
                      <p className="text-gray-600 text-sm">No appointments in window</p>
                    ) : (
                      <div className="space-y-2">
                        {history.appointments.slice(0, 8).map((apt, i) => (
                          <div key={i} className="flex justify-between items-center bg-clinical-900/50 rounded-lg px-3 py-2 text-sm">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              apt.status === 'Missed' ? 'bg-clinical-danger/20 text-clinical-danger' :
                              apt.status === 'Attended' ? 'bg-clinical-success/20 text-clinical-success' :
                              'bg-gray-700 text-gray-400'
                            }`}>{apt.status}</span>
                            <span className="text-xs text-gray-500">{new Date(apt.scheduled_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
