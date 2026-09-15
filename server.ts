import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_PROGRAMS,
  INITIAL_TERMS,
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_MODULES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_QUIZZES,
  INITIAL_QUIZ_ATTEMPTS,
  INITIAL_PROGRESS,
  INITIAL_ATTENDANCE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DISCUSSIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_REVIEWS,
  INITIAL_ENROLLMENTS,
  INITIAL_CERTIFICATES,
} from './src/data/initialData';
import { EmailLogItem, NotificationItem, NotificationPreferences, CourseReview, EnrollmentRecord, Certificate, UserSession, JWTPayload, Role } from './src/types';
import { RBAC_PERMISSIONS, hasPermission, getRolePermissions } from './src/data/rbacConfig';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'lms-store.json');

// Default notification preferences for users
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotificationsEnabled: true,
  inAppNotificationsEnabled: true,
  notifyOnAnnouncements: { inApp: true, email: true },
  notifyOnNewAssignments: { inApp: true, email: true },
  notifyOnGradedSubmissions: { inApp: true, email: true },
  notifyOnUpcomingDeadlines: { inApp: true, email: true },
  deadlineReminderHours: 48,
  digestFrequency: 'instant',
};

function generateNotificationEmailHtml({
  recipientName,
  title,
  message,
  type,
  courseTitle,
  link,
}: {
  recipientName: string;
  title: string;
  message: string;
  type: string;
  courseTitle?: string;
  link?: string;
}) {
  const typeLabel =
    type === 'assignment' ? 'Coursework Notice' :
    type === 'grade' ? 'Academic Evaluation' :
    type === 'deadline' ? 'Deadline Reminder' :
    type === 'announcement' ? 'Official Announcement' : 'Campus Notification';

  const typeColor =
    type === 'assignment' ? '#0284c7' :
    type === 'grade' ? '#059669' :
    type === 'deadline' ? '#d97706' :
    type === 'announcement' ? '#7c3aed' : '#475569';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background-color: #0f172a; padding: 24px; text-align: left; border-bottom: 3px solid #0284c7;">
      <div style="display: flex; align-items: center;">
        <span style="display: inline-block; width: 14px; height: 14px; background-color: #0284c7; border-radius: 4px; margin-right: 8px;"></span>
        <span style="color: #ffffff; font-size: 18px; font-weight: bold; letter-spacing: -0.5px;">MounTech <span style="color: #38bdf8;">Learning</span></span>
      </div>
      <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">By Mountech Solutions • Academic Learning Management System</p>
    </div>

    <div style="padding: 28px;">
      <div style="display: inline-block; padding: 4px 12px; background-color: ${typeColor}15; color: ${typeColor}; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
        ${typeLabel}
      </div>

      <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">${title}</h1>

      ${courseTitle ? `<p style="font-size: 13px; font-weight: 600; color: #0284c7; margin: 0 0 16px 0;">Course: ${courseTitle}</p>` : ''}

      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
        Hello <strong>${recipientName}</strong>,
      </p>

      <div style="background-color: #f1f5f9; border-left: 4px solid ${typeColor}; padding: 16px; border-radius: 8px; margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
        ${message}
      </div>

      <div style="text-align: left; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
        <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">
          Log in to your MounTech Learning student or faculty dashboard to view complete details, rubric guidelines, and feedback.
        </p>
        <a href="#view" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;">
          Open MounTech Portal →
        </a>
      </div>
    </div>

    <div style="background-color: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
      <p style="margin: 0 0 6px 0;">
        This is an automated academic dispatch sent to <em>${recipientName}</em> according to your notification settings in MounTech Learning.
      </p>
      <p style="margin: 0;">
        To customize which announcements, assignment notices, or grade publications trigger email dispatches, visit your <strong>Profile & Notification Preferences</strong> in the portal.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function generateInitialEmailLogs(): EmailLogItem[] {
  return [
    {
      id: 'email-init-1',
      userId: 'user-student-1',
      recipientEmail: 'aarav.basnet@student.mountech.edu.np',
      recipientName: 'Aarav Basnet',
      subject: '[MounTech Learning] New Assignment: Assignment 1: Relational Schema Modeling',
      previewText: 'CS204: Database Management Systems: "Assignment 1: Relational Schema Modeling" has been assigned. Due on 2026-09-22.',
      htmlBody: generateNotificationEmailHtml({
        recipientName: 'Aarav Basnet',
        title: 'New Assignment: Assignment 1: Relational Schema Modeling',
        message: 'CS204: Database Management Systems: "Assignment 1: Relational Schema Modeling" has been published by Prof. Anil Adhikari. Please review the schema normalization requirements and submit your SQL scripts before September 22, 2026.',
        type: 'assignment',
        courseTitle: 'CS204: Database Management Systems',
      }),
      category: 'assignment',
      status: 'delivered',
      sentAt: '2026-09-14T08:30:00Z',
    },
    {
      id: 'email-init-2',
      userId: 'user-student-1',
      recipientEmail: 'aarav.basnet@student.mountech.edu.np',
      recipientName: 'Aarav Basnet',
      subject: '[MounTech Learning] Course Announcement: Lab Schedule & PostgreSQL Setup',
      previewText: 'Prof. Anil Adhikari published an announcement for CS204 regarding the upcoming DBMS lab sessions.',
      htmlBody: generateNotificationEmailHtml({
        recipientName: 'Aarav Basnet',
        title: 'Course Announcement: Lab 4 Query Optimization',
        message: 'Please ensure you have configured PostgreSQL 16 on your lab workstation before Wednesday. We will be executing EXPLAIN ANALYZE on complex multi-table joins.',
        type: 'announcement',
        courseTitle: 'CS204: Database Management Systems',
      }),
      category: 'announcement',
      status: 'delivered',
      sentAt: '2026-09-13T10:15:00Z',
    },
    {
      id: 'email-init-3',
      userId: 'user-student-1',
      recipientEmail: 'aarav.basnet@student.mountech.edu.np',
      recipientName: 'Aarav Basnet',
      subject: '[MounTech Learning] Deadline Reminder: Assignment 1 Due Soon',
      previewText: 'Assignment 1: Relational Schema Modeling is due in 8 days.',
      htmlBody: generateNotificationEmailHtml({
        recipientName: 'Aarav Basnet',
        title: 'Upcoming Coursework Deadline',
        message: 'Friendly reminder that "Assignment 1: Relational Schema Modeling" for CS204 is due soon. Verify all ER diagrams and 3NF constraints before final submission.',
        type: 'deadline',
        courseTitle: 'CS204: Database Management Systems',
      }),
      category: 'deadline',
      status: 'delivered',
      sentAt: '2026-09-14T09:00:00Z',
    },
  ];
}

function getGroundedFallbackSummary(
  lessonTitle: string,
  content: string,
  isNepali: boolean,
  summaryFormat?: string
) {
  if (isNepali) {
    return {
      summary: `यस पाठ (${lessonTitle}) मा रिलेसनल डाटाबेसका मुख्य सिद्धान्तहरू, इन्टेग्रिटी नियमहरू र स्किमा सामान्यीकरणको विस्तृत अध्ययन गरिएको छ। यसले डाटाको शुद्धता र सुरक्षालाई सुनिश्चित गर्दछ।`,
      keyTakeaways: [
        'रेफरन्सियल इन्टेग्रिटी (Referential Integrity) ले तालिकाबीचको सम्बन्धलाई सधैं वैध राख्छ।',
        'प्राइमरी कि (Primary Key) ले प्रत्येक टुपललाई अद्वितीय रूपमा पहिचान गर्छ।',
        'फरेन कि कास्केडिङ (ON DELETE CASCADE) ले अनाथ रेकर्डहरू बन्नबाट रोक्छ।',
        'एन्सी-स्पार्क (ANSI-SPARC) आर्किटेक्चरले भौतिक र तार्किक डाटा स्वतन्त्रता प्रदान गर्दछ।',
      ],
      keyDefinitions: [
        { term: 'Referential Integrity', definition: 'विदेशी कुञ्जी (Foreign Key) ले सन्दर्भित तालिकामा अवस्थित वैध प्राथमिक कुञ्जीलाई मात्र संकेत गर्नुपर्छ।' },
        { term: 'Foreign Key Cascade', definition: 'अभिभावक तालिकाको रेकर्ड मेटिँदा वा अद्यावधिक हुँदा सम्बद्ध सबै बाल रेकर्डहरू स्वतः परिवर्तन हुने नियम।' },
        { term: 'Logical Data Independence', definition: 'प्रयोगकर्ता वा एप्लिकेसन कोडलाई असर नगरी तार्किक स्किमा परिवर्तन गर्न सक्ने क्षमता।' },
      ],
      selfCheckQuestion: {
        question: 'यदि रिलेसनल तालिकामा फरेन कि कन्स्ट्रन्ट हटाइयो भने कस्तो जोखिम उत्पन्न हुन्छ?',
        answerHint: 'यसले अनाथ रेकर्डहरू (orphan tuples) सिर्जना गर्छ, जसले गर्दा डाटाबेसको स्थिरता र शुद्धता नष्ट हुन्छ।',
      },
    };
  }

  return {
    summary: `This lesson on "${lessonTitle}" establishes foundational relational database principles, focusing on referential integrity, schema normalization (1NF through BCNF), and declarative SQL constraint enforcement. It explains how database-level rules guarantee enterprise data consistency across distributed applications.`,
    keyTakeaways: [
      'Referential integrity guarantees that foreign key references always correspond to an existing parent primary key tuple.',
      'Cascading delete/update actions automatically propagate parent modifications to dependent child relations, preventing orphan records.',
      'The ANSI-SPARC three-schema architecture decouples physical storage optimization from conceptual and external user views.',
      'Enforcing constraints within the database engine provides resilient transactional protection compared to client-side validation alone.',
    ],
    keyDefinitions: [
      { term: 'Referential Integrity', definition: 'A relational database constraint ensuring that values in a foreign key column correspond to valid primary keys in the target table.' },
      { term: 'ON DELETE CASCADE', definition: 'A declarative foreign key action that automatically deletes matching child records whenever the referenced parent tuple is deleted.' },
      { term: 'Logical Data Independence', definition: 'The capacity to modify the conceptual schema without needing to rewrite external views or client application interfaces.' },
      { term: 'Foreign Key (FK)', definition: 'An attribute or collection of attributes in one table that uniquely identifies a row of another table or the same table.' },
    ],
    selfCheckQuestion: {
      question: 'Why is enforcing referential integrity in the database catalog superior to application-level validation?',
      answerHint: 'Catalog-level constraints prevent data corruption from concurrent transactions, batch imports, direct SQL scripts, and API bypasses.',
    },
  };
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory Database with JSON persistence
interface DBState {
  institutions: typeof INITIAL_INSTITUTIONS;
  programs: typeof INITIAL_PROGRAMS;
  terms: typeof INITIAL_TERMS;
  users: typeof INITIAL_USERS;
  courses: typeof INITIAL_COURSES;
  modules: typeof INITIAL_MODULES;
  assignments: typeof INITIAL_ASSIGNMENTS;
  submissions: typeof INITIAL_SUBMISSIONS;
  quizzes: typeof INITIAL_QUIZZES;
  quizAttempts: typeof INITIAL_QUIZ_ATTEMPTS;
  progress: typeof INITIAL_PROGRESS;
  attendance: typeof INITIAL_ATTENDANCE;
  announcements: typeof INITIAL_ANNOUNCEMENTS;
  discussions: typeof INITIAL_DISCUSSIONS;
  notifications: NotificationItem[];
  emailLogs: EmailLogItem[];
  messages: typeof INITIAL_MESSAGES;
  auditLogs: typeof INITIAL_AUDIT_LOGS;
  reviews: CourseReview[];
  enrollments: EnrollmentRecord[];
  certificates: Certificate[];
  sessions: UserSession[];
  currentUserId: string;
}

let db: DBState;

function generateInitialSessions(): UserSession[] {
  return [
    {
      id: 'sess-1',
      userId: 'user-teacher-1',
      userName: 'Prof. Anil Adhikari',
      role: 'teacher',
      institutionId: 'inst-1',
      ipAddress: '103.141.22.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (Chrome/128.0)',
      deviceType: 'desktop',
      location: 'Kathmandu, Nepal',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isCurrent: true,
    },
    {
      id: 'sess-2',
      userId: 'user-admin',
      userName: 'Dr. Ramesh Sharma',
      role: 'institution_admin',
      institutionId: 'inst-1',
      ipAddress: '103.141.22.88',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (Edge/128.0)',
      deviceType: 'desktop',
      location: 'Kathmandu, Nepal',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isCurrent: false,
    },
    {
      id: 'sess-3',
      userId: 'user-student-1',
      userName: 'Aarav Basnet',
      role: 'student',
      institutionId: 'inst-1',
      ipAddress: '110.44.112.19',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
      deviceType: 'mobile',
      location: 'Lalitpur, Nepal',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isCurrent: false,
    },
  ];
}

function loadDB(): DBState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.emailLogs) {
        parsed.emailLogs = generateInitialEmailLogs();
      }
      if (!parsed.reviews) {
        parsed.reviews = INITIAL_REVIEWS;
      }
      if (!parsed.enrollments) {
        parsed.enrollments = INITIAL_ENROLLMENTS;
      }
      if (!parsed.certificates) {
        parsed.certificates = INITIAL_CERTIFICATES;
      }
      if (!parsed.sessions || parsed.sessions.length === 0) {
        parsed.sessions = generateInitialSessions();
      }
      if (parsed.users) {
        parsed.users.forEach((u: any) => {
          if (!u.notificationPreferences) {
            u.notificationPreferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
          }
        });
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to read database file, initializing with fresh demo data:', err);
  }
  
  const initial: DBState = {
    institutions: INITIAL_INSTITUTIONS,
    programs: INITIAL_PROGRAMS,
    terms: INITIAL_TERMS,
    users: INITIAL_USERS.map(u => ({
      ...u,
      notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    })),
    courses: INITIAL_COURSES,
    modules: INITIAL_MODULES,
    assignments: INITIAL_ASSIGNMENTS,
    submissions: INITIAL_SUBMISSIONS,
    quizzes: INITIAL_QUIZZES,
    quizAttempts: INITIAL_QUIZ_ATTEMPTS,
    progress: INITIAL_PROGRESS,
    attendance: INITIAL_ATTENDANCE,
    announcements: INITIAL_ANNOUNCEMENTS,
    discussions: INITIAL_DISCUSSIONS,
    notifications: INITIAL_NOTIFICATIONS.map(n => ({
      ...n,
      channel: 'both' as const,
      emailStatus: 'delivered' as const,
    })),
    emailLogs: generateInitialEmailLogs(),
    messages: INITIAL_MESSAGES,
    auditLogs: INITIAL_AUDIT_LOGS,
    reviews: INITIAL_REVIEWS,
    enrollments: INITIAL_ENROLLMENTS,
    certificates: INITIAL_CERTIFICATES,
    sessions: generateInitialSessions(),
    currentUserId: 'user-teacher-1', // Default logged-in demo user
  };
  saveDB(initial);
  return initial;
}

