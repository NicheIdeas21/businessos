import { useMemo } from 'react';
import { DollarSign, Wrench, Users, FileWarning, Target, TrendingUp } from 'lucide-react';
import { useStore, documentTotal } from '../data/store';
import { Card, PageHeader, Badge } from '../components/ui';
import { LineChart, BarChart, Donut } from '../components/charts';
import {
  monthlyRevenue, jobsCompletedByMonth, newCustomersByMonth,
  outstandingTotal, paidTotal, REF_DATE,
} from '../lib/finance';
import { formatAUD, formatDate } from '../types';

export function Reports() {
  const { documents, jobs, customers, opportunities } = useStore();

  const revSeries = useMemo(() => monthlyRevenue(documents), [documents]);
  const jobsSeries = useMemo(() => jobsCompletedByMonth(jobs), [jobs]);
  const custSeries = useMemo(() => newCustomersByMonth(customers), [customers]);

  const totalRevenue = revSeries.reduce((s, x) => s + x.value, 0);
  const totalJobs = jobsSeries.reduce((s, x) => s + x.value, 0);
  const totalNewCustomers = custSeries.reduce((s, x) => s + x.value, 0);
  const outstanding = outstandingTotal(documents);
  const paid = paidTotal(documents);

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const avgJobValue = completedJobs.length > 0
    ? completedJobs.reduce((s, j) => s + j.price, 0) / completedJobs.length
    : 0;

  const oppTotal = opportunities.length;
  const oppInterested = opportunities.filter(o => o.status === 'interested').length;
  const oppQuoted = opportunities.filter(o => o.status === 'quoted').length;
  const oppWon = opportunities.filter(o => o.status === 'won').length;

  const invoices = documents.filter(d => d.type === 'invoice');
  const invByStatus = {
    paid: invoices.filter(d => d.status === 'paid').length,
    sent: invoices.filter(d => d.status === 'sent').length,
    overdue: invoices.filter(d => d.status === 'overdue').length,
    draft: invoices.filter(d => d.status === 'draft').length,
  };

  const topCustomers = useMemo(() => {
    return customers.map(c => {
      const spent = invoices.filter(d => d.customerId === c.id && d.status === 'paid').reduce((s, d) => s + documentTotal(d), 0);
      return { name: c.name, spent };
    }).sort((a, b) => b.spent - a.spent).slice(0, 5);
  }, [customers, invoices]);

  return (
    <div>
      <PageHeader title="Reports" subtitle="Performance insights from your demo records" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPI icon={<DollarSign className="w-5 h-5" />} label="Revenue (6mo)" value={formatAUD(totalRevenue)} color="green" />
        <KPI icon={<Wrench className="w-5 h-5" />} label="Jobs completed" value={String(totalJobs)} color="blue" />
        <KPI icon={<Users className="w-5 h-5" />} label="New customers" value={String(totalNewCustomers)} color="navy" />
        <KPI icon={<TrendingUp className="w-5 h-5" />} label="Avg job value" value={formatAUD(avgJobValue)} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <h3 className="font-semibold text-navy-800 mb-1">Revenue trend</h3>
          <p className="text-xs text-cloud-500 mb-4">Paid invoices by month · last 6 months</p>
          <LineChart data={revSeries} height={200} formatValue={v => formatAUD(v)} />
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-navy-800 mb-1">Jobs completed</h3>
          <p className="text-xs text-cloud-500 mb-4">Completed jobs by month · last 6 months</p>
          <BarChart data={jobsSeries} height={200} accent="#3478F6" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <h3 className="font-semibold text-navy-800 mb-1">Customer growth</h3>
          <p className="text-xs text-cloud-500 mb-4">New customers by month</p>
          <BarChart data={custSeries} height={200} accent="#20B889" />
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-navy-800 mb-4">Invoice status breakdown</h3>
          <Donut
            segments={[
              { label: 'Paid', value: invByStatus.paid, color: '#20B889' },
              { label: 'Sent', value: invByStatus.sent, color: '#3478F6' },
              { label: 'Overdue', value: invByStatus.overdue, color: '#E29A08' },
              { label: 'Draft', value: invByStatus.draft, color: '#94A3B8' },
            ]}
            centerValue={String(invoices.length)}
            centerLabel="invoices"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3"><FileWarning className="w-4 h-4 text-warning-600" /><h3 className="font-semibold text-navy-800">Outstanding invoices</h3></div>
          <p className="text-2xl font-semibold text-navy-800">{formatAUD(outstanding)}</p>
          <p className="text-xs text-cloud-500 mt-1">{invoices.filter(d => d.status === 'sent' || d.status === 'overdue').length} open invoices</p>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Paid to date" value={formatAUD(paid)} />
            <Row label="Overdue" value={formatAUD(invoices.filter(d => d.status === 'overdue').reduce((s, d) => s + documentTotal(d), 0))} danger />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-brand-600" /><h3 className="font-semibold text-navy-800">Opportunity conversion</h3></div>
          <div className="space-y-2 text-sm">
            <Row label="Total opportunities" value={String(oppTotal)} />
            <Row label="Expressed interest" value={String(oppInterested)} />
            <Row label="Quoted" value={String(oppQuoted)} />
            <Row label="Won" value={String(oppWon)} />
          </div>
          <div className="mt-3 pt-3 border-t border-cloud-100">
            <p className="text-xs text-cloud-500">Conversion rate</p>
            <p className="text-lg font-semibold text-navy-800">{oppTotal > 0 ? Math.round((oppWon / oppTotal) * 100) : 0}%</p>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-navy-800 mb-3">Top customers by spend</h3>
          {topCustomers.length === 0 || topCustomers[0].spent === 0 ? (
            <p className="text-sm text-cloud-500">No paid invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-cloud-100 text-cloud-600 text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-navy-700 truncate flex-1">{c.name}</span>
                  <span className="font-medium text-navy-800">{formatAUD(c.spent)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-cloud-500">
          <Badge color="slate">Demo data</Badge>
          <span>All figures are derived from the fictional demo records. Reports generated {formatDate(REF_DATE.toISOString())}.</span>
        </div>
      </Card>
    </div>
  );
}

function KPI({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'green' | 'blue' | 'navy' }) {
  const colors = {
    green: 'bg-success-50 text-success-600',
    blue: 'bg-brand-50 text-brand-600',
    navy: 'bg-navy-100 text-navy-700',
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-xs text-cloud-500 truncate">{label}</p>
          <p className="text-base font-semibold text-navy-800 truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-cloud-600">{label}</span>
      <span className={danger ? 'text-danger-600 font-medium' : 'text-navy-700 font-medium'}>{value}</span>
    </div>
  );
}
