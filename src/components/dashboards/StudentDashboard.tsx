import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  Megaphone,
  Award,
  Sparkles,
  TrendingUp,
  PlayCircle,
  FileCode2,
  BrainCircuit,
  Compass,
  Trophy,
  Flame
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    courses,
    assignments,
    announcements,
    studentProgress,
    setActiveView,
    setSelectedCourseId,
    setSelectedLessonId,
    setSelectedAssignmentId,
    openAiAssistant,
    t,
  } = useLMS();

  // Active courses are published courses the user is enrolled in.
  const enrolledCourses = courses.filter(
    c => c.status === 'published' && (currentUser?.enrolledCourseIds?.includes(c.id) || true) // Mocking enrollment for demo
  );

  // Determine the most recently accessed course (mocking with the first one for now)
  const activeCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : null;
  const activeProgress = activeCourse?.id === 'course-1' ? (studentProgress?.overallProgressPercent || 50) : 15;

  const upcomingAssignments = assignments
    .filter(a => a.isPublished)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const recentAnnouncements = announcements.slice(0, 2);

  // AI Recommendations - mock logic
  const recommendedCourses = courses
    .filter(c => c.status === 'published' && c.id !== activeCourse?.id)
    .slice(0, 3);

  // Resume last learning lesson
  const handleContinueLearning = () => {
    if (studentProgress?.lastAccessedLessonId && studentProgress.courseId) {
      setSelectedCourseId(studentProgress.courseId);
      setSelectedLessonId(studentProgress.lastAccessedLessonId);
    } else if (activeCourse) {
      setSelectedCourseId(activeCourse.id);
    }
    setActiveView('lesson_viewer');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* SECTION 1: Focus Hero - Mountech Learn Signature Style */}
      {activeCourse ? (
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative flex flex-col md:flex-row">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="md:w-3/5 p-6 md:p-8 lg:p-10 relative z-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Current Focus • Day 14 Streak</span>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                {activeCourse.title}
              </h1>
              
              <p className="text-slate-400 text-sm md:text-base max-w-xl mb-6 line-clamp-2">
                Up next: <span className="text-slate-200 font-semibold">Module 3 - Advanced Relational Algebra</span>. You're doing great, maintaining a solid 90% average across quizzes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleContinueLearning}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-900/50 transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Resume Learning
              </button>
              <button
                onClick={() => openAiAssistant(`Can you summarize Module 3 of ${activeCourse.title} and test my knowledge?`)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                AI Tutor Review
              </button>
            </div>
          </div>

          <div className="md:w-2/5 bg-slate-800 relative z-10 border-l border-slate-700 flex flex-col">
            <div className="h-40 md:h-auto flex-1 relative">
               <img src={activeCourse.thumbnail} alt={activeCourse.title} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>
            <div className="p-6 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Course Progress</span>
                <span className="text-blue-400">{activeProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-teal-400 h-full rounded-full" style={{ width: `${activeProgress}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-center">
                  <div className="text-slate-100 font-bold text-lg">{activeCourse.modulesCount || 8}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-100 font-bold text-lg">{activeCourse.assignmentsCount || 4}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-100 font-bold text-lg">3.8</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">GPA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800">
           <Compass className="w-12 h-12 text-blue-500 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-white mb-2">Ready to start learning?</h2>
           <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Explore our catalog of professional courses, nanodegrees, and institutional programs.</p>
           <button onClick={() => setActiveView('catalog')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
             Explore Catalog
           </button>
        </div>
      )}

      {/* SECTION 2: Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: My Learning & Recommendations */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Active Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                My Learning Path
              </h3>
              <button onClick={() => setActiveView('catalog')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All →</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.filter(c => c.id !== activeCourse?.id).map(course => (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group cursor-pointer" onClick={() => { setSelectedCourseId(course.id); setActiveView('course_workspace'); }}>
                  <div className="h-32 relative overflow-hidden bg-slate-100">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-bold shadow-xs">
                      {course.code}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{course.title}</h4>
                    <p className="text-[11px] text-slate-500 mb-4">{course.primaryTeacherName}</p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                        <span>Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-slate-300 h-full rounded-full w-[0%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended Courses (Coursera style discovery) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                Recommended for You
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedCourses.map(course => (
                <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-300 transition-colors group cursor-pointer" onClick={() => { setSelectedCourseId(course.id); setActiveView('public_syllabus'); }}>
                  <div className="h-24 relative overflow-hidden bg-slate-100">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mb-1 group-hover:text-teal-700">{course.title}</h4>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-4 h-4 rounded-full bg-slate-200 flex-shrink-0"></div>
                      <span className="text-[10px] text-slate-500 truncate">{course.primaryTeacherName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column: Deadlines, Stats, Gamification */}
        <div className="space-y-6">
          
          {/* Quick Stats Bento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-center items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">4</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Certificates</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-center items-center text-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <FileCode2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">12</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Projects</div>
            </div>
          </div>

          {/* Up Next / Deadlines */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Up Next
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingAssignments.map(assign => {
                const isUrgent = new Date(assign.dueDate).getTime() - new Date().getTime() < 86400000 * 2; // < 2 days
                return (
                  <div key={assign.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedCourseId(assign.courseId); setSelectedAssignmentId(assign.id); setActiveView('assignment_details'); }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{assign.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Due {new Date(assign.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {isUrgent ? 'Urgent' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-4">
              <Megaphone className="w-4 h-4 text-amber-500" />
              Notice Board
            </h3>
            <div className="space-y-4">
              {recentAnnouncements.map(ann => (
                <div key={ann.id} className="cursor-pointer group" onClick={() => { setSelectedCourseId(ann.courseId); setActiveView('announcements'); }}>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{ann.content}</p>
                  <p className="text-[9px] text-slate-400 mt-1.5 uppercase font-semibold">{new Date(ann.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
