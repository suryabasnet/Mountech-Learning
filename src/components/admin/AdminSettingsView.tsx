import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Calendar,
  Sparkles,
  Shield,
  Key,
  Globe,
  Sliders,
  Save,
  CheckCircle2,
  Database,
  Lock,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const AdminSettingsView: React.FC = () => {
  const {
    institution,
    updateInstitutionSettings,
    t,
  } = useLMS();

  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'academic' | 'ai_policy' | 'integrations'>('branding');
  const [instName, setInstName] = useState(institution.name);
  const [instDomain, setInstDomain] = useState('lms.hitm.edu.np');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [currentTerm, setCurrentTerm] = useState('Spring 2026');

  // AI Policy toggles
  const [aiEnabled, setAiEnabled] = useState(institution.aiFeaturesEnabled ?? true);
  const [aiLessonSummarization, setAiLessonSummarization] = useState(institution.aiLessonSummarizationEnabled ?? true);
  const [aiDisabledForAssessments, setAiDisabledForAssessments] = useState(institution.aiDisabledForGradedAssessments ?? true);
  const [aiTutorForStudents, setAiTutorForStudents] = useState(true);
  const [aiGradingAssistance, setAiGradingAssistance] = useState(true);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateInstitutionSettings({
      name: instName,
      aiFeaturesEnabled: aiEnabled,
      aiLessonSummarizationEnabled: aiLessonSummarization,
      aiDisabledForGradedAssessments: aiDisabledForAssessments,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('settings')} & Institutional Operations</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure branding, academic periods, AI governance guardrails, and enterprise integrations.
          </p>
        </div>

        {isSaved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4" /> Changes Applied
          </span>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold max-w-lg">
        <button
          onClick={() => setActiveSubTab('branding')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'branding' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
          }`}
        >
          Branding & Identity
        </button>
        <button
          onClick={() => setActiveSubTab('academic')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'academic' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
          }`}
        >
          Academic Calendar
        </button>
        <button
          onClick={() => setActiveSubTab('ai_policy')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'ai_policy' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
          }`}
        >
          AI Governance
        </button>
        <button
          onClick={() => setActiveSubTab('integrations')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'integrations' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
          }`}
        >
          SIS & LTI
        </button>
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {activeSubTab === 'branding' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Institution Identity & White-Labeling
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institution Legal Name</label>
              <input
                type="text"
                value={instName}
                onChange={e => setInstName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom Institutional FQDN Domain</label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={instDomain}
                  onChange={e => setInstDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Theme Color</label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-600 border border-slate-200 shadow-xs" />
                <span className="text-xs font-mono text-slate-600">#0284c7 (MounTech Royal Sky)</span>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'academic' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Academic Term Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Active Term</label>
                <input
                  type="text"
                  value={currentTerm}
                  onChange={e => setCurrentTerm(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grading System</label>
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Standard 4.00 Grade Point Average (GPA) Scale with letter honors: A (4.0), A- (3.75), B+ (3.5), B (3.0), C+ (2.5), F (0.0).
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'ai_policy' && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI Pedagogical Governance & Ethical Safeguards
            </h3>

            <p className="text-xs text-slate-600">
              In accordance with MounTech Learning institutional guidelines, AI tools act solely as formative pedagogical assistants and never make high-stakes grading decisions unilaterally.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Institution-wide AI Capabilities</p>
                  <p className="text-[11px] text-slate-500">Enable Google Gemini intelligence models for campus users</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={e => setAiEnabled(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </div>

              {/* AI Lesson Content Summarizer Institution Toggle */}
              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">AI Lesson Content Summarizer</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                      Lesson Viewer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Allow students to generate concise, grounded summaries of lesson reading materials and video transcripts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiLessonSummarization}
                  onChange={e => setAiLessonSummarization(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </div>

              {/* Assessment Lockdown Default */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">Graded Assessment AI Lockout (Integrity Guard)</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Honor Code
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Automatically restrict AI assistance during active exams, quizzes, and graded submissions (instructors can override per lesson)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiDisabledForAssessments}
                  onChange={e => setAiDisabledForAssessments(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Student AI Socratic Tutor</p>
                  <p className="text-[11px] text-slate-500">Provide step-by-step guidance without giving direct exam answers</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiTutorForStudents}
                  onChange={e => setAiTutorForStudents(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Teacher SpeedGrader Rubric Suggestions</p>
                  <p className="text-[11px] text-slate-500">Assist faculty with formative feedback drafts (requires teacher confirmation)</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiGradingAssistance}
                  onChange={e => setAiGradingAssistance(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'integrations' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              SIS, LTI 1.3 & Enterprise SSO
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Student Information System (SIS) API</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Synchronized with University Central Registrar (Tuples, Registrations, Roll Nos).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">LTI 1.3 Advantage Protocol</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Ready for external tool integration (JupyterHub, Labster, Turnitin).
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
