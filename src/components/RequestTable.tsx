import React from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { RequestItem, RequestPriority, RequestStatus } from '../types';
import {
  AlertTriangle,
  Clock,
  User,
  Calendar,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestTableProps {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const RequestTable: React.FC<RequestTableProps> = ({
  selectedIds,
  setSelectedIds,
}) => {
  const {
    filteredRequests,
    setSelectedRequestId,
    updateRequestStatus,
    reassignRequest,
  } = useRequests();
  const { allUsers } = useAuth();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRequests.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredRequests.length > 0 && selectedIds.length === filteredRequests.length;

  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'medium':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'low':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'waiting_on_client':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'done':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const isOverdue = (req: RequestItem) => {
    if (!req.due_date || req.status === 'done') return false;
    return new Date(req.due_date).getTime() < new Date().setHours(0,0,0,0);
  };

  if (filteredRequests.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center my-6">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No requests match your current filters</h3>
        <p className="text-xs text-slate-400 mt-1">Try resetting your search query or quick tab filters.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20"
                />
              </th>
              <th className="py-3.5 px-4">Title &amp; Client</th>
              <th className="py-3.5 px-4">Type of Work</th>
              <th className="py-3.5 px-4">Status Pipeline</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Assigned To</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Last Active</th>
              <th className="py-3.5 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredRequests.map(req => {
              const selected = selectedIds.includes(req.id);
              const overdue = isOverdue(req);

              return (
                <tr
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`group cursor-pointer transition-colors duration-150 ${
                    selected ? 'bg-indigo-950/20' : 'hover:bg-slate-900/50'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={e => handleToggleOne(req.id, e as any)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20"
                    />
                  </td>

                  {/* Title & Client */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition truncate">
                          {req.title}
                        </span>
                        {req.is_stale && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse-subtle"
                            title="No activity for over 2 days!"
                          >
                            <AlertTriangle className="w-3 h-3" /> Stale
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {req.client_name}
                      </span>
                    </div>
                  </td>

                  {/* Type of Work */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 text-[11px] font-medium">
                      {req.type_of_work}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <select
                      value={req.status}
                      onChange={e => updateRequestStatus(req.id, e.target.value as RequestStatus)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none transition cursor-pointer ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      <option value="new" className="bg-slate-900 text-blue-400">New</option>
                      <option value="in_progress" className="bg-slate-900 text-amber-400">In Progress</option>
                      <option value="waiting_on_client" className="bg-slate-900 text-purple-400">Waiting on Client</option>
                      <option value="done" className="bg-slate-900 text-emerald-400">Done</option>
                    </select>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(req.priority)}`}>
                      {req.priority}
                    </span>
                  </td>

                  {/* Assignee Dropdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={req.assigned_to || ''}
                        onChange={e => reassignRequest(req.id, e.target.value || null)}
                        className="text-xs bg-transparent text-slate-300 border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none py-0.5 cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">Unassigned</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {req.due_date ? (
                      <div className={`flex items-center gap-1 text-[11px] font-medium ${
                        overdue ? 'text-red-400 font-bold' : 'text-slate-300'
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{req.due_date}</span>
                        {overdue && <span className="text-[10px] bg-red-500/20 text-red-300 px-1 py-0.5 rounded">Overdue</span>}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">No due date</span>
                    )}
                  </td>

                  {/* Last Activity */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right text-slate-400 text-[11px]">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{formatDistanceToNow(new Date(req.last_activity_at), { addSuffix: true })}</span>
                    </div>
                  </td>

                  {/* Arrow Indicator */}
                  <td className="py-3.5 px-4 text-slate-500 group-hover:text-slate-200 transition">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
