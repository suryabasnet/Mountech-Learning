import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Globe,
  Clock,
  UserCheck,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  ExternalLink,
  BookOpen,
  FileText,
  Layers,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentInstitution,
    allUsers,
    courses,
    modules,
    assignments,
    notifications,
    language,
    setLanguage,
    timezone,
    t,
    switchUser,
    activeView,
    setActiveView,
    setSelectedCourseId,
    setSelectedLessonId,
    setSelectedAssignmentId,
    setShowLandingPage,
    setShowProfileModal,
    setProfileModalTab,
    openAiAssistant,
    markNotificationsRead,
    openAuthModal,
  } = useLMS();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) setRoleMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Filtered search items
  const searchResults = searchQuery.trim() === '' ? [] : [
    ...courses
      .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(c => ({ type: 'course', id: c.id, title: `${c.code}: ${c.title}`, desc: 'Course' })),
    ...modules
      .flatMap(m => (m.lessons || []))
      .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(l => ({ type: 'lesson', id: l.id, courseId: l.courseId, title: l.title, desc: 'Lesson' })),
    ...assignments
      .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(a => ({ type: 'assignment', id: a.id, courseId: a.courseId, title: a.title, desc: 'Assignment' })),
  ].slice(0, 8);

  const handleSelectSearchResult = (res: any) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (res.type === 'course') {
      setSelectedCourseId(res.id);
      setActiveView('course_workspace');
    } else if (res.type === 'lesson') {
      setSelectedCourseId(res.courseId);
      setSelectedLessonId(res.id);
      setActiveView('lesson_viewer');
    } else if (res.type === 'assignment') {
      setSelectedCourseId(res.courseId);
      setSelectedAssignmentId(res.id);
      setActiveView('assignment_details');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-xs bg-white/95">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Institution Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveView('dashboard');
              setShowLandingPage(false);
            }}
            className="flex items-center gap-2 text-left cursor-pointer hover:opacity-90 transition-opacity"
            id="brand-logo-btn"
          >
            <Logo size="md" />
          </button>

          {currentInstitution && (
            <div className="hidden lg:flex items-center pl-3 border-l border-slate-200 text-xs text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-500 mr-1.5 animate-pulse"></span>
              <span className="truncate max-w-[200px]" title={currentInstitution.name}>
                {currentInstitution.name}
              </span>
            </div>
          )}
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="flex-1 max-w-md relative hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'ne' ? 'पाठ्यक्रम वा सामग्री खोज्नुहोस्...' : 'Search courses, lessons, assignments...'}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9.5 pr-4 py-1.5 text-sm bg-slate-100/80 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 text-slate-800"
              id="global-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 overflow-hidden">
              <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {language === 'ne' ? 'खोज परिणामहरू' : 'Search Results'}
              </div>
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3.5 py-2 hover:bg-sky-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600">
                    {res.type === 'course' ? <BookOpen className="w-3.5 h-3.5" /> : res.type === 'lesson' ? <Layers className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{res.title}</p>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{res.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls: AI Lab, Language Switcher, Timezone, Demo Role Switcher, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Assistant Button */}
          <button
            onClick={() => openAiAssistant()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-teal-600 text-white text-xs font-semibold shadow-xs hover:from-sky-700 hover:to-teal-700 transition-all cursor-pointer"
            title="Open MounTech AI Learning Assistant"
            id="ai-assistant-header-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden md:inline">AI Lab</span>
          </button>

          {/* Language Switcher (EN / नेपाली) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Switch language / भाषा परिवर्तन गर्नुहोस्"
            id="language-switcher-btn"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold">{language === 'en' ? 'नेपाली' : 'English'}</span>
          </button>

          {/* Timezone Indicator */}
          <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-md border border-slate-200" title={`Current time in ${timezone}`}>
            <Clock className="w-3 h-3 text-slate-400" />
            <span>NPT (UTC+5:45)</span>
          </div>

          {/* Quick Auth & 2FA / Session Modal Trigger */}
          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
            title="Open MounTech Identity & Security Engine (2FA, SSO, RBAC, Sessions)"
            id="auth-modal-btn"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Auth & 2FA</span>
          </button>

          {/* Demo Role Switcher Dropdown */}
          <div ref={roleRef} className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold hover:bg-sky-100 transition-colors cursor-pointer"
              title="Switch demo user role (Student, Teacher, Admin, Parent, SuperAdmin)"
              id="role-switcher-btn"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              <span className="capitalize">{t(currentUser?.role || 'student')}</span>
              <ChevronDown className="w-3 h-3 text-sky-600" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 divide-y divide-slate-100">
                <div className="px-3.5 py-2">
                  <p className="text-xs font-bold text-slate-800">Demo Role Switcher</p>
                  <p className="text-[11px] text-slate-500">Test the LMS from any user perspective</p>
                </div>
                <div className="py-1">
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                        currentUser?.id === u.id ? 'bg-sky-50/70 text-sky-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={u.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                        <div className="truncate">
                          <p className="truncate font-medium">{u.name}</p>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide">{t(u.role)}</span>
                        </div>
                      </div>
                      {currentUser?.id === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                if (!notifOpen) markNotificationsRead();
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
              id="notifications-bell-btn"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 divide-y divide-slate-100">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Notifications</span>
                  <button
                    onClick={markNotificationsRead}
                    className="text-[11px] text-sky-600 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.link === 'assignments') setActiveView('assignments');
                          if (n.link === 'grading') setActiveView('grading_workspace');
                          if (n.link === 'gradebook') setActiveView('gradebook');
                          setNotifOpen(false);
                        }}
                        className={`px-4 py-2.5 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                          !n.read ? 'bg-sky-50/40' : ''
                        }`}
                      >
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => {
                      setProfileModalTab('notifications');
                      setShowProfileModal(true);
                      setNotifOpen(false);
                    }}
                    className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Preferences</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileModalTab('email_logs');
                      setShowProfileModal(true);
                      setNotifOpen(false);
                    }}
                    className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email Dispatch Log</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              id="user-profile-menu-btn"
            >
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <span className="hidden md:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                {currentUser?.name.split(' ')[0]}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-100">
                <div className="px-3.5 py-2">
                  <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {t(currentUser?.role || 'student')}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileModalTab('profile');
                      setShowProfileModal(true);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    {t('profile')} & Account
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('mfa');
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>2FA / TOTP Security</span>
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('sessions');
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Active Devices & Sessions</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileModalTab('notifications');
                      setShowProfileModal(true);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-400" />
                    <span>Notification Preferences</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileModalTab('email_logs');
                      setShowProfileModal(true);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Delivery Audit Log</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowLandingPage(true);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    Public Landing Page
                  </button>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowLandingPage(true);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
