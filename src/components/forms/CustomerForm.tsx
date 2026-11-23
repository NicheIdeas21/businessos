import { useState } from 'react';
import type { Customer } from '../types';
import { Button } from '../ui';

type CustomerInput = Omit<Customer, 'id' | 'createdAt'>;

const empty: CustomerInput = {
  name: '', company: '', email: '', phone: '', address: '', suburb: 'Brisbane', state: 'QLD', postcode: '4000', notes: '', tags: [],
};

export function CustomerForm({ initial, onSubmit, onCancel }: {
  initial?: Customer;
  onSubmit: (data: CustomerInput) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<CustomerInput>(initial ? { ...initial } : empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof CustomerInput, v: string | string[]) => setF(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = 'Name is required';
    if (!f.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email';
    if (!f.phone.trim()) e.phone = 'Phone is required';
    if (f.postcode && !/^\d{4}$/.test(f.postcode)) e.postcode = 'Australian postcodes are 4 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit({ ...f, name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name *" error={errors.name}>
          <input className="input" value={f.name} onChange={e => set('name', e.target.value)} placeholder="Sarah Mitchell" />
        </Field>
        <Field label="Company">
          <input className="input" value={f.company || ''} onChange={e => set('company', e.target.value)} placeholder="Mitchell Cafe" />
        </Field>
        <Field label="Email *" error={errors.email}>
          <input className="input" type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="sarah@example.com.au" />
        </Field>
        <Field label="Phone *" error={errors.phone}>
          <input className="input" value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="0412 555 014" />
        </Field>
        <Field label="Address">
          <input className="input" value={f.address} onChange={e => set('address', e.target.value)} placeholder="12 Queen St" />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Suburb">
            <input className="input" value={f.suburb} onChange={e => set('suburb', e.target.value)} />
          </Field>
          <Field label="State">
            <select className="input" value={f.state} onChange={e => set('state', e.target.value)}>
              {['QLD', 'NSW', 'VIC', 'TAS', 'SA', 'WA', 'ACT', 'NT'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Postcode" error={errors.postcode}>
            <input className="input" value={f.postcode} onChange={e => set('postcode', e.target.value)} placeholder="4000" />
          </Field>
        </div>
      </div>
      <Field label="Notes">
        <textarea className="input min-h-[80px]" value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Preferences, context, history..." />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save customer</Button>
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
