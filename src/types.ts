export type Role = 'super_admin' | 'institution_admin' | 'teacher' | 'ta' | 'student' | 'parent';

export type PermissionKey =
  | 'courses.view'
  | 'courses.create'
  | 'courses.edit'
  | 'courses.publish'
  | 'courses.delete'
  | 'grades.view'
  | 'grades.grade'
  | 'grades.override'
  | 'grades.export'
  | 'quizzes.create'
  | 'quizzes.grade'
  | 'assignments.create'
  | 'assignments.grade'
  | 'forums.post'
  | 'forums.moderate'
  | 'announcements.create'
  | 'live_class.host'
  | 'live_class.join'
  | 'certificates.issue'
  | 'certificates.verify'
  | 'tenants.manage'
  | 'tenants.switch'
  | 'users.manage'
  | 'users.view_audit'
  | 'billing.manage'
  | 'analytics.tenant'
  | 'analytics.platform';

export interface RBACPermission {
  key: PermissionKey;
  label: string;
  category: 'Course Management' | 'Grading & Assessment' | 'Community & Live' | 'Administration & Security' | 'Monetization & Analytics';
  description: string;
  allowedRoles: Role[];
}

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  institutionId: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface MFAFactor {
  userId: string;
  enabled: boolean;
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  lastVerifiedAt?: string;
}

export type SSOProvider = 'google' | 'microsoft' | 'saml_okta';

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  institutionId: string;
  permissions: PermissionKey[];
  mfaVerified: boolean;
  iat: number;
  exp: number;
  jti: string;
}

export type EducationalLevel =
  | 'primary_secondary'
  | 'higher_secondary'
  | 'diploma_professional'
  | 'bachelor_master';

export type Language = 'en' | 'ne';

export type Timezone = 'Asia/Kathmandu' | 'UTC' | 'America/New_York' | 'Europe/London' | 'Asia/Kolkata';

export type GradingSystem = 'percentage' | 'gpa_4' | 'letter_grade' | 'points';

export interface NotificationPreferences {
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  notifyOnAnnouncements: { inApp: boolean; email: boolean };
  notifyOnNewAssignments: { inApp: boolean; email: boolean };
  notifyOnGradedSubmissions: { inApp: boolean; email: boolean };
  notifyOnUpcomingDeadlines: { inApp: boolean; email: boolean };
  deadlineReminderHours: number; // e.g. 24 or 48 hours
  digestFrequency: 'instant' | 'daily_digest';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId: string;
  avatarUrl?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  linkedStudentIds?: string[]; // for parent role
  department?: string;
  enrolledCourseIds?: string[]; // for students
  teachingCourseIds?: string[]; // for teachers
  taCourseIds?: string[]; // for TAs
  mfaEnabled?: boolean;
  ssoProvider?: SSOProvider;
  preferredLanguage?: Language;
  timezone?: Timezone;
  notificationPreferences?: NotificationPreferences;
  createdAt: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  level: EducationalLevel;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  country: string;
  city: string;
  academicYear: string;
  gradingSystem: GradingSystem;
  completionRequirement: string;
  defaultTimezone: Timezone;
  aiFeaturesEnabled: boolean;
  aiLessonSummarizationEnabled?: boolean;
  aiDisabledForGradedAssessments?: boolean;
  totalStudents: number;
  totalTeachers: number;
}

export interface Program {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  level: EducationalLevel;
  durationYears: number;
  description: string;
}

export interface AcademicTerm {
  id: string;
  institutionId: string;
  name: string; // e.g. "Fall 2026", "Semester 1", "Grade 10 - Term 2"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Section {
  id: string;
  courseId: string;
  name: string; // e.g. "Section A", "Morning Batch"
  teacherId: string;
  studentIds: string[];
}

export interface GradeCategory {
  id: string;
  name: string; // e.g. "Assignments", "Quizzes", "Midterm", "Final Project"
  weight: number; // percentage, sum = 100
}

export type GradingCategory = GradeCategory;
export type AttendanceStudentStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Course {
  id: string;
  institutionId: string;
  programId: string;
  termId: string;
  code: string; // e.g. "CS101", "MATH201"
  title: string;
  description: string;
  syllabus: string;
  learningOutcomes: string[];
  thumbnail: string;
  teacherIds: string[];
  primaryTeacherName: string;
  level: EducationalLevel;
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
  gradeCategories: GradeCategory[];
  modulesCount: number;
  lessonsCount: number;
  assignmentsCount: number;
  enrolledStudentsCount: number;
  color: string;
  createdAt: string;
  credits?: number;
  price?: number; // 0 = Free, or paid marketplace price in USD
  rating?: number; // 1-5 rating average
  reviewsCount?: number;
  reviewNotes?: string;
  reviewedBy?: string;
  coverImage?: string;
  term?: string;
  educationLevel?: string;
  department?: string;
  instructorAvatar?: string;
  instructorName?: string;
  aiSummarizerDisabled?: boolean;
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  size?: string;
}

export interface LessonNote {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  order: number;
  durationMinutes: number;
  objectives?: string[];
  richTextContent?: string;
  videoUrl?: string;
  videoTranscript?: string;
  resources?: LessonResource[];
  completionRule?: 'view' | 'submission' | 'passing_score' | 'teacher_approval';
  isPublished: boolean;
  type?: string;
  contentSummary?: string;
  completionCriteria?: string;
  aiSummarizerDisabled?: boolean;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  description: string;
  prerequisiteModuleId?: string;
  releaseDate?: string;
  isPublished: boolean;
  lessons: Lesson[];
}

