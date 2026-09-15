import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { Course, GradingCategory } from '../../types';

interface Props {
  course?: Course;
  onClose?: () => void;
}

export const CourseEditorModal: React.FC<Props> = ({ course, onClose }) => {
  const { createCourse, updateCourse, currentUser, currentInstitution } = useLMS();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [title, setTitle] = useState(course?.title || '');
  const [code, setCode] = useState(course?.code || '');
  const [credits, setCredits] = useState(course?.credits || 3);
  const [description, setDescription] = useState(course?.description || '');
  const [level, setLevel] = useState(course?.level || 'bachelor');
  const [syllabus, setSyllabus] = useState(course?.syllabus || '');
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(
    course?.learningOutcomes || ['Understand core principles', 'Apply analytical models']
  );
  const [newOutcome, setNewOutcome] = useState('');
  const [gradingCategories, setGradingCategories] = useState<GradingCategory[]>(
    course?.gradingCategories || [
      { id: 'cat-1', name: 'Assignments', weight: 30 },
      { id: 'cat-2', name: 'Quizzes & Labs', weight: 20 },
      { id: 'cat-3', name: 'Mid-Term Exam', weight: 20 },
      { id: 'cat-4', name: 'Final Examination', weight: 30 },
    ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalWeight = gradingCategories.reduce((sum, c) => sum + Number(c.weight), 0);

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      setLearningOutcomes([...learningOutcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const handleRemoveOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const handleCategoryWeightChange = (index: number, weight: number) => {
    const updated = [...gradingCategories];
    updated[index].weight = weight;
    setGradingCategories(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !code) return;
    setIsSubmitting(true);

    const payload: Partial<Course> = {
      institutionId: currentInstitution?.id || 'inst-1',
      title,
      code,
      credits: Number(credits),
      description,
      level: level as any,
      primaryTeacherName: currentUser?.name || 'Faculty Member',
      teacherIds: [currentUser?.id || 'user-teacher-1'],
      syllabus,
      learningOutcomes,
      gradeCategories: gradingCategories,
      status: 'published',
      thumbnail:
        course?.thumbnail ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    };

    if (course) {
      await updateCourse(course.id, payload);
    } else {
      await createCourse(payload);
    }
    setIsSubmitting(false);
    onClose?.();
  };

  return (
    <div
      onClick={() => onClose?.()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-default"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {course ? 'Edit Course Syllabus & Settings' : 'Create New Course Offering'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Distributed Database Architecture"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. CS305"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Educational Level
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500"
              >
                <option value="primary">Primary School</option>
                <option value="secondary">Secondary School</option>
                <option value="higher_secondary">Higher Secondary (+2)</option>
                <option value="diploma">Diploma / Professional</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Credit Hours
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={credits}
                onChange={e => setCredits(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Course Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short overview of the academic scope..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Syllabus & Curriculum Overview (Markdown supported)
            </label>
            <textarea
              rows={3}
              value={syllabus}
              onChange={e => setSyllabus(e.target.value)}
              placeholder="Detailed topics covered by week or unit..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 font-mono"
            />
          </div>

          {/* Learning Outcomes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Intended Learning Outcomes (ILO)
            </label>
            <div className="space-y-1.5 mb-2">
              {learningOutcomes.map((out, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
                  <span className="text-slate-700">• {out}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOutcome(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={e => setNewOutcome(e.target.value)}
                placeholder="Add a measurable learning outcome..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddOutcome}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Weighted Grading Categories */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Weighted Grading Categories (Sum: {totalWeight}%)
              </label>
              {totalWeight !== 100 && (
                <span className="text-[10px] text-rose-500 font-bold">
                  Must equal exactly 100%
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {gradingCategories.map((cat, i) => (
                <div key={cat.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={cat.weight}
                      onChange={e => handleCategoryWeightChange(i, Number(e.target.value))}
                      className="w-14 px-1.5 py-0.5 text-xs text-right border border-slate-300 rounded bg-white font-bold text-sky-700"
                    />
                    <span className="text-slate-400 font-bold">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || totalWeight !== 100}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : course ? 'Update Course' : 'Publish Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
