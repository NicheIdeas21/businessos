import { useState, useMemo } from 'react';
import { Plus, CalendarDays, List, ChevronLeft, ChevronRight, Pencil, Trash2, ArrowLeft, Clock, MapPin, User, FileText } from 'lucide-react';
import { useStore } from '../data/store';
import { useNav } from '../router';
import { Card, Button, Badge, EmptyState, Modal, PageHeader } from '../components/ui';
import { JobForm } from '../components/forms/JobForm';
import { JobStatusBadge, jobStatusOptions } from '../components/status';
import { formatAUD, formatDate, formatDateLong } from '../types';
import type { Job, JobStatus } from '../types';
import { REF_DATE } from '../lib/finance';

export function Schedule() {
  const { jobs, customers, addJob, updateJob, deleteJob, setJobStatus } = useStore();
  const { params, navigate } = useNav();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [month, setMonth] = useState(new Date(REF_DATE.getFullYear(), REF_DATE.getMonth(), 1));
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Job | null>(null);

  const selectedJob = params.job ? jobs.find(j => j.id === params.job) : null;
  const preselectCustomer = params.newJob;

  const customerName = (id: string) => customers.find(c => c.id === id)?.name || '—';

  const monthJobs = useMemo(() => jobs.filter(j => {
    if (!j.date) return false;
    const d = new Date(j.date);
    return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth() && j.status !== 'cancelled';
  }), [jobs, month]);

  const sortedListJobs = useMemo(() => [...jobs].sort((a, b) => (b.date || '').localeCompare(a.date || '')), [jobs]);

  if (selectedJob) {
    return <JobDetail job={selectedJob} onBack={() => navigate('schedule')} onEdit={() => setEditing(selectedJob)} />;
  }

  const calendar = buildCalendar(month);
  const todayIso = REF_DATE.toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle="Manage your bookings and jobs"
        actions={
          <>
            <div className="inline-flex rounded-lg border border-cloud-200 bg-cloud-100 p-0.5">
              <button onClick={() => setView('calendar')} className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 ${view === 'calendar' ? 'bg-white text-navy-800 shadow-sm' : 'text-cloud-600'}`}><CalendarDays className="w-3.5 h-3.5" /> Calendar</button>
              <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-navy-800 shadow-sm' : 'text-cloud-600'}`}><List className="w-3.5 h-3.5" /> List</button>
            </div>
            <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> New booking</Button>
          </>
        }
      />

      {view === 'calendar' ? (
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-200">
            <h2 className="font-semibold text-navy-800">{month.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setMonth(new Date(REF_DATE.getFullYear(), REF_DATE.getMonth(), 1))}>Today</Button>
              <Button size="sm" variant="ghost" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-cloud-200 text-xs font-medium text-cloud-500">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="px-2 py-2 text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {calendar.map((day, i) => {
              const dayJobs = day ? monthJobs.filter(j => j.date === day.iso) : [];
              const isToday = day?.iso === todayIso;
              return (
                <div key={i} className={`min-h-[88px] sm:min-h-[110px] border-b border-r border-cloud-100 p-1.5 ${day ? 'bg-white' : 'bg-cloud-50/50'} ${i % 7 === 6 ? 'border-r-0' : ''}`}>
                  {day && (
                    <>
                      <div className={`text-[11px] font-medium ${isToday ? 'bg-brand-500 text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-cloud-600'}`}>{day.day}</div>
                      <div className="mt-1 space-y-0.5">
                        {dayJobs.slice(0, 3).map(j => (
                          <button key={j.id} onClick={() => navigate('schedule', { job: j.id })} className="block w-full text-left text-[10px] rounded px-1 py-0.5 truncate bg-brand-50 text-brand-700 hover:bg-brand-100">
                            <span className="font-medium">{j.startTime}</span> {j.title}
                          </button>
                        ))}
                        {dayJobs.length > 3 && <div className="text-[10px] text-cloud-500 px-1">+{dayJobs.length - 3} more</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card>
          {sortedListJobs.length === 0 ? <EmptyState icon={<CalendarDays className="w-8 h-8" />} title="No jobs yet" action={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> New booking</Button>} /> : (
            <div className="divide-y divide-cloud-100">
              {sortedListJobs.map(j => (
                <div key={j.id} className="flex items-center gap-3 px-5 py-3 hover:bg-cloud-50">
                  <button onClick={() => navigate('schedule', { job: j.id })} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="text-center shrink-0 w-14">
                      <div className="text-xs text-cloud-500">{j.date ? new Date(j.date).toLocaleDateString('en-AU', { month: 'short' }) : '—'}</div>
                      <div className="text-lg font-semibold text-navy-800 leading-none">{j.date ? new Date(j.date).getDate() : '—'}</div>
                    </div>
                    <div className="w-px h-10 bg-cloud-200" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy-800 truncate">{j.title}</p>
                      <p className="text-xs text-cloud-500 truncate">{customerName(j.customerId)} · {j.startTime} {j.durationHours}h</p>
                    </div>
                  </button>
                  <JobStatusBadge status={j.status} />
                  <span className="text-sm font-medium text-navy-700 w-20 text-right hidden sm:block">{formatAUD(j.price)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(j)} className="p-1.5 text-cloud-400 hover:text-brand-600 hover:bg-cloud-50 rounded-md"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete(j)} className="p-1.5 text-cloud-400 hover:text-danger-600 hover:bg-cloud-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New booking" size="lg">
        <JobForm customers={customers} onSubmit={(data) => { addJob(data); setCreating(false); }} onCancel={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit booking" size="lg">
        {editing && <JobForm initial={editing} customers={customers} onSubmit={(data) => { updateJob(editing.id, data); setEditing(null); }} onCancel={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete booking?" size="sm"
        footer={<><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (confirmDelete) { deleteJob(confirmDelete.id); setConfirmDelete(null); } }}>Delete</Button></>}>
        <p className="text-sm text-navy-700">Delete "{confirmDelete?.title}"? This cannot be undone.</p>
      </Modal>
    </div>
  );
}

function JobDetail({ job, onBack, onEdit }: { job: Job; onBack: () => void; onEdit: () => void }) {
  const { customers, documents, setJobStatus, navigate } = useStore();
  const c = customers.find(x => x.id === job.customerId);
  const linkedDocs = documents.filter(d => d.jobId === job.id);

  return (
    <div>
      <button onClick={onBack} className="text-sm text-cloud-600 hover:text-navy-700 flex items-center gap-1.5 mb-4"><ArrowLeft className="w-4 h-4" /> Back to schedule</button>

      <Card className="mb-4">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2"><JobStatusBadge status={job.status} /><Badge color="slate">{formatAUD(job.price)}</Badge></div>
              <h1 className="text-xl font-semibold text-navy-800">{job.title}</h1>
              <p className="text-sm text-cloud-600 mt-1">{job.description}</p>
            </div>
            <Button variant="secondary" onClick={onEdit}><Pencil className="w-4 h-4" /> Edit</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-cloud-200 border-t border-cloud-200">
          <InfoCell icon={<User className="w-4 h-4" />} label="Customer" value={c?.name || '—'} onClick={() => c && navigate('customers', { id: c.id })} />
          <InfoCell icon={<CalendarDays className="w-4 h-4" />} label="Date" value={job.date ? formatDateLong(job.date) : 'Unscheduled'} />
          <InfoCell icon={<Clock className="w-4 h-4" />} label="Time" value={`${job.startTime} · ${job.durationHours}h`} />
          <InfoCell icon={<MapPin className="w-4 h-4" />} label="Location" value={job.location || '—'} />
        </div>
      </Card>

      <Card className="mb-4 p-5">
        <h3 className="text-sm font-semibold text-navy-800 mb-3">Update status</h3>
        <div className="flex flex-wrap gap-2">
          {jobStatusOptions.map(s => (
            <button key={s} onClick={() => setJobStatus(job.id, s as JobStatus)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${job.status === s ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-cloud-700 border-cloud-200 hover:border-brand-300'}`}>
              {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </Card>

      {job.notes && <Card className="mb-4 p-5"><h3 className="text-sm font-semibold text-navy-800 mb-2">Notes</h3><p className="text-sm text-cloud-700 whitespace-pre-wrap">{job.notes}</p></Card>}

      {linkedDocs.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-cloud-200"><h3 className="font-semibold text-navy-800">Related documents</h3></div>
          <div className="divide-y divide-cloud-100">
            {linkedDocs.map(d => (
              <button key={d.id} onClick={() => navigate('billing', { doc: d.id })} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-cloud-50 text-left">
                <FileText className="w-4 h-4 text-cloud-400" />
                <span className="text-sm font-medium text-navy-800">{d.number}</span>
                <Badge color="slate">{d.type}</Badge>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoCell({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: string; onClick?: () => void }) {
  return (
    <div className="bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-cloud-500">{icon} {label}</div>
      <button onClick={onClick} disabled={!onClick} className={`text-sm font-medium text-navy-800 mt-1 text-left ${onClick ? 'hover:text-brand-600' : 'cursor-default'}`}>{value}</button>
    </div>
  );
}

function buildCalendar(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startPad = (first.getDay() + 6) % 7; // Monday-based
  const cells: ({ day: number; iso: string } | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, iso });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