export interface RubricCriterion {
  id: string;
  title?: string;
  criterion?: string;
  description: string;
  maxPoints: number;
  ratings?: {
    points: number;
    label: string; // e.g. "Exemplary", "Proficient", "Developing", "Unsatisfactory"
    description: string;
  }[];
}

export interface Rubric {
  id: string;
  title: string;
  criteria: RubricCriterion[];
}

export interface Assignment {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  points: number;
  categoryId: string; // references GradeCategory
  dueDate: string;
  availabilityStart: string;
  availabilityEnd: string;
  acceptedFormats: ('text' | 'file' | 'url')[];
  maxAttempts: number;
  allowLateSubmissions: boolean;
  latePenaltyPercentPerDay?: number;
  rubric?: Rubric;
  attachments?: { name: string; url: string; size: string }[];
  isPublished: boolean;
  isGroupAssignment?: boolean;
}

export interface Submission {
  id: string;
  assignmentId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  attemptNumber: number;
  submittedAt: string;
  submissionType: 'text' | 'file' | 'url';
  content: string;
  fileUrl?: string;
  fileName?: string;
  status: 'submitted' | 'graded' | 'late' | 'resubmitted' | 'missing';
  score?: number;
  isPublishedGrade: boolean; // teacher can save draft
  gradedBy?: string;
  gradedAt?: string;
  generalFeedback?: string;
  rubricScores?: { criterionId: string; points: number; comment?: string }[];
  auditHistory?: { changedBy: string; changedAt: string; oldScore?: number; newScore: number; reason: string }[];
}

export type QuestionType =
  | 'multiple_choice'
  | 'single_choice'
  | 'multiple_answer'
  | 'true_false'
  | 'short_answer'
  | 'essay'
  | 'matching';

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options?: any[]; // string or { id: string, text: string }
  correctAnswer?: string | string[] | boolean; // hidden from student during quiz
  correctOptionIds?: string[];
  explanation?: string;
  matchingPairs?: { left: string; right: string }[];
}

export interface Quiz {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  dueDate: string;
  availableUntil: string;
  randomizeQuestions: boolean;
  categoryId: string;
  points: number;
  releaseAnswersDate?: string;
  isPublished: boolean;
  questions: QuizQuestion[];
  questionsCount?: number;
  passingScore?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'graded';
  responses: Record<string, any>; // questionId -> answer
  score?: number;
  totalPossiblePoints: number;
  feedback?: string;
  needsTeacherReview: boolean; // if essays need manual evaluation
  percentage?: number;
  maxScore?: number;
  passed?: boolean;
}

export interface StudentProgress {
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
  lastAccessedAt: string;
  overallProgressPercent: number;
  bookmarkedLessonIds: string[];
}

export interface GradeSummaryItem {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  assignmentGrades: Record<string, { score: number; maxPoints: number; status: 'graded' | 'missing' | 'late' | 'excused' | 'draft' }>;
  quizGrades: Record<string, { score: number; maxPoints: number; status: 'graded' | 'in_progress' | 'missing' }>;
  currentWeightedPercentage: number;
  letterGrade: string;
  gpa: number;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  sectionId?: string;
  date: string;
  title: string; // e.g. "Lecture 08: Relational Algebra"
  type: 'physical' | 'online';
  meetingLink?: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  records: {
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
  }[];
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  createdAt: string;
  isPinned: boolean;
  commentsCount: number;
}

export interface DiscussionPost {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatar?: string;
  createdAt: string;
  isPinned: boolean;
  upvotes: number;
  userHasUpvoted?: boolean;
  replies: {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: Role;
    authorAvatar?: string;
    content: string;
    createdAt: string;
    isInstructorEndorsed?: boolean;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'grade' | 'announcement' | 'deadline' | 'attendance' | 'system';
  courseId?: string;
  courseTitle?: string;
  link?: string;
  linkId?: string;
  read: boolean;
  channel?: 'in_app' | 'email' | 'both';
  emailStatus?: 'delivered' | 'sent' | 'queued' | 'disabled';
  meta?: {
    score?: number;
    maxPoints?: number;
    dueDate?: string;
    authorName?: string;
  };
  createdAt: string;
}

export interface EmailLogItem {
  id: string;
  userId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  previewText: string;
  htmlBody: string;
  category: 'announcement' | 'assignment' | 'grade' | 'deadline' | 'system';
  status: 'delivered' | 'sent' | 'queued';
  sentAt: string;
}

export interface LessonSummaryResponse {
  summary: string;
  keyTakeaways: string[];
  keyDefinitions: { term: string; definition: string }[];
  selfCheckQuestion: { question: string; answerHint: string };
  model: string;
  grounded: boolean;
  generatedAt: string;
  tokenCountEstimate?: number;
  isAiAssisted: boolean;
  transparencyNotice: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  courseId?: string;
  courseTitle?: string;
  subject: string;
  body: string;
  sentAt: string;
  read: boolean;
}

export interface AuditLogEntry {
  id: string;
  institutionId: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  paymentStatus: 'free' | 'paid';
  amountPaid: number;
  stripePaymentId?: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  grade?: string;
  verificationUrl: string;
  completionScore?: number;
}

export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}
