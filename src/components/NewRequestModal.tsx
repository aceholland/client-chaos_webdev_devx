import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { RequestPriority } from '../types';
import { X, Sparkles, Plus, Building2, Calendar, User, Tag } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Create Client Request</h2>
              <p className="text-xs text-slate-400">Add a new task intake for client tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Client Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Client Organization *
              </label>
              <button
                type="button"
                onClick={() => setIsNewClient(!isNewClient)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                {isNewClient ? 'Select Existing Client' : '+ Create New Client'}
              </button>
            </div>

            {isNewClient ? (
              <input
                type="text"
                placeholder="Enter client company name (e.g. Acme Corp)"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                required
              />
            ) : (
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Request Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Fix checkout payment webhook timeout"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe background context, WhatsApp/email notes, or specific requirements..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Grid: Type of Work & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type of Work */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Type of Work *
              </label>
              <select
                value={typeOfWork}
                onChange={e => setTypeOfWork(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {PREDEFINED_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {typeOfWork === 'Custom Tag' && (
                <input
                  type="text"
                  placeholder="Enter custom work category..."
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  className="mt-2 w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                />
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as RequestPriority)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Grid: Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned To */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Assign Responsibility
              </label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Leave Unassigned</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Target Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
