import React from 'react';
import Sidebar from './Sidebar';

const NAV = [
  { icon: 'dashboard',      label: 'Dashboard',        path: '/admin/dashboard' },
  { icon: 'description',    label: 'All Proposals',    path: '/admin/proposals' },
  { icon: 'group',          label: 'User Management',  path: '/admin/users' },
  { icon: 'inventory_2',    label: 'Inventory',        path: '/admin/inventory' },
  { icon: 'history_edu',    label: 'Audit Logs',       path: '/admin/logs' },
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar role="admin" navItems={NAV} accentClass="text-violet-700 bg-white shadow-sm" />
      <div className="ml-64 flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/40 flex items-center justify-between px-8 py-3.5">
          <div className="relative w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search system logs, users, patients..."
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-lg text-on-secondary-container text-sm font-semibold hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              Compliance Export
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full text-xs font-bold">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              On-Duty Status
            </div>
            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
