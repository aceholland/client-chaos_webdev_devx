import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { AlertTriangle, X } from 'lucide-react';

export const DashboardBanner: React.FC = () => {
  const { stats, setFilters } = useRequests();
  const [dismissed, setDismissed] = useState(false);

  // Shows only if either overdue_count or unassigned_count > 0
  const hasAlert = (stats.staleCount > 0 || stats.unassignedCount > 0);

  if (dismissed || !hasAlert) return null;

  return (
    <div className="border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 mb-6 flex items-center justify-between gap-4 text-xs font-mono uppercase tracking-wider">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse-subtle" />
        <span className="font-bold text-[var(--text-primary)]">
          YOU HAVE {stats.staleCount} OVERDUE AND {stats.unassignedCount} UNASSIGNED REQUESTS.
        </span>
      </div>

      <div className="flex items-center gap-3">
        {stats.staleCount > 0 && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, quickTab: 'stale', status: 'all' }))}
            className="text-[10px] underline font-bold hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
          >
            VIEW OVERDUE
          </button>
        )}
        {stats.unassignedCount > 0 && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, quickTab: 'unassigned', status: 'all' }))}
            className="text-[10px] underline font-bold hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
          >
            VIEW UNASSIGNED
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          title="Dismiss Banner"
          aria-label="Dismiss Banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
