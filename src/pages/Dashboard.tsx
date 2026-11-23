import { useState, useMemo } from 'react';
import {
  DollarSign, FileWarning, FileCheck2, Wrench, Plus, CheckCircle2, Circle,
  ArrowRight, Bot, Sparkles, TrendingUp, Clock, MapPin, Target, CalendarClock,
} from 'lucide-react';
import { useStore, documentTotal } from '../data/store';
import { useNav } from '../router';
import { Card, Button, Badge, EmptyState } from '../components/ui';
import { JobStatusBadge } from '../components/status';
import { LineChart, BarChart } from '../components/charts';
import {
  type Period, periodRange, revenueForPeriod, outstandingTotal, paidTotal,
  avgJobValue, todayJobs, overdueTasks, tasksDueToday, upcomingTasks,
  monthlyRevenue, jobsCompletedByMonth, newCustomersByMonth, REF_DATE, inRange,
} from '../lib/finance';
import { formatAUD, formatDateLong, timeAgo, formatAUD as aud } from '../types';
import { TaskComposer } from '../components/TaskComposer';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
];

export function Dashboard() {
  const { settings, customers, jobs, documents, tasks, autopilotActions, toggleTask, addTask } = useStore();
  const { navigate } = useNav();
  const [period, setPeriod] = useState<Period>('month');
  const [taskOpen, setTaskOpen] = useState(false);

  const greeting = (() => {
    const h = REF_DATE.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const revenue = revenueForPeriod(documents, period);
  const outstanding = outstandingTotal(documents);
  const paid = paidTotal(documents);
  const avg = avgJobValue(jobs);
  const tJobs = todayJobs(jobs);

  const overdue = overdueTasks(tasks);
  const dueToday = tasksDueToday(tasks);
  const upcoming = upcomingTasks(tasks);
  const followUps = tasks.filter(t => t.status === 'pending' && t.kind === 'follow_up');
  const invoiceReminders = tasks.filter(t => t.status === 'pending' && t.kind === 'invoice_reminder');

  const revSeries = useMemo(() => monthlyRevenue(documents), [documents]);
  const jobsSeries = useMemo(() => jobsCompletedByMonth(jobs), [jobs]);
  const custSeries = useMemo(() => newCustomersByMonth(customers), [customers]);

  const pendingApprovals = autopilotActions.filter(a => a.status === 'pending');

  const customerName = (id?: string) => customers.find(c => c.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-cloud-500">{formatDateLong(REF_DATE.toISOString())}</p>
          <h1 className="text-2xl font-semibold text-navy-800 tracking-tight mt-0.5">
            {greeting}, {settings.ownerName.split(' ')[0]}
          </h1>
          <p className="text-sm text-cloud-600 mt-1">{settings.businessName} — {settings.businessType}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setTaskOpen(true)}><Plus className="w-4 h-4" /> New task</Button>
          <Button onClick={() => navigate('opportunities')}><Target className="w-4 h-4" /> Find work</Button>
        </div>
      </div>

      {/* Financial overview */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-cloud-200">
          <div>
            <h2 className="font-semibold text-navy-800">Financial overview</h2>
            <p className="text-xs text-cloud-500">Calculated from your demo invoice records</p>
          </div>
          <div className="inline-flex rounded-lg border border-cloud-200 bg-cloud-100 p-0.5 self-start">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${period === p.key ? 'bg-white text-navy-800 shadow-sm' : 'text-cloud-600 hover:text-navy-700'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-cloud-200">
          <Metric icon={<DollarSign className="w-5 h-5" />} label="Revenue" value={formatAUD(revenue)} hint={period === 'today' ? 'Paid today' : `Paid ${PERIODS.find(p => p.key === period)?.label.toLowerCase()}`} color="brand" />
          <Metric icon={<FileWarning className="w-5 h-5" />} label="Outstanding invoices" value={formatAUD(outstanding)} hint={`${documents.filter(d => d.type === 'invoice' && (d.status === 'sent' || d.status === 'overdue')).length} open`} color="amber" />
          <Metric icon={<FileCheck2 className="w-5 h-5" />} label="Paid invoices" value={formatAUD(paid)} hint={`${documents.filter(d => d.type === 'invoice' && d.status === 'paid').length} paid`} color="green" />
          <Metric icon={<Wrench className="w-5 h-5" />} label="Average job value" value={formatAUD(avg)} hint={`${jobs.filter(j => j.status === 'completed').length} completed jobs`} color="navy" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <Card className="lg:col-span-2">
          <CardHeader title="Today's schedule" subtitle={`${tJobs.length} job${tJobs.length === 1 ? '' : 's'} scheduled`} action={<Button size="sm" variant="ghost" onClick={() => navigate('schedule')}>Open schedule <ArrowRight className="w-3.5 h-3.5" /></Button>} />
          {tJobs.length === 0 ? (
            <EmptyState icon={<CalendarClock className="w-8 h-8" />} title="Nothing scheduled today" description="Enjoy the breather, or add a new booking." action={<Button size="sm" onClick={() => navigate('schedule')}><Plus className="w-3.5 h-3.5" /> Add booking</Button>} />
          ) : (
            <div className="divide-y divide-cloud-100">
              {tJobs.map(j => {
                const c = customers.find(x => x.id === j.customerId);
                return (
                  <button key={j.id} onClick={() => navigate('schedule', { job: j.id })} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-cloud-50 text-left transition">
                    <div className="text-center shrink-0 w-14">
                      <div className="text-sm font-semibold text-navy-800">{j.startTime}</div>
                      <div className="text-[10px] text-cloud-500">{j.durationHours}h</div>
                    </div>
                    <div className="w-px h-9 bg-cloud-200" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-navy-800 truncate">{j.title}</div>
                      <div className="text-xs text-cloud-500 truncate">{c?.name}{j.location ? ` · ${j.location}` : ''}</div>
                    </div>
                    <div className="shrink-0"><JobStatusBadge status={j.status} /></div>
                    <ArrowRight className="w-4 h-4 text-cloud-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* AI Autopilot */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 to-transparent pointer-events-none" />
          <div className="relative px-5 py-4 border-b border-cloud-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-800 text-brand-400 flex items-center justify-center"><Bot className="w-4.5 h-4.5" /></div>
            <div>
              <h2 className="font-semibold text-navy-800 text-sm">AI Autopilot</h2>
              <p className="text-[11px] text-cloud-500">Simulated recommendations</p>
            </div>
            <Badge color="blue" className="ml-auto">Observe + Prepare</Badge>
          </div>
          <div className="relative px-5 py-4 space-y-3 max-h-[340px] overflow-y-auto">
            <div className="rounded-lg bg-navy-800 text-white/90 text-xs p-3 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 inline mr-1" />
              You have <strong className="text-white">{pendingApprovals.length}</strong> suggested actions ready. {overdue.length} overdue task{overdue.length === 1 ? '' : 's'} need attention.
            </div>
            {pendingApprovals.slice(0, 4).map(a => (
              <div key={a.id} className="rounded-lg border border-cloud-200 p-3 hover:border-brand-300 transition">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-navy-800">{a.title}</p>
                    <p className="text-[11px] text-cloud-500 mt-0.5 line-clamp-2">{a.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge color="slate">{a.level.replace(/_/g, ' ')}</Badge>
                  <button onClick={() => navigate('autopilot')} className="ml-auto text-[11px] font-medium text-brand-600 hover:text-brand-700">Review →</button>
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('autopilot')}>Open Autopilot</Button>
          </div>
        </Card>
      </div>

      {/* Tasks + Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader title="Tasks and reminders" subtitle={`${overdue.length} overdue · ${dueToday.length} due today`} action={<Button size="sm" variant="ghost" onClick={() => setTaskOpen(true)}><Plus className="w-3.5 h-3.5" /> New</Button>} />
          <div className="px-5 py-2">
            <TaskGroup title="Overdue" color="text-danger-600" tasks={overdue} onToggle={toggleTask} customerName={customerName} />
            <TaskGroup title="Due today" color="text-warning-600" tasks={dueToday} onToggle={toggleTask} customerName={customerName} />
            <TaskGroup title="Upcoming" color="text-cloud-600" tasks={upcoming} onToggle={toggleTask} customerName={customerName} />
            <TaskGroup title="Customer follow-ups" color="text-brand-600" tasks={followUps.filter(t => !overdue.includes(t) && !dueToday.includes(t))} onToggle={toggleTask} customerName={customerName} />
            <TaskGroup title="Invoice reminders" color="text-navy-700" tasks={invoiceReminders.filter(t => !overdue.includes(t) && !dueToday.includes(t))} onToggle={toggleTask} customerName={customerName} />
            {tasks.filter(t => t.status === 'pending').length === 0 && (
              <EmptyState icon={<CheckCircle2 className="w-7 h-7" />} title="All tasks complete" description="You're ahead of schedule." />
            )}
          </div>
        </Card>

        {/* Opportunities */}
        <Card>
          <CardHeader title="Opportunities" subtitle="Fresh job requests near you" action={<Button size="sm" variant="ghost" onClick={() => navigate('opportunities')}>All <ArrowRight className="w-3.5 h-3.5" /></Button>} />
          <div className="divide-y divide-cloud-100">
            {tasks.filter(t => t.status === 'pending').length === 0 && null}
            {useStore().opportunities.slice(0, 4).map(o => (
              <div key={o.id} className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <Badge color="blue">{o.category}</Badge>
                  <span className="text-[11px] text-cloud-500 ml-auto">{timeAgo(o.postedAt)}</span>
                </div>
                <p className="text-sm font-medium text-navy-800 mt-1.5 truncate">{o.title}</p>
                <p className="text-xs text-cloud-500 mt-0.5 line-clamp-1">{o.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-cloud-600">
                  <MapPin className="w-3 h-3" /> {o.suburb}
                  <Clock className="w-3 h-3 ml-1" /> {o.preferredDate}
                </div>
                <div className="flex gap-1.5 mt-2.5">
                  <Button size="sm" variant="secondary" className="!py-1 !text-[11px]" onClick={() => navigate('opportunities', { opp: o.id })}>View</Button>
                  <Button size="sm" className="!py-1 !text-[11px]" onClick={() => navigate('billing', { newQuote: '1', opp: o.id })}>Prepare quote</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Business growth */}
      <Card>
        <CardHeader title="Business growth" subtitle="Demonstration data — derived from the demo records" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-cloud-200">
          <div className="bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-cloud-500">Revenue trend</p>
                <p className="text-lg font-semibold text-navy-800">{aud(revSeries.reduce((s, x) => s + x.value, 0))}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <LineChart data={revSeries} height={150} formatValue={(v) => aud(v)} />
            <p className="text-[10px] text-cloud-400 mt-2">Last 6 months · paid invoices</p>
          </div>
          <div className="bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-cloud-500">Jobs completed</p>
                <p className="text-lg font-semibold text-navy-800">{jobsSeries.reduce((s, x) => s + x.value, 0)}</p>
              </div>
              <Wrench className="w-5 h-5 text-brand-500" />
            </div>
            <BarChart data={jobsSeries} height={150} accent="#3478F6" />
            <p className="text-[10px] text-cloud-400 mt-2">Last 6 months</p>
          </div>
          <div className="bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-cloud-500">New customers</p>
                <p className="text-lg font-semibold text-navy-800">{custSeries.reduce((s, x) => s + x.value, 0)}</p>
              </div>
              <Target className="w-5 h-5 text-success-500" />
            </div>
            <BarChart data={custSeries} height={150} accent="#20B889" />
            <p className="text-[10px] text-cloud-400 mt-2">Last 6 months</p>
          </div>
        </div>
      </Card>

      <TaskComposer open={taskOpen} onClose={() => setTaskOpen(false)} onCreate={addTask} customers={customers} />
    </div>
  );
}

function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-200">
      <div>
        <h2 className="font-semibold text-navy-800">{title}</h2>
        {subtitle && <p className="text-xs text-cloud-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Metric({ icon, label, value, hint, color }: { icon: React.ReactNode; label: string; value: string; hint: string; color: 'brand' | 'amber' | 'green' | 'navy' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-warning-50 text-warning-600',
    green: 'bg-success-50 text-success-600',
    navy: 'bg-navy-100 text-navy-700',
  };
  return (
    <div className="bg-white p-5">
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</span>
        <div>
          <p className="text-xs text-cloud-500">{label}</p>
          <p className="text-xl font-semibold text-navy-800 tracking-tight">{value}</p>
        </div>
      </div>
      <p className="text-[11px] text-cloud-400 mt-3">{hint}</p>
    </div>
  );
}

function TaskGroup({ title, color, tasks, onToggle, customerName }: { title: string; color: string; tasks: Array<import('../types').Task>; onToggle: (id: string) => void; customerName: (id?: string) => string }) {
  if (tasks.length === 0) return null;
  return (
    <div className="py-2">
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${color} mb-1.5`}>{title} · {tasks.length}</p>
      <div className="space-y-1">
        {tasks.map(t => (
          <button key={t.id} onClick={() => onToggle(t.id)} className="w-full flex items-start gap-2.5 py-1.5 px-1.5 rounded-md hover:bg-cloud-50 text-left group">
            {t.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-success-500 mt-0.5 shrink-0" /> : <Circle className="w-4 h-4 text-cloud-300 mt-0.5 shrink-0 group-hover:text-cloud-400" />}
            <span className={`text-sm ${t.status === 'completed' ? 'line-through text-cloud-400' : 'text-navy-700'}`}>
              {t.title}
              {t.customerId && <span className="text-cloud-400"> · {customerName(t.customerId)}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
