import React, { useState, useEffect } from 'react';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Save,
  FileText,
  User,
  History,
  Sparkles,
  Check,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { Submission, Assignment } from '../../types';

export const TeacherGradingWorkspace: React.FC = () => {
  const {
    assignments,
    selectedAssignmentId,
    setSelectedAssignmentId,
    submissions,
    gradeSubmission,
    openAiAssistant,
    setActiveView,
    t,
  } = useLMS();

  const currentAssignment = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
  const assignmentSubmissions = submissions.filter(s => s.assignmentId === currentAssignment?.id);

  const [studentIndex, setStudentIndex] = useState(0);
  const currentSub: Submission | undefined = assignmentSubmissions[studentIndex] || assignmentSubmissions[0];

  // Local grading state for active student
  const [score, setScore] = useState<number>(currentSub?.score || 0);
  const [feedback, setFeedback] = useState<string>(currentSub?.generalFeedback || '');
  const [auditReason, setAuditReason] = useState<string>('');
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Sync state whenever selected student changes
  useEffect(() => {
    if (currentSub) {
      setScore(currentSub.score || 0);
      setFeedback(currentSub.generalFeedback || '');
      const existingRubric: Record<string, number> = {};
      currentSub.rubricScores?.forEach(r => {
        existingRubric[r.criterionId] = r.points ?? (r as any).pointsEarned ?? 0;
      });
      setRubricScores(existingRubric);
    }
  }, [currentSub?.id]);

  if (!currentAssignment || !currentSub) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">No submissions available for this assignment.</p>
        <button
          onClick={() => setActiveView('assignments')}
          className="mt-3 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  const handleRubricScoreSelect = (criterionId: string, pts: number) => {
    const updated = { ...rubricScores, [criterionId]: pts };
    setRubricScores(updated);
    // Auto-calculate sum
    const total = (Object.values(updated) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
    setScore(total);
  };

  const handleSaveGrading = async (isPublished: boolean) => {
    const formattedRubric = Object.entries(rubricScores).map(([critId, pts]) => ({
      criterionId: critId,
      points: pts,
    }));

    await gradeSubmission(currentSub.id, {
      score: Number(score),
      generalFeedback: feedback,
      rubricScores: formattedRubric,
      isPublishedGrade: isPublished,
      auditReason: auditReason || (isPublished ? 'Grade published by instructor' : 'Draft saved'),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* SpeedGrader Top Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Assignment info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('assignments')}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            title="Back to assignments"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{currentAssignment.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                Max: {currentAssignment.points} pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              SpeedGrader™ Mode • {assignmentSubmissions.length} Total Submissions
            </p>
          </div>
        </div>

        {/* Student Navigation Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStudentIndex(i => Math.max(0, i - 1))}
            disabled={studentIndex <= 0}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={currentSub.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentSub.studentName}
              className="w-7 h-7 rounded-full object-cover border border-slate-300"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">{currentSub.studentName}</p>
              <span className="text-[10px] text-slate-400">
                Student {studentIndex + 1} of {assignmentSubmissions.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => setStudentIndex(i => Math.min(assignmentSubmissions.length - 1, i + 1))}
            disabled={studentIndex >= assignmentSubmissions.length - 1}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Layout: Left Submission Viewer / Right Rubric Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Pane: Student Submission Document Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span className="font-bold text-slate-700">Student Submission Viewer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Attempt #{currentSub.attemptNumber}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Submitted on: {new Date(currentSub.submittedAt).toLocaleString()}
            </span>
          </div>

          <div className="p-6 flex-1 min-h-[450px] overflow-y-auto bg-slate-900 text-teal-300 font-mono text-xs leading-relaxed">
            <pre className="whitespace-pre-wrap">{currentSub.content}</pre>
          </div>
        </div>

        {/* Right Pane: Rubric & SpeedGrader Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            {/* Score Summary Box */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-sky-50 border border-sky-200">
              <div>
                <span className="text-xs font-bold text-sky-950">Calculated Assessment Score</span>
                <p className="text-[11px] text-sky-700">Out of {currentAssignment.points} total points</p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={currentAssignment.points}
                  value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-base font-extrabold text-right border border-sky-300 rounded-lg bg-white text-sky-900"
                />
                <span className="text-xs font-bold text-sky-700">/ {currentAssignment.points}</span>
              </div>
            </div>

            {/* Rubric Criteria Evaluation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Interactive Rubric Criteria
                </h3>
                <span className="text-[10px] text-slate-400">Click to assign points</span>
              </div>

              <div className="space-y-3">
                {currentAssignment.rubric?.map(crit => {
                  const currentCriterionScore = rubricScores[crit.id] ?? 0;
                  const step1 = Math.round(crit.maxPoints * 0.25);
                  const step2 = Math.round(crit.maxPoints * 0.6);
                  const step3 = Math.round(crit.maxPoints * 0.85);
                  const step4 = crit.maxPoints;

                  return (
                    <div key={crit.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{crit.criterion}</span>
                        <span className="font-bold text-sky-700">{currentCriterionScore} / {crit.maxPoints} pts</span>
                      </div>

                      {/* Clickable Rating Bands */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {[
                          { label: 'Unsat.', pts: step1 },
                          { label: 'Developing', pts: step2 },
                          { label: 'Proficient', pts: step3 },
                          { label: 'Exemplary', pts: step4 },
                        ].map((tier, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleRubricScoreSelect(crit.id, tier.pts)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold border transition-colors text-center cursor-pointer ${
                              currentCriterionScore === tier.pts
                                ? 'bg-sky-600 text-white border-sky-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                            }`}
                          >
                            <div>{tier.label}</div>
                            <div className="text-[9px] opacity-80">{tier.pts} pts</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Feedback Comments */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Formative Feedback for Student
                </label>
                <button
                  type="button"
                  onClick={() =>
                    openAiAssistant(
                      `Please draft constructive, encouraging teacher feedback for a student who scored ${score}/${currentAssignment.points} on "${currentAssignment.title}". Mention that their code logic is clear and offer one improvement tip.`
                    )
                  }
                  className="text-[10px] font-bold text-teal-700 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> AI Feedback Assistant
                </button>
              </div>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Add constructive comments, strengths, and areas to review..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500"
              />
            </div>

            {/* Audit Reason */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Audit Reason (Logged for compliance & grade changes)
              </label>
              <input
                type="text"
                value={auditReason}
                onChange={e => setAuditReason(e.target.value)}
                placeholder="e.g. SpeedGrader initial evaluation completed"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* Action Buttons: Save Draft vs Publish */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleSaveGrading(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={() => handleSaveGrading(true)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Publish Grade</span>
              </button>
            </div>

            {isSaved && (
              <p className="text-center text-xs font-bold text-emerald-600 animate-in fade-in">
                ✓ Evaluation recorded successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
