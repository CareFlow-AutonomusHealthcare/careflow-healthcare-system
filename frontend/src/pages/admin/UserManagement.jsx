import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, ToggleLeft, ToggleRight, X, Edit } from 'lucide-react';
import { careflowAPI } from '../../api/client';

const ROLES = ['doctor', 'staff', 'admin'];

const emptyForm = { username: '', full_name: '', password: '', role: 'staff', linked_id: '' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null); // null | 'create' | { ...user }
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => careflowAPI.listUsers().then(r => setUsers(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setError(''); setModal('create'); };
  const openEdit = (u) => {
    setForm({ username: u.username, full_name: u.full_name, password: '', role: u.role, linked_id: u.linked_id || '' });
    setError('');
    setModal(u);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, linked_id: form.linked_id ? parseInt(form.linked_id) : null };
      if (modal === 'create') {
        await careflowAPI.createUser(payload);
      } else {
        await careflowAPI.updateUser(modal.user_id, payload);
      }
      await load();
      setModal(null);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try { await careflowAPI.deleteUser(userId); await load(); } catch {}
  };

  const toggleUser = async (userId) => {
    try { await careflowAPI.toggleUser(userId); await load(); } catch {}
  };

  const roleColor = (role) => ({
    admin: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    doctor: 'text-clinical-warning bg-clinical-warning/10 border-clinical-warning/30',
    staff: 'text-clinical-success bg-clinical-success/10 border-clinical-success/30',
  }[role] || '');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users className="text-purple-400" size={26} /> User Management
          </h2>
          <p className="text-gray-400 mt-1">Add, edit, or remove system users.</p>
        </div>
        <button onClick={openCreate} className="clinical-btn-primary">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="grid grid-cols-5 px-6 py-3 border-b border-clinical-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-2">User</div>
          <div>Role</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {users.map(u => (
          <div key={u.user_id} className="grid grid-cols-5 px-6 py-4 border-b border-clinical-border/50 last:border-0 hover:bg-clinical-700/20 transition-colors items-center">
            <div className="col-span-2">
              <p className="font-medium text-gray-200">{u.full_name}</p>
              <p className="text-xs text-gray-500 font-mono">@{u.username}</p>
            </div>
            <div>
              <span className={`text-xs px-2 py-1 rounded border font-semibold capitalize ${roleColor(u.role)}`}>
                {u.role}
              </span>
            </div>
            <div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? 'bg-clinical-success/20 text-clinical-success' : 'bg-gray-700 text-gray-500'}`}>
                {u.is_active ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => openEdit(u)} className="p-2 text-gray-500 hover:text-clinical-accent hover:bg-clinical-700 rounded-lg transition-colors">
                <Edit size={15} />
              </button>
              <button onClick={() => toggleUser(u.user_id)} className="p-2 text-gray-500 hover:text-clinical-warning hover:bg-clinical-700 rounded-lg transition-colors">
                {u.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
              </button>
              <button onClick={() => deleteUser(u.user_id)} className="p-2 text-gray-500 hover:text-clinical-danger hover:bg-clinical-700 rounded-lg transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">{modal === 'create' ? 'Add New User' : 'Edit User'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            {error && (
              <div className="bg-clinical-danger/10 border border-clinical-danger/30 text-clinical-danger rounded-lg px-4 py-2 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Dr. Jane Doe' },
                { label: 'Username', key: 'username', type: 'text', placeholder: 'dr_jane' },
                { label: modal === 'create' ? 'Password' : 'New Password (leave blank to keep)', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Linked ID (optional)', key: 'linked_id', type: 'number', placeholder: 'Doctor/Staff table ID' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-clinical-900 border border-clinical-border rounded-lg px-3 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-clinical-accent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-clinical-900 border border-clinical-border rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-clinical-accent"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving} className="clinical-btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving...' : modal === 'create' ? 'Create User' : 'Save Changes'}
              </button>
              <button onClick={() => setModal(null)} className="clinical-btn-outline px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
