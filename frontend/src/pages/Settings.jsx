import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Clock, Lock } from 'lucide-react';

const DEPLOYMENT_CHECKS = [
  { id: 1, title: 'Phase 1: Shadow Mode Validation', desc: 'Engine runs parallel to clinicians without emitting real alerts. Minimum 1 week.', status: 'completed' },
  { id: 2, title: 'Phase 2: Silent Alerting', desc: 'Alerts are generated but only visible to the steering committee. False positive tuning. Minimum 1 week.', status: 'active' },
  { id: 3, title: 'Phase 3: Soft Launch', desc: 'Alerts visible to Charge Nurses only for final workflow validation. Minimum 1 week.', status: 'locked' },
];

export default function Settings() {
  const [daysRemaining, setDaysRemaining] = useState(12);

  return (
    <div className="animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-clinical-accent" />
          System Governance & Deployment
        </h2>
        <p className="text-gray-400 mt-2">CareFlow mandates a strict 3-week clinical validation window before production enablement.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
         <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-clinical-warning">
            <div>
              <p className="text-gray-400 font-medium">Validation Phase</p>
              <h3 className="text-2xl font-bold text-clinical-warning mt-1">Phase 2 Active</h3>
            </div>
            <Clock size={36} className="text-clinical-warning opacity-50" />
         </div>
         
         <div className="glass-panel p-6 flex flex-col justify-center bg-gradient-to-br from-clinical-800 to-clinical-900 border border-clinical-border">
            <div className="flex justify-between items-end mb-2">
              <p className="text-gray-300 font-medium">Time to Production</p>
              <h3 className="text-2xl font-bold font-mono text-white">{daysRemaining} Days</h3>
            </div>
            <div className="w-full bg-clinical-900 rounded-full h-2 overflow-hidden">
               <div className="bg-clinical-accent h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
         </div>
      </div>

      <div className="glass-panel p-8">
        <h3 className="text-lg font-semibold mb-6 border-b border-clinical-border pb-4">Clinical Rollout Checklist</h3>
        
        <div className="space-y-6">
          {DEPLOYMENT_CHECKS.map((check, idx) => (
            <div key={check.id} className="flex gap-4 relative">
               
               {/* Timeline Line */}
               {idx !== DEPLOYMENT_CHECKS.length - 1 && (
                 <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-clinical-border z-0"></div>
               )}

               <div className="relative z-10 bg-clinical-900 rounded-full p-1 mt-1">
                 {check.status === 'completed' ? (
                   <CheckCircle className="text-clinical-success" size={24} />
                 ) : check.status === 'active' ? (
                   <Clock className="text-clinical-warning animate-pulse" size={24} />
                 ) : (
                   <Lock className="text-gray-600" size={24} />
                 )}
               </div>

               <div className={`flex-1 p-4 rounded-xl border ${check.status === 'active' ? 'border-clinical-warning bg-clinical-warning/5' : 'border-clinical-border bg-clinical-800/30'}`}>
                 <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${check.status === 'locked' ? 'text-gray-500' : 'text-gray-200'}`}>{check.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded font-semibold uppercase ${
                      check.status === 'completed' ? 'bg-clinical-success/20 text-clinical-success' :
                      check.status === 'active' ? 'bg-clinical-warning/20 text-clinical-warning' :
                      'bg-gray-800 text-gray-500'
                    }`}>
                      {check.status}
                    </span>
                 </div>
                 <p className={`text-sm mt-2 ${check.status === 'locked' ? 'text-gray-600' : 'text-gray-400'}`}>{check.desc}</p>
                 
                 {check.status === 'active' && (
                   <div className="mt-4 pt-4 border-t border-clinical-border/50">
                     <button className="text-sm clinical-btn-primary py-1 px-4">Sign-off Phase 2</button>
                   </div>
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
