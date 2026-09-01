# TrackFlow Technical Interview Guide & Architecture Q&As

This guide prepares engineers to speak confidently and thoroughly about TrackFlow's architectural decisions, tradeoffs, data modeling, concurrency, and security.

---

## 1. System Design & Architectural Highlights

### Project Overview
TrackFlow is a lightweight issue tracking and project intelligence platform for small agile teams. Unlike bloated legacy platforms, TrackFlow centers on delivery intelligence—calculating cycle resolution velocity, team workload balance, and real-time audit streams while preserving a snappy, responsive developer experience.

### Key Architectural Strengths
1. **Separation of Concerns:** Unidirectional data flow from presentation (React/Tailwind) through API gateway (Express/Zod) to domain services (RBAC rules) down to relational persistence (Prisma/PostgreSQL).
2. **Deterministic RBAC:** Role hierarchy (`OWNER` > `ADMIN` > `MEMBER`) strictly validated on every server-side transaction. Client-submitted identities are ignored in favor of verified JWT signatures.
3. **High-Performance Aggregations:** Intelligence metrics aggregate concurrently via `Promise.all()` using database `groupBy` and count queries backed by composite indexes.
4. **Resilient Dual-Auth Strategy:** HTTP-only cookies paired with Bearer token authorization header fallbacks to support modern browsers with partitioned third-party cookies.

---

## 2. 25+ Technical Interview Questions & Model Answers

### Architecture & System Design

#### Q1: Walk me through the high-level architecture of TrackFlow.
> **Answer:** TrackFlow follows a modern client-server architecture. The frontend is a React 19 Single Page Application bundled with Vite, styled with Tailwind CSS and Radix UI primitives, using TanStack Query v5 for asynchronous server state management. The backend is an Express 5 REST API organized strictly into Routes $\rightarrow$ Middlewares $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Prisma ORM. Neon Serverless PostgreSQL serves as the persistent relational database. Requests flow through security headers, rate limiting, and JWT authentication before controllers validate input with Zod and services enforce RBAC rules within atomic database transactions.

#### Q2: Why did you choose TanStack Query for frontend state management instead of Redux?
> **Answer:** In issue tracking applications, the vast majority of state is *server state* (cached remote data) rather than *client UI state*. TanStack Query provides out-of-the-box caching, background revalidation, stale-time controls, request deduplication, and surgical cache invalidation. Using Redux would have required writing substantial boilerplate (actions, reducers, thunks, normalized state shapes) to achieve what TanStack Query manages declaratively with query keys like `['issues', projectId]`. For local state (active modals, form inputs), React component state and Context API are sufficient and much simpler.

#### Q3: How does the request lifecycle work from a user clicking "Move to Done" on the Kanban board to database update?
> **Answer:**
> 1. The user clicks "Done" on the Kanban card, triggering a React Query mutation (`useUpdateIssueStatus`).
> 2. Axios sends a `PATCH /api/issues/:issueId/status` request with `{ status: "DONE" }`, accompanied by the JWT token in headers/cookies.
> 3. Express middleware verifies the JWT, injects `req.user`, and passes to `issue.controller.js`.
> 4. The controller validates the body using Zod schema `updateIssueStatusSchema`.
> 5. `issue.service.js` checks if the user is a member of the issue's project.
> 6. Inside a Prisma `$transaction`, it updates the issue status, automatically sets `resolvedAt: new Date()`, and records an `ActivityLog` entry with `action: 'STATUS_CHANGED'` and `projectId`.
> 7. The API returns `200 OK` with updated issue data.
> 8. The frontend mutation `onSuccess` triggers invalidation of `['issues', projectId]`, `['dashboard', projectId]`, and `['activity', projectId]`, updating the board, metrics cards, and activity timeline immediately.

---

### Database & Data Modeling

#### Q4: Explain the data model and entity relationships.
> **Answer:** We have 6 core relational models:
> - `User`: Developer accounts with credentials and timestamps.
> - `Project`: Workspace projects created by users (`createdById`).
> - `ProjectMember`: Join table with composite uniqueness `@@unique([userId, projectId])` storing member roles (`OWNER`, `ADMIN`, `MEMBER`).
> - `Issue`: Scoped to a project, reported by a user, optionally assigned to a member, with status, priority, due date, `resolvedAt`, and `tags String[]`.
> - `Comment`: Discussion items associated with an issue and authored by a user.
> - `ActivityLog`: Audit trail entries linked to `projectId` and `userId` with JSON metadata for action details.

#### Q5: What database indexes did you add and why?
> **Answer:** We added targeted composite indexes to support the most frequent query patterns:
> - `Issue @@index([projectId, status])`: Speeds up Kanban column population and dashboard status counts.
> - `Issue @@index([projectId, priority])`: Accelerates priority distribution chart aggregations and filtering.
> - `Issue @@index([projectId, createdAt])`: Optimizes recent issues queries.
> - `ActivityLog @@index([projectId])` and `@@index([createdAt])`: Speeds up project activity feed retrieval in reverse chronological order.

