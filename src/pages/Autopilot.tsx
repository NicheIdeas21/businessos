import { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, Check, X, Pause, Play, Shield, History,
  TrendingUp, FileWarning, Target, Wrench, MessageSquare, Clock,
} from 'lucide-react';
import { useStore } from '../data/store';
import { Card, Button, Badge, EmptyState, PageHeader } from '../components/ui';
import { formatAUD, timeAgo } from '../types';
import type { AutopilotLevel } from '../types';
import { outstandingTotal, overdueTasks, todayJobs } from '../lib/finance';

const LEVELS: { key: AutopilotLevel; label: string; desc: string }[] = [
  { key: 'observe', label: 'Observe', desc: 'Monitor only. No actions suggested automatically.' },
  { key: 'prepare', label: 'Prepare', desc: 'Draft suggestions and content for your review.' },
  { key: 'execute_with_approval', label: 'Execute with approval', desc: 'Carry out approved actions. You approve first.' },
  { key: 'limited_autonomy', label: 'Limited autonomy', desc: 'Handle low-risk tasks automatically. High-risk still need approval.' },
];

const CATEGORY_ICON = {
  follow_up: <FileWarning className="w-4 h-4" />,
  quote: <Target className="w-4 h-4" />,
  respond: <MessageSquare className="w-4 h-4" />,
  review: <Clock className="w-4 h-4" />,
  reminder: <FileWarning className="w-4 h-4" />,
  insight: <TrendingUp className="w-4 h-4" />,
};

