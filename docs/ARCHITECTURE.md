# TrackFlow Architecture Specification

## 1. System Overview

TrackFlow is an issue tracking and project intelligence platform designed for agile software engineering teams. The system is engineered around a clean layered architecture emphasizing:
- **Separation of Concerns:** Client UI presentation is isolated from API transport, which is isolated from business rules and database persistence.
- **Strict Role-Based Access Control (RBAC):** Every data mutation and read access is validated against the requesting user's project role.
- **Predictable State & Cache Management:** Frontend TanStack Query manages cache lifecycles, optimistic updates, and multi-query invalidations without redundant round-trips.

---

## 2. Architecture Layers

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION LAYER                           │
│  React 19 Components • Pages (Dashboard, Projects, Kanban, Issues)       │
│  State: TanStack Query v5 Server State + Auth Context Client State       │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ Axios Client (Bearer Token / Cookie)
┌────────────────────────────────────▼─────────────────────────────────────┐
│                             API TRANSPORT LAYER                          │
│  Express 5 Router Gateway • CORS & Rate Limiting • Error Middleware     │
│  Authentication Middleware (JWT verification + User context injection)   │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ Express Request Context
┌────────────────────────────────────▼─────────────────────────────────────┐
│                            CONTROLLER & VALIDATION                       │
│  Zod Schema Validation • HTTP Request Parsing • Status Code Mapping      │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ Validated DTOs & userId
┌────────────────────────────────────▼─────────────────────────────────────┐
│                              SERVICE LAYER                               │
│  RBAC Authorization • Domain Logic • Concurrent Aggregations             │
│  Activity Logger Interceptors                                            │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ Prisma Client API ($transaction)
┌────────────────────────────────────▼─────────────────────────────────────┐
│                           DATA PERSISTENCE LAYER                         │
│  Prisma ORM • Connection Pooling • PostgreSQL Database                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Directory Structure
```
client/src/
├── assets/          # Static logos, svgs
├── components/      # UI components by domain
│   ├── activity/    # ActivityItem, ActivityTimeline
│   ├── comment/     # CommentItem, CommentList
│   ├── dashboard/   # StatCard, IssueStatusChart, PriorityChart, WorkloadChart
│   ├── issue/       # IssueTable, IssueRow, IssueFilters, IssueFormDialog
│   ├── kanban/      # KanbanBoard, KanbanColumn, KanbanCard
│   ├── layout/      # AppShell, Navbar, Sidebar
│   ├── project/     # ProjectCard, ProjectMembersTab, AddMemberDialog
│   └── ui/          # Radix/shadcn atomic primitives (dialog, button, avatar)
├── context/         # AuthContext (user session, login, signup, logout)
├── hooks/           # TanStack Query custom hooks (useProjects, useIssues, useDashboard)
├── pages/           # Route views (Dashboard, Projects, Issues, Settings)
├── routes/          # AppRoutes, ProtectedRoute
├── services/        # Axios API callers (api.js, auth.api.js, project.api.js)
└── validations/     # Client-side Zod validation schemas
```

### 3.2 Cache Key Hierarchy & Surgical Invalidations
TanStack Query keys follow a structured path convention allowing pinpoint cache updates:

```javascript
['projects']                             // All accessible projects list
['projects', projectId]                  // Single project metadata
['projects', projectId, 'members']       // Project collaborators
['issues', projectId, { status, page }]  // Project-filtered issues
['all-issues', { search, priority }]     // Global workspace issues
['issues', issueId]                      // Issue detail
['comments', issueId]                    // Issue comments thread
['dashboard', projectId]                 // Project Intelligence metrics
['activity', projectId]                  // Project activity timeline
```

When an issue status transitions on the Kanban Board:
- `['issues', projectId]` is invalidated.
- `['all-issues']` is invalidated.
- `['dashboard', projectId]` is invalidated (updating completion rate & resolution time instantly).
- `['activity', projectId]` is invalidated (streaming the status change into the timeline).

---

## 4. Backend Architecture & Request Lifecycle

### 4.1 Request Processing Pipeline

```
HTTP Request ──► CORS & Security Headers ──► Rate Limiter ──► authenticate Middleware
                       │
                       ▼
                 Zod Validator ──► Controller ──► Service (RBAC & Business Rules)
                                                        │
                                                        ▼
                                                  Prisma Client
                                                        │
                                                        ▼
                                              PostgreSQL Database
```

1. **Transport Security:** Express applies Content Security Policy, X-Frame-Options, and CORS with origin validation.
2. **Auth Verification:** `authenticate` extracts JWT from cookies or `Authorization: Bearer` header, decodes user payload, verifies database presence, and injects `req.user`.
3. **Controller Validation:** Controllers validate `req.body` and `req.params` against strict Zod schemas, returning `400 Bad Request` with structured error messages upon failure.
4. **Service Execution:** Services enforce RBAC (verifying membership and role hierarchy), execute Prisma queries inside `$transaction` blocks where necessary, and record domain activity logs.
5. **Standardized Response:** Success returns `{ success: true, data: ... }`; errors are handled by centralized error middleware returning `{ success: false, message: ... }`.

---

## 5. Security Architecture & RBAC Matrix

### 5.1 Role Hierarchy
| Action | OWNER | ADMIN | MEMBER | Non-Member |
|---|---|---|---|---|
| View Project, Issues, Board, Activity | ✅ | ✅ | ✅ | ❌ |
| Create Issue | ✅ | ✅ | ✅ | ❌ |
| Update Issue Status / Assignee | ✅ | ✅ | ✅ | ❌ |
| Edit Issue Content | ✅ | ✅ | Author Only | ❌ |
| Delete Issue | ✅ | ✅ | ❌ | ❌ |
| Add Project Member | ✅ | ✅ | ❌ | ❌ |
| Update Member Role (`ADMIN` $\leftrightarrow$ `MEMBER`) | ✅ | ❌ | ❌ | ❌ |
| Remove Member | ✅ | ✅ (non-owner) | ❌ | ❌ |
| Edit Project Settings | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ |

---

## 6. Performance & Scalability Architecture

1. **Composite Database Indexes:**
   - `Issue`: `@@index([projectId, status])`, `@@index([projectId, priority])`, `@@index([projectId, createdAt])`
   - `ActivityLog`: `@@index([projectId])`, `@@index([createdAt])`
2. **Concurrent Aggregations:** Dashboard intelligence queries dispatch via `Promise.all()` to compute status counts, priority distribution, resolution metrics, and workload counts simultaneously without sequential waterfall delays.
3. **Connection Pooling:** Prisma utilizes PostgreSQL pool configurations tailored for serverless and containerized deployment environments.
