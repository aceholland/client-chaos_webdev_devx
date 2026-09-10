import React from 'react';
import { useRequests } from '../context/RequestContext';
import type { RequestStatus } from '../types';

export const DashboardStats: React.FC = () => {
  const { stats, setFilters, filters } = useRequests();

  const handleStatusCardClick = (status: RequestStatus | 'all') => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? 'all' : status,
      quickTab: 'all',
    }));
  };

  const handleQuickTabClick = (tab: 'waiting_on_us' | 'waiting_on_client' | 'stale') => {
    setFilters(prev => ({
      ...prev,
      quickTab: prev.quickTab === tab ? 'all' : tab,
      status: 'all',
    }));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-2xl uppercase tracking-widest text-[var(--text-primary)]">Overview</h2>
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">SYSTEM_METRICS</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-[var(--border-color)] bg-transparent">
        {/* 1. Waiting on Us Card */}
        <div 
          onClick={() => handleQuickTabClick('waiting_on_us')}
          className={`border-r border-b border-[var(--border-color)] p-6 cursor-pointer hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors flex flex-col justify-between h-40 ${
            filters.quickTab === 'waiting_on_us' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-transparent text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest">/ WAITING ON US</span>
            <span className="text-[9px] border border-current px-1 py-0.2">ACTIVE</span>
          </div>
          <div className="border-t border-current my-2 opacity-30"></div>
          <div>
            <span className="font-bold text-5xl tracking-tight leading-none block">{stats.waitingOnUsCount}</span>
            <span className="text-[9px] uppercase tracking-wider block mt-1 opacity-70">Requests requiring action</span>
          </div>
        </div>

        {/* 2. Waiting on Client Card */}
        <div 
          onClick={() => handleQuickTabClick('waiting_on_client')}
          className={`border-r border-b border-[var(--border-color)] p-6 cursor-pointer hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors flex flex-col justify-between h-40 ${
            filters.quickTab === 'waiting_on_client' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-transparent text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest">/ WAITING ON CLIENT</span>
            <span className="text-[9px] border border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 px-1 py-0.2">PENDING</span>
          </div>
          <div className="border-t border-current my-2 opacity-30"></div>
          <div>
            <span className="font-bold text-5xl tracking-tight leading-none block">{stats.waitingOnClientCount}</span>
            <span className="text-[9px] uppercase tracking-wider block mt-1 opacity-70">Client info or review needed</span>
          </div>
        </div>

        {/* 3. Overdue / Stale Card */}
        <div 
          onClick={() => handleQuickTabClick('stale')}
          className={`border-r border-b border-[var(--border-color)] p-6 cursor-pointer hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors flex flex-col justify-between h-40 ${
            filters.quickTab === 'stale'
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
              : stats.staleCount > 0
              ? 'bg-transparent text-[var(--text-primary)]'
              : 'bg-transparent text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest">/ OVERDUE / STALE</span>
            <span className="text-[9px] border border-current px-1 py-0.2">&gt;48H INACTIVE</span>
          </div>
          <div className="border-t border-current my-2 opacity-30"></div>
          <div>
            <span className="font-bold text-5xl tracking-tight leading-none block">{stats.staleCount}</span>
            <span className="text-[9px] uppercase tracking-wider block mt-1 opacity-70">Stale tasks needing nudge</span>
          </div>
        </div>

        {/* 4. 6-Stage Pipeline Breakdown */}
        <div className="border-r border-b border-[var(--border-color)] p-4 flex flex-col justify-between h-40 bg-transparent text-[var(--text-primary)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest">/ PIPELINE STAGES</span>
            <span className="text-[9px] opacity-70">TOTAL: {stats.totalOpen}</span>
          </div>
          <div className="border-t border-[var(--border-color)] my-1 opacity-30"></div>
          <div className="grid grid-cols-3 gap-y-2 gap-x-1 w-full text-center">
            <button
              onClick={() => handleStatusCardClick('new')}
              className={`flex flex-col items-center justify-center p-1 border border-[var(--border-color)] transition-colors ${
                filters.status === 'new' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
              }`}
            >
              <span className="font-bold text-base leading-tight">{stats.statusCounts.new}</span>
              <span className="uppercase tracking-widest text-[8px]">New</span>
            </button>
            <button
              onClick={() => handleStatusCardClick('needs_clarification')}
              className={`flex flex-col items-center justify-center p-1 border border-[var(--border-color)] transition-colors ${
                filters.status === 'needs_clarification' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
              }`}
            >
              <span className="font-bold text-base leading-tight">{stats.statusCounts.needs_clarification}</span>
              <span className="uppercase tracking-widest text-[8px]">Clarify</span>
            </button>
            <button
              onClick={() => handleStatusCardClick('ready_to_assign')}
              className={`flex flex-col items-center justify-center p-1 border border-[var(--border-color)] transition-colors ${
                filters.status === 'ready_to_assign' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
              }`}
            >
              <span className="font-bold text-base leading-tight">{stats.statusCounts.ready_to_assign}</span>
              <span className="uppercase tracking-widest text-[8px]">Ready</span>
            </button>
            <button
              onClick={() => handleStatusCardClick('in_progress')}
              className={`flex flex-col items-center justify-center p-1 border border-[var(--border-color)] transition-colors ${
                filters.status === 'in_progress' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
              }`}
            >
              <span className="font-bold text-base leading-tight">{stats.statusCounts.in_progress}</span>
              <span className="uppercase tracking-widest text-[8px]">InProg</span>
            </button>
            <button
              onClick={() => handleStatusCardClick('waiting_on_client')}
              className={`flex flex-col items-center justify-center p-1 border border-[var(--border-color)] transition-colors ${
                filters.status === 'waiting_on_client' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
              }`}
            >
              <span className="font-bold text-base leading-tight">{stats.statusCounts.waiting_on_client}</span>
              <span className="uppercase tracking-widest text-[8px]">Client</span>
            </button>
            <button
              onClick={() => handleStatusCardClick('done')}
              className={`flex flex-col items-center justify-center p-1 border border-[var(--border-color)] transition-colors ${
                filters.status === 'done' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
              }`}
            >
              <span className="font-bold text-base leading-tight">{stats.statusCounts.done}</span>
              <span className="uppercase tracking-widest text-[8px]">Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
