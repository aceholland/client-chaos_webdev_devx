import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { BarChart3, CheckCircle2, Users, TrendingUp, X } from 'lucide-react';

interface AnalyticsModalProps {
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ onClose }) => {
  const { requests, clients } = useRequests();
  const [resolutionWindow, setResolutionWindow] = useState<'7' | '30'>('7');

  // 1. Workload per Assignee
  const assigneeCounts: Record<string, number> = {};
  requests.forEach(r => {
    const name = r.assigned_user_name || 'Unassigned';
    assigneeCounts[name] = (assigneeCounts[name] || 0) + 1;
  });
  const maxAssigneeTickets = Math.max(...Object.values(assigneeCounts), 1);

  // 2. Completion rate by Client
  const clientStats = clients.map(c => {
    const clientReqs = requests.filter(r => r.client_id === c.id);
    const doneCount = clientReqs.filter(r => r.status === 'done').length;
    const rate = clientReqs.length > 0 ? Math.round((doneCount / clientReqs.length) * 100) : 0;
    return {
      name: c.name,
      total: clientReqs.length,
      done: doneCount,
      rate,
    };
  });

  // 3. Avg resolution time trend
  const doneRequests = requests.filter(r => r.status === 'done');
  const avgDays = doneRequests.length > 0
    ? (doneRequests.reduce((acc, r) => {
        const ms = new Date(r.updated_at).getTime() - new Date(r.created_at).getTime();
        return acc + Math.max(0, ms / (1000 * 60 * 60 * 24));
      }, 0) / doneRequests.length).toFixed(1)
    : '0';

  const completedLast7Days = doneRequests.filter(r => {
    const diff = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const completedLast30Days = doneRequests.filter(r => {
    const diff = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;

  // 4. Trend data for SVG Line Graph: Last 7 or 30 days daily resolution volume
  const numDays = resolutionWindow === '7' ? 7 : 30;
  const trendData = Array.from({ length: numDays }).map((_, i) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (numDays - 1 - i));
    const dayStr = targetDate.toISOString().slice(5, 10); // MM-DD

    // Count tickets resolved on this date
    const count = doneRequests.filter(r => {
      const doneDate = new Date(r.updated_at).toISOString().slice(5, 10);
      return doneDate === dayStr;
    }).length;

    return { label: dayStr, count };
  });

  // SVG Line Chart calculations
  const maxTrend = Math.max(...trendData.map(d => d.count), 4);
  const chartWidth = 560;
  const chartHeight = 120;
  const padding = 20;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const points = trendData.map((d, i) => {
    const x = padding + (i / Math.max(trendData.length - 1, 1)) * innerWidth;
    const y = padding + innerHeight - (d.count / maxTrend) * innerHeight;
    return { x, y, ...d };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="w-full max-w-3xl bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden text-[var(--text-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--text-primary)]" />
            <div>
              <h2 className="font-bold text-base uppercase tracking-widest">System Analytics &amp; Reports</h2>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">PERFORMANCE METRICS &amp; TREND GRAPHS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 border border-transparent hover:border-[var(--border-color)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-mono">
          {/* Resolution Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-card)]">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">AVG RESOLUTION</span>
              <span className="text-3xl font-bold block">{avgDays} <span className="text-xs font-normal">DAYS</span></span>
              <span className="text-[8px] text-[var(--text-muted)] uppercase mt-1 block">Across all completed tickets</span>
            </div>
            <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-card)]">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">DONE LAST 7 DAYS</span>
              <span className="text-3xl font-bold block">{completedLast7Days}</span>
              <span className="text-[8px] text-[var(--text-muted)] uppercase mt-1 block">Recent turnaround output</span>
            </div>
            <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-card)]">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">DONE LAST 30 DAYS</span>
              <span className="text-3xl font-bold block">{completedLast30Days}</span>
              <span className="text-[8px] text-[var(--text-muted)] uppercase mt-1 block">Monthly velocity total</span>
            </div>
          </div>

          {/* Graph 1: Resolution Velocity Trend Line Chart */}
          <div className="border border-[var(--border-color)] p-4 bg-transparent space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Resolution Velocity Trend (Tickets / Day)</span>
              </div>
              <div className="flex items-center gap-1 border border-[var(--border-color)] p-0.5">
                <button
                  type="button"
                  onClick={() => setResolutionWindow('7')}
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase cursor-pointer ${
                    resolutionWindow === '7' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'hover:bg-[var(--text-primary)]/10'
                  }`}
                >
                  7D
                </button>
                <button
                  type="button"
                  onClick={() => setResolutionWindow('30')}
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase cursor-pointer ${
                    resolutionWindow === '30' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'hover:bg-[var(--text-primary)]/10'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32 overflow-visible">
                {/* Horizontal Grid Lines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                <line x1={padding} y1={padding + innerHeight / 2} x2={chartWidth - padding} y2={padding + innerHeight / 2} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="currentColor" strokeOpacity="0.2" />

                {/* Shaded Area Under Line */}
                <polygon
                  points={`${points[0].x},${chartHeight - padding} ${polylinePoints} ${points[points.length - 1].x},${chartHeight - padding}`}
                  className="fill-amber-600/10 dark:fill-amber-400/10"
                />

                {/* Trend Polyline */}
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      className="fill-[var(--bg-primary)] stroke-current stroke-2 hover:r-4 transition-all"
                    />
                    {/* Value badge on non-zero or periodic labels */}
                    {(pt.count > 0 || idx % Math.ceil(points.length / 5) === 0) && (
                      <text
                        x={pt.x}
                        y={chartHeight - 4}
                        textAnchor="middle"
                        fontSize="8"
                        className="fill-[var(--text-muted)] font-mono select-none"
                      >
                        {pt.label}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Graph 2: Requests Per Assignee Bar Graph */}
          <div className="border border-[var(--border-color)] p-4 bg-transparent space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Workload per Assignee (Tickets)</span>
            </div>
            <div className="space-y-2 pt-2">
              {Object.entries(assigneeCounts).map(([name, count]) => {
                const pct = Math.round((count / maxAssigneeTickets) * 100);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider">
                      <span className="font-bold">{name}</span>
                      <span>{count} tickets</span>
                    </div>
                    <div className="w-full h-3 border border-[var(--border-color)] bg-[var(--bg-card)]">
                      <div
                        className="h-full bg-[var(--text-primary)] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph 3: Completion Rate By Client */}
          <div className="border border-[var(--border-color)] p-4 bg-transparent space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completion Rate by Client (%)</span>
            </div>
            <div className="space-y-2 pt-2">
              {clientStats.map(cs => (
                <div key={cs.name} className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider">
                    <span className="font-bold">{cs.name}</span>
                    <span>{cs.rate}% ({cs.done}/{cs.total} done)</span>
                  </div>
                  <div className="w-full h-3 border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div
                      className="h-full bg-amber-600 dark:bg-amber-400 transition-all duration-300"
                      style={{ width: `${cs.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
