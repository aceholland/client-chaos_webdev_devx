import React from 'react';
import { useRequests } from '../context/RequestContext';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutList,
  Kanban,
  X,
  AlertTriangle,
  User,
  UserX,
  Layers,
  Calendar,
} from 'lucide-react';
import { RequestPriority, RequestStatus } from '../types';

interface FilterBarProps {
  viewMode: 'table' | 'kanban';
  setViewMode: (mode: 'table' | 'kanban') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ viewMode, setViewMode }) => {
  const { filters, setFilters, clients } = useRequests();

  const handleQuickTab = (tab: 'all' | 'mine' | 'unassigned' | 'stale') => {
    setFilters(prev => ({ ...prev, quickTab: tab }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      quickTab: 'all',
      client_id: 'all',
      searchQuery: '',
      dateStart: '',
      dateEnd: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.quickTab !== 'all' ||
    filters.client_id !== 'all' ||
    filters.searchQuery !== '' ||
    filters.dateStart !== '' ||
    filters.dateEnd !== '';

  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 space-y-4 shadow-xl border border-slate-800">
      {/* Top Row: Quick Filter Tabs & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Quick Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => handleQuickTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filters.quickTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Requests</span>
          </button>
          <button
            onClick={() => handleQuickTab('mine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filters.quickTab === 'mine'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Assigned to Me</span>
          </button>
          <button
            onClick={() => handleQuickTab('unassigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filters.quickTab === 'unassigned'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Unassigned</span>
          </button>
          <button
            onClick={() => handleQuickTab('stale')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filters.quickTab === 'stale'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stale / Overdue</span>
          </button>
        </div>

        {/* View Switcher (Table vs Kanban) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              viewMode === 'table' ? 'bg-slate-800 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List View"
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              viewMode === 'kanban' ? 'bg-slate-800 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Kanban Board View"
          >
            <Kanban className="w-4 h-4" />
            <span className="hidden sm:inline">Board</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Search Box, Dropdowns, Date Picker & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800/60">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, desc, or client..."
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Client Filter */}
        <div>
          <select
            value={filters.client_id}
            onChange={e => setFilters(prev => ({ ...prev, client_id: e.target.value }))}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as RequestStatus | 'all' }))}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_on_client">Waiting on Client</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={filters.priority}
            onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value as RequestPriority | 'all' }))}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1">
          <select
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="created_at">Sort: Created Date</option>
            <option value="due_date">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="last_activity_at">Sort: Last Active</option>
          </select>

          <button
            onClick={() =>
              setFilters(prev => ({
                ...prev,
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
              }))
            }
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white transition"
            title={`Order: ${filters.sortOrder.toUpperCase()}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Range & Clear Filters Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/40">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter Created Date:</span>
            <input
              type="date"
              value={filters.dateStart}
              onChange={e => setFilters(prev => ({ ...prev, dateStart: e.target.value }))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
            />
            <span>to</span>
            <input
              type="date"
              value={filters.dateEnd}
              onChange={e => setFilters(prev => ({ ...prev, dateEnd: e.target.value }))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
            />
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
