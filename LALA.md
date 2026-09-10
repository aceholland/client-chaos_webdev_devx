# Lala Tracker — Platform Overview & Feature Guide

**Lala Tracker** is an agency-grade, high-fashion editorial client request management platform designed for fast-paced teams handling multi-client intake, technical requests, SLA tracking, and external client communication.

---

## 1. Platform Overview & Architecture

### Design Philosophy
Lala Tracker embodies a **high-fashion, minimalist editorial aesthetic**:
- **Palette**: Warm off-white / cream backgrounds (`#F0EEE9`), deep charcoal `#1A1A1A`, and high-contrast black typography.
- **Borders & Spacing**: Hairline 1px dark borders, razor-sharp corners (zero roundness), and generous whitespace.
- **Typography**: Editorial sans-serif headers (`Oswald` / `Inter`) with small-caps small tracking for labels and badges.
- **State Distinction**: Status-driven neutral and accent tags (e.g. distinct blue-tag badge for "Waiting on Client", solid black/red for "Overdue").

### Technology Stack & State Management
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Date-fns.
- **Backend / Storage**:
  - **Supabase Realtime Mode**: Cloud PostgreSQL database with instant multi-client live sync and authentication.
  - **Autonomous Demo / Mock Mode**: LocalStorage persistence with multi-user role simulation (Admin / Member accounts).

---

## 2. Core Features & Capabilities

### 1. 6-Stage Request Workflow Pipeline
A structured, non-blocking 6-stage pipeline that accurately tracks client requests from initial intake to completion:

| Stage | Identifier | Short Label | Purpose & Behavior |
|---|---|---|---|
| **1. New Intake** | `new` | `New` | Fresh incoming request submitted by client or team lead. |
| **2. Needs Clarification** | `needs_clarification` | `Clarify` | Blocked internally while specs, assets, or requirements are clarified. |
| **3. Ready to Assign** | `ready_to_assign` | `Ready` | Scoped and approved; ready for manager to assign to an engineer. |
| **4. In Progress** | `in_progress` | `In Prog` | Actively being worked on by the assigned team member. |
| **5. Waiting on Client** | `waiting_on_client` | `Client` | Pending feedback, asset delivery, or sign-off from the client organization. |
| **6. Done** | `done` | `Done` | Work completed and resolved. |

> **Unconstrained Transitions**: Team members can manually transition a task to **any** status at any time directly from the Table dropdown, Kanban advance button, or the Detail Drawer stepper.

---

### 2. Intelligent Stale & Overdue Monitoring
- **Internal Action Threshold**: A task is flagged as **STALE / OVERDUE** if it has had **no activity for > 2 days (48 hours)** while in internal stages:
  - `new`, `needs_clarification`, `ready_to_assign`, `in_progress`
- **Client Exclusion**: Requests in `waiting_on_client` are **strictly excluded** from stale warnings, ensuring internal SLA alarms do not trigger when waiting on external client input.
- **Visual Alert**: Stale tickets display a pulse-subtle high-contrast `STALE` badge with Lucide warning icon.

---

### 3. Clickable Top Summary Stats Dashboard
The header features 4 interactive metric modules:
1. **/ Waiting on Us**: Real-time count of all active internal tasks requiring team action. Clicking applies the "Waiting on Us" filter.
2. **/ Waiting on Client**: Real-time count of requests waiting on external response. Clicking applies the "Waiting on Client" filter.
3. **/ Overdue**: Inactive internal requests (> 2 days). Clicking highlights all overdue tasks.
4. **/ 6-Stage Pipeline Breakdown**: Interactive pills showing exact counts for `New`, `Clarify`, `Ready`, `In Prog`, `Client`, and `Done`. Clicking any pill isolates tasks in that stage.

---

### 4. High-Contrast Quick Filter Tabs & Search
Located above the request list, quick tabs provide 1-click filtering:
- **ALL (N)**: Displays the full request catalog.
- **WAITING ON US (N)**: Groups all tickets in `new`, `needs_clarification`, `ready_to_assign`, and `in_progress`.
- **WAITING ON CLIENT (N)**: Filters exclusively to tasks waiting on external client feedback.
- **UNASSIGNED (N)**: Isolates tasks needing a developer or team member assigned.
- **OVERDUE (N)**: Isolates stale tickets exceeding the 48h activity SLA.
- **Advanced Controls**: Instant search by title/client/work-type, client organization dropdown, priority dropdown, date range picker, and sort order controls.

---

### 5. Table View with Inline Operations
- **Full-Opacity High Contrast**: All text, client tags, and metadata use solid dark black/charcoal text for maximum legibility.
- **Inline Status Transition**: Change any request's status directly via the "Status Pipeline" dropdown in the table.
- **Inline Assignee Reassignment**: Reassign requests to any user (or "Unassigned") directly via the user dropdown.
- **Direct Row Navigation**: Click anywhere on a row or the `>` chevron button to open the full Request Detail Drawer.
- **Horizontal Scroll Protection**: Responsive horizontal scroll container ensuring tables render cleanly on any viewport.

---

### 6. 6-Column Kanban Board
- Displays columns for all 6 stages (`1. New`, `2. Clarify`, `3. Ready`, `4. In Prog`, `5. Client`, `6. Done`).
- **1-Click Advance**: Hover over any card to reveal the `ADVANCE >` shortcut to progress the status forward.
- **Distinct Neutral Style**: Features dedicated slate-blue badges for `WAITING ON CLIENT` cards.

---

### 7. Request Detail Drawer & Client Communications
- **6-Stage Interactive Stepper**: 1-click stage transition buttons at the top of the detail drawer.
- **Editable Metadata**: Instant updates for Priority, Assignee, and Target Due Date.
- **Automated Client Update Generator**: 1-click "COPY TEXT" button that formats a professional, human-readable status email/message tailored to the client organization.
- **Comment Threads & Audit Log**: Real-time discussion thread and immutable audit trail documenting every status change, reassignment, and timestamp.

---

### 8. Multi-Select Bulk Action Bar
Select multiple checkboxes in Table View to trigger the floating bottom action bar:
- Bulk Status Update (e.g. move 5 requests to `Ready` or `Done`).
- Bulk Reassignment (e.g. assign multiple tickets to a single team member).
- Bulk Deletion (available for Admin accounts).

---

## 3. How to Use Lala Tracker

### A. Creating a New Request
1. Click **+ New Request** in the top navigation bar.
2. Select an existing client organization or click **+ Create New** to add a new client on the fly.
3. Fill in the Title, Description, Type of Work, Priority, Assignee, and Due Date.
4. Click **Create Request**. The new row immediately appears at the top of the list.

### B. Managing Daily Work & Advancing Statuses
- **Quick Status Change**: Select the status from the dropdown in the **Status Pipeline** column of the table, or click a stage button inside the Detail Drawer.
- **Quick Reassignment**: Click the **Assigned To** dropdown in the table row to assign a developer without leaving the list.
- **View Full Details & Discussion**: Click the row or the `>` arrow to open the drawer, view audit logs, leave comments, or copy a client status update.

### C. Monitoring Bottlenecks & SLAs
- Check the **Top Stats Header** or click the **OVERDUE** filter tab to inspect tickets inactive for more than 48 hours.
- Click **WAITING ON CLIENT** to review external client blockers before weekly status meetings.
