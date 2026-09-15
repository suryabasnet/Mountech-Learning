import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  AlertCircle,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useLMS } from '../../context/LMSContext';

export const AdminDashboard: React.FC = () => {
  const {
    currentInstitution,
    courses,
    allUsers,
    auditLogs,
    setActiveView,
    t,
  } = useLMS();

  const totalStudents = allUsers.filter(u => u.role === 'student').length;
  const totalTeachers = allUsers.filter(u => u.role === 'teacher').length;
  const totalCourses = courses.length;

  const enrollmentData = [
    { program: 'BSc CSIT', students: 480, completion: 92 },
    { program: 'BCA', students: 360, completion: 88 },
    { program: 'BIM', students: 290, completion: 85 },
    { program: 'Diploma IT', students: 180, completion: 94 },
    { program: 'Secondary (+2)', students: 320, completion: 91 },
  ];

  const roleDistribution = [
    { name: 'Students', value: 1420, color: '#0284c7' },
    { name: 'Faculty', value: 85, color: '#0d9488' },
    { name: 'Staff & Admins', value: 18, color: '#6366f1' },
    { name: 'Parents', value: 940, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Institutional Academic Administration
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">
              {currentInstitution?.educationalLevel.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Managing <span className="font-semibold text-slate-700">{currentInstitution?.name}</span> • Academic Year {currentInstitution?.academicYear}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('institution_admin')}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            id="admin-settings-btn"
          >
            <Settings className="w-4 h-4" />
            <span>Institution Settings</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Enrolled Students</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-900">1,420</p>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ 8.4% from last academic year</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Faculty & Instructors</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-900">85</p>
            <GraduationCap className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">18 departments</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Active Courses</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-900">{totalCourses}</p>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Spring 2026 Term</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">System Health</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-emerald-600">99.9%</p>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">All services operational</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment by Program Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Student Enrollment by Degree Program</h3>
              <p className="text-xs text-slate-400">Headcount across accredited programs</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="program" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="students" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Institution Population Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Community Breakdown</h3>
            <p className="text-xs text-slate-400">Active authenticated stakeholders</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {roleDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 text-[11px] truncate">{item.name}: <b>{item.value}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Real-time Administrative Audit Stream</h3>
          <button
            onClick={() => setActiveView('institution_admin')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
          >
            View Full Security Logs →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <div>
                  <p className="font-semibold text-slate-800">{log.action}</p>
                  <p className="text-[11px] text-slate-500">
                    By {log.userName} • Target: {log.target}
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="hidden sm:inline ml-2 text-slate-300">({log.ipAddress})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
