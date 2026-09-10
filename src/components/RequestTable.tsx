import React from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import type { RequestItem, RequestStatus } from '../types';
import { STATUS_CONFIG, PIPELINE_ORDER } from '../lib/statusConfig';
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

  const isOverdue = (req: RequestItem) => {
    if (!req.due_date || req.status === 'done' || req.status === 'waiting_on_client') return false;
    return new Date(req.due_date).getTime() < new Date().setHours(0, 0, 0, 0);
  };

  if (filteredRequests.length === 0) {
    return (
      <div className="border border-[var(--border-color)] p-12 text-center my-6 uppercase tracking-widest text-[var(--text-primary)] bg-transparent">
        <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3 border border-[var(--border-color)]">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold">No requests match your current filters</h3>
        <p className="text-xs mt-1 text-[var(--text-muted)]">Try resetting your search query or quick tab filters.</p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-color)] mb-8 bg-transparent">
      <div className="overflow-x-auto w-full">
        <table className="min-w-[960px] w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] bg-[var(--bg-card)]">
              <th className="py-3 px-3 w-10 border-r border-[var(--border-color)]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="appearance-none border border-[var(--border-color)] w-3.5 h-3.5 checked:bg-[var(--text-primary)] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 border-r border-[var(--border-color)] min-w-[280px]">Title &amp; Client</th>
              <th className="py-3 px-3 border-r border-[var(--border-color)] w-36">Type of Work</th>
              <th className="py-3 px-3 border-r border-[var(--border-color)] w-48">Status Pipeline</th>
              <th className="py-3 px-3 border-r border-[var(--border-color)] w-24">Priority</th>
              <th className="py-3 px-3 border-r border-[var(--border-color)] w-40">Assigned To</th>
              <th className="py-3 px-3 border-r border-[var(--border-color)] w-32">Due Date</th>
              <th className="py-3 px-3 border-r border-[var(--border-color)] w-32 text-right">Last Active</th>
              <th className="py-3 px-3 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="text-xs text-[var(--text-primary)] divide-y divide-[var(--border-color)]">
            {filteredRequests.map(req => {
              const selected = selectedIds.includes(req.id);
              const overdue = isOverdue(req);

              return (
                <tr
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`group cursor-pointer transition-colors ${
                    selected ? 'bg-[var(--text-primary)]/15' : 'hover:bg-[var(--text-primary)]/5'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-3 px-3 border-r border-[var(--border-color)]" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={e => handleToggleOne(req.id, e as any)}
                      className="appearance-none border border-[var(--border-color)] w-3.5 h-3.5 checked:bg-[var(--text-primary)] cursor-pointer"
                    />
                  </td>

                  {/* Title & Client - High Contrast, 100% Opacity */}
                  <td className="py-3 px-3 border-r border-[var(--border-color)]">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase tracking-wider line-clamp-1 text-[var(--text-primary)]">
                          {req.title}
                        </span>
                        {req.is_stale && (
                          <span
                            className="inline-flex items-center gap-1 px-1 py-0.2 border border-[var(--border-color)] text-[8px] font-bold bg-[var(--text-primary)] text-[var(--bg-primary)] shrink-0 animate-pulse-subtle"
                            title="No activity for over 2 days"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" /> STALE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                        {req.client_name}
                      </span>
                    </div>
                  </td>

                  {/* Type of Work */}
                  <td className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap">
                    <span className="px-2 py-0.5 border border-[var(--border-color)] text-[9px] font-bold uppercase tracking-widest inline-block">
                      {req.type_of_work}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <select
                      value={req.status}
                      onChange={e => updateRequestStatus(req.id, e.target.value as RequestStatus)}
                      className={`text-[9px] uppercase tracking-widest px-2 py-1 appearance-none rounded-none focus:outline-none transition cursor-pointer font-bold ${
                        STATUS_CONFIG[req.status]?.badgeClass || 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)]'
                      }`}
                    >
                      {PIPELINE_ORDER.map(st => (
                        <option key={st} value={st} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                          {STATUS_CONFIG[st].label.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border border-[var(--border-color)] text-[var(--text-primary)] inline-block">
                      {req.priority}
                    </span>
                  </td>

                  {/* Assignee Dropdown */}
                  <td className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                      <select
                        value={req.assigned_to || ''}
                        onChange={e => reassignRequest(req.id, e.target.value || null)}
                        className="text-[9px] font-bold uppercase tracking-widest bg-transparent text-[var(--text-primary)] border-b border-[var(--border-color)] focus:outline-none py-0.5 cursor-pointer appearance-none rounded-none"
                      >
                        <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">UNASSIGNED</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap">
                    {req.due_date ? (
                      <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${
                        overdue ? 'border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-primary)] px-1 py-0.5' : 'text-[var(--text-primary)]'
                      }`}>
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{req.due_date}</span>
                        {overdue && <span className="ml-1 text-[8px] bg-red-600 text-white px-0.5">OVERDUE</span>}
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] text-[9px] uppercase tracking-widest">NO DATE</span>
                    )}
                  </td>

                  {/* Last Activity */}
                  <td className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap text-right text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      <span>{formatDistanceToNow(new Date(req.last_activity_at), { addSuffix: true })}</span>
                    </div>
                  </td>

                  {/* Arrow Indicator */}
                  <td className="py-3 px-3 text-[var(--text-primary)] text-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedRequestId(req.id)}
                      className="p-1 border border-transparent hover:border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer"
                      title="Open Request Details"
                      aria-label="Open Request Details"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
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
