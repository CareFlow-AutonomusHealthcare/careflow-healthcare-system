import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, AlertTriangle, ChevronRight, RefreshCw, Layers } from 'lucide-react';
import { careflowAPI } from '../api/client';

// Mock Data for demonstration since the DB is initially empty
const MOCK_PATIENTS = [
  { id: 1, name: 'Arthur Pendelton', score: 9.2, trend: 'up', risk: 'High', history: [
    { date: 'Jan 15', score: 4.5 }, { date: 'Feb 01', score: 5.2 }, { date: 'Feb 15', score: 7.8 }, { date: 'Mar 01', score: 8.5 }, { date: 'Mar 15', score: 9.2 }
  ]},
  { id: 2, name: 'Sarah Jenkins', score: 6.5, trend: 'flat', risk: 'Moderate', history: [
    { date: 'Jan 15', score: 6.2 }, { date: 'Feb 01', score: 6.8 }, { date: 'Feb 15', score: 6.4 }, { date: 'Mar 01', score: 6.5 }, { date: 'Mar 15', score: 6.5 }
  ]},
  { id: 3, name: 'Michael Chang', score: 2.1, trend: 'down', risk: 'Low', history: [
    { date: 'Jan 15', score: 5.5 }, { date: 'Feb 01', score: 4.2 }, { date: 'Feb 15', score: 3.8 }, { date: 'Mar 01', score: 2.5 }, { date: 'Mar 15', score: 2.1 }
  ]}
];

const RiskCard = ({ title, count, colorClass, borderClass }) => (
  <div className={`glass-panel p-6 ${borderClass}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 font-medium mb-1">{title}</p>
        <h3 className={`text-4xl font-bold ${colorClass}`}>{count}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
         <Layers className={colorClass} size={24} />
      </div>
    </div>
  </div>
);

const PatientRow = ({ patient }) => {
  const isHigh = patient.risk === 'High';
  const isMod = patient.risk === 'Moderate';
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-clinical-700/50 rounded-lg transition-colors border-b border-clinical-border/50 last:border-0 cursor-pointer group">
      <div className="flex items-center gap-4 w-1/3">
        <div className={`w-2 h-10 rounded-full ${isHigh ? 'bg-clinical-danger' : isMod ? 'bg-clinical-warning' : 'bg-clinical-success'}`}></div>
        <div>
          <h4 className="font-medium text-gray-200 group-hover:text-clinical-accent transition-colors">{patient.name}</h4>
          <p className="text-xs text-gray-500">ID: {patient.id.toString().padStart(5, '0')} • 90d Window</p>
        </div>
      </div>
      
      <div className="w-1/3 h-12 flex justify-center">
         <ResponsiveContainer width="80%" height="100%">
            <LineChart data={patient.history}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 10]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#3B82F6' }}
                labelStyle={{ display: 'none' }}
              />
              <Line type="monotone" dataKey="score" stroke={isHigh ? '#EF4444' : isMod ? '#F59E0B' : '#10B981'} strokeWidth={3} dot={false} />
            </LineChart>
         </ResponsiveContainer>
      </div>
      
      <div className="w-1/3 flex items-center justify-end gap-6">
        <div className="text-right">
          <p className="text-sm text-gray-400 uppercase tracking-wide">Risk Index</p>
          <div className="flex items-center gap-2 justify-end">
            {isHigh && <AlertTriangle size={16} className="text-clinical-danger animate-pulse" />}
            <span className={`text-xl font-bold ${isHigh ? 'text-clinical-danger' : isMod ? 'text-clinical-warning' : 'text-clinical-success'}`}>
              {patient.score.toFixed(1)}
            </span>
          </div>
        </div>
        <button className="p-2 text-gray-500 hover:text-white hover:bg-clinical-700 rounded-lg transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [isScoring, setIsScoring] = useState(false);

  // In a real app, we'd fetch actual scores here
  // useEffect(() => { ... }, []);

  const handleBatchScore = async () => {
    setIsScoring(true);
    try {
      // Simulate API call < 2s
      await new Promise(r => setTimeout(r, 1200));
      // await careflowAPI.triggerBatchScoring();
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Deterioration Dashboard</h2>
          <p className="text-gray-400">Continuous 90-day multi-variate risk window tracking.</p>
        </div>
        <button 
          onClick={handleBatchScore}
          disabled={isScoring}
          className="clinical-btn-primary"
        >
          <RefreshCw size={18} className={isScoring ? "animate-spin" : ""} />
          {isScoring ? "Scoring Cohort..." : "Run Batch Risk Engine"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RiskCard title="High Risk (≥ 9.0)" count="14" colorClass="text-clinical-danger" borderClass="border-t-4 border-t-clinical-danger" />
        <RiskCard title="Moderate Risk (5.0 - 8.9)" count="42" colorClass="text-clinical-warning" borderClass="border-t-4 border-t-clinical-warning" />
        <RiskCard title="Low Risk (< 5.0)" count="218" colorClass="text-clinical-success" borderClass="border-t-4 border-t-clinical-success" />
      </div>

      <div className="mt-8 glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="text-clinical-accent" />
            Active Observation Cohort
          </h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-clinical-700 rounded-full text-xs text-gray-300 border border-clinical-border">Sorted by: Risk (Desc)</span>
          </div>
        </div>
        
        <div className="bg-clinical-900/50 rounded-xl border border-clinical-border/50">
          <div className="flex px-4 py-3 border-b border-clinical-border/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="w-1/3 pl-6">Patient Identifier</div>
            <div className="w-1/3 text-center">90-Day Trend Velocity</div>
            <div className="w-1/3 text-right pr-14">Current Status</div>
          </div>
          <div className="flex flex-col">
            {patients.map(p => <PatientRow key={p.id} patient={p} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
