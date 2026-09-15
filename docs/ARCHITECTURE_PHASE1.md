# Mountech Learn — Phase 1: Architecture Blueprint, Monorepo Scaffolding & ERD

## 1. Executive Summary
- **Product Name**: Mountech Learn (by Mountech Solutions)
- **Vision**: Multi-tenant, enterprise-grade SaaS Learning Management System built to rival and surpass Coursera, Udacity, Blackboard, and Canvas.
- **Scale Target**: 100,000 concurrent learners, 1,000,000+ registered users with sub-200ms API p95 response time and 99.9% uptime SLA.

---

## 2. Monorepo Structure (Turborepo)

```
mountech-learn/
├── apps/
│   ├── web/                          # Next.js 14 (App Router, Server Components, SSR/SSG, Tailwind, shadcn/ui)
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App router routes
│   │   │   ├── components/           # UI components (Course player, Quiz engine, Gradebook)
│   │   │   └── hooks/                # Client state & real-time hooks
│   ├── api/                          # NestJS Modular Monolith (Microservices-Ready)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # JWT, MFA, SSO (SAML/OAuth2), RBAC
│   │   │   │   ├── tenants/          # Multi-tenant data isolation & provisioning
│   │   │   │   ├── courses/          # Curriculum, modules, SCORM, H5P
│   │   │   │   ├── assessments/      # 15+ quiz question types, rubrics, exams
│   │   │   │   ├── gradebook/        # Weighted categories, grade curves, override logs
│   │   │   │   ├── live/             # Zoom/Jitsi integration, WebRTC, Whiteboard
│   │   │   │   ├── certificates/     # PDF generator, QR verification, Open Badges
│   │   │   │   ├── payments/         # Stripe checkout, PayPal, invoices, payouts
│   │   │   │   └── analytics/        # Student retention, heatmaps, at-risk flags
│   │   │   └── common/               # Guards, interceptors, filters, decorators
│   └── mobile/                       # React Native (Expo SDK 51) Companion App
│       ├── src/
│       │   ├── screens/              # Offline-first video player, quiz taker, bookmarks
│       │   └── services/             # WatermelonDB offline sync & downloads
├── packages/
│   ├── shared/                       # Shared TypeScript types, Zod DTO schemas, RBAC matrix
│   ├── ui/                           # Cross-platform Design System primitives (Tailwind tokens)
│   ├── database/                     # PostgreSQL migrations, Prisma/TypeORM schemas, seed runners
│   └── config/                       # Shared ESLint, Prettier, TypeScript presets
├── docker-compose.yml                # Local cluster orchestration (Postgres, Redis, Mongo, Elasticsearch)
└── README.md
```

---

## 3. High-Level System Architecture Diagram

```
                              [ User Traffic ]
                       Web Browser / Mobile Clients
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │     Cloudflare Edge / WAF       │
                    │  (DDoS Shield, SSL, HLS Cache)  │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │    AWS ALB / Ingress Controller │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
               ┌─────────────────────────────────────────────┐
               │    Next.js 14 SSR/SSG Frontend Cluster      │
               └─────────────────────┬───────────────────────┘
                                     │ (REST & GraphQL)
                                     ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 NestJS API Modular Services Cluster                    │
  │  ┌───────────────┐ ┌────────────────┐ ┌───────────────┐ ┌────────────┐ │
  │  │  Auth & RBAC  │ │ Course Builder │ │  Assessments  │ │ Gradebook  │ │
  │  └───────┬───────┘ └────────┬───────┘ └───────┬───────┘ └─────┬──────┘ │
  │  ┌───────┴───────┐ ┌────────┴───────┐ ┌───────┴───────┐ ┌─────┴──────┐ │
  │  │ Live Classes  │ │  Certificates  │ │   Payments    │ │ Analytics  │ │
  │  └───────────────┘ └────────────────┘ └───────────────┘ └────────────┘ │
  └─────────────────┬─────────────────┬───────────────────┬────────────────┘
                    │                 │                   │
         ┌──────────┴────────┐ ┌──────┴─────────┐ ┌───────┴────────┐
         │ PostgreSQL DB     │ │ Redis Cluster  │ │ MongoDB Store  │
         │ Primary + 3 Read  │ │ Sessions, Cache│ │ Rich Lessons,  │
         │ Replicas (RLS)    │ │ Pub/Sub, Rates │ │ SCORM, Notes   │
         └───────────────────┘ └────────────────┘ └────────────────┘
                    │                                     │
         ┌──────────┴────────┐                 ┌──────────┴────────┐
         │ Elasticsearch     │                 │ Mux / AWS Media   │
         │ Full-Text Search  │                 │ HLS Transcoder    │
         └───────────────────┘                 └───────────────────┘
```

