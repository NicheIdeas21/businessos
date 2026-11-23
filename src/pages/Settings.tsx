import { useState } from 'react';
import { Building2, User, Bell, Bot, Check, Save } from 'lucide-react';
import { useStore } from '../data/store';
import { Card, Button, Badge, PageHeader } from '../components/ui';
import type { Settings as SettingsType, AutopilotLevel } from '../types';

const CURRENCIES = [
  { code: 'AUD', symbol: '$', label: 'Australian Dollar' },
  { code: 'NZD', symbol: '$', label: 'New Zealand Dollar' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
];

const TIMEZONES = [
  'Australia/Brisbane', 'Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Adelaide',
  'Pacific/Auckland', 'UTC', 'Europe/London', 'America/New_York',
];

export function SettingsPage() {
  const { settings, updateSettings, resetDemoData } = useStore();
  const [f, setF] = useState<SettingsType>({ ...settings });
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof SettingsType>(k: K, v: SettingsType[K]) => {
    setF(p => ({ ...p, [k]: v }));
    setSaved(false);
  };

  const setNotif = (k: keyof SettingsType['notifications'], v: boolean) => {
    setF(p => ({ ...p, notifications: { ...p.notifications, [k]: v } }));
    setSaved(false);
  };

  const setAutopilot = (k: keyof SettingsType['autopilot'], v: string | boolean) => {
    setF(p => ({ ...p, autopilot: { ...p.autopilot, [k]: v } as SettingsType['autopilot'] }));
    setSaved(false);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const cur = CURRENCIES.find(c => c.code === f.currency);
    updateSettings({ ...f, currencySymbol: cur?.symbol || '$' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your business profile and preferences" />

      <form onSubmit={save} className="space-y-4 max-w-3xl">
        <Card>
          <div className="px-5 py-4 border-b border-cloud-200 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-navy-700" />
            <h3 className="font-semibold text-navy-800">Business profile</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Business name"><input className="input" value={f.businessName} onChange={e => set('businessName', e.target.value)} /></Field>
            <Field label="Business type"><input className="input" value={f.businessType} onChange={e => set('businessType', e.target.value)} /></Field>
            <Field label="Currency">
              <select className="input" value={f.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
              </select>
            </Field>
            <Field label="Time zone">
              <select className="input" value={f.timeZone} onChange={e => set('timeZone', e.target.value)}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </Field>
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-cloud-200 flex items-center gap-2">
            <User className="w-4 h-4 text-navy-700" />
            <h3 className="font-semibold text-navy-800">Personal details</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Owner name"><input className="input" value={f.ownerName} onChange={e => set('ownerName', e.target.value)} /></Field>
            <Field label="Email"><input type="email" className="input" value={f.email} onChange={e => set('email', e.target.value)} /></Field>
            <Field label="Phone"><input className="input" value={f.phone} onChange={e => set('phone', e.target.value)} /></Field>
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-cloud-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-navy-700" />
            <h3 className="font-semibold text-navy-800">Notification preferences</h3>
          </div>
          <div className="p-5 space-y-1">
            <Toggle label="New opportunities" desc="Get notified when a new job request matches your services" checked={f.notifications.newOpportunities} onChange={v => setNotif('newOpportunities', v)} />
            <Toggle label="Overdue invoices" desc="Alerts when invoices become overdue" checked={f.notifications.overdueInvoices} onChange={v => setNotif('overdueInvoices', v)} />
            <Toggle label="Upcoming jobs" desc="Reminders for jobs scheduled in the next 24 hours" checked={f.notifications.upcomingJobs} onChange={v => setNotif('upcomingJobs', v)} />
            <Toggle label="Autopilot actions" desc="Notify when Autopilot has suggestions ready" checked={f.notifications.autopilotActions} onChange={v => setNotif('autopilotActions', v)} />
            <Toggle label="Weekly digest" desc="A summary of your week, every Monday" checked={f.notifications.weeklyDigest} onChange={v => setNotif('weeklyDigest', v)} />
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-cloud-200 flex items-center gap-2">
            <Bot className="w-4 h-4 text-navy-700" />
            <h3 className="font-semibold text-navy-800">Autopilot</h3>
            <Badge color="blue" className="ml-auto">Simulated</Badge>
          </div>
          <div className="p-5 space-y-3">
            <Toggle label="Enable Autopilot" desc="Allow Autopilot to monitor and suggest actions" checked={f.autopilot.enabled} onChange={v => setAutopilot('enabled', v)} />
            <div>
              <label className="label">Permission level</label>
              <select className="input" value={f.autopilot.level} onChange={e => setAutopilot('level', e.target.value as AutopilotLevel)}>
                <option value="observe">Observe — monitor only</option>
                <option value="prepare">Prepare — draft suggestions for review</option>
                <option value="execute_with_approval">Execute with approval — you approve each action</option>
                <option value="limited_autonomy">Limited autonomy — low-risk tasks handled automatically</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between sticky bottom-0 bg-cloud-100/90 backdrop-blur p-3 -mx-4 sm:-mx-6 rounded-lg">
          <button
            type="button"
            onClick={() => { if (confirm('Reset all demo data to the original sample? This will discard your changes.')) resetDemoData(); }}
            className="text-sm text-cloud-500 hover:text-danger-600"
          >
            Reset demo data
          </button>
          <Button type="submit">
            {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 py-2.5 cursor-pointer">
      <button type="button" onClick={() => onChange(!checked)} className={`relative w-10 h-6 rounded-full transition shrink-0 mt-0.5 ${checked ? 'bg-brand-500' : 'bg-cloud-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-navy-800">{label}</p>
        <p className="text-xs text-cloud-500">{desc}</p>
      </div>
    </label>
  );
}
