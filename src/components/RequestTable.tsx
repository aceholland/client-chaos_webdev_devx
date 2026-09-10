import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import type { RequestItem, RequestPriority, RequestStatus } from '../types';
import { STATUS_CONFIG, PIPELINE_ORDER } from '../lib/statusConfig';
import {
  AlertTriangle,
  Clock,
  User,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Download,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestTableProps {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

type EditableField = 'title' | 'priority' | 'due_date' | 'type_of_work';

export const RequestTable: React.FC<RequestTableProps> = ({
  selectedIds,
  setSelectedIds,
}) => {
  const {
    filteredRequests,
    setSelectedRequestId,
    updateRequestStatus,
    reassignRequest,
    updateRequestDetails,
    filters,
    setFilters,
  } = useRequests();
  const { allUsers } = useAuth();

  // Inline edit state: { requestId, field, tempValue }
  const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField; value: string } | null>(null);

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

  // Header click sorting
  const handleSortColumn = (col: 'created_at' | 'due_date' | 'priority' | 'last_activity_at') => {
    if (filters.sortBy === col) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        sortBy: col,
        sortOrder: 'desc',
      }));
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRequests.length === 0) return;
    const headers = ['ID', 'Title', 'Client', 'Type of Work', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Last Active'];
    const rows = filteredRequests.map(r => [
      `"${r.id}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${(r.client_name || '').replace(/"/g, '""')}"`,
      `"${r.type_of_work.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.priority}"`,
      `"${(r.assigned_user_name || 'Unassigned').replace(/"/g, '""')}"`,
      `"${r.due_date || ''}"`,
      `"${r.last_activity_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lala_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save inline edits
  const handleSaveInline = async () => {
    if (!editingCell) return;
    const { id, field, value } = editingCell;
    setEditingCell(null);

    if (field === 'title') {
      if (value.trim()) await updateRequestDetails(id, { title: value.trim() });
    } else if (field === 'priority') {
      await updateRequestDetails(id, { priority: value as RequestPriority });
    } else if (field === 'due_date') {
      await updateRequestDetails(id, { due_date: value || null });
    } else if (field === 'type_of_work') {
      if (value.trim()) await updateRequestDetails(id, { type_of_work: value.trim() });
    }
  };

  const handleKeyDownInline = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveInline();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="space-y-2 mb-8">
      {/* Top Table Utility Bar (CSV Export & Inline Edit hint) */}
      <div className="flex items-center justify-between px-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        <span className="opacity-80 hidden sm:inline">
          Double-click cells (Title, Type, Priority, Due Date) to quick-edit like a spreadsheet
        </span>
        <div className="ml-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer font-bold"
            title="Export filtered requests to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="border border-[var(--border-color)] p-12 text-center my-4 uppercase tracking-widest text-[var(--text-primary)] bg-transparent">
          <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3 border border-[var(--border-color)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold">No requests match your current filters</h3>
          <p className="text-xs mt-1 text-[var(--text-muted)]">Try resetting your search query or quick tab filters.</p>
        </div>
      ) : (
        <div className="border border-[var(--border-color)] bg-transparent">
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
                  <th className="py-3 px-3 border-r border-[var(--border-color)] min-w-[280px]">
                    Title &amp; Client
                  </th>
                  <th className="py-3 px-3 border-r border-[var(--border-color)] w-36">
                    Type of Work
                  </th>
                  <th className="py-3 px-3 border-r border-[var(--border-color)] w-48">
                    Status Pipeline
                  </th>
                  <th 
                    onClick={() => handleSortColumn('priority')}
                    className="py-3 px-3 border-r border-[var(--border-color)] w-28 cursor-pointer hover:bg-[var(--text-primary)]/10 select-none"
                    title="Click to sort by Priority"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3 px-3 border-r border-[var(--border-color)] w-40">
                    Assigned To
                  </th>
                  <th 
                    onClick={() => handleSortColumn('due_date')}
                    className="py-3 px-3 border-r border-[var(--border-color)] w-36 cursor-pointer hover:bg-[var(--text-primary)]/10 select-none"
                    title="Click to sort by Due Date"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>Due Date</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSortColumn('last_activity_at')}
                    className="py-3 px-3 border-r border-[var(--border-color)] w-32 text-right cursor-pointer hover:bg-[var(--text-primary)]/10 select-none"
                    title="Click to sort by Last Active"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Last Active</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
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

                  {/* Title & Client - High Contrast, Double-Click to Inline Edit */}
                  <td 
                    className="py-3 px-3 border-r border-[var(--border-color)]"
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setEditingCell({ id: req.id, field: 'title', value: req.title });
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {editingCell?.id === req.id && editingCell?.field === 'title' ? (
                          <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              autoFocus
                              value={editingCell.value}
                              onChange={e => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                              onBlur={handleSaveInline}
                              onKeyDown={handleKeyDownInline}
                              className="bg-[var(--bg-primary)] border border-[var(--border-color)] px-1.5 py-0.5 text-xs uppercase font-bold text-[var(--text-primary)] w-full outline-none"
                            />
                            <button onClick={handleSaveInline} className="p-0.5 border border-[var(--border-color)] cursor-pointer">
                              <Check className="w-3 h-3 text-emerald-500" />
                            </button>
                          </div>
                        ) : (
                          <span 
                            className="font-bold text-xs uppercase tracking-wider line-clamp-1 text-[var(--text-primary)] hover:underline"
                            title="Double-click to inline edit"
                          >
                            {req.title}
                          </span>
                        )}

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

                  {/* Type of Work - Double-Click to Inline Edit */}
                  <td 
                    className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap"
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setEditingCell({ id: req.id, field: 'type_of_work', value: req.type_of_work });
                    }}
                  >
                    {editingCell?.id === req.id && editingCell?.field === 'type_of_work' ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          autoFocus
                          value={editingCell.value}
                          onChange={e => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                          onBlur={handleSaveInline}
                          onKeyDown={handleKeyDownInline}
                          className="bg-[var(--bg-primary)] border border-[var(--border-color)] px-1.5 py-0.5 text-[9px] uppercase font-bold text-[var(--text-primary)] w-28 outline-none"
                        />
                      </div>
                    ) : (
                      <span 
                        className="px-2 py-0.5 border border-[var(--border-color)] text-[9px] font-bold uppercase tracking-widest inline-block hover:border-dashed cursor-pointer"
                        title="Double click to edit type"
                      >
                        {req.type_of_work}
                      </span>
                    )}
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

                  {/* Priority Badge - Double Click to Quick Change */}
                  <td 
                    className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap"
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setEditingCell({ id: req.id, field: 'priority', value: req.priority });
                    }}
                  >
                    {editingCell?.id === req.id && editingCell?.field === 'priority' ? (
                      <select
                        autoFocus
                        value={editingCell.value}
                        onChange={e => {
                          setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null);
                          updateRequestDetails(req.id, { priority: e.target.value as RequestPriority });
                          setEditingCell(null);
                        }}
                        onBlur={() => setEditingCell(null)}
                        className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[9px] font-bold uppercase px-1 py-0.5 outline-none"
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="urgent">URGENT</option>
                        <option value="high">HIGH</option>
                        <option value="medium">MEDIUM</option>
                        <option value="low">LOW</option>
                      </select>
                    ) : (
                      <span 
                        className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border border-[var(--border-color)] text-[var(--text-primary)] inline-block hover:border-dashed cursor-pointer"
                        title="Double-click to change priority"
                      >
                        {req.priority}
                      </span>
                    )}
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
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Due Date - Double click to inline edit */}
                  <td 
                    className="py-3 px-3 border-r border-[var(--border-color)] whitespace-nowrap"
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setEditingCell({ id: req.id, field: 'due_date', value: req.due_date || '' });
                    }}
                  >
                    {editingCell?.id === req.id && editingCell?.field === 'due_date' ? (
                      <input
                        type="date"
                        autoFocus
                        value={editingCell.value}
                        onChange={e => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                        onBlur={handleSaveInline}
                        onKeyDown={handleKeyDownInline}
                        onClick={e => e.stopPropagation()}
                        className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[9px] uppercase px-1 py-0.5 text-[var(--text-primary)] outline-none"
                      />
                    ) : req.due_date ? (
                      <div 
                        className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest cursor-pointer ${
                          overdue ? 'border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-primary)] px-1 py-0.5' : 'text-[var(--text-primary)]'
                        }`}
                        title="Double-click to change due date"
                      >
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{req.due_date}</span>
                        {overdue && <span className="ml-1 text-[8px] bg-red-600 text-white px-0.5">OVERDUE</span>}
                      </div>
                    ) : (
                      <span 
                        className="text-[var(--text-muted)] text-[9px] uppercase tracking-widest hover:border-b border-dashed border-[var(--border-color)] cursor-pointer"
                        title="Double-click to set due date"
                      >
                        NO DATE
                      </span>
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
    )}
  </div>
  );
};
