import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  ShieldCheck,
  Lock,
  Key,
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  Filter,
  Shield,
  Activity,
  History,
  Fingerprint,
} from 'lucide-react';
import { Role } from '../../types';
import { RBAC_PERMISSIONS, ROLE_DEFINITIONS, getRolePermissions } from '../../data/rbacConfig';

export const RbacMatrixView: React.FC = () => {
  const { currentUser, allUsers, auditLogs, openAuthModal, switchUser } = useLMS();
  const [selectedRole, setSelectedRole] = useState<Role>(currentUser?.role || 'teacher');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentRolePermissions = getRolePermissions(selectedRole);

  const categories = ['all', 'Course Management', 'Assessment & Grading', 'Community & Engagement', 'Administration & Security', 'Monetization'];

  const filteredPermissions = RBAC_PERMISSIONS.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Access Governance
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                6 Roles • 25 Permissions
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Role-Based Access Control (RBAC) Governance
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Comprehensive entitlement matrix ensuring zero unauthorized privilege escalation across tenants, courses, and grading registries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('mfa')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Fingerprint className="w-4 h-4 text-slate-600" />
              Configure 2FA / TOTP
            </button>
            <button
              onClick={() => openAuthModal('sessions')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Manage Active Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Role Switcher & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(ROLE_DEFINITIONS) as Role[]).map((r) => {
          const isSelected = selectedRole === r;
          const roleDef = ROLE_DEFINITIONS[r];
          const permCount = getRolePermissions(r).length;
          const isCurrentActive = currentUser?.role === r;

          return (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleDef.badgeBg} ${roleDef.badgeColor}`}>
                  {roleDef.title}
                </span>
                {isCurrentActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Your current persona"></span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {permCount} / {RBAC_PERMISSIONS.length}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                Permissions Active
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Matrix Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Entitlements for: <span className="text-blue-600">{ROLE_DEFINITIONS[selectedRole].title}</span>
            </h2>
            <span className="text-xs text-slate-500">
              ({filteredPermissions.filter((p) => p.allowedRoles.includes(selectedRole)).length} of {filteredPermissions.length} granted)
            </span>
          </div>

          {/* Category Pills & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by permission..."
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
            <div className="flex items-center gap-1 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Permission Key</th>
                <th className="p-3">Functional Description</th>
                <th className="p-3 text-center">Entitlement Status</th>
                <th className="p-3 text-center">Allowed Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPermissions.map((perm) => {
                const isGranted = perm.allowedRoles.includes(selectedRole);
                return (
                  <tr
                    key={perm.key}
                    className={`transition-colors ${
                      isGranted ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-500 whitespace-nowrap">
                      {perm.category}
                    </td>
                    <td className="p-3 font-bold font-mono text-slate-900 whitespace-nowrap">
                      {perm.label}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">
                        {perm.key}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{perm.description}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {isGranted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Granted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Denied
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {perm.allowedRoles.map((r) => (
                          <span
                            key={r}
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              r === selectedRole
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Security Audit Log Stream */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Security & Authentication Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-500">Immutable Logging Stream</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
          {auditLogs.slice(0, 8).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[10px]">
                  LOG
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{log.userName || log.userId}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400 shrink-0">
                <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                <div>{log.ipAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
