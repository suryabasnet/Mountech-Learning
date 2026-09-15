import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Institution,
  Program,
  AcademicTerm,
  Course,
  Module,
  Lesson,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  AttendanceRecord,
  Announcement,
  DiscussionPost,
  NotificationItem,
  DirectMessage,
  AuditLogEntry,
  StudentProgress,
  Language,
  Timezone,
  EmailLogItem,
  NotificationPreferences,
  LessonSummaryResponse,
  EnrollmentRecord,
  Certificate,
  CourseReview,
  Role,
  PermissionKey,
  UserSession,
  SSOProvider,
} from '../types';
import { translations } from '../translations';
import { getRolePermissions, hasPermission } from '../data/rbacConfig';

export type ActiveView =
  | 'dashboard'
  | 'catalog'
  | 'marketplace'
  | 'certificates'
  | 'course_workspace'
  | 'lesson_viewer'
  | 'assignments'
  | 'assignment_details'
  | 'quizzes'
  | 'quiz_taking'
  | 'grading_workspace'
  | 'gradebook'
  | 'calendar_attendance'
  | 'announcements'
  | 'discussions'
  | 'messages'
  | 'institution_admin'
  | 'super_admin'
  | 'user_management'
  | 'ai_lab'
  | 'architecture_erd'
  | 'auth_rbac';

interface LMSContextType {
  currentUser: User | null;
  currentInstitution: Institution | null;
  institution: Institution;
  institutions: Institution[];
  allUsers: User[];
  courses: Course[];
  modules: Module[];
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  discussions: DiscussionPost[];
  notifications: NotificationItem[];
  emailLogs: EmailLogItem[];
  messages: DirectMessage[];
  auditLogs: AuditLogEntry[];
  studentProgress: StudentProgress | null;
  reviews: CourseReview[];
  enrollments: EnrollmentRecord[];
  certificates: Certificate[];
  isEnrolled: (courseId: string) => boolean;
  permissions: PermissionKey[];
  sessions: UserSession[];
  activeSession: UserSession | null;
  hasUserPermission: (perm: PermissionKey) => boolean;
  
  // Navigation & UI State
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  selectedAssignmentId: string | null;
  setSelectedAssignmentId: (id: string | null) => void;
  selectedQuizId: string | null;
  setSelectedQuizId: (id: string | null) => void;
  showLandingPage: boolean;
  setShowLandingPage: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  profileModalTab: 'profile' | 'notifications' | 'emails';
  setProfileModalTab: (tab: 'profile' | 'notifications' | 'emails') => void;
  openProfileModal: (tab?: 'profile' | 'notifications' | 'emails') => void;
  showAiModal: boolean;
  setShowAiModal: (show: boolean) => void;
  aiModalInitialPrompt?: string;
  openAiAssistant: (prompt?: string) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalTab: 'login' | 'register' | 'mfa' | 'sso' | 'sessions' | 'rbac';
  setAuthModalTab: (tab: 'login' | 'register' | 'mfa' | 'sso' | 'sessions' | 'rbac') => void;
  openAuthModal: (tab?: 'login' | 'register' | 'mfa' | 'sso' | 'sessions' | 'rbac') => void;
  
