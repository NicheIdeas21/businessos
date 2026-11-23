import { Modal, Button } from './ui';
import { useNav } from '../router';
import { useStore } from '../data/store';
import { UserPlus, CalendarPlus, FilePlus, Target, X } from 'lucide-react';
import { useState } from 'react';
import { CustomerForm } from './forms/CustomerForm';
import { JobForm } from './forms/JobForm';
import { DocumentForm } from './forms/DocumentForm';

export function QuickCreate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = useNav();
  const { addCustomer, addJob, addDocument, customers } = useStore();
  const [view, setView] = useState<'menu' | 'customer' | 'job' | 'invoice' | 'quote'>('menu');

  const close = () => { onClose(); setTimeout(() => setView('menu'), 200); };

  return (
    <Modal
      open={open}
      onClose={close}
      title={view === 'menu' ? 'Quick create' : view === 'customer' ? 'New customer' : view === 'job' ? 'New booking' : view === 'invoice' ? 'New invoice' : 'New quote'}
      size={view === 'menu' ? 'sm' : 'lg'}
    >
      {view === 'menu' && (
        <div className="space-y-2">
          <MenuItem icon={<UserPlus className="w-5 h-5" />} title="Customer" desc="Add a new customer record" onClick={() => setView('customer')} />
          <MenuItem icon={<CalendarPlus className="w-5 h-5" />} title="Booking" desc="Schedule a new job" onClick={() => setView('job')} />
          <MenuItem icon={<FilePlus className="w-5 h-5" />} title="Invoice" desc="Create a new invoice" onClick={() => setView('invoice')} />
          <MenuItem icon={<FilePlus className="w-5 h-5" />} title="Quote" desc="Create a new quote" onClick={() => setView('quote')} />
          <MenuItem icon={<Target className="w-5 h-5" />} title="Browse opportunities" desc="Find new work in the marketplace" onClick={() => { close(); navigate('opportunities'); }} />
        </div>
      )}
      {view === 'customer' && (
        <CustomerForm
          onSubmit={(data) => { addCustomer(data); close(); navigate('customers'); }}
          onCancel={close}
        />
      )}
      {view === 'job' && (
        <JobForm
          customers={customers}
          onSubmit={(data) => { addJob(data); close(); navigate('schedule'); }}
          onCancel={close}
        />
      )}
      {view === 'invoice' && (
        <DocumentForm
          type="invoice"
          customers={customers}
          onSubmit={(data) => { addDocument({ ...data, type: 'invoice' }); close(); navigate('billing'); }}
          onCancel={close}
        />
      )}
      {view === 'quote' && (
        <DocumentForm
          type="quote"
          customers={customers}
          onSubmit={(data) => { addDocument({ ...data, type: 'quote' }); close(); navigate('billing'); }}
          onCancel={close}
        />
      )}
    </Modal>
  );
}

function MenuItem({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-cloud-50 text-left transition border border-transparent hover:border-cloud-200">
      <span className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-navy-800">{title}</span>
        <span className="block text-xs text-cloud-500">{desc}</span>
      </span>
    </button>
  );
}
