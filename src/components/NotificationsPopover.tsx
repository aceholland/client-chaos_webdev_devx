import React from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertTriangle, MessageSquare, UserCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsPopoverProps {
  onClose: () => void;
}

export interface ComputedNotification {
  id: string;
  requestId: string;
  type: 'assigned' | 'stale' | 'comment';
  title: string;
  subtitle: string;
  timestamp: string;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onClose }) => {
  const { requests, comments, setSelectedRequestId } = useRequests();
  const { user } = useAuth();

  if (!user) return null;

  // 1. Assigned to user (last 48h)
  const assignedToMe = requests.filter(r => r.assigned_to === user.id);
  const recentAssigned: ComputedNotification[] = assignedToMe
    .filter(r => {
      const hoursAgo = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
      return hoursAgo <= 48 && r.status !== 'done';
    })
    .map(r => ({
      id: `assigned-${r.id}`,
      requestId: r.id,
      type: 'assigned',
      title: 'ASSIGNED TO YOU',
      subtitle: `${r.title} • ${r.client_name}`,
      timestamp: r.created_at,
    }));

  // 2. Stale / Overdue requests assigned to me
  const staleAssigned: ComputedNotification[] = assignedToMe
    .filter(r => r.is_stale)
    .map(r => ({
      id: `stale-${r.id}`,
      requestId: r.id,
      type: 'stale',
      title: 'STALE TASK (>48H INACTIVE)',
      subtitle: `${r.title} requires review`,
      timestamp: r.last_activity_at,
    }));

  // 3. New comments on requests user is involved in (assigned to user or created by user)
  const myRequestIds = new Set(
    requests.filter(r => r.assigned_to === user.id || r.created_by === user.id).map(r => r.id)
  );

  const recentComments: ComputedNotification[] = comments
    .filter(c => myRequestIds.has(c.request_id) && c.user_id !== user.id)
    .slice(-10)
    .reverse()
    .map(c => {
      const req = requests.find(r => r.id === c.request_id);
      return {
        id: `comment-${c.id}`,
        requestId: c.request_id,
        type: 'comment',
        title: `NEW NOTE BY ${c.user_name || 'TEAM'}`,
        subtitle: `${req?.title || 'Request'}: "${c.content.substring(0, 45)}${c.content.length > 45 ? '...' : ''}"`,
        timestamp: c.created_at,
      };
    });

  // Combine and sort by timestamp
  const allNotifications = [...staleAssigned, ...recentAssigned, ...recentComments].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-primary)] border border-[var(--border-color)] z-50 overflow-hidden text-[var(--text-primary)] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-[var(--text-primary)]" />
          <h3 className="font-bold text-xs uppercase tracking-wider">
            Notifications ({allNotifications.length})
          </h3>
        </div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-color)] p-2">
        {allNotifications.map(n => (
          <div
            key={n.id}
            onClick={() => {
              setSelectedRequestId(n.requestId);
              onClose();
            }}
            className="p-2.5 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] cursor-pointer transition flex items-start gap-2.5 group"
          >
            <div className="p-1 border border-current mt-0.5 shrink-0">
              {n.type === 'stale' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
              {n.type === 'assigned' && <UserCheck className="w-3 h-3" />}
              {n.type === 'comment' && <MessageSquare className="w-3 h-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider">{n.title}</span>
                <span className="text-[8px] opacity-75">
                  {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs font-bold uppercase truncate mt-0.5">
                {n.subtitle}
              </p>
            </div>
          </div>
        ))}

        {allNotifications.length === 0 && (
          <div className="text-center py-6 text-xs text-[var(--text-muted)] uppercase tracking-wider">
            No active notifications
          </div>
        )}
      </div>
    </div>
  );
};
