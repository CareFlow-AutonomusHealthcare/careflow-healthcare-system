import React, { useState } from 'react';
import { Activity, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Activity size={36} className="text-clinical-accent animate-pulse-slow" />
          <h1 className="text-3xl font-bold text-white">
            Care<span className="text-clinical-accent">Flow</span>
          </h1>
        </div>

        <div className="glass-panel p-8">
          <h2 className="text-xl font-semibold text-gray-200 mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-8">Autonomous Healthcare Coordination System</p>

          {error && (
            <div className="flex items-center gap-2 bg-clinical-danger/10 border border-clinical-danger/30 text-clinical-danger rounded-lg px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  className="w-full bg-clinical-900 border border-clinical-border rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-clinical-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-clinical-900 border border-clinical-border rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-clinical-accent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clinical-btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-8 pt-6 border-t border-clinical-border">
            <p className="text-xs text-gray-600 mb-3 font-medium uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-500">
                <span className="text-clinical-accent">admin</span>
                <span>admin123</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span className="text-clinical-warning">dr_smith</span>
                <span>doctor123</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span className="text-clinical-success">staff_coord</span>
                <span>staff123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
