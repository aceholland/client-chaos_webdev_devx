import { UserProfile, Client, RequestItem, CommentItem, ActivityLogItem } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Alice Johnson (Admin)',
    email: 'alice@lalatech.com',
    role: 'admin',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-member-1',
    name: 'Bob Smith',
    email: 'bob@lalatech.com',
    role: 'member',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-member-2',
    name: 'Charlie Davis',
    email: 'charlie@lalatech.com',
    role: 'member',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Acme Corporation',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client-2',
    name: 'Horizon Retail Group',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client-3',
    name: 'Nexus Tech Media',
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client-4',
    name: 'Vanguard Global',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const nowMs = Date.now();
const daysAgo = (days: number) => new Date(nowMs - days * 24 * 60 * 60 * 1000).toISOString();

export const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 'req-101',
    client_id: 'client-1',
    title: 'Migrate legacy ERP data to new API endpoint',
    description: 'Acme requested an urgent export of Q3 inventory records into JSON format and webhook integration.',
    type_of_work: 'Data Migration',
    status: 'in_progress',
    priority: 'urgent',
    assigned_to: 'user-member-1',
    created_by: 'user-admin-1',
    due_date: new Date(nowMs + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: daysAgo(4),
    updated_at: daysAgo(1),
    last_activity_at: daysAgo(1),
  },
  {
    id: 'req-102',
    client_id: 'client-2',
    title: 'Fix payment gateway checkout webhook timeout',
    description: 'Horizon Retail customer checkout fails intermittently during high traffic spikes.',
    type_of_work: 'Bug Fix',
    status: 'new',
    priority: 'high',
    assigned_to: null,
    created_by: 'user-member-1',
    due_date: new Date(nowMs + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: daysAgo(5),
    updated_at: daysAgo(3),
    // Inactive for 3 days -> Stale!
    last_activity_at: daysAgo(3),
  },
  {
    id: 'req-103',
    client_id: 'client-3',
    title: 'Design customized analytics report dashboard',
    description: 'Provide weekly PDF automated report export with custom color branding.',
    type_of_work: 'UI/UX Design',
    status: 'waiting_on_client',
    priority: 'medium',
    assigned_to: 'user-member-2',
    created_by: 'user-admin-1',
    due_date: new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: daysAgo(6),
    updated_at: daysAgo(0.5),
    last_activity_at: daysAgo(0.5),
  },
  {
    id: 'req-104',
    client_id: 'client-4',
    title: 'Setup SSL certificates and domain DNS records',
    description: 'Configure Cloudflare proxy and custom domain validation for staging deployment.',
    type_of_work: 'DevOps',
    status: 'done',
    priority: 'low',
    assigned_to: 'user-admin-1',
    created_by: 'user-admin-1',
    due_date: daysAgo(1).split('T')[0],
    created_at: daysAgo(8),
    updated_at: daysAgo(2),
    last_activity_at: daysAgo(2),
  },
];

export const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'comm-1',
    request_id: 'req-101',
    user_id: 'user-member-1',
    content: 'Started parsing the CSV files. Identified 3 malformed inventory rows, reaching out to Acme database admin.',
    created_at: daysAgo(1.5),
  },
  {
    id: 'comm-2',
    request_id: 'req-103',
    user_id: 'user-member-2',
    content: 'Sent mockups to Nexus team for feedback on primary metrics layout.',
    created_at: daysAgo(0.5),
  },
];

export const INITIAL_ACTIVITY_LOG: ActivityLogItem[] = [
  {
    id: 'act-1',
    request_id: 'req-101',
    user_id: 'user-admin-1',
    action: 'created',
    old_value: null,
    new_value: 'Created request "Migrate legacy ERP data to new API endpoint"',
    created_at: daysAgo(4),
  },
  {
    id: 'act-2',
    request_id: 'req-101',
    user_id: 'user-admin-1',
    action: 'reassigned',
    old_value: 'Unassigned',
    new_value: 'Bob Smith',
    created_at: daysAgo(3),
  },
  {
    id: 'act-3',
    request_id: 'req-101',
    user_id: 'user-member-1',
    action: 'status_changed',
    old_value: 'New',
    new_value: 'In Progress',
    created_at: daysAgo(2),
  },
  {
    id: 'act-4',
    request_id: 'req-102',
    user_id: 'user-member-1',
    action: 'created',
    old_value: null,
    new_value: 'Created request "Fix payment gateway checkout webhook timeout"',
    created_at: daysAgo(5),
  },
];
