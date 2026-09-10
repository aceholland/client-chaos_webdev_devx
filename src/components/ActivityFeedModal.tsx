import React from 'react';
import { useRequests } from '../context/RequestContext';
import { Activity, Clock, X, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedModalProps {
  onClose: () => void;
}

export const ActivityFeedModal: React.FC<ActivityFeedModalProps> = ({ onClose }) => {
  const { activityLogs, requests, setSelectedRequestId } = useRequests();

  // Show last 20 actions
  const recentLogs = activityLogs.slice(0, 20);

  const handleOpenTicket = (requestId: string) => {
    setSelectedRequestId(requestId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden text-[var(--text-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--text-primary)]" />
            <div>
              <h2 className="font-bold text-base uppercase tracking-widest">Global Activity Feed</h2>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">COMPANY-WIDE AUDIT TRAIL (LAST 20)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 border border-transparent hover:border-[var(--border-color)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feed List */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-2 font-mono">
          {recentLogs.map(log => {
            const req = requests.find(r => r.id === log.request_id);
            return (
              <div
                key={log.id}
                onClick={() => handleOpenTicket(log.request_id)}
                className="p-3 border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer flex items-center justify-between gap-4 text-xs group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider opacity-75">
                    <span className="font-bold border border-current px-1 py-0.2">
                      {log.action.replace('_', ' ')}
                    </span>
                    <span className="truncate">{req?.title || log.request_id}</span>
                  </div>
                  <div className="font-bold uppercase tracking-wide text-xs mt-1 truncate">
                    {log.old_value && log.new_value
                      ? `${log.old_value} → ${log.new_value}`
                      : log.new_value || log.old_value || 'System record update'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-right">
                  <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}

          {recentLogs.length === 0 && (
            <div className="text-center py-10 text-xs text-[var(--text-muted)] uppercase tracking-wider border border-dashed border-[var(--border-color)]">
              No recent activity recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
