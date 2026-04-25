import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Generates a bar chart from lab values
function TimelineChart({ labs }) {
  if (!labs || labs.length === 0) return null;
  const sorted = [...labs].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  const vals = sorted.map(l => l.test_value);
  const max = Math.max(...vals);
  const threshold = max * 0.65;
  return (
    <div className="relative h-48 w-full flex items-end gap-1">
      <div className="absolute inset-0 flex flex-col justify-between py-2 border-l border-b border-outline-variant/20 pointer-events-none">
        {[0,1,2,3].map(i => <div key={i} className="w-full h-px bg-outline-variant/10" />)}
      </div>
      {sorted.map((lab, i) => {
        const pct = max > 0 ? (lab.test_value / max) * 100 : 20;
        const isHigh = lab.test_value > threshold;
        const date = new Date(lab.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
          <div key={i} className="flex-1 group relative cursor-pointer" style={{ height: `${Math.max(pct, 8)}%` }}>
            <div className={`w-full h-full rounded-t-sm transition-colors ${isHigh ? 'bg-error/30 hover:bg-error/50 border-t-2 border-error' : 'bg-primary/20 hover:bg-primary/40'}`} />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity pointer-events-none">
              {date}: {lab.test_value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PatientListItem({ patient, isActive, onClick }) {
  const conds = Object.keys(patient.chronic_conditions || {}).length;
  return (
    <button onClick={onClick} className={`w-full text-left p-4 rounded-xl transition-all border-2 ${isActive ? 'bg-primary-fixed border-primary/30 shadow-sm' : 'bg-surface-container-lowest border-transparent shadow-sm hover:bg-surface-container-low'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isActive ? 'bg-primary text-white' : 'bg-primary-fixed text-primary'}`}>
          {patient.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-on-surface truncate">{patient.full_name}</p>
          <p className="text-xs text-on-surface-variant">#{String(patient.patient_id).padStart(5, '0')} · {conds} condition{conds !== 1 ? 's' : ''}</p>
        </div>
        {conds >= 2 && <span className="material-symbols-outlined text-error text-sm shrink-0">warning</span>}
      </div>
    </button>
  );
}

export default function PatientHistory() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [window, setWindow] = useState(90);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [decidingId, setDecidingId] = useState(null);
  const [commentModal, setCommentModal] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    careflowAPI.listPatients().then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const viewHistory = async (patient) => {
    setSelected(patient);
    setHistory(null);
    setComments([]);
    setLoading(true);
    try {
      const res = await careflowAPI.getPatientHistory(patient.patient_id, window);
      console.log('PROPOSAL DEBUG:', JSON.stringify({ proposal: res.data.proposal, risk_score: res.data.risk_score, has_proposal: !!res.data.proposal }, null, 2));
      setHistory(res.data);
    } catch { setHistory({ labs: [], appointments: [] }); }
    finally { setLoading(false); }
  };

  const changeWindow = async (days) => {
    setWindow(days);
    if (!selected) return;
    setLoading(true);
    try {
      const res = await careflowAPI.getPatientHistory(selected.patient_id, days);
      setHistory(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const decide = async (proposalId, action, text = '') => {
    setDecidingId(proposalId);
    try {
      await careflowAPI.submitDecision(proposalId, {
        action, comment: text || null,
        approver_id: user?.user_id || 1,
        approver_type: 'Doctor',
        proposal_id: proposalId,
      });
      if (history?.proposal) setHistory(prev => ({ ...prev, proposal: null }));
    } catch {}
    finally { setDecidingId(null); setCommentModal(null); setCommentText(''); }
  };

  const addComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [{ author: user?.full_name || 'Doctor', text: comment, time: 'Just now', isPrimary: true }, ...prev]);
    setComment('');
  };

  const filtered = patients.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()));

  // Derive metrics from labs
  const latestLabs = history?.labs?.slice(0, 3) || [];
  const labMetrics = latestLabs.map((lab, i) => {
    const icons = ['bloodtype', 'ecg_heart', 'science'];
    const colors = ['text-blue-600 bg-blue-50', 'text-red-600 bg-red-50', 'text-orange-600 bg-orange-50'];
    return { icon: icons[i] || 'science', color: colors[i] || 'text-primary bg-primary-fixed', type: lab.test_type, value: lab.test_value };
  });

  const conds = selected ? Object.keys(selected.chronic_conditions || {}) : [];
  const riskLevel = conds.length >= 3 ? 'High Risk' : conds.length >= 1 ? 'Moderate Risk' : 'Low Risk';
  const isHighRisk = conds.length >= 3;

  const missedCount = history?.appointments?.filter(a => a.status === 'Missed').length || 0;
  const totalApts = history?.appointments?.length || 0;

  return (
    <div className="flex gap-6 h-full">
      {/* Patient list sidebar */}
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
            className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {filtered.map(p => (
            <PatientListItem key={p.patient_id} patient={p} isActive={selected?.patient_id === p.patient_id} onClick={() => viewHistory(p)} />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto space-y-8 pb-10" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {!selected ? (
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-20 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">person_search</span>
            <p className="font-headline font-bold text-xl text-on-surface">Select a Patient</p>
            <p className="text-sm mt-2">Choose a patient from the list to view their 90-day clinical history and risk profile.</p>
          </div>
        ) : (
          <>
            {/* Patient profile header */}
            <section className="grid grid-cols-12 gap-6 items-end">
              <div className="col-span-8 flex items-center gap-8">
                <div className="relative">
                  <div className="w-28 h-28 rounded-xl overflow-hidden shadow-xl border-4 border-white bg-primary-fixed flex items-center justify-center">
                    <span className="font-headline font-extrabold text-4xl text-primary">
                      {selected.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md">
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">{selected.full_name}</h1>
                  <div className="flex items-center gap-3 text-on-surface-variant text-sm uppercase tracking-widest flex-wrap">
                    <span>Patient</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span>MRN: #{String(selected.patient_id).padStart(5, '0')}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span>Room {200 + selected.patient_id}-B</span>
                  </div>
                  {conds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {conds.map(c => (
                        <span key={c} className="px-2.5 py-1 bg-surface-container-highest rounded-full text-xs font-semibold text-on-surface-variant capitalize">
                          {c.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-4 flex justify-end">
                <div className={`px-6 py-4 rounded-xl flex items-center gap-4 w-full max-w-xs shadow-sm border ${isHighRisk ? 'bg-error-container text-error border-error/10' : 'bg-tertiary-fixed text-tertiary border-tertiary/10'}`}>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <span className="material-symbols-outlined text-3xl">warning</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Current Risk Status</p>
                    <p className="text-lg font-extrabold font-headline leading-tight">{riskLevel}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 90-day timeline */}
            <section className="bg-surface-container-low p-8 rounded-2xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-headline text-xl font-extrabold tracking-tight text-on-surface">90-Day Clinical Timeline</h3>
                  <p className="text-sm text-on-surface-variant mt-0.5">Aggregated behavioral and biometric trajectory</p>
                </div>
                <div className="flex bg-surface-container-high p-1 rounded-lg gap-1">
                  {[90, 30, 7].map(d => (
                    <button key={d} onClick={() => changeWindow(d)}
                      className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${window === d ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                      {d} DAYS
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="h-48 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                </div>
              ) : (
                <TimelineChart labs={history?.labs || []} />
              )}

              {/* Metric cards */}
              <div className="grid grid-cols-3 gap-5">
                {labMetrics.length > 0 ? labMetrics.map((m, i) => (
                  <div key={i} className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`material-symbols-outlined p-2 rounded-lg ${m.color}`}>{m.icon}</span>
                      <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-sm">trending_up</span> Live
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{m.type}</p>
                    <p className="font-headline text-2xl font-extrabold mt-1">{m.value} <span className="text-sm font-normal text-on-surface-variant">units</span></p>
                  </div>
                )) : [
                  { icon: 'calendar_month', color: 'text-blue-600 bg-blue-50', label: 'Total Appointments', value: totalApts },
                  { icon: 'event_busy', color: 'text-red-600 bg-red-50', label: 'Missed Appointments', value: missedCount },
                  { icon: 'biotech', color: 'text-orange-600 bg-orange-50', label: 'Lab Records', value: history?.labs?.length || 0 },
                ].map((m, i) => (
                  <div key={i} className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`material-symbols-outlined p-2 rounded-lg ${m.color}`}>{m.icon}</span>
                    </div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{m.label}</p>
                    <p className="font-headline text-2xl font-extrabold mt-1">{m.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Risk proposal + comments */}
            <div className="grid grid-cols-12 gap-8">
              {/* Left: AI proposal + decision */}
              <div className="col-span-8 space-y-5">
                <div className="bg-white p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' }}>
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-xl font-extrabold tracking-tight text-on-surface">AI Risk Analysis</h3>
                      <p className="text-xs text-primary font-bold tracking-widest uppercase">CareFlow Risk Engine v2.0</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="bg-surface-container-low p-5 rounded-xl">
                      <h4 className="text-sm font-bold text-on-surface mb-2">Detected Risk Pattern</h4>
                      <p className="text-base font-semibold text-primary leading-snug">
                        {history?.risk_score
                          ? `Patient risk score is ${history.risk_score.composite_score.toFixed(2)}. ${
                              history.risk_score.composite_score >= 9.0 
                                ? 'Patient is HIGH RISK. Escalate immediately.' 
                                : history.risk_score.composite_score >= 5.0 
                                  ? 'Patient requires follow-up. Moderate risk detected.' 
                                  : 'No action required. Patient is low risk.'
                            }`
                          : 'Patient currently shows stable indicators or risk engine has not been run. Continued monitoring recommended.'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/20 pb-2">Clinical Rationale</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: 'history_edu', title: 'Reasoning Breakdown', desc: history?.risk_score ? history.risk_score.reasoning_string.split('|').join(', ') : 'N/A' },
                          { icon: 'calendar_month', title: 'Appointment Adherence', desc: `${totalApts - missedCount} of ${totalApts} appointments attended in the observation window.` },
                          { icon: 'biotech', title: 'Lab Trend', desc: `${history?.labs?.length || 0} lab records analyzed over the ${window}-day window.` },
                          { icon: 'medication', title: 'Chronic Conditions', desc: conds.length > 0 ? `Active: ${conds.slice(0, 2).map(c => c.replace(/_/g, ' ')).join(', ')}${conds.length > 2 ? ` +${conds.length - 2} more` : ''}.` : 'No chronic conditions on record.' },
                        ].map((r, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">{r.icon}</span>
                            <div>
                              <p className="text-sm font-bold text-on-surface">{r.title}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5">{r.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment history */}
                {history?.appointments?.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-primary-fixed border-b border-primary/10">
                      <h4 className="font-headline font-bold text-on-primary-fixed">Appointment History</h4>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                      {history.appointments.slice(0, 6).map((apt, i) => (
                        <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-surface-container-low transition-colors">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${apt.status === 'Missed' ? 'bg-error-container text-error' : apt.status === 'Attended' ? 'bg-green-100 text-green-800' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                            {apt.status}
                          </span>
                          <span className="text-sm text-on-surface-variant">{new Date(apt.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision panel */}
                <div className="glass-panel p-6 rounded-2xl border border-white shadow-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-headline font-extrabold text-on-surface tracking-tight">Clinical Action</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Review and submit your clinical decision for this patient.</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => history?.proposal ? setCommentModal('Rejected') : alert('No pending proposal for this patient.')} className="px-5 py-2.5 bg-error text-on-error rounded-lg font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50" disabled={!history?.proposal}>
                      Reject
                    </button>
                    <button onClick={() => history?.proposal ? setCommentModal('Approved') : alert('No pending proposal for this patient.')} className="px-5 py-2.5 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-sm hover:bg-secondary-fixed active:scale-95 transition-all disabled:opacity-50" disabled={!history?.proposal}>
                      Approve with Comments
                    </button>
                    <button
                      className="px-6 py-2.5 text-white rounded-lg font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' }}
                      onClick={() => history?.proposal ? decide(history.proposal.proposal_id, 'Approved') : alert('No pending proposal for this patient. Run the risk engine first.')}
                      disabled={!history?.proposal || decidingId === history?.proposal?.proposal_id}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Clinical comments */}
              <aside className="col-span-4">
                <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <h3 className="font-headline text-lg font-extrabold tracking-tight text-on-surface mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined">forum</span>
                    Clinical Comments
                  </h3>

                  <div className="flex-1 space-y-5 overflow-y-auto pr-1">
                    {comments.map((c, i) => (
                      <div key={i} className={`space-y-1.5 border-l-2 pl-4 py-1 ${c.isPrimary ? 'border-primary/30' : 'border-outline-variant/30'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.isPrimary ? 'text-primary bg-primary-fixed' : 'text-on-surface-variant bg-surface-container-highest'}`}>
                            {c.author.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-medium">{c.time}</span>
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">{c.text}</p>
                      </div>
                    ))}

                    {/* Placeholder comments */}
                    {comments.length === 0 && [
                      { author: 'SYSTEM', text: `Patient record loaded. ${window}-day observation window active.`, time: 'NOW', isPrimary: true },
                      { author: 'RISK ENGINE', text: `Composite risk factors: Engagement, Clinical trend, Chronic severity, Instability index.`, time: 'AUTO', isPrimary: false },
                    ].map((c, i) => (
                      <div key={i} className={`space-y-1.5 border-l-2 pl-4 py-1 ${c.isPrimary ? 'border-primary/30' : 'border-outline-variant/20'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.isPrimary ? 'text-primary bg-primary-fixed' : 'text-on-surface-variant bg-surface-container-highest'}`}>{c.author}</span>
                          <span className="text-[10px] text-on-surface-variant">{c.time}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed italic">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-outline-variant/20">
                    <div className="relative">
                      <input
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addComment()}
                        placeholder="Add a clinical note..."
                        className="w-full bg-white border-none rounded-xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                      />
                      <button onClick={addComment} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container transition-colors">
                        <span className="material-symbols-outlined">send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      {/* Comment/decision modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-primary-fixed px-6 py-4 flex items-center justify-between">
              <h3 className="font-headline font-bold text-on-primary-fixed">
                {commentModal === 'Approved' ? 'Approve with Comment' : 'Reject with Comment'}
              </h3>
              <button onClick={() => setCommentModal(null)} className="text-on-primary-fixed-variant hover:text-on-primary-fixed">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-on-surface-variant">Add a clinical note to this decision for the immutable audit record.</p>
              <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={4}
                placeholder="Enter your clinical reasoning..."
                className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (history?.proposal) {
                      if (commentText.trim()) {
                        setComments(prev => [{ author: user?.full_name || 'Doctor', text: commentText, time: 'Just now', isPrimary: true }, ...prev]);
                      }
                      decide(history.proposal.proposal_id, commentModal, commentText);
                    } else {
                      setCommentModal(null); setCommentText('');
                    }
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${commentModal === 'Approved' ? 'text-white' : 'bg-error text-on-error'}`}
                  style={commentModal === 'Approved' ? { background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' } : {}}
                >
                  <span className="material-symbols-outlined">{commentModal === 'Approved' ? 'check_circle' : 'cancel'}</span>
                  Confirm {commentModal === 'Approved' ? 'Approval' : 'Rejection'}
                </button>
                <button onClick={() => setCommentModal(null)} className="clinical-btn-secondary px-5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
