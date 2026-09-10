export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  created_at: string;
}

export type RequestStatus =
  | 'new'
  | 'needs_clarification'
  | 'ready_to_assign'
  | 'in_progress'
  | 'waiting_on_client'
  | 'done';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RequestItem {
  id: string;
  client_id: string;
  title: string;
  description: string;
  type_of_work: string;
  status: RequestStatus;
  priority: RequestPriority;
  assigned_to: string | null;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string;

  // Joined metadata
  client_name?: string;
  assigned_user_name?: string | null;
  created_user_name?: string;
  is_stale?: boolean;
}

export interface CommentItem {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  created_at: string;

  // Joined
  user_name?: string;
  user_role?: UserRole;
}

export interface ActivityLogItem {
  id: string;
  request_id: string;
  user_id: string;
  action: 'created' | 'status_changed' | 'reassigned' | 'comment_added' | 'priority_changed' | 'due_date_changed' | 'bulk_updated';
  old_value: string | null;
  new_value: string | null;
  created_at: string;

  // Joined
  user_name?: string;
}

export type QuickTabType = 'all' | 'waiting_on_us' | 'waiting_on_client' | 'mine' | 'unassigned' | 'stale';

export interface RequestFilters {
  status: RequestStatus | 'all';
  priority: RequestPriority | 'all';
  quickTab: QuickTabType;
  client_id: string | 'all';
  searchQuery: string;
  dateStart: string;
  dateEnd: string;
  sortBy: 'created_at' | 'due_date' | 'priority' | 'last_activity_at';
  sortOrder: 'asc' | 'desc';
}

export interface NotificationItem {
  id: string;
  type: 'assigned' | 'stale';
  request_id: string;
  request_title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
}

export interface DashboardStats {
  totalOpen: number;
  waitingOnUsCount: number;
  waitingOnClientCount: number;
  unassignedCount: number;
  staleCount: number;
  avgResolutionTimeDays: number;
  statusCounts: Record<RequestStatus, number>;
}
