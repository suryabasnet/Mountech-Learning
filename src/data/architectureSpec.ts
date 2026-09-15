export interface ERDColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: string;
  isNullable?: boolean;
  description: string;
}

export interface ERDTable {
  id: string;
  name: string;
  category: 'Tenancy & Auth' | 'Curriculum & Content' | 'Enrollments & Progress' | 'Assessments & Grading' | 'Live & Community' | 'Commerce & Credentials';
  description: string;
  columns: ERDColumn[];
  indexes: string[];
}

export const ERD_TABLES: ERDTable[] = [
  // Tenancy & Auth
  {
    id: 'tenants',
    name: 'tenants',
    category: 'Tenancy & Auth',
    description: 'Multi-tenant organization root isolating universities, colleges, and corporate training academies.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Primary key tenant identifier' },
      { name: 'name', type: 'VARCHAR(255)', description: 'Institutional display name' },
      { name: 'subdomain', type: 'VARCHAR(64)', description: 'Unique tenant subdomain (e.g. apex.mountech.com)' },
      { name: 'tier', type: 'VARCHAR(32)', description: 'SaaS plan: starter | professional | enterprise' },
      { name: 'branding_config', type: 'JSONB', description: 'Logos, primary/secondary brand colors, favicon' },
      { name: 'settings', type: 'JSONB', description: 'Grading scale, academic calendar, AI feature toggles' },
      { name: 'created_at', type: 'TIMESTAMPTZ', description: 'Tenant creation timestamp' },
    ],
    indexes: ['idx_tenants_subdomain (UNIQUE)', 'idx_tenants_tier'],
  },
  {
    id: 'users',
    name: 'users',
    category: 'Tenancy & Auth',
    description: 'Enterprise user directory with tenant isolation, credential storage, and status.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Unique user identifier' },
      { name: 'tenant_id', type: 'UUID', isForeign: true, references: 'tenants.id', description: 'Tenant foreign key for data isolation' },
      { name: 'email', type: 'VARCHAR(255)', description: 'User login email address' },
      { name: 'password_hash', type: 'VARCHAR(255)', description: 'Argon2id salted password hash' },
      { name: 'name', type: 'VARCHAR(255)', description: 'Full user display name' },
      { name: 'role', type: 'VARCHAR(32)', description: 'super_admin | institution_admin | teacher | ta | student | parent' },
      { name: 'mfa_enabled', type: 'BOOLEAN', description: 'True if 2FA TOTP is activated' },
      { name: 'mfa_secret', type: 'VARCHAR(64)', isNullable: true, description: 'Encrypted TOTP RFC 6238 seed secret' },
      { name: 'sso_provider', type: 'VARCHAR(32)', isNullable: true, description: 'google | microsoft | saml_okta' },
      { name: 'status', type: 'VARCHAR(24)', description: 'active | suspended | pending_invitation' },
      { name: 'created_at', type: 'TIMESTAMPTZ', description: 'Account registration date' },
    ],
    indexes: ['idx_users_tenant_email (UNIQUE)', 'idx_users_role', 'idx_users_status'],
  },
  {
    id: 'user_sessions',
    name: 'user_sessions',
    category: 'Tenancy & Auth',
    description: 'Active JWT sessions tracked for instant token revocation and multi-device audit.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Session primary key' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Associated user account' },
      { name: 'jti', type: 'VARCHAR(64)', description: 'JWT Unique Token ID for Redis blacklisting' },
      { name: 'refresh_token_hash', type: 'VARCHAR(255)', description: 'Hashed refresh token' },
      { name: 'ip_address', type: 'INET', description: 'Client IP address' },
      { name: 'user_agent', type: 'TEXT', description: 'Browser / mobile device agent string' },
      { name: 'expires_at', type: 'TIMESTAMPTZ', description: 'Session absolute expiration' },
      { name: 'revoked_at', type: 'TIMESTAMPTZ', isNullable: true, description: 'Timestamp when session was invalidated' },
    ],
    indexes: ['idx_sessions_user_id', 'idx_sessions_jti (UNIQUE)', 'idx_sessions_expires_at'],
  },
  {
    id: 'audit_logs',
    name: 'audit_logs',
    category: 'Tenancy & Auth',
    description: 'Immutable, tamper-evident audit trail capturing critical actions, authentication, and permission edits.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Log entry identifier' },
      { name: 'tenant_id', type: 'UUID', isForeign: true, references: 'tenants.id', description: 'Tenant context' },
      { name: 'actor_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'User who initiated action' },
      { name: 'action', type: 'VARCHAR(64)', description: 'e.g. AUTH_LOGIN, GRADE_OVERRIDE, COURSE_PUBLISH' },
      { name: 'target_type', type: 'VARCHAR(64)', description: 'Target entity (course, submission, user)' },
      { name: 'target_id', type: 'VARCHAR(64)', description: 'Target entity UUID' },
      { name: 'metadata', type: 'JSONB', description: 'Before/after state diff, IP, user-agent, reason' },
      { name: 'created_at', type: 'TIMESTAMPTZ', description: 'Immutable log timestamp' },
    ],
    indexes: ['idx_audit_tenant_created', 'idx_audit_actor_id', 'idx_audit_action'],
  },

  // Curriculum & Content
  {
    id: 'courses',
    name: 'courses',
    category: 'Curriculum & Content',
    description: 'Master course record representing an academic course or self-paced training curriculum.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Course identifier' },
      { name: 'tenant_id', type: 'UUID', isForeign: true, references: 'tenants.id', description: 'Tenant owner' },
      { name: 'code', type: 'VARCHAR(32)', description: 'Course code (e.g. CS204, AI301)' },
      { name: 'title', type: 'VARCHAR(255)', description: 'Course title' },
      { name: 'slug', type: 'VARCHAR(255)', description: 'SEO URL slug' },
      { name: 'description', type: 'TEXT', description: 'Full course syllabus summary' },
      { name: 'primary_instructor_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Lead instructor' },
      { name: 'status', type: 'VARCHAR(24)', description: 'draft | review | published | archived' },
      { name: 'price', type: 'NUMERIC(10,2)', description: 'Tuition price in USD (0.00 for free)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', description: 'Creation timestamp' },
    ],
    indexes: ['idx_courses_tenant_status', 'idx_courses_slug', 'idx_courses_instructor'],
  },
  {
    id: 'course_sections',
    name: 'course_sections',
    category: 'Curriculum & Content',
    description: 'Curriculum modules / chapters grouping instructional lessons sequentially.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Section identifier' },
      { name: 'course_id', type: 'UUID', isForeign: true, references: 'courses.id', description: 'Parent course' },
      { name: 'title', type: 'VARCHAR(255)', description: 'Section name (e.g. Module 1: Relational Modeling)' },
      { name: 'position', type: 'INTEGER', description: 'Zero-indexed display sequence' },
      { name: 'is_published', type: 'BOOLEAN', description: 'Draft gating control' },
    ],
    indexes: ['idx_sections_course_position'],
  },
  {
    id: 'lessons',
    name: 'lessons',
    category: 'Curriculum & Content',
    description: 'Atomic instructional units supporting video HLS, SCORM, H5P, PDF, rich HTML, and audio.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Lesson identifier' },
      { name: 'section_id', type: 'UUID', isForeign: true, references: 'course_sections.id', description: 'Parent module' },
      { name: 'title', type: 'VARCHAR(255)', description: 'Lesson title' },
      { name: 'content_type', type: 'VARCHAR(32)', description: 'video | scorm | h5p | html | pdf | audio' },
      { name: 'video_asset_id', type: 'VARCHAR(64)', isNullable: true, description: 'Mux / MediaConvert HLS asset ID' },
      { name: 'duration_seconds', type: 'INTEGER', description: 'Video or expected reading duration' },
      { name: 'content_body', type: 'TEXT', description: 'Markdown or HTML formatted content' },
      { name: 'position', type: 'INTEGER', description: 'Sequence order within section' },
    ],
    indexes: ['idx_lessons_section_position'],
  },

  // Enrollments & Progress
  {
    id: 'enrollments',
    name: 'enrollments',
    category: 'Enrollments & Progress',
    description: 'Learner course registrations, payment validation, and lifecycle state.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Enrollment identifier' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Enrolled student' },
      { name: 'course_id', type: 'UUID', isForeign: true, references: 'courses.id', description: 'Target course' },
      { name: 'status', type: 'VARCHAR(24)', description: 'active | completed | dropped | pending_payment' },
      { name: 'enrolled_at', type: 'TIMESTAMPTZ', description: 'Enrollment timestamp' },
      { name: 'completed_at', type: 'TIMESTAMPTZ', isNullable: true, description: 'Completion date' },
      { name: 'final_grade_percent', type: 'NUMERIC(5,2)', isNullable: true, description: 'Calculated final score' },
    ],
    indexes: ['idx_enrollments_user_course (UNIQUE)', 'idx_enrollments_status'],
  },
  {
    id: 'lesson_completions',
    name: 'lesson_completions',
    category: 'Enrollments & Progress',
    description: 'Granular tracking of student completion per lesson (watch threshold, quiz passed, manual check-off).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Record identifier' },
      { name: 'enrollment_id', type: 'UUID', isForeign: true, references: 'enrollments.id', description: 'Student enrollment' },
      { name: 'lesson_id', type: 'UUID', isForeign: true, references: 'lessons.id', description: 'Target lesson' },
      { name: 'watch_percent', type: 'INTEGER', description: 'Playback percentage (0-100%)' },
      { name: 'last_playback_position', type: 'INTEGER', description: 'Timestamp resume point in seconds' },
      { name: 'is_completed', type: 'BOOLEAN', description: 'Whether rule threshold has been satisfied' },
      { name: 'completed_at', type: 'TIMESTAMPTZ', isNullable: true, description: 'Satisfied timestamp' },
    ],
    indexes: ['idx_completions_enrollment_lesson (UNIQUE)'],
  },

  // Assessments & Grading
  {
    id: 'quizzes',
    name: 'quizzes',
    category: 'Assessments & Grading',
    description: 'Assessment definitions with 15+ question types, question banks, time limits, and attempt rules.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Quiz identifier' },
      { name: 'course_id', type: 'UUID', isForeign: true, references: 'courses.id', description: 'Associated course' },
      { name: 'title', type: 'VARCHAR(255)', description: 'Quiz title' },
      { name: 'time_limit_minutes', type: 'INTEGER', isNullable: true, description: 'Exam duration (null = untimed)' },
      { name: 'passing_score_percent', type: 'INTEGER', description: 'Minimum percentage required to pass' },
      { name: 'max_attempts', type: 'INTEGER', description: 'Allowed attempts count (e.g. 1, 3, or unlimited)' },
      { name: 'randomize_questions', type: 'BOOLEAN', description: 'Shuffle question order per student' },
      { name: 'proctoring_enabled', type: 'BOOLEAN', description: 'Integrate browser lockdown / camera proctoring' },
    ],
    indexes: ['idx_quizzes_course'],
  },
  {
    id: 'quiz_attempts',
    name: 'quiz_attempts',
    category: 'Assessments & Grading',
    description: 'Recorded student quiz submissions, auto-scoring calculations, and attempt histories.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Attempt identifier' },
      { name: 'quiz_id', type: 'UUID', isForeign: true, references: 'quizzes.id', description: 'Associated quiz' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Student identifier' },
      { name: 'score_achieved', type: 'NUMERIC(5,2)', description: 'Total points awarded' },
      { name: 'total_possible', type: 'NUMERIC(5,2)', description: 'Maximum points possible' },
      { name: 'passed', type: 'BOOLEAN', description: 'Whether passing_score_percent was met' },
      { name: 'started_at', type: 'TIMESTAMPTZ', description: 'Exam start time' },
      { name: 'submitted_at', type: 'TIMESTAMPTZ', description: 'Exam submission time' },
    ],
    indexes: ['idx_quiz_attempts_quiz_user', 'idx_quiz_attempts_score'],
  },
  {
    id: 'assignments',
    name: 'assignments',
    category: 'Assessments & Grading',
    description: 'Blackboard/Canvas-depth coursework with rubric criteria, peer review, and cloud drive hooks.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Assignment identifier' },
      { name: 'course_id', type: 'UUID', isForeign: true, references: 'courses.id', description: 'Parent course' },
      { name: 'title', type: 'VARCHAR(255)', description: 'Assignment title' },
      { name: 'max_points', type: 'NUMERIC(5,2)', description: 'Maximum achievable score' },
      { name: 'submission_types', type: 'TEXT[]', description: 'file_upload | text_entry | url | google_drive' },
      { name: 'due_date', type: 'TIMESTAMPTZ', description: 'Deadline for submissions' },
      { name: 'rubric_id', type: 'UUID', isNullable: true, description: 'Grading rubric definition' },
      { name: 'plagiarism_check_enabled', type: 'BOOLEAN', description: 'Turnitin similarity scan trigger' },
    ],
    indexes: ['idx_assignments_course_due'],
  },
  {
    id: 'assignment_submissions',
    name: 'assignment_submissions',
    category: 'Assessments & Grading',
    description: 'Student submission artifacts with manual grading rubrics, inline annotations, and feedback.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Submission identifier' },
      { name: 'assignment_id', type: 'UUID', isForeign: true, references: 'assignments.id', description: 'Associated assignment' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Submitting student' },
      { name: 'submission_url', type: 'TEXT', isNullable: true, description: 'S3/Cloud Storage file URL' },
      { name: 'content', type: 'TEXT', isNullable: true, description: 'Text or code entry content' },
      { name: 'score', type: 'NUMERIC(5,2)', isNullable: true, description: 'Graded points' },
      { name: 'grader_id', type: 'UUID', isForeign: true, references: 'users.id', isNullable: true, description: 'Instructor or TA who evaluated' },
      { name: 'feedback', type: 'TEXT', isNullable: true, description: 'Instructor written remarks' },
      { name: 'submitted_at', type: 'TIMESTAMPTZ', description: 'Submission timestamp' },
    ],
    indexes: ['idx_submissions_assignment_user', 'idx_submissions_graded'],
  },

  // Live & Community
  {
    id: 'live_sessions',
    name: 'live_sessions',
    category: 'Live & Community',
    description: 'Scheduled virtual classrooms with Zoom/Jitsi SDK, interactive whiteboard, and recording archival.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Session identifier' },
      { name: 'course_id', type: 'UUID', isForeign: true, references: 'courses.id', description: 'Associated course' },
      { name: 'host_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Instructor host' },
      { name: 'title', type: 'VARCHAR(255)', description: 'Session topic' },
      { name: 'scheduled_start', type: 'TIMESTAMPTZ', description: 'Scheduled start datetime' },
      { name: 'duration_minutes', type: 'INTEGER', description: 'Planned session duration' },
      { name: 'room_id', type: 'VARCHAR(64)', description: 'Live WebRTC / Zoom meeting ID' },
      { name: 'recording_url', type: 'TEXT', isNullable: true, description: 'Post-session archived video lesson URL' },
    ],
    indexes: ['idx_live_sessions_course_time'],
  },
  {
    id: 'discussion_threads',
    name: 'discussion_threads',
    category: 'Live & Community',
    description: 'Canvas-style threaded forums with code snippets, upvotes, and TA moderation flags.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Thread identifier' },
      { name: 'course_id', type: 'UUID', isForeign: true, references: 'courses.id', description: 'Course forum context' },
      { name: 'author_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Thread author' },
      { name: 'title', type: 'VARCHAR(255)', description: 'Thread topic' },
      { name: 'content', type: 'TEXT', description: 'Initial post body with Markdown support' },
      { name: 'is_pinned', type: 'BOOLEAN', description: 'Pinned to top of forum' },
      { name: 'is_locked', type: 'BOOLEAN', description: 'Locked against new comments' },
      { name: 'created_at', type: 'TIMESTAMPTZ', description: 'Post timestamp' },
    ],
    indexes: ['idx_discussions_course_created'],
  },

  // Commerce & Credentials
  {
    id: 'certificates',
    name: 'certificates',
    category: 'Commerce & Credentials',
    description: 'Cryptographically verifiable completion credentials with QR codes and Open Badges metadata.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Certificate UUID' },
      { name: 'certificate_number', type: 'VARCHAR(64)', description: 'Human-readable serial (e.g. MNTH-2026-CS204-9481)' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Awarded student' },
      { name: 'course_id', type: 'UUID', isForeign: true, references: 'courses.id', description: 'Completed course' },
      { name: 'issued_at', type: 'TIMESTAMPTZ', description: 'Credential issue date' },
      { name: 'verification_hash', type: 'VARCHAR(128)', description: 'SHA-256 cryptographic verification digest' },
      { name: 'final_score', type: 'NUMERIC(5,2)', isNullable: true, description: 'Final course percentage' },
    ],
    indexes: ['idx_certificates_number (UNIQUE)', 'idx_certificates_user'],
  },
  {
    id: 'orders',
    name: 'orders',
    category: 'Commerce & Credentials',
    description: 'Commercial transactions for one-time tuition, subscription seat licenses, and payment plans.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Order identifier' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users.id', description: 'Purchasing user or organization' },
      { name: 'tenant_id', type: 'UUID', isForeign: true, references: 'tenants.id', description: 'Institution recipient' },
      { name: 'total_amount', type: 'NUMERIC(10,2)', description: 'Payment amount in USD' },
      { name: 'currency', type: 'VARCHAR(3)', description: 'USD | EUR | GBP | NPR' },
      { name: 'payment_processor', type: 'VARCHAR(32)', description: 'stripe | paypal | corporate_invoice' },
      { name: 'processor_charge_id', type: 'VARCHAR(128)', description: 'Stripe charge / payment intent ID' },
      { name: 'status', type: 'VARCHAR(24)', description: 'succeeded | pending | refunded | failed' },
      { name: 'created_at', type: 'TIMESTAMPTZ', description: 'Checkout date' },
    ],
    indexes: ['idx_orders_user', 'idx_orders_status', 'idx_orders_charge'],
  },
];

