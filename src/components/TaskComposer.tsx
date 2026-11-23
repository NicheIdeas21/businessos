import { useState } from 'react';
import { Modal, Button } from './ui';
import type { Customer, Task, TaskKind } from '../types';

export function TaskComposer({ open, onClose, onCreate, customers }: {
  open: boolean;
  onClose: () => void;
  onCreate: (t: Omit<Task, 'id' | 'createdAt' | 'status'> & { status?: Task['status'] }) => void;
  customers: Customer[];
}) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<TaskKind>('task');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), kind, dueDate, customerId: customerId || undefined });
    setTitle(''); setKind('task'); setCustomerId(''); setDueDate(new Date().toISOString().slice(0, 10));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New task" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Task</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Call customer about quote" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="input" value={kind} onChange={e => setKind(e.target.value as TaskKind)}>
              <option value="task">Task</option>
              <option value="follow_up">Follow-up</option>
              <option value="invoice_reminder">Invoice reminder</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
          <div>
            <label className="label">Due date</label>
            <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Related customer (optional)</label>
          <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">None</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add task</Button>
        </div>
      </form>
    </Modal>
  );
}
