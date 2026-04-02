import React from 'react';
import Sidebar from './Sidebar';

const NAV = [
  { icon: 'dashboard',      label: 'Dashboard',          path: '/staff/dashboard' },
  { icon: 'person',         label: 'Present Patients',   path: '/staff/patients' },
  { icon: 'badge',          label: 'Staff & Doctors',    path: '/staff/presence' },
  { icon: 'task_alt',       label: 'Approved Decisions', path: '/staff/decisions' },
];

export default function StaffLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar role="staff" navItems={NAV} accentClass="text-emerald-700 bg-white shadow-sm" />
      <div className="ml-64 flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/40 flex items-center justify-between px-8 py-3.5">
          <div className="relative w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search patients, doctors, or wards..."
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
