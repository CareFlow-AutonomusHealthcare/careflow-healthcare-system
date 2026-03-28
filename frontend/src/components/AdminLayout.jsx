import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, Users, ClipboardCheck, Package, ScrollText, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);
  return (
    <NavLink
      to={path}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-purple-500/10 text-purple-400 border-r-4 border-purple-400'
          : 'text-gray-400 hover:bg-clinical-800 hover:text-gray-200'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-screen overflow-hidden bg-clinical-900 text-gray-100">
      <aside className="w-64 flex-shrink-0 border-r border-clinical-border bg-clinical-900 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-clinical-border">
          <div className="flex items-center gap-2">
            <Activity size={28} className="text-purple-400 animate-pulse-slow" />
            <h1 className="text-xl font-bold text-white">Care<span className="text-purple-400">Flow</span></h1>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-clinical-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 px-2">Admin Portal</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <p className="px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Clinical</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/admin/dashboard" />
          <SidebarItem icon={ClipboardCheck} label="All Proposals" path="/admin/proposals" />
          <p className="px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider mt-6 mb-2">Management</p>
          <SidebarItem icon={Users} label="User Management" path="/admin/users" />
          <SidebarItem icon={Package} label="Inventory" path="/admin/inventory" />
          <SidebarItem icon={ScrollText} label="Audit Logs" path="/admin/logs" />
        </nav>
        <div className="p-4 border-t border-clinical-border space-y-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-clinical-800 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <ShieldCheck size={16} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-purple-400">Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="clinical-btn-outline w-full text-sm py-2">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex-shrink-0 border-b border-clinical-border bg-clinical-900/50 backdrop-blur-md flex items-center px-8">
          <h2 className="text-lg font-medium text-gray-300">CareFlow — Administrator Portal</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
