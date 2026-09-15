import React, { useState, useEffect } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  Laptop,
  Globe,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  LogIn,
  UserPlus,
  LogOut,
  RefreshCw,
  X,
  ChevronRight,
  Shield,
  Layers,
  Database,
  Fingerprint,
} from 'lucide-react';
import { Role, SSOProvider } from '../../types';
import { RBAC_PERMISSIONS, ROLE_DEFINITIONS, getRolePermissions } from '../../data/rbacConfig';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalTab,
    setAuthModalTab,
    currentUser,
    currentInstitution,
    institutions,
    allUsers,
    permissions,
    sessions,
    hasUserPermission,
    login,
    registerUser,
    setupMfa,
    verifyMfa,
    disableMfa,
    loginWithSso,
    revokeSession,
    switchTenant,
    switchUser,
  } = useLMS();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfaStep, setRequiresMfaStep] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('student');
  const [regInstitutionId, setRegInstitutionId] = useState('inst-1');
  const [regDepartment, setRegDepartment] = useState('Computer Science');
  const [regSuccess, setRegSuccess] = useState(false);

  // MFA setup state
  const [mfaData, setMfaData] = useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [mfaVerifyInput, setMfaVerifyInput] = useState('');
  const [mfaStatusMsg, setMfaStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // RBAC filter
  const [selectedRbacRole, setSelectedRbacRole] = useState<Role>(currentUser?.role || 'teacher');
  const [rbacCategoryFilter, setRbacCategoryFilter] = useState<string>('all');

  // SSO tenant selection
  const [ssoTenantId, setSsoTenantId] = useState<string>(currentInstitution?.id || 'inst-1');
  const [ssoStatus, setSsoStatus] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setSelectedRbacRole(currentUser.role);
    }
  }, [currentUser]);

  if (!showAuthModal) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const result = await login(loginEmail, loginPassword, mfaCode || undefined);
    setLoginLoading(false);

    if (result.requiresMfa) {
      setRequiresMfaStep(true);
      setLoginError(null);
    } else if (result.success) {
      setRequiresMfaStep(false);
      setMfaCode('');
      setShowAuthModal(false);
    } else {
      setLoginError(result.error || 'Authentication failed. Please check credentials.');
    }
  };

  const handleQuickLoginPreset = async (userPreset: typeof allUsers[0]) => {
    setLoginEmail(userPreset.email);
    setLoginError(null);
    setRequiresMfaStep(false);
    setMfaCode('');
    await switchUser(userPreset.id);
    setShowAuthModal(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;

    const ok = await registerUser({
      name: regName,
      email: regEmail,
      role: regRole,
      institutionId: regInstitutionId,
      department: regDepartment,
      password: regPassword || 'MounTech2026!',
    });

    if (ok) {
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setShowAuthModal(false);
      }, 1200);
    }
  };

  const handleInitiateMfaSetup = async () => {
    setMfaStatusMsg(null);
    const data = await setupMfa();
    if (data) {
      setMfaData(data);
    }
  };

  const handleConfirmMfa = async () => {
    if (!mfaVerifyInput) return;
    const ok = await verifyMfa(mfaVerifyInput);
    if (ok) {
      setMfaStatusMsg({ type: 'success', text: 'Two-Factor Authentication (TOTP) successfully activated!' });
      setMfaData(null);
      setMfaVerifyInput('');
    } else {
      setMfaStatusMsg({ type: 'error', text: 'Invalid verification code. Please enter 123456 or the code from your app.' });
    }
  };

  const handleDisableMfa = async () => {
    const ok = await disableMfa();
    if (ok) {
      setMfaStatusMsg({ type: 'success', text: 'Two-Factor Authentication has been disabled.' });
    }
  };

  const handleSsoClick = async (provider: SSOProvider) => {
    setSsoStatus(`Initiating handshake with ${provider.toUpperCase()} Identity Provider...`);
    const ok = await loginWithSso(provider, ssoTenantId);
    if (ok) {
      setSsoStatus(`Authenticated successfully via ${provider}!`);
      setTimeout(() => {
        setSsoStatus(null);
        setShowAuthModal(false);
      }, 1000);
    } else {
      setSsoStatus('SSO authentication failed. Please check provider settings.');
    }
  };

  const filteredPermissions = RBAC_PERMISSIONS.filter(p => {
    if (rbacCategoryFilter === 'all') return true;
    return p.category.toLowerCase().replace(/\s+/g, '_') === rbacCategoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">MounTech Identity & Security Engine</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  Multi-Tenant v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500">
                JWT Sessions • TOTP RFC 6238 MFA • SSO Federation • 6-Tier Hierarchical RBAC
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 px-6 gap-2 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setAuthModalTab('login')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              authModalTab === 'login'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In & Profiles
          </button>
          <button
            onClick={() => setAuthModalTab('register')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              authModalTab === 'register'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
          <button
            onClick={() => setAuthModalTab('mfa')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              authModalTab === 'mfa'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            2FA / TOTP Security
            {currentUser?.mfaEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
          <button
            onClick={() => setAuthModalTab('sso')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              authModalTab === 'sso'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            Enterprise SSO
          </button>
          <button
            onClick={() => setAuthModalTab('sessions')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              authModalTab === 'sessions'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Active Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setAuthModalTab('rbac')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              authModalTab === 'rbac'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            RBAC Matrix (25)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: SIGN IN & PRESETS */}
          {authModalTab === 'login' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Sign In to Your Account</h3>
                  <p className="text-xs text-slate-500">
                    Access courses, grading workspaces, or institutional administration.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institutional Email
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. anil.adhikari@mountech.edu.np"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset link dispatched to verified institutional email.')}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  {requiresMfaStep && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                        <Key className="w-4 h-4 text-amber-600" />
                        <span>Two-Factor Authentication Required</span>
                      </div>
                      <p className="text-xs text-amber-700">
                        Enter the 6-digit verification code from your Authenticator app (e.g., Google Authenticator) or a backup code. Demo code: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">123456</code>.
                      </p>
                      <input
                        type="text"
                        maxLength={9}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        placeholder="123456 or XXXX-XXXX"
                        autoFocus
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-center font-mono text-base tracking-widest font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    {requiresMfaStep ? 'Verify 2FA & Sign In' : 'Sign In'}
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-200 text-center">
                  <span className="text-xs text-slate-500">Need an account? </span>
                  <button
                    onClick={() => setAuthModalTab('register')}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Register new profile
                  </button>
                </div>
              </div>

              {/* Quick-Switch Demo Personas (All 6 Roles) */}
              <div className="md:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Instant Demo Switch (6 Roles)
                  </h4>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                    1-Click Auth
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Test the complete multi-tenant LMS from any perspective. Selecting a role updates the live RBAC permissions and user session instantly:
                </p>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {allUsers.map((u) => {
                    const isCurrent = currentUser?.id === u.id;
                    const roleDef = ROLE_DEFINITIONS[u.role];
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleQuickLoginPreset(u)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isCurrent
                            ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {u.name}
                              </span>
                              {u.mfaEnabled && (
                                <span title="MFA Enabled">
                                  <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span className={`px-1.5 py-0.2 rounded font-medium ${roleDef.badgeBg} ${roleDef.badgeColor}`}>
                                {roleDef.title}
                              </span>
                              <span className="truncate">{u.email}</span>
                            </div>
                          </div>
                        </div>
                        {isCurrent ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-semibold shrink-0">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs text-blue-600 font-medium shrink-0 flex items-center gap-0.5">
                            Switch <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'register' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Create New Institutional Account</h3>
                <p className="text-xs text-slate-500">
                  Register a learner, educator, teaching assistant, or department administrator.
                </p>
              </div>

              {regSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Account registered successfully! Logging you into the platform...</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Maya Shrestha"
                      required
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. maya@student.mountech.edu.np"
                      required
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as Role)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">Student (Learner)</option>
                      <option value="teacher">Teacher (Instructor)</option>
                      <option value="ta">Teaching Assistant (TA)</option>
                      <option value="institution_admin">Institution Admin (Dean/Registrar)</option>
                      <option value="parent">Parent / Guardian Observer</option>
                      <option value="super_admin">Platform Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Organization</label>
                    <select
                      value={regInstitutionId}
                      onChange={(e) => setRegInstitutionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Division</label>
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    New accounts automatically inherit multi-tenant PostgreSQL Row-Level Security (RLS) isolation and standard role permission entitlements.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-xs transition-colors"
                >
                  Register Account
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MFA / TOTP */}
          {authModalTab === 'mfa' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Multi-Factor Authentication (TOTP)</h3>
                  <p className="text-xs text-slate-500">
                    Industry-standard RFC 6238 time-based one-time password security for {currentUser?.name}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                    currentUser?.mfaEnabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentUser?.mfaEnabled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        MFA Active
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        MFA Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>

              {mfaStatusMsg && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  mfaStatusMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {mfaStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{mfaStatusMsg.text}</span>
                </div>
              )}

              {currentUser?.mfaEnabled ? (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Two-Factor Authentication is Enabled</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Your account requires a 6-digit TOTP code generated by Google Authenticator, Authy, or 1Password on every sign-in.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Need to reset or disable authenticator?</span>
                    <button
                      onClick={handleDisableMfa}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Disable 2FA
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {!mfaData ? (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                      <Fingerprint className="w-12 h-12 text-blue-600 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-900">Add an Extra Layer of Security</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Protect your academic credentials, grades, and intellectual property by binding an authenticator app.
                      </p>
                      <button
                        onClick={handleInitiateMfaSetup}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                      >
                        Set Up Authenticator App
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-slate-200">
                          <img
                            src={mfaData.qrCodeUrl}
                            alt="MFA QR Code"
                            className="w-44 h-44 rounded-lg"
                          />
                          <span className="text-[11px] text-slate-400 mt-1">Scan with Google Authenticator</span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Manual Setup Secret Key
                            </label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded font-mono text-xs font-bold text-slate-900 select-all truncate">
                                {mfaData.secret}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(mfaData.secret);
                                  setCopiedSecret(true);
                                  setTimeout(() => setCopiedSecret(false), 1500);
                                }}
                                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-600 text-xs"
                              >
                                {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Enter 6-Digit Code to Confirm
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={mfaVerifyInput}
                              onChange={(e) => setMfaVerifyInput(e.target.value)}
                              placeholder="e.g. 123456"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-center font-mono text-base tracking-widest font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-slate-400">Demo bypass code: 123456</span>
                          </div>

                          <button
                            onClick={handleConfirmMfa}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Verify & Activate MFA
                          </button>
                        </div>
                      </div>

                      {/* Backup Codes */}
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Key className="w-3.5 h-3.5 text-slate-500" />
                            Emergency Backup Codes (One-Time Use)
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(mfaData.backupCodes.join('\n'));
                              setCopiedBackup(true);
                              setTimeout(() => setCopiedBackup(false), 1500);
                            }}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {copiedBackup ? 'Copied to clipboard' : 'Copy all codes'}
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {mfaData.backupCodes.map((code, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-center font-mono text-[11px] text-slate-700 select-all"
                            >
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ENTERPRISE SSO */}
          {authModalTab === 'sso' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Enterprise Single Sign-On (SSO)</h3>
                <p className="text-xs text-slate-500">
                  Federated authentication via SAML 2.0 and OpenID Connect (OIDC) for universities and enterprises.
                </p>
              </div>

              {ssoStatus && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{ssoStatus}</span>
                </div>
              )}

              {/* Tenant context selector for SSO */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Tenant Institutional Domain
                </label>
                <select
                  value={ssoTenantId}
                  onChange={(e) => setSsoTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} — @{inst.code.toLowerCase()}.edu.np (Tenant: {inst.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Users authenticated through SSO are automatically mapped to their tenant organization via SAML attribute assertion.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Google Workspace */}
                <button
                  onClick={() => handleSsoClick('google')}
                  className="p-4 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl flex flex-col items-center text-center gap-2.5 transition-all shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg border border-red-100 group-hover:scale-105 transition-transform">
                    G
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Google Workspace</span>
                    <span className="block text-[11px] text-slate-500">OIDC / OAuth 2.0</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium">Authenticate &rarr;</span>
                </button>

                {/* Microsoft Entra */}
                <button
                  onClick={() => handleSsoClick('microsoft')}
                  className="p-4 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl flex flex-col items-center text-center gap-2.5 transition-all shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 group-hover:scale-105 transition-transform">
                    M
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Microsoft Entra ID</span>
                    <span className="block text-[11px] text-slate-500">Azure Active Directory</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium">Authenticate &rarr;</span>
                </button>

                {/* Okta SAML */}
                <button
                  onClick={() => handleSsoClick('saml_okta')}
                  className="p-4 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl flex flex-col items-center text-center gap-2.5 transition-all shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 group-hover:scale-105 transition-transform">
                    O
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Okta / SAML 2.0</span>
                    <span className="block text-[11px] text-slate-500">Enterprise IdP Federation</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium">Authenticate &rarr;</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-slate-500" />
                  SAML 2.0 Assertion Consumer Service (ACS) Metadata
                </div>
                <div className="font-mono text-[11px] text-slate-500 truncate">
                  Entity ID: https://auth.mountechsolutions.com/saml/metadata
                </div>
                <div className="font-mono text-[11px] text-slate-500 truncate">
                  ACS URL: https://auth.mountechsolutions.com/saml/sso/callback
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVE SESSIONS */}
          {authModalTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Active Login Sessions</h3>
                  <p className="text-xs text-slate-500">
                    Review and revoke active devices logged into your account across desktop and mobile.
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {sessions.length} Active Sessions
                </span>
              </div>

              <div className="space-y-2.5">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      sess.isCurrent
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        {sess.deviceType === 'mobile' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {sess.userName} ({sess.role})
                          </span>
                          {sess.isCurrent && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>IP: {sess.ipAddress}</span>
                          <span>•</span>
                          <span>{sess.location || 'Nepal'}</span>
                          <span>•</span>
                          <span>Expires: {new Date(sess.expiresAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {sess.isCurrent ? (
                        <span className="text-xs text-slate-400 font-medium">This device</span>
                      ) : (
                        <button
                          onClick={() => revokeSession(sess.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RBAC PERMISSION MATRIX */}
          {authModalTab === 'rbac' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
                  <p className="text-xs text-slate-500">
                    25 fine-grained permissions enforced across 6 system roles.
                  </p>
                </div>

                {/* Role Switcher in RBAC viewer */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {(Object.keys(ROLE_DEFINITIONS) as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRbacRole(r)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        selectedRbacRole === r
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {ROLE_DEFINITIONS[r].title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role description banner */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded mr-2 ${ROLE_DEFINITIONS[selectedRbacRole].badgeBg} ${ROLE_DEFINITIONS[selectedRbacRole].badgeColor}`}>
                    {ROLE_DEFINITIONS[selectedRbacRole].title}
                  </span>
                  <span className="text-xs text-slate-600">
                    {ROLE_DEFINITIONS[selectedRbacRole].description}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {getRolePermissions(selectedRbacRole).length} / {RBAC_PERMISSIONS.length} Permissions Active
                </span>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                {['all', 'course_management', 'assessment_&_grading', 'community_&_engagement', 'administration_&_security', 'monetization'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRbacCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                      rbacCategoryFilter === cat
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Matrix Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-[360px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Permission Name</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredPermissions.map((perm) => {
                        const isGranted = perm.allowedRoles.includes(selectedRbacRole);
                        const isCurrentUsersRole = currentUser?.role === selectedRbacRole;
                        return (
                          <tr
                            key={perm.key}
                            className={`transition-colors ${
                              isGranted ? 'bg-emerald-50/30' : 'bg-white'
                            }`}
                          >
                            <td className="p-2.5 font-medium text-slate-500 whitespace-nowrap">
                              {perm.category}
                            </td>
                            <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">
                              {perm.label}
                              <span className="block font-mono text-[10px] text-slate-400 font-normal">
                                {perm.key}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">{perm.description}</td>
                            <td className="p-2.5 text-center whitespace-nowrap">
                              {isGranted ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Granted
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Denied
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Logged in as:</span>
            <span className="font-bold text-slate-800">{currentUser?.name}</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              {currentUser?.role}
            </span>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
