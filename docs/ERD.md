# TrackFlow Database Schema & ERD

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    User {
        String id PK "uuid"
        String email UK
        String password
        String name
        DateTime createdAt
        DateTime updatedAt
    }

    Project {
        String id PK "uuid"
        String title
        String description
        String createdById FK
        DateTime createdAt
        DateTime updatedAt
    }

    ProjectMember {
        String id PK "uuid"
        String userId FK
        String projectId FK
        ProjectRole role "OWNER | ADMIN | MEMBER"
        DateTime joinedAt
    }

    Issue {
        String id PK "uuid"
        String title
        String description
        IssueStatus status "TODO | IN_PROGRESS | DONE"
        Priority priority "LOW | MEDIUM | HIGH | CRITICAL"
        DateTime dueDate
        DateTime resolvedAt
        String[] tags
        String projectId FK
        String reporterId FK
        String assigneeId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Comment {
        String id PK "uuid"
        String content
        String issueId FK
        String authorId FK
        DateTime createdAt
        DateTime updatedAt
    }

    ActivityLog {
        String id PK "uuid"
        String action
        String entityType
        String entityId
        String projectId FK
        Json metadata
        String userId FK
        DateTime createdAt
    }

    User ||--o{ Project : "createdProjects"
    User ||--o{ ProjectMember : "memberships"
    User ||--o{ Issue : "reportedIssues"
    User ||--o{ Issue : "assignedIssues"
    User ||--o{ Comment : "authoredComments"
    User ||--o{ ActivityLog : "performedLogs"

    Project ||--|{ ProjectMember : "members"
    Project ||--o{ Issue : "issues"
    Project ||--o{ ActivityLog : "activityLogs"

    Issue ||--o{ Comment : "comments"
```

---

## 2. Enums

### `ProjectRole`
- `OWNER`: Creator or root administrator with full privileges.
- `ADMIN`: Project manager with collaborator and issue administration rights.
- `MEMBER`: Standard team collaborator.

### `IssueStatus`
- `TODO`: Pending backlog task.
- `IN_PROGRESS`: Actively underway.
- `DONE`: Completed / Resolved.

### `Priority`
- `LOW`: Low severity / nice-to-have.
- `MEDIUM`: Standard sprint task.
- `HIGH`: Major feature or blocking bug.
- `CRITICAL`: Urgent blocker or security vulnerability.

---

## 3. Database Indexes & Performance Optimizations

```prisma
// Issue composite indexes for high-frequency dashboard and filtering queries:
@@index([projectId, status])
@@index([projectId, priority])
@@index([projectId, createdAt])

// ActivityLog indexes for fast timeline retrieval:
@@index([projectId])
@@index([createdAt])

// ProjectMember composite uniqueness constraint:
@@unique([userId, projectId])
```
