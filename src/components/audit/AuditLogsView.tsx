import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  FileCheck2,
  Clock,
  Terminal,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useLms();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExport = () => {
    alert(`Exporting immutable audit log: audit_ledger_${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            System Audit Trail & Compliance Ledger (Section 45)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Immutable tracking: user actions, updates, acknowledgments, assessments, and scope changes
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-neutral-900 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user, action type, target ID, or keyword..."
            className="w-full bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-800 dark:text-neutral-200 font-medium"
        >
          <option value="all">All Action Types</option>
          <option value="ACKNOWLEDGE_UPDATE">ACKNOWLEDGE_UPDATE</option>
          <option value="SUBMIT_ASSESSMENT">SUBMIT_ASSESSMENT</option>
          <option value="VIEW_ATTACHMENT">VIEW_ATTACHMENT</option>
          <option value="PUBLISH_UPDATE">PUBLISH_UPDATE</option>
          <option value="START_IMPERSONATION">START_IMPERSONATION</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-medium">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td className="py-2.5 px-4 text-neutral-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-900 dark:text-neutral-100 font-sans font-semibold">
                    {log.userName}
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-neutral-800 dark:text-neutral-200 font-semibold">
                    {log.target}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-neutral-600 dark:text-neutral-400 max-w-sm truncate">
                    {log.details}
                  </td>
                  <td className="py-2.5 px-4 text-right text-neutral-500">
                    {log.ipAddress}
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
