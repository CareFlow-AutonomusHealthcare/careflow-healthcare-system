import React, { useState, useEffect } from 'react';
import { careflowAPI } from '../../api/client';

export default function InventoryManager() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    careflowAPI.getInventory().then(r => setItems(r.data)).catch(() => {});
  }, []);

  const saveEdit = async (itemId) => {
    setSaving(true);
    try {
      await careflowAPI.updateInventory(itemId, parseInt(editQty));
      setItems(prev => prev.map(i => i.item_id === itemId ? { ...i, quantity_in_stock: parseInt(editQty) } : i));
    } catch {}
    finally { setSaving(false); setEditing(null); }
  };

  const level = (qty) => {
    if (qty <= 10) return { label: 'Critical', cls: 'chip-high', bar: 'bg-error', pct: Math.max((qty/200)*100, 3) };
    if (qty <= 50) return { label: 'Low', cls: 'chip-warning', bar: 'bg-tertiary', pct: (qty/200)*100 };
    return { label: 'OK', cls: 'chip-success', bar: 'bg-green-500', pct: Math.min((qty/200)*100, 100) };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Inventory Management</h2>
        <p className="text-on-surface-variant mt-1">Monitor and update equipment stock levels across departments.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Items', value: items.length, color: 'text-primary' },
          { label: 'Low Stock', value: items.filter(i=>i.quantity_in_stock<=50&&i.quantity_in_stock>10).length, color: 'text-tertiary' },
          { label: 'Critical', value: items.filter(i=>i.quantity_in_stock<=10).length, color: 'text-error' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{s.label}</p>
            <p className={`font-headline text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-primary-fixed border-b border-primary/10">
          <h3 className="font-headline font-bold text-on-primary-fixed">Stock Levels</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Item</th><th>Unit</th><th>Quantity</th><th>Level</th><th>Stock Bar</th><th className="text-right">Order</th></tr>
          </thead>
          <tbody>
            {items.map(item => {
              const l = level(item.quantity_in_stock);
              return (
                <tr key={item.item_id}>
                  <td className="font-medium text-sm text-on-surface">{item.item_name}</td>
                  <td className="text-sm text-on-surface-variant">{item.unit}</td>
                  <td>
                    {editing === item.item_id ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} autoFocus
                          className="w-24 bg-surface-container-low border-none rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        <button onClick={() => saveEdit(item.item_id)} disabled={saving} className="p-1.5 text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">check</span>
                        </button>
                        <button onClick={() => setEditing(null)} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-sm">{item.quantity_in_stock}</span>
                    )}
                  </td>
                  <td><span className={l.cls}>{l.label}</span></td>
                  <td className="w-32">
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${l.bar}`} style={{ width: `${l.pct}%` }}></div>
                    </div>
                  </td>
                  <td className="text-right">
                    <button onClick={() => { setEditing(item.item_id); setEditQty(String(item.quantity_in_stock)); }}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