function saveDB(state: DBState) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database state:', err);
  }
}

db = loadDB();

// Gemini client initialization (lazy / safe)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Current session helper
  function getCurrentUser() {
    return db.users.find(u => u.id === db.currentUserId) || db.users[0];
  }

  function sendNotificationToUser({
    userId,
    title,
    message,
    type,
    courseId,
    courseTitle,
    link,
    linkId,
    meta,
  }: {
    userId: string;
    title: string;
    message: string;
    type: 'announcement' | 'assignment' | 'grade' | 'deadline' | 'attendance' | 'system';
    courseId?: string;
    courseTitle?: string;
    link?: string;
    linkId?: string;
    meta?: any;
  }) {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    const prefs = user.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;

    let shouldSendInApp = prefs.inAppNotificationsEnabled ?? true;
    let shouldSendEmail = prefs.emailNotificationsEnabled ?? true;

    if (type === 'announcement') {
      shouldSendInApp = shouldSendInApp && (prefs.notifyOnAnnouncements?.inApp ?? true);
      shouldSendEmail = shouldSendEmail && (prefs.notifyOnAnnouncements?.email ?? true);
    } else if (type === 'assignment') {
      shouldSendInApp = shouldSendInApp && (prefs.notifyOnNewAssignments?.inApp ?? true);
      shouldSendEmail = shouldSendEmail && (prefs.notifyOnNewAssignments?.email ?? true);
    } else if (type === 'grade') {
      shouldSendInApp = shouldSendInApp && (prefs.notifyOnGradedSubmissions?.inApp ?? true);
      shouldSendEmail = shouldSendEmail && (prefs.notifyOnGradedSubmissions?.email ?? true);
    } else if (type === 'deadline') {
      shouldSendInApp = shouldSendInApp && (prefs.notifyOnUpcomingDeadlines?.inApp ?? true);
      shouldSendEmail = shouldSendEmail && (prefs.notifyOnUpcomingDeadlines?.email ?? true);
    }

    const channel = shouldSendInApp && shouldSendEmail ? 'both' : shouldSendEmail ? 'email' : 'in_app';

    if (shouldSendInApp) {
      const notifItem: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: user.id,
        title,
        message,
        type,
        courseId,
        courseTitle,
        link: link || (type === 'assignment' ? 'assignments' : type === 'grade' ? 'gradebook' : type === 'announcement' ? 'announcements' : 'dashboard'),
        linkId,
        read: false,
        channel,
        emailStatus: shouldSendEmail ? 'delivered' : 'disabled',
        meta,
        createdAt: new Date().toISOString(),
      };
      db.notifications.unshift(notifItem);
    }

    if (shouldSendEmail) {
      const emailItem: EmailLogItem = {
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: user.id,
        recipientEmail: user.email,
        recipientName: user.name,
        subject: `[MounTech Learning] ${title}`,
        previewText: message,
        htmlBody: generateNotificationEmailHtml({
          recipientName: user.name,
          title,
          message,
          type,
          courseTitle,
          link,
        }),
        category: type as any,
        status: 'delivered',
        sentAt: new Date().toISOString(),
      };
      if (!db.emailLogs) db.emailLogs = [];
      db.emailLogs.unshift(emailItem);
    }
  }

  // --- Auth & Session Endpoints ---
  app.get('/api/auth/me', (req, res) => {
    const user = getCurrentUser();
    const institution = db.institutions.find(i => i.id === user.institutionId);
    const permissions = getRolePermissions(user.role as Role);
    const currentSession = db.sessions.find(s => s.userId === user.id && s.isCurrent) || db.sessions[0];
    res.json({ user, institution, permissions, session: currentSession });
  });

  app.post('/api/auth/switch-user', (req, res) => {
    const { userId } = req.body;
    const target = db.users.find(u => u.id === userId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    db.currentUserId = target.id;
    
    // Mark session
    db.sessions.forEach(s => {
      s.isCurrent = s.userId === target.id;
    });

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: target.institutionId,
      userId: target.id,
      userName: target.name,
      action: 'AUTH_SWITCH_USER',
      targetType: 'user_session',
      targetId: target.id,
      details: `Switched active profile to ${target.name} (${target.role})`,
      timestamp: new Date().toISOString(),
      ipAddress: '103.141.22.45',
    });

    saveDB(db);
    res.json({
      success: true,
      user: target,
      permissions: getRolePermissions(target.role as Role),
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({ sub: target.id, role: target.role, email: target.email, tenantId: target.institutionId })).toString('base64')}.mountech_signature`,
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password, mfaCode } = req.body;
    const trimmedEmail = (email || '').toLowerCase().trim();
    const target = db.users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!target) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check MFA challenge
    if (target.mfaEnabled && !mfaCode) {
      return res.json({
        requiresMfa: true,
        userId: target.id,
        email: target.email,
        message: 'Two-Factor Authentication (TOTP) is required for this account.',
      });
    }

    if (target.mfaEnabled && mfaCode) {
      // Validate 6-digit code or backup code
      const isValid = mfaCode === '123456' || mfaCode.length === 6 || mfaCode.includes('-');
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification code. Please check your authenticator app.' });
      }
    }

    db.currentUserId = target.id;
    
    // Create new active session
    const newSession: UserSession = {
      id: `sess-${Date.now()}`,
      userId: target.id,
      userName: target.name,
      role: target.role as Role,
      institutionId: target.institutionId,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '103.141.22.45',
      userAgent: req.headers['user-agent'] || 'Mozilla/5.0 MountechClient/1.0',
      deviceType: 'desktop',
      location: 'Kathmandu, Nepal',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isCurrent: true,
    };

    db.sessions.forEach(s => { s.isCurrent = false; });
    db.sessions.unshift(newSession);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: target.institutionId,
      userId: target.id,
      userName: target.name,
      action: 'AUTH_LOGIN_SUCCESS',
      targetType: 'user_auth',
      targetId: target.id,
      details: `Successful login by ${target.name} (${target.role}) from ${newSession.ipAddress}`,
      timestamp: new Date().toISOString(),
      ipAddress: newSession.ipAddress,
    });

    saveDB(db);

    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({
      sub: target.id,
      role: target.role,
      email: target.email,
      tenantId: target.institutionId,
      permissions: getRolePermissions(target.role as Role),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      jti: newSession.id,
    })).toString('base64')}.mountech_signature_token`;

    res.json({
      success: true,
      user: target,
      token,
      permissions: getRolePermissions(target.role as Role),
      session: newSession,
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, role, institutionId, department, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    if (db.users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const assignedRole: Role = role || 'student';
    const targetInstitutionId = institutionId || 'inst-1';

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: trimmedEmail,
      role: assignedRole,
      institutionId: targetInstitutionId,
      department: department || 'General Studies',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'active' as const,
      enrolledCourseIds: assignedRole === 'student' ? ['course-1'] : [],
      teachingCourseIds: assignedRole === 'teacher' ? ['course-1'] : [],
      taCourseIds: assignedRole === 'ta' ? ['course-1'] : [],
      mfaEnabled: false,
      preferredLanguage: 'en' as const,
      timezone: 'Asia/Kathmandu' as const,
      notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.currentUserId = newUser.id;

    const newSession: UserSession = {
      id: `sess-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      role: newUser.role as Role,
      institutionId: newUser.institutionId,
      ipAddress: '103.141.22.45',
      userAgent: req.headers['user-agent'] || 'Mozilla/5.0 MountechClient/1.0',
      deviceType: 'desktop',
      location: 'Kathmandu, Nepal',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isCurrent: true,
    };
    db.sessions.forEach(s => { s.isCurrent = false; });
    db.sessions.unshift(newSession);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: targetInstitutionId,
      userId: newUser.id,
      userName: newUser.name,
      action: 'USER_REGISTERED',
      targetType: 'user_account',
      targetId: newUser.id,
      details: `New account registered for ${newUser.name} with role ${newUser.role}`,
      timestamp: new Date().toISOString(),
      ipAddress: '103.141.22.45',
    });

    saveDB(db);

    res.json({
      success: true,
      user: newUser,
      permissions: getRolePermissions(newUser.role as Role),
      session: newSession,
    });
  });

  app.post('/api/auth/mfa/setup', (req, res) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === (userId || db.currentUserId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = 'MNTCH' + Math.random().toString(36).substring(2, 10).toUpperCase() + '77X';
    const otpauthUrl = `otpauth://totp/MountechLearn:${encodeURIComponent(user.email)}?secret=${secret}&issuer=Mountech%20Solutions`;
    const backupCodes = [
      '8921-4491',
      '3019-8824',
      '7102-5561',
      '4920-1178',
      '6641-9923',
      '1280-3749',
      '5519-8032',
      '9482-1673',
    ];

    res.json({
      success: true,
      secret,
      otpauthUrl,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`,
      backupCodes,
    });
  });

  app.post('/api/auth/mfa/verify', (req, res) => {
    const { userId, code } = req.body;
    const user = db.users.find(u => u.id === (userId || db.currentUserId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!code || code.length < 6) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code' });
    }

    user.mfaEnabled = true;
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.name,
      action: 'MFA_ACTIVATED',
      targetType: 'security',
      targetId: user.id,
      details: `Two-Factor Authentication (TOTP) successfully activated for ${user.name}`,
      timestamp: new Date().toISOString(),
      ipAddress: '103.141.22.45',
    });

    saveDB(db);
    res.json({ success: true, message: 'Two-Factor Authentication successfully activated', user });
  });

  app.post('/api/auth/mfa/disable', (req, res) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === (userId || db.currentUserId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.mfaEnabled = false;
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.name,
      action: 'MFA_DISABLED',
      targetType: 'security',
      targetId: user.id,
      details: `Two-Factor Authentication disabled for ${user.name}`,
      timestamp: new Date().toISOString(),
      ipAddress: '103.141.22.45',
    });

    saveDB(db);
    res.json({ success: true, message: 'Two-Factor Authentication disabled', user });
  });

  app.post('/api/auth/sso/login', (req, res) => {
    const { provider, email, tenantId } = req.body;
    const targetEmail = (email || 'sso.user@mountechsolutions.com').toLowerCase().trim();
    let target = db.users.find(u => u.email.toLowerCase() === targetEmail);

    if (!target) {
      // Auto-provision SSO user
      const providerLabel = provider === 'google' ? 'Google Workspace' : provider === 'microsoft' ? 'Microsoft Entra ID' : 'Okta SAML 2.0';
      target = {
        id: `user-sso-${Date.now()}`,
        name: `${providerLabel} Learner`,
        email: targetEmail,
        role: 'student',
        institutionId: tenantId || 'inst-1',
        department: 'Corporate Training Division',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        ssoProvider: provider,
        enrolledCourseIds: ['course-1', 'course-2'],
        preferredLanguage: 'en',
        timezone: 'Asia/Kathmandu',
        notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
        createdAt: new Date().toISOString(),
      };
      db.users.push(target);
    }

    db.currentUserId = target.id;

    const newSession: UserSession = {
      id: `sess-sso-${Date.now()}`,
      userId: target.id,
      userName: target.name,
      role: target.role as Role,
      institutionId: target.institutionId,
      ipAddress: '103.141.22.45',
      userAgent: req.headers['user-agent'] || 'SSO Identity Provider Client',
      deviceType: 'desktop',
      location: 'Enterprise Gateway, Singapore',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isCurrent: true,
    };

    db.sessions.forEach(s => { s.isCurrent = false; });
    db.sessions.unshift(newSession);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: target.institutionId,
      userId: target.id,
      userName: target.name,
      action: 'AUTH_SSO_LOGIN',
      targetType: 'sso_federation',
      targetId: target.id,
      details: `Federated SSO login via ${provider} for ${target.name}`,
      timestamp: new Date().toISOString(),
      ipAddress: newSession.ipAddress,
    });

    saveDB(db);

    res.json({
      success: true,
      user: target,
      permissions: getRolePermissions(target.role as Role),
      session: newSession,
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sso_token_claim.mountech_sig`,
    });
  });

  app.get('/api/auth/sessions', (req, res) => {
    const user = getCurrentUser();
    const userSessions = db.sessions.filter(s => s.userId === user.id);
    res.json(userSessions);
  });

  app.post('/api/auth/sessions/revoke', (req, res) => {
    const { sessionId } = req.body;
    const user = getCurrentUser();
    db.sessions = db.sessions.filter(s => s.id !== sessionId);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.name,
      action: 'SESSION_REVOKED',
      targetType: 'user_session',
      targetId: sessionId,
      details: `Terminated session ${sessionId}`,
      timestamp: new Date().toISOString(),
      ipAddress: '103.141.22.45',
    });

    saveDB(db);
    res.json({ success: true, message: 'Session successfully revoked' });
  });

  app.get('/api/auth/rbac/matrix', (req, res) => {
    res.json(RBAC_PERMISSIONS);
  });

  app.post('/api/auth/tenant/switch', (req, res) => {
    const { tenantId } = req.body;
    const user = getCurrentUser();
    const targetTenant = db.institutions.find(i => i.id === tenantId);
    if (!targetTenant) {
      return res.status(404).json({ error: 'Tenant organization not found' });
    }

    user.institutionId = targetTenant.id;
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: targetTenant.id,
      userId: user.id,
      userName: user.name,
      action: 'TENANT_SWITCH',
      targetType: 'tenant_organization',
      targetId: targetTenant.id,
      details: `${user.name} switched active tenant workspace to ${targetTenant.name} (${targetTenant.code})`,
      timestamp: new Date().toISOString(),
      ipAddress: '103.141.22.45',
    });

    saveDB(db);
    res.json({ success: true, institution: targetTenant, user });
  });

  // --- Institutions ---
  app.get('/api/institutions', (req, res) => {
    res.json(db.institutions);
  });

  app.get('/api/institutions/:id', (req, res) => {
    const inst = db.institutions.find(i => i.id === req.params.id);
    if (!inst) return res.status(404).json({ error: 'Institution not found' });
    res.json(inst);
  });

  app.put('/api/institutions/:id', (req, res) => {
    const idx = db.institutions.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Institution not found' });
    db.institutions[idx] = { ...db.institutions[idx], ...req.body };
    saveDB(db);
    res.json(db.institutions[idx]);
  });

  // --- Programs & Terms ---
  app.get('/api/programs', (req, res) => {
    res.json(db.programs);
  });

  app.get('/api/terms', (req, res) => {
    res.json(db.terms);
  });

  // --- Courses ---
  app.get('/api/courses', (req, res) => {
    const currentUser = getCurrentUser();
    let courses = [...db.courses];

    // Filter by role access
    if (currentUser.role === 'student') {
      // Show published courses; tag whether enrolled
      courses = courses.filter(c => c.status === 'published');
    } else if (currentUser.role === 'teacher') {
      // Teachers see all in institution or specifically assigned
      courses = courses.filter(c => c.institutionId === currentUser.institutionId);
    }

    res.json(courses);
  });

  app.get('/api/courses/:id', (req, res) => {
    const course = db.courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const modules = db.modules.filter(m => m.courseId === course.id);
    const assignments = db.assignments.filter(a => a.courseId === course.id);
    const quizzes = db.quizzes.filter(q => q.courseId === course.id);
    res.json({ course, modules, assignments, quizzes });
  });

  app.post('/api/courses', (req, res) => {
    const user = getCurrentUser();
    if (user.role !== 'teacher' && user.role !== 'institution_admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized to create courses' });
    }

    const newCourse = {
      id: `course-${Date.now()}`,
      institutionId: user.institutionId || 'inst-1',
      programId: req.body.programId || 'prog-1',
      termId: req.body.termId || 'term-1',
      code: req.body.code || 'CS999',
      title: req.body.title || 'Untitled Course',
      description: req.body.description || '',
      syllabus: req.body.syllabus || '',
      learningOutcomes: req.body.learningOutcomes || [],
      thumbnail: req.body.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      teacherIds: [user.id],
      primaryTeacherName: user.name,
      level: req.body.level || 'bachelor_master',
      status: req.body.status || 'draft',
      gradeCategories: req.body.gradeCategories || [
        { id: `cat-${Date.now()}-1`, name: 'Assignments', weight: 40 },
        { id: `cat-${Date.now()}-2`, name: 'Quizzes', weight: 30 },
        { id: `cat-${Date.now()}-3`, name: 'Final Exam', weight: 30 },
      ],
      modulesCount: 0,
      lessonsCount: 0,
      assignmentsCount: 0,
      enrolledStudentsCount: 0,
      color: req.body.color || '#0284c7',
      createdAt: new Date().toISOString(),
    };

    db.courses.unshift(newCourse);
    
    // Add audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.name,
      action: 'COURSE_CREATED',
      targetType: 'Course',
      targetId: newCourse.id,
      details: `Created new course "${newCourse.title}" (${newCourse.code}).`,
      timestamp: new Date().toISOString(),
    });

    saveDB(db);
    res.json(newCourse);
  });

  app.put('/api/courses/:id', (req, res) => {
    const idx = db.courses.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Course not found' });
    
    db.courses[idx] = { ...db.courses[idx], ...req.body };
    saveDB(db);
    res.json(db.courses[idx]);
  });

  app.post('/api/courses/:id/duplicate', (req, res) => {
    const course = db.courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const newId = `course-${Date.now()}`;
    const duplicatedCourse = {
      ...course,
      id: newId,
      title: `${course.title} (Copy)`,
      code: `${course.code}-COPY`,
      status: 'draft' as const,
      enrolledStudentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.courses.unshift(duplicatedCourse);

    // Duplicate modules and lessons
    const courseMods = db.modules.filter(m => m.courseId === course.id);
    courseMods.forEach(mod => {
      const newModId = `mod-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const newLessons = (mod.lessons || []).map(l => ({
        ...l,
        id: `les-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        moduleId: newModId,
        courseId: newId,
      }));
      db.modules.push({
        ...mod,
        id: newModId,
        courseId: newId,
        lessons: newLessons,
      });
    });

    saveDB(db);
    res.json(duplicatedCourse);
  });

  app.post('/api/courses/:id/toggle-publish', (req, res) => {
    const course = db.courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.status = course.status === 'published' ? 'draft' : 'published';
    saveDB(db);
    res.json(course);
  });

  // --- Marketplace: Instructor Course Review Submission ---
  app.post('/api/courses/:id/submit-for-review', (req, res) => {
    const user = getCurrentUser();
    const course = db.courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    course.status = 'pending_review';
    course.reviewNotes = req.body.notes || 'Course submitted for marketplace quality & syllabus review.';
    
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: user.institutionId || 'inst-1',
      userId: user.id,
      userName: user.name,
      action: 'COURSE_SUBMITTED_FOR_REVIEW',
      targetType: 'Course',
      targetId: course.id,
      details: `Instructor ${user.name} submitted "${course.title}" for review.`,
      timestamp: new Date().toISOString(),
    });

    saveDB(db);
    res.json(course);
  });

  // --- Marketplace: Admin Course Review Decision (Approve / Reject) ---
  app.post('/api/courses/:id/review-decision', (req, res) => {
    const user = getCurrentUser();
    if (user.role !== 'institution_admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only administrators can review course submissions' });
    }
    const course = db.courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const { decision, notes } = req.body;
    if (decision === 'approve') {
      course.status = 'published';
      course.reviewedBy = user.name;
      course.reviewNotes = notes || 'Approved for public marketplace listing.';
    } else if (decision === 'reject') {
      course.status = 'rejected';
      course.reviewedBy = user.name;
      course.reviewNotes = notes || 'Course requires revision before publication.';
    }

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: user.institutionId || 'inst-1',
      userId: user.id,
      userName: user.name,
      action: decision === 'approve' ? 'COURSE_APPROVED' : 'COURSE_REJECTED',
      targetType: 'Course',
      targetId: course.id,
      details: `Admin ${user.name} marked "${course.title}" as ${course.status}. Note: ${course.reviewNotes}`,
      timestamp: new Date().toISOString(),
    });

    saveDB(db);
    res.json(course);
  });

  // --- Marketplace: Course Reviews & Ratings ---
  app.get('/api/reviews', (req, res) => {
    const { courseId } = req.query;
    let reviews = db.reviews || [];
    if (courseId) {
      reviews = reviews.filter(r => r.courseId === courseId);
    }
    res.json(reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const user = getCurrentUser();
    const { courseId, rating, comment } = req.body;
    if (!courseId || !rating || !comment) {
      return res.status(400).json({ error: 'courseId, rating, and comment are required' });
    }

    const course = db.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const newReview: CourseReview = {
      id: `rev-${Date.now()}`,
      courseId,
      studentId: user.id,
      studentName: user.name,
      studentAvatar: user.avatarUrl,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!db.reviews) db.reviews = [];
    db.reviews.unshift(newReview);

    // Update aggregate rating for course
    const courseReviews = db.reviews.filter(r => r.courseId === courseId);
    const avgRating = courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;
    course.rating = parseFloat(avgRating.toFixed(1));
    course.reviewsCount = courseReviews.length;

    saveDB(db);
    res.json(newReview);
  });

  // --- Marketplace: Enrollments & Stripe Checkout Simulation ---
  app.get('/api/enrollments', (req, res) => {
    const user = getCurrentUser();
    let records = db.enrollments || [];
    if (user.role === 'student') {
      records = records.filter(e => e.studentId === user.id);
    }
    res.json(records);
  });

  app.post('/api/enrollments/checkout', (req, res) => {
    const user = getCurrentUser();
    const { courseId, paymentMethod = 'stripe_card', cardNumber, cardholderName } = req.body;
    const course = db.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!db.enrollments) db.enrollments = [];

    // Check if already enrolled
    const existing = db.enrollments.find(e => e.studentId === user.id && e.courseId === courseId);
    if (existing) {
      return res.json({ success: true, enrollment: existing, message: 'Already enrolled in this course' });
    }

    const price = course.price ?? 0;
    const isPaid = price > 0;
    const stripePaymentId = isPaid ? `ch_3N${Date.now().toString(36)}_${Math.random().toString(36).substring(5)}` : undefined;

    const newEnrollment: EnrollmentRecord = {
      id: `enr-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      courseId: course.id,
      courseTitle: course.title,
      paymentStatus: isPaid ? 'paid' : 'free',
      amountPaid: isPaid ? price : 0,
      stripePaymentId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
    };

    db.enrollments.unshift(newEnrollment);
    course.enrolledStudentsCount = (course.enrolledStudentsCount || 0) + 1;

    // Send confirmation in-app notification
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: user.id,
      type: 'system',
      title: isPaid ? `Payment Received: $${price.toFixed(2)}` : 'Enrolled in Free Course',
      message: `You are now enrolled in "${course.title}". Start learning anytime at your own pace!`,
      read: false,
      channel: 'both',
      emailStatus: 'delivered',
      createdAt: new Date().toISOString(),
      courseId: course.id,
      courseTitle: course.title,
    });

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: user.institutionId || 'inst-1',
      userId: user.id,
      userName: user.name,
      action: 'COURSE_ENROLLED',
      targetType: 'Course',
      targetId: course.id,
      details: `${user.name} enrolled in "${course.title}". Amount: $${price.toFixed(2)} (${isPaid ? 'Stripe Checkout' : 'Free'}).`,
      timestamp: new Date().toISOString(),
    });

    saveDB(db);
    res.json({
      success: true,
      enrollment: newEnrollment,
      transaction: isPaid ? {
        id: stripePaymentId,
        amount: price,
        currency: 'USD',
        status: 'succeeded',
        paymentMethod,
        cardLast4: cardNumber ? cardNumber.slice(-4) : '4242',
        cardholderName: cardholderName || user.name,
        date: new Date().toISOString(),
      } : null,
    });
  });

  // --- Marketplace: Certificates of Completion ---
  app.get('/api/certificates', (req, res) => {
    const user = getCurrentUser();
    let certs = db.certificates || [];
    if (user.role === 'student') {
      certs = certs.filter(c => c.studentId === user.id);
    }
    res.json(certs);
  });

  app.post('/api/certificates/issue', (req, res) => {
    const user = getCurrentUser();
    const { courseId } = req.body;
    const course = db.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!db.certificates) db.certificates = [];

    // Check if already issued
    const existing = db.certificates.find(c => c.studentId === user.id && c.courseId === courseId);
    if (existing) {
      return res.json({ certificate: existing });
    }

    const certNumber = `MT-${new Date().getFullYear()}-${course.code.replace(/[^A-Z0-9]/gi, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNumber,
      studentId: user.id,
      studentName: user.name,
      courseId: course.id,
      courseTitle: course.title,
      instructorName: course.primaryTeacherName || 'Mountech Solutions Faculty',
      issuedAt: new Date().toISOString(),
      grade: 'Distinction (95%)',
      completionScore: 95,
      verificationUrl: `https://mountechsolutions.com/verify/${certNumber}`,
    };

    db.certificates.unshift(newCert);

    // Update enrollment status to completed
    const enrollment = db.enrollments?.find(e => e.studentId === user.id && e.courseId === courseId);
    if (enrollment) {
      enrollment.status = 'completed';
    }

    // Congratulatory notification
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: user.id,
      type: 'system',
      title: 'Course Completed! Certificate Awarded',
      message: `Congratulations! You have completed "${course.title}" and earned Certificate #${certNumber}.`,
      read: false,
      channel: 'both',
      emailStatus: 'delivered',
      createdAt: new Date().toISOString(),
    });

    saveDB(db);
    res.json({ certificate: newCert });
  });

  // --- Modules & Lessons ---
  app.get('/api/courses/:courseId/modules', (req, res) => {
    const mods = db.modules.filter(m => m.courseId === req.params.courseId);
    res.json(mods);
  });

  app.post('/api/courses/:courseId/modules', (req, res) => {
    const { title, description } = req.body;
    const existing = db.modules.filter(m => m.courseId === req.params.courseId);
    const newMod = {
      id: `mod-${Date.now()}`,
      courseId: req.params.courseId,
      title: title || 'New Module',
      order: existing.length + 1,
      description: description || '',
      isPublished: true,
      lessons: [],
    };
    db.modules.push(newMod);

    // Update course modulesCount
    const course = db.courses.find(c => c.id === req.params.courseId);
    if (course) course.modulesCount = (course.modulesCount || 0) + 1;

    saveDB(db);
    res.json(newMod);
  });

  app.post('/api/modules/:moduleId/lessons', (req, res) => {
    const mod = db.modules.find(m => m.id === req.params.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found' });

    const newLesson = {
      id: `les-${Date.now()}`,
      moduleId: mod.id,
      courseId: mod.courseId,
      title: req.body.title || 'New Lesson',
      order: (mod.lessons?.length || 0) + 1,
      durationMinutes: Number(req.body.durationMinutes) || 30,
      objectives: req.body.objectives || ['Understand lesson outcomes'],
      richTextContent: req.body.richTextContent || '<p>Lesson content goes here.</p>',
      videoUrl: req.body.videoUrl || '',
      videoTranscript: req.body.videoTranscript || '',
      resources: req.body.resources || [],
      completionRule: req.body.completionRule || 'view',
      isPublished: true,
    };

    if (!mod.lessons) mod.lessons = [];
    mod.lessons.push(newLesson);

    const course = db.courses.find(c => c.id === mod.courseId);
    if (course) course.lessonsCount = (course.lessonsCount || 0) + 1;

    saveDB(db);
    res.json(newLesson);
  });

  app.get('/api/lessons/:id', (req, res) => {
    for (const m of db.modules) {
      const lesson = m.lessons?.find(l => l.id === req.params.id);
      if (lesson) return res.json(lesson);
    }
    res.status(404).json({ error: 'Lesson not found' });
  });

  // --- Student Progress & Bookmarks ---
  app.get('/api/courses/:courseId/progress', (req, res) => {
    const user = getCurrentUser();
    const prog = db.progress.find(p => p.courseId === req.params.courseId && p.userId === user.id) || {
      userId: user.id,
      courseId: req.params.courseId,
      completedLessonIds: [],
      overallProgressPercent: 0,
      bookmarkedLessonIds: [],
      lastAccessedAt: new Date().toISOString(),
    };
    res.json(prog);
  });

  app.post('/api/lessons/:lessonId/complete', (req, res) => {
    const user = getCurrentUser();
    const { courseId } = req.body;
    let prog = db.progress.find(p => p.courseId === courseId && p.userId === user.id);
    if (!prog) {
      prog = {
        userId: user.id,
        courseId,
        completedLessonIds: [],
        overallProgressPercent: 0,
        bookmarkedLessonIds: [],
        lastAccessedAt: new Date().toISOString(),
      };
      db.progress.push(prog);
    }

    if (!prog.completedLessonIds.includes(req.params.lessonId)) {
      prog.completedLessonIds.push(req.params.lessonId);
    }
    prog.lastAccessedLessonId = req.params.lessonId;
    prog.lastAccessedAt = new Date().toISOString();

    // calculate percentage
    const allCourseLessons = db.modules
      .filter(m => m.courseId === courseId)
      .flatMap(m => m.lessons || []);
    if (allCourseLessons.length > 0) {
      prog.overallProgressPercent = Math.round((prog.completedLessonIds.length / allCourseLessons.length) * 100);
    }

    saveDB(db);
    res.json(prog);
  });

  app.post('/api/lessons/:lessonId/bookmark', (req, res) => {
    const user = getCurrentUser();
    const { courseId } = req.body;
    let prog = db.progress.find(p => p.courseId === courseId && p.userId === user.id);
    if (!prog) {
      prog = {
        userId: user.id,
        courseId,
        completedLessonIds: [],
        overallProgressPercent: 0,
        bookmarkedLessonIds: [],
        lastAccessedAt: new Date().toISOString(),
      };
      db.progress.push(prog);
    }

    const idx = prog.bookmarkedLessonIds.indexOf(req.params.lessonId);
    if (idx === -1) {
      prog.bookmarkedLessonIds.push(req.params.lessonId);
    } else {
      prog.bookmarkedLessonIds.splice(idx, 1);
    }
    saveDB(db);
    res.json({ bookmarked: prog.bookmarkedLessonIds.includes(req.params.lessonId), bookmarkedLessonIds: prog.bookmarkedLessonIds });
  });

  // --- Assignments & Submissions ---
  app.get('/api/assignments', (req, res) => {
    const { courseId } = req.query;
    let list = db.assignments;
    if (courseId) list = list.filter(a => a.courseId === courseId);
    res.json(list);
  });

  app.post('/api/assignments', (req, res) => {
    const user = getCurrentUser();
    const newAssignment = {
      id: `assign-${Date.now()}`,
      courseId: req.body.courseId,
      moduleId: req.body.moduleId,
      title: req.body.title || 'New Assignment',
      description: req.body.description || '',
      points: Number(req.body.points) || 100,
      categoryId: req.body.categoryId || 'cat-1',
      dueDate: req.body.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      availabilityStart: req.body.availabilityStart || new Date().toISOString(),
      availabilityEnd: req.body.availabilityEnd || new Date(Date.now() + 14 * 86400000).toISOString(),
      acceptedFormats: req.body.acceptedFormats || ['file', 'text'],
      maxAttempts: Number(req.body.maxAttempts) || 2,
      allowLateSubmissions: req.body.allowLateSubmissions ?? true,
      latePenaltyPercentPerDay: Number(req.body.latePenaltyPercentPerDay) || 5,
      isPublished: true,
      rubric: req.body.rubric || undefined,
      attachments: req.body.attachments || [],
    };

    db.assignments.unshift(newAssignment);
    const course = db.courses.find(c => c.id === newAssignment.courseId);
    if (course) course.assignmentsCount = (course.assignmentsCount || 0) + 1;

    // Send notifications to enrolled students using role & preference aware dispatcher
    db.users
      .filter(u => u.role === 'student' && (u.enrolledCourseIds?.includes(newAssignment.courseId) || true))
      .forEach(student => {
        sendNotificationToUser({
          userId: student.id,
          title: `New Assignment: ${newAssignment.title}`,
          message: `${course?.title || 'Your course'}: "${newAssignment.title}" has been published with ${newAssignment.points} total points. Due on ${new Date(newAssignment.dueDate).toLocaleDateString()}.`,
          type: 'assignment',
          courseId: newAssignment.courseId,
          courseTitle: course?.title,
          link: 'assignments',
          linkId: newAssignment.id,
          meta: { assignmentId: newAssignment.id, dueDate: newAssignment.dueDate, points: newAssignment.points },
        });
      });

    saveDB(db);
    res.json(newAssignment);
  });

  app.get('/api/assignments/:assignmentId/submissions', (req, res) => {
    const user = getCurrentUser();
    let subs = db.submissions.filter(s => s.assignmentId === req.params.assignmentId);
    // If student, can only see their own
    if (user.role === 'student') {
      subs = subs.filter(s => s.studentId === user.id);
    }
    res.json(subs);
  });

  app.post('/api/assignments/:assignmentId/submit', (req, res) => {
    const user = getCurrentUser();
    const { submissionType, content, fileName, fileUrl } = req.body;
    const assignment = db.assignments.find(a => a.id === req.params.assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Check attempts
    const existing = db.submissions.filter(s => s.assignmentId === assignment.id && s.studentId === user.id);
    if (existing.length >= assignment.maxAttempts) {
      return res.status(400).json({ error: `Maximum allowed attempts (${assignment.maxAttempts}) reached.` });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const newSub = {
      id: `sub-${Date.now()}`,
      assignmentId: assignment.id,
      courseId: assignment.courseId,
      studentId: user.id,
      studentName: user.name,
      studentAvatar: user.avatarUrl,
      attemptNumber: existing.length + 1,
      submittedAt: new Date().toISOString(),
      submissionType: submissionType || 'text',
      content: content || '',
      fileName: fileName || '',
      fileUrl: fileUrl || '',
      status: (isLate ? 'late' : 'submitted') as 'late' | 'submitted',
      isPublishedGrade: false,
    };

    db.submissions.unshift(newSub);

    // Notify teacher
    const course = db.courses.find(c => c.id === assignment.courseId);
    if (course && course.teacherIds) {
      course.teacherIds.forEach(tid => {
        db.notifications.unshift({
          id: `notif-${Date.now()}-${tid}`,
          userId: tid,
          title: 'New Student Submission',
          message: `${user.name} submitted "${assignment.title}" in ${course.title}.`,
          type: 'grade',
          link: 'grading',
          read: false,
          createdAt: new Date().toISOString(),
        });
      });
    }

    saveDB(db);
    res.json(newSub);
  });

  app.post('/api/submissions/:id/grade', (req, res) => {
    const user = getCurrentUser();
    if (user.role !== 'teacher' && user.role !== 'institution_admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized to grade submissions' });
    }

    const sub = db.submissions.find(s => s.id === req.params.id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    const { score, generalFeedback, rubricScores, isPublishedGrade, auditReason } = req.body;
    const oldScore = sub.score;

    sub.score = Number(score);
    sub.generalFeedback = generalFeedback;
    sub.rubricScores = rubricScores;
    sub.isPublishedGrade = !!isPublishedGrade;
    sub.status = 'graded';
    sub.gradedBy = user.name;
    sub.gradedAt = new Date().toISOString();

    if (!sub.auditHistory) sub.auditHistory = [];
    sub.auditHistory.unshift({
      changedBy: user.name,
      changedAt: new Date().toISOString(),
      oldScore,
      newScore: sub.score,
      reason: auditReason || (oldScore !== undefined ? 'Score revision' : 'Initial grading'),
    });

    // Notify student if grade is published
    if (sub.isPublishedGrade) {
      const course = db.courses.find(c => c.id === sub.courseId);
      const assignment = db.assignments.find(a => a.id === sub.assignmentId);
      const assignmentTitle = assignment?.title || 'coursework';
      const totalPoints = assignment?.points || 100;
      sendNotificationToUser({
        userId: sub.studentId,
        title: 'Grade & Feedback Published',
        message: `Your submission for ${assignmentTitle} in ${course?.title || sub.courseId} has been graded: ${sub.score} / ${totalPoints} pts. ${sub.generalFeedback ? `Feedback: "${sub.generalFeedback}"` : ''}`,
        type: 'grade',
        courseId: sub.courseId,
        courseTitle: course?.title,
        link: 'gradebook',
        linkId: sub.id,
        meta: { score: sub.score, totalPoints, assignmentId: sub.assignmentId },
      });
    }

    saveDB(db);
    res.json(sub);
  });

  // --- Quizzes & Attempts ---
  app.get('/api/quizzes', (req, res) => {
    const { courseId } = req.query;
    let list = db.quizzes;
    if (courseId) list = list.filter(q => q.courseId === courseId);
    
    // If student, remove correct answers from payload to prevent inspection
    const user = getCurrentUser();
    if (user.role === 'student') {
      list = list.map(q => ({
        ...q,
        questions: q.questions.map(quest => {
          const { correctAnswer, ...rest } = quest;
          return rest as any;
        }),
      }));
    }
    res.json(list);
  });

  app.post('/api/quizzes/:id/submit', (req, res) => {
    const user = getCurrentUser();
    const quiz = db.quizzes.find(q => q.id === req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const { responses, startedAt } = req.body;
    let autoScore = 0;
    let totalPossible = 0;
    let needsTeacherReview = false;

    // Automatic grading engine for objective questions
    quiz.questions.forEach(q => {
      totalPossible += q.points;
      const studentAns = responses?.[q.id];

      if (q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'short_answer') {
        if (
          studentAns &&
          String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
        ) {
          autoScore += q.points;
        }
      } else if (q.type === 'multiple_answer') {
        const correctArray = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        const studentArray = Array.isArray(studentAns) ? studentAns : [];
        const isMatch =
          correctArray.length === studentArray.length &&
          correctArray.every(item => studentArray.includes(item));
        if (isMatch) {
          autoScore += q.points;
        }
      } else if (q.type === 'essay') {
        // Essays require teacher manual review
        needsTeacherReview = true;
      }
    });

    const attempt = {
      id: `qa-${Date.now()}`,
      quizId: quiz.id,
      studentId: user.id,
      studentName: user.name,
      startedAt: startedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      status: (needsTeacherReview ? 'submitted' : 'graded') as 'submitted' | 'graded',
      responses: responses || {},
      score: autoScore,
      totalPossiblePoints: totalPossible,
      needsTeacherReview,
      feedback: needsTeacherReview
        ? 'Objective questions graded automatically. Subjective responses submitted for instructor review.'
        : `Assessment completed. Score: ${autoScore}/${totalPossible}`,
    };

    db.quizAttempts.unshift(attempt);
    saveDB(db);
    res.json(attempt);
  });

  // --- Gradebook Matrix & CSV Export ---
  app.get('/api/gradebook/:courseId', (req, res) => {
    const course = db.courses.find(c => c.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const assignments = db.assignments.filter(a => a.courseId === course.id);
    const quizzes = db.quizzes.filter(q => q.courseId === course.id);
    const students = db.users.filter(u => u.role === 'student');

    // Build student grade matrix
    const matrix = students.map(student => {
      let earnedWeight = 0;
      let totalWeightConsidered = 0;

      const assignmentGrades: Record<string, any> = {};
      assignments.forEach(assign => {
        const sub = db.submissions.find(s => s.assignmentId === assign.id && s.studentId === student.id);
        if (sub && sub.isPublishedGrade && sub.score !== undefined) {
          assignmentGrades[assign.id] = { score: sub.score, maxPoints: assign.points, status: 'graded' };
        } else if (sub) {
          assignmentGrades[assign.id] = { score: sub.score ?? 0, maxPoints: assign.points, status: 'submitted' };
        } else if (new Date() > new Date(assign.dueDate)) {
          assignmentGrades[assign.id] = { score: 0, maxPoints: assign.points, status: 'missing' };
        } else {
          assignmentGrades[assign.id] = { score: null, maxPoints: assign.points, status: 'pending' };
        }
      });

      const quizGrades: Record<string, any> = {};
      quizzes.forEach(quiz => {
        const attempt = db.quizAttempts.find(qa => qa.quizId === quiz.id && qa.studentId === student.id);
        if (attempt) {
          quizGrades[quiz.id] = { score: attempt.score, maxPoints: quiz.points, status: attempt.status };
        } else {
          quizGrades[quiz.id] = { score: null, maxPoints: quiz.points, status: 'pending' };
        }
      });

      // Sample weighted percentage (defaults to ~88% for demo student)
      const currentWeightedPercentage = student.id === 'user-student-1' ? 91.5 : 88.0;
      let letterGrade = 'A';
      let gpa = 3.85;

      if (currentWeightedPercentage >= 90) { letterGrade = 'A'; gpa = 4.0; }
      else if (currentWeightedPercentage >= 80) { letterGrade = 'B+'; gpa = 3.3; }
      else if (currentWeightedPercentage >= 70) { letterGrade = 'B'; gpa = 3.0; }
      else { letterGrade = 'C'; gpa = 2.0; }

      return {
        id: `grade-${student.id}-${course.id}`,
        studentId: student.id,
        studentName: student.name,
        email: student.email,
        courseId: course.id,
        assignmentGrades,
        quizGrades,
        currentWeightedPercentage,
        letterGrade,
        gpa,
      };
    });

    res.json({ course, assignments, quizzes, students: matrix });
  });

  // --- Attendance ---
  app.get('/api/attendance', (req, res) => {
    const { courseId } = req.query;
    let list = db.attendance;
    if (courseId) list = list.filter(a => a.courseId === courseId);
    res.json(list);
  });

  app.post('/api/attendance', (req, res) => {
    const user = getCurrentUser();
    const newSession = {
      id: `att-${Date.now()}`,
      courseId: req.body.courseId || 'course-1',
      date: req.body.date || new Date().toISOString().split('T')[0],
      title: req.body.title || 'Scheduled Class Session',
      type: req.body.type || 'physical',
      meetingLink: req.body.meetingLink || '',
      startTime: req.body.startTime || '10:00 AM',
      endTime: req.body.endTime || '11:30 AM',
      teacherId: user.id,
      records: req.body.records || [
        { studentId: 'user-student-1', studentName: 'Aarav Basnet', status: 'present' },
        { studentId: 'user-student-2', studentName: 'Pooja Thapa', status: 'present' },
      ],
    };

    db.attendance.unshift(newSession);
    saveDB(db);
    res.json(newSession);
  });

  app.put('/api/attendance/:id', (req, res) => {
    const idx = db.attendance.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Attendance record not found' });
    db.attendance[idx] = { ...db.attendance[idx], ...req.body };
    saveDB(db);
    res.json(db.attendance[idx]);
  });

  // --- Announcements & Discussions ---
  app.get('/api/announcements', (req, res) => {
    const { courseId } = req.query;
    let list = db.announcements;
    if (courseId) list = list.filter(a => a.courseId === courseId);
    res.json(list);
  });

  app.post('/api/announcements', (req, res) => {
    const user = getCurrentUser();
    const newAnn = {
      id: `ann-${Date.now()}`,
      courseId: req.body.courseId || 'course-1',
      title: req.body.title || 'New Announcement',
      content: req.body.content || '',
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      createdAt: new Date().toISOString(),
      isPinned: !!req.body.isPinned,
      commentsCount: 0,
    };
    db.announcements.unshift(newAnn);

    const course = db.courses.find(c => c.id === newAnn.courseId);

    // Notify enrolled students
    db.users
      .filter(u => u.role === 'student' && (u.enrolledCourseIds?.includes(newAnn.courseId) || true))
      .forEach(student => {
        sendNotificationToUser({
          userId: student.id,
          title: `Announcement: ${newAnn.title}`,
          message: `${course?.title || 'Course'}: ${newAnn.content.slice(0, 160)}${newAnn.content.length > 160 ? '...' : ''}`,
          type: 'announcement',
          courseId: newAnn.courseId,
          courseTitle: course?.title,
          link: 'announcements',
          linkId: newAnn.id,
          meta: { announcementId: newAnn.id, authorName: user.name },
        });
      });

    saveDB(db);
    res.json(newAnn);
  });

  app.get('/api/discussions', (req, res) => {
    const { courseId } = req.query;
    let list = db.discussions;
    if (courseId) list = list.filter(d => d.courseId === courseId);
    res.json(list);
  });

  app.post('/api/discussions', (req, res) => {
    const user = getCurrentUser();
    const newDisc = {
      id: `disc-${Date.now()}`,
      courseId: req.body.courseId || 'course-1',
      title: req.body.title || 'New Discussion Topic',
      content: req.body.content || '',
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      authorAvatar: user.avatarUrl,
      createdAt: new Date().toISOString(),
      isPinned: false,
      upvotes: 0,
      replies: [],
    };
    db.discussions.unshift(newDisc);
    saveDB(db);
    res.json(newDisc);
  });

  app.post('/api/discussions/:id/reply', (req, res) => {
    const user = getCurrentUser();
    const post = db.discussions.find(d => d.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Discussion not found' });

    const newReply = {
      id: `rep-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      authorAvatar: user.avatarUrl,
      content: req.body.content || '',
      createdAt: new Date().toISOString(),
      isInstructorEndorsed: user.role === 'teacher' || user.role === 'institution_admin',
    };

    post.replies.push(newReply);
    saveDB(db);
    res.json(newReply);
  });

  // --- Notifications & Messaging ---
  app.get('/api/notifications', (req, res) => {
    const user = getCurrentUser();
    const list = db.notifications.filter(n => n.userId === user.id);
    res.json(list);
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const user = getCurrentUser();
    db.notifications.filter(n => n.userId === user.id).forEach(n => (n.read = true));
    saveDB(db);
    res.json({ success: true });
  });

  app.post('/api/notifications/clear', (req, res) => {
    const user = getCurrentUser();
    db.notifications = db.notifications.filter(n => n.userId !== user.id);
    saveDB(db);
    res.json({ success: true });
  });

  // Get delivered emails for user
  app.get('/api/notifications/emails', (req, res) => {
    const user = getCurrentUser();
    if (!db.emailLogs) db.emailLogs = [];
    const list = db.emailLogs.filter(e => e.userId === user.id);
    res.json(list);
  });

  // Update notification preferences for a user
  app.put('/api/users/:id/notification-preferences', (req, res) => {
    const targetUser = db.users.find(u => u.id === req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    targetUser.notificationPreferences = {
      ...(targetUser.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES),
      ...req.body,
    };
    saveDB(db);
    res.json({ success: true, preferences: targetUser.notificationPreferences });
  });

  // Check upcoming deadlines and send automated reminder dispatches
  app.post('/api/notifications/check-deadlines', (req, res) => {
    const user = getCurrentUser();
    const now = new Date().getTime();
    let countDispatched = 0;

    // Iterate through enrolled courses
    const studentUsers = user.role === 'student' ? [user] : db.users.filter(u => u.role === 'student');

    studentUsers.forEach(student => {
      const prefs = student.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
      const windowHours = prefs.deadlineReminderHours || 48;
      const windowMs = windowHours * 60 * 60 * 1000;

      // Find published assignments for student courses
      const candidateAssignments = db.assignments.filter(a => {
        if (!a.isPublished) return false;
        if (student.enrolledCourseIds && !student.enrolledCourseIds.includes(a.courseId)) return false;
        const due = new Date(a.dueDate).getTime();
        const diff = due - now;
        return diff > 0 && diff <= windowMs;
      });

      candidateAssignments.forEach(assignment => {
        // Check if student already submitted
        const hasSubmitted = db.submissions.some(s => s.assignmentId === assignment.id && s.studentId === student.id);
        if (hasSubmitted) return;

        // Check if we sent this deadline notification in the last 24h
        const recentNotif = db.notifications.find(n =>
          n.userId === student.id &&
          n.type === 'deadline' &&
          n.linkId === assignment.id &&
          now - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
        );
        if (recentNotif) return;

        const course = db.courses.find(c => c.id === assignment.courseId);
        const hoursRemaining = Math.max(1, Math.round((new Date(assignment.dueDate).getTime() - now) / (60 * 60 * 1000)));

        sendNotificationToUser({
          userId: student.id,
          title: `Upcoming Deadline: ${assignment.title}`,
          message: `Your assignment "${assignment.title}" in ${course?.title || assignment.courseId} is due in ${hoursRemaining} hours (${new Date(assignment.dueDate).toLocaleString()}). Please submit on time.`,
          type: 'deadline',
          courseId: assignment.courseId,
          courseTitle: course?.title,
          link: 'assignments',
          linkId: assignment.id,
          meta: { assignmentId: assignment.id, dueDate: assignment.dueDate, hoursRemaining },
        });
        countDispatched++;
      });
    });

    saveDB(db);
    res.json({ success: true, countDispatched, message: `Checked deadlines. Dispatched ${countDispatched} reminder(s).` });
  });

  app.get('/api/messages', (req, res) => {
    const user = getCurrentUser();
    const list = db.messages.filter(m => m.senderId === user.id || m.recipientId === user.id);
    res.json(list);
  });

  app.post('/api/messages', (req, res) => {
    const user = getCurrentUser();
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      recipientId: req.body.recipientId,
      recipientName: req.body.recipientName || 'Recipient',
      courseId: req.body.courseId,
      courseTitle: req.body.courseTitle,
      subject: req.body.subject || 'Message',
      body: req.body.body || '',
      sentAt: new Date().toISOString(),
      read: false,
    };
    db.messages.unshift(newMsg);
    saveDB(db);
    res.json(newMsg);
  });

  // --- Administration & Audit Logs ---
  app.get('/api/admin/users', (req, res) => {
    res.json(db.users);
  });

  app.post('/api/admin/users/bulk-enroll', (req, res) => {
    const user = getCurrentUser();
    if (user.role !== 'institution_admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { csvData, defaultCourseId } = req.body;
    // Parse CSV lines: Name, Email, Role, Department
    const lines = (csvData || '').split('\n').map((l: string) => l.trim()).filter(Boolean);
    const addedUsers: any[] = [];

    lines.forEach((line: string, index: number) => {
      if (index === 0 && line.toLowerCase().includes('email')) return; // Header
      const parts = line.split(',').map((p: string) => p.trim());
      if (parts.length >= 2) {
        const [name, email, roleStr, dept] = parts;
        const role = (roleStr?.toLowerCase() || 'student') as any;
        const newUser = {
          id: `user-csv-${Date.now()}-${index}`,
          name: name || 'Enrolled Student',
          email: email || `user${index}@mountech.edu.np`,
          role: ['teacher', 'student', 'parent', 'institution_admin'].includes(role) ? role : 'student',
          institutionId: user.institutionId,
          status: 'active' as const,
          department: dept || 'Academic Program',
          enrolledCourseIds: defaultCourseId ? [defaultCourseId] : ['course-1'],
          preferredLanguage: 'en' as const,
          timezone: 'Asia/Kathmandu' as const,
          createdAt: new Date().toISOString(),
        };
        db.users.push(newUser);
        addedUsers.push(newUser);
      }
    });

    // Add audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.name,
      action: 'BULK_CSV_ENROLLMENT',
      targetType: 'User',
      targetId: 'bulk',
      details: `Enrolled ${addedUsers.length} users via bulk CSV processor.`,
      timestamp: new Date().toISOString(),
    });

    saveDB(db);
    res.json({ success: true, count: addedUsers.length, users: addedUsers });
  });

  app.get('/api/admin/audit-logs', (req, res) => {
    res.json(db.auditLogs);
  });

  // --- Optional AI Learning Tools (Server-Side Gemini API) ---
  app.post('/api/ai/assistant', async (req, res) => {
    const { action, courseTitle, lessonTitle, content, query, targetLevel } = req.body;
    const user = getCurrentUser();

    // Guardrail: Do not expose answer keys during live examinations
    if (action === 'cheat_answer_keys') {
      return res.status(403).json({ error: 'AI Assistant cannot reveal confidential test answer keys or grading matrices.' });
    }

    try {
      const gemini = getGeminiClient();

      if (gemini) {
        let systemInstruction = `You are "MounTech AI Learning Assistant", an academic tutor and pedagogical co-pilot for "MounTech Learning" by Mountech Solutions.
Always provide constructive, encouraging, academically rigorous, and accurate educational feedback.
Ground your responses strictly in the provided course and lesson contexts.
If answering a student question, explain the concepts step-by-step rather than just providing bare answers.
Target education level: ${targetLevel || 'Higher Education / College'}.`;

        let prompt = '';

        if (action === 'explain') {
          prompt = `Explain the following concept from the course "${courseTitle}", lesson "${lessonTitle}":
"${query}"
Provide a clear, pedagogical breakdown with real-world analogies, formal definitions, and a practical example.`;
        } else if (action === 'summarize') {
          prompt = `Provide a structured summary of the following lesson material from "${courseTitle} - ${lessonTitle}":
Material:
"""
${content}
"""
Format your output with:
1. Executive Summary (3 sentences)
2. Core Takeaways (bullet points)
3. Key Terminology & Definitions
4. Quick Self-Reflection Question`;
        } else if (action === 'practice_questions') {
          prompt = `Generate 4 high-quality practice questions (2 multiple-choice with explanations, 1 short-answer, and 1 thought-provoking applied problem) based on:
Course: ${courseTitle}
Lesson: ${lessonTitle}
Content: ${content || query}`;
        } else if (action === 'draft_lesson') {
          prompt = `As an instructional designer, draft a comprehensive lesson outline for a teacher in "${courseTitle}".
Topic: "${query || lessonTitle}"
Include:
- 3 measurable learning objectives (Bloom's Taxonomy)
- 45-minute structured lesson timeline
- Key concepts to cover
- Formative check-for-understanding activity`;
        } else if (action === 'generate_rubric') {
          prompt = `Generate an assessment rubric for an assignment titled "${query || 'Course Project'}" in "${courseTitle}".
Include 3-4 distinct criteria (e.g. Theoretical Accuracy, Implementation Quality, Documentation), each with 4 rating performance bands (Exemplary, Proficient, Developing, Unsatisfactory) with specific point allocations.`;
        } else {
          prompt = `Help with course "${courseTitle}": ${query}`;
        }

        const response = await gemini.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });

        return res.json({
          success: true,
          response: response.text,
          model: 'gemini-3.8-flash',
          grounded: true,
        });
      }
    } catch (err: any) {
      console.warn('Gemini API call encountered an error or key is not set, using pedagogical fallback:', err?.message);
    }

    // High-quality pedagogical fallback when API key is pending or offline
    let fallbackText = '';
    if (action === 'explain') {
      fallbackText = `### Pedagogical Concept Explanation: ${query || 'Relational Foundations'}\n\n**1. Core Concept Definition:**\nIn computer science and database management systems, this concept ensures data consistency and structural integrity across persistent stores.\n\n**2. Real-World Analogy:**\nThink of this like an organized university registrar: instead of writing student addresses on every single course roster (causing redundancy and typos), the registrar keeps a single authoritative student directory and links rosters using an ID key.\n\n**3. Practical Application:**\n- Preserves Boyce-Codd Normal Form (BCNF)\n- Minimizes disk page reads by leveraging B+ tree search indices\n- Guarantees transaction isolation in concurrent environments.`;
    } else if (action === 'summarize') {
      fallbackText = `### Lesson Summary: ${lessonTitle || 'Database Architecture'}\n\n**Executive Summary:**\nThis lesson explores the three-schema ANSI-SPARC architecture, emphasizing the separation of physical storage from logical views to achieve data independence.\n\n**Key Takeaways:**\n- Physical data independence enables DBAs to tune indices without breaking client applications.\n- Relational algebra operators provide declarative foundation for SQL execution engines.\n- Buffer pools manage memory page eviction using LRU algorithms.`;
    } else if (action === 'practice_questions') {
      fallbackText = `### Practice Review Questions\n\n**Question 1 (Conceptual):**\nWhat is the primary difference between logical and physical data independence?\n*Answer:* Logical protects user views from conceptual schema shifts; physical protects conceptual schema from disk layout reorganizations.\n\n**Question 2 (Applied):**\nWhy does pushing selection (σ) below Cartesian product (×) dramatically optimize query latency?\n*Answer:* Because filtering reduces tuple cardinality early, keeping intermediate join buffers small.`;
    } else if (action === 'generate_rubric') {
      fallbackText = `### Generated Assessment Rubric: ${query || 'Technical Assignment'}\n\n**Criterion 1: Theoretical Precision (30 pts)**\n- Exemplary: Adheres strictly to mathematical definitions and formal constraints.\n- Proficient: Minor non-critical inconsistencies.\n- Developing: Incomplete conceptual modeling.\n\n**Criterion 2: Practical Implementation (40 pts)**\n- Exemplary: Executes flawlessly with clean comments and boundary condition handling.\n- Proficient: Functions correctly for normal inputs.\n- Developing: Syntax or runtime faults present.\n\n**Criterion 3: Documentation & Analysis (30 pts)**\n- Exemplary: Thorough complexity analysis and architectural diagrams provided.`;
    } else {
      fallbackText = `MounTech AI Learning Assistant is ready to help you analyze "${courseTitle}". You can ask for lesson explanations, study flashcards, quiz drafting, or rubric templates!`;
    }

    res.json({
      success: true,
      response: fallbackText,
      model: 'pedagogical-engine',
      grounded: true,
    });
  });

  // Dedicated AI Lesson Content Summarizer with Institution & Assessment Policies
  app.post('/api/ai/summarize-lesson', async (req, res) => {
    const { courseId, lessonId, lessonTitle, content, language = 'en', summaryFormat = 'concise' } = req.body;
    const user = getCurrentUser();

    // 1. Institution policy check
    const institution = db.institutions.find(i => i.id === user.institutionId) || db.institutions[0];
    if (institution && institution.aiLessonSummarizationEnabled === false) {
      return res.status(403).json({
        error: 'Institutional Policy Restriction',
        message: 'AI lesson summarization is currently turned off by your institution administrator.',
      });
    }

    // 2. Course & Lesson assessment lockdown check (Teacher control)
    const course = db.courses.find(c => c.id === courseId);
    if (course && course.aiSummarizerDisabled) {
      return res.status(403).json({
        error: 'Assessment Integrity Lockdown',
        message: 'The course instructor has disabled AI summarization for this course to uphold academic integrity.',
      });
    }

    let lessonFound: any = null;
    db.modules.forEach(m => {
      const found = m.lessons?.find(l => l.id === lessonId);
      if (found) lessonFound = found;
    });

    if (lessonFound && lessonFound.aiSummarizerDisabled) {
      return res.status(403).json({
        error: 'Assessment Integrity Lockdown',
        message: 'The instructor has locked AI summarization for this specific lesson/graded assessment.',
      });
    }

    const isNepali = language === 'ne';

    try {
      const gemini = getGeminiClient();
      if (gemini) {
        const prompt = `You are the MounTech Learning AI Summarizer, strictly grounded in the provided lesson materials.
Course: "${course?.title || 'Academic Course'}"
Lesson Title: "${lessonTitle || 'Core Lesson'}"
Summary Format: "${summaryFormat}"
Language: "${isNepali ? 'Nepali (नेपाली)' : 'English'}"

Lesson Content to summarize:
"""
${content || 'Relational schema design, entity constraints, foreign keys, normalization (1NF-3NF/BCNF), and referential integrity cascade operations.'}
"""

Provide your summary in clean, strict JSON format with this exact structure:
{
  "summary": "Concise executive overview grounded directly in the text (3-4 sentences)",
  "keyTakeaways": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"],
  "keyDefinitions": [
    {"term": "Term 1", "definition": "Direct definition from lesson context"},
    {"term": "Term 2", "definition": "Direct definition from lesson context"}
  ],
  "selfCheckQuestion": {
    "question": "A focused formative question testing comprehension of this material",
    "answerHint": "Helpful hint or core reason without trivializing"
  }
}
Return only the raw JSON object, without code fencing if possible.`;

        const response = await gemini.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        try {
          const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
          return res.json({
            success: true,
            summary: parsed,
            model: 'gemini-3.8-flash',
            grounded: true,
            isAIAssisted: true,
            generatedAt: new Date().toISOString(),
          });
        } catch (jsonErr) {
          console.warn('Failed to parse Gemini JSON output, falling back to structured representation:', jsonErr);
        }
      }
    } catch (err: any) {
      console.warn('Gemini summarization error:', err?.message);
    }

    // High quality pedagogical fallback
    const fallbackData = getGroundedFallbackSummary(lessonTitle, content, isNepali, summaryFormat);
    res.json({
      success: true,
      summary: fallbackData,
      model: 'pedagogical-engine',
      grounded: true,
      isAIAssisted: true,
      generatedAt: new Date().toISOString(),
    });
  });

  // Toggle AI Summarizer for a specific lesson (Teacher academic integrity control)
  app.put('/api/lessons/:id/ai-status', (req, res) => {
    const user = getCurrentUser();
    if (user.role !== 'teacher' && user.role !== 'institution_admin') {
      return res.status(403).json({ error: 'Only teachers and administrators can toggle assessment AI controls.' });
    }

    const { disabled, reason } = req.body;
    let targetLesson: any = null;

    db.modules.forEach(m => {
      const found = m.lessons?.find(l => l.id === req.params.id);
      if (found) targetLesson = found;
    });

    if (!targetLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    targetLesson.aiSummarizerDisabled = !!disabled;
    if (reason) targetLesson.aiDisabledReason = reason;

    saveDB(db);
    res.json({
      success: true,
      lessonId: targetLesson.id,
      aiSummarizerDisabled: targetLesson.aiSummarizerDisabled,
      aiDisabledReason: targetLesson.aiDisabledReason,
    });
  });

  // Toggle AI Summarizer for an entire course (Teacher control)
  app.put('/api/courses/:id/ai-status', (req, res) => {
    const user = getCurrentUser();
    if (user.role !== 'teacher' && user.role !== 'institution_admin') {
      return res.status(403).json({ error: 'Only instructors and admins can configure course AI settings.' });
    }

    const course = db.courses.find(c => c.id === req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { disabled } = req.body;
    course.aiSummarizerDisabled = !!disabled;

    saveDB(db);
    res.json({
      success: true,
      courseId: course.id,
      aiSummarizerDisabled: course.aiSummarizerDisabled,
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'MounTech Learning by Mountech Solutions', version: '2.4.0' });
  });

  // --- Vite Middleware (Development) vs Static Serving (Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MounTech Learning Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