  // Localization & Settings
  language: Language;
  setLanguage: (lang: Language) => void;
  timezone: Timezone;
  setTimezone: (tz: Timezone) => void;
  t: (key: keyof typeof translations.en) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  switchUser: (userId: string) => Promise<void>;
  login: (email: string, password?: string, mfaCode?: string) => Promise<{ success: boolean; requiresMfa?: boolean; error?: string }>;
  registerUser: (data: { name: string; email: string; role: Role; institutionId?: string; department?: string; password?: string }) => Promise<boolean>;
  setupMfa: () => Promise<{ secret: string; otpauthUrl: string; qrCodeUrl: string; backupCodes: string[] } | null>;
  verifyMfa: (code: string) => Promise<boolean>;
  disableMfa: () => Promise<boolean>;
  loginWithSso: (provider: SSOProvider, tenantId?: string) => Promise<boolean>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  switchTenant: (tenantId: string) => Promise<boolean>;
  refreshAllData: () => Promise<void>;
  createCourse: (data: Partial<Course>) => Promise<Course | null>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<Course | null>;
  duplicateCourse: (id: string) => Promise<Course | null>;
  togglePublishCourse: (id: string) => Promise<void>;
  createModule: (courseId: string, title: string, description: string) => Promise<Module | null>;
  createLesson: (moduleId: string, lessonData: Partial<Lesson>) => Promise<Lesson | null>;
  markLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
  toggleLessonBookmark: (courseId: string, lessonId: string) => Promise<void>;
  createAssignment: (data: Partial<Assignment>) => Promise<Assignment | null>;
  submitAssignment: (assignmentId: string, data: { submissionType: 'text' | 'file' | 'url'; content: string; fileName?: string }) => Promise<Submission | null>;
  gradeSubmission: (submissionId: string, data: { score: number; generalFeedback?: string; rubricScores?: any[]; isPublishedGrade: boolean; auditReason?: string }) => Promise<void>;
  submitQuizAttempt: (quizId: string, responses: Record<string, any>, startedAt: string) => Promise<QuizAttempt | null>;
  markAttendance: (sessionData: Partial<AttendanceRecord>) => Promise<void>;
  createAnnouncement: (courseId: string, title: string, content: string, isPinned?: boolean) => Promise<void>;
  createDiscussion: (courseId: string, title: string, content: string) => Promise<void>;
  replyDiscussion: (discussionId: string, content: string) => Promise<void>;
  sendDirectMessage: (recipientId: string, recipientName: string, subject: string, body: string, courseId?: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  fetchEmailLogs: () => Promise<void>;
  updateNotificationPreferences: (userId: string, prefs: Partial<NotificationPreferences>) => Promise<boolean>;
  checkDeadlinesAndRemind: () => Promise<{ success: boolean; countDispatched: number; message: string }>;
  summarizeLesson: (payload: {
    courseId: string;
    lessonId: string;
    lessonTitle: string;
    content: string;
    language?: string;
    summaryFormat?: string;
  }) => Promise<LessonSummaryResponse>;
  toggleLessonAiStatus: (lessonId: string, disabled: boolean, reason?: string) => Promise<boolean>;
  toggleCourseAiStatus: (courseId: string, disabled: boolean) => Promise<boolean>;
  bulkEnrollUsers: (csvData: string, defaultCourseId?: string) => Promise<{ count: number }>;
  updateInstitution: (id: string, data: Partial<Institution>) => Promise<void>;
  updateInstitutionSettings: (data: Partial<Institution>) => Promise<void>;
  askAIAssistant: (payload: { action: string; query?: string; courseTitle?: string; lessonTitle?: string; content?: string }) => Promise<string>;
  checkoutCourse: (courseId: string, cardInfo?: { cardNumber?: string; cardholderName?: string }) => Promise<{ success: boolean; message?: string; transaction?: any; enrollment?: EnrollmentRecord }>;
  addReview: (courseId: string, rating: number, comment: string) => Promise<CourseReview | null>;
  submitCourseForReview: (courseId: string, notes?: string) => Promise<void>;
  reviewCourseDecision: (courseId: string, decision: 'approve' | 'reject', notes?: string) => Promise<void>;
  issueCertificate: (courseId: string) => Promise<Certificate | null>;

  // User Management
  createUser: (data: Partial<User>) => Promise<User | null>;
  updateUser: (id: string, data: Partial<User>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activeSession, setActiveSession] = useState<UserSession | null>(null);

  // UI state
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>('course-1');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>('les-1');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>('assign-1');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>('quiz-1');
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'notifications' | 'emails'>('profile');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiModalInitialPrompt, setAiModalInitialPrompt] = useState<string | undefined>(undefined);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'mfa' | 'sso' | 'sessions' | 'rbac'>('login');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Localization
  const [language, setLanguage] = useState<Language>('en');
  const [timezone, setTimezone] = useState<Timezone>('Asia/Kathmandu');

