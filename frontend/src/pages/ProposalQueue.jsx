import React, { useState } from 'react';
import { ShieldAlert, Check, X, Clock, ChevronRight } from 'lucide-react';
import InventoryTracker from '../components/InventoryTracker';

// Mock proposals
const MOCK_PROPOSALS = [
  { id: 101, patient_name: 'Arthur Pendelton', patient_id: 1, score: 9.2, action: 'Escalate to ICU', time: '10 mins ago', reason: 'Eng:2.0|Clin:4.5|Chron:3|Inst:1.5' },
  { id: 102, patient_name: 'David Guetta', patient_id: 4, score: 8.8, action: 'Immediate Follow-up', time: '22 mins ago', reason: 'Eng:1.0|Clin:5.0|Chron:1|Inst:2.0' },
  { id: 103, patient_name: 'Elena Rostova', patient_id: 7, score: 7.5, action: 'Assign Nursing Staff', time: '1 hour ago', reason: 'Eng:3.5|Clin:1.0|Chron:2|Inst:1.0' },
];

export default function ProposalQueue() {
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [processingId, setProcessingId] = useState(null);

  const handleDecision = async (id, decision) => {
    // Optimistic UI for < 1s perception
    setProcessingId(id);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 400));
    
    setProposals(prev => prev.filter(p => p.id !== id));
    setProcessingId(null);
    
    // In real app, call careflowAPI.submitDecision(id, { action: decision, approver_id: 123... })
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-fade-in pb-10">
      
      {/* Main Queue Area */}
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ShieldAlert className="text-clinical-warning" size={28} />
            Decision Engine Queue
          </h2>
          <p className="text-gray-400 mt-1">Pending automated action proposals requiring Human-in-the-Loop validation.</p>
        </div>

        <div className="space-y-4">
          {proposals.length === 0 ? (
             <div className="glass-panel p-12 text-center text-gray-500">
               <Check size={48} className="mx-auto mb-4 text-clinical-success opacity-50" />
               <p className="text-lg">All proposals resolved.</p>
               <p className="text-sm">Risk Engine is currently monitoring.</p>
             </div>
          ) : (
            proposals.map(proposal => (
              <div 
                key={proposal.id} 
                className={`glass-panel p-6 transition-all duration-300 ${processingId === proposal.id ? 'opacity-50 scale-[0.98]' : 'hover:border-clinical-accent/50'}`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Info Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-2 py-1 rounded bg-clinical-danger/20 text-clinical-danger text-xs font-bold uppercase border border-clinical-danger/30">
                         {proposal.action}
                       </span>
                       <span className="text-sm text-gray-400 flex items-center gap-1">
                         <Clock size={14} /> {proposal.time}
                       </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-100">{proposal.patient_name}</h3>
                    <p className="text-sm text-gray-400 mb-4">Patient ID: {proposal.patient_id.toString().padStart(5, '0')} • Composite Risk: <span className="font-mono text-clinical-warning font-bold">{proposal.score}</span></p>
                    
                    <div className="bg-clinical-900 border border-clinical-border rounded p-3 text-xs font-mono text-gray-300 inline-block">
                      <span className="text-gray-500">Engine Logic: </span> {proposal.reason}
                    </div>
                  </div>
                  
                  {/* Action Section */}
                  <div className="flex flex-col justify-center gap-3 md:w-48 shrink-0">
                    <button 
                      onClick={() => handleDecision(proposal.id, 'Approved')}
                      disabled={processingId === proposal.id}
                      className="clinical-btn-success w-full"
                    >
                      <Check size={18} /> Approve Action
                    </button>
                    <button 
                      onClick={() => handleDecision(proposal.id, 'Rejected')}
                      disabled={processingId === proposal.id}
                      className="clinical-btn-danger w-full opacity-80 hover:opacity-100"
                    >
                      <X size={18} /> Reject & Dismiss
                    </button>
                    <button className="text-sm text-clinical-accent hover:text-white transition-colors mt-2 mx-auto flex items-center gap-1">
                      View full chart <ChevronRight size={14} />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Context Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
           System Context
        </h3>
        {/* The tracker provides context for doctors BEFORE they approve an escalation */}
        <InventoryTracker />
      </div>

    </div>
  );
}