---

## 4. Multi-Tenant Data Isolation Strategy
- **Row-Level Security (RLS)**: Every SQL query executes with `SET LOCAL app.current_tenant_id = '...'`.
- **Subdomain Routing**: Each organization accesses its workspace via `[subdomain].mountech.com` or custom CNAME with auto-provisioned SSL.
- **Tenant Context Interceptor**: NestJS extracts the tenant identity from the JWT or Host header, validating organization status before routing requests.

---

## 5. Database ERD (Entity Relationship Summary)

```
[tenants] (id PK, name, subdomain, tier, settings)
    │ 1:N
    ├───────────► [users] (id PK, tenant_id FK, email, password_hash, role, mfa_enabled)
    │               │ 1:N
    │               ├──────────► [user_sessions] (id PK, user_id FK, jti, ip, expires_at)
    │               ├──────────► [audit_logs] (id PK, tenant_id FK, actor_id FK, action)
    │               ├──────────► [enrollments] (id PK, user_id FK, course_id FK, status)
    │               │              │ 1:N
    │               │              └────────► [lesson_completions] (enrollment_id FK, lesson_id FK)
    │               ├──────────► [quiz_attempts] (id PK, quiz_id FK, user_id FK, score)
    │               ├──────────► [assignment_submissions] (id PK, assignment_id FK, user_id FK)
    │               ├──────────► [certificates] (id PK, user_id FK, course_id FK, number)
    │               └──────────► [orders] (id PK, user_id FK, tenant_id FK, total_amount)
    │
    └───────────► [courses] (id PK, tenant_id FK, code, title, instructor_id FK, price)
                    │ 1:N
                    ├──────────► [course_sections] (id PK, course_id FK, title, position)
                    │              │ 1:N
                    │              └────────► [lessons] (id PK, section_id FK, content_type)
                    ├──────────► [quizzes] (id PK, course_id FK, time_limit, passing_score)
                    ├──────────► [assignments] (id PK, course_id FK, max_points, rubric_id)
                    ├──────────► [live_sessions] (id PK, course_id FK, host_id FK, scheduled_start)
                    └──────────► [discussion_threads] (id PK, course_id FK, author_id FK)
```

---

## 6. Authentication & RBAC Specifications
- **6 Supported Roles**:
  1. `super_admin`: Platform owner with global access across all tenants, infrastructure telemetry, and platform-wide revenue.
  2. `institution_admin`: Tenant / organization administrator managing staff, students, branding, grading policy, and compliance.
  3. `teacher`: Instructor with full course creation, lesson media upload, quiz authoring, rubric grading, and live session hosting.
  4. `ta`: Teaching Assistant with grading delegation, forum moderation, and student support permissions.
  5. `student`: Enrolled learner accessing course player, assessments, grade tracker, and verifiable certificates.
  6. `parent`: Observer role in K-12 and university modes with read-only visibility into child progress, attendance, and grades.

- **MFA (Multi-Factor Authentication)**:
  - RFC 6238 TOTP with standard QR provisioning URI
  - 8 cryptographically secure one-time emergency backup recovery codes
  - Tenant-level mandatory MFA enforcement policy toggle

- **SSO & Federation**:
  - Google Workspace OAuth2 flow
  - Microsoft Entra ID / Azure AD SAML 2.0
  - Okta & generic SAML 2.0 IdP metadata ingestion