export const ARCHITECTURE_LAYERS = [
  {
    layer: '1. Global Ingress & Edge Routing',
    components: ['Cloudflare Enterprise / AWS CloudFront', 'DDoS Shield', 'HLS Video Edge Caching', 'SSL/TLS Termination'],
    details: 'All client requests pass through multi-region CDN edge nodes with Web Application Firewall (WAF), HTTP/3 support, and rate limiting.',
  },
  {
    layer: '2. Client Applications (Web & Mobile)',
    components: ['Next.js 14 Web (SSR/SSG)', 'React Native Expo Mobile', 'shadcn/ui Design System', 'Redux Toolkit + React Query'],
    details: 'Server-side rendered responsive web app for desktop/tablets alongside an offline-first companion mobile app sharing core validation logic.',
  },
  {
    layer: '3. API Gateway & Microservices (NestJS)',
    components: ['NestJS Modular Monolith', 'GraphQL (Federated) + REST', 'JWT & SAML Auth Guard', 'BullMQ Task Queue'],
    details: 'Modular services for Course Management, Adaptive Assessments, Live Video, Real-Time Socket.io, Gradebook, and Stripe Payments.',
  },
  {
    layer: '4. Distributed Cache & Real-Time Engine',
    components: ['Redis Cluster (Multi-AZ)', 'Socket.io Cluster', 'Session Blacklist Store', 'Rate Limiter'],
    details: 'Sub-millisecond session validation, pub/sub messaging for classroom whiteboards, and high-speed course catalog caching.',
  },
  {
    layer: '5. Polyglot Persistence Architecture',
    components: ['PostgreSQL (ACID & RLS)', 'MongoDB (Course Docs & SCORM)', 'Elasticsearch (Search)', 'AWS S3 / Cloud Storage'],
    details: 'PostgreSQL provides transactional safety for grades and enrollments; MongoDB stores rich lesson trees; Elasticsearch delivers instant search.',
  },
  {
    layer: '6. Video Pipeline & External Gateways',
    components: ['Mux / AWS MediaConvert (HLS)', 'Stripe & PayPal Gateways', 'Zoom / Jitsi Video SDK', 'Turnitin Plagiarism Hook'],
    details: 'Automated video transcoding into adaptive bitrate HLS (1080p, 720p, 480p) with signed URLs and DRM token authentication.',
  },
];
