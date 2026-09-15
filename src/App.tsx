import React from 'react';
import { LMSProvider, useLMS } from './context/LMSContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboards/DashboardView';
import { CourseCatalog } from './components/courses/CourseCatalog';
import { MarketplaceCatalog } from './components/marketplace/MarketplaceCatalog';
import { CertificatesView } from './components/certificates/CertificatesView';
import { CourseWorkspace } from './components/courses/CourseWorkspace';
import { PublicSyllabusView } from './components/courses/PublicSyllabusView';
import { LessonViewer } from './components/learning/LessonViewer';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { AssignmentDetails } from './components/assignments/AssignmentDetails';
import { TeacherGradingWorkspace } from './components/grading/TeacherGradingWorkspace';
import { QuizzesView } from './components/quizzes/QuizzesView';
import { QuizTakingView } from './components/quizzes/QuizTakingView';
import { GradebookView } from './components/gradebook/GradebookView';
import { AttendanceCalendarView } from './components/attendance/AttendanceCalendarView';
import { AnnouncementsView } from './components/communication/AnnouncementsView';
import { DiscussionsView } from './components/communication/DiscussionsView';
import { MessagingView } from './components/communication/MessagingView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { UserManagementView } from './components/admin/UserManagementView';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { UserProfileModal } from './components/common/UserProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { ArchitectureAndERDView } from './components/architecture/ArchitectureAndERDView';
import { RbacMatrixView } from './components/auth/RbacMatrixView';

const AppContent: React.FC = () => {
  const { activeView } = useLMS();

  // Public Landing Page
  if (activeView === 'landing') {
    return <LandingPage />;
  }

  // View router
  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'catalog':
        return <CourseCatalog />;
      case 'marketplace':
        return <MarketplaceCatalog />;
      case 'certificates':
        return <CertificatesView />;
      case 'course_workspace':
        return <CourseWorkspace />;
      case 'public_syllabus':
        return <PublicSyllabusView />;
      case 'lesson_viewer':
        return <LessonViewer />;
      case 'assignments':
        return <AssignmentsView />;
      case 'assignment_details':
        return <AssignmentDetails />;
      case 'grading_workspace':
        return <TeacherGradingWorkspace />;
      case 'quizzes':
        return <QuizzesView />;
      case 'quiz_taking':
        return <QuizTakingView />;
      case 'gradebook':
        return <GradebookView />;
      case 'calendar_attendance':
      case 'calendar':
        return <AttendanceCalendarView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'discussions':
        return <DiscussionsView />;
      case 'messages':
        return <MessagingView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'institution_admin':
      case 'super_admin':
      case 'settings':
        return <AdminSettingsView />;
      case 'user_management':
        return <UserManagementView />;
      case 'architecture_erd':
        return <ArchitectureAndERDView />;
      case 'auth_rbac':
        return <RbacMatrixView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      {/* Universal Institutional Header */}
      <Header />

      {/* Main Workspace Layout with Responsive Collapsible Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-16">
          {renderCurrentView()}
        </main>
      </div>

      {/* User Profile & Notification Center Modal */}
      <UserProfileModal />

      {/* MounTech Identity & Security Engine Modal (MFA, SSO, RBAC, Sessions) */}
      <AuthModal />

      {/* Persistent AI Pedagogical Assistant Drawer */}
      <AIAssistantDrawer />
    </div>
  );
};

export default function App() {
  return (
    <LMSProvider>
      <AppContent />
    </LMSProvider>
  );
}
