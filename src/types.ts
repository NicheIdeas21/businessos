// Core domain types for BusinessOS prototype

export type ID = string;

export type JobStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type DocType = 'quote' | 'invoice';
export type TaskStatus = 'pending' | 'completed';
export type TaskKind = 'task' | 'follow_up' | 'invoice_reminder' | 'reminder';
export type AutopilotLevel = 'observe' | 'prepare' | 'execute_with_approval' | 'limited_autonomy';
export type ApprovalStatus = 'pending' | 'approved' | 'declined' | 'executed';

export interface Customer {
  id: ID;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  notes: string;
  createdAt: string; // ISO
  tags?: string[];
}

export interface Job {
  id: ID;
  customerId: ID;
  title: string;
  description: string;
  status: JobStatus;
  date: string; // ISO date (yyyy-mm-dd)
  startTime: string; // HH:mm
  durationHours: number;
  price: number;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface LineItem {
  id: ID;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Document {
  id: ID;
  type: DocType;
  number: string; // Q-001 / INV-001
  customerId: ID;
  jobId?: ID;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  taxRate: number; // 0.10
  notes?: string;
  createdAt: string;
  convertedFromId?: ID;
}

export interface Task {
  id: ID;
  title: string;
  kind: TaskKind;
  dueDate: string; // ISO date
  customerId?: ID;
  documentId?: ID;
  jobId?: ID;
  status: TaskStatus;
  createdAt: string;
}

export interface Opportunity {
  id: ID;
  category: string;
  title: string;
  description: string;
  suburb: string;
  region: string;
  preferredDate: string;
  postedAt: string; // ISO datetime
  budgetMin?: number;
  budgetMax?: number;
  status: 'new' | 'interested' | 'quoted' | 'won' | 'lost';
  contactName?: string; // not shown publicly
  interested?: boolean;
}

export interface AutopilotAction {
  id: ID;
  title: string;
  description: string;
  category: 'follow_up' | 'quote' | 'respond' | 'review' | 'reminder' | 'insight';
  level: AutopilotLevel;
  status: ApprovalStatus;
  createdAt: string;
  customerId?: ID;
  documentId?: ID;
  jobId?: ID;
  opportunityId?: ID;
  outcome?: string;
}

export interface AutopilotMessage {
  id: ID;
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
}

export interface Settings {
  businessName: string;
  ownerName: string;
  businessType: string;
  currency: string;
  currencySymbol: string;
  timeZone: string;
  email: string;
  phone: string;
  notifications: {
    newOpportunities: boolean;
    overdueInvoices: boolean;
    upcomingJobs: boolean;
    autopilotActions: boolean;
    weeklyDigest: boolean;
  };
  autopilot: {
    enabled: boolean;
    level: AutopilotLevel;
  };
}

export interface AppState {
  customers: Customer[];
  jobs: Job[];
  documents: Document[];
  tasks: Task[];
  opportunities: Opportunity[];
  autopilotActions: AutopilotAction[];
  autopilotMessages: AutopilotMessage[];
  settings: Settings;
}

export const AUD_FMT = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
});

export const formatAUD = (n: number) => AUD_FMT.format(n);

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateLong = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
};

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};
