import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  FileCheck2,
  HelpCircle,
  Award,
  CalendarDays,
  Megaphone,
  MessagesSquare,
  Mail,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  School,
  GraduationCap,
  ShoppingBag,
  FileBadge,
  Layers,
} from 'lucide-react';
import { useLMS, ActiveView } from '../../context/LMSContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    selectedCourseId,
    courses,
    t,
    openAiAssistant,
  } = useLMS();

  const [collapsed, setCollapsed] = useState(false);

  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin';
  const isParent = currentUser?.role === 'parent';

  const currentCourse = courses.find(c => c.id === selectedCourseId);

  interface NavItem {
    view: ActiveView;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    highlight?: boolean;
    condition?: boolean;
  }

  const navItems: NavItem[] = [
    {
      view: 'dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
    },
    {
      view: 'marketplace',
      label: 'Marketplace',
      icon: ShoppingBag,
      highlight: true,
    },
    {
      view: 'certificates',
      label: 'Certificates',
      icon: FileBadge,
    },
    {
      view: 'catalog',
      label: t('allCourses'),
      icon: BookOpen,
    },
    {
      view: 'course_workspace',
      label: currentCourse ? `${currentCourse.code}` : t('courses'),
      icon: FolderKanban,
      condition: !!selectedCourseId,
    },
    {
      view: 'assignments',
      label: t('assignments'),
      icon: FileCheck2,
    },
    {
      view: 'quizzes',
      label: t('quizzes'),
      icon: HelpCircle,
    },
    {
      view: isTeacher ? 'grading_workspace' : 'gradebook',
      label: isTeacher ? t('speedGrader') : t('gradebook'),
      icon: Award,
    },
    {
      view: 'calendar_attendance',
      label: t('calendar'),
      icon: CalendarDays,
    },
    {
      view: 'announcements',
      label: t('announcements'),
      icon: Megaphone,
    },
    {
      view: 'discussions',
      label: t('discussions'),
      icon: MessagesSquare,
    },
    {
      view: 'messages',
      label: t('messages'),
      icon: Mail,
    },
    {
      view: 'institution_admin',
      label: t('institutionAdmin'),
      icon: School,
      condition: isAdmin,
    },
    {
      view: 'auth_rbac',
      label: 'RBAC Access Matrix',
      icon: ShieldCheck,
    },
    {
      view: 'user_management',
      label: 'User Management',
      icon: Layers,
      highlight: true,
      condition: isAdmin,
    },
    {
      view: 'architecture_erd',
      label: 'Architecture & ERD',
      icon: Layers,
    },
  ];

  return (
    <aside
      className={`relative bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-30 border-r border-slate-800 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Active User Mini Profile / Role Badge */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.name}
              </p>
              <p className="text-[10px] text-teal-400 font-mono capitalize">
                {t(currentUser?.role || 'student')}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors hidden md:block cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems
          .filter(item => item.condition === undefined || item.condition)
          .map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title={collapsed ? item.label : undefined}
                id={`sidebar-nav-${item.view}`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* AI Assistant Quick Tool card at bottom */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={() => openAiAssistant()}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-sky-900/60 via-slate-800 to-teal-900/60 border border-sky-500/30 text-left hover:border-teal-400/50 transition-all cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="MounTech AI Learning Assistant"
          id="sidebar-ai-lab-btn"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <p className="text-xs font-bold text-white flex items-center gap-1">
                AI Learning Lab
                <span className="text-[9px] px-1.5 py-0.2 bg-teal-500/30 text-teal-300 rounded font-normal">
                  Gemini
                </span>
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Tutor & Instructional Co-Pilot
              </p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
