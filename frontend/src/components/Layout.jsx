import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, ClipboardCheck, Settings, Users, ArrowLeftRight } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);
  
  return (
    <NavLink 
      to={path} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-clinical-accent/10 text-clinical-accent border-r-4 border-clinical-accent' 
          : 'text-gray-400 hover:bg-clinical-800 hover:text-gray-200'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-clinical-accent' : ''} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-clinical-900 text-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-clinical-border bg-clinical-900 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-clinical-border">
          <div className="flex items-center gap-2 text-clinical-accent">
            <Activity size={28} className="animate-pulse-slow" />
            <h1 className="text-xl font-bold tracking-tight text-white">Care<span className="text-clinical-accent">Flow</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <SidebarItem icon={Activity} label="Deterioration Dash" path="/dashboard" />
          <SidebarItem icon={ClipboardCheck} label="Decision Engine" path="/proposals" />
          
          <div className="pt-8 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</p>
          </div>
          <SidebarItem icon={Users} label="Staffing" path="/staffing" />
          <SidebarItem icon={ArrowLeftRight} label="Inventory" path="/inventory" />
          <SidebarItem icon={Settings} label="Settings" path="/settings" />
        </nav>
        
        <div className="p-4 border-t border-clinical-border">
          <div className="flex items-center gap-3 px-4 py-2 bg-clinical-800 rounded-lg">
             <div className="w-8 h-8 rounded-full bg-clinical-accent flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)]">
               DR
             </div>
             <div>
               <p className="text-sm font-medium">Dr. Roberts</p>
               <p className="text-xs text-clinical-success flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-clinical-success"></span> On Shift
               </p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
        <header className="h-16 flex-shrink-0 border-b border-clinical-border bg-clinical-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10 hidden sm:flex">
             <h2 className="text-lg font-medium text-gray-300">Autonomous Coordination System v1.0</h2>
             
             {/* Simple Status Indicator */}
             <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
                  <span className="text-gray-400">Risk Engine Active</span>
                </div>
                <div className="h-4 w-px bg-clinical-border"></div>
                <div className="text-gray-400">Response ms: <span className="font-mono text-clinical-accent">142</span></div>
             </div>
        </header>
        
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8">
          <div className="max-w-7xl mx-auto h-full">
             {children}
          </div>
        </main>
      </div>

    </div>
  );
}
