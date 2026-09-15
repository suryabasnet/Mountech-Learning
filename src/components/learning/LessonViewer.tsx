import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Download,
  FileText,
  Video,
  Play,
  Pause,
  Volume2,
  Maximize2,
  StickyNote,
  Languages,
  Check,
  Clock,
  Layers,
  Lock,
  Unlock,
  Copy,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Shield,
  CheckCheck,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { Lesson, LessonSummaryResponse } from '../../types';

export const LessonViewer: React.FC = () => {
  const {
    courses,
    selectedCourseId,
    modules,
    selectedLessonId,
    setSelectedLessonId,
    studentProgress,
    markLessonComplete,
    toggleLessonBookmark,
    openAiAssistant,
    setActiveView,
    currentUser,
    currentInstitution,
    summarizeLesson,
    toggleLessonAiStatus,
    t,
  } = useLMS();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptLang, setTranscriptLang] = useState<'en' | 'ne'>('en');
  const [studentNote, setStudentNote] = useState<string>('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // AI Content Summarization State
  const [summaryData, setSummaryData] = useState<LessonSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLanguage, setSummaryLanguage] = useState<'en' | 'ne'>('en');
  const [summaryFormat, setSummaryFormat] = useState<'concise' | 'takeaways' | 'full'>('concise');
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [copiedToNotes, setCopiedToNotes] = useState(false);
  const [isTogglingLock, setIsTogglingLock] = useState(false);

  const course = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Flatten all lessons across modules for easy prev/next navigation
  const allLessons: Lesson[] = modules.flatMap(m => m.lessons || []);
  const currentLessonIndex = allLessons.findIndex(l => l.id === selectedLessonId);
  const currentLesson: Lesson =
    allLessons[currentLessonIndex] || allLessons[0] || {
      id: 'les-1',
      moduleId: 'mod-1',
      courseId: course?.id || 'course-1',
      title: 'Introduction to Relational Algebra and SQL',
      type: 'reading',
      durationMinutes: 30,
      contentSummary: 'Basic set theory operations applied to relational databases.',
      completionCriteria: 'view',
      isPublished: true,
      order: 1,
    };

  const isCompleted = studentProgress?.completedLessonIds?.includes(currentLesson.id);
  const isBookmarked = studentProgress?.bookmarkedLessonIds?.includes(currentLesson.id);

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin';
  const isAiSummarizationEnabledByAdmin = currentInstitution?.aiLessonSummarizationEnabled !== false;
  const isLessonAiLocked = !!currentLesson.aiSummarizerDisabled;

  // Reset summary states when lesson changes
  useEffect(() => {
    setSummaryData(null);
    setSummaryError(null);
    setShowHint(false);
    setCopiedToNotes(false);
  }, [currentLesson.id]);

  // Load saved note from localStorage for current lesson
  useEffect(() => {
    const saved = localStorage.getItem(`lms_notes_${currentLesson.id}`);
    if (saved) setStudentNote(saved);
    else setStudentNote('');
    setNotesSaved(false);
  }, [currentLesson.id]);

  const handleSaveNote = () => {
    localStorage.setItem(`lms_notes_${currentLesson.id}`, studentNote);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleSummarize = async () => {
    if (!isAiSummarizationEnabledByAdmin) {
      setSummaryError('AI Lesson Summarization is currently turned off at the institution level by policy.');
      setShowSummaryPanel(true);
      return;
    }

    if (isLessonAiLocked && !isTeacherOrAdmin) {
      setSummaryError('AI Summarization is locked for this lesson by your instructor to preserve graded assessment integrity.');
      setShowSummaryPanel(true);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);
    setShowSummaryPanel(true);

    const fullContentForGrounding = `
Course: ${course?.title} (${course?.code || ''})
Lesson: ${currentLesson.title}
Duration: ${currentLesson.durationMinutes} minutes
Syllabus Summary: ${currentLesson.contentSummary || 'Relational schema design, entity keys, normalization (1NF-3NF/BCNF), and referential integrity cascade constraints.'}

Overview & Importance:
In computer science and modern distributed software systems, database integrity ensures accuracy and consistency over the entire data lifecycle.
Core Principles:
1. Referential Integrity: A table referencing another table must contain valid keys existing in the parent record. Foreign keys maintain consistency across normalized relations.
2. Boyce-Codd Normal Form: Eliminates all functional dependency redundancies by ensuring every determinant is a superkey.
3. Cascade Constraints: ON DELETE CASCADE propagates parent record deletions cleanly to prevent orphaned child tuples.
4. Indexing: Proper B-Tree indices prevent expensive sequential full-table scans.
`;

    try {
      const result = await summarizeLesson({
        courseId: course?.id || 'course-1',
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        content: fullContentForGrounding,
        language: summaryLanguage,
        summaryFormat,
      });
      setSummaryData(result);
    } catch (err: any) {
      setSummaryError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleToggleAiLock = async () => {
    if (!isTeacherOrAdmin) return;
    setIsTogglingLock(true);
    try {
      await toggleLessonAiStatus(
        currentLesson.id,
        !isLessonAiLocked,
        isLessonAiLocked ? '' : 'Locked for active examination and graded assessment integrity.'
      );
    } catch (err) {
      console.error('Failed to toggle AI lock:', err);
    } finally {
      setIsTogglingLock(false);
    }
  };

  const handleCopySummaryToNotes = () => {
    if (!summaryData) return;
    const keyTakeawaysList = Array.isArray(summaryData.keyTakeaways)
      ? summaryData.keyTakeaways.map(k => `• ${k}`).join('\n')
      : '';
    const formattedAppend = `\n\n--- [AI Lesson Summary (${new Date().toLocaleDateString()})] ---\n${summaryData.summary || ''}\n\nKey Takeaways:\n${keyTakeawaysList}\n`;
    const updated = studentNote + formattedAppend;
    setStudentNote(updated);
    localStorage.setItem(`lms_notes_${currentLesson.id}`, updated);
    setCopiedToNotes(true);
    setNotesSaved(true);
    setTimeout(() => setCopiedToNotes(false), 2500);
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setSelectedLessonId(allLessons[currentLessonIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setSelectedLessonId(allLessons[currentLessonIndex + 1].id);
    }
  };

  const handleComplete = async () => {
    if (course) {
      await markLessonComplete(course.id, currentLesson.id);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left Module Navigation Drawer */}
      <div
        className={`bg-white rounded-2xl border border-slate-200 shadow-xs flex-shrink-0 transition-all duration-300 w-full ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-80'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Module Syllabus
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{course?.title}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 hidden lg:block"
            title="Toggle outline"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="p-2 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
            {modules.map(mod => (
              <div key={mod.id} className="space-y-1">
                <p className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {mod.title}
                </p>
                <div className="space-y-0.5">
                  {(mod.lessons || []).map(lesson => {
                    const isSelected = lesson.id === currentLesson.id;
                    const done = studentProgress?.completedLessonIds?.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <div className={`w-3.5 h-3.5 rounded-full border ${isSelected ? 'border-sky-500' : 'border-slate-300'} flex-shrink-0`} />
                        )}
                        <span className="truncate flex-1">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Center Main Lesson Content */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        {/* Lesson Top Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-semibold text-sky-600">{course?.code}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentLesson.durationMinutes} min read / lecture
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{currentLesson.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => course && toggleLessonBookmark(course.id, currentLesson.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'border-amber-400 bg-amber-50 text-amber-600'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Bookmark this lesson"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* AI Lesson Summarizer Trigger Button */}
            <button
              onClick={() => {
                if (!showSummaryPanel) {
                  handleSummarize();
                } else {
                  setShowSummaryPanel(false);
                }
              }}
              disabled={summaryLoading || (!isTeacherOrAdmin && (!isAiSummarizationEnabledByAdmin || isLessonAiLocked))}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isLessonAiLocked && !isTeacherOrAdmin
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : !isAiSummarizationEnabledByAdmin
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : showSummaryPanel
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-xs'
              }`}
              title={
                !isAiSummarizationEnabledByAdmin
                  ? 'AI Summarizer disabled by institution policy'
                  : isLessonAiLocked
                  ? 'AI Summarizer locked for graded assessment'
                  : 'Summarize this lesson using Gemini AI'
              }
            >
              {summaryLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
              ) : isLessonAiLocked ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              )}
              <span>{showSummaryPanel && summaryData ? 'Hide Summary' : 'Summarize Lesson'}</span>
            </button>

            <button
              onClick={() =>
                openAiAssistant(
                  `Help me study this lesson: "${currentLesson.title}" from course "${course?.title}". Please explain the key ideas simply and give two practice problems.`
                )
              }
              className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Ask AI Tutor</span>
            </button>

            <button
              onClick={handleComplete}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed ✓' : 'Mark as Completed'}</span>
            </button>
          </div>
        </div>

        {/* Teacher Integrity Control Banner (Visible to teachers/admins) */}
        {isTeacherOrAdmin && (
          <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-950 flex items-center gap-2">
                  <span>Teacher Academic Integrity Lock</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isLessonAiLocked ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {isLessonAiLocked ? '🔒 AI Summarizer Locked' : '✓ AI Allowed'}
                  </span>
                </p>
                <p className="text-[11px] text-amber-800">
                  {isLessonAiLocked
                    ? 'Students cannot use AI content summarization during this graded assessment or exam module.'
                    : 'Students may request AI summaries and formative tutoring for this learning material.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleAiLock}
              disabled={isTogglingLock}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                isLessonAiLocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-amber-700 hover:bg-amber-800 text-white shadow-xs'
              }`}
            >
              {isTogglingLock ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isLessonAiLocked ? (
                <Unlock className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>{isLessonAiLocked ? 'Unlock AI for Students' : 'Lock AI for Assessment'}</span>
            </button>
          </div>
        )}

        {/* Student Lockdown Warning if AI is locked */}
        {!isTeacherOrAdmin && isLessonAiLocked && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-rose-900">
            <Lock className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Academic Assessment Mode Active</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                AI Summarization has been temporarily locked by your instructor for this graded assessment to maintain academic integrity.
              </p>
            </div>
          </div>
        )}

        {/* AI Lesson Summarizer Workspace Panel */}
        {showSummaryPanel && (
          <div className="bg-gradient-to-b from-purple-50/60 to-white rounded-2xl border-2 border-purple-200 p-5 shadow-xs space-y-4">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">
                      MounTech AI Lesson Summarizer
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Gemini 3.8 Flash
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Grounded in official syllabus materials with pedagogical transparency
                  </p>
                </div>
              </div>

              {/* Language & Format Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Language switch */}
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                  <button
                    onClick={() => setSummaryLanguage('en')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      summaryLanguage === 'en' ? 'bg-white shadow-xs text-purple-700' : 'text-slate-500'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSummaryLanguage('ne')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      summaryLanguage === 'ne' ? 'bg-white shadow-xs text-purple-700' : 'text-slate-500'
                    }`}
                  >
                    नेपाली (Nepali)
                  </button>
                </div>

                {/* Format switch */}
                <select
                  value={summaryFormat}
                  onChange={e => setSummaryFormat(e.target.value as any)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded-lg text-slate-700 focus:border-purple-500"
                >
                  <option value="concise">Concise Digest</option>
                  <option value="takeaways">Key Takeaways Only</option>
                  <option value="full">Comprehensive Study Brief</option>
                </select>

                <button
                  onClick={handleSummarize}
                  disabled={summaryLoading}
                  className="px-2.5 py-1 text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Regenerate summary"
                >
                  <RotateCcw className={`w-3 h-3 ${summaryLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {summaryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cannot Summarize Lesson</p>
                  <p className="text-[11px] mt-0.5">{summaryError}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {summaryLoading && (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Generating Grounded Lesson Summary...
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Reading lecture transcripts, extracting core formulas, and validating against course syllabus...
                  </p>
                </div>
              </div>
            )}

            {/* Summary Content Body */}
            {!summaryLoading && summaryData && (
              <div className="space-y-4">
                {/* AI Attribution & Grounding Header Banner */}
                <div className="p-2.5 rounded-xl bg-purple-100/60 border border-purple-200 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-purple-900 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>
                      <b>AI-Assisted Educational Summary:</b> Strictly grounded in "{currentLesson.title}". Flagged for academic transparency.
                    </span>
                  </div>
                  <span className="text-slate-500 text-[10px] hidden sm:inline">
                    {new Date(summaryData.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Section 1: Executive Overview */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Executive Summary</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {summaryData.summary}
                  </p>
                </div>

                {/* Section 2: Core Takeaways */}
                {summaryData.keyTakeaways && summaryData.keyTakeaways.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Core Takeaways & Rules</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {summaryData.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 3: Key Terminology & Definitions */}
                {summaryData.keyDefinitions && summaryData.keyDefinitions.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      <span>Key Terminology & Definitions</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {summaryData.keyDefinitions.map((def, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <p className="font-bold text-slate-900">{def.term}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-normal">{def.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 4: Self-Check Formative Question */}
                {summaryData.selfCheckQuestion && (
                  <div className="bg-sky-50/70 border border-sky-200 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
                        <span>Comprehension Check: {summaryData.selfCheckQuestion.question}</span>
                      </h3>
                      {summaryData.selfCheckQuestion.answerHint && (
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className="text-[11px] font-bold text-sky-700 hover:text-sky-800 underline cursor-pointer"
                        >
                          {showHint ? 'Hide Hint' : 'Reveal Answer Hint'}
                        </button>
                      )}
                    </div>
                    {showHint && summaryData.selfCheckQuestion.answerHint && (
                      <p className="text-[11px] text-sky-800 bg-white/80 p-2.5 rounded-lg border border-sky-200 font-medium">
                        💡 <b>Pedagogical Hint:</b> {summaryData.selfCheckQuestion.answerHint}
                      </p>
                    )}
                  </div>
                )}

                {/* Bottom Action Strip */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Source: {course?.title} • {currentLesson.title}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySummaryToNotes}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedToNotes ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Appended to Notes!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Append to Study Notes</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowSummaryPanel(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Player Simulation (if type === 'video' or has video) */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
          <div className="relative aspect-video bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="max-w-md space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center backdrop-blur-xs">
                {isPlaying ? <Video className="w-8 h-8 animate-pulse" /> : <Play className="w-8 h-8 ml-1" />}
              </div>
              <h3 className="text-base font-bold text-white">{currentLesson.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-2">
                HD Instructional Lecture with synchronized transcript & code walkthrough.
              </p>
            </div>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <span className="text-[11px] text-slate-300 font-mono">14:20 / 30:00</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaybackSpeed(s => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
                  className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[11px] font-bold text-white"
                >
                  {playbackSpeed}x
                </button>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    showTranscript ? 'bg-teal-500 text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  Transcript CC
                </button>
              </div>
            </div>
          </div>

          {/* Synchronized Transcript Drawer */}
          {showTranscript && (
            <div className="p-4 bg-slate-800 border-t border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-700">
                <span className="font-bold uppercase tracking-wider text-[10px]">Synchronized Transcript</span>
                <button
                  onClick={() => setTranscriptLang(l => (l === 'en' ? 'ne' : 'en'))}
                  className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 cursor-pointer"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Translate to {transcriptLang === 'en' ? 'नेपाली (Nepali)' : 'English'}</span>
                </button>
              </div>

              <div className="text-slate-200 leading-relaxed font-sans max-h-40 overflow-y-auto space-y-2">
                {transcriptLang === 'en' ? (
                  <>
                    <p><b className="text-sky-400">[00:00]</b> Hello students. Today we analyze relational schema design, primary keys, and foreign key integrity constraints.</p>
                    <p><b className="text-sky-400">[05:12]</b> Notice how entity-relationship cardinality influences our table normalizations (1NF through 3NF/BCNF).</p>
                    <p><b className="text-sky-400">[12:45]</b> When writing SQL queries, avoid SELECT * in production schemas to optimize indexing and IOPS performance.</p>
                  </>
                ) : (
                  <>
                    <p><b className="text-teal-400">[००:००]</b> नमस्ते विद्यार्थीहरू। आज हामी रिलेसनल स्किमा डिजाइन, प्राइमरी कि, र फरेन कि इन्टेग्रिटी नियमहरूको विश्लेषण गर्छौं।</p>
                    <p><b className="text-teal-400">[०५:१२]</b> ध्यान दिनुहोस् कि कसरी ई-आर कार्डिन्यालिटीले हाम्रा तालिका सामान्यीकरणहरूलाई प्रभाव पार्छ।</p>
                    <p><b className="text-teal-400">[१२:४५]</b> एसक्यूएल क्वेरी लेख्दा, इन्डेक्सिङ र प्रदर्शन अनुकूलन गर्न उत्पादन वातावरणमा सधैं स्पष्ट स्तम्भहरू छनोट गर्नुहोस्।</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lesson Study Guide & Rich Reading Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Pedagogical Study Guide & Key Concepts
          </h2>

          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-3 text-slate-700">
            <p className="font-semibold text-slate-800">
              Overview & Academic Importance:
            </p>
            <p>
              In computer science and modern distributed software systems, database integrity ensures accuracy and consistency over the entire data lifecycle.
            </p>

            <div className="bg-sky-50 border-l-4 border-sky-600 p-3 rounded-r-xl">
              <p className="font-bold text-sky-900 mb-1">Core Principle: Referential Integrity</p>
              <p className="text-sky-800">
                A table that references another table must contain valid keys existing in the parent record. Foreign keys maintain consistency across normalized relations.
              </p>
            </div>

            <p className="font-semibold text-slate-800 mt-4">Code & Query Example:</p>
            <pre className="bg-slate-900 text-teal-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
{`-- Relational Definition with Foreign Key Cascade
CREATE TABLE Enrollments (
    enrollment_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'enrolled',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
);`}
            </pre>
          </div>
        </div>

        {/* Downloadable Resources & Attachments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Downloadable Course Resources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Lecture_Slides_Week4.pdf</p>
                  <p className="text-[10px] text-slate-400">PDF Document • 4.2 MB</p>
                </div>
              </div>
              <button
                onClick={() => alert('Downloading Lecture_Slides_Week4.pdf')}
                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800">SQL_Schema_Lab_Exercises.sql</p>
                  <p className="text-[10px] text-slate-400">SQL Script • 12 KB</p>
                </div>
              </div>
              <button
                onClick={() => alert('Downloading SQL_Schema_Lab_Exercises.sql')}
                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Student Personal Notes Scratchpad */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Personal Study Notes & Scratchpad
              </h3>
            </div>
            {notesSaved && (
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved to notebook
              </span>
            )}
          </div>

          <textarea
            rows={3}
            value={studentNote}
            onChange={e => setStudentNote(e.target.value)}
            placeholder="Jot down important reminders, lecture timestamps, or revision questions..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 text-slate-800"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveNote}
              className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Save Notes
            </button>
          </div>
        </div>

        {/* Previous & Next Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrevious}
            disabled={currentLessonIndex <= 0}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Lesson</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentLessonIndex >= allLessons.length - 1}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
