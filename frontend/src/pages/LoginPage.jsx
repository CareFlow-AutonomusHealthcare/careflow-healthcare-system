import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'doctor', label: 'Physician',       icon: 'medical_services' },
  { key: 'staff',  label: 'Staff Coord.',    icon: 'clinical_notes' },
  { key: 'admin',  label: 'Administrator',   icon: 'admin_panel_settings' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>rebase_edit</span>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">
            CareFlow <span className="text-primary-container font-medium">Clinical Ledger</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-on-surface-variant text-xs uppercase tracking-widest font-medium">
          <span className="material-symbols-outlined text-sm">lock</span>
          Secure Environment
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(25,28,30,0.08)]">
            {/* Top accent bar */}
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' }}></div>

            <div className="p-10">
              <div className="text-center mb-10">
                <h2 className="font-headline text-3xl font-bold text-on-surface mb-2 tracking-tight">Authorize Access</h2>
                <p className="text-on-surface-variant text-sm">Enter your professional credentials to access the ledger.</p>
              </div>

              {/* Role selector */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 text-center">
                  Select Clinical Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setSelectedRole(r.key)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedRole === r.key
                          ? 'border-primary bg-primary-fixed/30'
                          : 'border-transparent bg-surface-container-low hover:bg-surface-container-high'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-2xl"
                        style={selectedRole === r.key ? { fontVariationSettings: "'FILL' 1", color: '#00478d' } : { color: '#424752' }}
                      >
                        {r.icon}
                      </span>
                      <span className={`text-xs font-bold ${selectedRole === r.key ? 'text-on-primary-fixed' : 'text-on-surface-variant'}`}>
                        {r.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-error-container text-error rounded-lg px-4 py-3 mb-6 text-sm font-medium">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Username</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-xl">alternate_email</span>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      placeholder="Enter your username"
                      className="w-full bg-surface-container-low border-none rounded-lg pl-11 pr-4 py-3.5 text-on-surface placeholder-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-xl">key</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-surface-container-low border-none rounded-lg pl-11 pr-12 py-3.5 text-on-surface placeholder-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{showPw ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white font-headline font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)', boxShadow: '0 4px 20px rgba(0,71,141,0.25)' }}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                        Authorizing...
                      </>
                    ) : (
                      <>
                        Authorize Access
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo credentials */}
              <div className="mt-8 pt-6 border-t border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 text-center">Demo Credentials</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { user: 'admin',       pw: 'admin123',  color: 'text-violet-700' },
                    { user: 'dr_smith',    pw: 'doctor123', color: 'text-blue-700' },
                    { user: 'staff_coord', pw: 'staff123',  color: 'text-emerald-700' },
                  ].map(c => (
                    <button
                      key={c.user}
                      type="button"
                      onClick={() => setUsername(c.user) || setPassword(c.pw)}
                      className="bg-surface-container-low hover:bg-surface-container rounded-lg p-2.5 transition-colors text-left"
                    >
                      <p className={`text-xs font-bold font-mono ${c.color}`}>{c.user}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{c.pw}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-on-surface-variant text-center mt-2">Click a credential to auto-fill</p>
              </div>
            </div>
          </div>

          {/* Compliance badges */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-8 opacity-50 hover:opacity-100 transition-opacity duration-500">
            {[
              { icon: 'security', label: 'HIPAA Compliant' },
              { icon: 'verified', label: 'SOC2 Type II' },
              { icon: 'encrypted', label: 'AES-256 Encrypted' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">{b.icon}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-tertiary/5 blur-[100px]"></div>
      </div>
    </div>
  );
}
