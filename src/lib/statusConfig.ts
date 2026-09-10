import type { RequestStatus } from '../types';

export interface StatusConfig {
  id: RequestStatus;
  label: string;
  shortLabel: string;
  stepNumber: number;
  badgeClass: string;
  clientMessageSnippet: string;
}

export const STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  new: {
    id: 'new',
    label: 'New Intake',
    shortLabel: 'New',
    stepNumber: 1,
    badgeClass: 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] font-bold',
    clientMessageSnippet: 'New Intake',
  },
  needs_clarification: {
    id: 'needs_clarification',
    label: 'Needs Clarification',
    shortLabel: 'Clarify',
    stepNumber: 2,
    badgeClass: 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] font-bold',
    clientMessageSnippet: 'Under Review (Needs Clarification)',
  },
  ready_to_assign: {
    id: 'ready_to_assign',
    label: 'Ready to Assign',
    shortLabel: 'Ready',
    stepNumber: 3,
    badgeClass: 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] font-bold',
    clientMessageSnippet: 'Ready to Assign',
  },
  in_progress: {
    id: 'in_progress',
    label: 'In Progress',
    shortLabel: 'In Prog',
    stepNumber: 4,
    badgeClass: 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] font-bold',
    clientMessageSnippet: 'In Progress',
  },
  waiting_on_client: {
    id: 'waiting_on_client',
    label: 'Waiting on Client',
    shortLabel: 'Waiting on Client',
    stepNumber: 5,
    badgeClass: 'border border-amber-600 dark:border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold',
    clientMessageSnippet: 'Waiting on Client Information',
  },
  done: {
    id: 'done',
    label: 'Done',
    shortLabel: 'Done',
    stepNumber: 6,
    badgeClass: 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] font-bold',
    clientMessageSnippet: 'Completed',
  },
};

export const PIPELINE_ORDER: RequestStatus[] = [
  'new',
  'needs_clarification',
  'ready_to_assign',
  'in_progress',
  'waiting_on_client',
  'done',
];
