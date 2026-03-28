import React, { useState, useEffect } from 'react';
import { Package, Edit2, Check, X } from 'lucide-react';
import { careflowAPI } from '../../api/client';

const MOCK_INVENTORY = [
  { item_id: 1, item_name: 'Surgical Gloves', quantity_in_stock: 240, unit: 'pairs', department_id: 1 },
  { item_id: 2, item_name: 'IV Bags (500ml)', quantity_in_stock: 45, unit: 'units', department_id: 1 },
  { item_id: 3, item_name: 'Syringes (10ml)', quantity_in_stock: 8, unit: 'boxes', department_id: 2 },
  { item_id: 4, item_name: 'Blood Pressure Cuffs', quantity_in_stock: 12, unit: 'units', department_id: 2 },
];

export default function InventoryManager() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // item_id
  const [editQty, setEditQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    careflowAPI.getInventory()
      .then(r => setItems(r.data))
      .catch(() => setItems(MOCK_INVENTORY));
  }, []);

  const startEdit = (item) => {
    setEditing(item.item_id);
    setEditQty(String(item.quantity_in_stock));
  };

  const saveEdit = async (itemId) => {
    setSaving(true);
    try {
      await careflowAPI.updateInventory(itemId, parseInt(editQty));
      setItems(prev => prev.map(i => i.item_id === itemId ? { ...i, quantity_in_stock: parseInt(editQty) } : i));
    } catch {}
    finally { setSaving(false); setEditing(null); }
  };

  const stockLevel = (qty) => {
    if (qty <= 10) return { label: 'Critical', cls: 'text-clinical-danger bg-clinical-danger/10 border-clinical-danger/30' };
    if (qty <= 50) return { label: 'Low', cls: 'text-clinical-warning bg-clinical-warning/10 border-clinical-warning/30' };
    return { label: 'OK', cls: 'text-clinical-success bg-clinical-success/10 border-clinical-success/30' };
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Package className="text-purple-400" size={26} /> Inventory Management
        </h2>
        <p className="text-gray-400 mt-1">View and update equipment stock levels.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="grid grid-cols-5 px-6 py-3 border-b border-clinical-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-2">Item</div>
          <div>Quantity</div>
          <div>Status</div>
          <div className="text-right">Order</div>
        </div>
        {items.map(item => {
          const level = stockLevel(item.quantity_in_stock);
          return (
            <div key={item.item_id} className="grid grid-cols-5 px-6 py-4 border-b border-clinical-border/50 last:border-0 hover:bg-clinical-700/20 transition-colors items-center">
              <div className="col-span-2">
                <p className="font-medium text-gray-200">{item.item_name}</p>
                <p className="text-xs text-gray-500">{item.unit}</p>
              </div>
              <div>
                {editing === item.item_id ? (
                  <input
                    type="number"
                    value={editQty}
                    onChange={e => setEditQty(e.target.value)}
                    className="w-24 bg-clinical-900 border border-clinical-accent rounded px-2 py-1 text-gray-100 text-sm focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="font-mono text-gray-200">{item.quantity_in_stock}</span>
                )}
              </div>
              <div>
                <span className={`text-xs px-2 py-1 rounded border font-semibold ${level.cls}`}>
                  {level.label}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                {editing === item.item_id ? (
                  <>
                    <button onClick={() => saveEdit(item.item_id)} disabled={saving} className="p-2 text-clinical-success hover:bg-clinical-700 rounded-lg transition-colors">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditing(null)} className="p-2 text-gray-500 hover:bg-clinical-700 rounded-lg transition-colors">
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => startEdit(item)} className="p-2 text-gray-500 hover:text-clinical-accent hover:bg-clinical-700 rounded-lg transition-colors">
                    <Edit2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
