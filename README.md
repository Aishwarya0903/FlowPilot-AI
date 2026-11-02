# FlowPilot AI — Enterprise Workflow Automation Platform

FlowPilot AI is a full-stack enterprise workflow automation platform inspired by Jira, Monday.com, Power Automate, and ServiceNow, with AI-assisted workflow recommendations layered on top. Organizations create multi-stage approval workflows, route them through managers, track progress on a live dashboard, and get AI suggestions on step design, approver selection, and bottleneck risk.

Built as a portfolio-grade reference implementation of a production-style React + Spring Boot enterprise application.

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)

---

## Architecture

```
┌──────────────────┐        HTTPS/JSON        ┌───────────────────────┐        JDBC        ┌──────────────┐
│   React SPA       │ ───────────────────────▶ │   Spring Boot API      │ ──────────────────▶ │  PostgreSQL   │
│  (Redux Toolkit)  │ ◀─────────────────────── │  (Security + JWT)      │ ◀────────────────── │               │
└──────────────────┘                            └───────────┬───────────┘                     └──────────────┘
                                                              │
                                                              ▼
                                                    ┌───────────────────┐
                                                    │  AI Provider layer │
                                                    │  Mock  |  Gemini   │
                                                    └───────────────────┘
```

The backend follows a strict layered architecture (`controller → service → repository → entity`) with DTOs at every boundary, a global exception handler, and a pluggable AI provider interface so the LLM backend can be swapped without touching business logic.

## Features

**Authentication & Authorization**
- Register / Login with JWT access tokens
- Role-based access control: `EMPLOYEE`, `MANAGER`, `ADMIN`

**Workflow Management**
- Create, edit, archive, and delete workflows
- Each workflow carries title, description, department, priority, due date, owner, and an ordered approval chain

**Approval Engine**
- Sequential multi-stage approvals
- Managers can Approve / Reject / Send Back
- Employees see live status and receive notifications at every transition

**Dashboard**
- Total / pending / completed / rejected workflow counts
- Approval rate
- Status and department breakdown charts (Recharts)
- Recent activity feed (backed by the audit log)

**Search, Filter, Sort, Pagination**
- Full workflow search by keyword, status, priority, department, owner
- Server-side pagination and sorting via Spring Data

**Notification Center** — in-app notifications for assignment, approval required, approved, rejected, sent back
**Audit Logs** — every mutating action is recorded with actor, action, entity, and timestamp
**Profile Page**, **Responsive Design**, **Dark Mode**

**AI-Assisted Features** (secondary to the core platform)
- Suggest approval steps for a new workflow
- Recommend approvers from eligible candidates
- Predict bottlenecks in an in-flight workflow
- Generate a plain-language workflow summary
- Explain process improvements

The AI layer is provider-agnostic: `AiProvider` is a Java interface with a deterministic `MockAiProvider` (default, no API key required) and a `GeminiAiProvider` (Google Gemini REST API) — selected at runtime via `app.ai.provider`.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Redux Toolkit, React Router, Axios, Recharts |
| Backend    | Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate, JWT (jjwt) |
| Database   | PostgreSQL 16 |
| AI         | Google Gemini API (pluggable), mock provider fallback |
| Docs       | springdoc-openapi (Swagger UI) |
| DevOps     | Docker, Docker Compose, Azure DevOps Pipelines |

## Folder Structure

```
flowpilot-ai/
├── backend/
│   ├── src/main/java/com/flowpilot/
│   │   ├── config/          # Security, Swagger, ModelMapper config
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Request/response DTOs
│   │   ├── entity/          # JPA entities + enums
│   │   ├── exception/       # Custom exceptions + GlobalExceptionHandler
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT filter, util, UserDetailsService
│   │   └── service/         # Business logic, incl. service/ai provider layer
│   ├── src/main/resources/application.yml
│   ├── src/test/            # JUnit tests (H2 in-memory)
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios client with JWT interceptor
│   │   ├── app/              # Redux store
│   │   ├── components/       # Layout (Sidebar/Navbar) + reusable components
│   │   ├── features/         # Redux slices (auth, workflows, dashboard, notifications, ui)
│   │   ├── pages/             # Route-level pages
│   │   └── routes/            # ProtectedRoute
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/
│   └── schema.sql            # Normalized PostgreSQL schema + seed data
├── docs/
├── docker-compose.yml
├── azure-pipelines.yml
└── README.md
```

