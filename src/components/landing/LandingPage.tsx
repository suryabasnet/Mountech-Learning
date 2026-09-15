import React from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Users,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Cpu,
  School,
  Building2,
  Briefcase,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { Logo } from '../common/Logo';

export const LandingPage: React.FC = () => {
  const { switchUser, setShowLandingPage, setActiveView, institutions, t } = useLMS();

  const handleRoleQuickLogin = async (userId: string, defaultView: any = 'dashboard') => {
    await switchUser(userId);
    setActiveView(defaultView);
    setShowLandingPage(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Logo size="lg" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRoleQuickLogin('user-student-1')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Demo Accounts
            </button>
            <button
              onClick={() => handleRoleQuickLogin('user-teacher-1')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              id="landing-enter-lms-btn"
            >
              Enter MounTech LMS
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-sky-50/70 via-white to-slate-50 border-b border-slate-200">
        {/* Background decorative subtle gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
          <div className="absolute top-10 left-1/4 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-teal-300/25 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Mountech Solutions Banner Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-300 text-sky-800 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Crafted for Mountech Solutions
            <span className="text-slate-400">|</span>
            <span className="text-teal-700 font-bold">Enterprise LMS Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Next-Generation Learning for{' '}
            <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Schools, Colleges & Training Institutes
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Inspired by Canvas LMS workflows with original Mountech branding. Manage educational hierarchy from institution to assessments, SpeedGrader rubrics, attendance, and Gemini AI pedagogical assistance.
          </p>

          {/* Quick Demo Access Roles Matrix */}
          <div className="mt-10 max-w-4xl mx-auto">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
              One-Click Instant Demo Experience:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <button
                onClick={() => handleRoleQuickLogin('user-student-1', 'dashboard')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all text-left group cursor-pointer"
                id="demo-btn-student"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Student</span>
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-sky-600">Aarav Basnet</p>
                <p className="text-[10px] text-slate-500 truncate">CS 4th Sem (HITM)</p>
              </button>

              <button
                onClick={() => handleRoleQuickLogin('user-teacher-1', 'dashboard')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left group cursor-pointer"
                id="demo-btn-teacher"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Teacher</span>
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">Prof. Anil</p>
                <p className="text-[10px] text-slate-500 truncate">DBMS & Logic</p>
              </button>

              <button
                onClick={() => handleRoleQuickLogin('user-admin', 'dashboard')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left group cursor-pointer"
                id="demo-btn-admin"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">College Admin</span>
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Dr. Ramesh</p>
                <p className="text-[10px] text-slate-500 truncate">HITM Administration</p>
              </button>

              <button
                onClick={() => handleRoleQuickLogin('user-parent', 'dashboard')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all text-left group cursor-pointer"
                id="demo-btn-parent"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Parent</span>
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-amber-600">Hari Basnet</p>
                <p className="text-[10px] text-slate-500 truncate">Linked to Aarav</p>
              </button>

              <button
                onClick={() => handleRoleQuickLogin('user-super', 'super_admin')}
                className="col-span-2 sm:col-span-1 p-3 bg-slate-900 text-white rounded-xl border border-slate-800 hover:border-teal-400 hover:shadow-md transition-all text-left group cursor-pointer"
                id="demo-btn-superadmin"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span className="text-[10px] text-teal-300 font-bold uppercase">SuperAdmin</span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-teal-300">Platform Admin</p>
                <p className="text-[10px] text-slate-400 truncate">Multi-Institution</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Levels Supported */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Supported Educational Tiers</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Configurable academic hierarchies tailored to schools, colleges, professional diplomas, and universities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                <School className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Primary & Secondary</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                K-12 schools with section tracking, guardian portals, attendance logs, and percentage grading.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-sky-700 font-semibold">
                Demo: Mount View Academy
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Higher Secondary (+2)</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Science, Management & Humanities streams with weighted term exams and continuous homework tracking.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-teal-700 font-semibold">
                Demo: Higher Secondary Science
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Bachelor’s & Master’s</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                University degree programs with Semester system, 4.0 GPA scale, research papers, and prerequisite modules.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-emerald-700 font-semibold">
                Demo: HITM College (BSc CSIT)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Diploma & Professional</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Bootcamps and corporate training with competency-based rubrics, skill badges, and capstone evaluation.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-indigo-700 font-semibold">
                Demo: MounTech IT Training
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Showcase */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Academic Workflow Architecture</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-mono">
              Institution → Program → Term → Course → Module → Lesson → Activity → Assessment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Course & Lesson Authoring</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Teachers organize units with drag-and-drop order, attach slide decks, configure completion rules (view, pass score, submit), and preview the student view.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h3 className="font-bold text-slate-800 text-sm">SpeedGrader & Weighted Rubrics</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Grade submissions using multi-tier criteria rubrics. Save draft grades or publish immediately to gradebooks with CSV export and audit tracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Gemini AI Learning Lab</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Server-side AI explains concepts step-by-step, creates practice questions, generates instructor rubrics, and enforces academic integrity rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Mountech Solutions. Modern LMS for global education.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span>English / नेपाली</span>
            <span>Asia/Kathmandu (NPT)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
