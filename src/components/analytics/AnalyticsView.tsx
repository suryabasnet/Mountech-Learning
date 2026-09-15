import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Users,
  Search,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const AnalyticsView: React.FC = () => {
  const {
    courses,
    auditLogs,
    t,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<'overview' | 'at_risk' | 'audit'>('overview');

  // At-risk student cohort
  const atRiskStudents = [
    {
      id: 'st-risk-1',
      name: 'Rohan Shrestha',
      rollNo: 'HITM-CS-2024-045',
      riskLevel: 'HIGH',
      attendancePct: 62,
      missingAssignments: 3,
      avgGrade: 58.4,
      lastActive: '5 days ago',
      intervention: 'Advisor meeting scheduled; Academic support referral sent',
    },
    {
      id: 'st-risk-2',
      name: 'Pooja Karki',
      rollNo: 'HITM-CS-2024-044',
      riskLevel: 'MEDIUM',
      attendancePct: 78,
      missingAssignments: 1,
      avgGrade: 71.2,
      lastActive: 'Yesterday',
      intervention: 'Automated deadline reminder notification sent',
    },
    {
      id: 'st-risk-3',
      name: 'Suman Thapa',
      rollNo: 'HITM-CS-2024-043',
      riskLevel: 'LOW',
      attendancePct: 94,
      missingAssignments: 0,
      avgGrade: 84.5,
      lastActive: '2 hours ago',
      intervention: 'On track; eligible for Dean’s Honor list',
    },
  ];

  // Quiz Item Analysis Demo
  const quizItemsAnalysis = [
    { question: 'Q1: Normal Forms (3NF vs BCNF)', correctPct: 88, difficulty: 'Moderate', discriminationIndex: 0.42 },
    { question: 'Q2: Candidate Key Identification', correctPct: 64, difficulty: 'High', discriminationIndex: 0.51 },
    { question: 'Q3: Referential Integrity Constraints', correctPct: 95, difficulty: 'Easy', discriminationIndex: 0.28 },
    { question: 'Q4: Multi-valued Dependencies (4NF)', correctPct: 52, difficulty: 'Very High', discriminationIndex: 0.62 },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    alert(`Exporting Institutional Academic Analytics in ${format.toUpperCase()} format...`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('analytics')} & Institutional Intelligence</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Retention analytics, early-warning risk detection, and immutable accreditation audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Executive Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold max-w-md">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
          }`}
        >
          Performance Metrics
        </button>
        <button
          onClick={() => setActiveTab('at_risk')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'at_risk' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
          }`}
        >
          Early Warning (At-Risk)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'audit' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
          }`}
        >
          Accreditation Audit Logs
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Average Course Completion</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">87.4%</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5" /> +4.2% vs Last Academic Year
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Institutional Retention Rate</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">94.8%</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5" /> Top 5th percentile in region
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Active Course Enrollments</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">428</p>
              <span className="text-xs font-semibold text-slate-500 mt-2 block">Across 6 Academic Programs</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Accreditation Audit Score</span>
              <p className="text-2xl font-extrabold text-sky-700 mt-1">99.2%</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Full ISO/UGC Compliance
              </span>
            </div>
          </div>

          {/* Quiz Item Discrimination Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Psychometric Assessment Analysis (Item Discrimination)
            </h3>
            <p className="text-xs text-slate-500">
              Item discrimination values above 0.30 indicate strong ability to differentiate high-performing from struggling learners.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="p-3">Question Prompt</th>
                    <th className="p-3">Success Rate</th>
                    <th className="p-3">Difficulty Rating</th>
                    <th className="p-3 text-right">Discrimination Index (r_pbi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizItemsAnalysis.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-800">{item.question}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-sky-600 h-full rounded-full"
                              style={{ width: `${item.correctPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{item.correctPct}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {item.discriminationIndex}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'at_risk' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Early-Warning Intervention Dashboard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Algorithms aggregate attendance records, overdue submissions, and quiz percentiles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="p-3">Student</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Missing Work</th>
                  <th className="p-3">Average Grade</th>
                  <th className="p-3">Recommended Academic Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {atRiskStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{st.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{st.rollNo}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          st.riskLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : st.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {st.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{st.attendancePct}%</td>
                    <td className="p-3 font-bold text-rose-600">{st.missingAssignments}</td>
                    <td className="p-3 font-bold text-slate-800">{st.avgGrade}%</td>
                    <td className="p-3 text-slate-600">{st.intervention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Regulatory & Compliance Audit Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable records of grade changes, enrollment authorizations, and academic events.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Details / Audit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 font-mono text-[11px]">
                    <td className="p-3 text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-sky-700">{log.action}</td>
                    <td className="p-3 text-slate-800">{log.userName}</td>
                    <td className="p-3 uppercase text-slate-400">{log.userRole}</td>
                    <td className="p-3 text-slate-600 font-sans text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
