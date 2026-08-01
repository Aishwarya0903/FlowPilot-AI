-- ============================================================================
-- FlowPilot AI — PostgreSQL Schema
-- Normalized to 3NF. Matches the JPA entity model in backend/src/main/java.
-- Run automatically by docker-compose (mounted into /docker-entrypoint-initdb.d)
-- ============================================================================

CREATE TABLE departments (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'ADMIN')),
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    enabled       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE workflows (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(150)  NOT NULL,
    description   VARCHAR(2000),
    department_id BIGINT        NOT NULL REFERENCES departments(id),
    owner_id      BIGINT        NOT NULL REFERENCES users(id),
    priority      VARCHAR(20)   NOT NULL CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    status        VARCHAR(20)   NOT NULL CHECK (status IN
                    ('DRAFT','IN_PROGRESS','APPROVED','REJECTED','SENT_BACK','COMPLETED','ARCHIVED')),
    current_stage INTEGER       NOT NULL DEFAULT 0,
    due_date      DATE,
    archived      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT now()
);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_owner ON workflows(owner_id);

CREATE TABLE approval_steps (
    id          BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT      NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_order  INTEGER     NOT NULL,
    approver_id BIGINT      NOT NULL REFERENCES users(id),
    status      VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','SENT_BACK','SKIPPED')),
    remarks     VARCHAR(1000),
    acted_at    TIMESTAMP,
    created_at  TIMESTAMP   NOT NULL DEFAULT now(),
    UNIQUE (workflow_id, step_order)
);
CREATE INDEX idx_approval_steps_workflow ON approval_steps(workflow_id);

CREATE TABLE comments (
    id          BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT      NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    author_id   BIGINT      NOT NULL REFERENCES users(id),
    content     VARCHAR(2000) NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id                  BIGSERIAL PRIMARY KEY,
    recipient_id        BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(30) NOT NULL,
    message             VARCHAR(500) NOT NULL,
    related_workflow_id BIGINT,
    is_read             BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP   NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);

CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   BIGINT       NOT NULL,
    details     VARCHAR(2000),
    created_at  TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================================================
-- Seed data (safe to re-run: guarded with ON CONFLICT)
-- Default password for all seeded users is "Password123!" (BCrypt hash below)
-- ============================================================================

INSERT INTO departments (name, description) VALUES
    ('Engineering', 'Product and platform engineering'),
    ('Finance', 'Budgeting, expenses and financial approvals'),
    ('Human Resources', 'Hiring, onboarding and HR operations'),
    ('Sales', 'Customer contracts and deal approvals')
ON CONFLICT (name) DO NOTHING;

-- BCrypt hash of "Password123!" (verified against bcrypt.checkpw before commit)
INSERT INTO users (full_name, email, password, role, department_id, enabled) VALUES
    ('Ava Admin',   'admin@flowpilot.ai',   '$2a$10$ikc8aE70akJCFaCYb0L4N.r7WginrhjXReooG8b3E9xGoXNdaC23i', 'ADMIN',    1, TRUE),
    ('Marcus Rivera','manager@flowpilot.ai','$2a$10$ikc8aE70akJCFaCYb0L4N.r7WginrhjXReooG8b3E9xGoXNdaC23i', 'MANAGER',  1, TRUE),
    ('Priya Employee','employee@flowpilot.ai','$2a$10$ikc8aE70akJCFaCYb0L4N.r7WginrhjXReooG8b3E9xGoXNdaC23i','EMPLOYEE', 2, TRUE)
ON CONFLICT (email) DO NOTHING;
