import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, Clock, MessageSquare } from 'lucide-react';
import { careflowAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const MOCK_PROPOSALS = [
  { proposal_id: 101, patient_name: 'Arthur Pendelton', patient_id: 1, score: 9.2, suggested_action: 'Escalate', created_at: new Date().toISOString(), reason: 'Eng:2.0|Clin:4.5|Chron:3|Inst:1.5' },
  { proposal_id: 102, patient_name: 'David Guetta', patient_id: 4, score: 8.8, suggested_action: 'Follow-up', created_at: new Date().toISOString(), reason: 'Eng:1.0|Clin:5.0|Chron:1|Inst:2.0' },
];

export default function DoctorProposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [commentModal, setCommentModal] = useState(null); // { id, action }
  const [comment, setComment] = useState('');

  useEffect(() => {
    careflowAPI.getPendingProposals()
      .then(r => setProposals(r.data))
      .catch(() => setProposals(MOCK_PROPOSALS));
  }, []);

  const submitDecision = async (proposalId, action, commentText = '') => {
    setProcessingId(proposalId);
    try {
      await careflowAPI.submitDecision(proposalId, {
        action,
        approver_id: user?.user_id || 1,
        approver_type: 'Doctor',
        comment: commentText || null,
        proposal_id: proposalId,
      });
      setProposals(prev => prev.filter(p => p.proposal_id !== proposalId));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
      setCommentModal(null);
      setComment('');
    }
  };

  const openComment = (id, action) => {
    setCommentModal({ id, action });
    setComment('');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <ShieldAlert className="text-clinical-warning" size={26} />
          Risk Analysis Proposals
        </h2>
        <p className="text-gray-400 mt-1">Review and approve or reject AI-generated risk proposals.</p>
      </div>

      {proposals.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-500">
          <Check size={48} className="mx-auto mb-4 text-clinical-success opacity-50" />
          <p className="text-lg">All proposals resolved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(p => (
            <div
              key={p.proposal_id}
              className={`glass-panel p-6 transition-all duration-300 ${processingId === p.proposal_id ? 'opacity-50 scale-[0.98]' : 'hover:border-clinical-warning/40'}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 rounded bg-clinical-danger/20 text-clinical-danger text-xs font-bold uppercase border border-clinical-danger/30">
                      {p.suggested_action}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock size={14} /> {new Date(p.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-100">{p.patient_name || `Patient #${p.patient_id}`}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Patient ID: {String(p.patient_id || '').padStart(5, '0')} • Risk Score:{' '}
                    <span className="font-mono text-clinical-warning font-bold">{p.score ?? p.composite_score}</span>
                  </p>
                  {p.reason && (
                    <div className="bg-clinical-900 border border-clinical-border rounded px-3 py-2 text-xs font-mono text-gray-300 inline-block">
                      <span className="text-gray-500">Engine: </span>{p.reason}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center gap-2 md:w-52 shrink-0">
                  <button
                    onClick={() => submitDecision(p.proposal_id, 'Approved')}
                    disabled={!!processingId}
                    className="clinical-btn-success w-full"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => openComment(p.proposal_id, 'Approved')}
                    disabled={!!processingId}
                    className="clinical-btn-outline w-full text-sm"
                  >
                    <MessageSquare size={14} /> Approve with Comment
                  </button>
                  <button
                    onClick={() => openComment(p.proposal_id, 'Rejected')}
                    disabled={!!processingId}
                    className="clinical-btn-danger w-full opacity-80 hover:opacity-100"
                  >
                    <X size={16} /> Reject with Comment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-1">
              {commentModal.action === 'Approved' ? 'Approve' : 'Reject'} with Comment
            </h3>
            <p className="text-sm text-gray-400 mb-4">Add a clinical note to this decision.</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Enter your clinical reasoning..."
              className="w-full bg-clinical-900 border border-clinical-border rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-clinical-accent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => submitDecision(commentModal.id, commentModal.action, comment)}
                className={commentModal.action === 'Approved' ? 'clinical-btn-success flex-1' : 'clinical-btn-danger flex-1'}
              >
                Confirm {commentModal.action === 'Approved' ? 'Approval' : 'Rejection'}
              </button>
              <button onClick={() => setCommentModal(null)} className="clinical-btn-outline px-4">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
