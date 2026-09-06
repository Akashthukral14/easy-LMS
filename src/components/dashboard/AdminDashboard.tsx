import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  Award,
  CheckCircle,
  ShieldCheck,
  XCircle,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectUpdate?: (id: string) => void;
  onSelectAssessment?: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectUpdate,
  onSelectAssessment,
}) => {
  const {
    currentUser,
    users,
    updates,
    userProgress,
    submissions,
    setActiveTab,
    setSelectedUpdateId,
  } = useLms();

  const handleInspect = (id: string) => {
    if (onSelectUpdate) {
      onSelectUpdate(id);
    } else {
      setSelectedUpdateId(id);
      setActiveTab('updates');
    }
  };

  // Metrics strictly scoped to this Admin's scope
  const scopedAgents = users.filter((u) => u.role === 'Agent');
  const totalUsers = scopedAgents.length;
  const activeUsers = scopedAgents.filter((u) => u.status === 'Active').length;

  // Pending and overdue updates
  const todayStr = '2026-09-06';
  let totalPendingAcks = 0;
  let overdueAcks = 0;

  updates.forEach((u) => {
    scopedAgents.forEach((ag) => {
      const key = `${ag.id}_${u.id}`;
      const prog = userProgress[key];
      if (!prog || prog.state !== 'ACKNOWLEDGED') {
        totalPendingAcks += 1;
        if (u.dueDate < todayStr) {
          overdueAcks += 1;
        }
      }
    });
  });

  const totalPossibleAcks = updates.length * Math.max(1, totalUsers);
  const totalCompletedAcks = totalPossibleAcks - totalPendingAcks;
  const completionRate = Math.round((totalCompletedAcks / totalPossibleAcks) * 100);

  // Quiz and Assessment averages
  const failedAssessmentsCount = submissions.filter((s) => !s.passed).length;
  const passedAssessmentsCount = submissions.filter((s) => s.passed).length;
  const assessmentAverage = submissions.length > 0
    ? Math.round(submissions.reduce((a, b) => a + b.scorePercentage, 0) / submissions.length)
    : 89;

  const complianceRate = Math.round(completionRate * 0.4 + assessmentAverage * 0.6);

  return (
    <div className="space-y-6">
      {/* Scope Banner with Professional Polish Header styling */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Operations Admin Console
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
              Admin Scope
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Governing: <strong className="text-slate-800 dark:text-slate-200">{currentUser.scope.clientName}</strong> • {currentUser.scope.lobName} • {currentUser.scope.locationName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('update_management')}
            className="px-3.5 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white transition-colors inline-flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Update</span>
          </button>
          <button
            onClick={() => setActiveTab('impersonation')}
            className="px-3.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors inline-flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Impersonate Agent</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Total Users */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Agents</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {totalUsers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Assigned to this LOB
          </div>
        </div>

        {/* Active Users */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Users</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {activeUsers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            100% active status
          </div>
        </div>

        {/* Pending Updates */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Acks</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {totalPendingAcks}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across active roster
          </div>
        </div>

        {/* Overdue Updates */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Overdue Updates</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {overdueAcks}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requiring supervisor alert
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completion Rate</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {completionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Updates acknowledged
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Compliance Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {complianceRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Overall LOB index
          </div>
        </div>

        {/* Assessment Average */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Assessment Avg</span>
            <Award className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {assessmentAverage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {passedAssessmentsCount} passed tests
          </div>
        </div>

        {/* Failed Assessments */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Failed Assessments</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {failedAssessmentsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Eligible for retake
          </div>
        </div>
      </div>

      {/* Action Table: Active Updates in Admin Scope */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Active Updates Governance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review published updates, versions, and acknowledgements in your assigned scope
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1"
          >
            <span>View Full Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pr-4">Update ID</th>
                <th className="py-2.5 pr-4">Title</th>
                <th className="py-2.5 pr-4">Version</th>
                <th className="py-2.5 pr-4">Due Date</th>
                <th className="py-2.5 pr-4">Quiz Req.</th>
                <th className="py-2.5 pr-4">Status</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {updates.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pr-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                    {u.id}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                    {u.title}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      v{u.version}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 font-mono">
                    {u.dueDate}
                  </td>
                  <td className="py-3 pr-4">
                    {u.requiresQuiz ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Quiz Required
                      </span>
                    ) : (
                      <span className="text-slate-400">Direct Ack</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleInspect(u.id)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Inspect
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
