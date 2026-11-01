<div align="center">

![TrackFlow Banner](docs/assets/trackflow-banner.svg)

# TrackFlow

### Issue Tracking &amp; Project Intelligence Platform

**A full-stack engineering workspace that helps development teams organize issues, collaborate efficiently, and understand delivery velocity through actionable analytics.**

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=white&style=flat-square)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white&style=flat-square)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white&style=flat-square)](https://www.prisma.io/)
[![Microsoft Azure](https://img.shields.io/badge/Microsoft_Azure-Ubuntu_24.04-0078D4?logo=microsoftazure&logoColor=white&style=flat-square)](https://azure.microsoft.com/)
[![Deployment Status](https://img.shields.io/badge/Deployment-Operational-10B981?style=flat-square)](https://apidash-7f29a6.centralindia.cloudapp.azure.com/trackflow/)

[🚀 View Live Application](https://apidash-7f29a6.centralindia.cloudapp.azure.com/trackflow/) • [🩺 API Health Status](https://apidash-7f29a6.centralindia.cloudapp.azure.com/trackflow/api/health) • [📐 Architecture Specification](docs/architecture.md)

</div>

---

## 📋 Table of Contents

- [Product Overview](#-product-overview)
- [Live Deployment](#-live-deployment)
- [Visual Showcase &amp; Screenshots](#-visual-showcase--screenshots)
- [Core Feature Matrix](#-core-feature-matrix)
- [System Architecture](#-system-architecture)
- [Security &amp; Engineering Practices](#-security--engineering-practices)
- [Performance Benchmarks](#-performance-benchmarks)
- [Automated Testing &amp; Verification](#-automated-testing--verification)
- [Local Development Setup](#-local-development-setup)
- [REST API Reference](#-rest-api-reference)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 💡 Product Overview

Modern software development teams frequently face a tradeoff: enterprise issue trackers that are bloated, slow, and overly complex, or lightweight tools that lack team analytics and role-based security.

**TrackFlow** resolves this balance by pairing an uncluttered, developer-centric issue tracking experience with an automated **Project Intelligence Engine**:

- **Streamlined Workflow:** Manage issues with status workflows, priority tiers, assignees, deadline tracking, and an interactive Kanban board.
- **Project Intelligence:** Instead of manual reporting, the dashboard continuously calculates completion velocity, average cycle resolution times, overdue risk factors, and member workload distribution.
- **Granular RBAC:** Isolated multi-project collaboration with strict role-based permissions (`OWNER`, `ADMIN`, `MEMBER`).
- **Production-Grade Reliability:** Engineered as an isolated multi-tier system with client route splitting, targeted composite database indexing, and automated audit logging.

---

## 🌐 Live Deployment

TrackFlow is deployed to an Ubuntu 24.04 LTS host on Microsoft Azure running behind an Nginx reverse proxy with automated Let's Encrypt TLS:

- **Web Application:** [https://apidash-7f29a6.centralindia.cloudapp.azure.com/trackflow/](https://apidash-7f29a6.centralindia.cloudapp.azure.com/trackflow/)
- **REST API Health Check:** [https://apidash-7f29a6.centralindia.cloudapp.azure.com/trackflow/api/health](https://apidash-7f29a6.centralindia.cloudapp.azure.com/trackflow/api/health)
- **Deployment Topology:** Static React production assets served via Nginx with HTTP/2 and 1-year immutable caching; Express 5 API supervised by systemd listening strictly on loopback (`127.0.0.1`); Neon Serverless PostgreSQL with SSL over AWS us-east-2.

---

## 📸 Visual Showcase & Screenshots

All screenshots below represent the authentic, live TrackFlow web application running in production with realistic engineering project data.

### 1. Delivery Intelligence & Analytics
| Project Intelligence Dashboard | Kanban Delivery Board |
| :---: | :---: |
| ![Project Intelligence Dashboard](docs/screenshots/dashboard.png) | ![Kanban Board](docs/screenshots/kanban.png) |
| *Real-time completion percentage, average resolution hours, priority breakdown, and workload allocation per teammate.* | *3-column visual status board with instant state transitions, priority badges, and quick-issue creation.* |

### 2. Issue Tracking & Deep Context
| Global Issue Explorer | Issue Details & Discussion Thread |
| :---: | :---: |
| ![Issues Table](docs/screenshots/issues.png) | ![Issue Details](docs/screenshots/issue-details.png) |
| *Filterable issue table supporting debounced full-text search, multi-attribute filtering, and inline status updates.* | *Granular issue context, markdown descriptions, historical activity timeline, and collaborator discussion comments.* |

### 3. Project Workspace & Developer Identity
| Workspace Project Navigator | Developer Profile & Statistics |
| :---: | :---: |
| ![Projects List](docs/screenshots/projects.png) | ![Developer Profile](docs/screenshots/profile.png) |
| *Multi-project catalog displaying owner attribution, issue counts, and membership credentials.* | *Aggregated individual engineering output, assigned workload metrics, and account credentials.* |

---

## ✨ Core Feature Matrix

| Feature Domain | Capabilities | Engineering Implementation |
| :--- | :--- | :--- |
| **Authentication &amp; Session** | Secure user registration, credential login, session persistence, and logout. | Salted bcrypt hashing (10 rounds), stateless JWT, scoped HTTP-only cookies (`SameSite=Lax`, `Secure`). |
| **Project Workspaces** | Create projects, view workspace rosters, and configure project details. | Unidirectional ownership, UUID primary keys, cascade deletion protection. |
| **Role-Based Access (RBAC)** | `OWNER`, `ADMIN`, and `MEMBER` tiered permission enforcement. | Project-specific membership table (`ProjectMember`) with composite unique constraints and database-level validation. |
| **Issue Management** | Create, update, tag, prioritize, assign, and resolve development issues. | Enum-validated priorities and statuses, auto-calculated `resolvedAt` timestamps, tag array indexing. |
| **Kanban Board** | Visual status progression across `To Do`, `In Progress`, and `Done`. | Reactive card updates via TanStack Query mutations with optimistic cache synchronization. |
| **Discussion Threads** | Issue-level comments with timestamped author attribution. | Relational `Comment` entity with author-scoped edit/delete verification. |
| **Activity Audit Trail** | Chronological, immutable record of project mutations and state changes. | Event-driven activity logger executing within atomic Prisma `$transaction` blocks. |
| **Project Intelligence** | Real-time cycle time calculation, completion rate, overdue alerts, and workload distribution. | Concurrent database aggregations (`Promise.all`) utilizing PostgreSQL `COUNT`, `AVG`, and `GROUP BY`. |

---

## 🏛️ System Architecture

TrackFlow separates concerns across a modern, decoupled stack. Detailed diagrams, sequence lifecycles, and relational database schemas are documented in the [Architecture Specification](docs/architecture.md).

```mermaid
graph TD
    Client["Web Browser<br/>(React 19 SPA)"]
    
    subgraph IngressTier["Ingress &amp; Routing (Azure VM)"]
        Nginx["Nginx Reverse Proxy (Port 443 TLS)"]
        Nginx -->|"Path: /trackflow/assets/*"| StaticDist["Hashed Static Assets (Vite Dist)"]
        Nginx -->|"Path: /trackflow/api/*"| ReverseProxy["Loopback Reverse Proxy (127.0.0.1:5001)"]
    end

    subgraph ServiceTier["Backend Application Service"]
        Express["Express 5 REST Gateway"]
        Middleware["Security, CORS &amp; Auth Middleware"]
        Controllers["Zod Input Validation Controllers"]
        Services["RBAC &amp; Domain Business Services"]
        Prisma["Prisma ORM 6 ($transaction Engine)"]

        ReverseProxy --> Express
        Express --> Middleware --> Controllers --> Services --> Prisma
    end

    subgraph DatabaseTier["Managed Relational Cloud"]
        NeonDB[("Neon Serverless PostgreSQL<br/>(AWS us-east-2, SSL Required)")]
        Prisma -->|"Encrypted SQL Pool"| NeonDB
    end

    Client -->|"HTTPS /trackflow/"| Nginx
```

For comprehensive deep dives into the frontend component hierarchy, request lifecycles, authentication flows, and ER diagrams, visit [docs/architecture.md](docs/architecture.md).

---

## 🔒 Security & Engineering Practices

- **Strict Identity Derivation:** Client-submitted `userId` parameters in request bodies are ignored. User identity is derived exclusively from cryptographically verified JWT claims in the authentication middleware.
- **Role-Based Access Control (RBAC):** Every mutating API operation verifies that the authenticated user is an active member of the target project and holds sufficient privileges (`OWNER` or `ADMIN` for administrative actions).
- **Partitioned Cookie Scoping:** Authentication cookies use `Path=/trackflow; HttpOnly; Secure; SameSite=Lax`, guaranteeing session isolation from other applications hosted on the same domain.
- **Input Sanitization & Schema Validation:** Both frontend forms and backend controllers enforce strict Zod schemas, returning detailed validation feedback before execution.
- **Atomic Operations:** Multi-entity operations (e.g. creating an issue and writing to the activity audit log) execute inside atomic `prisma.$transaction()` blocks to prevent orphan records.
- **Defensive Production Headers:** Automated injection of `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and HTTP Strict Transport Security (`HSTS`).

---

## ⚡ Performance Benchmarks

The application underwent rigorous bundle optimization, code splitting, and database query tuning:

- **Initial JavaScript Entry Chunk:** `242.68 kB` (`74.73 kB` gzipped).
- **Core CSS Bundle:** `74.48 kB` (`13.27 kB` gzipped).
- **Route Code Splitting:** Asynchronous dynamic imports (`React.lazy` + `Suspense`) for every top-level view ensure users only download the code needed for their active view.
- **Database Index Optimization:** Added composite indexes on `(projectId, status)`, `(projectId, priority)`, `(projectId, assigneeId)`, and `(projectId, createdAt)` to eliminate full-table scans during dashboard and issue filtering.
- **Debounced Search:** Workspace search filters execute with a 300 ms debounce window to avoid unnecessary API roundtrips.

---

## 🧪 Automated Testing & Verification

TrackFlow contains automated integration and security test suites using the Node.js native test runner (`node:test`, `node:assert`).

```bash
# 1. Run Backend Integration Test Suite (18 tests)
cd server
npm test

# 2. Run Comprehensive Security & Negative Authorization Test Suite (26 tests)
node --test tests/security.test.js

# 3. Verify Frontend Code Quality & Linting
cd ../client
npm run lint

# 4. Verify Production Build & Asset Tree
npm run build

# 5. Validate Prisma Schema Consistency
cd ../server
npx prisma validate
```

### Verified Test Results

```
✔ SYS-01: GET /api/health returns { status: "ok" }
✔ AUTH: User signup, password policies, duplicate rejection, and session recovery
✔ RBAC: Multi-tier role authorization (Owner, Admin, Member, Outsider rejection)
✔ ISSUES: Lifecycle transitions, cycle time calculation, and tag management
✔ DASHBOARD: Multi-metric concurrent aggregation and workload distribution
✔ 44 Total Passing Tests across Integration & Security Suites (0 Failures)
✔ 0 Oxlint Errors / 0 Warnings across 82 frontend source files
```

---

## 💻 Local Development Setup

Follow these steps to run TrackFlow locally on your development machine.

### Prerequisites

- **Node.js:** v18.x or v20.x or higher
- **npm:** v9.x or higher
- **PostgreSQL Database:** A local PostgreSQL instance or a free cloud database (e.g., [Neon](https://neon.tech), Supabase).
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/ritesh0w0/TrackFlow.git
cd TrackFlow
```

---

### Step 2: Configure the Backend (`server`)

1. Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create your local environment file:
   ```bash
   cp .env.example .env
   ```

3. Open `server/.env` and supply your database connection and a JWT secret:
   ```env
   PORT=3000
   HOST=127.0.0.1
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trackflow_dev?schema=public"
   JWT_SECRET="replace_with_a_secure_random_64_character_hex_string"
   CLIENT_URL=http://localhost:5173
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```
   *(Tip: Generate a secure secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)*

4. Initialize database schema and generate Prisma client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. *(Optional)* Seed realistic demo projects, team members, and issues:
   ```bash
   node prisma/seed.js
   ```

6. Start the Express development server:
   ```bash
   npm run dev
   # API runs on http://127.0.0.1:3000
   ```

---

### Step 3: Configure the Frontend (`client`)

1. In a separate terminal, navigate to the `client` directory:
   ```bash
   cd client
   npm install
   ```

2. Create your local environment file:
   ```bash
   cp .env.example .env.development
   ```

3. Verify `client/.env.development` points to your local backend:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   # Web app available at http://localhost:5173
   ```

5. Open your browser and navigate to **`http://localhost:5173`**.

---

## 📡 REST API Reference

All protected endpoints require an authenticated session (via HTTP-only cookie or `Authorization: Bearer <token>`).

| Method | Endpoint | Description | Access Tier |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | Public |
| `POST` | `/api/auth/signup` | Register a new developer account | Public |
| `POST` | `/api/auth/login` | Authenticate with credentials | Public |
| `POST` | `/api/auth/logout` | Terminate active session cookie | Authenticated |
| `GET` | `/api/auth/me` | Fetch active session claims | Authenticated |
| `GET` | `/api/auth/profile` | Retrieve user profile &amp; aggregated stats | Authenticated |
| `PUT` | `/api/auth/profile` | Update display name | Authenticated |
| `GET` | `/api/projects` | List projects where user holds membership | Authenticated |
| `POST` | `/api/projects` | Create a new project (Creator = `OWNER`) | Authenticated |
| `GET` | `/api/projects/:id` | Fetch project details &amp; metadata | Project Member |
| `GET` | `/api/projects/:id/dashboard` | Fetch Project Intelligence metrics | Project Member |
| `GET` | `/api/projects/:id/issues` | Filtered issue list for project | Project Member |
| `POST` | `/api/projects/:id/issues` | Create new issue in project | Project Member |
| `GET` | `/api/projects/:id/members` | Retrieve collaborator roster | Project Member |
| `POST` | `/api/projects/:id/members` | Invite teammate (`ADMIN` or `MEMBER`) | Owner / Admin |
| `GET` | `/api/projects/:id/activity` | Stream chronological activity trail | Project Member |
| `GET` | `/api/issues` | Workspace-wide cross-project issue search | Authenticated |
| `GET` | `/api/issues/:id` | Fetch single issue details &amp; comments | Project Member |
| `PATCH` | `/api/issues/:id/status` | Update issue state (`TODO`, `IN_PROGRESS`, `DONE`) | Project Member |
| `PATCH` | `/api/issues/:id/priority` | Update priority tier | Project Member |
| `DELETE` | `/api/issues/:id` | Delete issue record | Owner / Admin |
| `POST` | `/api/issues/:id/comments` | Post comment to discussion thread | Project Member |

---

## 🔧 Troubleshooting

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **"Network Error" on Signup / Login** | Local backend server on port 3000 is not running, or frontend is targeting an incorrect API URL. | Verify backend is active on `http://127.0.0.1:3000` via `curl http://127.0.0.1:3000/api/health`. In production, ensure the request is dispatched to `/trackflow/api`. |
| **Prisma Engine Initialization Error** | Prisma Client binary has not been compiled for the target operating system. | Run `npx prisma generate` in the `server` directory. |
| **CORS Rejected in Browser** | Client origin is missing from backend `ALLOWED_ORIGINS` configuration. | Add client origin (e.g. `http://localhost:5173`) to `server/.env`. |
| **Database Connection Timeout** | PostgreSQL connection string is invalid, or SSL requirement is missing for cloud databases. | Ensure your `DATABASE_URL` contains `?sslmode=require` when using Neon or cloud-hosted PostgreSQL providers. |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

<div align="center">
  <sub>Built with care for agile engineering teams. © 2026 TrackFlow.</sub>
</div>
