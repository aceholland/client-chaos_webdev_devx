import React from 'react';
import { useRequests } from '../context/RequestContext';
import type { RequestStatus } from '../types';
import { STATUS_CONFIG, PIPELINE_ORDER } from '../lib/statusConfig';
import { AlertTriangle, Calendar, User } from 'lucide-react';

export const RequestKanban: React.FC = () => {
  const { filteredRequests, setSelectedRequestId } = useRequests();

  const columns: { id: RequestStatus; title: string }[] = PIPELINE_ORDER.map(st => ({
    id: st,
    title: `${STATUS_CONFIG[st].stepNumber}. ${STATUS_CONFIG[st].shortLabel}`,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-l border-t border-[var(--border-color)] mb-8 bg-transparent">
      {columns.map(col => {
        const colRequests = filteredRequests.filter(r => r.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col min-h-[500px] border-r border-b border-[var(--border-color)] p-3 ${
              col.id === 'waiting_on_client' ? 'bg-amber-500/5' : 'bg-transparent'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-[10px] uppercase tracking-widest text-[var(--text-primary)] truncate pr-1">
                {col.title}
              </h3>
              <span className="font-bold text-[9px] px-1.5 py-0.2 border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-card)] shrink-0">
                {colRequests.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
              {colRequests.map(req => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`border border-[var(--border-color)] p-3 cursor-pointer group hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors relative flex flex-col ${
                    req.status === 'waiting_on_client' ? 'border-amber-600/70 dark:border-amber-400/70' : 'bg-[var(--bg-card)]'
                  }`}
                >
                  {/* Top Tags */}
                  <div className="flex items-center justify-between mb-2 gap-1">
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1 py-0.2 border border-[var(--border-color)] group-hover:border-[var(--bg-primary)] truncate max-w-[90px]">
                      {req.client_name}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1 py-0.2 border border-[var(--border-color)] group-hover:border-[var(--bg-primary)]">
                      {req.priority}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-xs uppercase tracking-wide line-clamp-2 mb-2 leading-snug">
                    {req.title}
                  </h4>

                  {/* Type of Work */}
                  <div className="mb-2">
                    <span className="text-[8px] uppercase tracking-widest px-1 py-0.2 border border-current opacity-75 inline-block">
                      {req.type_of_work}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-current opacity-20 my-1"></div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider pt-1 opacity-80 group-hover:opacity-100">
                    <div className="flex items-center gap-1 truncate max-w-[100px]">
                      <User className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{req.assigned_user_name || 'UNASSIGNED'}</span>
                    </div>

                    {req.due_date && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{req.due_date.slice(5)}</span>
                      </div>
                    )}
                  </div>

                  {/* Stale Badge */}
                  {req.is_stale && (
                    <div className="mt-2 pt-1 border-t border-current flex items-center justify-between text-[8px] font-bold">
                      <span className="flex items-center gap-1 animate-pulse-subtle">
                        <AlertTriangle className="w-2.5 h-2.5" /> &gt;48H INACTIVE
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {colRequests.length === 0 && (
                <div className="border border-dashed border-[var(--border-color)]/40 p-4 text-center text-[9px] uppercase tracking-wider text-[var(--text-muted)] mt-2">
                  EMPTY
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
