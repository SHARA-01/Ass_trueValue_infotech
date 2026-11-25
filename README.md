# Support Ticket Management System

A full-stack Mini Helpdesk & Support Ticket Management System built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, **React**, **Vite**, and **Tailwind CSS**.

---

## Key Features

### Authentication & Role-Based Access Control
- User registration and login with **bcrypt** password hashing and **JWT** authentication (`7d` expiry).
- Two distinct roles: **`user`** (Submitter) and **`admin`** (Helpdesk Administrator).
- Route-level and service-level authorization guards (`authenticate`, `requireAdmin`, ownership verification).

### Ticket Management (User)
- Create support tickets with **Title**, **Description**, **Category** (`Technical Support`, `Billing`, `General Enquiry`, `Bug Report`, `Feature Request`), and **Priority** (`Low`, `Medium`, `High`, `Critical`).
- View personal tickets with **search**, **pagination**, **sorting**, and **filtering** by status, priority, or category.
- Edit own ticket details and delete own tickets (restricted to `Open` tickets).
- Track ticket lifecycle status (`Open` → `In-Progress` → `On-Hold` → `Resolved` → `Closed`).

### Admin Management
- View all tickets across all users with search, filtering (status, priority, category), sorting, and pagination.
- Update ticket **Status** and **Priority**.
- Admin Dashboard with live ticket statistics aggregated by Status, Priority, and Category.

### Comments & Event-Driven Activity Log
- Users can comment on their own tickets; Admins can respond to any ticket.
- Built-in Node.js **`EventEmitter`** event bus emits domain events (`ticket.created`, `ticket.updated`, `ticket.status_changed`, `comment.added`, `ticket.resolved`) handled asynchronously by the **ActivityLog** handler and visible on each ticket's Activity Timeline.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express, TypeScript, Mongoose, Zod, bcryptjs, jsonwebtoken, Vitest |
| **Database** | MongoDB |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Axios, Lucide Icons |

---

## Architecture & Implementation Decisions

### 1. Layered Backend Architecture (Deep Modules)
```
Routes → Middleware (Auth / Role / Zod) → Controllers → Services → Repositories → Mongoose Models
                                                           ↓
                                                EventBus (EventEmitter) → ActivityLog Handler
```
- **Services as Deep Modules:** All business rules (ownership enforcement, `Open`-only deletion, event emission, role authorization) live exclusively in the Service layer (`backend/src/services/`), keeping Controllers and Repositories thin and testable.
- **Repository Seam:** Mongoose documents are converted to plain TypeScript objects inside repositories so database internals never leak into business logic.
- **Validation Seam:** Zod schemas validate incoming request bodies in middleware (`validate.middleware.ts`) before reaching controllers, returning structured `400` field errors.

### 2. Event-Driven Workflow
- `backend/src/events/eventBus.ts` exposes a singleton `EventEmitter`.
- Services emit domain events without coupling directly to audit persistence.
- `backend/src/events/handlers/activityLog.handler.ts` subscribes to all domain events at app startup and persists `ActivityLog` documents asynchronously.

### 3. Database Design
See [`CONTEXT.md`](./CONTEXT.md) for the full domain glossary and entity relationships:
- **`User`**: `name`, `email` (unique, indexed), `passwordHash`, `role` (`user | admin`), `createdAt`.
- **`Ticket`**: `title`, `description`, `category`, `priority`, `status`, `submitterId` (ref `User`), `createdAt`, `updatedAt`.
- **`Comment`**: `ticketId` (ref `Ticket`), `authorId` (ref `User`), `body`, `createdAt`. Stored in a **referenced collection** rather than embedded subdocuments so comments scale independently without hitting MongoDB's 16 MB document limit and support clean pagination/sorting.
- **`ActivityLog`**: `event`, `actorId` (ref `User`), `ticketId` (ref `Ticket`), `metadata`, `createdAt`. Append-only audit trail.

---

## Project Structure

```
support-ticket-management/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # Thin HTTP adapters
│   │   ├── events/          # EventEmitter bus & ActivityLog handler
│   │   ├── middleware/      # JWT auth, admin guard, Zod validator
│   │   ├── models/          # Mongoose schemas
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express route definitions
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── services/        # Core business logic
│   │   ├── types/           # Shared TypeScript interfaces
│   │   ├── utils/           # AppError, filter parser
│   │   ├── app.ts           # Express app configuration
│   │   └── server.ts        # Entry point
│   ├── tests/               # Vitest unit tests for services
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + JWT interceptor
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # AuthContext
│   │   ├── hooks/           # Custom data hooks
│   │   ├── pages/           # User & Admin pages
│   │   └── types/           # Frontend TypeScript types
│   ├── .env.example
│   └── package.json
├── docs/
│   └── postman-collection.json
├── CONTEXT.md
└── package.json
```

---

## Setup & Running Locally

### Prerequisites
- **Node.js** >= 18
- **MongoDB** (local instance or MongoDB Atlas URI)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "support ticket management"

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):** Copy `backend/.env.example` to `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/support_tickets
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):** Copy `frontend/.env.example` to `frontend/.env` (optional — defaults to `http://localhost:5000/api`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers
Open two terminals:
```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 4. Run Tests & Type Checks
```bash
# Backend unit tests (Vitest)
cd backend && npm test

# Backend TypeScript build
cd backend && npm run build

# Frontend production build
cd frontend && npm run build
```

---

## REST API Overview

Import [`docs/postman-collection.json`](./docs/postman-collection.json) into Postman for ready-to-run requests.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health check |
| `POST` | `/api/auth/register` | Public | Register a new User or Admin |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |
| `POST` | `/api/tickets` | Authenticated | Create a support ticket |
| `GET` | `/api/tickets` | Authenticated | List own tickets (search, filter, sort, paginate) |
| `GET` | `/api/tickets/:id` | Owner / Admin | Get ticket details |
| `PATCH` | `/api/tickets/:id` | Owner | Edit own ticket details |
| `DELETE` | `/api/tickets/:id` | Owner | Delete own ticket (`Open` status only) |
| `GET` | `/api/tickets/:id/activity` | Owner / Admin | Get ticket event activity log |
| `POST` | `/api/tickets/:id/comments` | Owner / Admin | Add a comment to a ticket |
| `GET` | `/api/tickets/:id/comments` | Owner / Admin | List comments on a ticket |
| `GET` | `/api/admin/tickets` | Admin | List all tickets (search, filter, sort, paginate) |
| `PATCH` | `/api/admin/tickets/:id/status` | Admin | Update ticket status |
| `PATCH` | `/api/admin/tickets/:id/priority` | Admin | Update ticket priority |
| `GET` | `/api/admin/stats` | Admin | Get aggregated ticket statistics |
