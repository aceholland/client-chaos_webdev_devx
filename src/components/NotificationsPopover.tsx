import React from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsPopoverProps {
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onClose }) => {
  const { requests, setSelectedRequestId } = useRequests();
  const { user } = useAuth();

  if (!user) return null;

  // Filter notifications for current user
  const assignedToMe = requests.filter(r => r.assigned_to === user.id);
  const staleAssigned = assignedToMe.filter(r => r.is_stale);
  const recentAssigned = assignedToMe.filter(r => {
    const hoursAgo = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
    return hoursAgo <= 48 && r.status !== 'done';
  });

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-primary)] border border-[var(--border-color)] z-50 overflow-hidden text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-[var(--text-primary)]" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Notifications</h3>
        </div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-color)] p-2">
        {staleAssigned.map(req => (
          <div
            key={`stale-${req.id}`}
            onClick={() => {
              setSelectedRequestId(req.id);
              onClose();
            }}
            className="p-2.5 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] cursor-pointer transition flex items-start gap-2.5 group"
          >
            <div className="p-1 border border-current mt-0.5 shrink-0">
              <AlertTriangle className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider">STALE TASK (&gt;48H)</span>
                <span className="text-[8px] opacity-75">
                  {formatDistanceToNow(new Date(req.last_activity_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs font-bold uppercase truncate">
                {req.title}
              </p>
              <p className="text-[9px] uppercase tracking-wider opacity-75">Requires internal update or review.</p>
            </div>
          </div>
        ))}

        {recentAssigned.map(req => (
          <div
            key={`recent-${req.id}`}
            onClick={() => {
              setSelectedRequestId(req.id);
              onClose();
            }}
            className="p-2.5 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] cursor-pointer transition flex items-start gap-2.5 group"
          >
            <div className="p-1 border border-current mt-0.5 shrink-0">
              <Bell className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider">ASSIGNED TO YOU</span>
                <span className="text-[8px] opacity-75">
                  {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs font-bold uppercase truncate">
                {req.title}
              </p>
              <p className="text-[9px] uppercase tracking-wider opacity-75">{req.client_name} • {req.priority}</p>
            </div>
          </div>
        ))}

        {staleAssigned.length === 0 && recentAssigned.length === 0 && (
          <div className="text-center py-6 text-xs text-[var(--text-muted)] uppercase tracking-wider">
            No active notifications
          </div>
        )}
      </div>
    </div>
  );
};