#### Q6: How is Average Resolution Time calculated?
> **Answer:** When an issue transitions to `DONE`, `issue.service.js` sets `resolvedAt = new Date()`. In `dashboard.service.js`, we query all completed issues for the project that possess both `createdAt` and `resolvedAt`. We sum the duration in milliseconds `(resolvedAt - createdAt)`, divide by the count, and convert to hours rounded to one decimal place.

---

### Authentication, Security & RBAC

#### Q7: How is authentication implemented, and why did you use a dual-token strategy?
> **Answer:** User authentication uses signed JSON Web Tokens (JWT) containing the user's `id` and `email` with a 7-day expiration. Passwords are salted and hashed using `bcrypt` (10 rounds). On successful login/signup, the token is set in an `httpOnly`, `sameSite: 'lax'`, `secure` (in production) cookie AND returned in the JSON payload. This dual-delivery strategy allows standard browser cookie auth while enabling Axios request interceptors to attach `Authorization: Bearer <token>`, ensuring reliability across subdomains, mobile clients, and third-party partitioned cookie restrictions.

#### Q8: How is Role-Based Access Control (RBAC) enforced?
> **Answer:** We enforce RBAC at the service layer on every database operation. For any project action, we query the `ProjectMember` table for `(userId, projectId)`. If no record exists and the user is not the project creator, access is denied with a `403 Forbidden`. If a record exists, we check the role:
> - `OWNER`: Can delete project, modify member roles, remove members.
> - `ADMIN`: Can add members, remove non-owners, delete issues.
> - `MEMBER`: Can create issues, update issue status/priority, assign issues, comment, and edit own authored content.

#### Q9: How do you prevent Horizontal Privilege Escalation (Insecure Direct Object Reference - IDOR)?
> **Answer:** We never trust IDs passed in request bodies or query parameters alone. When a user requests an issue or comment by ID (e.g. `PATCH /api/issues/:issueId/status`), the service fetches the issue, inspects its `projectId`, and verifies that the authenticated user (`req.user.id`) is a member of that project. Non-members cannot view or modify data even if they guess valid UUIDs.

---

### Performance & Scalability

#### Q10: How did you optimize the Project Intelligence Dashboard to prevent N+1 query bottlenecks?
> **Answer:** A naive dashboard implementation might query the project, then iterate through each member to query their issues sequentially. Instead, we use concurrent batching with `Promise.all()` to dispatch parallel queries:
> 1. Issue status counts (`prisma.issue.groupBy({ by: ['status'], where: { projectId } })`)
> 2. Priority counts (`prisma.issue.groupBy({ by: ['priority'], where: { projectId } })`)
> 3. Resolved issues with duration fields
> 4. Overdue and stale issues counts
> 5. Member workload using member-joined queries
> 6. Recent activity timeline
> 
> All aggregations execute in a single round-trip pool cycle in under 50ms.

#### Q11: How do you handle race conditions or concurrent modifications?
> **Answer:** For operations that affect multiple tables—such as creating an issue and recording its activity log, or updating a status and writing a transition record—we wrap operations in Prisma's `$transaction([ ... ])`. If any operation fails, the entire transaction rolls back, preserving data integrity.

---

### Frontend & User Experience

#### Q12: How is the Kanban Board designed and optimized?
> **Answer:** The Kanban board is organized into 3 columns (`TODO`, `IN_PROGRESS`, `DONE`). We maintain active search and priority filter state in React, allowing instant client-side filtering across the loaded issues. Moving a card triggers an optimistic UI update or immediate mutation call to `/api/issues/:issueId/status`, which invalidates the issue cache and smoothly transitions the card across columns without page reloads.

#### Q13: How are form validations handled across the stack?
> **Answer:** We use Zod schemas on both frontend and backend for end-to-end type safety and validation parity:
> - On the frontend, React Hook Form integrates with `@hookform/resolvers/zod` to validate user inputs instantly with accessible error messages before submitting.
> - On the backend, Express controllers validate the parsed payload against server Zod schemas before passing validated data to the service layer.

---

### Engineering Decisions & Tradeoffs

#### Q14: Why did you keep a monolithic backend instead of microservices?
> **Answer:** For a team productivity and intelligence platform of this scale, a clean modular monolith is far superior to microservices. It eliminates distributed transaction complexity, network serialization overhead, service mesh latency, and deployment friction. The codebase maintains strict modularity via Route $\rightarrow$ Controller $\rightarrow$ Service layers, making future service extraction trivial if specific modules (like real-time notification workers) ever require independent scaling.

#### Q15: What automated tests did you implement and why?
> **Answer:** We implemented a 14-test end-to-end integration test suite using Node.js native `node:test` and `node:assert`. It tests the actual Express server over HTTP, verifying signup, duplicate email rejection, login, token authentication, project creation, member invites, RBAC role updates, issue creation with tags, `resolvedAt` calculation on status changes, comments, dashboard aggregations, activity streams, and session logout. Running against real database transactions provides maximum confidence with zero external testing framework dependencies.
