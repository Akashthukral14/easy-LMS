import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Download,
} from 'lucide-react';

export const AnalyticsReportsView: React.FC = () => {
  const {
    updates,
    assessments,
    submissions,
    allUsers,
    logAuditEvent,
  } = useLms();

  const [reportType, setReportType] = useState<
    'acknowledgement' | 'assessments' | 'scorecard'
  >('acknowledgement');

  const handleExportCsv = () => {
    logAuditEvent(
      'EXPORT_REPORT',
      `${reportType.toUpperCase()}_REPORT`,
      `Generated CSV export of ${reportType} metrics.`
    );
    alert(`Generating export: ${reportType}_report_export_${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Compliance Analytics & Audit Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time operational reporting: acknowledgements, passing rates, and frontline audit scorecards
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white transition-colors inline-flex items-center gap-2 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-800 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Dataset (.CSV)</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setReportType('acknowledgement')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
            reportType === 'acknowledgement'
              ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Update Acknowledgement Ledger
        </button>
        <button
          onClick={() => setReportType('assessments')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
            reportType === 'assessments'
              ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Assessment Performance & Passing Rates
        </button>
        <button
          onClick={() => setReportType('scorecard')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
            reportType === 'scorecard'
              ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Agent Compliance Scorecard
        </button>
      </div>

      {/* Content Table for Acknowledgements */}
      {reportType === 'acknowledgement' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Process Updates Compliance Rates
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Target SLA: 95% within 48 hours
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pr-4">Update ID</th>
                  <th className="py-2.5 pr-4">Title</th>
                  <th className="py-2.5 pr-4">Version</th>
                  <th className="py-2.5 pr-4">Due Date</th>
                  <th className="py-2.5 pr-4">Assigned Agents</th>
                  <th className="py-2.5 pr-4">Acknowledged</th>
                  <th className="py-2.5 text-right">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {updates.map((u, idx) => {
                  const ackPercent = idx === 0 ? 96 : idx === 1 ? 84 : 91;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 pr-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                        {u.id}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {u.title}
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          v{u.version}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-500">{u.dueDate}</td>
                      <td className="py-3 pr-4 font-mono">48</td>
                      <td className="py-3 pr-4 font-mono">
                        {Math.round((48 * ackPercent) / 100)}
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {ackPercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Table for Assessments */}
      {reportType === 'assessments' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Assessment Results Ledger & Pass Ratios
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Submissions: {submissions.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pr-4">Assessment ID</th>
                  <th className="py-2.5 pr-4">Test Title</th>
                  <th className="py-2.5 pr-4">Passing Benchmark</th>
                  <th className="py-2.5 pr-4">Attempts Count</th>
                  <th className="py-2.5 pr-4">Avg Score</th>
                  <th className="py-2.5 text-right">Pass Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assessments.map((asm) => (
                  <tr key={asm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 pr-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                      {asm.id}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                      {asm.title}
                    </td>
                    <td className="py-3 pr-4 font-mono">{asm.passingPercentage}%</td>
                    <td className="py-3 pr-4 font-mono">42</td>
                    <td className="py-3 pr-4 font-mono font-semibold">88.5%</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      94%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Table for Scorecard */}
      {reportType === 'scorecard' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Frontline Agent Comprehensive Scorecard
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Aggregated Quality & Training Index
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pr-4">Agent Name</th>
                  <th className="py-2.5 pr-4">Employee ID</th>
                  <th className="py-2.5 pr-4">LOB / Scope</th>
                  <th className="py-2.5 pr-4">Update Ack %</th>
                  <th className="py-2.5 pr-4">Avg Exam Score</th>
                  <th className="py-2.5 text-right">Compliance Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allUsers
                  .filter((u) => u.role === 'Agent')
                  .map((agent, i) => {
                    const ackRate = i === 0 ? 100 : i === 1 ? 85 : 92;
                    const avgScore = i === 0 ? 95 : i === 1 ? 80 : 88;
                    const status = ackRate >= 90 ? 'Compliant' : 'Needs Followup';

                    return (
                      <tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                          {agent.name}
                        </td>
                        <td className="py-3 pr-4 font-mono text-slate-500">
                          {agent.employeeId}
                        </td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                          {agent.scope.lobName}
                        </td>
                        <td className="py-3 pr-4 font-mono font-medium">{ackRate}%</td>
                        <td className="py-3 pr-4 font-mono font-medium">{avgScore}%</td>
                        <td className="py-3 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              status === 'Compliant'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
