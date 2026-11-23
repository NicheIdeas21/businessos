import { useState, useMemo } from 'react';
import {
  Plus, Search, FileText, Pencil, Trash2, ArrowLeft, Download, Send,
  ArrowRight, FileCheck2, Receipt, Quote,
} from 'lucide-react';
import { useStore, documentTotal } from '../data/store';
import { useNav } from '../router';
import { Card, Button, Badge, EmptyState, Modal, PageHeader } from '../components/ui';
import { DocumentForm } from '../components/forms/DocumentForm';
import { InvoiceStatusBadge } from '../components/status';
import { formatAUD, formatDate } from '../types';
import type { Document, DocType } from '../types';

type Tab = 'all' | 'invoices' | 'quotes';

export function Billing() {
  const { documents, customers, addDocument, updateDocument, deleteDocument, convertQuoteToInvoice, setDocumentStatus } = useStore();
  const { params, navigate } = useNav();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState<DocType | null>(null);
  const [editing, setEditing] = useState<Document | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Document | null>(null);

  const selectedDoc = params.doc ? documents.find(d => d.id === params.doc) : null;
  const customerName = (id: string) => customers.find(c => c.id === id)?.name || '—';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents
      .filter(d => tab === 'all' ? true : tab === 'invoices' ? d.type === 'invoice' : d.type === 'quote')
      .filter(d => {
        if (!q) return true;
        return d.number.toLowerCase().includes(q) || customerName(d.customerId).toLowerCase().includes(q);
      })
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [documents, tab, query]);

  const totals = useMemo(() => {
    const inv = documents.filter(d => d.type === 'invoice');
    return {
      paid: inv.filter(d => d.status === 'paid').reduce((s, d) => s + documentTotal(d), 0),
      outstanding: inv.filter(d => d.status === 'sent' || d.status === 'overdue').reduce((s, d) => s + documentTotal(d), 0),
      overdue: inv.filter(d => d.status === 'overdue').reduce((s, d) => s + documentTotal(d), 0),
      quotesOpen: documents.filter(d => d.type === 'quote' && (d.status === 'sent' || d.status === 'draft')).length,
    };
  }, [documents]);

  if (selectedDoc) {
    return <DocumentDetail doc={selectedDoc} onBack={() => navigate('billing')} onEdit={() => setEditing(selectedDoc)} />;
  }

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Quotes, invoices and payment tracking"
        actions={
          <>
            <Button variant="secondary" onClick={() => setCreating('quote')}><Plus className="w-4 h-4" /> Quote</Button>
            <Button onClick={() => setCreating('invoice')}><Plus className="w-4 h-4" /> Invoice</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <SummaryCard icon={<FileCheck2 className="w-5 h-5" />} label="Paid" value={formatAUD(totals.paid)} color="green" />
        <SummaryCard icon={<Receipt className="w-5 h-5" />} label="Outstanding" value={formatAUD(totals.outstanding)} color="blue" />
        <SummaryCard icon={<FileText className="w-5 h-5" />} label="Overdue" value={formatAUD(totals.overdue)} color="amber" />
        <SummaryCard icon={<Quote className="w-5 h-5" />} label="Open quotes" value={String(totals.quotesOpen)} color="navy" />
      </div>

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border-b border-cloud-200">
          <div className="inline-flex rounded-lg border border-cloud-200 bg-cloud-100 p-0.5 self-start">
            {(['all', 'invoices', 'quotes'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition ${tab === t ? 'bg-white text-navy-800 shadow-sm' : 'text-cloud-600 hover:text-navy-700'}`}>{t}</button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cloud-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Search by number or customer..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<FileText className="w-8 h-8" />} title={query ? 'No documents match your search' : 'No documents yet'} description={query ? 'Try a different search.' : 'Create your first quote or invoice.'} action={!query && <div className="flex gap-2"><Button variant="secondary" onClick={() => setCreating('quote')}><Plus className="w-4 h-4" /> Quote</Button><Button onClick={() => setCreating('invoice')}><Plus className="w-4 h-4" /> Invoice</Button></div>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cloud-50 text-xs text-cloud-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left font-medium px-5 py-2.5">Number</th>
                  <th className="text-left font-medium px-5 py-2.5 hidden sm:table-cell">Customer</th>
                  <th className="text-left font-medium px-5 py-2.5 hidden md:table-cell">Issued</th>
                  <th className="text-left font-medium px-5 py-2.5">Status</th>
                  <th className="text-right font-medium px-5 py-2.5">Total</th>
                  <th className="px-5 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-cloud-50 cursor-pointer" onClick={() => navigate('billing', { doc: d.id })}>
                    <td className="px-5 py-3">
                      <span className="font-medium text-navy-800">{d.number}</span>
                      <Badge color="slate" className="ml-2">{d.type}</Badge>
                    </td>
                    <td className="px-5 py-3 text-cloud-700 hidden sm:table-cell">{customerName(d.customerId)}</td>
                    <td className="px-5 py-3 text-cloud-500 hidden md:table-cell">{formatDate(d.issueDate)}</td>
                    <td className="px-5 py-3"><InvoiceStatusBadge status={d.status} /></td>
                    <td className="px-5 py-3 text-right font-medium text-navy-800">{formatAUD(documentTotal(d))}</td>
                    <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEditing(d)} className="p-1.5 text-cloud-400 hover:text-brand-600 hover:bg-cloud-100 rounded-md"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDelete(d)} className="p-1.5 text-cloud-400 hover:text-danger-600 hover:bg-cloud-100 rounded-md"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!creating} onClose={() => setCreating(null)} title={creating === 'quote' ? 'New quote' : 'New invoice'} size="lg">
        <DocumentForm type={creating || 'invoice'} customers={customers} onSubmit={(data) => { addDocument({ ...data, type: creating || 'invoice' }); setCreating(null); }} onCancel={() => setCreating(null)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.type}`} size="lg">
        {editing && <DocumentForm type={editing.type} initial={editing} customers={customers} onSubmit={(data) => { updateDocument(editing.id, data); setEditing(null); }} onCancel={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={`Delete ${confirmDelete?.number}?`} size="sm"
        footer={<><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (confirmDelete) { deleteDocument(confirmDelete.id); setConfirmDelete(null); } }}>Delete</Button></>}>
        <p className="text-sm text-navy-700">This document will be permanently removed.</p>
      </Modal>
    </div>
  );
}

function DocumentDetail({ doc, onBack, onEdit }: { doc: Document; onBack: () => void; onEdit: () => void }) {
  const { customers, jobs, convertQuoteToInvoice, setDocumentStatus } = useStore();
  const { navigate } = useNav();
  const c = customers.find(x => x.id === doc.customerId);
  const job = jobs.find(j => j.id === doc.jobId);
  const total = documentTotal(doc);
  const sub = doc.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const tax = sub * doc.taxRate;

  const handleConvert = () => {
    const inv = convertQuoteToInvoice(doc.id);
    if (inv) navigate('billing', { doc: inv.id });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-cloud-600 hover:text-navy-700 flex items-center gap-1.5 mb-4"><ArrowLeft className="w-4 h-4" /> Back to billing</button>

      <Card className="mb-4">
        <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge color={doc.type === 'invoice' ? 'blue' : 'navy'}>{doc.type}</Badge>
              <InvoiceStatusBadge status={doc.status} />
            </div>
            <h1 className="text-xl font-semibold text-navy-800">{doc.number}</h1>
            <p className="text-sm text-cloud-500 mt-0.5">Issued {formatDate(doc.issueDate)} · Due {formatDate(doc.dueDate)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onEdit}><Pencil className="w-4 h-4" /> Edit</Button>
            {doc.type === 'quote' && (doc.status === 'sent' || doc.status === 'draft') && (
              <Button onClick={handleConvert}><ArrowRight className="w-4 h-4" /> Convert to invoice</Button>
            )}
            {doc.type === 'invoice' && doc.status !== 'paid' && (
              <Button variant="secondary" onClick={() => setDocumentStatus(doc.id, 'sent')}><Send className="w-4 h-4" /> Mark sent</Button>
            )}
            {doc.type === 'invoice' && doc.status !== 'paid' && (
              <Button variant="success" onClick={() => setDocumentStatus(doc.id, 'paid')}><FileCheck2 className="w-4 h-4" /> Mark paid</Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
          <div>
            <p className="text-xs text-cloud-400 uppercase tracking-wide">{doc.type === 'invoice' ? 'Invoice to' : 'Quote to'}</p>
            <p className="font-semibold text-navy-800 mt-1">{c?.name}</p>
            {c?.company && <p className="text-sm text-cloud-600">{c.company}</p>}
            <p className="text-sm text-cloud-600">{c?.address}, {c?.suburb} {c?.state} {c?.postcode}</p>
            <p className="text-sm text-cloud-600">{c?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-cloud-400 uppercase tracking-wide">{doc.type === 'invoice' ? 'Invoice' : 'Quote'} number</p>
            <p className="font-semibold text-navy-800 mt-1">{doc.number}</p>
            <p className="text-sm text-cloud-600 mt-2">Issue date: <span className="text-navy-700">{formatDate(doc.issueDate)}</span></p>
            <p className="text-sm text-cloud-600">Due date: <span className="text-navy-700">{formatDate(doc.dueDate)}</span></p>
            {job && <p className="text-sm text-cloud-600">Job: <button onClick={() => navigate('schedule', { job: job.id })} className="text-brand-600 hover:underline">{job.title}</button></p>}
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead className="bg-cloud-50 text-xs text-cloud-500 uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-2.5 rounded-l-lg">Description</th>
              <th className="text-right font-medium px-4 py-2.5 w-20">Qty</th>
              <th className="text-right font-medium px-4 py-2.5 w-28">Unit price</th>
              <th className="text-right font-medium px-4 py-2.5 w-28 rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud-100">
            {doc.lineItems.map(li => (
              <tr key={li.id}>
                <td className="px-4 py-3 text-navy-700">{li.description}</td>
                <td className="px-4 py-3 text-right text-cloud-700">{li.quantity}</td>
                <td className="px-4 py-3 text-right text-cloud-700">{formatAUD(li.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-medium text-navy-800">{formatAUD(li.quantity * li.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-cloud-600"><span>Subtotal</span><span>{formatAUD(sub)}</span></div>
            <div className="flex justify-between text-cloud-600"><span>GST (10%)</span><span>{formatAUD(tax)}</span></div>
            <div className="flex justify-between font-semibold text-navy-800 text-base border-t border-cloud-200 pt-2"><span>Total</span><span>{formatAUD(total)}</span></div>
          </div>
        </div>

        {doc.notes && <div className="mt-6 pt-6 border-t border-cloud-200"><p className="text-xs text-cloud-400 uppercase tracking-wide mb-1">Notes</p><p className="text-sm text-cloud-700 whitespace-pre-wrap">{doc.notes}</p></div>}

        {doc.convertedFromId && <p className="mt-4 text-xs text-cloud-500">Converted from a quote.</p>}
      </Card>

      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={() => window.print()}><Download className="w-4 h-4" /> Print / Save PDF</Button>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'green' | 'blue' | 'amber' | 'navy' }) {
  const colors = {
    green: 'bg-success-50 text-success-600',
    blue: 'bg-brand-50 text-brand-600',
    amber: 'bg-warning-50 text-warning-600',
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
