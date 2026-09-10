# Lala Tracker — Unified Client Request System

**Lala Tracker** is an agency-grade, high-fashion editorial client request management platform designed for fast-paced engineering and design teams handling multi-client intake, technical requests, SLA tracking, and external client communication.

---

## 1. Platform Overview & Architecture

### Design Philosophy & Blueprint Aesthetic
Lala Tracker embodies a **high-fashion, minimalist editorial and blueprint aesthetic**:
- **Monospace Typography**: Monospace font families (`JetBrains Mono`, `Space Mono`) throughout for an engineered, technical editorial feel.
- **Palette**: Synchronized dual-mode color system:
  - **Light Mode**: Cream / warm off-white background (`#F0EEE9`), deep charcoal `#1A1A1A`, and high-contrast black typography.
  - **Dark Mode**: Deep charcoal/black background (`#1A1A1A`), crisp white/cream text and hairline borders.
- **Borders & Spacing**: Hairline 1px borders, razor-sharp corners (`rounded-none`), zero drop-shadows, zero gradients, and a subtle dotted-grid background pattern.
- **Decorative Blueprint Elements**: Rotating wireframe cube in the dashboard hero with nested dashed gold (`#C9A961`) square and real-time telemetry micro-labels (`ROTATION 136° // SYSTEM ACTIVE`).
- **State Distinction**: Status-driven neutral and accent tags (e.g. dedicated gold/tan border badge for "Waiting on Client", solid contrast tags for "Overdue").

### Technology Stack & State Management
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Date-fns.
- **Backend / Storage**:
  - **Supabase Realtime Mode**: Cloud PostgreSQL database with instant multi-client live sync and authentication.
  - **Autonomous Demo / Mock Mode**: LocalStorage persistence with multi-user role simulation (Admin / Member accounts) and mock Google OAuth.

---

## 2. Core Features & Capabilities

### 1. 6-Stage Request Workflow Pipeline
A structured, non-blocking 6-stage pipeline tracking client requests from initial intake to resolution:

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
- **Visual Alert**: Stale tickets display a high-contrast `>48H INACTIVE` warning badge.
- **Dismissible Dashboard Banner**: Displays an instant top banner on load when overdue or unassigned requests require attention, complete with 1-click filter shortcuts.

---

### 3. Clickable Top Summary Stats Dashboard
The header features interactive metric modules:
1. **/ Waiting on Us**: Real-time count of all active internal tasks requiring team action. Clicking applies the "Waiting on Us" filter.
2. **/ Waiting on Client**: Real-time count of requests waiting on external response. Clicking applies the "Waiting on Client" filter.
3. **/ Overdue**: Inactive internal requests (> 2 days). Clicking highlights all overdue tasks.
4. **/ 6-Stage Pipeline Breakdown**: Interactive counters showing exact counts for `New`, `Clarify`, `Ready`, `In Prog`, `Client`, and `Done`. Clicking any stage isolates tasks in that stage.

---

### 4. High-Contrast Quick Filter Tabs & Search
Located above the request list, quick tabs provide 1-click filtering:
- **ALL (N)**: Displays the full request catalog.
- **WAITING ON US (N)**: Groups all tickets in `new`, `needs_clarification`, `ready_to_assign`, and `in_progress`.
- **WAITING ON CLIENT (N)**: Filters exclusively to tasks waiting on external client feedback.
- **UNASSIGNED (N)**: Isolates tasks needing a developer or team member assigned.
- **OVERDUE (N)**: Isolates stale tickets exceeding the 48h activity SLA.
- **Saved Views**: "+ PIN CURRENT VIEW" button saves custom filter combinations into persistent, clickable filter chips in `localStorage`.
- **Advanced Controls**: Instant search across title/client/work-type, client organization dropdown, priority filter, date range picker, and column sorting.

---

### 5. Spreadsheet-Style Table View with Inline Operations
- **Double-Click Inline Editing**: Edit Title, Priority, Due Date, and Type of Work directly in the cell on double-click (Excel-like fast editing).
- **Column Sorting**: Click on headers (`PRIORITY`, `DUE DATE`, `LAST ACTIVE`) to sort ascending or descending.
- **Export to CSV**: 1-click export of the current filtered table view into a downloadable `.csv` file.
- **Inline Status Transition**: Change any request's status directly via the Status Pipeline dropdown in the table.
- **Inline Assignee Reassignment**: Reassign requests to any user (or "Unassigned") directly via the user dropdown.
- **Direct Drawer Navigation**: Click anywhere on a row or the `>` chevron button to open the full Request Detail Drawer.
- **Full-Opacity High Contrast**: Solid dark/light typography for crisp legibility and horizontal scroll container safety.

