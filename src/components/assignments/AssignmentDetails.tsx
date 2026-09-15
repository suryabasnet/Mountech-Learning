import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  Award,
  UploadCloud,
  CheckCircle2,
  FileText,
  Link2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { Assignment, Submission } from '../../types';

export const AssignmentDetails: React.FC = () => {
  const {
    assignments,
    selectedAssignmentId,
    submissions,
    currentUser,
    courses,
    submitAssignment,
    setActiveView,
    openAiAssistant,
    t,
  } = useLMS();

  const [submissionType, setSubmissionType] = useState<'text' | 'file' | 'url'>('text');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeTab, setActiveTab] = useState<'instructions' | 'rubric' | 'history'>('instructions');

  const assignment = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
  const course = courses.find(c => c.id === assignment?.courseId);

  // Filter student's existing submissions for this assignment
  const mySubmissions = submissions.filter(
    s => s.assignmentId === assignment?.id && (currentUser?.role !== 'student' || s.studentId === currentUser?.id)
  );

  const latestSubmission = mySubmissions[0];
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin';

  if (!assignment) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">Assignment not found.</p>
        <button
          onClick={() => setActiveView('assignments')}
          className="mt-3 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold cursor-pointer"
        >
          View All Assignments
        </button>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = event => {
        setFileContent(event.target?.result as string || 'file content simulated');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let content = '';
    if (submissionType === 'text') content = textContent;
    else if (submissionType === 'url') content = urlContent;
    else content = fileContent || `Uploaded file: ${fileName}`;

    if (!content.trim()) {
      setIsSubmitting(false);
      return;
    }

    const res = await submitAssignment(assignment.id, {
      submissionType,
      content,
      fileName: submissionType === 'file' ? fileName : undefined,
    });

    setIsSubmitting(false);
    if (res) {
      setShowReceipt(true);
      setTextContent('');
      setUrlContent('');
      setFileName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('assignments')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Assignments</span>
        </button>

        {isTeacher && (
          <button
            onClick={() => setActiveView('grading_workspace')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Launch SpeedGrader</span>
          </button>
        )}
      </div>

      {/* Assignment Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-bold">
                {course?.code || 'Course'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                Category: {assignment.gradingCategory}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              {assignment.title}
            </h1>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
            <div className="text-2xl font-extrabold text-sky-700">
              {assignment.points} <span className="text-xs font-medium text-slate-500">Points</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 justify-end">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 mt-6 border-t border-slate-100 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Instructions & Files
          </button>
          <button
            onClick={() => setActiveTab('rubric')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'rubric'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Grading Rubric ({assignment.rubric?.length || 0} Criteria)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Submission History ({mySubmissions.length})
          </button>
        </div>
      </div>

      {/* Main Grid: Details / Rubric / Submission Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'instructions' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Assignment Description & Guidelines
              </h3>
              <div className="prose prose-slate max-w-none text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {assignment.description}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() =>
                    openAiAssistant(
                      `I am working on the assignment "${assignment.title}". Can you give me tips on how to approach this problem and what key concepts to double check?`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI Study Guide for this Assignment</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rubric' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Assessment Criteria & Point Allocations
              </h3>
              <div className="space-y-3">
                {assignment.rubric?.map(crit => (
                  <div key={crit.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800">{crit.criterion}</h4>
                      <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                        {crit.maxPoints} Points
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{crit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Attempt History & Instructor Feedback
              </h3>
              {mySubmissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No submissions on file yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {mySubmissions.map(sub => (
                    <div key={sub.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Attempt #{sub.attemptNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 max-h-32 overflow-y-auto">
                        {sub.content}
                      </div>

                      {sub.isPublishedGrade && (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                          <p className="font-bold text-emerald-800">
                            Grade Awarded: {sub.score} / {assignment.points}
                          </p>
                          {sub.generalFeedback && (
                            <p className="text-emerald-700">{sub.generalFeedback}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Student Submission Drawer */}
        <div className="space-y-6">
          {/* Submission Receipt Notification */}
          {showReceipt && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Work Submitted Successfully!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Your work has been safely recorded with timestamp verification. The instructor will review your submission via SpeedGrader.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-sky-600" />
              Submit Your Work
            </h3>

            {/* Submission Format Selector */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSubmissionType('text')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  submissionType === 'text' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('file')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  submissionType === 'file' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
                }`}
              >
                File Upload
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('url')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  submissionType === 'url' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
                }`}
              >
                Web URL
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-3">
              {submissionType === 'text' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Text / Code Entry
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    placeholder="Type or paste your solutions, SQL queries, or essay here..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 font-mono"
                  />
                </div>
              )}

              {submissionType === 'file' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Attach Document or Archive
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-sky-500 transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="file-upload-input"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload-input"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                      <span className="text-xs font-bold text-sky-600">
                        Choose a file or drag & drop
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, DOCX, ZIP, SQL (Max 25MB)</span>
                    </label>
                    {fileName && (
                      <p className="mt-2 text-xs font-bold text-emerald-600">
                        Selected: {fileName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {submissionType === 'url' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GitHub / Website URL
                  </label>
                  <input
                    type="url"
                    required
                    value={urlContent}
                    onChange={e => setUrlContent(e.target.value)}
                    placeholder="https://github.com/student/assignment-repo"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                id="submit-assignment-work-btn"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