  const t = useCallback((key: keyof typeof translations.en): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  const openAiAssistant = (prompt?: string) => {
    setAiModalInitialPrompt(prompt);
    setShowAiModal(true);
  };

  const openProfileModal = (tab: 'profile' | 'notifications' | 'emails' = 'profile') => {
    setProfileModalTab(tab);
    setShowProfileModal(true);
  };

  const openAuthModal = (tab: 'login' | 'register' | 'mfa' | 'sso' | 'sessions' | 'rbac' = 'login') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  const hasUserPermission = useCallback((perm: PermissionKey): boolean => {
    if (!currentUser) return false;
    return hasPermission(currentUser.role as Role, perm);
  }, [currentUser]);

  const refreshAllData = useCallback(async () => {
    try {
      // 1. Auth & Me
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
        setCurrentInstitution(meData.institution);
        if (meData.permissions) setPermissions(meData.permissions);
        if (meData.session) setActiveSession(meData.session);
        if (meData.user?.preferredLanguage) setLanguage(meData.user.preferredLanguage);
        if (meData.user?.timezone) setTimezone(meData.user.timezone);
      }

      // 2. Fetch parallel lists
      const [
        instRes,
        coursesRes,
        assignRes,
        quizzesRes,
        attRes,
        annRes,
        discRes,
        notifRes,
        emailRes,
        msgRes,
        usersRes,
        auditRes,
        reviewsRes,
        enrollmentsRes,
        certificatesRes,
        sessRes,
      ] = await Promise.all([
        fetch('/api/institutions'),
        fetch('/api/courses'),
        fetch('/api/assignments'),
        fetch('/api/quizzes'),
        fetch('/api/attendance'),
        fetch('/api/announcements'),
        fetch('/api/discussions'),
        fetch('/api/notifications'),
        fetch('/api/notifications/emails'),
        fetch('/api/messages'),
        fetch('/api/admin/users'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/reviews'),
        fetch('/api/enrollments'),
        fetch('/api/certificates'),
        fetch('/api/auth/sessions'),
      ]);

      if (instRes.ok) setInstitutions(await instRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (assignRes.ok) setAssignments(await assignRes.json());
      if (quizzesRes.ok) setQuizzes(await quizzesRes.json());
      if (attRes.ok) setAttendance(await attRes.json());
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (discRes.ok) setDiscussions(await discRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (emailRes.ok) setEmailLogs(await emailRes.json());
      if (msgRes.ok) setMessages(await msgRes.json());
      if (usersRes.ok) setAllUsers(await usersRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json());
      if (certificatesRes.ok) setCertificates(await certificatesRes.json());
      if (sessRes.ok) setSessions(await sessRes.json());

      // 3. Course-specific sub-data if course selected
      if (selectedCourseId) {
        const [modRes, progRes, subRes] = await Promise.all([
          fetch(`/api/courses/${selectedCourseId}/modules`),
          fetch(`/api/courses/${selectedCourseId}/progress`),
          fetch(`/api/assignments/${selectedAssignmentId || 'assign-1'}/submissions`),
        ]);
        if (modRes.ok) setModules(await modRes.json());
        if (progRes.ok) setStudentProgress(await progRes.json());
        if (subRes.ok) setSubmissions(await subRes.json());
      }
    } catch (err) {
      console.error('Error fetching LMS data:', err);
    }
  }, [selectedCourseId, selectedAssignmentId]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle course changes
  useEffect(() => {
    if (selectedCourseId) {
      fetch(`/api/courses/${selectedCourseId}/modules`)
        .then(r => r.ok ? r.json() : [])
        .then(mods => {
          setModules(mods);
          if (mods.length > 0 && mods[0].lessons?.length > 0) {
            setSelectedLessonId(mods[0].lessons[0].id);
          }
        });

      fetch(`/api/courses/${selectedCourseId}/progress`)
        .then(r => r.ok ? r.json() : null)
        .then(prog => setStudentProgress(prog));
    }
  }, [selectedCourseId]);

  // Handle assignment changes
  useEffect(() => {
    if (selectedAssignmentId) {
      fetch(`/api/assignments/${selectedAssignmentId}/submissions`)
        .then(r => r.ok ? r.json() : [])
        .then(subs => setSubmissions(subs));
    }
  }, [selectedAssignmentId]);

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        await refreshAllData();
      }
    } catch (err) {
      console.error('Error switching user:', err);
    }
  };

  const login = async (email: string, password?: string, mfaCode?: string): Promise<{ success: boolean; requiresMfa?: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfaCode }),
      });
      const data = await res.json();
      if (data.requiresMfa) {
        return { success: false, requiresMfa: true };
      }
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setCurrentUser(data.user);
      if (data.permissions) setPermissions(data.permissions);
      if (data.session) setActiveSession(data.session);
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during login' };
    }
  };

  const registerUser = async (formData: { name: string; email: string; role: Role; institutionId?: string; department?: string; password?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.permissions) setPermissions(data.permissions);
        if (data.session) setActiveSession(data.session);
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Error registering user:', err);
    }
    return false;
  };

  const setupMfa = async (): Promise<{ secret: string; otpauthUrl: string; qrCodeUrl: string; backupCodes: string[] } | null> => {
    try {
      const res = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Error setting up MFA:', err);
    }
    return null;
  };

  const verifyMfa = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, code }),
      });
      if (res.ok) {
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Error verifying MFA:', err);
    }
    return false;
  };

  const disableMfa = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      if (res.ok) {
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Error disabling MFA:', err);
    }
    return false;
  };

  const loginWithSso = async (provider: SSOProvider, tenantId?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/sso/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, tenantId: tenantId || currentInstitution?.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.permissions) setPermissions(data.permissions);
        if (data.session) setActiveSession(data.session);
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Error SSO login:', err);
    }
    return false;
  };

  const revokeSession = async (sessionId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Error revoking session:', err);
    }
    return false;
  };

  const switchTenant = async (tenantId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/tenant/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      if (res.ok) {
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Error switching tenant:', err);
    }
    return false;
  };

  const createCourse = async (data: Partial<Course>): Promise<Course | null> => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newC = await res.json();
        await refreshAllData();
        return newC;
      }
    } catch (err) {
      console.error('Failed to create course:', err);
    }
    return null;
  };

  const updateCourse = async (id: string, data: Partial<Course>): Promise<Course | null> => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        await refreshAllData();
        return updated;
      }
    } catch (err) {
      console.error('Failed to update course:', err);
    }
    return null;
  };

  const duplicateCourse = async (id: string): Promise<Course | null> => {
    try {
      const res = await fetch(`/api/courses/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const dup = await res.json();
        await refreshAllData();
        return dup;
      }
    } catch (err) {
      console.error('Failed to duplicate course:', err);
    }
    return null;
  };

  const togglePublishCourse = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}/toggle-publish`, { method: 'POST' });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to toggle course publish:', err);
    }
  };

  const createModule = async (courseId: string, title: string, description: string): Promise<Module | null> => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        const newMod = await res.json();
        await refreshAllData();
        return newMod;
      }
    } catch (err) {
      console.error('Failed to create module:', err);
    }
    return null;
  };

  const createLesson = async (moduleId: string, lessonData: Partial<Lesson>): Promise<Lesson | null> => {
    try {
      const res = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
      });
      if (res.ok) {
        const newL = await res.json();
        await refreshAllData();
        return newL;
      }
    } catch (err) {
      console.error('Failed to create lesson:', err);
    }
    return null;
  };

  const markLessonComplete = async (courseId: string, lessonId: string) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        const prog = await res.json();
        setStudentProgress(prog);
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  };

  const toggleLessonBookmark = async (courseId: string, lessonId: string) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (studentProgress) {
          setStudentProgress({ ...studentProgress, bookmarkedLessonIds: data.bookmarkedLessonIds });
        }
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const submitAssignment = async (
    assignmentId: string,
    data: { submissionType: 'text' | 'file' | 'url'; content: string; fileName?: string }
  ): Promise<Submission | null> => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newSub = await res.json();
        setSubmissions(prev => [newSub, ...prev]);
        await refreshAllData();
        return newSub;
      }
    } catch (err) {
      console.error('Failed to submit assignment:', err);
    }
    return null;
  };

  const gradeSubmission = async (
    submissionId: string,
    data: { score: number; generalFeedback?: string; rubricScores?: any[]; isPublishedGrade: boolean; auditReason?: string }
  ) => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to grade submission:', err);
    }
  };

  const submitQuizAttempt = async (
    quizId: string,
    responses: Record<string, any>,
    startedAt: string
  ): Promise<QuizAttempt | null> => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, startedAt }),
      });
      if (res.ok) {
        const attempt = await res.json();
        setQuizAttempts(prev => [attempt, ...prev]);
        await refreshAllData();
        return attempt;
      }
    } catch (err) {
      console.error('Failed to submit quiz attempt:', err);
    }
    return null;
  };

  const markAttendance = async (sessionData: Partial<AttendanceRecord>) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to record attendance:', err);
    }
  };

  const createAnnouncement = async (courseId: string, title: string, content: string, isPinned?: boolean) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, title, content, isPinned }),
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to create announcement:', err);
    }
  };

  const createDiscussion = async (courseId: string, title: string, content: string) => {
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, title, content }),
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to create discussion:', err);
    }
  };

  const replyDiscussion = async (discussionId: string, content: string) => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  const sendDirectMessage = async (
    recipientId: string,
    recipientName: string,
    subject: string,
    body: string,
    courseId?: string
  ) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, recipientName, subject, body, courseId }),
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to send direct message:', err);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      await fetch('/api/notifications/clear', { method: 'POST' });
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const res = await fetch('/api/notifications/emails');
      if (res.ok) {
        setEmailLogs(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch email logs:', err);
    }
  };

  const updateNotificationPreferences = async (userId: string, prefs: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users/${userId}/notification-preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        const data = await res.json();
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, notificationPreferences: data.preferences } : null);
        }
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
    }
    return false;
  };

  const checkDeadlinesAndRemind = async (): Promise<{ success: boolean; countDispatched: number; message: string }> => {
    try {
      const res = await fetch('/api/notifications/check-deadlines', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await refreshAllData();
        return data;
      }
    } catch (err) {
      console.error('Failed to check deadlines:', err);
    }
    return { success: false, countDispatched: 0, message: 'Failed to check deadlines.' };
  };

  const createAssignment = async (data: Partial<Assignment>): Promise<Assignment | null> => {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newAssignment = await res.json();
        await refreshAllData();
        return newAssignment;
      }
    } catch (err) {
      console.error('Failed to create assignment:', err);
    }
    return null;
  };

  const summarizeLesson = async (payload: {
    courseId: string;
    lessonId: string;
    lessonTitle: string;
    content: string;
    language?: string;
    summaryFormat?: string;
  }): Promise<LessonSummaryResponse> => {
    try {
      const res = await fetch('/api/ai/summarize-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'Summarization request rejected');
      }

      const data = await res.json();
      return {
        summary: data.summary?.summary || 'Summary unavailable.',
        keyTakeaways: data.summary?.keyTakeaways || [],
        keyDefinitions: data.summary?.keyDefinitions || [],
        selfCheckQuestion: data.summary?.selfCheckQuestion || {
          question: 'What is the primary concept discussed in this lesson?',
          answerHint: 'Refer to key definitions above.',
        },
        model: data.model || 'gemini-3.8-flash',
        grounded: data.grounded ?? true,
        generatedAt: data.generatedAt || new Date().toISOString(),
        isAiAssisted: true,
        transparencyNotice:
          'Generated with Google Gemini 3.8 Flash upon student request. Grounded in provided syllabus and reading materials.',
      };
    } catch (err: any) {
      console.error('Failed to summarize lesson:', err);
      throw err;
    }
  };

  const toggleLessonAiStatus = async (lessonId: string, disabled: boolean, reason?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/ai-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled, reason }),
      });
      if (res.ok) {
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Failed to toggle lesson AI status:', err);
    }
    return false;
  };

  const toggleCourseAiStatus = async (courseId: string, disabled: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`/api/courses/${courseId}/ai-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled }),
      });
      if (res.ok) {
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Failed to toggle course AI status:', err);
    }
    return false;
  };

  const bulkEnrollUsers = async (csvData: string, defaultCourseId?: string) => {
    try {
      const res = await fetch('/api/admin/users/bulk-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData, defaultCourseId }),
      });
      if (res.ok) {
        const data = await res.json();
        await refreshAllData();
        return { count: data.count };
      }
    } catch (err) {
      console.error('Failed bulk enrollment:', err);
    }
    return { count: 0 };
  };

  const updateInstitution = async (id: string, data: Partial<Institution>) => {
    try {
      const res = await fetch(`/api/institutions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentInstitution(updated);
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to update institution:', err);
    }
  };

  const institution = currentInstitution || institutions[0] || ({} as Institution);
  const updateInstitutionSettings = async (data: Partial<Institution>) => {
    if (institution?.id) {
      await updateInstitution(institution.id, data);
    }
  };

  const askAIAssistant = async (payload: {
    action: string;
    query?: string;
    courseTitle?: string;
    lessonTitle?: string;
    content?: string;
  }): Promise<string> => {
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.response || 'No response generated.';
      }
    } catch (err: any) {
      console.error('AI assistant error:', err);
    }
    return 'An error occurred while contacting MounTech AI Assistant. Please try again.';
  };

  const isEnrolled = useCallback((courseId: string) => {
    if (!currentUser) return false;
    if (currentUser.role !== 'student') return true;
    return enrollments.some(e => e.courseId === courseId && e.studentId === currentUser.id);
  }, [currentUser, enrollments]);

  const checkoutCourse = async (courseId: string, cardInfo?: { cardNumber?: string; cardholderName?: string }) => {
    try {
      const res = await fetch('/api/enrollments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ...cardInfo }),
      });
      const data = await res.json();
      await refreshAllData();
      return data;
    } catch (err: any) {
      console.error('Checkout error:', err);
      return { success: false, message: err.message || 'Payment processing failed' };
    }
  };

  const addReview = async (courseId: string, rating: number, comment: string): Promise<CourseReview | null> => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, rating, comment }),
      });
      if (res.ok) {
        const rev = await res.json();
        await refreshAllData();
        return rev;
      }
    } catch (err) {
      console.error('Add review error:', err);
    }
    return null;
  };

  const submitCourseForReview = async (courseId: string, notes?: string): Promise<void> => {
    try {
      await fetch(`/api/courses/${courseId}/submit-for-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      await refreshAllData();
    } catch (err) {
      console.error('Submit for review error:', err);
    }
  };

  const reviewCourseDecision = async (courseId: string, decision: 'approve' | 'reject', notes?: string): Promise<void> => {
    try {
      await fetch(`/api/courses/${courseId}/review-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      });
      await refreshAllData();
    } catch (err) {
      console.error('Review course decision error:', err);
    }
  };

  const issueCertificate = async (courseId: string): Promise<Certificate | null> => {
    try {
      const res = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        const data = await res.json();
        await refreshAllData();
        return data.certificate;
      }
    } catch (err) {
      console.error('Issue certificate error:', err);
    }
    return null;
  };

  const createUser = async (data: Partial<User>): Promise<User | null> => {
    if (!hasUserPermission('users.manage' as PermissionKey)) throw new Error('Unauthorized');
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      mfaEnabled: false,
    } as User;
    setAllUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id: string, data: Partial<User>): Promise<User | null> => {
    if (!hasUserPermission('users.manage' as PermissionKey)) throw new Error('Unauthorized');
    let updatedUser: User | null = null;
    setAllUsers(prev => prev.map(u => {
      if (u.id === id) {
        updatedUser = { ...u, ...data, updatedAt: new Date().toISOString() } as User;
        return updatedUser;
      }
      return u;
    }));
    return updatedUser;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (!hasUserPermission('users.manage' as PermissionKey)) throw new Error('Unauthorized');
    if (id === currentUser?.id) throw new Error('Cannot delete yourself');
    
    setAllUsers(prev => prev.filter(u => u.id !== id));
    return true;
  };

  return (
    <LMSContext.Provider
      value={{
        createUser,
        updateUser,
        deleteUser,
        currentUser,
        currentInstitution,
        institutions,
        allUsers,
        courses,
        modules,
        assignments,
        submissions,
        quizzes,
        quizAttempts,
        attendance,
        announcements,
        discussions,
        notifications,
        emailLogs,
        messages,
        auditLogs,
        studentProgress,
        reviews,
        enrollments,
        certificates,
        isEnrolled,
        permissions,
        sessions,
        activeSession,
        hasUserPermission,
        showAuthModal,
        setShowAuthModal,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        login,
        registerUser,
        setupMfa,
        verifyMfa,
        disableMfa,
        loginWithSso,
        revokeSession,
        switchTenant,
        checkoutCourse,
        addReview,
        submitCourseForReview,
        reviewCourseDecision,
        issueCertificate,
        activeView,
        setActiveView,
        selectedCourseId,
        setSelectedCourseId,
        selectedLessonId,
        setSelectedLessonId,
        selectedAssignmentId,
        setSelectedAssignmentId,
        selectedQuizId,
        setSelectedQuizId,
        showLandingPage,
        setShowLandingPage,
        showProfileModal,
        setShowProfileModal,
        profileModalTab,
        setProfileModalTab,
        openProfileModal,
        showAiModal,
        setShowAiModal,
        aiModalInitialPrompt,
        openAiAssistant,
        language,
        setLanguage,
        timezone,
        setTimezone,
        t,
        searchQuery,
        setSearchQuery,
        switchUser,
        refreshAllData,
        createCourse,
        updateCourse,
        duplicateCourse,
        togglePublishCourse,
        createModule,
        createLesson,
        markLessonComplete,
        toggleLessonBookmark,
        createAssignment,
        submitAssignment,
        gradeSubmission,
        submitQuizAttempt,
        markAttendance,
        createAnnouncement,
        createDiscussion,
        replyDiscussion,
        sendDirectMessage,
        markNotificationsRead,
        clearNotifications,
        fetchEmailLogs,
        updateNotificationPreferences,
        checkDeadlinesAndRemind,
        summarizeLesson,
        toggleLessonAiStatus,
        toggleCourseAiStatus,
        bulkEnrollUsers,
        updateInstitution,
        institution,
        updateInstitutionSettings,
        askAIAssistant,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
