import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  CheckCircle2,
  Users,
  TrendingUp,
  X,
  User,
  ChevronDown,
  ChevronUp,
  Check,
  Award,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnalyticsModalProps {
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ onClose }) => {
  const { requests, clients } = useRequests();
  const { user, allUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'overview'>('members');
  const [resolutionWindow, setResolutionWindow] = useState<'7' | '30'>('7');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // 1. Personal Work Done (Current Logged-in User)
  const currentUserName = user?.name || '';
  const myRequests = requests.filter(
    r => (user?.id && r.assigned_to === user.id) || (currentUserName && r.assigned_user_name === currentUserName)
  );
  const myDone = myRequests.filter(r => r.status === 'done');
  const myActive = myRequests.filter(r => r.status !== 'done');
  const myRate = myRequests.length > 0 ? Math.round((myDone.length / myRequests.length) * 100) : 0;
  const myDoneLast7Days = myDone.filter(r => {
    const diff = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;
  const myDoneLast30Days = myDone.filter(r => {
    const diff = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;

  // 2. Work Done & Completed by Each Member
  const memberList = (allUsers.length > 0 ? allUsers : []).map(u => {
    const userReqs = requests.filter(
      r => (r.assigned_to && r.assigned_to === u.id) || r.assigned_user_name === u.name
    );
    const doneReqs = userReqs.filter(r => r.status === 'done');
    const inProgressReqs = userReqs.filter(r => r.status === 'in_progress');
    const activeReqs = userReqs.filter(r => r.status !== 'done');
    const rate = userReqs.length > 0 ? Math.round((doneReqs.length / userReqs.length) * 100) : 0;
    const doneLast7D = doneReqs.filter(r => {
      const diff = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isCurrentUser: user?.id === u.id || user?.name === u.name,
      total: userReqs.length,
      done: doneReqs.length,
      inProgress: inProgressReqs.length,
      active: activeReqs.length,
      rate,
      doneLast7D,
      completedList: doneReqs,
    };
  });

  // Sort member list: current user first, then by completed count descending
  memberList.sort((a, b) => {
    if (a.isCurrentUser) return -1;
    if (b.isCurrentUser) return 1;
    return b.done - a.done;
  });

  // Check unassigned completed requests
  const unassignedReqs = requests.filter(r => !r.assigned_user_name || r.assigned_user_name === 'Unassigned');
  const unassignedDone = unassignedReqs.filter(r => r.status === 'done');

  // Max completed for progress bar scaling
  const maxMemberDone = Math.max(...memberList.map(m => m.total), 1);

  // 3. Completion rate by Client
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

  // 4. Avg resolution time trend
  const allDoneRequests = requests.filter(r => r.status === 'done');
  const avgDays = allDoneRequests.length > 0
    ? (allDoneRequests.reduce((acc, r) => {
        const ms = new Date(r.updated_at).getTime() - new Date(r.created_at).getTime();
        return acc + Math.max(0, ms / (1000 * 60 * 60 * 24));
      }, 0) / allDoneRequests.length).toFixed(1)
    : '0';

  const completedLast7Days = allDoneRequests.filter(r => {
    const diff = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const completedLast30Days = allDoneRequests.filter(r => {
    const diff = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;

  // 5. Trend data for SVG Line Graph
  const numDays = resolutionWindow === '7' ? 7 : 30;
  const trendData = Array.from({ length: numDays }).map((_, i) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (numDays - 1 - i));
    const dayStr = targetDate.toISOString().slice(5, 10); // MM-DD

    const count = allDoneRequests.filter(r => {
      const doneDate = new Date(r.updated_at).toISOString().slice(5, 10);
      return doneDate === dayStr;
    }).length;

    return { label: dayStr, count };
  });

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
      <div className="w-full max-w-4xl bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden text-[var(--text-primary)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-[var(--text-primary)]" />
            <div>
              <h2 className="font-bold text-base uppercase tracking-widest">System &amp; Member Analytics</h2>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                PERSONAL WORK DONE • MEMBER PRODUCTIVITY • VELOCITY
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 border border-transparent hover:border-[var(--border-color)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'members'
                ? 'border-[var(--text-primary)] text-[var(--text-primary)] bg-[var(--bg-card)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Member Work &amp; Personal Stats</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-[var(--text-primary)] text-[var(--text-primary)] bg-[var(--bg-card)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Velocity &amp; Client Overview</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-mono">
          {activeTab === 'members' ? (
            <>
              {/* 1. Personal Work Done Section (For Logged-in User) */}
              <div className="border border-[var(--border-color)] p-4 bg-[var(--bg-card)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] block font-bold">
                        LOGGED-IN OPERATOR
                      </span>
                      <h3 className="text-sm font-bold uppercase tracking-wider">
                        {user?.name || 'Anonymous User'} <span className="text-[10px] font-normal opacity-70">({user?.role || 'MEMBER'})</span>
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider px-2 py-1 border border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/5 font-bold">
                    <Award className="w-3 h-3" />
                    <span>YOUR PERSONAL WORK SUMMARY</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 border border-[var(--border-color)] bg-[var(--bg-primary)]">
                    <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      COMPLETED (DONE)
                    </span>
                    <span className="text-2xl font-bold block">{myDone.length}</span>
                    <span className="text-[8px] text-[var(--text-muted)] uppercase mt-0.5 block">
                      Resolved by you
                    </span>
                  </div>
                  <div className="p-3 border border-[var(--border-color)] bg-[var(--bg-primary)]">
                    <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      ACTIVE QUEUE
                    </span>
                    <span className="text-2xl font-bold block">{myActive.length}</span>
                    <span className="text-[8px] text-[var(--text-muted)] uppercase mt-0.5 block">
                      Pending action
                    </span>
                  </div>
                  <div className="p-3 border border-[var(--border-color)] bg-[var(--bg-primary)]">
                    <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      COMPLETION RATE
                    </span>
                    <span className="text-2xl font-bold block">{myRate}%</span>
                    <span className="text-[8px] text-[var(--text-muted)] uppercase mt-0.5 block">
                      {myDone.length} of {myRequests.length} total
                    </span>
                  </div>
                  <div className="p-3 border border-[var(--border-color)] bg-[var(--bg-primary)]">
                    <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      7D TURNAROUND
                    </span>
                    <span className="text-2xl font-bold block">{myDoneLast7Days}</span>
                    <span className="text-[8px] text-[var(--text-muted)] uppercase mt-0.5 block">
                      Finished this week ({myDoneLast30Days} 30D)
                    </span>
                  </div>
                </div>

                {/* Personal Recent Completed Work List */}
                {myDone.length > 0 && (
                  <div className="pt-2 border-t border-[var(--border-color)]">
                    <div className="text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center justify-between text-[var(--text-muted)]">
                      <span>RECENTLY COMPLETED BY YOU</span>
                      <span>{myDone.length} TICKETS</span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {myDone.slice(0, 5).map(r => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2 border border-[var(--border-color)] text-[10px] bg-[var(--bg-primary)]"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-bold truncate">{r.title}</span>
                            <span className="px-1.5 py-0.2 border border-[var(--border-color)] text-[8px] opacity-70 shrink-0">
                              {r.client_name}
                            </span>
                          </div>
                          <span className="text-[8px] text-[var(--text-muted)] shrink-0">
                            {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Completed Work by Each Member Breakdown */}
              <div className="border border-[var(--border-color)] p-4 bg-transparent space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Work Completed by Each Team Member</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                    TOTAL TEAM MEMBERS: {memberList.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {memberList.map(m => {
                    const isExpanded = expandedMemberId === m.id;
                    const donePct = Math.round((m.done / maxMemberDone) * 100);
                    const activePct = Math.round((m.active / maxMemberDone) * 100);

                    return (
                      <div
                        key={m.id}
                        className={`border transition-colors ${
                          m.isCurrentUser
                            ? 'border-amber-500/50 bg-amber-500/5'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                        }`}
                      >
                        <div className="p-3.5 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs uppercase tracking-wider">
                                {m.name}
                              </span>
                              {m.isCurrentUser && (
                                <span className="px-1.5 py-0.2 border border-amber-500 text-amber-700 dark:text-amber-300 text-[8px] font-bold">
                                  YOU
                                </span>
                              )}
                              <span className="text-[9px] text-[var(--text-muted)] uppercase">
                                ({m.role})
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {m.done} DONE
                              </span>
                              <span className="text-[var(--text-muted)]">
                                {m.active} ACTIVE
                              </span>
                              <span className="px-1.5 py-0.5 border border-[var(--border-color)] font-bold">
                                {m.rate}% RATE
                              </span>
                              {m.completedList.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedMemberId(isExpanded ? null : m.id)}
                                  className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer flex items-center gap-1 font-bold"
                                >
                                  <span>{isExpanded ? 'HIDE' : 'VIEW DONE'}</span>
                                  {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Segmented Progress Bar */}
                          <div className="w-full h-3 border border-[var(--border-color)] bg-[var(--bg-primary)] flex overflow-hidden">
                            {/* Done segment */}
                            <div
                              className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                              style={{ width: `${donePct}%` }}
                              title={`${m.name}: ${m.done} completed`}
                            />
                            {/* Active segment */}
                            <div
                              className="h-full bg-[var(--text-primary)] opacity-30 transition-all duration-300"
                              style={{ width: `${activePct}%` }}
                              title={`${m.name}: ${m.active} active`}
                            />
                          </div>

                          <div className="flex justify-between text-[8px] uppercase tracking-wider text-[var(--text-muted)] pt-0.5">
                            <span>{m.total} total assigned • {m.doneLast7D} completed in last 7 days</span>
                            <span>{m.done} of {m.total} completed ({m.rate}%)</span>
                          </div>
                        </div>

                        {/* Expandable list of completed tickets by this member */}
                        {isExpanded && m.completedList.length > 0 && (
                          <div className="border-t border-[var(--border-color)] p-3 bg-[var(--bg-primary)] space-y-1.5">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">
                              WORK COMPLETED BY {m.name}:
                            </span>
                            {m.completedList.map(req => (
                              <div
                                key={req.id}
                                className="flex items-center justify-between p-2 border border-[var(--border-color)] text-[10px] bg-[var(--bg-card)]"
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <span className="font-bold truncate">{req.title}</span>
                                  <span className="px-1.5 py-0.2 border border-[var(--border-color)] text-[8px] opacity-70 shrink-0">
                                    {req.client_name}
                                  </span>
                                  <span className="px-1.5 py-0.2 border border-[var(--border-color)] text-[8px] font-bold shrink-0">
                                    {req.priority.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-[8px] text-[var(--text-muted)] shrink-0">
                                  {formatDistanceToNow(new Date(req.updated_at), { addSuffix: true })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Unassigned completed requests info if any */}
                  {unassignedDone.length > 0 && (
                    <div className="p-3 border border-dashed border-[var(--border-color)] text-[10px] uppercase text-[var(--text-muted)] flex justify-between">
                      <span>Unassigned Completed Requests</span>
                      <span>{unassignedDone.length} Done</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Overview Tab: System Velocity & Client Completion */}
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

              {/* Resolution Velocity Trend Line Chart */}
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

                <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32 overflow-visible">
                    <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                    <line x1={padding} y1={padding + innerHeight / 2} x2={chartWidth - padding} y2={padding + innerHeight / 2} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                    <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="currentColor" strokeOpacity="0.2" />

                    <polygon
                      points={`${points[0].x},${chartHeight - padding} ${polylinePoints} ${points[points.length - 1].x},${chartHeight - padding}`}
                      className="fill-amber-600/10 dark:fill-amber-400/10"
                    />

                    <polyline
                      points={polylinePoints}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {points.map((pt, idx) => (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3"
                          className="fill-[var(--bg-primary)] stroke-current stroke-2 hover:r-4 transition-all"
                        />
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

              {/* Completion Rate By Client */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

