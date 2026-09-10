import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  RequestItem,
  Client,
  CommentItem,
  ActivityLogItem,
  RequestFilters,
  DashboardStats,
  RequestStatus,
  RequestPriority,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_REQUESTS, INITIAL_CLIENTS, INITIAL_COMMENTS, INITIAL_ACTIVITY_LOG } from '../lib/mockData';
import { useAuth } from './AuthContext';

interface RequestContextType {
  requests: RequestItem[];
  clients: Client[];
  comments: CommentItem[];
  activityLogs: ActivityLogItem[];
  filters: RequestFilters;
  setFilters: React.Dispatch<React.SetStateAction<RequestFilters>>;
  filteredRequests: RequestItem[];
  stats: DashboardStats;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  selectedRequest: RequestItem | null;
  
  // Actions
  createRequest: (payload: {
    client_id?: string;
    new_client_name?: string;
    title: string;
    description: string;
    type_of_work: string;
    priority?: RequestPriority;
    assigned_to?: string | null;
    due_date?: string | null;
  }) => Promise<string>;
  
  updateRequestStatus: (requestId: string, newStatus: RequestStatus) => Promise<void>;
  reassignRequest: (requestId: string, newAssigneeId: string | null) => Promise<void>;
  updateRequestDetails: (requestId: string, updates: Partial<RequestItem>) => Promise<void>;
  deleteRequest: (requestId: string) => Promise<void>;
  
