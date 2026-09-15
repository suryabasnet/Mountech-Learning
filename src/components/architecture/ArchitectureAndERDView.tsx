import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  Database,
  Layers,
  ShieldCheck,
  Server,
  Key,
  Globe,
  Lock,
  ArrowRight,
  Table,
  CheckCircle2,
  Code2,
  Building2,
  Search,
  FileText,
  Boxes,
  Cpu,
} from 'lucide-react';
import { ERD_TABLES, ERDTable, ARCHITECTURE_LAYERS } from '../../data/architectureSpec';

export const ArchitectureAndERDView: React.FC = () => {
  const { currentInstitution, institutions, switchTenant, currentUser } = useLMS();
  const [selectedTableId, setSelectedTableId] = useState<string>('users');
  const [activeTab, setActiveTab] = useState<'architecture' | 'erd' | 'rls_security'>('architecture');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTable: ERDTable | undefined = ERD_TABLES.find((t) => t.id === selectedTableId) || ERD_TABLES[0];

  const filteredTables = ERD_TABLES.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Phase 1 Scaffolding & Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Multi-Tenant RLS Enabled
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              System Architecture & Database ERD
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Production-grade architecture specification for MounTech Learn: NestJS Modular Monolith, PostgreSQL RLS, and hybrid datastore.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Building2 className="w-4 h-4 text-slate-500" />
            <div className="text-xs">
              <div className="text-slate-400 font-semibold">Active Tenant Context</div>
              <div className="font-bold text-slate-900">{currentInstitution?.name || 'Apex University'}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            6-Layer Architecture Overview
          </button>
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'erd'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            PostgreSQL ERD & Schema ({ERD_TABLES.length} Tables)
          </button>
          <button
            onClick={() => setActiveTab('rls_security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'rls_security'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Tenant Isolation & RLS Security
          </button>
        </div>
      </div>

      {/* TAB 1: 6-TIER ARCHITECTURE SPECIFICATION */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARCHITECTURE_LAYERS.map((layer, idx) => (
              <div
                key={layer.layer}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Tier {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{layer.layer}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{layer.details}</p>
                  
                  <div className="mt-4 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase text-slate-400">Key Components</div>
                    <div className="flex flex-wrap gap-1">
                      {layer.components.map((c) => (
                        <span
                          key={c}
                          className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>High Availability</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 99.99% SLA
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Request Flow Diagram */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              End-to-End Request Pipeline & Tenant Isolation Flow
            </h3>
            <p className="text-xs text-slate-500">
              Every request is intercepted by edge middleware, authenticated via JWT/SSO, routed to NestJS handlers, and scoped to the active tenant in PostgreSQL with RLS.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center py-4 text-xs font-mono">
              {/* Edge Node */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <Globe className="w-6 h-6 text-blue-600 mx-auto" />
                <div className="font-bold text-slate-900">Cloudflare Edge</div>
                <div className="text-[10px] text-slate-500">DDoS • SSL • CDN Caching</div>
              </div>

              <div className="text-center text-slate-400 font-bold hidden md:block">
                <ArrowRight className="w-5 h-5 mx-auto" />
                <span className="text-[10px]">WAF Checked</span>
              </div>

              {/* Ingress Gateway */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-center space-y-1">
                <Server className="w-6 h-6 text-blue-600 mx-auto" />
                <div className="font-bold text-blue-900">NestJS API Gateway</div>
                <div className="text-[10px] text-blue-700">JWT • Rate Limiting • RBAC</div>
              </div>

              <div className="text-center text-slate-400 font-bold hidden md:block">
                <ArrowRight className="w-5 h-5 mx-auto" />
                <span className="text-[10px]">RLS Context</span>
              </div>

              {/* Data Layer */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center space-y-1">
                <Database className="w-6 h-6 text-emerald-600 mx-auto" />
                <div className="font-bold text-emerald-900">PostgreSQL + Redis</div>
                <div className="text-[10px] text-emerald-700">Row-Level Security • Zero Leaks</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE DATABASE ERD */}
      {activeTab === 'erd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Table Selector */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-blue-600" />
                Database Tables ({ERD_TABLES.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">schema: public</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tables..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTableId === tbl.id;
                return (
                  <button
                    key={tbl.id}
                    onClick={() => setSelectedTableId(tbl.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {tbl.name}
                      </span>
                      <span className="text-[9px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                        {tbl.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {tbl.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Table Details */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            {selectedTable ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold font-mono text-slate-900">
                        {selectedTable.name}
                      </h2>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {selectedTable.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedTable.description}
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      RLS Isolation
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700">
                      tenant_id = current_setting('app.tenant_id')
                    </div>
                  </div>
                </div>

                {/* Column Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Column Name</th>
                          <th className="p-2.5">SQL Type</th>
                          <th className="p-2.5 text-center">Attributes</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedTable.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {col.name}
                            </td>
                            <td className="p-2.5 font-mono text-blue-600 text-[11px] whitespace-nowrap">
                              {col.type}
                            </td>
                            <td className="p-2.5 text-center whitespace-nowrap">
                              {col.isPrimary && (
                                <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-1.5 py-0.5 rounded mr-1">
                                  PK
                                </span>
                              )}
                              {col.isForeign && col.references && (
                                <span
                                  title={`References ${col.references}`}
                                  className="bg-purple-100 text-purple-900 font-bold text-[10px] px-1.5 py-0.5 rounded cursor-help"
                                >
                                  FK &rarr; {col.references}
                                </span>
                              )}
                              {!col.isNullable && !col.isPrimary && (
                                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">
                                  NOT NULL
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-600 text-xs">
                              {col.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Relationships & Indexes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Foreign Key Relations */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      Foreign Key References
                    </div>
                    {selectedTable.columns.some((c) => c.isForeign) ? (
                      <ul className="text-xs text-slate-600 space-y-1">
                        {selectedTable.columns
                          .filter((c) => c.isForeign && c.references)
                          .map((c) => (
                            <li key={c.name} className="flex items-center gap-1 font-mono text-[11px]">
                              <span className="text-slate-900 font-semibold">{c.name}</span>
                              <span className="text-slate-400">&rarr;</span>
                              <span className="text-purple-700 font-bold">{c.references}</span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-slate-400 italic">No outward foreign keys (root entity).</div>
                    )}
                  </div>

                  {/* Primary Key / Index */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      Indexes & Constraints
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      {selectedTable.indexes.map((idxStr) => (
                        <div key={idxStr}>
                          <code className="text-blue-800 font-mono text-[11px] font-bold">{idxStr}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400">
                Select an entity from the list to view its columns, constraints, and RLS rules.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-TENANT RLS SECURITY MODEL */}
      {activeTab === 'rls_security' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              PostgreSQL Multi-Tenant Row-Level Security (RLS) Specification
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Zero data leakage between tenant universities, corporate academies, and institutes. Enforced directly at the database engine level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
              <div className="text-slate-400 text-[11px]">-- 1. Enable RLS on Tenant-Scoped Tables</div>
              <div className="text-emerald-400">ALTER TABLE users ENABLE ROW LEVEL SECURITY;</div>
              <div className="text-emerald-400">ALTER TABLE courses ENABLE ROW LEVEL SECURITY;</div>
              <div className="text-emerald-400">ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;</div>
              <div className="text-emerald-400">ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;</div>
              
              <div className="text-slate-400 text-[11px] pt-2">-- 2. Create Universal Tenant Isolation Policy</div>
              <div className="text-blue-300">CREATE POLICY tenant_isolation_policy ON courses</div>
              <div className="text-blue-300">  FOR ALL</div>
              <div className="text-blue-300">  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);</div>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-700" />
                Connection Pooling & Session Injection (PgBouncer)
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                When a query arrives from NestJS, the database transaction initiates with a scoped session variable:
              </p>
              <div className="p-2.5 bg-white border border-blue-200 rounded-lg font-mono text-[11px] text-blue-900">
                SET LOCAL app.tenant_id = 'c12e87f3-39da-4d7a-8b1e-01937dfa811a';
              </div>
              <p className="text-xs text-slate-600">
                Any raw SQL or ORM query executed within this transaction is automatically constrained to records matching the tenant ID, even if an application bug omits a WHERE clause.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
