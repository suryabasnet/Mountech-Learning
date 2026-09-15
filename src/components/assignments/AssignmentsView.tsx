import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  PlusCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { Assignment } from '../../types';

export const AssignmentsView: React.FC = () => {
  const {
    assignments,
    courses,
    selectedCourseId,
    currentUser,
    setSelectedAssignmentId,
    setActiveView,
    t,
  } = useLMS();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin';

  const displayedAssignments = assignments.filter(a => {
    if (selectedCourseId && a.courseId !== selectedCourseId && filterCategory !== 'all_courses') {
      // If course is selected, show for that course unless toggled
      return a.courseId === selectedCourseId;
    }
    return true;
  });

  const categories = Array.from(
    new Set(
      assignments
        .map(a => {
          const course = courses.find(c => c.id === a.courseId);
          const cat = course?.gradeCategories?.find(c => c.id === a.categoryId);
          return cat?.name || (a as any).gradingCategory || 'Assignment';
        })
        .filter(Boolean)
    )
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('assignments')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Course tasks, homework, programming labs, and project deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isTeacher && (
            <button
              onClick={() => setActiveView('grading_workspace')}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>SpeedGrader</span>
            </button>
          )}
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            All Assigned Coursework ({displayedAssignments.length})
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedAssignments.map(assign => {
            const course = courses.find(c => c.id === assign.courseId);
            const category = course?.gradeCategories?.find(c => c.id === assign.categoryId);
            const formats = (assign.acceptedFormats || (assign as any).allowedSubmissionTypes || ['file', 'text']) as string[];
            const isDueSoon = new Date(assign.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
            return (
              <div
                key={assign.id}
                onClick={() => {
                  setSelectedAssignmentId(assign.id);
                  setActiveView('assignment_details');
                }}
                className="p-4 hover:bg-sky-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {assign.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {category?.name || (assign as any).gradingCategory || 'Assignment'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {assign.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>{course?.code}</span>
                      {Array.isArray(formats) && formats.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{formats.join(' / ').toUpperCase()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
                  <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-lg">
                    {assign.points} Points
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Due {new Date(assign.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
