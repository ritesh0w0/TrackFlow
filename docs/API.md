# TrackFlow REST API Reference

Base URL: `http://localhost:3000/api` (or production endpoint)

Authentication: Supported via HTTP-Only `token` Cookie or `Authorization: Bearer <token>` Header.

---

## 1. Authentication Endpoints

### `POST /auth/signup`
Creates a new user account and returns JWT session token.
- **Request Body:**
  ```json
  {
    "name": "Jane Developer",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "name": "Jane Developer",
      "email": "jane@example.com",
      "createdAt": "2026-09-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
  ```

### `POST /auth/login`
Authenticates existing credentials.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "name": "Jane Developer",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
  ```

### `GET /auth/me`
Retrieves current authenticated user session profile.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "name": "Jane Developer",
      "email": "jane@example.com"
    }
  }
  ```

### `POST /auth/logout`
Terminates session and clears cookie.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 2. Projects Endpoints

### `GET /projects`
Returns all projects where the authenticated user is a member or owner.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "Core Platform v2",
        "description": "Distributed real-time engine",
        "createdById": "uuid",
        "createdAt": "2026-09-01T12:00:00.000Z",
        "members": [ ... ],
        "_count": { "issues": 12, "members": 3 }
      }
    ]
  }
  ```

### `POST /projects`
Creates a new project and designates creator as `OWNER`.
- **Request Body:**
  ```json
  {
    "title": "Core Platform v2",
    "description": "Distributed real-time engine"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": { "id": "uuid", "title": "Core Platform v2", "description": "..." }
  }
  ```

### `GET /projects/:projectId`
Returns project details by ID with current user's role.

### `PUT /projects/:projectId`
Updates project title or description (Requires `OWNER` or `ADMIN`).

### `DELETE /projects/:projectId`
Deletes project and cascades to issues, comments, and members (Requires `OWNER`).

---

## 3. Project Members Endpoints

### `GET /projects/:projectId/members`
Returns all members of a project with user details and roles.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "role": "OWNER",
        "joinedAt": "2026-09-01T12:00:00.000Z",
        "user": { "id": "uuid", "name": "Jane", "email": "jane@example.com" }
      }
    ]
  }
  ```

### `POST /projects/:projectId/members`
Invites/adds a member by email (Requires `OWNER` or `ADMIN`).
- **Request Body:**
  ```json
  {
    "email": "collab@example.com",
    "role": "MEMBER"
  }
  ```

### `PATCH /projects/:projectId/members/:memberId/role`
Updates a collaborator's role to `ADMIN` or `MEMBER` (Requires `OWNER`).
- **Request Body:**
  ```json
  {
    "role": "ADMIN"
  }
  ```

### `DELETE /projects/:projectId/members/:memberId`
Removes member from project (Requires `OWNER` or `ADMIN`).

---

## 4. Issues Endpoints

### `GET /issues`
Returns workspace-wide issues across all user projects with multi-field search and filters.
- **Query Parameters:** `status`, `priority`, `assigneeId`, `search`, `page`, `limit`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "issues": [ ... ],
    "total": 42,
    "page": 1,
    "pages": 3
  }
  ```

### `GET /projects/:projectId/issues`
Returns issues scoped to a specific project.

### `POST /projects/:projectId/issues`
Creates a new issue inside a project.
- **Request Body:**
  ```json
  {
    "title": "Fix token renewal race condition",
    "description": "Add mutex around refresh endpoint",
    "priority": "HIGH",
    "dueDate": "2026-09-15T00:00:00.000Z",
    "tags": ["security", "auth", "backend"]
  }
  ```

### `GET /issues/:issueId`
Returns complete issue record including comments, assignee, reporter, and project info.

### `PUT /issues/:issueId`
Updates issue title, description, priority, dueDate, or tags.

### `PATCH /issues/:issueId/status`
Transitions issue status (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`). Sets `resolvedAt` automatically on `DONE`.
- **Request Body:**
  ```json
  {
    "status": "DONE"
  }
  ```

### `PATCH /issues/:issueId/priority`
Updates priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

### `PATCH /issues/:issueId/assignee`
Assigns or unassigns issue.
- **Request Body:**
  ```json
  {
    "assigneeId": "uuid-or-null"
  }
  ```

### `DELETE /issues/:issueId`
Deletes issue (Requires `OWNER`, `ADMIN`, or issue `reporter`).

---

## 5. Comments Endpoints

### `GET /issues/:issueId/comments`
Returns chronologically ordered discussion thread for an issue.

### `POST /issues/:issueId/comments`
Creates a comment on an issue.
- **Request Body:**
  ```json
  {
    "content": "Merged into main branch."
  }
  ```

### `PUT /comments/:commentId`
Updates comment text (Author only).

### `DELETE /comments/:commentId`
Deletes comment (Author or `OWNER`/`ADMIN`).

---

## 6. Project Intelligence & Dashboard Endpoints

### `GET /projects/:projectId/dashboard`
Returns calculated metrics, charts distribution, and team workload.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "totalIssues": 15,
        "openIssues": 5,
        "completedIssues": 10,
        "todo": 2,
        "inProgress": 3,
        "done": 10,
        "completion": 67,
        "averageResolutionHours": 14.5,
        "overdueCount": 1,
        "staleCount": 0
      },
      "priority": {
        "LOW": 2,
        "MEDIUM": 6,
        "HIGH": 5,
        "CRITICAL": 2
      },
      "workloadDistribution": [
        {
          "userId": "uuid",
          "name": "Jane",
          "openIssues": 2,
          "completedIssues": 5
        }
      ],
      "recentIssues": [ ... ],
      "recentActivity": [ ... ]
    }
  }
  ```

### `GET /projects/:projectId/activity`
Returns complete chronological activity feed for a project.

---

## 7. System Health Endpoint

### `GET /health`
Returns system status, uptime, and database connectivity.
- **Response `200 OK`:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-01T12:00:00.000Z",
    "uptime": 142.3,
    "database": "connected"
  }
  ```
