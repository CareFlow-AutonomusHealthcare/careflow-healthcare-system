import React from 'react';
import { Package, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

const mockInventory = [
  { id: 1, name: 'Normal Saline (1L)', quantity: 45, unit: 'bags', status: 'critical' },
  { id: 2, name: 'Propofol (50ml)', quantity: 120, unit: 'vials', status: 'good' },
  { id: 3, name: 'Central Line Kits', quantity: 12, unit: 'kits', status: 'warning' },
];

const mockStaffing = {
  department: 'ICU',
  current: 18,
  required: 24,
  ratio: 'Critical'
};

export default function InventoryTracker() {
  return (
    <div className="space-y-6">
      
      {/* Staffing Capacity Widget */}
      <div className="glass-panel p-5 border-l-4 border-l-clinical-danger">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium flex items-center gap-2 text-gray-200">
             <Users size={18} className="text-clinical-danger" /> 
             Staffing Capacity
          </h4>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-clinical-danger/20 text-clinical-danger">SHORTAGE</span>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-400">Current / Required</p>
            <p className="text-3xl font-bold font-mono tracking-tight mt-1">{mockStaffing.current}<span className="text-gray-500 text-xl">/{mockStaffing.required}</span></p>
          </div>
          <div className="text-right">
             <p className="text-sm text-clinical-danger font-medium">Deficit: {mockStaffing.required - mockStaffing.current}</p>
          </div>
        </div>
        
        {/* Simple progress bar representation */}
        <div className="w-full bg-clinical-900 rounded-full h-2 mt-4 overflow-hidden border border-clinical-border">
          <div className="bg-clinical-danger h-2 rounded-full" style={{ width: `${(mockStaffing.current / mockStaffing.required) * 100}%` }}></div>
        </div>
      </div>

      {/* Equipment Stock Widget */}
      <div className="glass-panel p-5">
        <h4 className="font-medium flex items-center gap-2 text-gray-200 mb-4 pb-4 border-b border-clinical-border/50">
           <Package size={18} className="text-clinical-accent" /> 
           Critical Inventory
        </h4>
        
        <div className="space-y-4">
          {mockInventory.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-300">{item.name}</p>
                <p className="text-xs text-gray-500">{item.quantity} {item.unit} available</p>
              </div>
              <div>
                {item.status === 'critical' && <AlertCircle size={20} className="text-clinical-danger" />}
                {item.status === 'warning' && <AlertCircle size={20} className="text-clinical-warning" />}
                {item.status === 'good' && <CheckCircle2 size={20} className="text-clinical-success" />}
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 text-sm py-2 rounded-lg text-clinical-accent hover:bg-clinical-800 transition-colors border border-clinical-border border-dashed">
          View Full Manifest
        </button>
      </div>
      
    </div>
  );
}