  addComment: (requestId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  createClient: (name: string) => Promise<Client>;
  
  // Bulk Actions
  bulkUpdateStatus: (requestIds: string[], status: RequestStatus) => Promise<void>;
  bulkReassign: (requestIds: string[], assigneeId: string | null) => Promise<void>;
  bulkDelete: (requestIds: string[]) => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

const LOCAL_STORAGE_REQS = 'lala_tracker_requests';
const LOCAL_STORAGE_CLIENTS = 'lala_tracker_clients';
const LOCAL_STORAGE_COMMENTS = 'lala_tracker_comments';
const LOCAL_STORAGE_LOGS = 'lala_tracker_logs';

const DEFAULT_FILTERS: RequestFilters = {
  status: 'all',
  priority: 'all',
  quickTab: 'all',
  client_id: 'all',
  searchQuery: '',
  dateStart: '',
  dateEnd: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

// Helper: Check if task is stale (> 2 days / 48h without activity & status in new, needs_clarification, ready_to_assign, in_progress)
export const checkIsStale = (request: { status: RequestStatus; last_activity_at: string }): boolean => {
  const staleEligibleStatuses: RequestStatus[] = [
    'new',
    'needs_clarification',
    'ready_to_assign',
    'in_progress',
  ];

  if (!staleEligibleStatuses.includes(request.status)) {
    return false;
  }

  const lastActMs = new Date(request.last_activity_at).getTime();
  const nowMs = Date.now();
  const twoDaysMs = 48 * 60 * 60 * 1000;
  return nowMs - lastActMs > twoDaysMs;
};

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, allUsers } = useAuth();
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [rawRequests, setRawRequests] = useState<RequestItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_REQS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [comments, setComments] = useState<CommentItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_COMMENTS);
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOG;
  });

  const [filters, setFilters] = useState<RequestFilters>(DEFAULT_FILTERS);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Sync state to LocalStorage for mock mode persistence
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_STORAGE_CLIENTS, JSON.stringify(clients));
      localStorage.setItem(LOCAL_STORAGE_REQS, JSON.stringify(rawRequests));
      localStorage.setItem(LOCAL_STORAGE_COMMENTS, JSON.stringify(comments));
      localStorage.setItem(LOCAL_STORAGE_LOGS, JSON.stringify(activityLogs));
    }
  }, [clients, rawRequests, comments, activityLogs]);

  // Fetch initial data & Realtime subscriptions if Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchData = async () => {
      const [cRes, rRes, comRes, logRes] = await Promise.all([
        supabase.from('clients').select('*').order('name'),
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: true }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }),
      ]);

      if (cRes.data) setClients(cRes.data as Client[]);
      if (rRes.data) setRawRequests(rRes.data as RequestItem[]);
      if (comRes.data) setComments(comRes.data as CommentItem[]);
      if (logRes.data) setActivityLogs(logRes.data as ActivityLogItem[]);
    };

    fetchData();

    // Supabase Realtime channel setup for instant multi-user updates
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Map enriched fields onto requests (client_name, user_names, stale status)
  const requests: RequestItem[] = useMemo(() => {
    const clientMap = new Map(clients.map(c => [c.id, c.name]));
    const userMap = new Map(allUsers.map(u => [u.id, u.name]));

    return rawRequests.map(r => ({
      ...r,
      client_name: clientMap.get(r.client_id) || 'Unknown Client',
      assigned_user_name: r.assigned_to ? userMap.get(r.assigned_to) || 'Unknown User' : null,
      created_user_name: userMap.get(r.created_by) || 'Unknown User',
      is_stale: checkIsStale(r),
    }));
  }, [rawRequests, clients, allUsers]);

  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedRequestId) || null;
  }, [requests, selectedRequestId]);

  // Compute Dashboard Summary Stats
  const stats: DashboardStats = useMemo(() => {
    let totalOpen = 0;
    let waitingOnUsCount = 0;
    let waitingOnClientCount = 0;
    let unassignedCount = 0;
    let staleCount = 0;
    let totalResolutionDays = 0;
    let doneCount = 0;

    const statusCounts: Record<RequestStatus, number> = {
      new: 0,
      needs_clarification: 0,
      ready_to_assign: 0,
      in_progress: 0,
      waiting_on_client: 0,
      done: 0,
    };

    const waitingOnUsStatuses: RequestStatus[] = [
      'new',
      'needs_clarification',
      'ready_to_assign',
      'in_progress',
    ];

    requests.forEach(r => {
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status] += 1;
      }
      
      if (r.status !== 'done') {
        totalOpen += 1;
        if (waitingOnUsStatuses.includes(r.status)) {
          waitingOnUsCount += 1;
        }
        if (r.status === 'waiting_on_client') {
          waitingOnClientCount += 1;
        }
        if (!r.assigned_to) {
          unassignedCount += 1;
        }
        if (r.is_stale) {
          staleCount += 1;
        }
      } else {
        doneCount += 1;
        const createdMs = new Date(r.created_at).getTime();
        const updatedMs = new Date(r.updated_at).getTime();
        const diffDays = Math.max(0, (updatedMs - createdMs) / (1000 * 60 * 60 * 24));
        totalResolutionDays += diffDays;
      }
    });

    const avgResolutionTimeDays = doneCount > 0 ? Number((totalResolutionDays / doneCount).toFixed(1)) : 0;

    return {
      totalOpen,
      waitingOnUsCount,
      waitingOnClientCount,
      unassignedCount,
      staleCount,
      avgResolutionTimeDays,
      statusCounts,
    };
  }, [requests]);

  // Filtered & Sorted Requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Quick Tab Filter
      if (filters.quickTab === 'waiting_on_us') {
        const waitingOnUsStatuses: RequestStatus[] = [
          'new',
          'needs_clarification',
          'ready_to_assign',
          'in_progress',
        ];
        if (!waitingOnUsStatuses.includes(r.status)) return false;
      }
      if (filters.quickTab === 'waiting_on_client' && r.status !== 'waiting_on_client') return false;
      if (filters.quickTab === 'mine' && r.assigned_to !== user?.id) return false;
      if (filters.quickTab === 'unassigned' && r.assigned_to !== null) return false;
      if (filters.quickTab === 'stale' && !r.is_stale) return false;

      // Dropdown Filters
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.priority !== 'all' && r.priority !== filters.priority) return false;
      if (filters.client_id !== 'all' && r.client_id !== filters.client_id) return false;

      // Date Range Filter
      if (filters.dateStart) {
        const itemDate = new Date(r.created_at).getTime();
        const startDate = new Date(filters.dateStart).getTime();
        if (itemDate < startDate) return false;
      }
      if (filters.dateEnd) {
        const itemDate = new Date(r.created_at).getTime();
        const endDate = new Date(filters.dateEnd + 'T23:59:59').getTime();
        if (itemDate > endDate) return false;
      }

      // Search Query Filter (ILIKE match)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesClient = (r.client_name || '').toLowerCase().includes(q);
        const matchesType = r.type_of_work.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesClient && !matchesType) return false;
      }

      return true;
    }).sort((a, b) => {
      const orderMultiplier = filters.sortOrder === 'asc' ? 1 : -1;
      if (filters.sortBy === 'created_at') {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * orderMultiplier;
      }
      if (filters.sortBy === 'due_date') {
        const dA = a.due_date ? new Date(a.due_date).getTime() : 9999999999999;
        const dB = b.due_date ? new Date(b.due_date).getTime() : 9999999999999;
        return (dA - dB) * orderMultiplier;
      }
      if (filters.sortBy === 'last_activity_at') {
        return (new Date(a.last_activity_at).getTime() - new Date(b.last_activity_at).getTime()) * orderMultiplier;
      }
      if (filters.sortBy === 'priority') {
        const pWeight: Record<RequestPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pWeight[a.priority] - pWeight[b.priority]) * orderMultiplier;
      }
      return 0;
    });
  }, [requests, filters, user]);

  // Actions
  const createClient = async (name: string): Promise<Client> => {
    const trimmed = name.trim();
    const existing = clients.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newC: Client = {
      id: `client-${Date.now()}`,
      name: trimmed,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('clients').insert({ name: trimmed }).select().single();
      if (error) throw error;
      setClients(prev => [...prev, data as Client]);
      return data as Client;
    } else {
      setClients(prev => [...prev, newC]);
      return newC;
    }
  };

  const createRequest = async (payload: {
    client_id?: string;
    new_client_name?: string;
    title: string;
    description: string;
    type_of_work: string;
    priority?: RequestPriority;
    assigned_to?: string | null;
    due_date?: string | null;
  }): Promise<string> => {
    const activeUser = user || allUsers[0];
    if (!activeUser) throw new Error('Must be logged in');

    let targetClientId = payload.client_id;
    if (!targetClientId && payload.new_client_name) {
      const createdC = await createClient(payload.new_client_name);
      targetClientId = createdC.id;
    }

    if (!targetClientId) throw new Error('Client is required');

    const nowIso = new Date().toISOString();
    const reqId = `req-${Date.now()}`;

    // Auto-set priority to "urgent" if request description or title contains keywords like "urgent", "asap", "immediately"
    const textToCheck = `${payload.title} ${payload.description || ''}`.toLowerCase();
    const isUrgentKeyword = /\b(urgent|asap|immediately)\b/i.test(textToCheck);
    const resolvedPriority: RequestPriority = isUrgentKeyword ? 'urgent' : (payload.priority || 'medium');

    const newReq: RequestItem = {
      id: reqId,
      client_id: targetClientId,
      title: payload.title,
      description: payload.description || '',
      type_of_work: payload.type_of_work || 'General',
      status: 'new',
      priority: resolvedPriority,
      assigned_to: payload.assigned_to || null,
      created_by: activeUser.id,
      due_date: payload.due_date || null,
      created_at: nowIso,
      updated_at: nowIso,
      last_activity_at: nowIso,
    };

    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      request_id: reqId,
      user_id: activeUser.id,
      action: 'created',
      old_value: null,
      new_value: `Created request "${payload.title}"`,
      created_at: nowIso,
    };

    // Optimistically update local state immediately
    setRawRequests(prev => [newReq, ...prev]);
    setActivityLogs(prev => [newLog, ...prev]);

    if (isSupabaseConfigured) {
      try {
        const { data: dbReq, error } = await supabase.from('requests').insert({
          client_id: targetClientId,
          title: payload.title,
          description: payload.description,
          type_of_work: payload.type_of_work,
          priority: payload.priority || 'medium',
          assigned_to: payload.assigned_to || null,
          created_by: activeUser.id,
          due_date: payload.due_date || null,
        }).select().single();

        if (error) throw error;

        // Replace temporary ID with DB ID
        setRawRequests(prev => prev.map(r => r.id === reqId ? (dbReq as RequestItem) : r));

        await supabase.from('activity_log').insert({
          request_id: dbReq.id,
          user_id: activeUser.id,
          action: 'created',
          new_value: `Created request "${payload.title}"`,
        });

        return dbReq.id;
      } catch (err) {
        console.error('Failed to create request in Supabase:', err);
        return reqId;
      }
    } else {
      return reqId;
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    const activeUser = user || allUsers[0];
    const target = rawRequests.find(r => r.id === requestId);
    if (!target || target.status === newStatus) return;

    const oldStatusLabel = target.status.replace(/_/g, ' ');
    const newStatusLabel = newStatus.replace(/_/g, ' ');
    const nowIso = new Date().toISOString();

    const logEntry: ActivityLogItem = {
      id: `act-${Date.now()}`,
      request_id: requestId,
      user_id: activeUser ? activeUser.id : 'unknown',
      action: 'status_changed',
      old_value: oldStatusLabel,
      new_value: newStatusLabel,
      created_at: nowIso,
    };

    // Optimistically update local state immediately
    setRawRequests(prev =>
      prev.map(r => r.id === requestId ? {
        ...r,
        status: newStatus,
        updated_at: nowIso,
        last_activity_at: nowIso,
      } : r)
    );
    setActivityLogs(prev => [logEntry, ...prev]);

    if (isSupabaseConfigured && activeUser) {
      try {
        await supabase.from('requests').update({
          status: newStatus,
          updated_at: nowIso,
          last_activity_at: nowIso,
        }).eq('id', requestId);

        await supabase.from('activity_log').insert({
          request_id: requestId,
          user_id: activeUser.id,
          action: 'status_changed',
          old_value: oldStatusLabel,
          new_value: newStatusLabel,
        });
      } catch (err) {
        console.error('Failed to update request status in Supabase:', err);
      }
    }
  };

  const reassignRequest = async (requestId: string, newAssigneeId: string | null) => {
    const activeUser = user || allUsers[0];
    const target = rawRequests.find(r => r.id === requestId);
    if (!target || target.assigned_to === newAssigneeId) return;

    const oldUser = allUsers.find(u => u.id === target.assigned_to)?.name || 'Unassigned';
    const newUser = newAssigneeId ? (allUsers.find(u => u.id === newAssigneeId)?.name || 'Unknown') : 'Unassigned';
    const nowIso = new Date().toISOString();

    const logEntry: ActivityLogItem = {
      id: `act-${Date.now()}`,
      request_id: requestId,
      user_id: activeUser ? activeUser.id : 'unknown',
      action: 'reassigned',
      old_value: oldUser,
      new_value: newUser,
      created_at: nowIso,
    };

    // Optimistic update
    setRawRequests(prev =>
      prev.map(r => r.id === requestId ? {
        ...r,
        assigned_to: newAssigneeId,
        updated_at: nowIso,
        last_activity_at: nowIso,
      } : r)
    );
    setActivityLogs(prev => [logEntry, ...prev]);

    if (isSupabaseConfigured && activeUser) {
      try {
        await supabase.from('requests').update({
          assigned_to: newAssigneeId,
          updated_at: nowIso,
          last_activity_at: nowIso,
        }).eq('id', requestId);

        await supabase.from('activity_log').insert({
          request_id: requestId,
          user_id: activeUser.id,
          action: 'reassigned',
          old_value: oldUser,
          new_value: newUser,
        });
      } catch (err) {
        console.error('Failed to update assignee in Supabase:', err);
      }
    }
  };

  const updateRequestDetails = async (requestId: string, updates: Partial<RequestItem>) => {
    const target = rawRequests.find(r => r.id === requestId);
    if (!target) return;

    const nowIso = new Date().toISOString();

    // Optimistic update
    setRawRequests(prev =>
      prev.map(r => r.id === requestId ? {
        ...r,
        ...updates,
        updated_at: nowIso,
        last_activity_at: nowIso,
      } : r)
    );

    if (isSupabaseConfigured) {
      try {
        await supabase.from('requests').update({
          ...updates,
          updated_at: nowIso,
          last_activity_at: nowIso,
        }).eq('id', requestId);
      } catch (err) {
        console.error('Failed to update request details in Supabase:', err);
      }
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (user?.role !== 'admin') {
      alert('Permission denied: Only Admin users can delete requests.');
      return;
    }

    if (isSupabaseConfigured) {
      await supabase.from('requests').delete().eq('id', requestId);
    } else {
      setRawRequests(prev => prev.filter(r => r.id !== requestId));
      setComments(prev => prev.filter(c => c.request_id !== requestId));
      setActivityLogs(prev => prev.filter(a => a.request_id !== requestId));
    }

    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
    }
  };

  const addComment = async (requestId: string, content: string) => {
    if (!user || !content.trim()) return;

    const nowIso = new Date().toISOString();
    const commId = `comm-${Date.now()}`;

    const newComm: CommentItem = {
      id: commId,
      request_id: requestId,
      user_id: user.id,
      content: content.trim(),
      created_at: nowIso,
      user_name: user.name,
      user_role: user.role,
    };

    const logEntry: ActivityLogItem = {
      id: `act-${Date.now()}`,
      request_id: requestId,
      user_id: user.id,
      action: 'comment_added',
      old_value: null,
      new_value: content.trim().substring(0, 60) + (content.length > 60 ? '...' : ''),
      created_at: nowIso,
    };

    if (isSupabaseConfigured) {
      await supabase.from('comments').insert({
        request_id: requestId,
        user_id: user.id,
        content: content.trim(),
      });

      await supabase.from('requests').update({
        last_activity_at: nowIso,
        updated_at: nowIso,
      }).eq('id', requestId);

      await supabase.from('activity_log').insert({
        request_id: requestId,
        user_id: user.id,
        action: 'comment_added',
        new_value: content.trim().substring(0, 60),
      });
    } else {
      setComments(prev => [...prev, newComm]);
      setActivityLogs(prev => [logEntry, ...prev]);
      setRawRequests(prev =>
        prev.map(r => r.id === requestId ? {
          ...r,
          last_activity_at: nowIso,
          updated_at: nowIso,
        } : r)
      );
    }
  };

  const deleteComment = async (commentId: string) => {
    if (user?.role !== 'admin') {
      alert('Permission denied: Only Admin users can delete comments.');
      return;
    }

    if (isSupabaseConfigured) {
      await supabase.from('comments').delete().eq('id', commentId);
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  // Bulk Operations
  const bulkUpdateStatus = async (requestIds: string[], status: RequestStatus) => {
    if (!user || requestIds.length === 0) return;
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured) {
      await supabase.from('requests').update({
        status,
        updated_at: nowIso,
        last_activity_at: nowIso,
      }).in('id', requestIds);

      const logs = requestIds.map(id => ({
        request_id: id,
        user_id: user.id,
        action: 'status_changed',
        old_value: 'Bulk selection',
        new_value: status.replace('_', ' '),
      }));
      await supabase.from('activity_log').insert(logs);
    } else {
      setRawRequests(prev =>
        prev.map(r => requestIds.includes(r.id) ? {
          ...r,
          status,
          updated_at: nowIso,
          last_activity_at: nowIso,
        } : r)
      );

      const newLogs: ActivityLogItem[] = requestIds.map((id, idx) => ({
        id: `act-bulk-${Date.now()}-${idx}`,
        request_id: id,
        user_id: user.id,
        action: 'status_changed',
        old_value: 'Bulk selection',
        new_value: status.replace('_', ' '),
        created_at: nowIso,
      }));
      setActivityLogs(prev => [...newLogs, ...prev]);
    }
  };

  const bulkReassign = async (requestIds: string[], assigneeId: string | null) => {
    if (!user || requestIds.length === 0) return;
    const nowIso = new Date().toISOString();
    const newUser = assigneeId ? (allUsers.find(u => u.id === assigneeId)?.name || 'Unknown') : 'Unassigned';

    if (isSupabaseConfigured) {
      await supabase.from('requests').update({
        assigned_to: assigneeId,
        updated_at: nowIso,
        last_activity_at: nowIso,
      }).in('id', requestIds);

      const logs = requestIds.map(id => ({
        request_id: id,
        user_id: user.id,
        action: 'reassigned',
        old_value: 'Bulk selection',
        new_value: newUser,
      }));
      await supabase.from('activity_log').insert(logs);
    } else {
      setRawRequests(prev =>
        prev.map(r => requestIds.includes(r.id) ? {
          ...r,
          assigned_to: assigneeId,
          updated_at: nowIso,
          last_activity_at: nowIso,
        } : r)
      );

      const newLogs: ActivityLogItem[] = requestIds.map((id, idx) => ({
        id: `act-bulk-re-${Date.now()}-${idx}`,
        request_id: id,
        user_id: user.id,
        action: 'reassigned',
        old_value: 'Bulk selection',
        new_value: newUser,
        created_at: nowIso,
      }));
      setActivityLogs(prev => [...newLogs, ...prev]);
    }
  };

  const bulkDelete = async (requestIds: string[]) => {
    if (user?.role !== 'admin') {
      alert('Permission denied: Only Admin users can delete requests.');
      return;
    }
    if (requestIds.length === 0) return;

    if (isSupabaseConfigured) {
      await supabase.from('requests').delete().in('id', requestIds);
    } else {
      setRawRequests(prev => prev.filter(r => !requestIds.includes(r.id)));
      setComments(prev => prev.filter(c => !requestIds.includes(c.request_id)));
      setActivityLogs(prev => prev.filter(a => !requestIds.includes(a.request_id)));
    }

    if (selectedRequestId && requestIds.includes(selectedRequestId)) {
      setSelectedRequestId(null);
    }
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        clients,
        comments,
        activityLogs,
        filters,
        setFilters,
        filteredRequests,
        stats,
        selectedRequestId,
        setSelectedRequestId,
        selectedRequest,
        createRequest,
        updateRequestStatus,
        reassignRequest,
        updateRequestDetails,
        deleteRequest,
        addComment,
        deleteComment,
        createClient,
        bulkUpdateStatus,
        bulkReassign,
        bulkDelete,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
