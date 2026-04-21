import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';

const COMMON_CONDITIONS = [
  'diabetes', 'hypertension', 'asthma', 'copd', 'heart_disease',
  'kidney_disease', 'liver_disease', 'cancer', 'arthritis', 'obesity',
];

const emptyForm = { full_name: '', chronic_conditions: {} };

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'create' | patient object for edit
  const [form, setForm] = useState(emptyForm);
  const [conditionInput, setConditionInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = () => careflowAPI.listPatients().then(r => setPatients(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    String(p.patient_id).includes(search)
  );

  const openCreate = () => {
    setForm(emptyForm);
    setConditionInput('');
    setError('');
    setModal('create');
  };

  const openEdit = (patient) => {
    setForm({
      full_name: patient.full_name,
      chronic_conditions: patient.chronic_conditions || {},
    });
    setConditionInput('');
    setError('');
    setModal(patient);
  };

  const addCondition = (condition) => {
    const key = condition.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key) return;
    setForm(prev => ({
      ...prev,
      chronic_conditions: { ...prev.chronic_conditions, [key]: true },
    }));
    setConditionInput('');
  };

  const removeCondition = (key) => {
    setForm(prev => {
      const copy = { ...prev.chronic_conditions };
      delete copy[key];
      return { ...prev, chronic_conditions: copy };
    });
  };

  const save = async () => {
    if (!form.full_name.trim()) { setError('Patient name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        full_name: form.full_name.trim(),
        chronic_conditions: Object.keys(form.chronic_conditions).length > 0 ? form.chronic_conditions : null,
      };
      if (modal === 'create') {
        await careflowAPI.createPatient(payload);
      } else {
        await careflowAPI.updatePatient(modal.patient_id, payload);
      }
      await load();
      setModal(null);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save patient.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (patientId) => {
    try {
      await careflowAPI.deletePatient(patientId);
      await load();
      setDeleteConfirm(null);
    } catch (e) {
      alert(e.response?.data?.detail || 'Cannot delete — patient may have linked records.');
      setDeleteConfirm(null);
    }
  };

  const conds = Object.keys(form.chronic_conditions || {});
  const unusedConditions = COMMON_CONDITIONS.filter(c => !conds.includes(c));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Patient Management</h2>
          <p className="text-on-surface-variant mt-1">Register new patients or update existing records.</p>
        </div>
        <button onClick={openCreate} className="clinical-btn-primary px-5 py-2.5">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Patient
        </button>
      </div>

      {/* Search + Stats */}
      <div className="flex gap-5 items-center">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-3 text-sm">
          <div className="bg-primary-fixed text-primary px-4 py-2 rounded-xl font-bold">
            {patients.length} Total
          </div>
          <div className="bg-error-container text-error px-4 py-2 rounded-xl font-bold">
            {patients.filter(p => Object.keys(p.chronic_conditions || {}).length >= 3).length} High-Risk
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-primary-fixed border-b border-primary/10 flex items-center justify-between">
          <h3 className="font-headline font-bold text-on-primary-fixed">{filtered.length} Patient{filtered.length !== 1 ? 's' : ''}</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>MRN</th>
              <th>Chronic Conditions</th>
              <th>Registered</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const pconds = Object.keys(p.chronic_conditions || {});
              return (
                <tr key={p.patient_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">
                        {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <p className="text-sm font-semibold text-on-surface">{p.full_name}</p>
                    </div>
                  </td>
                  <td className="font-mono text-sm text-on-surface-variant">#{String(p.patient_id).padStart(5, '0')}</td>
                  <td>
                    {pconds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {pconds.slice(0, 3).map(c => (
                          <span key={c} className="px-2 py-0.5 bg-surface-container-highest rounded-full text-xs text-on-surface-variant capitalize">
                            {c.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {pconds.length > 3 && <span className="text-xs text-on-surface-variant">+{pconds.length - 3}</span>}
                      </div>
                    ) : <span className="text-xs text-on-surface-variant italic">None</span>}
                  </td>
                  <td className="text-xs text-on-surface-variant">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-lg transition-colors"
                        title="Edit patient"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
                        title="Delete patient"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">person_off</span>
                  <p className="text-sm">No patients found matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-primary-fixed px-6 py-4 flex items-center justify-between">
              <h3 className="font-headline font-bold text-on-primary-fixed">
                {modal === 'create' ? 'Register New Patient' : 'Edit Patient'}
              </h3>
              <button onClick={() => setModal(null)} className="text-on-primary-fixed-variant hover:text-on-primary-fixed">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {error && <div className="bg-error-container text-error rounded-lg px-4 py-2 text-sm font-medium">{error}</div>}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Chronic Conditions */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Chronic Conditions</label>

                {/* Active conditions */}
                {conds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {conds.map(c => (
                      <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-fixed text-primary rounded-full text-xs font-bold capitalize">
                        {c.replace(/_/g, ' ')}
                        <button onClick={() => removeCondition(c)} className="hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom add */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={e => setConditionInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCondition(conditionInput)}
                    placeholder="Type a condition and press Enter..."
                    className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={() => addCondition(conditionInput)}
                    disabled={!conditionInput.trim()}
                    className="clinical-btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add
                  </button>
                </div>

                {/* Quick-add presets */}
                {unusedConditions.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Quick Add</p>
                    <div className="flex flex-wrap gap-1.5">
                      {unusedConditions.map(c => (
                        <button
                          key={c}
                          onClick={() => addCondition(c)}
                          className="px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs hover:bg-primary-fixed hover:text-primary transition-colors capitalize"
                        >
                          + {c.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving} className="clinical-btn-primary flex-1 py-3 disabled:opacity-60">
                  {saving ? 'Saving...' : modal === 'create' ? 'Register Patient' : 'Save Changes'}
                </button>
                <button onClick={() => setModal(null)} className="clinical-btn-secondary px-5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-error-container px-6 py-4">
              <h3 className="font-headline font-bold text-error flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Confirm Deletion
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-on-surface">
                Are you sure you want to permanently delete <strong>{deleteConfirm.full_name}</strong>?
                This action cannot be undone and will remove all associated records.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm.patient_id)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-error text-on-error flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">delete_forever</span>
                  Delete Patient
                </button>
                <button onClick={() => setDeleteConfirm(null)} className="clinical-btn-secondary px-5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
