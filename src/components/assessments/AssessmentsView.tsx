import React, { useState, useEffect } from 'react';
import { useLms } from '../../context/LmsContext';
import { Assessment, QuizQuestion } from '../../types';
import {
  FileQuestion,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  ShieldCheck,
  Check,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
  Award,
  SlidersHorizontal,
} from 'lucide-react';

interface AssessmentsViewProps {
  selectedAssessmentId?: string | null;
  onClearSelection?: () => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  selectedAssessmentId,
  onClearSelection,
}) => {
  const {
    currentUser,
    assessments,
    submissions,
    submitAssessment,
    bulkUploadQuestionsToAssessment,
    logAuditEvent,
  } = useLms();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'endDate' | 'questions'>('endDate');

  // Test Taking Modal
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(
    assessments.find((a) => a.id === selectedAssessmentId) || null
  );
  const [inTestMode, setInTestMode] = useState<boolean>(false);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [testCompletedResult, setTestCompletedResult] = useState<{
    score: number;
    passed: boolean;
    certId?: string;
  } | null>(null);

  // Excel Upload Flow (Section 37 & 38)
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);
  const [excelStep, setExcelStep] = useState<1 | 2 | 3>(1);
  const [selectedTargetAssessmentId, setSelectedTargetAssessmentId] = useState<string>(
    assessments[0]?.id || ''
  );
  const [simulatedParsedQuestions, setSimulatedParsedQuestions] = useState<QuizQuestion[]>([]);
  const [simulatedErrors, setSimulatedErrors] = useState<string[]>([]);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (inTestMode && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [inTestMode, secondsRemaining]);

  // Folders list
  const folders = Array.from(new Set(assessments.map((a) => a.folderPath)));

  // Filtered assessments
  const filteredAssessments = assessments
    .filter((a) => {
      if (selectedFolder !== 'all' && a.folderPath !== selectedFolder) return false;

      const userSubmissions = submissions.filter(
        (s) => s.assessmentId === a.id && s.userId === currentUser.id
      );
      const isPassed = userSubmissions.some((s) => s.passed);

      if (selectedStatus === 'passed' && !isPassed) return false;
      if (selectedStatus === 'pending' && isPassed) return false;
      if (selectedStatus === 'not_attempted' && userSubmissions.length > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.folderPath.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'questions') return b.questions.length - a.questions.length;
      return a.endDate.localeCompare(b.endDate);
    });

  const handleStartExam = (assessment: Assessment) => {
    const userSubmissions = submissions.filter(
      (s) => s.assessmentId === assessment.id && s.userId === currentUser.id
    );
    const isPassed = userSubmissions.some((s) => s.passed);

    if (userSubmissions.length >= assessment.maxAttempts && !isPassed) {
      alert(`Policy (Section 35): You have reached the maximum allowed attempts (${assessment.maxAttempts}) for this assessment.`);
      return;
    }

    setActiveAssessment(assessment);
    setTestAnswers({});
    setActiveQuestionIndex(0);
    setSecondsRemaining(assessment.timeLimitMinutes * 60);
    setTestStartTime(Date.now());
    setInTestMode(true);
    setTestCompletedResult(null);
    logAuditEvent('START_ASSESSMENT', assessment.title, `Timer started: ${assessment.timeLimitMinutes} minutes.`);
  };

  const handleAutoSubmit = () => {
    alert('Exam duration has elapsed. Your answers are being submitted automatically.');
    handleManualSubmit();
  };

  const handleManualSubmit = () => {
    if (!activeAssessment) return;

    const timeSpent = Math.max(1, Math.round((Date.now() - testStartTime) / 1000));
    const submission = submitAssessment(activeAssessment.id, testAnswers, timeSpent);

    setInTestMode(false);
    setTestCompletedResult({
      score: submission.scorePercentage,
      passed: submission.passed,
      certId: submission.certificateId,
    });
  };

  // Excel upload simulation with question option validation
  const handleSimulateExcelUpload = () => {
    setExcelStep(2);
    setSimulatedErrors([
      'Row 3: Option D text is blank.',
      'Row 4: Missing correct option selector column (Must be A, B, C, or D).',
    ]);
    setSimulatedParsedQuestions([
      {
        id: `q-up-${Date.now()}-1`,
        question: 'What is the mandatory authentication requirement before discussing billing data?',
        options: [
          { id: 'opt-1', label: 'A', text: 'Ask for customer full name only' },
          { id: 'opt-2', label: 'B', text: 'Verify 2-factor OTP and registered phone' },
          { id: 'opt-3', label: 'C', text: 'Skip verification if customer sounds urgent' },
          { id: 'opt-4', label: 'D', text: 'Verify customer birth date only' },
        ],
        correctOptionId: 'opt-2',
        marks: 5,
        explanation: 'Mandated by Section 32 data privacy protocols.',
      },
      {
        id: `q-up-${Date.now()}-2`,
        question: 'Under Section 36 SLA, within what timeframe must urgent tickets be acknowledged?',
        options: [
          { id: 'opt-21', label: 'A', text: 'Within 15 minutes' },
          { id: 'opt-22', label: 'B', text: 'Within 4 hours' },
          { id: 'opt-23', label: 'C', text: 'End of business day' },
          { id: 'opt-24', label: 'D', text: 'Within 24 hours' },
        ],
        correctOptionId: 'opt-21',
        marks: 5,
        explanation: 'Critical operational SLAs require 15m acknowledgement.',
      },
    ]);
  };

  const handleFixAndProceed = () => {
    setSimulatedErrors([]);
    setExcelStep(3);
  };

  const handleFinalizeImport = () => {
    if (!selectedTargetAssessmentId) {
      alert('Please select a destination assessment.');
      return;
    }
    bulkUploadQuestionsToAssessment(selectedTargetAssessmentId, simulatedParsedQuestions);
    setShowExcelModal(false);
    setExcelStep(1);
    alert(`Successfully imported ${simulatedParsedQuestions.length} validated questions.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <span>Assessments & Proctored Certifications</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 34 to 38: Time-bound examinations, folder hierarchies, and Excel question import
          </p>
        </div>

        {/* Action button */}
        {(currentUser.role === 'Admin' || currentUser.role === 'Super Admin') && (
          <button
            type="button"
            onClick={() => {
              setShowExcelModal(true);
              setExcelStep(1);
              setSimulatedErrors([]);
            }}
            className="px-3.5 py-2 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-md text-xs font-semibold hover:bg-slate-900 dark:hover:bg-white inline-flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Questions via Excel</span>
          </button>
        )}
      </div>

      {/* Controls Bar: Search, Folder, Status, Sort */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        {/* Search input */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assessments by title, folder, or keywords..."
            className="w-full bg-transparent focus:outline-none text-slate-900 dark:text-slate-100 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Folder Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-500 font-medium">Folder:</span>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
          >
            <option value="all">All Folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="pending">Pending / Retake</option>
            <option value="not_attempted">Not Attempted</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
          >
            <option value="endDate">Window End Date</option>
            <option value="title">Title (A-Z)</option>
            <option value="questions">Question Count</option>
          </select>
        </div>
      </div>

      {/* Assessments Grid Format */}
      {filteredAssessments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 text-xs space-y-2">
          <FileQuestion className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
            No assessments found matching the selected filters.
          </p>
          <p className="text-slate-400">
            Try adjusting your search terms or filter selections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAssessments.map((assessment) => {
            const userSubmissions = submissions.filter(
              (s) => s.assessmentId === assessment.id && s.userId === currentUser.id
            );
            const passedSub = userSubmissions.find((s) => s.passed);
            const isPassed = !!passedSub;
            const attemptsCount = userSubmissions.length;
            const remainingAttempts = Math.max(0, assessment.maxAttempts - attemptsCount);
            const totalMarks = assessment.questions.reduce((acc, q) => acc + q.marks, 0);

            return (
              <div
                key={assessment.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {assessment.folderPath}
                    </span>

                    {/* Pass/Status Indicator */}
                    {isPassed ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passed ({passedSub.scorePercentage}%)
                      </span>
                    ) : attemptsCount > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> {remainingAttempts} Retakes Left
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Not Started
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                      {assessment.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {assessment.description}
                    </p>
                  </div>

                  {/* Operational Metrics Matrix */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-medium">Exam Duration</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {assessment.timeLimitMinutes} minutes
                      </strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-medium">Passing Threshold</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {assessment.passingPercentage}% to pass
                      </strong>
                    </div>

                    <div className="space-y-0.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-750">
                      <span className="text-[10px] text-slate-400 block font-medium">Question Volume</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {assessment.questions.length} questions ({totalMarks} marks)
                      </strong>
                    </div>

                    <div className="space-y-0.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-750">
                      <span className="text-[10px] text-slate-400 block font-medium">Window Closes</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                        {assessment.endDate}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Max: {assessment.maxAttempts} attempts
                  </span>

                  <button
                    type="button"
                    onClick={() => handleStartExam(assessment)}
                    className={`px-4 py-2 font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors shadow-2xs ${
                      isPassed
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isPassed ? 'Review Exam' : attemptsCount > 0 ? 'Retake Exam' : 'Begin Proctored Exam'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Proctored Active Testing Screen */}
      {inTestMode && activeAssessment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Header with Title & Timer */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Proctored Evaluation Session • Section 35
                </span>
                <h3 className="text-base font-bold text-white">
                  {activeAssessment.title}
                </h3>
              </div>

              {/* Countdown Timer */}
              <div
                className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold flex items-center gap-1.5 ${
                  secondsRemaining < 180
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(secondsRemaining / 60)}:
                  {String(secondsRemaining % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Question Selector Quick Bar */}
            <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
              <span className="font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                Jump to Question:
              </span>
              {activeAssessment.questions.map((q, idx) => {
                const isAnswered = testAnswers[q.id] !== undefined;
                const isCurrent = activeQuestionIndex === idx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all border ${
                      isCurrent
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs ring-2 ring-slate-400'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Active Question Content Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {activeAssessment.questions[activeQuestionIndex] && (() => {
                const q = activeAssessment.questions[activeQuestionIndex];
                return (
                  <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-850/40 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        Question {activeQuestionIndex + 1} of {activeAssessment.questions.length}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                        {q.marks} Marks
                      </span>
                    </div>

                    <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed font-semibold">
                      {q.question}
                    </p>

                    {/* Question Options List (All Options Workable!) */}
                    <div className="space-y-2.5 pt-2">
                      {q.options.map((opt) => {
                        const isSelected = testAnswers[q.id] === opt.id;
                        return (
                          <label
                            key={opt.id}
                            onClick={() => setTestAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                            className={`flex items-center gap-3 p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'border-slate-900 dark:border-slate-100 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`exam-q-${q.id}`}
                              checked={isSelected}
                              onChange={() =>
                                setTestAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                              }
                              className="w-4 h-4 text-slate-900 focus:ring-slate-800 shrink-0"
                            />
                            <span className="font-mono font-bold text-sm w-4 shrink-0">
                              {opt.label}.
                            </span>
                            <span className="flex-1 font-medium">{opt.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Bar with Progress and Navigation Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-medium">
                Answered {Object.keys(testAnswers).length} of {activeAssessment.questions.length} questions
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Exit assessment? Unsubmitted progress will be discarded.')) {
                      setInTestMode(false);
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md font-medium"
                >
                  Discard & Exit
                </button>

                {activeQuestionIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Previous Question
                  </button>
                )}

                {activeQuestionIndex < activeAssessment.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                    className="px-4 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    className="px-5 py-1.5 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 shadow-xs"
                  >
                    Finalize & Submit Exam
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Dialog */}
      {testCompletedResult && activeAssessment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700">
              {testCompletedResult.passed ? (
                <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <X className="w-7 h-7 text-rose-600 dark:text-rose-400" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {testCompletedResult.passed ? 'Assessment Successfully Passed' : 'Assessment Benchmark Not Cleared'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{activeAssessment.title}</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm">
              <div>
                Score Achieved: <strong>{testCompletedResult.score}%</strong>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Pass Threshold: {activeAssessment.passingPercentage}%
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {testCompletedResult.passed
                ? activeAssessment.passMessage
                : activeAssessment.failMessage}
            </p>

            {testCompletedResult.certId && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-4 h-4" />
                <span>Certificate Generated: {testCompletedResult.certId}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setTestCompletedResult(null)}
              className="w-full py-2 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white"
            >
              Return to Assessments
            </button>
          </div>
        </div>
      )}

      {/* Excel Upload Simulation Modal - Sections 37 & 38 */}
      {showExcelModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-2xl space-y-4 text-xs my-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Bulk Question Importer via Excel (Sections 37 & 38)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Step {excelStep} of 3: {excelStep === 1 ? 'Select File' : excelStep === 2 ? 'Validate & Fix Errors' : 'Confirm Questions'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target assessment selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Destination Assessment:
              </label>
              <select
                value={selectedTargetAssessmentId}
                onChange={(e) => setSelectedTargetAssessmentId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.folderPath})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 1: File Upload */}
            {excelStep === 1 && (
              <div className="space-y-4">
                <div
                  onClick={handleSimulateExcelUpload}
                  className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center space-y-2 cursor-pointer hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"
                >
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400" />
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Click to load standardized assessment Excel template
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports .xlsx, .xls format with Question, Option A-D, and Correct Option columns
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <strong>Standard Excel Structure:</strong>
                  <div className="font-mono text-[10px]">
                    Column A: Question | Column B: Option A | Column C: Option B | Column D: Option C | Column E: Option D | Column F: Correct Answer (A/B/C/D)
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Error Validation */}
            {excelStep === 2 && (
              <div className="space-y-4">
                {simulatedErrors.length > 0 ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2 text-amber-900 dark:text-amber-100">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>{simulatedErrors.length} Formatting Discrepancies Detected</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] space-y-1">
                      {simulatedErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={handleFixAndProceed}
                      className="mt-2 px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
                    >
                      Auto-Resolve Formatting & Review
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>All questions formatted correctly!</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Question Preview */}
            {excelStep === 3 && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Ready to Import ({simulatedParsedQuestions.length} Questions):
                </div>
                {simulatedParsedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {idx + 1}. {q.question}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {q.options.map((o) => (
                        <div
                          key={o.id}
                          className={`p-1.5 rounded border ${
                            q.correctOptionId === o.id
                              ? 'border-emerald-500 bg-emerald-50/50 font-bold text-emerald-800'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {o.label}. {o.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              >
                Cancel
              </button>
              {excelStep === 3 && (
                <button
                  type="button"
                  onClick={handleFinalizeImport}
                  className="px-4 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white"
                >
                  Confirm & Import Questions
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
