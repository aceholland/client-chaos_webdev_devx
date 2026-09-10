import React, { useState } from 'react';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import type { RequestPriority } from '../types';
import { STATUS_CONFIG, PIPELINE_ORDER } from '../lib/statusConfig';
import {
  X,
  Copy,
  Check,
  MessageSquare,
  History,
  Trash2,
  AlertTriangle,
  Send,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const RequestDetailDrawer: React.FC = () => {
  const {
    selectedRequest,
    setSelectedRequestId,
    comments,
    activityLogs,
    updateRequestStatus,
    reassignRequest,
    updateRequestDetails,
    deleteRequest,
    addComment,
    deleteComment,
  } = useRequests();

  const { user, allUsers } = useAuth();

  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedUpdate, setCopiedUpdate] = useState(false);

  if (!selectedRequest) return null;

  const reqComments = comments
    .filter(c => c.request_id === selectedRequest.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const reqLogs = activityLogs
    .filter(a => a.request_id === selectedRequest.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    await addComment(selectedRequest.id, newCommentText);
    setNewCommentText('');
  };

  const [updateTemplate, setUpdateTemplate] = useState<'client' | 'escalation'>('client');

  const generatedUpdateText = (() => {
    const statusLabel = STATUS_CONFIG[selectedRequest.status]?.clientMessageSnippet || selectedRequest.status;

    if (updateTemplate === 'escalation') {
      return `[INTERNAL ESCALATION NOTE]\nTask: ${selectedRequest.title} (ID: ${selectedRequest.id})\nClient: ${selectedRequest.client_name}\nStatus: ${statusLabel}\nPriority: ${selectedRequest.priority.toUpperCase()}\nAssigned: ${selectedRequest.assigned_user_name || 'UNASSIGNED'}\nTarget Due: ${selectedRequest.due_date || 'None'}\nAction Required: Urgent team alignment needed to unblock this request.`;
    }

    let text = `Hi ${selectedRequest.client_name}, quick update on '${selectedRequest.title}': this is currently ${statusLabel}.`;

    if (selectedRequest.assigned_user_name) {
      text += ` Being handled by ${selectedRequest.assigned_user_name}.`;
    }

    if (selectedRequest.due_date) {
      text += ` Expected target completion by ${selectedRequest.due_date}.`;
    }
    return text;
  })();

  const handleCopyClientUpdate = () => {
    navigator.clipboard.writeText(generatedUpdateText);
    setCopiedUpdate(true);
    setTimeout(() => setCopiedUpdate(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]">
      <div className="w-full max-w-5xl bg-[var(--bg-primary)] border-l border-[var(--border-color)] h-full flex flex-col overflow-hidden text-[var(--text-primary)]">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex items-start justify-between bg-[var(--bg-card)]">
          <div className="space-y-3 flex-1 min-w-0 pr-6">
            <div className="flex flex-wrap items-center gap-2 uppercase tracking-widest text-[9px]">
              <span className="px-2 py-0.5 border border-[var(--border-color)] font-bold">
                {selectedRequest.client_name}
              </span>
              <span className="px-2 py-0.5 border border-[var(--border-color)] opacity-80">
                {selectedRequest.type_of_work}
              </span>
              <span className="px-2 py-0.5 border border-[var(--border-color)] font-bold">
                {selectedRequest.priority} PRIORITY
              </span>
              {selectedRequest.is_stale && (
                <span className="px-2 py-0.5 border border-current bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> &gt;48H INACTIVE
                </span>
              )}
            </div>

            {/* Title: consistent monospace uppercase font */}
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight leading-tight">
              {selectedRequest.title}
            </h2>

            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              <span>CREATED BY {selectedRequest.created_user_name} • </span>
              <span>{formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  if (confirm('Delete this request permanently?')) {
                    deleteRequest(selectedRequest.id);
                  }
                }}
                className="p-2 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer"
                title="Delete Request"
                aria-label="Delete Request"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSelectedRequestId(null)}
              className="p-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer"
              title="Close Drawer"
              aria-label="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pipeline Stage Bar */}
        <div className="px-6 py-3 border-b border-[var(--border-color)] bg-transparent">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
            PIPELINE STAGE
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PIPELINE_ORDER.map(statusKey => {
              const cfg = STATUS_CONFIG[statusKey];
              const isCurrent = selectedRequest.status === statusKey;
              return (
                <button
                  key={statusKey}
                  onClick={() => updateRequestStatus(selectedRequest.id, statusKey)}
                  className={`px-2 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all text-left flex flex-col cursor-pointer ${
                    isCurrent
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--border-color)]'
                      : 'border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                  }`}
                >
                  <span className="text-[8px] opacity-70">0{cfg.stepNumber}</span>
                  <span className="truncate">{cfg.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-color)]">
          {/* Left Column: Details & Client Update Generator (2 cols) */}
          <div className="lg:col-span-2 p-6 space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Description</h3>
              <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-card)] text-xs whitespace-pre-wrap leading-relaxed">
                {selectedRequest.description || 'No description provided.'}
              </div>
            </div>

            {/* Expandable Client Update & Escalation Generator */}
            <div className="border border-[var(--border-color)] p-4 bg-transparent space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Update Generator</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={updateTemplate}
                    onChange={e => setUpdateTemplate(e.target.value as any)}
                    className="bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="client">Template: Client-Facing Update</option>
                    <option value="escalation">Template: Internal Escalation Note</option>
                  </select>

                  <button
                    onClick={handleCopyClientUpdate}
                    className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition cursor-pointer"
                  >
                    {copiedUpdate ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] font-mono whitespace-pre-wrap select-all">
                {generatedUpdateText}
              </div>
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                Formatted snippet ready to paste into Slack, email, WhatsApp, or internal ticket comments.
              </p>
            </div>

            {/* Tabs: Internal Notes / Activity Log */}
            <div className="space-y-4">
              <div className="flex border-b border-[var(--border-color)] text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 py-2 border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                    activeTab === 'comments'
                      ? 'border-[var(--border-color)] text-[var(--text-primary)] font-bold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({reqComments.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                    activeTab === 'history'
                      ? 'border-[var(--border-color)] text-[var(--text-primary)] font-bold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Activity History ({reqLogs.length})</span>
                </button>
              </div>

              {activeTab === 'comments' ? (
                <div className="space-y-4">
                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ADD INTERNAL NOTE OR COMMENT..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      className="flex-1 bg-transparent border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-4 py-2 border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  </form>

                  {/* Comment list */}
                  <div className="space-y-2">
                    {reqComments.map(c => (
                      <div key={c.id} className="p-3 border border-[var(--border-color)] bg-[var(--bg-card)] space-y-1">
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                          <span className="font-bold text-[var(--text-primary)]">{c.user_name}</span>
                          <div className="flex items-center gap-2">
                            <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                            {(user?.id === c.user_id || user?.role === 'admin') && (
                              <button
                                onClick={() => deleteComment(c.id)}
                                className="hover:text-red-500 cursor-pointer"
                                title="Delete note"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs whitespace-pre-wrap">{c.content}</p>
                      </div>
                    ))}
                    {reqComments.length === 0 && (
                      <div className="text-center py-6 text-xs text-[var(--text-muted)] uppercase tracking-wider border border-dashed border-[var(--border-color)]/50">
                        No comments yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Activity Log */
                <div className="space-y-2">
                  {reqLogs.map(log => (
                    <div key={log.id} className="p-3 border border-[var(--border-color)] bg-[var(--bg-card)] text-xs flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold uppercase tracking-wider">{log.action.replace('_', ' ')}: </span>
                        <span className="opacity-90">
                          {log.old_value && log.new_value ? `${log.old_value} → ${log.new_value}` : log.new_value || log.old_value || 'updated'}
                        </span>
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                  {reqLogs.length === 0 && (
                    <div className="text-center py-6 text-xs text-[var(--text-muted)] uppercase tracking-wider border border-dashed border-[var(--border-color)]/50">
                      No activity logs recorded.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata & Assignment Fields (1 col) */}
          <div className="p-6 space-y-6 bg-transparent">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Metadata</h3>

            {/* Assignee Field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Assigned To</label>
              <select
                value={selectedRequest.assigned_to || ''}
                onChange={e => reassignRequest(selectedRequest.id, e.target.value || null)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="">UNASSIGNED</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Priority</label>
              <select
                value={selectedRequest.priority}
                onChange={e => updateRequestDetails(selectedRequest.id, { priority: e.target.value as RequestPriority })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="urgent">URGENT</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            {/* Due Date Field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Target Due Date</label>
              <input
                type="date"
                value={selectedRequest.due_date || ''}
                onChange={e => updateRequestDetails(selectedRequest.id, { due_date: e.target.value || null })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            {/* Type of Work Field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Type of Work</label>
              <input
                type="text"
                value={selectedRequest.type_of_work}
                onChange={e => updateRequestDetails(selectedRequest.id, { type_of_work: e.target.value })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            {/* Last Activity Information */}
            <div className="pt-4 border-t border-[var(--border-color)] space-y-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <div>
                <span className="block font-bold text-[var(--text-primary)]">Last Activity:</span>
                <span>{new Date(selectedRequest.last_activity_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="block font-bold text-[var(--text-primary)]">Request ID:</span>
                <span className="font-mono text-[9px]">{selectedRequest.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
