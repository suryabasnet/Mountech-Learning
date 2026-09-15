import { RBACPermission, Role, PermissionKey } from '../types';

export const RBAC_PERMISSIONS: RBACPermission[] = [
  // Course Management
  {
    key: 'courses.view',
    label: 'View Course Catalog & Syllabus',
    category: 'Course Management',
    description: 'Browse available courses, syllabus units, prerequisites, and instructors',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta', 'student', 'parent'],
  },
  {
    key: 'courses.create',
    label: 'Create Course & Curriculum',
    category: 'Course Management',
    description: 'Author new courses, draft modules, sections, and upload instructional media',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'courses.edit',
    label: 'Edit Content & Lessons',
    category: 'Course Management',
    description: 'Update curriculum, edit lesson markdown, upload files, configure prerequisites',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'courses.publish',
    label: 'Publish Course to Marketplace/Catalog',
    category: 'Course Management',
    description: 'Approve curriculum and publish course for student enrollments',
    allowedRoles: ['super_admin', 'institution_admin'],
  },
  {
    key: 'courses.delete',
    label: 'Archive or Delete Course',
    category: 'Course Management',
    description: 'Permanently remove or archive obsolete course offerings',
    allowedRoles: ['super_admin', 'institution_admin'],
  },

  // Grading & Assessment
  {
    key: 'quizzes.create',
    label: 'Author Quizzes & Question Banks',
    category: 'Grading & Assessment',
    description: 'Construct 15+ question types, randomize options, configure time limits and attempts',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'quizzes.grade',
    label: 'Review & Grade Quizzes',
    category: 'Grading & Assessment',
    description: 'Evaluate subjective quiz responses and review automated score distribution',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta'],
  },
  {
    key: 'assignments.create',
    label: 'Create Assignments & Rubrics',
    category: 'Grading & Assessment',
    description: 'Configure submission deadlines, rubric criteria, and peer review workflows',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'assignments.grade',
    label: 'Grade Submissions & Annotate',
    category: 'Grading & Assessment',
    description: 'Provide rubric-based scores, inline feedback, and annotations on submissions',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta'],
  },
  {
    key: 'grades.view',
    label: 'View Grades & Progress',
    category: 'Grading & Assessment',
    description: 'View student scores, grade breakdowns, and historical trends',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta', 'student', 'parent'],
  },
  {
    key: 'grades.grade',
    label: 'Enter Grades into Gradebook',
    category: 'Grading & Assessment',
    description: 'Record assignment and quiz marks with audit trails',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta'],
  },
  {
    key: 'grades.override',
    label: 'Override Grades & Apply Curves',
    category: 'Grading & Assessment',
    description: 'Perform official grade adjustments, curve distributions, and semester reconciliations',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'grades.export',
    label: 'Export Official Gradebook CSV',
    category: 'Grading & Assessment',
    description: 'Download SIS-compatible grade records and transcripts',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },

  // Community & Live
  {
    key: 'forums.post',
    label: 'Post in Discussions & Q&A',
    category: 'Community & Live',
    description: 'Start threads, ask questions, and reply in course discussion forums',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta', 'student'],
  },
  {
    key: 'forums.moderate',
    label: 'Moderate Forum Content',
    category: 'Community & Live',
    description: 'Pin insightful discussions, lock spam, and flag inappropriate comments',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta'],
  },
  {
    key: 'announcements.create',
    label: 'Broadcast Announcements',
    category: 'Community & Live',
    description: 'Send campus/course alerts via email digest, in-app bell, and push',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'live_class.host',
    label: 'Host Virtual Classroom Sessions',
    category: 'Community & Live',
    description: 'Start Zoom/Jitsi meetings, broadcast interactive whiteboard, initiate breakout rooms',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'live_class.join',
    label: 'Join Live Class as Attendee',
    category: 'Community & Live',
    description: 'Participate in live audio/video lectures, whiteboard collaboration, and live chat',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta', 'student'],
  },

  // Administration & Security
  {
    key: 'tenants.manage',
    label: 'Manage Tenant Institutions',
    category: 'Administration & Security',
    description: 'Configure tenant domains, custom logos, grading schemes, and term calendars',
    allowedRoles: ['super_admin', 'institution_admin'],
  },
  {
    key: 'tenants.switch',
    label: 'Cross-Tenant Switching',
    category: 'Administration & Security',
    description: 'Seamlessly toggle between isolated organization workspaces',
    allowedRoles: ['super_admin'],
  },
  {
    key: 'users.manage',
    label: 'User Account Provisioning & Roles',
    category: 'Administration & Security',
    description: 'Invite instructors, enroll students, assign TA permissions, enforce MFA',
    allowedRoles: ['super_admin', 'institution_admin'],
  },
  {
    key: 'users.view_audit',
    label: 'Inspect Security Audit Logs',
    category: 'Administration & Security',
    description: 'Review tamper-evident security audit trails, logins, and permission changes',
    allowedRoles: ['super_admin', 'institution_admin'],
  },

  // Monetization & Analytics
  {
    key: 'certificates.issue',
    label: 'Issue & Sign Certificates',
    category: 'Monetization & Analytics',
    description: 'Generate accredited certificates of completion with QR verification',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'certificates.verify',
    label: 'Verify Digital Credentials',
    category: 'Monetization & Analytics',
    description: 'Public verification of certificate authenticity, issuing institution, and grade',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher', 'ta', 'student', 'parent'],
  },
  {
    key: 'billing.manage',
    label: 'Manage Subscriptions & Invoicing',
    category: 'Monetization & Analytics',
    description: 'Process Stripe checkout, configure course fees, view instructor payouts and refunds',
    allowedRoles: ['super_admin', 'institution_admin'],
  },
  {
    key: 'analytics.tenant',
    label: 'View Institutional Analytics',
    category: 'Monetization & Analytics',
    description: 'Analyze student retention, pass rates, at-risk flags, and instructor workload',
    allowedRoles: ['super_admin', 'institution_admin', 'teacher'],
  },
  {
    key: 'analytics.platform',
    label: 'Global SaaS Metrics & Telemetry',
    category: 'Monetization & Analytics',
    description: 'Monitor multi-tenant resource utilization, global revenue, API latency, and uptime SLA',
    allowedRoles: ['super_admin'],
  },
];

