import React from 'react';
import { useRequests } from '../context/RequestContext';
import {
  Search,
  ArrowUpDown,
  LayoutList,
  Kanban,
  X,
  AlertTriangle,
  User,
  UserX,
  Layers,
  Calendar,
  Clock,
} from 'lucide-react';
import type { RequestPriority, RequestStatus, QuickTabType } from '../types';

interface FilterBarProps {
  viewMode: 'table' | 'kanban';
  setViewMode: (mode: 'table' | 'kanban') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ viewMode, setViewMode }) => {
  const { filters, setFilters, clients, stats, requests } = useRequests();

  const handleQuickTab = (tab: QuickTabType) => {
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
    <div className="border border-[var(--border-color)] bg-transparent p-4 mb-6 space-y-4">
      {/* Top Row: Quick Filter Tabs & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Quick Tabs: Active = solid fill, Inactive = bordered outline */}
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider">
          {/* 1. All Requests */}
          <button
            onClick={() => handleQuickTab('all')}
            className={`px-3 py-1.5 border border-[var(--border-color)] flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
              filters.quickTab === 'all'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ALL ({requests.length})</span>
          </button>

          {/* 2. Waiting on Us */}
          <button
            onClick={() => handleQuickTab('waiting_on_us')}
            className={`px-3 py-1.5 border border-[var(--border-color)] flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
              filters.quickTab === 'waiting_on_us'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>WAITING ON US ({stats.waitingOnUsCount})</span>
          </button>

          {/* 3. Waiting on Client */}
          <button
            onClick={() => handleQuickTab('waiting_on_client')}
            className={`px-3 py-1.5 border flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
              filters.quickTab === 'waiting_on_client'
                ? 'bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:text-black dark:border-amber-500'
                : 'border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-400 dark:hover:text-black'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>WAITING ON CLIENT ({stats.waitingOnClientCount})</span>
          </button>

          {/* 4. Unassigned */}
          <button
            onClick={() => handleQuickTab('unassigned')}
            className={`px-3 py-1.5 border border-[var(--border-color)] flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
              filters.quickTab === 'unassigned'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>UNASSIGNED ({stats.unassignedCount})</span>
          </button>

          {/* 5. Overdue / Stale */}
          <button
            onClick={() => handleQuickTab('stale')}
            className={`px-3 py-1.5 border border-[var(--border-color)] flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
              filters.quickTab === 'stale'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : stats.staleCount > 0
                ? 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>OVERDUE ({stats.staleCount})</span>
          </button>
        </div>

        {/* View Switcher (Table vs Kanban) */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors border border-[var(--border-color)] cursor-pointer font-bold ${
              viewMode === 'table' 
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            }`}
            title="Table View"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors border border-[var(--border-color)] cursor-pointer font-bold ${
              viewMode === 'kanban' 
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
            }`}
            title="Board View"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Search Box, Dropdowns, Date Picker & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-4 border-t border-[var(--border-color)]">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="SEARCH REQUESTS..."
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-transparent border border-[var(--border-color)] pl-9 pr-8 py-1.5 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Client Filter */}
        <div>
          <select
            value={filters.client_id}
            onChange={e => setFilters(prev => ({ ...prev, client_id: e.target.value }))}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
          >
            <option value="all">ALL CLIENTS</option>
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
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
          >
            <option value="all">ALL STATUSES</option>
            <option value="new">NEW INTAKE</option>
            <option value="needs_clarification">NEEDS CLARIFICATION</option>
            <option value="ready_to_assign">READY TO ASSIGN</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="waiting_on_client">WAITING ON CLIENT</option>
            <option value="done">DONE</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={filters.priority}
            onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value as RequestPriority | 'all' }))}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-1.5 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
          >
            <option value="all">ALL PRIORITIES</option>
            <option value="urgent">URGENT</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="low">LOW</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1">
          <select
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-2.5 py-1.5 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
          >
            <option value="created_at">SORT: CREATED</option>
            <option value="due_date">SORT: DUE DATE</option>
            <option value="priority">SORT: PRIORITY</option>
            <option value="last_activity_at">SORT: LAST ACTIVE</option>
          </select>

          <button
            onClick={() =>
              setFilters(prev => ({
                ...prev,
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
              }))
            }
            className="p-1.5 border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors shrink-0 cursor-pointer"
            title={`Order: ${filters.sortOrder.toUpperCase()}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Date Range & Clear Filters Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-color)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-[var(--text-primary)]" />
            <span className="text-[var(--text-primary)]">DATE:</span>
            <input
              type="date"
              value={filters.dateStart}
              onChange={e => setFilters(prev => ({ ...prev, dateStart: e.target.value }))}
              className="bg-transparent border border-[var(--border-color)] px-2 py-0.5 text-[var(--text-primary)] outline-none"
            />
            <span className="text-[var(--text-primary)]">TO</span>
            <input
              type="date"
              value={filters.dateEnd}
              onChange={e => setFilters(prev => ({ ...prev, dateEnd: e.target.value }))}
              className="bg-transparent border border-[var(--border-color)] px-2 py-0.5 text-[var(--text-primary)] outline-none"
            />
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1 font-bold text-[var(--text-primary)] hover:underline cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>RESET FILTERS</span>
          </button>
        </div>
      )}
    </div>
  );
};
