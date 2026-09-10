import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { RequestPriority, RequestStatus } from '../types';
import { CheckSquare, User, Trash2, X, ArrowRight, ShieldAlert } from 'lucide-react';

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl glass-panel rounded-2xl p-3 border border-indigo-500/40 shadow-2xl animate-bounce-subtle flex flex-wrap items-center justify-between gap-3">
      {/* Selected Counter */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
        <CheckSquare className="w-4 h-4 text-indigo-400" />
        <span>{selectedIds.length} Selected</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Bulk Status Update */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value as RequestStatus)}
            className="bg-transparent text-slate-200 px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="new" className="bg-slate-900">Status: New</option>
            <option value="in_progress" className="bg-slate-900">Status: In Progress</option>
            <option value="waiting_on_client" className="bg-slate-900">Status: Waiting</option>
            <option value="done" className="bg-slate-900">Status: Done</option>
          </select>
          <button
            onClick={handleApplyStatus}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-[11px]"
          >
            Set Status
          </button>
        </div>

        {/* Bulk Reassign */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <select
            value={bulkAssignee}
            onChange={e => setBulkAssignee(e.target.value)}
            className="bg-transparent text-slate-200 px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900">Unassigned</option>
            {allUsers.map(u => (
              <option key={u.id} value={u.id} className="bg-slate-900">
                {u.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleApplyReassign}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-[11px]"
          >
            Reassign
          </button>
        </div>

        {/* Bulk Delete for Admin */}
        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-semibold transition"
            title="Admin Bulk Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>

      {/* Clear Button */}
      <button
        onClick={clearSelection}
        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        title="Clear Selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
