import { useState, useMemo } from 'react';
import {
  MapPin, Clock, Search, Target, ArrowRight, Heart, FilePlus, Sparkles, CheckCircle2,
} from 'lucide-react';
import { useStore } from '../data/store';
import { useNav } from '../router';
import { Card, Button, Badge, EmptyState, Modal, PageHeader } from '../components/ui';
import { formatAUD, formatDate, timeAgo } from '../types';
import type { Opportunity } from '../types';

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Handyman', 'Gardening'];

export function Opportunities() {
  const { opportunities, setOpportunityInterest, setOpportunityStatus } = useStore();
  const { params, navigate } = useNav();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const selectedFromParam = params.opp ? opportunities.find(o => o.id === params.opp) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities
      .filter(o => category === 'All' || o.category === category)
      .filter(o => !q || o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q) || o.suburb.toLowerCase().includes(q))
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }, [opportunities, category, query]);

  const stats = useMemo(() => ({
    total: opportunities.length,
    interested: opportunities.filter(o => o.interested).length,
    quoted: opportunities.filter(o => o.status === 'quoted').length,
    newCount: opportunities.filter(o => o.status === 'new').length,
  }), [opportunities]);

  const active = selected || selectedFromParam;

  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle="Discover new work requested by customers near you"
        actions={<Badge color="green"><Sparkles className="w-3 h-3" /> {stats.newCount} new</Badge>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <MiniStat label="Available" value={stats.total} color="text-navy-800" />
        <MiniStat label="New" value={stats.newCount} color="text-brand-600" />
        <MiniStat label="Expressed interest" value={stats.interested} color="text-success-600" />
        <MiniStat label="Quoted" value={stats.quoted} color="text-warning-600" />
      </div>

      <Card className="mb-4">
        <div className="p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cloud-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Search by service, suburb or keyword..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${category === cat ? 'bg-brand-500 text-white' : 'bg-cloud-100 text-cloud-700 hover:bg-cloud-200'}`}>{cat}</button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Target className="w-8 h-8" />} title="No opportunities found" description={query || category !== 'All' ? 'Try broadening your search.' : 'Check back soon — new jobs are posted daily.'} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(o => (
            <Card key={o.id} hover className="p-4 flex flex-col">
              <div className="flex items-start gap-2 mb-2">
                <Badge color="blue">{o.category}</Badge>
                {o.status === 'interested' && <Badge color="green"><Heart className="w-2.5 h-2.5 fill-current" /> Interested</Badge>}
                {o.status === 'quoted' && <Badge color="amber"><FilePlus className="w-2.5 h-2.5" /> Quoted</Badge>}
                <span className="ml-auto text-[11px] text-cloud-500">{timeAgo(o.postedAt)}</span>
              </div>
              <button onClick={() => setSelected(o)} className="text-left">
                <h3 className="font-medium text-navy-800 hover:text-brand-600 transition">{o.title}</h3>
                <p className="text-sm text-cloud-600 mt-1 line-clamp-2">{o.description}</p>
              </button>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-cloud-600">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {o.suburb}, {o.region}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(o.preferredDate)}</span>
              </div>
              {o.budgetMin != null && (
                <p className="text-xs text-cloud-600 mt-1.5">Budget: <span className="font-medium text-navy-700">{formatAUD(o.budgetMin)} – {formatAUD(o.budgetMax || 0)}</span></p>
              )}
              <div className="flex gap-1.5 mt-4 pt-3 border-t border-cloud-100">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setSelected(o)}>View</Button>
                {o.interested ? (
                  <Button size="sm" variant="ghost" onClick={() => setOpportunityInterest(o.id, false)}>Remove interest</Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setOpportunityInterest(o.id, true)}><Heart className="w-3.5 h-3.5" /> Interest</Button>
                )}
                <Button size="sm" onClick={() => { setOpportunityStatus(o.id, 'quoted'); navigate('billing', { newQuote: '1', opp: o.id }); }}><FilePlus className="w-3.5 h-3.5" /> Quote</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!active} onClose={() => setSelected(null)} title="Opportunity details" size="lg">
        {active && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 flex-wrap">
              <Badge color="blue">{active.category}</Badge>
              <span className="text-xs text-cloud-500 ml-auto">Posted {timeAgo(active.postedAt)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-800">{active.title}</h3>
              <p className="text-sm text-cloud-700 mt-2">{active.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location" value={`${active.suburb}, ${active.region}`} hint="Approximate area only" />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Preferred date" value={formatDate(active.preferredDate)} />
              {active.budgetMin != null && <InfoRow icon={<Target className="w-4 h-4" />} label="Budget" value={`${formatAUD(active.budgetMin)} – ${formatAUD(active.budgetMax || 0)}`} />}
              <InfoRow icon={<CheckCircle2 className="w-4 h-4" />} label="Status" value={active.status.replace('_', ' ')} />
            </div>
            <div className="rounded-lg bg-cloud-50 border border-cloud-200 p-3 text-xs text-cloud-600">
              For privacy, customer contact details are shared only after you express interest and the customer accepts. This is a demo — no real contact information is exposed.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {active.interested ? (
                <Button variant="ghost" onClick={() => { setOpportunityInterest(active.id, false); setSelected(null); }}>Remove interest</Button>
              ) : (
                <Button variant="secondary" onClick={() => { setOpportunityInterest(active.id, true); }}><Heart className="w-4 h-4" /> Express interest</Button>
              )}
              <Button onClick={() => { setOpportunityStatus(active.id, 'quoted'); setSelected(null); navigate('billing', { newQuote: '1', opp: active.id }); }}><FilePlus className="w-4 h-4" /> Prepare quote <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="p-3">
      <p className="text-xs text-cloud-500">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
    </Card>
  );
}

function InfoRow({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-cloud-200 p-3">
      <div className="flex items-center gap-1.5 text-xs text-cloud-500">{icon} {label}</div>
      <p className="text-sm font-medium text-navy-800 mt-1 capitalize">{value}</p>
      {hint && <p className="text-[11px] text-cloud-400 mt-0.5">{hint}</p>}
    </div>
  );
}
