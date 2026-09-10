import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { FilterBar } from './components/FilterBar';
import { RequestTable } from './components/RequestTable';
import { RequestKanban } from './components/RequestKanban';
import { RequestDetailDrawer } from './components/RequestDetailDrawer';
import { NewRequestModal } from './components/NewRequestModal';
import { ClientManagerModal } from './components/ClientManagerModal';
import { AuthModal } from './components/AuthModal';
import { BulkActionBar } from './components/BulkActionBar';

const MainDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showClientManager, setShowClientManager] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern text-[var(--text-primary)]">
      <Navbar
        onOpenNewRequest={() => setShowNewRequest(true)}
        onOpenClientManager={() => setShowClientManager(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* Summary Stats Header */}
        <DashboardStats />

        {/* Filters, Search & Sorting Bar */}
        <FilterBar viewMode={viewMode} setViewMode={setViewMode} />

        {/* Requests Container (Table or Kanban View) */}
        {viewMode === 'table' ? (
          <RequestTable selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
        ) : (
          <RequestKanban />
        )}
      </main>

      {/* Sticky Bottom Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        clearSelection={() => setSelectedIds([])}
      />

      {/* Modals & Drawers */}
      <RequestDetailDrawer />

      {showNewRequest && (
        <NewRequestModal onClose={() => setShowNewRequest(false)} />
      )}

      {showClientManager && (
        <ClientManagerModal onClose={() => setShowClientManager(false)} />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-6 text-center text-xs text-[var(--text-muted)] uppercase tracking-widest">
        <p>Lala Tracker &copy; {new Date().getFullYear()} Lala Tech LLC. Centralized Client Request Management.</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RequestProvider>
          <MainDashboard />
        </RequestProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
