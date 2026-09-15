import React from 'react';
import {
  Building2,
  Users,
  Server,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  Cpu,
  CheckCircle2,
  HardDrive,
  Activity,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const SuperAdminDashboard: React.FC = () => {
  const { institutions, allUsers, courses, setActiveView } = useLMS();

  return (
    <div className="space-y-6">
      {/* SuperAdmin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Platform Super-Administration</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
              MounTech Network
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global multi-tenant governance across schools, colleges, and training institutes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('institution_admin')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Institutions</span>
          </button>
        </div>
      </div>

      {/* Network High-level Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Affiliated Institutions</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-900">{institutions.length}</p>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">School, College & Institute</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Platform Accounts</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-900">2,840</p>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Active across Nepal</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Courses</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-900">{courses.length}</p>
            <Server className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Cloud Infrastructure</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-emerald-600">Online</p>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Latency 18ms</p>
        </div>
      </div>

      {/* Institutions Directory */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Provisioned Institutional Tenants</h3>
        <div className="divide-y divide-slate-100">
          {institutions.map(inst => (
            <div key={inst.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                  {inst.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{inst.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {inst.educationalLevel.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Domain: <code className="text-slate-700">{inst.domain}</code> • Grading: <span className="font-semibold text-slate-700">{inst.gradingSystem}</span> • Timezone: {inst.timezone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  AI Features: {inst.aiFeaturesEnabled ? 'Active' : 'Disabled'}
                </span>
                <button
                  onClick={() => setActiveView('institution_admin')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
