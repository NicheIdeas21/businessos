import { useState } from 'react';
import type { Customer, Job, JobStatus } from '../../types';
import { Button } from '../ui';
import { jobStatusOptions } from '../status';

type JobInput = Omit<Job, 'id' | 'createdAt'>;

const empty: JobInput = {
  customerId: '', title: '', description: '', status: 'pending', date: '', startTime: '09:00', durationHours: 1, price: 0, location: '', notes: '',
};

export function JobForm({ initial, customers, onSubmit, onCancel }: {
  initial?: Job;
  customers: Customer[];
  onSubmit: (data: JobInput) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<JobInput>(initial ? { ...initial } : { ...empty, customerId: customers[0]?.id || '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof JobInput, v: string | number) => setF(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.customerId) e.customerId = 'Select a customer';
    if (!f.title.trim()) e.title = 'Title is required';
    if (f.status !== 'pending' && !f.date) e.date = 'Date is required for this status';
    if (f.price < 0) e.price = 'Price cannot be negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit({ ...f, title: f.title.trim(), price: Number(f.price) || 0, durationHours: Number(f.durationHours) || 1 });
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
        <Field label="Job title *" error={errors.title}>
          <input className="input" value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Install new rangehood" />
        </Field>
      </div>
      <Field label="Description">
        <textarea className="input min-h-[70px]" value={f.description} onChange={e => set('description', e.target.value)} placeholder="Scope of work..." />
      </Field>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Date" error={errors.date}>
          <input type="date" className="input" value={f.date} onChange={e => set('date', e.target.value)} />
        </Field>
        <Field label="Start time">
          <input type="time" className="input" value={f.startTime} onChange={e => set('startTime', e.target.value)} />
        </Field>
        <Field label="Duration (hrs)">
          <input type="number" min="0.5" step="0.5" className="input" value={f.durationHours} onChange={e => set('durationHours', Number(e.target.value))} />
        </Field>
        <Field label="Price ($)" error={errors.price}>
          <input type="number" min="0" step="0.01" className="input" value={f.price} onChange={e => set('price', Number(e.target.value))} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Status">
          <select className="input" value={f.status} onChange={e => set('status', e.target.value as JobStatus)}>
            {jobStatusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
          </select>
        </Field>
        <Field label="Location">
          <input className="input" value={f.location || ''} onChange={e => set('location', e.target.value)} placeholder="Job site address or suburb" />
        </Field>
      </div>
      <Field label="Notes">
        <textarea className="input min-h-[60px]" value={f.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Access notes, parking, materials..." />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save booking</Button>
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
