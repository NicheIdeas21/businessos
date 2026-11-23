// Financial + schedule selectors derived from the demo records.
import type { Document, Job, Customer, Task } from '../types';
import { documentTotal } from '../data/store';

const REF_DATE = new Date('2026-11-17T08:00:00');

export type Period = 'today' | 'week' | 'month' | 'year';

export function periodRange(p: Period): { start: Date; end: Date } {
  const end = new Date(REF_DATE);
  end.setHours(23, 59, 59, 999);
  const start = new Date(REF_DATE);
  start.setHours(0, 0, 0, 0);
  switch (p) {
    case 'today': return { start, end };
    case 'week': {
      const s = new Date(start);
      const day = (s.getDay() + 6) % 7; // Monday start
      s.setDate(s.getDate() - day);
      const e = new Date(s);
      e.setDate(s.getDate() + 6); e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    case 'month': {
      const s = new Date(REF_DATE.getFullYear(), REF_DATE.getMonth(), 1);
      const e = new Date(REF_DATE.getFullYear(), REF_DATE.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: s, end: e };
    }
    case 'year': {
      const s = new Date(REF_DATE.getFullYear(), 0, 1);
      const e = new Date(REF_DATE.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start: s, end: e };
    }
  }
}

export function inRange(iso: string, range: { start: Date; end: Date }) {
  const d = new Date(iso);
  return d >= range.start && d <= range.end;
}

export function revenueForPeriod(docs: Document[], p: Period) {
  const r = periodRange(p);
  return docs
    .filter(d => d.type === 'invoice' && d.status === 'paid' && inRange(d.issueDate, r))
    .reduce((s, d) => s + documentTotal(d), 0);
}

export function outstandingTotal(docs: Document[]) {
  return docs.filter(d => d.type === 'invoice' && (d.status === 'sent' || d.status === 'overdue')).reduce((s, d) => s + documentTotal(d), 0);
}

export function paidTotal(docs: Document[]) {
  return docs.filter(d => d.type === 'invoice' && d.status === 'paid').reduce((s, d) => s + documentTotal(d), 0);
}

export function avgJobValue(jobs: Job[]) {
  const completed = jobs.filter(j => j.status === 'completed' && j.price > 0);
  if (completed.length === 0) return 0;
  return completed.reduce((s, j) => s + j.price, 0) / completed.length;
}

export function jobsForDate(jobs: Job[], dateIso: string) {
  return jobs.filter(j => j.date === dateIso && j.status !== 'cancelled');
}

export function todayJobs(jobs: Job[]) {
  return jobsForDate(jobs, REF_DATE.toISOString().slice(0, 10));
}

export function overdueTasks(tasks: Task[]) {
  return tasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < REF_DATE);
}

export function tasksDueToday(tasks: Task[]) {
  const todayIso = REF_DATE.toISOString().slice(0, 10);
  return tasks.filter(t => t.status === 'pending' && t.dueDate === todayIso);
}

export function upcomingTasks(tasks: Task[]) {
  const todayIso = REF_DATE.toISOString().slice(0, 10);
  return tasks.filter(t => t.status === 'pending' && t.dueDate > todayIso);
}

// Monthly revenue for last 6 months (including current)
export function monthlyRevenue(docs: Document[]): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(REF_DATE.getFullYear(), REF_DATE.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const v = docs
      .filter(doc => doc.type === 'invoice' && doc.status === 'paid')
      .filter(doc => { const id = new Date(doc.issueDate); return id >= d && id < next; })
      .reduce((s, doc) => s + documentTotal(doc), 0);
    out.push({ label: d.toLocaleDateString('en-AU', { month: 'short' }), value: v });
  }
  return out;
}

export function jobsCompletedByMonth(jobs: Job[]): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(REF_DATE.getFullYear(), REF_DATE.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const v = jobs.filter(j => j.status === 'completed' && j.date).filter(j => { const jd = new Date(j.date); return jd >= d && jd < next; }).length;
    out.push({ label: d.toLocaleDateString('en-AU', { month: 'short' }), value: v });
  }
  return out;
}

export function newCustomersByMonth(customers: Customer[]): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(REF_DATE.getFullYear(), REF_DATE.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const v = customers.filter(c => { const cd = new Date(c.createdAt); return cd >= d && cd < next; }).length;
    out.push({ label: d.toLocaleDateString('en-AU', { month: 'short' }), value: v });
  }
  return out;
}

export { REF_DATE };
