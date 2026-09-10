import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import type { RequestStatus } from '../types';
import { CheckSquare, Trash2, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedIds: string[];
  clearSelection: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedIds,
  clearSelection,
}) => {
  const { bulkUpdateStatus, bulkReassign, bulkDelete } = useRequests();
  const { allUsers, user } = useAuth();

  const [bulkStatus, setBulkStatus] = useState<RequestStatus>('in_progress');
  const [bulkAssignee, setBulkAssignee] = useState<string>('');

  if (selectedIds.length === 0) return null;

  const handleApplyStatus = async () => {
    await bulkUpdateStatus(selectedIds, bulkStatus);
    clearSelection();
  };

  const handleApplyReassign = async () => {
    await bulkReassign(selectedIds, bulkAssignee || null);
    clearSelection();
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} request(s)?`)) {
      await bulkDelete(selectedIds);
      clearSelection();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 flex flex-wrap items-center justify-between gap-3 text-[var(--text-primary)]">
      {/* Selected Counter */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-bold uppercase tracking-widest">
        <CheckSquare className="w-3 h-3" />
        <span>{selectedIds.length} Selected</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Bulk Status Update */}
        <div className="flex items-center gap-1.5 border border-[var(--border-color)] p-1 bg-[var(--bg-card)]">
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value as RequestStatus)}
            className="bg-transparent text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-wider px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="new">Status: New</option>
            <option value="needs_clarification">Status: Clarify</option>
            <option value="ready_to_assign">Status: Ready</option>
            <option value="in_progress">Status: In Prog</option>
            <option value="waiting_on_client">Status: Client</option>
            <option value="done">Status: Done</option>
          </select>
          <button
            onClick={handleApplyStatus}
            className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition cursor-pointer"
          >
            Apply
          </button>
        </div>

        {/* Bulk Reassign */}
        <div className="flex items-center gap-1.5 border border-[var(--border-color)] p-1 bg-[var(--bg-card)]">
          <select
            value={bulkAssignee}
            onChange={e => setBulkAssignee(e.target.value)}
            className="bg-transparent text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-wider px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="">Assignee: Unassigned</option>
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>
                Assign: {u.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleApplyReassign}
            className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition cursor-pointer"
          >
            Assign
          </button>
        </div>

        {/* Admin Bulk Delete */}
        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
            title="Delete Selected Requests"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>

      {/* Close Selection */}
      <button
        onClick={clearSelection}
        className="p-1.5 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        title="Deselect all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
