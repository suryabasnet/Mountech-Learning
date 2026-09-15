import React from 'react';
import {
  BookOpen,
  Award,
  Clock,
  AlertTriangle,
  Video,
  PlusCircle,
  FileCheck2,
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    courses,
    assignments,
    submissions,
    attendance,
    setActiveView,
    setSelectedCourseId,
    setSelectedAssignmentId,
    openAiAssistant,
    t,
  } = useLMS();

  const myCourses = courses.filter(
    c => c.teacherIds?.includes(currentUser?.id || '') || c.primaryTeacherName === currentUser?.name
  );

  // Submissions needing grading
  const pendingSubmissions = submissions.filter(
    s => s.status === 'submitted' || !s.isPublishedGrade
  );

  // Scheduled classes for today
  const scheduledClasses = attendance.slice(0, 2);

  // Students flagged for academic support (e.g. late submissions or lower scores)
  const studentsNeedingSupport = [
    {
      name: 'Rohan Shrestha',
      course: 'CS204 Database Systems',
      issue: '2 consecutive missed labs, attendance 68%',
      riskLevel: 'high',
    },
    {
      name: 'Bikash Tamang',
      course: 'MTH202 Discrete Mathematics',
      issue: 'Score 48% on Quiz 1, request for tutor office hours',
      riskLevel: 'medium',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Teacher Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Instructor Portal & Teaching Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome, {currentUser?.name}. You have{' '}
            <span className="font-bold text-amber-600">{pendingSubmissions.length} submissions</span> waiting to be graded.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('grading_workspace')}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            id="open-speedgrader-btn"
          >
            <Award className="w-4 h-4" />
            <span>Open SpeedGrader</span>
          </button>

          <button
            onClick={() => openAiAssistant('Help me draft a comprehensive 4-criterion grading rubric for an upcoming SQL assignment.')}
            className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-semibold text-xs hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Rubric & Quiz Generator</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Assigned Courses</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-800">{myCourses.length}</p>
            <BookOpen className="w-4 h-4 text-sky-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Pending Grading</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-amber-600">{pendingSubmissions.length}</p>
            <FileCheck2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">SpeedGrader queue</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Active Students</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-800">78</p>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">At-Risk Alerts</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-rose-600">{studentsNeedingSupport.length}</p>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-[10px] text-rose-600 mt-0.5 font-medium">Action recommended</p>
        </div>
      </div>

      {/* Main Grid: My Teaching Courses + Right Action Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Teaching Courses & Pending Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Teaching Courses */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">My Teaching Courses</h3>
              <button
                onClick={() => setActiveView('course_workspace')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                Manage All Modules →
              </button>
            </div>

            <div className="space-y-3">
              {myCourses.map(course => (
                <div
                  key={course.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-sky-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-14 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{course.code}: {course.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                          {course.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {course.modulesCount} modules • {course.assignmentsCount} assignments • {course.enrolledStudentsCount} students enrolled
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setActiveView('course_workspace');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Workspace
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setActiveView('grading_workspace');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Grade Work
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Submissions Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">Recent Student Submissions</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {pendingSubmissions.length} pending
                </span>
              </div>
              <button
                onClick={() => setActiveView('grading_workspace')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                Open SpeedGrader →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {submissions.map(sub => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={sub.studentName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{sub.studentName}</p>
                      <p className="text-[11px] text-slate-500">
                        Attempt #{sub.attemptNumber} • Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.isPublishedGrade ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Graded: {sub.score} pts
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Pending Grade
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedAssignmentId(sub.assignmentId);
                        setActiveView('grading_workspace');
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Evaluate →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scheduled Classes & Students Needing Support */}
        <div className="space-y-6">
          {/* Scheduled Live / Physical Classes */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Today's Scheduled Classes
              </h3>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-3">
              {scheduledClasses.map(session => (
                <div key={session.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{session.title}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                      {session.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {session.startTime} - {session.endTime}
                  </p>

                  {session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Google Meet
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Students Needing Academic Support */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Students Needing Support
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {studentsNeedingSupport.map((st, i) => (
                <div key={i} className="p-3 rounded-lg border border-rose-100 bg-rose-50/40">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">{st.name}</p>
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded uppercase">
                      Alert
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{st.course}</p>
                  <p className="text-[11px] text-rose-800 font-medium mt-1">{st.issue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
