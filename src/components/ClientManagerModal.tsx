import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { X, Plus } from 'lucide-react';

interface ClientManagerModalProps {
  onClose: () => void;
}

export const ClientManagerModal: React.FC<ClientManagerModalProps> = ({ onClose }) => {
  const { clients, createClient, requests } = useRequests();
  const [newClientName, setNewClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      await createClient(newClientName.trim());
      setNewClientName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div>
            <h2 className="font-bold text-base uppercase tracking-widest text-[var(--text-primary)]">Manage Clients</h2>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">CLIENT DIRECTORY</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 border border-transparent hover:border-[var(--border-color)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Add Client Form */}
          <form onSubmit={handleAddClient} className="flex border border-[var(--border-color)] bg-[var(--bg-primary)]">
            <input
              type="text"
              placeholder="ADD CLIENT COMPANY NAME..."
              value={newClientName}
              onChange={e => setNewClientName(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !newClientName.trim()}
              className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-red-500 uppercase tracking-wider font-bold">{errorMsg}</p>
          )}

          {/* Client List */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Registered Clients ({clients.length})
            </h3>
            <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)]">
              {clients.map(client => {
                const clientReqCount = requests.filter(r => r.client_id === client.id).length;
                return (
                  <div
                    key={client.id}
                    className="p-3 flex items-center justify-between hover:bg-[var(--text-primary)]/5 transition-colors text-xs"
                  >
                    <div>
                      <h4 className="font-bold uppercase tracking-wider">{client.name}</h4>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                        {clientReqCount} active requests
                      </p>
                    </div>
                    <span className="text-[9px] border border-[var(--border-color)] px-1.5 py-0.5 uppercase tracking-widest">
                      ACTIVE
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