export function Autopilot() {
  const { settings, updateSettings, autopilotActions, autopilotMessages, addAutopilotMessage, setAutopilotActionStatus, documents, jobs, tasks } = useStore();
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<'chat' | 'approvals' | 'history' | 'permissions'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [autopilotMessages, tab]);

  const pending = autopilotActions.filter(a => a.status === 'pending');
  const history = autopilotActions.filter(a => a.status !== 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const outstanding = outstandingTotal(documents);
  const overdue = overdueTasks(tasks);
  const tJobs = todayJobs(jobs);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    addAutopilotMessage(userMsg, 'user');
    setInput('');
    setTimeout(() => {
      const reply = simulateReply(userMsg, { outstanding, overdueCount: overdue.length, jobsToday: tJobs.length, pendingApprovals: pending.length });
      addAutopilotMessage(reply, 'assistant');
    }, 400);
  };

  const handleApprove = (id: string) => setAutopilotActionStatus(id, 'approved', 'Action approved by owner. (Simulated execution queued.)');
  const handleDecline = (id: string) => setAutopilotActionStatus(id, 'declined', 'Declined by owner.');

  return (
    <div>
      <PageHeader
        title="AI Autopilot"
        subtitle="Simulated assistant — no real AI is connected"
        actions={
          <Button
            variant={settings.autopilot.enabled ? 'danger' : 'success'}
            onClick={() => updateSettings({ autopilot: { ...settings.autopilot, enabled: !settings.autopilot.enabled } })}
          >
            {settings.autopilot.enabled ? <><Pause className="w-4 h-4" /> Pause Autopilot</> : <><Play className="w-4 h-4" /> Resume Autopilot</>}
          </Button>
        }
      />

      {!settings.autopilot.enabled && (
        <Card className="mb-4 border-warning-300 bg-warning-50/50">
          <div className="p-4 flex items-center gap-3">
            <Pause className="w-5 h-5 text-warning-600" />
            <p className="text-sm text-navy-700">Autopilot is <strong>paused</strong>. No new suggestions will be generated. You can still review and action existing items.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <OverviewCard icon={<TrendingUp className="w-4 h-4" />} label="Outstanding" value={formatAUD(outstanding)} />
        <OverviewCard icon={<FileWarning className="w-4 h-4" />} label="Overdue tasks" value={String(overdue.length)} />
        <OverviewCard icon={<Wrench className="w-4 h-4" />} label="Jobs today" value={String(tJobs.length)} />
        <OverviewCard icon={<Clock className="w-4 h-4" />} label="Pending approvals" value={String(pending.length)} />
      </div>

      <div className="inline-flex rounded-lg border border-cloud-200 bg-cloud-100 p-0.5 mb-4">
        {([['chat', 'Assistant'], ['approvals', `Approvals (${pending.length})`], ['history', 'History'], ['permissions', 'Permissions']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition ${tab === k ? 'bg-white text-navy-800 shadow-sm' : 'text-cloud-600 hover:text-navy-700'}`}>{l}</button>
        ))}
      </div>

      {tab === 'chat' && (
        <Card className="overflow-hidden">
          <div ref={scrollRef} className="h-[460px] overflow-y-auto px-4 py-4 space-y-3 bg-cloud-50/40">
            {autopilotMessages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-brand-500 text-white' : 'bg-white border border-cloud-200 text-navy-800'}`}>
                  {m.role === 'assistant' && <Sparkles className="w-3.5 h-3.5 text-brand-500 inline mr-1.5 -mt-0.5" />}
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="border-t border-cloud-200 p-3 flex gap-2">
            <input className="input" placeholder="Ask Autopilot about your business..." value={input} onChange={e => setInput(e.target.value)} />
            <Button type="submit" disabled={!input.trim()}><Send className="w-4 h-4" /> Send</Button>
          </form>
        </Card>
      )}

      {tab === 'approvals' && (
        <Card>
          {pending.length === 0 ? (
            <EmptyState icon={<Check className="w-8 h-8" />} title="No pending approvals" description="You're all caught up." />
          ) : (
            <div className="divide-y divide-cloud-100">
              {pending.map(a => (
                <div key={a.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">{CATEGORY_ICON[a.category]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy-800">{a.title}</p>
                      <p className="text-xs text-cloud-600 mt-1">{a.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge color="blue">{a.level.replace(/_/g, ' ')}</Badge>
                        <span className="text-[11px] text-cloud-500">{timeAgo(a.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button size="sm" variant="ghost" onClick={() => handleDecline(a.id)}><X className="w-3.5 h-3.5" /> Decline</Button>
                    <Button size="sm" variant="success" onClick={() => handleApprove(a.id)}><Check className="w-3.5 h-3.5" /> Approve</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'history' && (
        <Card>
          {history.length === 0 ? (
            <EmptyState icon={<History className="w-8 h-8" />} title="No history yet" description="Approved and declined actions will appear here." />
          ) : (
            <div className="divide-y divide-cloud-100">
              {history.map(a => (
                <div key={a.id} className="p-4 flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.status === 'approved' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}>
                    {a.status === 'approved' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-800 truncate">{a.title}</p>
                    <p className="text-xs text-cloud-500">{a.outcome}</p>
                  </div>
                  <Badge color={a.status === 'approved' ? 'green' : 'red'}>{a.status}</Badge>
                  <span className="text-[11px] text-cloud-500 hidden sm:block">{timeAgo(a.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-navy-700" />
              <h3 className="font-semibold text-navy-800">Permission level</h3>
            </div>
            <div className="space-y-2">
              {LEVELS.map(l => (
                <button
                  key={l.key}
                  onClick={() => updateSettings({ autopilot: { ...settings.autopilot, level: l.key } })}
                  className={`w-full text-left p-3 rounded-lg border transition ${settings.autopilot.level === l.key ? 'border-brand-400 bg-brand-50/60' : 'border-cloud-200 hover:border-cloud-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full border-2 ${settings.autopilot.level === l.key ? 'border-brand-500 bg-brand-500' : 'border-cloud-300'}`} />
                    <span className="text-sm font-medium text-navy-800">{l.label}</span>
                  </div>
                  <p className="text-xs text-cloud-600 mt-1.5 ml-6">{l.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-navy-800 mb-3">How Autopilot works</h3>
            <ol className="space-y-3 text-sm text-cloud-700">
              <Step n="1" title="Observe" desc="Autopilot watches your business data for patterns and priorities." />
              <Step n="2" title="Prepare" desc="It drafts suggested actions, messages and quotes for you to review." />
              <Step n="3" title="Execute with approval" desc="Once you approve, it carries out the action. Nothing happens without your say-so." />
              <Step n="4" title="Limited autonomy" desc="For low-risk repetitive tasks, you can allow automatic handling. High-risk actions always require approval." />
            </ol>
            <div className="mt-4 rounded-lg bg-cloud-50 border border-cloud-200 p-3 text-xs text-cloud-600">
              BusinessOS Autopilot is a <strong>simulated</strong> assistant in this prototype. No real AI integration or automated execution is connected.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function OverviewCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-2 text-cloud-500 text-xs">{icon} {label}</div>
      <p className="text-lg font-semibold text-navy-800 mt-1">{value}</p>
    </Card>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <span className="w-6 h-6 rounded-full bg-navy-800 text-white text-xs font-semibold flex items-center justify-center shrink-0">{n}</span>
      <div>
        <p className="font-medium text-navy-800">{title}</p>
        <p className="text-xs text-cloud-600 mt-0.5">{desc}</p>
      </div>
    </li>
  );
}

function simulateReply(input: string, ctx: { outstanding: number; overdueCount: number; jobsToday: number; pendingApprovals: number }): string {
  const q = input.toLowerCase();
  if (q.includes('overdue') || q.includes('invoice') || q.includes('outstanding')) {
    return `You currently have ${formatAUD(ctx.outstanding)} in outstanding invoices and ${ctx.overdueCount} overdue task${ctx.overdueCount === 1 ? '' : 's'}.\n\nI'd suggest prioritising the overdue invoice follow-ups — I've prepared reminder drafts in the Approvals tab. Would you like me to review them with you?`;
  }
  if (q.includes('today') || q.includes('schedule') || q.includes('job')) {
    return `You have ${ctx.jobsToday} job${ctx.jobsToday === 1 ? '' : 's'} scheduled today. The first starts at 08:30 (Mitchell Cafe maintenance).\n\nI've flagged a reminder to confirm materials for tomorrow's office cabling job. You can see it in Approvals.`;
  }
  if (q.includes('opportunity') || q.includes('work') || q.includes('lead')) {
    return `There are 8 open opportunities in your area, including a high-value bathroom renovation in Ashgrove ($8–15k).\n\nI'd recommend expressing interest in that one — it fits your service area and past project history.`;
  }
  if (q.includes('approve') || q.includes('pending') || q.includes('action')) {
    return `You have ${ctx.pendingApprovals} suggested actions awaiting approval. The most urgent is following up on an overdue invoice to David Thompson ($396 inc. GST, 2 days overdue).\n\nWant me to open that for you?`;
  }
  return `Here's a quick snapshot:\n\n• Outstanding invoices: ${formatAUD(ctx.outstanding)}\n• Overdue tasks: ${ctx.overdueCount}\n• Jobs today: ${ctx.jobsToday}\n• Pending approvals: ${ctx.pendingApprovals}\n\nAsk me about any area — invoices, today's schedule, opportunities, or suggested actions.`;
}