---

### 6. 6-Column Kanban Board
- Columns for all 6 stages (`1. New`, `2. Clarify`, `3. Ready`, `4. In Prog`, `5. Client`, `6. Done`).
- **1-Click Advance**: Hover over any card to reveal the `ADVANCE >` shortcut to progress status forward.
- **Distinct Neutral Style**: Dedicated gold/tan bordered badges for `WAITING ON CLIENT` cards.

---

### 7. Request Detail Drawer & Client Communications
- **6-Stage Interactive Stepper**: 1-click stage transition buttons at the top of the detail drawer.
- **Editable Metadata**: Instant updates for Priority, Assignee, and Target Due Date.
- **Smart Update Generator**: Dropdown with 3 human-readable update templates with 1-click clipboard copy:
  1. *Client-Facing Update* (tailored status email/message)
  2. *Internal Escalation Note* (for team alignment on blockers)
  3. *Reminder for Pending Client Input* (gentle follow-up)
- **Shareable Client Link**: 1-click "SHARE LINK" button copies a direct deep link (`/?ticket=req-xxx`) opening the drawer automatically on navigation.
- **Comment Threads & Audit Log**: Real-time discussion thread and immutable audit trail documenting every status change, reassignment, and timestamp.

---

### 8. Smart Automations & Intelligence
- **Keyword Priority Escalation**: Automatically sets priority to "Urgent" on request creation if the title or description contains `"urgent"`, `"asap"`, or `"immediately"`.
- **Client Unblock Suggestion**: When a client comment is submitted on a request with status `waiting_on_client`, the system displays a 1-click prompt suggesting moving the request back to `Ready to Assign`.

---

### 9. Analytics & Resolution Metrics
- Access via the **ANALYTICS** button in the navigation bar with two dedicated views:
  1. **Member Work & Personal Stats**:
     - **Personal Work Summary Card**: Real-time performance breakdown for the currently logged-in user (Completed tickets, Active queue, Personal Completion Rate %, and 7D/30D turnaround counts with recent resolved ticket list).
     - **Work Completed by Each Team Member**: Full team productivity breakdown displaying Completed (`DONE`) count, Active (`ACTIVE`) count, completion rate %, segmented progress bar, and 1-click **VIEW DONE** expandable ticket drawer showing individual resolved requests.
  2. **Velocity & Client Overview**:
     - **Resolution Velocity Trend Chart**: SVG line chart tracking resolved requests over time with 7-Day and 30-Day toggles.
     - **Client Completion Rate Chart**: Bar chart depicting completion percentages across client accounts.

---

### 10. Multi-Select Bulk Action Bar
Select multiple checkboxes in Table View to trigger the floating bottom action bar:
- **Bulk Status Update** (e.g. move multiple requests to `Ready` or `Done`).
- **Bulk Reassignment** (assign selected tickets to a team member in one action).
- **Bulk Deletion** (available for Admin accounts).

---

### 11. Notifications & Global Activity Feed
- **Notification Bell**: Displays live unread badge count for new ticket assignments, tickets going overdue, and comments on involved requests.
- **Global Activity Feed**: Modal accessible via the **ACTIVITY** button showing company-wide audit trails of the 20 most recent actions.

---

## 3. How to Use Lala Tracker

### A. Creating a New Request
1. Click **+ New Request** in the top navigation bar.
2. Select an existing client organization or click **+ Create New** to add a new client on the fly.
3. Fill in Title, Description, Type of Work, Priority, Assignee, and Due Date.
4. Click **Create Request**. The new row immediately appears at the top of the list.

### B. Managing Daily Work & Advancing Statuses
- **Quick Status Change**: Select the status from the dropdown in the **Status Pipeline** column of the table, or click a stage button inside the Detail Drawer.
- **Quick Reassignment**: Click the **Assigned To** dropdown in the table row to assign a developer without leaving the list.
- **Inline Cell Edits**: Double-click on Title, Priority, Due Date, or Work Type to update values inline.
- **View Full Details & Discussion**: Click the row or the `>` arrow to open the drawer, view audit logs, leave comments, or copy a client status update.

### C. Monitoring Bottlenecks & SLAs
- Check the **Top Stats Header** or click the **OVERDUE** filter tab to inspect tickets inactive for more than 48 hours.
- Click **WAITING ON CLIENT** to review external client blockers before weekly status meetings.
- Open **ANALYTICS** to monitor 7D/30D velocity trends and team capacity.

---

## 4. Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation
```bash
# Clone the repository and navigate to client
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:5173/` or `http://127.0.0.1:5173/`.
