import React from 'react';
import { useRequests } from '../context/RequestContext';
import { RequestItem, RequestPriority, RequestStatus } from '../types';
import { AlertTriangle, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const RequestKanban: React.FC = () => {
  const { filteredRequests, setSelectedRequestId, updateRequestStatus } = useRequests();

  const columns: { id: RequestStatus; title: string; color: string; border: string }[] = [
    { id: 'new', title: 'New Intake', color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 'in_progress', title: 'In Progress', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/30' },
    { id: 'waiting_on_client', title: 'Waiting on Client', color: 'text-purple-400 bg-purple-500/10', border: 'border-purple-500/30' },
    { id: 'done', title: 'Completed', color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/30' },
  ];

  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'low': return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {columns.map(col => {
        const colRequests = filteredRequests.filter(r => r.status === col.id);

        return (
          <div
            key={col.id}
            className="glass-panel rounded-2xl p-3.5 flex flex-col min-h-[500px] border border-slate-800"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 border ${col.border} ${col.color}`}>
              <h3 className="font-semibold text-xs uppercase tracking-wider">{col.title}</h3>
              <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-slate-900/60">
                {colRequests.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {colRequests.map(req => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className="glass-card p-3.5 rounded-xl cursor-pointer group hover:scale-[1.01] transition duration-200 border border-slate-800 hover:border-indigo-500/40 relative"
                >
                  {/* Top Tags */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-900 text-slate-300">
                      {req.client_name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(req.priority)}`}>
                      {req.priority}
                    </span>
                  </div>

                  {/* Request Title */}
                  <h4 className="font-semibold text-xs text-slate-100 group-hover:text-indigo-300 transition line-clamp-2 mb-2">
                    {req.title}
                  </h4>

                  {/* Stale Warning Badge */}
                  {req.is_stale && (
                    <div className="mb-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <AlertTriangle className="w-3 h-3" /> Stale (Inactive &gt; 2 Days)
                    </div>
                  )}

                  {/* Work Type */}
                  <div className="text-[11px] text-slate-400 mb-3">
                    <span className="text-slate-500 font-medium">Type: </span>
                    <span className="text-slate-300 font-semibold">{req.type_of_work}</span>
                  </div>

                  {/* Footer Meta: Assignee & Due Date */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                      <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{req.assigned_user_name || 'Unassigned'}</span>
                    </div>

                    {req.due_date ? (
                      <div className="flex items-center gap-1 text-slate-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{req.due_date.slice(5)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(req.last_activity_at), { addSuffix: false })}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Pipeline Transition Hover Arrow */}
                  <div className="mt-2 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const nextStateMap: Record<RequestStatus, RequestStatus> = {
                          new: 'in_progress',
                          in_progress: 'waiting_on_client',
                          waiting_on_client: 'done',
                          done: 'in_progress',
                        };
                        updateRequestStatus(req.id, nextStateMap[req.status]);
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-0.5 opacity-80 hover:opacity-100 transition"
                      title="Move to next status pipeline step"
                    >
                      <span>Advance</span> <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {colRequests.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500 border-2 border-dashed border-slate-800/60 rounded-xl">
                  No requests in {col.title}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
