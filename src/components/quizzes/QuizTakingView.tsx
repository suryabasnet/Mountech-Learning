import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  RefreshCw,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { Quiz, QuizQuestion, QuizAttempt } from '../../types';

export const QuizTakingView: React.FC = () => {
  const {
    quizzes,
    selectedQuizId,
    submitQuizAttempt,
    setActiveView,
    t,
  } = useLMS();

  const quiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((quiz?.timeLimitMinutes || 20) * 60);
  const [startedAt] = useState(new Date().toISOString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Live countdown timer
  useEffect(() => {
    if (completedAttempt) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [completedAttempt]);

  if (!quiz) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">Quiz not found.</p>
        <button
          onClick={() => setActiveView('quizzes')}
          className="mt-3 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold"
        >
          View All Quizzes
        </button>
      </div>
    );
  }

  const currentQ: QuizQuestion = quiz.questions[currentQuestionIndex] || quiz.questions[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setResponses(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSelectMultiple = (questionId: string, optionId: string) => {
    const currentList: string[] = responses[questionId] || [];
    const updated = currentList.includes(optionId)
      ? currentList.filter(id => id !== optionId)
      : [...currentList, optionId];
    setResponses(prev => ({ ...prev, [questionId]: updated }));
  };

  const handleTextResponse = (questionId: string, text: string) => {
    setResponses(prev => ({ ...prev, [questionId]: text }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    const attempt = await submitQuizAttempt(quiz.id, responses, startedAt);
    setIsSubmitting(false);
    if (attempt) {
      setCompletedAttempt(attempt);
    }
  };

  // Result Review screen after submission
  if (completedAttempt) {
    const passed = completedAttempt.passed;
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {passed ? 'Assessment Completed Successfully!' : 'Quiz Completed'}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You scored <span className="font-bold text-slate-900">{completedAttempt.score} / {completedAttempt.maxScore}</span> points ({completedAttempt.percentage}%).
            Passing threshold: <b>{quiz.passingScore}%</b>.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setCompletedAttempt(null);
                setResponses({});
                setTimeLeftSeconds(quiz.timeLimitMinutes * 60);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() => setActiveView('course_workspace')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Back to Course
            </button>
          </div>
        </div>

        {/* Question-by-Question Review */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Pedagogical Review & Explanations
          </h3>

          <div className="space-y-4 divide-y divide-slate-100">
            {quiz.questions.map((q, idx) => {
              const studentAns = responses[q.id];
              const isCorrect = q.correctOptionIds
                ? (Array.isArray(q.correctOptionIds)
                    ? JSON.stringify(studentAns) === JSON.stringify(q.correctOptionIds)
                    : studentAns === q.correctOptionIds[0])
                : (q.correctAnswer ? (Array.isArray(q.correctAnswer) ? JSON.stringify(studentAns) === JSON.stringify(q.correctAnswer) : studentAns === q.correctAnswer) : false);

              return (
                <div key={q.id} className="pt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Question {idx + 1}: {q.prompt}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? `+${q.points} pts (Correct)` : '0 pts'}
                    </span>
                  </div>

                  {q.explanation && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      💡 <b>Explanation:</b> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Timed Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">{quiz.title}</h2>
          <span className="text-[11px] text-slate-400">
            Passing requirement: {quiz.passingScore}% • Auto-save active
          </span>
        </div>

        {/* Live Countdown Timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono font-bold text-sm">
          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>{formatTime(timeLeftSeconds)}</span>
        </div>
      </div>

      {/* Question Number Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {quiz.questions.map((q, idx) => {
          const isAnswered = responses[q.id] !== undefined && responses[q.id] !== '';
          const isCurrent = idx === currentQuestionIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isAnswered
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">{currentQ.prompt}</h3>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
            {currentQ.points} Points
          </span>
        </div>

        {/* Question Type: Single Choice / Multiple Choice */}
        {(currentQ.type === 'single_choice' || currentQ.type === 'multiple_choice') && (
          <div className="space-y-2.5">
            {currentQ.type === 'multiple_choice' && (
              <p className="text-[11px] text-slate-400 italic">Select all that apply:</p>
            )}
            {currentQ.options?.map((opt: any, idx: number) => {
              const optId = typeof opt === 'object' && opt ? opt.id : String(opt);
              const optText = typeof opt === 'object' && opt ? opt.text : String(opt);
              const isSelected = currentQ.type === 'single_choice'
                ? responses[currentQ.id] === optId
                : ((responses[currentQ.id] || []) as string[]).includes(optId);

              return (
                <button
                  key={optId || idx}
                  onClick={() =>
                    currentQ.type === 'single_choice'
                      ? handleSelectOption(currentQ.id, optId)
                      : handleSelectMultiple(currentQ.id, optId)
                  }
                  className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span>{optText}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Question Type: Short Answer & Essay */}
        {(currentQ.type === 'short_answer' || currentQ.type === 'essay') && (
          <div>
            <textarea
              rows={currentQ.type === 'essay' ? 5 : 2}
              value={responses[currentQ.id] || ''}
              onChange={e => handleTextResponse(currentQ.id, e.target.value)}
              placeholder="Enter your academic response..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500"
            />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
            disabled={currentQuestionIndex <= 0}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(i => Math.min(quiz.questions.length - 1, i + 1))}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Quiz Submission</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to finalize your exam attempt? You will not be able to edit your answers once submitted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Continue Reviewing
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
