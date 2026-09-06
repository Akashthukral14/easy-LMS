import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Award,
  HelpCircle,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AgentDashboardProps {
  onSelectUpdate?: (id: string) => void;
  onSelectAssessment?: (id: string) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  onSelectUpdate,
  onSelectAssessment,
}) => {
  const {
    currentUser,
    updates,
    userProgress,
    assessments,
    submissions,
    elearningCourses,
    certificates,
    setActiveTab,
    setSelectedUpdateId,
    setSelectedAssessmentId,
  } = useLms();

  const handleChooseUpdate = (id: string) => {
    if (onSelectUpdate) {
      onSelectUpdate(id);
    } else {
      setSelectedUpdateId(id);
      setActiveTab('updates');
    }
  };

  const handleChooseAssessment = (id: string) => {
    if (onSelectAssessment) {
      onSelectAssessment(id);
    } else {
      setSelectedAssessmentId(id);
      setActiveTab('assessments');
    }
  };

  // Filter scoped updates and track progress
  const totalUpdates = updates.length;
  const pendingUpdates = updates.filter((u) => {
    const key = `${currentUser.id}_${u.id}`;
    const prog = userProgress[key];
    return !prog || prog.state !== 'ACKNOWLEDGED';
  });

  const acknowledgedUpdates = updates.filter((u) => {
    const key = `${currentUser.id}_${u.id}`;
    const prog = userProgress[key];
    return prog && prog.state === 'ACKNOWLEDGED';
  });

  // Quizzes pending
  const pendingQuizzes = updates.filter((u) => {
    if (!u.quizQuestions || u.quizQuestions.length === 0) return false;
    const key = `${currentUser.id}_${u.id}`;
    const prog = userProgress[key];
    return !prog || !prog.quizCompleted;
  });

  // Quiz score average for this agent
  let totalQuizScore = 0;
  let quizAttempts = 0;
  Object.keys(userProgress).forEach((k) => {
    if (k.startsWith(`${currentUser.id}_`)) {
      const p = userProgress[k];
      if (p.quizScore !== undefined) {
        totalQuizScore += p.quizScore;
        quizAttempts += 1;
      }
    }
  });
  const quizAverage = quizAttempts > 0 ? Math.round(totalQuizScore / quizAttempts) : 88;

  // Pending assessments
  const agentSubmissions = submissions.filter((s) => s.userId === currentUser.id);
  const passedAssessmentIds = new Set(
    agentSubmissions.filter((s) => s.passed).map((s) => s.assessmentId)
  );
  const pendingAssessments = assessments.filter((a) => !passedAssessmentIds.has(a.id));

  // Assessment score average
  const assessmentAverage =
    agentSubmissions.length > 0
      ? Math.round(
          agentSubmissions.reduce((acc, curr) => acc + curr.scorePercentage, 0) /
            agentSubmissions.length
        )
      : 84;

  // E-learning progress
  let totalModules = 0;
  let completedModules = 0;
  elearningCourses.forEach((c) => {
    c.modules.forEach((m) => {
      totalModules += 1;
      if (m.completed) completedModules += 1;
    });
  });
  const elearningCompletionRate =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 75;

  // Compliance score calculation
  const updateAckRate = totalUpdates > 0 ? Math.round((acknowledgedUpdates.length / totalUpdates) * 100) : 100;
  const assessmentPassRate = assessments.length > 0 ? Math.round(((assessments.length - pendingAssessments.length) / assessments.length) * 100) : 100;

  const trainingComplianceScore = Math.round(
    updateAckRate * 0.25 +
    quizAverage * 0.25 +
    assessmentPassRate * 0.3 +
    elearningCompletionRate * 0.2
  );

  return (
    <div className="space-y-6">
      {/* Header Banner - Professional Polish Style */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {currentUser.name}
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {currentUser.employeeId}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Assigned Scope: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.scope.clientName}</span> • {currentUser.scope.lobName} • {currentUser.scope.locationName}
          </p>
        </div>

        {/* Training Compliance Score Card */}
        <div className="flex items-center gap-3.5 px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs">
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Training Compliance
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {trainingComplianceScore}%
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Pending Updates */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Updates</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {String(pendingUpdates.length).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requires action today
          </div>
        </div>

        {/* Completed Updates */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completed Updates</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {String(acknowledgedUpdates.length).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total acknowledged
          </div>
        </div>

        {/* Pending Quizzes */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Quizzes</span>
            <HelpCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {String(pendingQuizzes.length).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Attached to updates
          </div>
        </div>

        {/* Quiz Average */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Quiz Average</span>
            <Award className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {quizAverage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Passing threshold: 80%
          </div>
        </div>

        {/* Pending Assessments */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Assessments</span>
            <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {String(pendingAssessments.length).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active test windows
          </div>
        </div>

        {/* Assessment Average */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Assessment Average</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {assessmentAverage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Average test score
          </div>
        </div>

        {/* E-learning Completion */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>E-learning Completion</span>
            <GraduationCap className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {elearningCompletionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {completedModules} of {totalModules} modules
          </div>
        </div>

        {/* Certificates Earned */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Certificates Granted</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {String(certificates.length).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Verified credentials
          </div>
        </div>
      </div>

      {/* Actionable Priorities: Two Column Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Action: Process Updates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Action Required: Pending Process Updates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mandatory document viewing and acknowledgment
              </p>
            </div>
            <button
              onClick={() => setActiveTab('updates')}
              className="text-xs text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingUpdates.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                All assigned updates have been acknowledged. No pending items!
              </p>
            ) : (
              pendingUpdates.slice(0, 3).map((item) => {
                const key = `${currentUser.id}_${item.id}`;
                const prog = userProgress[key];
                const state = prog?.state || 'NOT_STARTED';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleChooseUpdate(item.id)}
                    className="p-3.5 border border-slate-200 dark:border-slate-750 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.id}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          item.priority === 'Urgent'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Due: {item.dueDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500">
                        Status: <strong className="text-slate-800 dark:text-slate-200">{state.replace('_', ' ')}</strong>
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Open Update <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Action: Assessments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Action Required: Pending Assessments
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Required certifications & monthly assessments
              </p>
            </div>
            <button
              onClick={() => setActiveTab('assessments')}
              className="text-xs text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingAssessments.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No outstanding assessments at this time.
              </p>
            ) : (
              pendingAssessments.slice(0, 3).map((asm) => (
                <div
                  key={asm.id}
                  onClick={() => handleChooseAssessment(asm.id)}
                  className="p-3.5 border border-slate-200 dark:border-slate-750 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {asm.folderPath}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Window ends: {asm.endDate}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {asm.title}
                  </h4>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500">
                      {asm.questions.length} questions • {asm.timeLimitMinutes} mins • Pass: {asm.passingPercentage}%
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Start Assessment <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
