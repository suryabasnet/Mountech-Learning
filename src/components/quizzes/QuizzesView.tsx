import React from 'react';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const QuizzesView: React.FC = () => {
  const {
    quizzes,
    courses,
    selectedCourseId,
    quizAttempts,
    setSelectedQuizId,
    setActiveView,
    t,
  } = useLMS();

  const displayedQuizzes = quizzes.filter(q => {
    if (selectedCourseId) return q.courseId === selectedCourseId;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('quizzes')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Formative assessments, module checks, and term examinations.
          </p>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedQuizzes.map(quiz => {
          const course = courses.find(c => c.id === quiz.courseId);
          const attempt = quizAttempts.find(a => a.quizId === quiz.id);

          return (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                    {course?.code}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quiz.timeLimitMinutes} mins</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{quiz.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{quiz.description}</p>

                <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                  <span>{quiz.questionsCount} Questions</span>
                  <span>•</span>
                  <span>Passing: {quiz.passingScore}%</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {attempt ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Scored: {attempt.percentage}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Not yet taken</span>
                )}

                <button
                  onClick={() => {
                    setSelectedQuizId(quiz.id);
                    setActiveView('quiz_taking');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{attempt ? 'Retake Exam' : 'Start Exam'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
