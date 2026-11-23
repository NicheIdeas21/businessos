import { useState } from 'react';
import type { Customer, Document, LineItem, DocType, InvoiceStatus } from '../../types';
import { Button } from '../ui';
import { invoiceStatusOptions } from '../status';
import { Plus, Trash2 } from 'lucide-react';

type DocInput = Omit<Document, 'id' | 'createdAt' | 'number'>;

const uid = () => `li-${Math.random().toString(36).slice(2, 9)}`;
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export function DocumentForm({ type, initial, customers, onSubmit, onCancel }: {
  type: DocType;
  initial?: Document;
  customers: Customer[];
  onSubmit: (data: DocInput) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<DocInput>(initial ? { ...initial } : {
    type,
    number: '',
    customerId: customers[0]?.id || '',
    jobId: undefined,
    issueDate: today(),
    dueDate: plusDays(14),
    status: 'draft',
    lineItems: [{ id: uid(), description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0.1,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof DocInput, v: string | number | undefined) => setF(p => ({ ...p, [k]: v }));

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    setF(p => ({ ...p, lineItems: p.lineItems.map(li => li.id === id ? { ...li, ...patch } : li) }));
  const addItem = () => setF(p => ({ ...p, lineItems: [...p.lineItems, { id: uid(), description: '', quantity: 1, unitPrice: 0 }] }));
  const removeItem = (id: string) => setF(p => ({ ...p, lineItems: p.lineItems.filter(li => li.id !== id) }));

  const subtotal = f.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const tax = subtotal * f.taxRate;
  const total = subtotal + tax;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.customerId) e.customerId = 'Select a customer';
    if (f.lineItems.length === 0) e.lineItems = 'Add at least one line item';
    if (f.lineItems.some(li => !li.description.trim())) e.lineItems = 'All line items need a description';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit({
      ...f,
      lineItems: f.lineItems.map(li => ({ ...li, quantity: Number(li.quantity) || 0, unitPrice: Number(li.unitPrice) || 0 })),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Customer *" error={errors.customerId}>
          <select className="input" value={f.customerId} onChange={e => set('customerId', e.target.value)}>
            <option value="">Select a customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" value={f.status} onChange={e => set('status', e.target.value as InvoiceStatus)}>
            {invoiceStatusOptions.map(s => <option key={s} value={s}>{s.replace(/\b\w/g, c => c.toUpperCase())}</option>)}
          </select>
        </Field>
        <Field label="Issue date">
          <input type="date" className="input" value={f.issueDate} onChange={e => set('issueDate', e.target.value)} />
        </Field>
        <Field label="Due date">
          <input type="date" className="input" value={f.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label !mb-0">Line items</label>
          <Button type="button" size="sm" variant="secondary" onClick={addItem}><Plus className="w-3.5 h-3.5" /> Add item</Button>
        </div>
        {errors.lineItems && <p className="text-xs text-danger-600 mb-2">{errors.lineItems}</p>}
        <div className="space-y-2">
          {f.lineItems.map(li => (
            <div key={li.id} className="grid grid-cols-12 gap-2 items-start">
              <input className="input col-span-12 sm:col-span-6" placeholder="Description" value={li.description} onChange={e => updateItem(li.id, { description: e.target.value })} />
              <input type="number" min="0" step="0.01" className="input col-span-4 sm:col-span-2" placeholder="Qty" value={li.quantity} onChange={e => updateItem(li.id, { quantity: Number(e.target.value) })} />
              <input type="number" min="0" step="0.01" className="input col-span-5 sm:col-span-3" placeholder="Unit price" value={li.unitPrice} onChange={e => updateItem(li.id, { unitPrice: Number(e.target.value) })} />
              <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1 pt-1.5">
                <span className="text-xs text-cloud-600 hidden sm:block">${(li.quantity * li.unitPrice).toFixed(0)}</span>
                <button type="button" onClick={() => removeItem(li.id)} className="text-cloud-400 hover:text-danger-600 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-56 space-y-1.5 text-sm">
          <div className="flex justify-between text-cloud-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-cloud-600"><span>GST (10%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold text-navy-800 border-t border-cloud-200 pt-1.5"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
      </div>

      <Field label="Notes">
        <textarea className="input min-h-[60px]" value={f.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Payment terms, notes..." />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save {type}</Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  );
}
