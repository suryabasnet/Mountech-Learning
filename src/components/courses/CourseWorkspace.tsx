import React, { useState } from 'react';
import {
  FolderKanban,
  BookOpen,
  FileCheck2,
  HelpCircle,
  Video,
  PlusCircle,
  Copy,
  Globe,
  Lock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Layers,
  FileText,
  User,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { CourseEditorModal } from './CourseEditorModal';

export const CourseWorkspace: React.FC = () => {
  const {
    courses,
    selectedCourseId,
    modules,
    currentInstitution,
    currentUser,
    createModule,
    createLesson,
    duplicateCourse,
    togglePublishCourse,
    setSelectedLessonId,
    setSelectedAssignmentId,
    setSelectedQuizId,
    setActiveView,
    openAiAssistant,
    studentProgress,
    t,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<'modules' | 'syllabus' | 'instructor' | 'grading'>('modules');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);

  // Form states for new module/lesson
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'reading' | 'interactive'>('reading');
  const [newLessonMinutes, setNewLessonMinutes] = useState(25);
  const [newLessonSummary, setNewLessonSummary] = useState('');

  const course = courses.find(c => c.id === selectedCourseId) || courses[0];
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin';

  if (!course) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">No course selected.</p>
        <button
          onClick={() => setActiveView('catalog')}
          className="mt-3 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold"
        >
          Go to Course Catalog
        </button>
      </div>
    );
  }

  const toggleModuleCollapse = (id: string) => {
    setCollapsedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    await createModule(course.id, newModuleTitle, newModuleDesc);
    setNewModuleTitle('');
    setNewModuleDesc('');
    setShowAddModuleModal(false);
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId || !newLessonTitle.trim()) return;
    await createLesson(targetModuleId, {
      courseId: course.id,
      title: newLessonTitle,
      type: newLessonType,
      durationMinutes: Number(newLessonMinutes),
      contentSummary: newLessonSummary,
      completionCriteria: 'view',
      isPublished: true,
      order: 10,
    });
    setNewLessonTitle('');
    setNewLessonSummary('');
    setShowAddLessonModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Hierarchy Breadcrumbs: Institution → Program → Term → Course */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto pb-1">
        <span className="hover:text-slate-800 cursor-pointer">{currentInstitution?.name || 'Institution'}</span>
        <span>/</span>
        <span className="hover:text-slate-800 cursor-pointer">Undergraduate Programs</span>
        <span>/</span>
        <span className="hover:text-slate-800 cursor-pointer">Semester 4 (Spring 2026)</span>
        <span>/</span>
        <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          {course.code}: {course.title}
        </span>
      </div>

      {/* Course Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-bold font-mono">
                {course.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                {course.credits} Credit Hours
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-medium">
                {course.level.toUpperCase()}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {course.description}
            </p>
          </div>

          {/* Instructor & Admin Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {isTeacher && (
              <>
                <button
                  onClick={() => setShowAddModuleModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  id="add-module-btn"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>

                <button
                  onClick={() => setShowEditCourseModal(true)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Edit Syllabus
                </button>

                <button
                  onClick={() => duplicateCourse(course.id)}
                  className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Duplicate Course Structure"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => openAiAssistant(`Can you explain the key concepts and syllabus roadmap for ${course.code}: ${course.title}?`)}
              className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>AI Course Tutor</span>
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-6 px-6 border-t border-slate-200 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('modules')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'modules'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Modules & Units ({modules.length})
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'syllabus'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Syllabus & Outcomes
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'grading'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Weighted Gradebook Policy
          </button>
          <button
            onClick={() => setActiveTab('instructor')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'instructor'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Faculty & Office Hours
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {modules.map(mod => {
            const isCollapsed = collapsedModules[mod.id];
            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Module Header Bar */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleModuleCollapse(mod.id)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {mod.title}
                        {mod.isPublished ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.2 rounded-full">
                            Published
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-slate-200 font-semibold px-2 py-0.2 rounded-full">
                            Draft
                          </span>
                        )}
                      </h3>
                      {mod.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                      )}
                    </div>
                  </div>

                  {isTeacher && (
                    <button
                      onClick={() => {
                        setTargetModuleId(mod.id);
                        setShowAddLessonModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
                    >
                      + Add Lesson
                    </button>
                  )}
                </div>

                {/* Lessons inside Module */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {(!mod.lessons || mod.lessons.length === 0) ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No lessons published in this module yet.
                      </div>
                    ) : (
                      mod.lessons.map(lesson => {
                        const isCompleted = studentProgress?.completedLessonIds?.includes(lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            className="p-3.5 hover:bg-sky-50/40 transition-colors flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setSelectedLessonId(lesson.id);
                                  setActiveView('lesson_viewer');
                                }}
                                className="cursor-pointer"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-sky-500"></div>
                                )}
                              </button>

                              <div>
                                <button
                                  onClick={() => {
                                    setSelectedLessonId(lesson.id);
                                    setActiveView('lesson_viewer');
                                  }}
                                  className="text-xs font-bold text-slate-800 hover:text-sky-600 text-left cursor-pointer"
                                >
                                  {lesson.title}
                                </button>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span className="capitalize">{lesson.type}</span>
                                  <span>•</span>
                                  <span>{lesson.durationMinutes} mins</span>
                                  <span>•</span>
                                  <span>Rule: Must {lesson.completionCriteria}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedLessonId(lesson.id);
                                  setActiveView('lesson_viewer');
                                }}
                                className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-600 rounded-lg transition-colors cursor-pointer"
                              >
                                Study Now →
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Syllabus Tab */}
      {activeTab === 'syllabus' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
              Course Learning Objectives
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.learningOutcomes?.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700">{outcome}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              Comprehensive Syllabus Outline
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              {course.syllabus || 'Syllabus content currently under faculty review.'}
            </div>
          </div>
        </div>
      )}

      {/* Weighted Gradebook Policy Tab */}
      {activeTab === 'grading' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            Weighted Grading Policy & Criteria
          </h3>
          <p className="text-xs text-slate-500">
            The final course grade is calculated from weighted category contributions. All assignments must be submitted before deadline to avoid standard late penalties.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {course.gradingCategories?.map(cat => (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{cat.name}</h4>
                  <p className="text-[11px] text-slate-500">Proportional weight toward total grade</p>
                </div>
                <span className="text-base font-extrabold text-sky-700 bg-sky-100 px-3 py-1 rounded-lg">
                  {cat.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Faculty & Instructor Details Tab */}
      {activeTab === 'instructor' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
              alt={course.primaryTeacherName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-300"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{course.primaryTeacherName}</h3>
              <p className="text-xs text-slate-500">Associate Professor of Computer Science & Systems</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                <span>📧 anil.adhikari@hitm.edu.np</span>
                <span>•</span>
                <span>Room 402, Technology Block</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Scheduled Office Hours
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <p><b>Sunday & Wednesday:</b> 10:00 AM – 12:00 PM (In-person)</p>
              <p className="mt-1"><b>Friday:</b> 2:00 PM – 4:00 PM (Google Meet Office Hours)</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Add New Module</h3>
            <form onSubmit={handleCreateModule} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Transaction Processing & ACID"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newModuleDesc}
                  onChange={e => setNewModuleDesc(e.target.value)}
                  placeholder="Brief synopsis of what this module covers..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Add Lesson to Module</h3>
            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={e => setNewLessonTitle(e.target.value)}
                  placeholder="e.g. Concurrency Control and Two-Phase Locking"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Content Format</label>
                  <select
                    value={newLessonType}
                    onChange={e => setNewLessonType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  >
                    <option value="reading">Reading & Study Guide</option>
                    <option value="video">Video Lecture</option>
                    <option value="interactive">Interactive Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newLessonMinutes}
                    onChange={e => setNewLessonMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Study Summary</label>
                <textarea
                  rows={2}
                  value={newLessonSummary}
                  onChange={e => setNewLessonSummary(e.target.value)}
                  placeholder="Key summary points for student review..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  Add Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditCourseModal && (
        <CourseEditorModal course={course} onClose={() => setShowEditCourseModal(false)} />
      )}
    </div>
  );
};
