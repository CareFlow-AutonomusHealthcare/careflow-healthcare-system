import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';

const ROLES = ['doctor', 'staff', 'admin'];
const empty = { username: '', full_name: '', password: '', role: 'staff', linked_id: '' };

const roleChip = (role) => ({
  admin:  'bg-violet-100 text-violet-800',
  doctor: 'bg-blue-100 text-blue-800',
  staff:  'bg-emerald-100 text-emerald-800',
}[role] || '');

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => careflowAPI.listUsers().then(r => setUsers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setError(''); setModal('create'); };
  const openEdit = u => { setForm({ username: u.username, full_name: u.full_name, password: '', role: u.role, linked_id: u.linked_id || '' }); setError(''); setModal(u); };

  const save = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, linked_id: form.linked_id ? parseInt(form.linked_id) : null };
      modal === 'create' ? await careflowAPI.createUser(payload) : await careflowAPI.updateUser(modal.user_id, payload);
      await load(); setModal(null);
    } catch (e) { setError(e.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">User Management</h2>
          <p className="text-on-surface-variant mt-1">Add, edit, or remove system users and their roles.</p>
        </div>
        <button onClick={openCreate} className="clinical-btn-primary px-5 py-2.5">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add User
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-primary-fixed border-b border-primary/10">
          <h3 className="font-headline font-bold text-on-primary-fixed">{users.length} System Users</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Status</th><th>Created</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' }}>
                      {u.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{u.full_name}</p>
                      <p className="text-xs text-on-surface-variant font-mono">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold capitalize ${roleChip(u.role)}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="text-xs text-on-surface-variant">{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(u)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => careflowAPI.toggleUser(u.user_id).then(load)} className="p-2 text-on-surface-variant hover:text-tertiary hover:bg-tertiary-fixed rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">{u.is_active ? 'toggle_on' : 'toggle_off'}</span>
                    </button>
                    <button onClick={() => confirm('Delete this user?') && careflowAPI.deleteUser(u.user_id).then(load)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-primary-fixed px-6 py-4 flex items-center justify-between">
              <h3 className="font-headline font-bold text-on-primary-fixed">{modal === 'create' ? 'Add New User' : 'Edit User'}</h3>
              <button onClick={() => setModal(null)} className="text-on-primary-fixed-variant hover:text-on-primary-fixed">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-error-container text-error rounded-lg px-4 py-2 text-sm">{error}</div>}
              {[
                { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Dr. Jane Doe' },
                { label: 'Username', key: 'username', type: 'text', placeholder: 'dr_jane' },
                { label: modal === 'create' ? 'Password' : 'New Password (leave blank to keep)', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Linked ID (optional)', key: 'linked_id', type: 'number', placeholder: 'Doctor/Staff table ID' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                    placeholder={f.placeholder}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving} className="clinical-btn-primary flex-1 py-3 disabled:opacity-60">
                  {saving ? 'Saving...' : modal === 'create' ? 'Create User' : 'Save Changes'}
                </button>
                <button onClick={() => setModal(null)} className="clinical-btn-secondary px-5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
