import React from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertTriangle, UserCheck, CheckCircle2, ChevronRight, X } from 'lucide-react';
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

  const totalAlerts = staleAssigned.length + recentAssigned.length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-slate-800 shadow-2xl z-50 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">In-App Notifications</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2">
        {staleAssigned.map(req => (
          <div
            key={`stale-${req.id}`}
            onClick={() => {
              setSelectedRequestId(req.id);
              onClose();
            }}
            className="p-2.5 rounded-xl hover:bg-amber-950/20 cursor-pointer transition flex items-start gap-2.5 group"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-amber-400">Stale Task Alert</span>
                <span className="text-[10px] text-slate-500">
                  {formatDistanceToNow(new Date(req.last_activity_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-300">
                {req.title}
              </p>
              <p className="text-[11px] text-slate-400">No activity for over 48 hours.</p>
            </div>
          </div>
        ))}

        {recentAssigned.map(req => (
          <div
            key={`assigned-${req.id}`}
            onClick={() => {
              setSelectedRequestId(req.id);
              onClose();
            }}
            className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer transition flex items-start gap-2.5 group"
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5 flex-shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-indigo-400">Assigned To You</span>
                <span className="text-[10px] text-slate-500">
                  {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-300">
                {req.title}
              </p>
              <p className="text-[11px] text-slate-400">Client: {req.client_name}</p>
            </div>
          </div>
        ))}

        {totalAlerts === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-400/60" />
            No new task assignments or stale alerts!
          </div>
        )}
      </div>
    </div>
  );
};
