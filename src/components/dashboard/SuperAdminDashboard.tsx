import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Building2,
  Layers,
  Users,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Sliders,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    clients,
    allUsers,
    updates,
    submissions,
    setActiveTab,
  } = useLms();

  // Global counts
  const clientCount = clients.length;
  let lobCount = 0;
  clients.forEach((c) => (lobCount += c.lobs.length));
  const userCount = allUsers.length;

  // Comparison metrics per client
  const clientComparisons = clients.map((c) => {
    const clientUsers = allUsers.filter((u) => u.scope.clientId === c.id);
    const clientUpdates = updates.filter((u) => u.clientId === c.id);
    return {
      name: c.name,
      code: c.code,
      users: clientUsers.length,
      lobs: c.lobs.length,
      locations: c.locations.length,
      updatesCount: clientUpdates.length,
      complianceRate: c.code === 'ABC' ? 94 : 88,
      passRate: c.code === 'ABC' ? 96 : 91,
    };
  });

  const failedAssessmentsCount = submissions.filter((s) => !s.passed).length;

  return (
    <div className="space-y-6">
      {/* Super Admin Global Header */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Super Admin Global Headquarters
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-mono shadow-2xs">
              Global Control
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Enterprise multi-client oversight, compliance tracking, and administrative governance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('client_management')}
            className="px-3.5 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white transition-colors inline-flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Clients</span>
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className="px-3.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors inline-flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Global Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Client Count</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {clientCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active enterprise orgs</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>LOB Count</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {lobCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Lines of Business</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>User Count</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {userCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total provisioned</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Training Comp.</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            91%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Enterprise average</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Compliance Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            94%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Global audit rating</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Failed Tests</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {failedAssessmentsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Below target grade</div>
        </div>
      </div>

      {/* Multi-Client Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Multi-Client Comparison & Scope Isolation Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Isolated tenant partitions, active LOBs, headcount, and regulatory compliance
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1"
          >
            <span>Export Comparison Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pr-4">Client Name</th>
                <th className="py-2.5 pr-4">Code</th>
                <th className="py-2.5 pr-4">LOBs</th>
                <th className="py-2.5 pr-4">Locations</th>
                <th className="py-2.5 pr-4">Headcount</th>
                <th className="py-2.5 pr-4">Compliance Score</th>
                <th className="py-2.5 pr-4">Pass Rate</th>
                <th className="py-2.5 text-right">Scope Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {clientComparisons.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                    {item.name}
                  </td>
                  <td className="py-3 pr-4 font-mono font-medium text-slate-500">
                    {item.code}
                  </td>
                  <td className="py-3 pr-4 font-mono text-slate-700 dark:text-slate-300">
                    {item.lobs} active LOBs
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                    {item.locations} sites
                  </td>
                  <td className="py-3 pr-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                    {item.users} agents
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${item.complianceRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {item.complianceRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">
                    {item.passRate}%
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setActiveTab('client_management')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      <span>Configure Scope</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