export function hasPermission(role: Role, permission: PermissionKey): boolean {
  const perm = RBAC_PERMISSIONS.find((p) => p.key === permission);
  if (!perm) return false;
  return perm.allowedRoles.includes(role);
}

export function getRolePermissions(role: Role): PermissionKey[] {
  return RBAC_PERMISSIONS.filter((p) => p.allowedRoles.includes(role)).map((p) => p.key);
}

export interface RoleDefinition {
  title: string;
  badgeBg: string;
  badgeColor: string;
  description: string;
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  super_admin: {
    title: 'Super Admin',
    badgeBg: 'bg-purple-100',
    badgeColor: 'text-purple-800',
    description: 'Global SaaS platform administrator with unrestricted cross-tenant telemetry and governance.',
  },
  institution_admin: {
    title: 'Institution Admin',
    badgeBg: 'bg-blue-100',
    badgeColor: 'text-blue-800',
    description: 'University/College Dean, Registrar or L&D Director managing tenant programs, billing, and staff.',
  },
  teacher: {
    title: 'Teacher (Instructor)',
    badgeBg: 'bg-emerald-100',
    badgeColor: 'text-emerald-800',
    description: 'Professor, lecturer, or course instructor authoring modules, grading, and lecturing.',
  },
  ta: {
    title: 'Teaching Assistant (TA)',
    badgeBg: 'bg-teal-100',
    badgeColor: 'text-teal-800',
    description: 'Graduate TA or assistant grading assignments, moderating forums, and running office hours.',
  },
  student: {
    title: 'Student (Learner)',
    badgeBg: 'bg-sky-100',
    badgeColor: 'text-sky-800',
    description: 'Undergraduate, graduate, or corporate trainee taking courses, quizzes, and earning certificates.',
  },
  parent: {
    title: 'Parent (Observer)',
    badgeBg: 'bg-amber-100',
    badgeColor: 'text-amber-800',
    description: 'Guardian/Parent observer with read-only visibility into academic attendance, grades, and alerts.',
  },
};
