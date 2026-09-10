import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import type { RequestPriority } from '../types';
import { X } from 'lucide-react';

interface NewRequestModalProps {
  onClose: () => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({ onClose }) => {
  const { clients, createRequest } = useRequests();
  const { allUsers } = useAuth();

  const [isNewClient, setIsNewClient] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [newClientName, setNewClientName] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeOfWork, setTypeOfWork] = useState('Data Migration');
  const [customType, setCustomType] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('medium');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const PREDEFINED_TYPES = [
    'Data Migration',
    'Bug Fix',
    'Feature Request',
    'UI/UX Design',
    'DevOps',
    'API Integration',
    'Analytics & Reporting',
    'Custom Tag',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Title is required');
      return;
    }

    if (isNewClient && !newClientName.trim()) {
      setErrorMsg('New Client Name is required');
      return;
    }

    if (!isNewClient && !clientId) {
      setErrorMsg('Please select a client');
      return;
    }

    const finalType = typeOfWork === 'Custom Tag' ? (customType.trim() || 'General') : typeOfWork;

    try {
      setSubmitting(true);
      setErrorMsg('');

      await createRequest({
        client_id: isNewClient ? undefined : clientId,
        new_client_name: isNewClient ? newClientName.trim() : undefined,
        title: title.trim(),
        description: description.trim(),
        type_of_work: finalType,
        priority,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div>
            <h2 className="font-bold text-base uppercase tracking-widest text-[var(--text-primary)]">New Client Request</h2>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">INTAKE REGISTRATION</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 border border-transparent hover:border-[var(--border-color)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 border border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 text-xs uppercase tracking-wider font-bold">
              {errorMsg}
            </div>
          )}

          {/* Client Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Client</label>
              <button
                type="button"
                onClick={() => setIsNewClient(!isNewClient)}
                className="text-[10px] uppercase tracking-wider text-[var(--text-primary)] underline cursor-pointer"
              >
                {isNewClient ? 'SELECT EXISTING CLIENT' : '+ CREATE NEW CLIENT'}
              </button>
            </div>

            {isNewClient ? (
              <input
                type="text"
                placeholder="ENTER CLIENT COMPANY NAME..."
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              />
            ) : (
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Request Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Request Title *</label>
            <input
              type="text"
              placeholder="E.G. DATA PIPELINE INTEGRATION ERROR"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Description</label>
            <textarea
              rows={3}
              placeholder="DETAILED SPECS, LOGS, LINKS..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            />
          </div>

          {/* Grid: Type of Work & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Type of Work</label>
              <select
                value={typeOfWork}
                onChange={e => setTypeOfWork(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                {PREDEFINED_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t.toUpperCase()}
                  </option>
                ))}
              </select>
              {typeOfWork === 'Custom Tag' && (
                <input
                  type="text"
                  placeholder="CUSTOM TAG NAME..."
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none mt-1"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as RequestPriority)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="urgent">URGENT</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>
          </div>

          {/* Grid: Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Assign To</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="">UNASSIGNED</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs uppercase tracking-wider hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