## Installation

### Prerequisites
- Java 21, Maven 3.9+
- Node.js 20+, npm
- PostgreSQL 16 (or use Docker Compose — see below)

### Backend
```bash
cd backend
cp src/main/resources/application.yml src/main/resources/application-local.yml  # optional overrides
mvn clean install
mvn spring-boot:run
```
The API starts on `http://localhost:8080`. Swagger UI: `http://localhost:8080/swagger-ui.html`.

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```
The app starts on `http://localhost:3000`.

### Database
Create the database and run the schema manually if not using Docker:
```bash
createdb flowpilot
psql -d flowpilot -f database/schema.sql
```

## Environment Variables

### Backend (`application.yml` / environment)
| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/flowpilot` | JDBC connection string |
| `DB_USERNAME` | `flowpilot_user` | Database user |
| `DB_PASSWORD` | `flowpilot_pass` | Database password |
| `JWT_SECRET` | (dev default, **change in prod**) | Base64 HMAC signing key |
| `JWT_ACCESS_EXP_MS` | `3600000` | Access token TTL (ms) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `AI_PROVIDER` | `mock` | `mock` or `gemini` |
| `GEMINI_API_KEY` | *(empty)* | Required only when `AI_PROVIDER=gemini` |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name |

### Frontend (`.env`)
| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `http://localhost:8080/api` | Backend API base URL |

## Running with Docker

```bash
docker compose up --build
```

This starts:
- `postgres` on `5432` (schema auto-applied from `database/schema.sql`)
- `backend` on `8080`
- `frontend` (nginx) on `3000`

Seeded demo accounts (password for all: `Password123!`):
| Email | Role |
|---|---|
| `admin@flowpilot.ai` | ADMIN |
| `manager@flowpilot.ai` | MANAGER |
| `employee@flowpilot.ai` | EMPLOYEE |

To enable real Gemini AI responses instead of the mock provider:
```bash
AI_PROVIDER=gemini GEMINI_API_KEY=your-key docker compose up --build
```

## API Documentation

Interactive Swagger UI is available once the backend is running: `http://localhost:8080/swagger-ui.html`
Raw OpenAPI spec: `http://localhost:8080/v3/api-docs`

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate, receive JWT |
| GET | `/api/workflows` | Search/filter/paginate workflows |
| POST | `/api/workflows` | Create a workflow |
| GET | `/api/workflows/{id}` | Get workflow details |
| PUT | `/api/workflows/{id}` | Update a workflow |
| PATCH | `/api/workflows/{id}/archive` | Archive a workflow |
| DELETE | `/api/workflows/{id}` | Delete a workflow |
| POST | `/api/workflows/{id}/approval-action` | Approve / reject / send back |
| POST | `/api/workflows/{id}/comments` | Add a comment |
| GET | `/api/dashboard` | Dashboard summary |
| GET | `/api/users` | List users (approver selection) |
| GET | `/api/notifications` | List current user's notifications |
| PATCH | `/api/notifications/{id}/read` | Mark notification as read |
| POST | `/api/ai/suggest-steps` | AI: suggest approval steps |
| GET | `/api/ai/workflows/{id}/predict-bottlenecks` | AI: bottleneck prediction |
| GET | `/api/ai/workflows/{id}/summary` | AI: workflow summary |
| GET | `/api/ai/workflows/{id}/improvements` | AI: improvement suggestions |



## Future Improvements

- Refresh-token rotation and silent re-auth on the frontend
- WebSocket/SSE push for real-time notifications instead of polling
- Parallel (non-sequential) approval steps and conditional branching
- File attachments on workflows and comments
- Admin console for managing departments and users
- E2E test suite (Cypress/Playwright) alongside the existing unit tests
- Real Azure App Service / AKS deployment wired into `azure-pipelines.yml`
- Rate limiting and refresh-token blacklist (Redis) for auth hardening
