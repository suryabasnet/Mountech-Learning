import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Video,
  Download,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { AttendanceRecord, AttendanceStudentStatus } from '../../types';

export const AttendanceCalendarView: React.FC = () => {
  const {
    attendance,
    markAttendance,
    courses,
    currentUser,
    assignments,
    t,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<'calendar' | 'roster'>('calendar');
  const [selectedDate, setSelectedDate] = useState('2026-03-24');
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);

  // Roster state for taking live class attendance
  const [rosterStatuses, setRosterStatuses] = useState<Record<string, AttendanceStudentStatus>>({
    'user-student-1': 'present',
    'user-student-2': 'present',
    'user-student-3': 'late',
    'user-student-4': 'absent',
  });

  const students = [
    { id: 'user-student-1', name: 'Aarav Basnet', rollNo: 'HITM-CS-2024-042' },
    { id: 'user-student-2', name: 'Suman Thapa', rollNo: 'HITM-CS-2024-043' },
    { id: 'user-student-3', name: 'Pooja Karki', rollNo: 'HITM-CS-2024-044' },
    { id: 'user-student-4', name: 'Rohan Shrestha', rollNo: 'HITM-CS-2024-045' },
  ];

  const handleStatusChange = (studentId: string, status: AttendanceStudentStatus) => {
    setRosterStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    const studentRecords = Object.entries(rosterStatuses).map(([stId, status]) => {
      const s = students.find(x => x.id === stId);
      return {
        studentId: stId,
        studentName: s?.name || 'Student',
        status,
      };
    });

    await markAttendance({
      courseId: courses[0]?.id || 'course-1',
      date: selectedDate,
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      title: 'CS204: Relational Algebra & Normalization',
      type: 'physical',
      students: studentRecords,
    });
    alert('Attendance successfully recorded and synced with academic reports!');
  };

  // Export .ICS file
  const handleExportICS = () => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MounTech Solutions//MounTech Learning LMS//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:CS204 Database Systems Lecture
DESCRIPTION:Relational algebra and normalization session with Prof. Anil Adhikari
DTSTART:20260324T100000Z
DTEND:20260324T113000Z
LOCATION:HITM Technology Block Room 402 / Google Meet
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:Assignment 1 Due: ER Diagram & Relational Schema
DTSTART:20260328T235959Z
DTEND:20260329T000000Z
DESCRIPTION:Submit normal forms analysis and SQL schema script
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MounTech_Academic_Calendar.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('calendar')} & Attendance</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Class schedules, Google Meet sessions, assignment deadlines, and attendance rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportICS}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download iCalendar format (.ics) for Google Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export (.ics)</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'calendar' ? 'roster' : 'calendar')}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{activeTab === 'calendar' ? 'Take Class Attendance' : 'View Calendar View'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        /* Calendar View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">March 2026</h3>
              <span className="text-xs text-slate-400 font-medium">Spring Semester</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-bold">
                Timezone: Asia/Kathmandu (NPT)
              </span>
            </div>
          </div>

          {/* Calendar Grid Demo */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasLecture = day === 24 || day === 26 || day === 28;
              const hasDeadline = day === 28;
              return (
                <div
                  key={day}
                  className={`min-h-[85px] p-2 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    day === 24
                      ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-100'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <span className={`text-xs font-bold ${day === 24 ? 'text-sky-700' : 'text-slate-700'}`}>
                    {day}
                  </span>

                  <div className="space-y-1 mt-1">
                    {hasLecture && (
                      <div className="text-[10px] p-1 rounded bg-sky-100 text-sky-800 font-bold truncate">
                        10:00 AM CS204
                      </div>
                    )}
                    {hasDeadline && (
                      <div className="text-[10px] p-1 rounded bg-rose-100 text-rose-800 font-bold truncate">
                        Due: SQL Schema
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Scheduled Sessions Detail */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Upcoming Scheduled Sessions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attendance.map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Date: {item.date} • {item.startTime} - {item.endTime}
                    </p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.2 rounded bg-sky-100 text-sky-800 font-bold uppercase">
                      {item.type}
                    </span>
                  </div>

                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Attendance Taking Roster Sheet */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Class Attendance Sheet: CS204 Database Systems
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Session Date: <span className="font-bold text-slate-700">{selectedDate}</span> • Time: 10:00 AM – 11:30 AM
              </p>
            </div>

            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Attendance Record
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {students.map(st => {
              const currentStatus = rosterStatuses[st.id] || 'present';
              return (
                <div key={st.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{st.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{st.rollNo}</p>
                  </div>

                  {/* 1-Click Status Toggles */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'present', label: 'Present', bg: 'bg-emerald-600 text-white', inactive: 'bg-slate-100 text-slate-600' },
                      { id: 'late', label: 'Late', bg: 'bg-amber-600 text-white', inactive: 'bg-slate-100 text-slate-600' },
                      { id: 'absent', label: 'Absent', bg: 'bg-rose-600 text-white', inactive: 'bg-slate-100 text-slate-600' },
                      { id: 'excused', label: 'Excused', bg: 'bg-sky-600 text-white', inactive: 'bg-slate-100 text-slate-600' },
                    ].map(stOption => (
                      <button
                        key={stOption.id}
                        type="button"
                        onClick={() => handleStatusChange(st.id, stOption.id as AttendanceStudentStatus)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentStatus === stOption.id ? stOption.bg : stOption.inactive
                        }`}
                      >
                        {stOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
