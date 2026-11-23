import type { JobStatus, InvoiceStatus } from '../types';
import { Badge } from './ui';

const jobStatusMap: Record<JobStatus, { label: string; color: 'slate' | 'blue' | 'amber' | 'green' | 'red' }> = {
  pending: { label: 'Pending', color: 'slate' },
  scheduled: { label: 'Scheduled', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'amber' },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
};

const invoiceStatusMap: Record<InvoiceStatus, { label: string; color: 'slate' | 'blue' | 'green' | 'red' }> = {
  draft: { label: 'Draft', color: 'slate' },
  sent: { label: 'Sent', color: 'blue' },
  paid: { label: 'Paid', color: 'green' },
  overdue: { label: 'Overdue', color: 'red' },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const m = jobStatusMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const m = invoiceStatusMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}

export const jobStatusOptions: JobStatus[] = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];
export const invoiceStatusOptions: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue'];
