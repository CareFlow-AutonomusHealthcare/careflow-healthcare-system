import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function DoctorProposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [modal, setModal] = useState(null); // { id, action }
  const [comment, setComment] = useState('');

  useEffect(() => {
    careflowAPI.getPendingProposals().then(r => setProposals(r.data)).catch(() => {});
  }, []);

  const decide = async (proposalId, action, commentText = '') => {
    setProcessing(proposalId);
    try {
      await careflowAPI.submitDecision(proposalId, {
        action, comment: commentText || null,
        approver_id: user?.user_id || 1,
        approver_type: 'Doctor',
        proposal_id: proposalId,
      });
      setProposals(prev => prev.filter(p => p.proposal_id !== proposalId));
    } catch {}
    finally { setProcessing(null); setModal(null); setComment(''); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Risk Analysis Proposals</h2>
        <p className="text-on-surface-variant mt-1">Review AI-generated risk proposals and make clinical decisions.</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-16 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-4 block text-green-500 opacity-60">check_circle</span>
          <p className="font-semibold text-lg">All proposals resolved</p>
          <p className="text-sm mt-1">The risk engine is actively monitoring patients.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(p => (
            <div
              key={p.proposal_id}
              className={`bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${processing === p.proposal_id ? 'opacity-50 scale-[0.99]' : ''}`}
            >
              {/* Card header */}
              <div className="bg-primary-fixed px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {(p.patient_name || 'P').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-on-primary-fixed">{p.patient_name || `Patient #${p.patient_id}`}</p>
                    <p className="text-xs text-on-primary-fixed-variant">ID: #{String(p.patient_id || '').padStart(5,'0')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={p.suggested_action === 'Escalate' ? 'chip-high' : 'chip-medium'}>
                    {p.suggested_action}
                  </span>
                  <span className="font-mono font-bold text-lg text-error">{p.score ?? p.composite_score}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                  {p.reason && (
                    <div className="bg-surface-container-low rounded-lg px-4 py-3 font-mono text-xs text-on-surface-variant inline-block">
                      <span className="text-outline">Engine Reasoning: </span>{p.reason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 md:w-56 shrink-0">
                  <button
                    onClick={() => decide(p.proposal_id, 'Approved')}
                    disabled={!!processing}
                    className="clinical-btn-primary w-full py-2.5"
                  >
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Approve
                  </button>
                  <button
                    onClick={() => { setModal({ id: p.proposal_id, action: 'Approved' }); setComment(''); }}
                    disabled={!!processing}
                    className="clinical-btn-secondary w-full py-2.5"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    Approve with Comment
                  </button>
                  <button
                    onClick={() => { setModal({ id: p.proposal_id, action: 'Rejected' }); setComment(''); }}
                    disabled={!!processing}
                    className="clinical-btn-danger w-full py-2.5"
                  >
                    <span className="material-symbols-outlined text-lg">cancel</span>
                    Reject with Comment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-primary-fixed px-6 py-4 flex items-center justify-between">
              <h3 className="font-headline font-bold text-on-primary-fixed">
                {modal.action === 'Approved' ? 'Approve with Comment' : 'Reject with Comment'}
              </h3>
              <button onClick={() => setModal(null)} className="text-on-primary-fixed-variant hover:text-on-primary-fixed">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-on-surface-variant">Add a clinical note to this decision for the record.</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                placeholder="Enter your clinical reasoning..."
                className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => decide(modal.id, modal.action, comment)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    modal.action === 'Approved'
                      ? 'text-white' : 'bg-error text-on-error'
                  }`}
                  style={modal.action === 'Approved' ? { background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' } : {}}
                >
                  <span className="material-symbols-outlined">{modal.action === 'Approved' ? 'check_circle' : 'cancel'}</span>
                  Confirm {modal.action === 'Approved' ? 'Approval' : 'Rejection'}
                </button>
                <button onClick={() => setModal(null)} className="clinical-btn-secondary px-5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
