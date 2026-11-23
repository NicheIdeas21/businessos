import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, Phone, Mail, MapPin, ArrowLeft, FileText, Wrench, Tag } from 'lucide-react';
import { useStore, documentTotal } from '../data/store';
import { useNav } from '../router';
import { Card, Button, Badge, EmptyState, Modal, PageHeader } from '../components/ui';
import { CustomerForm } from '../components/forms/CustomerForm';
import { InvoiceStatusBadge } from '../components/status';
import { formatAUD, formatDate, timeAgo } from '../types';
import type { Customer } from '../types';

export function Customers() {
  const { customers, documents, jobs, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const { params, navigate } = useNav();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);

  const selectedId = params.id;
  const selected = customers.find(c => c.id === selectedId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.suburb.toLowerCase().includes(q)
    );
  }, [customers, query]);

  if (selected) {
    return <CustomerDetail customer={selected} onBack={() => navigate('customers')} onEdit={() => setEditing(selected)} />;
  }

  const customerStats = (c: Customer) => {
    const cDocs = documents.filter(d => d.customerId === c.id && d.type === 'invoice');
    const cJobs = jobs.filter(j => j.customerId === c.id);
    const spent = cDocs.filter(d => d.status === 'paid').reduce((s, d) => s + documentTotal(d), 0);
    return { invoices: cDocs.length, jobs: cJobs.length, spent };
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customer${customers.length === 1 ? '' : 's'} in your records`}
        actions={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Add customer</Button>}
      />

      <Card className="mb-4">
        <div className="p-3">
          <div className="relative">
            <Search className="w-4 h-4 text-cloud-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Search by name, company, email, phone or suburb..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Search className="w-8 h-8" />} title={query ? 'No customers match your search' : 'No customers yet'} description={query ? 'Try a different search term.' : 'Add your first customer to get started.'} action={!query && <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Add customer</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => {
            const s = customerStats(c);
            return (
              <Card key={c.id} hover className="p-4 cursor-pointer" >
                <div onClick={() => navigate('customers', { id: c.id })}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-navy-800 truncate">{c.name}</p>
                      {c.company && <p className="text-xs text-cloud-500 truncate">{c.company}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setEditing(c); }} className="p-1.5 text-cloud-400 hover:text-brand-600 hover:bg-cloud-50 rounded-md"><Pencil className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(c); }} className="p-1.5 text-cloud-400 hover:text-danger-600 hover:bg-cloud-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-cloud-600">
                    <div className="flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 shrink-0" /> {c.email}</div>
                    <div className="flex items-center gap-2 truncate"><Phone className="w-3.5 h-3.5 shrink-0" /> {c.phone}</div>
                    <div className="flex items-center gap-2 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" /> {c.suburb} {c.state} {c.postcode}</div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-cloud-100 text-xs">
                    <span className="text-cloud-500">{s.jobs} jobs</span>
                    <span className="text-cloud-500">{s.invoices} invoices</span>
                    <span className="ml-auto font-semibold text-navy-700">{formatAUD(s.spent)}</span>
                  </div>
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.tags.map(t => <Badge key={t} color="blue"><Tag className="w-2.5 h-2.5" /> {t}</Badge>)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New customer" size="lg">
        <CustomerForm onSubmit={(data) => { addCustomer(data); setCreating(false); }} onCancel={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit customer" size="lg">
        {editing && <CustomerForm initial={editing} onSubmit={(data) => { updateCustomer(editing.id, data); setEditing(null); }} onCancel={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete customer?" size="sm"
        footer={<><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (confirmDelete) { deleteCustomer(confirmDelete.id); setConfirmDelete(null); } }}>Delete</Button></>}
      >
        <p className="text-sm text-navy-700">This will permanently remove {confirmDelete?.name} and their related jobs, invoices and tasks. This cannot be undone.</p>
      </Modal>
    </div>
  );
}

function CustomerDetail({ customer, onBack, onEdit }: { customer: Customer; onBack: () => void; onEdit: () => void }) {
  const { documents, jobs, tasks } = useStore();
  const { navigate } = useNav();
  const cDocs = documents.filter(d => d.customerId === customer.id);
  const cJobs = jobs.filter(j => j.customerId === customer.id);
  const cTasks = tasks.filter(t => t.customerId === customer.id);
  const spent = cDocs.filter(d => d.status === 'paid').reduce((s, d) => s + documentTotal(d), 0);
  const outstanding = cDocs.filter(d => d.status === 'sent' || d.status === 'overdue').reduce((s, d) => s + documentTotal(d), 0);

  return (
    <div>
      <button onClick={onBack} className="text-sm text-cloud-600 hover:text-navy-700 flex items-center gap-1.5 mb-4"><ArrowLeft className="w-4 h-4" /> Back to customers</button>

      <Card className="mb-4">
        <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-lg font-semibold shrink-0">
            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-navy-800">{customer.name}</h1>
            {customer.company && <p className="text-sm text-cloud-500">{customer.company}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm">
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-cloud-700 hover:text-brand-600 truncate"><Mail className="w-4 h-4 shrink-0" /> {customer.email}</a>
              <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-cloud-700 hover:text-brand-600 truncate"><Phone className="w-4 h-4 shrink-0" /> {customer.phone}</a>
              <div className="flex items-center gap-2 text-cloud-700 truncate"><MapPin className="w-4 h-4 shrink-0" /> {customer.address}, {customer.suburb} {customer.state} {customer.postcode}</div>
            </div>
            {customer.tags && customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">{customer.tags.map(t => <Badge key={t} color="blue"><Tag className="w-2.5 h-2.5" /> {t}</Badge>)}</div>
            )}
          </div>
          <Button variant="secondary" onClick={onEdit}><Pencil className="w-4 h-4" /> Edit</Button>
        </div>
        <div className="grid grid-cols-3 gap-px bg-cloud-200 border-t border-cloud-200">
          <Stat label="Total spent" value={formatAUD(spent)} />
          <Stat label="Outstanding" value={formatAUD(outstanding)} />
          <Stat label="Customer since" value={formatDate(customer.createdAt)} />
        </div>
      </Card>

      {customer.notes && (
        <Card className="mb-4 p-5">
          <h3 className="text-sm font-semibold text-navy-800 mb-2">Notes</h3>
          <p className="text-sm text-cloud-700 whitespace-pre-wrap">{customer.notes}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-5 py-4 border-b border-cloud-200 flex items-center justify-between">
            <h3 className="font-semibold text-navy-800">Jobs</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('schedule', { newJob: customer.id })}>Add job</Button>
          </div>
          {cJobs.length === 0 ? <EmptyState title="No jobs yet" /> : (
            <div className="divide-y divide-cloud-100">
              {cJobs.map(j => (
                <button key={j.id} onClick={() => navigate('schedule', { job: j.id })} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-cloud-50 text-left">
                  <Wrench className="w-4 h-4 text-cloud-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-800 truncate">{j.title}</p>
                    <p className="text-xs text-cloud-500">{j.date || 'Unscheduled'}</p>
                  </div>
                  <span className="text-sm font-medium text-navy-700">{formatAUD(j.price)}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <div className="px-5 py-4 border-b border-cloud-200 flex items-center justify-between">
            <h3 className="font-semibold text-navy-800">Invoices & quotes</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('billing', { newDoc: customer.id })}>Add</Button>
          </div>
          {cDocs.length === 0 ? <EmptyState title="No invoices or quotes" /> : (
            <div className="divide-y divide-cloud-100">
              {cDocs.map(d => (
                <button key={d.id} onClick={() => navigate('billing', { doc: d.id })} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-cloud-50 text-left">
                  <FileText className="w-4 h-4 text-cloud-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-800">{d.number} <span className="text-cloud-400 font-normal">· {d.type}</span></p>
                    <p className="text-xs text-cloud-500">{formatDate(d.issueDate)}</p>
                  </div>
                  <InvoiceStatusBadge status={d.status} />
                  <span className="text-sm font-medium text-navy-700 w-20 text-right">{formatAUD(documentTotal(d))}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {cTasks.length > 0 && (
        <Card className="mt-4">
          <div className="px-5 py-4 border-b border-cloud-200"><h3 className="font-semibold text-navy-800">Tasks</h3></div>
          <div className="divide-y divide-cloud-100">
            {cTasks.map(t => (
              <div key={t.id} className="px-5 py-2.5 flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-success-500' : 'bg-warning-500'}`} />
                <span className={`text-sm ${t.status === 'completed' ? 'line-through text-cloud-400' : 'text-navy-700'}`}>{t.title}</span>
                <span className="ml-auto text-xs text-cloud-500">due {t.dueDate}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-4 text-center"><p className="text-xs text-cloud-500">{label}</p><p className="text-sm font-semibold text-navy-800 mt-0.5">{value}</p></div>;
}
