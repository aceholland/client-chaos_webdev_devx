import React from 'react';
import { useRequests } from '../context/RequestContext';
import { Clock, AlertTriangle, CheckCircle2, ListTodo, ArrowUpRight } from 'lucide-react';
import { RequestStatus } from '../types';

export const DashboardStats: React.FC = () => {
  const { stats, setFilters, filters } = useRequests();

  const handleStatusCardClick = (status: RequestStatus | 'all') => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? 'all' : status,
      quickTab: 'all',
    }));
  };

  const handleStaleClick = () => {
    setFilters(prev => ({
      ...prev,
      quickTab: prev.quickTab === 'stale' ? 'all' : 'stale',
      status: 'all',
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Open Requests Card */}
      <div 
        onClick={() => handleStatusCardClick('all')}
        className="glass-card p-4 rounded-xl cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Open</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
            <ListTodo className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-white tracking-tight">{stats.totalOpen}</span>
          <span className="text-xs text-indigo-400 font-medium flex items-center">
            Active Requests <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* 2. Overdue / Stale Card */}
      <div 
        onClick={handleStaleClick}
        className={`glass-card p-4 rounded-xl cursor-pointer group flex flex-col justify-between border-l-4 ${
          stats.staleCount > 0 ? 'border-l-amber-500 bg-amber-950/20' : 'border-l-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stale / Overdue</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition ${
            stats.staleCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className={`text-3xl font-bold tracking-tight ${stats.staleCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {stats.staleCount}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Inactive &gt; 2 Days
          </span>
        </div>
      </div>

      {/* 3. Average Resolution Time */}
      <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Resolution Time</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">{stats.avgResolutionTimeDays}</span>
            <span className="text-xs text-slate-400 font-medium">days</span>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center">
            Resolved Tasks
          </span>
        </div>
      </div>

      {/* 4. Pipeline Breakdown */}
      <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Breakdown</span>
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => handleStatusCardClick('new')}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
              filters.status === 'new' ? 'bg-blue-500/30 text-blue-300 ring-1 ring-blue-500' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>New</span>
            <span className="font-bold text-blue-400">{stats.statusCounts.new}</span>
          </button>
          <button
            onClick={() => handleStatusCardClick('in_progress')}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
              filters.status === 'in_progress' ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-500' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>In Progress</span>
            <span className="font-bold text-amber-400">{stats.statusCounts.in_progress}</span>
          </button>
          <button
            onClick={() => handleStatusCardClick('waiting_on_client')}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
              filters.status === 'waiting_on_client' ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>Waiting</span>
            <span className="font-bold text-purple-400">{stats.statusCounts.waiting_on_client}</span>
          </button>
          <button
            onClick={() => handleStatusCardClick('done')}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
              filters.status === 'done' ? 'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>Done</span>
            <span className="font-bold text-emerald-400">{stats.statusCounts.done}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
