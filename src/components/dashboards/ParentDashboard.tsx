import React from 'react';
import {
  Users,
  GraduationCap,
  CalendarDays,
  Award,
  Clock,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const ParentDashboard: React.FC = () => {
  const { currentUser, courses, assignments, setActiveView, setSelectedCourseId } = useLMS();

  const linkedStudentName = 'Aarav Basnet';
  const studentProgram = 'BSc. Computer Science & IT (Semester 4)';

  const studentCourses = [
    { code: 'CS204', title: 'Database Management Systems', grade: 'A (92%)', attendance: '96%', teacher: 'Prof. Anil Adhikari' },
    { code: 'MTH202', title: 'Discrete Mathematics & Graph Theory', grade: 'B+ (86%)', attendance: '94%', teacher: 'Dr. Ramesh Sharma' },
    { code: 'CS205', title: 'Operating Systems & Architecture', grade: 'A- (89%)', attendance: '95%', teacher: 'Dr. Sunita KC' },
  ];

  const pendingHomework = assignments.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Guardian Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-200">
            👨‍👦
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Parent & Guardian Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Monitoring Student: <span className="font-bold text-slate-800">{linkedStudentName}</span> ({studentProgram})
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('messages')}
          className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          <span>Contact Instructors</span>
        </button>
      </div>

      {/* Snapshot Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Semester GPA</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-emerald-600">3.88 / 4.0</p>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Dean's Honor List</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Verified Attendance</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-teal-600">95.2%</p>
            <CalendarDays className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">32 of 34 lectures attended</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Pending Tasks</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-amber-600">2</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Due in next 7 days</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Disciplinary Status</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-800">Clear</p>
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">No infractions</p>
        </div>
      </div>

      {/* Courses & Grades Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Enrolled Courses & Academic Standing</h3>
          <div className="divide-y divide-slate-100">
            {studentCourses.map((c, i) => (
              <div key={i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{c.code}: {c.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Faculty: {c.teacher} • Attendance: <span className="font-semibold text-slate-700">{c.attendance}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Grade: {c.grade}
                  </span>
                  <button
                    onClick={() => setActiveView('gradebook')}
                    className="text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Homework */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Upcoming Homework Deadlines
          </h3>
          <div className="space-y-3">
            {pendingHomework.map(item => (
              <div key={item.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  <span className="font-bold text-sky-700">{item.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
