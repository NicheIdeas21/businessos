import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type {
  AppState, Customer, Job, Document, Task, Opportunity,
  AutopilotAction, AutopilotMessage, Settings, ID, LineItem, DocType, JobStatus, InvoiceStatus,
} from '../types';
import { createSeedData } from './seed';

const STORAGE_KEY = 'businessos-state-v1';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && parsed.customers && parsed.settings) return parsed;
    }
  } catch {
    // ignore
  }
  const seed = createSeedData();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // ignore
  }
  return seed;
}

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const docSeq = (type: DocType, docs: Document[]) => {
  const prefix = type === 'quote' ? 'Q-' : 'INV-';
  const nums = docs.filter(d => d.type === type).map(d => parseInt(d.number.replace(/\D/g, ''), 10) || 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
};

export const lineItemTotal = (li: LineItem) => li.quantity * li.unitPrice;
export const documentSubtotal = (d: Document) => d.lineItems.reduce((s, li) => s + lineItemTotal(li), 0);
export const documentTax = (d: Document) => documentSubtotal(d) * d.taxRate;
export const documentTotal = (d: Document) => documentSubtotal(d) + documentTax(d);

interface StoreContextValue extends AppState {
  // customers
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: ID, patch: Partial<Customer>) => void;
  deleteCustomer: (id: ID) => void;
  getCustomer: (id: ID) => Customer | undefined;
  // jobs
  addJob: (j: Omit<Job, 'id' | 'createdAt'>) => Job;
  updateJob: (id: ID, patch: Partial<Job>) => void;
  deleteJob: (id: ID) => void;
  getJob: (id: ID) => Job | undefined;
  setJobStatus: (id: ID, status: JobStatus) => void;
  // documents
  addDocument: (d: Omit<Document, 'id' | 'createdAt' | 'number'>) => Document;
  updateDocument: (id: ID, patch: Partial<Document>) => void;
  deleteDocument: (id: ID) => void;
  getDocument: (id: ID) => Document | undefined;
  convertQuoteToInvoice: (quoteId: ID) => Document | undefined;
  setDocumentStatus: (id: ID, status: InvoiceStatus) => void;
  // tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'status'> & { status?: Task['status'] }) => Task;
  toggleTask: (id: ID) => void;
  deleteTask: (id: ID) => void;
  // opportunities
  setOpportunityInterest: (id: ID, interested: boolean) => void;
  setOpportunityStatus: (id: ID, status: Opportunity['status']) => void;
  // autopilot
  addAutopilotMessage: (content: string, role?: 'assistant' | 'user') => void;
  setAutopilotActionStatus: (id: ID, status: AutopilotAction['status'], outcome?: string) => void;
  // settings
  updateSettings: (patch: Partial<Settings>) => void;
  // utility
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const addCustomer = useCallback((c: Omit<Customer, 'id' | 'createdAt'>) => {
    const newC: Customer = { ...c, id: uid('cust'), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, customers: [newC, ...s.customers] }));
    return newC;
  }, []);

  const updateCustomer = useCallback((id: ID, patch: Partial<Customer>) => {
    setState(s => ({ ...s, customers: s.customers.map(c => c.id === id ? { ...c, ...patch } : c) }));
  }, []);

  const deleteCustomer = useCallback((id: ID) => {
    setState(s => ({
      ...s,
      customers: s.customers.filter(c => c.id !== id),
      jobs: s.jobs.filter(j => j.customerId !== id),
      documents: s.documents.filter(d => d.customerId !== id),
      tasks: s.tasks.filter(t => t.customerId !== id),
    }));
  }, []);

  const getCustomer = useCallback((id: ID) => state.customers.find(c => c.id === id), [state.customers]);

  const addJob = useCallback((j: Omit<Job, 'id' | 'createdAt'>) => {
    const newJ: Job = { ...j, id: uid('job'), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, jobs: [newJ, ...s.jobs] }));
    return newJ;
  }, []);

  const updateJob = useCallback((id: ID, patch: Partial<Job>) => {
    setState(s => ({ ...s, jobs: s.jobs.map(j => j.id === id ? { ...j, ...patch } : j) }));
  }, []);

  const deleteJob = useCallback((id: ID) => {
    setState(s => ({ ...s, jobs: s.jobs.filter(j => j.id !== id) }));
  }, []);

  const getJob = useCallback((id: ID) => state.jobs.find(j => j.id === id), [state.jobs]);

  const setJobStatus = useCallback((id: ID, status: JobStatus) => {
    setState(s => ({ ...s, jobs: s.jobs.map(j => j.id === id ? { ...j, status } : j) }));
  }, []);

  const addDocument = useCallback((d: Omit<Document, 'id' | 'createdAt' | 'number'>) => {
    const newD: Document = {
      ...d,
      id: uid('doc'),
      number: docSeq(d.type, state.documents),
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, documents: [newD, ...s.documents] }));
    return newD;
  }, [state.documents]);

  const updateDocument = useCallback((id: ID, patch: Partial<Document>) => {
    setState(s => ({ ...s, documents: s.documents.map(d => d.id === id ? { ...d, ...patch } : d) }));
  }, []);

  const deleteDocument = useCallback((id: ID) => {
    setState(s => ({ ...s, documents: s.documents.filter(d => d.id !== id) }));
  }, []);

  const getDocument = useCallback((id: ID) => state.documents.find(d => d.id === id), [state.documents]);

  const convertQuoteToInvoice = useCallback((quoteId: ID) => {
    let created: Document | undefined;
    setState(s => {
      const quote = s.documents.find(d => d.id === quoteId && d.type === 'quote');
      if (!quote) return s;
      const invoice: Document = {
        ...quote,
        id: uid('doc'),
        type: 'invoice',
        number: docSeq('invoice', s.documents),
        status: 'draft',
        createdAt: new Date().toISOString(),
        convertedFromId: quote.id,
      };
      created = invoice;
      return { ...s, documents: [invoice, ...s.documents] };
    });
    return created;
  }, []);

  const setDocumentStatus = useCallback((id: ID, status: InvoiceStatus) => {
    setState(s => ({ ...s, documents: s.documents.map(d => d.id === id ? { ...d, status } : d) }));
  }, []);

  const addTask = useCallback((t: Omit<Task, 'id' | 'createdAt' | 'status'> & { status?: Task['status'] }) => {
    const newT: Task = { ...t, id: uid('task'), status: t.status || 'pending', createdAt: new Date().toISOString() };
    setState(s => ({ ...s, tasks: [newT, ...s.tasks] }));
    return newT;
  }, []);

  const toggleTask = useCallback((id: ID) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t) }));
  }, []);

  const deleteTask = useCallback((id: ID) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  }, []);

  const setOpportunityInterest = useCallback((id: ID, interested: boolean) => {
    setState(s => ({ ...s, opportunities: s.opportunities.map(o => o.id === id ? { ...o, interested, status: interested ? 'interested' : 'new' } : o) }));
  }, []);

  const setOpportunityStatus = useCallback((id: ID, status: Opportunity['status']) => {
    setState(s => ({ ...s, opportunities: s.opportunities.map(o => o.id === id ? { ...o, status } : o) }));
  }, []);

  const addAutopilotMessage = useCallback((content: string, role: 'assistant' | 'user' = 'assistant') => {
    const m: AutopilotMessage = { id: uid('msg'), role, content, createdAt: new Date().toISOString() };
    setState(s => ({ ...s, autopilotMessages: [...s.autopilotMessages, m] }));
  }, []);

  const setAutopilotActionStatus = useCallback((id: ID, status: AutopilotAction['status'], outcome?: string) => {
    setState(s => ({ ...s, autopilotActions: s.autopilotActions.map(a => a.id === id ? { ...a, status, outcome } : a) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const resetDemoData = useCallback(() => {
    const seed = createSeedData();
    setState(seed);
  }, []);

  const value: StoreContextValue = {
    ...state,
    addCustomer, updateCustomer, deleteCustomer, getCustomer,
    addJob, updateJob, deleteJob, getJob, setJobStatus,
    addDocument, updateDocument, deleteDocument, getDocument, convertQuoteToInvoice, setDocumentStatus,
    addTask, toggleTask, deleteTask,
    setOpportunityInterest, setOpportunityStatus,
    addAutopilotMessage, setAutopilotActionStatus,
    updateSettings, resetDemoData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
