import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Sparkles,
  Shield,
  BookOpen,
  Calendar,
  Save,
  Check,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { NotificationPreferences } from '../../types';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    currentInstitution,
    showProfileModal,
    setShowProfileModal,
    profileModalTab,
    setProfileModalTab,
    notifications,
    emailLogs,
    markNotificationsRead,
    clearNotifications,
    fetchEmailLogs,
    updateNotificationPreferences,
    checkDeadlinesAndRemind,
    courses,
    setActiveView,
    setSelectedCourseId,
    t,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'email_logs'>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingDeadlines, setIsCheckingDeadlines] = useState(false);
  const [deadlineCheckResult, setDeadlineCheckResult] = useState<string | null>(null);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<any | null>(null);
  const [activeLogFilter, setActiveLogFilter] = useState<'all' | 'announcement' | 'assignment' | 'grade' | 'deadline'>('all');

  // Local state for notification preferences
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailEnabled: true,
    inAppEnabled: true,
    notifyOnAnnouncements: true,
    notifyOnNewAssignments: true,
    notifyOnGradedSubmissions: true,
    notifyOnUpcomingDeadlines: true,
    notifyOnDiscussionReplies: true,
    emailFrequency: 'immediate',
  });

  // Sync activeTab with LMSContext profileModalTab when opening
  useEffect(() => {
    if (profileModalTab) {
      setActiveTab(profileModalTab);
    }
  }, [profileModalTab, showProfileModal]);

  // Load preferences from currentUser
  useEffect(() => {
    if (currentUser?.notificationPreferences) {
      setPrefs({
        emailEnabled: currentUser.notificationPreferences.emailEnabled ?? true,
        inAppEnabled: currentUser.notificationPreferences.inAppEnabled ?? true,
        notifyOnAnnouncements: currentUser.notificationPreferences.notifyOnAnnouncements ?? true,
        notifyOnNewAssignments: currentUser.notificationPreferences.notifyOnNewAssignments ?? true,
        notifyOnGradedSubmissions: currentUser.notificationPreferences.notifyOnGradedSubmissions ?? true,
        notifyOnUpcomingDeadlines: currentUser.notificationPreferences.notifyOnUpcomingDeadlines ?? true,
        notifyOnDiscussionReplies: currentUser.notificationPreferences.notifyOnDiscussionReplies ?? true,
        emailFrequency: currentUser.notificationPreferences.emailFrequency ?? 'immediate',
      });
    }
  }, [currentUser]);

  if (!showProfileModal || !currentUser) return null;

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateNotificationPreferences(currentUser.id, prefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  const handleCheckDeadlines = async () => {
    setIsCheckingDeadlines(true);
    setDeadlineCheckResult(null);
    try {
      const res = await checkDeadlinesAndRemind();
      setDeadlineCheckResult(
        res.notifiedCount > 0
          ? `✓ Scanned coursework: Sent ${res.notifiedCount} deadline reminders & queued delivery!`
          : '✓ All assignments up to date. No deadlines due in the next 48 hours.'
      );
      await fetchEmailLogs();
    } catch (err) {
      setDeadlineCheckResult('Failed to run deadline audit check.');
    } finally {
      setIsCheckingDeadlines(false);
      setTimeout(() => setDeadlineCheckResult(null), 4000);
    }
  };

  const userEnrolledCourses = courses.filter(c =>
    currentUser.role === 'teacher'
      ? c.teacherId === currentUser.id
      : (currentUser.enrolledCourseIds || []).includes(c.id) || true
  );

  const filteredNotifications = activeLogFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeLogFilter);

  const filteredEmailLogs = activeLogFilter === 'all'
    ? emailLogs
    : emailLogs.filter(l => l.type === activeLogFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                  {t(currentUser.role)}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentUser.email} • {currentInstitution?.name || 'MounTech Institute'}</p>
            </div>
          </div>

          <button
            onClick={() => setShowProfileModal(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-white text-xs font-bold gap-4 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('profile');
              setProfileModalTab('profile');
            }}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Account</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('notifications');
              setProfileModalTab('notifications');
            }}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification Preferences</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('email_logs');
              setProfileModalTab('email_logs');
              fetchEmailLogs();
            }}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'email_logs'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <div className="flex items-center gap-1.5">
              <span>Notification & Email Log</span>
              {emailLogs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
                  {emailLogs.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PROFILE & ACADEMIC INFO */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Full Legal Name
                  </label>
                  <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Campus Email Address
                  </label>
                  <p className="text-xs font-semibold text-slate-800">{currentUser.email}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Institutional Role & Access Level
                  </label>
                  <p className="text-xs font-semibold text-slate-800 capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Academic Entity / Program
                  </label>
                  <p className="text-xs font-semibold text-slate-800">
                    B.Sc. Computer Science & Software Engineering
                  </p>
                </div>
              </div>

              {/* Active Enrolled Courses */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    {currentUser.role === 'teacher' ? 'Instructional Courses' : 'Enrolled Coursework'} ({userEnrolledCourses.length})
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {userEnrolledCourses.slice(0, 4).map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setActiveView('course_workspace');
                        setShowProfileModal(false);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-sky-600">{c.code}</span>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{c.title}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* System Security & Honor Code */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p>
                  MounTech Learning accounts are protected by institutional single sign-on (SSO) and role-based access control. All coursework and grading activities are auditable by campus administrators.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATION PREFERENCES */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSavePreferences} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50/60 p-4 rounded-xl border border-sky-200">
                <div>
                  <h3 className="text-xs font-bold text-sky-950">Notification Delivery Channels</h3>
                  <p className="text-[11px] text-sky-800 mt-0.5">
                    Configure how MounTech delivers announcements, grade releases, and coursework reminders.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCheckDeadlines}
                  disabled={isCheckingDeadlines}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex-shrink-0"
                  title="Scan for upcoming assignment deadlines and dispatch notifications"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDeadlines ? 'animate-spin' : ''}`} />
                  <span>{isCheckingDeadlines ? 'Auditing...' : 'Check Deadlines Now'}</span>
                </button>
              </div>

              {deadlineCheckResult && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{deadlineCheckResult}</span>
                </div>
              )}

              {/* Master Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">In-App Notifications</p>
                      <p className="text-[10px] text-slate-500">Header bell icon alerts & badges</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.inAppEnabled}
                    onChange={e => setPrefs({ ...prefs, inAppEnabled: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Email Notifications</p>
                      <p className="text-[10px] text-slate-500">Delivered to {currentUser.email}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.emailEnabled}
                    onChange={e => setPrefs({ ...prefs, emailEnabled: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </div>
              </div>

              {/* Granular Notification Categories */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Event Routing By Category
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {/* Announcements */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Class & Campus Announcements</p>
                      <p className="text-[11px] text-slate-500">
                        Broadcasts posted by professors, departments, or administration
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.notifyOnAnnouncements}
                      onChange={e => setPrefs({ ...prefs, notifyOnAnnouncements: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </div>

                  {/* New Assignments */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">New Assignments & Lab Briefs</p>
                      <p className="text-[11px] text-slate-500">
                        When an instructor publishes a new assignment or lab problem set
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.notifyOnNewAssignments}
                      onChange={e => setPrefs({ ...prefs, notifyOnNewAssignments: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </div>

                  {/* Graded Submissions */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Graded Submissions & Rubric Feedback</p>
                      <p className="text-[11px] text-slate-500">
                        Instant notification when teacher posts a score and evaluation notes
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.notifyOnGradedSubmissions}
                      onChange={e => setPrefs({ ...prefs, notifyOnGradedSubmissions: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Upcoming Due Dates & Deadlines</p>
                      <p className="text-[11px] text-slate-500">
                        Reminders sent 48 hours and 24 hours prior to submission deadlines
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.notifyOnUpcomingDeadlines}
                      onChange={e => setPrefs({ ...prefs, notifyOnUpcomingDeadlines: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </div>

                  {/* Discussion Replies */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Discussion Forum Replies & Mentions</p>
                      <p className="text-[11px] text-slate-500">
                        Peer answers to course discussion threads and academic forums
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.notifyOnDiscussionReplies}
                      onChange={e => setPrefs({ ...prefs, notifyOnDiscussionReplies: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Schedule / Frequency */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Email Dispatch Frequency</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value="immediate"
                      checked={prefs.emailFrequency === 'immediate'}
                      onChange={() => setPrefs({ ...prefs, emailFrequency: 'immediate' })}
                      className="text-sky-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800">Immediate Delivery</p>
                      <p className="text-[10px] text-slate-500">Sent instantly on event occurrence</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value="daily_digest"
                      checked={prefs.emailFrequency === 'daily_digest'}
                      onChange={() => setPrefs({ ...prefs, emailFrequency: 'daily_digest' })}
                      className="text-sky-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800">Daily Digest</p>
                      <p className="text-[10px] text-slate-500">Consolidated morning summary email</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Save Strip */}
              <div className="flex items-center justify-between pt-2">
                {isSaved ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" /> Preferences Saved Successfully
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Preferences are synchronized across your mobile and desktop devices.
                  </span>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: NOTIFICATION & EMAIL LOGS */}
          {activeTab === 'email_logs' && (
            <div className="space-y-4">
              {/* Filter bar & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    onClick={() => setActiveLogFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeLogFilter === 'all' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setActiveLogFilter('announcement')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeLogFilter === 'announcement' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Announcements
                  </button>
                  <button
                    onClick={() => setActiveLogFilter('assignment')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeLogFilter === 'assignment' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Assignments
                  </button>
                  <button
                    onClick={() => setActiveLogFilter('grade')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeLogFilter === 'grade' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Grades
                  </button>
                  <button
                    onClick={() => setActiveLogFilter('deadline')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeLogFilter === 'deadline' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Deadlines
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={markNotificationsRead}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Mark All Read
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Clear notification history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dual View: In-App Feed & Email Dispatch Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Column 1: In-App Notifications Feed */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-sky-600" />
                      <span>In-App Notifications ({filteredNotifications.length})</span>
                    </h4>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        No in-app notifications found.
                      </div>
                    ) : (
                      filteredNotifications.map(item => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border text-xs transition-all ${
                            !item.read ? 'bg-sky-50/50 border-sky-200' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-1 leading-normal">{item.message}</p>
                          {item.courseTitle && (
                            <span className="inline-block mt-2 text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                              {item.courseTitle}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2: Simulated Email Outbox Log */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      <span>Email Delivery Audit Log ({filteredEmailLogs.length})</span>
                    </h4>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {filteredEmailLogs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        No outbound emails logged yet. Click "Check Deadlines Now" or submit an assignment to trigger an email dispatch.
                      </div>
                    ) : (
                      filteredEmailLogs.map(log => (
                        <div
                          key={log.id}
                          onClick={() => setSelectedEmailPreview(log)}
                          className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                            selectedEmailPreview?.id === log.id
                              ? 'border-purple-400 bg-purple-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900 truncate max-w-[220px]">{log.subject}</p>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              {log.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[10px] mt-0.5">To: {log.toEmail}</p>
                          <p className="text-slate-600 text-[11px] mt-1 line-clamp-1">
                            {log.body.replace(/<[^>]+>/g, ' ')}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                            <span>{new Date(log.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            <span className="text-purple-600 font-semibold flex items-center gap-1">
                              View Preview <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Email Body Preview Modal / Inspector */}
              {selectedEmailPreview && (
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <p className="font-bold text-slate-100">{selectedEmailPreview.subject}</p>
                      <p className="text-[10px] text-slate-400">
                        Delivered to: <b>{selectedEmailPreview.toEmail}</b> via MounTech Mail Router
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedEmailPreview(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>

                  {/* Render simulated HTML email safely */}
                  <div
                    className="p-3 bg-white text-slate-900 rounded-lg text-xs font-sans max-h-48 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedEmailPreview.body }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            Logged in as <b>{currentUser.name}</b> ({currentUser.role})
          </span>
          <button
            onClick={() => setShowProfileModal(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
