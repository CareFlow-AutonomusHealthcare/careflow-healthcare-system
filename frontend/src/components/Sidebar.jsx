import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ icon, label, path, accentClass = 'text-blue-700 bg-white shadow-sm' }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);
  return (
    <NavLink
      to={path}
      className={`px-4 py-3 mx-2 my-0.5 flex items-center gap-3 rounded-lg transition-all duration-200 text-sm font-medium
        ${isActive
          ? `${accentClass} hover:translate-x-0`
          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-200/50 hover:translate-x-1'
        }`}
    >
      <span className="material-symbols-outlined text-xl"
        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  );
};

export default function Sidebar({ role, navItems, accentClass }) {
  const { user, logout } = useAuth();

  const roleConfig = {
    doctor: { label: 'Physician', icon: 'medical_services', color: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' },
    staff:  { label: 'Staff Coordinator', icon: 'clinical_notes', color: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' },
    admin:  { label: 'Administrator', icon: 'admin_panel_settings', color: 'text-violet-800', badge: 'bg-violet-100 text-violet-800' },
  }[role] || {};

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto z-40 bg-slate-100 flex flex-col py-6 border-r border-slate-200/60">
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' }}>
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              pulse_alert
            </span>
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-blue-900 text-lg leading-tight">CareFlow</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Clinical Ledger</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-6 mb-4">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${roleConfig.badge}`}>
          <span className="material-symbols-outlined text-sm">{roleConfig.icon}</span>
          {roleConfig.label}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item => (
          <NavItem key={item.path} {...item} accentClass={accentClass} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 mt-4 space-y-1 border-t border-slate-200/60 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' }}>
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{user?.full_name}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">On-Duty</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
