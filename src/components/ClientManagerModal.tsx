import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { X, Building2, Plus, Users } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">Manage Client Accounts</h2>
              <p className="text-[11px] text-slate-400">Lala Tech Client Directory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Add Client Form */}
          <form onSubmit={handleAddClient} className="flex gap-2">
            <input
              type="text"
              placeholder="Add client company name..."
              value={newClientName}
              onChange={e => setNewClientName(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !newClientName.trim()}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20">
              {errorMsg}
            </div>
          )}

          {/* Client List */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Registered Clients ({clients.length})
            </span>

            <div className="space-y-1.5">
              {clients.map(c => {
                const count = requests.filter(r => r.client_id === c.id).length;

                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-800 text-indigo-400 flex items-center justify-center text-xs font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-200">{c.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800">
                      {count} {count === 1 ? 'request' : 'requests'}
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
