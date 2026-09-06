import React, { useState, useEffect } from 'react';
import { useLms } from '../../context/LmsContext';
import { Attachment } from '../../types';
import {
  FileText,
  AlertCircle,
  Eye,
  Check,
  X,
  FileCheck2,
  ChevronRight,
  Filter,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Search,
  ArrowUpDown,
  Clock,
} from 'lucide-react';

interface UpdatesViewProps {
  selectedUpdateId?: string | null;
  onClearSelection?: () => void;
}

export const UpdatesView: React.FC<UpdatesViewProps> = ({
  selectedUpdateId: propSelectedUpdateId,
  onClearSelection,
}) => {
  const {
    currentUser,
    updates,
    userProgress,
    viewUpdate,
    viewAttachment,
    submitUpdateQuiz,
    acknowledgeUpdate,
    isImpersonating,
    selectedUpdateId: ctxSelectedUpdateId,
    setSelectedUpdateId,
  } = useLms();

  const effectiveSelectedId = propSelectedUpdateId || ctxSelectedUpdateId;

  const [activeModalUpdateId, setActiveModalUpdateId] = useState<string | null>(
    effectiveSelectedId || null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'id' | 'title' | 'dueDate' | 'priority' | 'status'>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // PDF & interactive document viewer state
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfZoom, setPdfZoom] = useState<number>(100);

  // Quiz interactive state
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number } | null>(null);

  useEffect(() => {
    if (effectiveSelectedId) {
      setActiveModalUpdateId(effectiveSelectedId);
      viewUpdate(effectiveSelectedId);
    }
  }, [effectiveSelectedId]);

  const activeUpdate = updates.find((u) => u.id === activeModalUpdateId);
  const activeProgress = activeModalUpdateId
    ? userProgress[`${currentUser.id}_${activeModalUpdateId}`]
    : null;

  // Counts
  const pendingCount = updates.filter(
    (u) => userProgress[`${currentUser.id}_${u.id}`]?.state !== 'ACKNOWLEDGED'
  ).length;
  const completedCount = updates.length - pendingCount;

  // Filter updates
  const filteredUpdates = updates.filter((u) => {
    if (selectedCategory !== 'all' && u.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && u.priority !== selectedPriority) return false;

    const prog = userProgress[`${currentUser.id}_${u.id}`];
    const isAck = prog?.state === 'ACKNOWLEDGED';

    if (activeTabFilter === 'pending' && isAck) return false;
    if (activeTabFilter === 'completed' && !isAck) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        u.id.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q) ||
        u.category.toLowerCase().includes(q) ||
        u.priority.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const priorityWeight: Record<string, number> = { Urgent: 3, High: 2, Medium: 1, Low: 0 };

  const sortedUpdates = [...filteredUpdates].sort((a, b) => {
    let comp = 0;
    if (sortField === 'id') {
      comp = a.id.localeCompare(b.id);
    } else if (sortField === 'title') {
      comp = a.title.localeCompare(b.title);
    } else if (sortField === 'dueDate') {
      comp = a.dueDate.localeCompare(b.dueDate);
    } else if (sortField === 'priority') {
      comp = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    } else if (sortField === 'status') {
      const aAck = userProgress[`${currentUser.id}_${a.id}`]?.state === 'ACKNOWLEDGED' ? 1 : 0;
      const bAck = userProgress[`${currentUser.id}_${b.id}`]?.state === 'ACKNOWLEDGED' ? 1 : 0;
      comp = aAck - bAck;
    }
    return sortAsc ? comp : -comp;
  });

  const toggleSort = (field: 'id' | 'title' | 'dueDate' | 'priority' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenUpdate = (update: typeof updates[0]) => {
    setActiveModalUpdateId(update.id);
    setSelectedUpdateId(update.id);
    viewUpdate(update.id);
    setQuizStarted(false);
    setQuizAnswers({});
    setQuizResult(null);
    setActiveAttachment(null);
  };

  const handleCloseModal = () => {
    setActiveModalUpdateId(null);
    setSelectedUpdateId(null);
    if (onClearSelection) onClearSelection();
    setActiveAttachment(null);
    setQuizStarted(false);
  };

  const handleOpenAttachment = (att: Attachment) => {
    if (!activeUpdate) return;
    setActiveAttachment(att);
    setPdfPage(1);
    viewAttachment(activeUpdate.id, att.id);
  };

  const handleQuizAnswerSelect = (questionId: string, optionId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleQuizSubmit = () => {
    if (!activeUpdate || !activeUpdate.quiz) return;
    const res = submitUpdateQuiz(activeUpdate.id, quizAnswers);
    setQuizResult(res);
  };

  const handleAcknowledgeClick = () => {
    if (!activeUpdate) return;
    if (activeUpdate.requiresQuiz && activeUpdate.quiz) {
      const hasPassed = activeProgress?.quizAttempts?.some((a) => a.passed);
      if (!hasPassed) {
        setQuizStarted(true);
        return;
      }
    }
    const success = acknowledgeUpdate(activeUpdate.id);
    if (success) {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls - Professional Polish Theme */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Process Updates & Compliance Acknowledgments
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mandatory operational workflows, SOP changes, and regulatory version acknowledgements
            </p>
          </div>

          {/* Quick tab filter */}
          <div className="flex items-center rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                activeTabFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({updates.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('pending')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                activeTabFilter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTabFilter('completed')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                activeTabFilter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search updates by ID, title, or category..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 text-xs shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-medium">Filter:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 shadow-xs"
            >
              <option value="all">All Categories</option>
              <option value="Process Change">Process Change</option>
              <option value="Escalation">Escalation</option>
              <option value="Compliance">Compliance</option>
              <option value="Quality">Quality</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 shadow-xs"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>

            {(searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all' || activeTabFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                  setActiveTabFilter('all');
                }}
                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Updates Table Format - Clean & No Excessive Text */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <tr className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => toggleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Update Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Category</th>
                <th
                  onClick={() => toggleSort('priority')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Version</th>
                <th
                  onClick={() => toggleSort('dueDate')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Requirements</th>
                <th
                  onClick={() => toggleSort('status')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedUpdates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        No updates match your criteria
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Try adjusting your search keywords, category, or priority filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSelectedPriority('all');
                          setActiveTabFilter('all');
                        }}
                        className="mt-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold cursor-pointer"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedUpdates.map((u) => {
                  const key = `${currentUser.id}_${u.id}`;
                  const prog = userProgress[key];
                  const state = prog?.state || 'NOT_STARTED';
                  const isCompleted = state === 'ACKNOWLEDGED';
                  const isOverdue = !isCompleted && u.dueDate < '2026-09-06';

                  return (
                    <tr
                      key={u.id}
                      id={`update-row-${u.id}`}
                      onClick={() => handleOpenUpdate(u)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group ${
                        isCompleted ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-850/30'
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {u.id}
                      </td>

                      {/* Title - Clean, concise, no excessive text */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm md:max-w-md">
                        <span
                          className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 block"
                          title={u.title}
                        >
                          {u.title}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                          {u.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.priority === 'Urgent'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : u.priority === 'High'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {u.priority}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        v{u.version}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-400">
                          <span>{u.dueDate}</span>
                          {isOverdue && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500 text-white uppercase">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Requirements */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {u.requiresQuiz ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400">
                            <HelpCircle className="w-3 h-3 text-blue-500" />
                            PDF + Quiz
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <FileText className="w-3 h-3 text-slate-400" />
                            PDF SOP
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Acknowledged
                          </span>
                        ) : state === 'IN_PROGRESS' ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            In Progress
                          </span>
                        ) : state === 'VIEWED' ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-500" />
                            Viewed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenUpdate(u);
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer ${
                            isCompleted
                              ? 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              : 'bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                          }`}
                        >
                          <span>{isCompleted ? 'View Details' : 'Review & Sign'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{sortedUpdates.length}</strong> of <strong>{updates.length}</strong> process updates
          </span>
          <span className="font-medium">
            {pendingCount === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">All updates acknowledged</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{pendingCount} pending compliance</span>
            )}
          </span>
        </div>
      </div>

      {/* Full Update Review Modal / State Machine Flow */}
      {activeUpdate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeUpdate.title}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden my-6">
            {/* Header */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                    {activeUpdate.id}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
                    v{activeUpdate.version}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    activeUpdate.priority === 'Urgent' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {activeUpdate.priority}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {activeUpdate.title}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Overview & Impact
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeUpdate.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {activeUpdate.category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Author / Role</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {activeUpdate.authorName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Effective Date</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {activeUpdate.effectiveDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Due Date</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {activeUpdate.dueDate}
                  </span>
                </div>
              </div>

              {/* Mandatory Attachments Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Mandatory Attached PDF & Documents ({activeUpdate.attachments.length})</span>
                  {activeProgress?.attachmentViewedAt && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Attachment verified on {activeProgress.attachmentViewedAt}
                    </span>
                  )}
                </h4>

                <div className="space-y-2">
                  {activeUpdate.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3.5 border border-slate-200 dark:border-slate-750 rounded-lg flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs">
                          {att.fileType}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {att.name}
                          </p>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {att.size} {att.requiredToView && '• Required to read before acknowledgment'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenAttachment(att)}
                        className="px-3.5 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Attached PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embedded PDF Viewer Component */}
              {activeAttachment && (
                <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
                  {/* PDF Toolbar */}
                  <div className="p-2.5 bg-slate-800 text-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold">{activeAttachment.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({activeAttachment.size})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Pagination Controls */}
                      <div className="flex items-center gap-1 bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                        <button
                          onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                          disabled={pdfPage <= 1}
                          className="px-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                        >
                          ‹
                        </button>
                        <span>Page {pdfPage} of 3</span>
                        <button
                          onClick={() => setPdfPage((p) => Math.min(3, p + 1))}
                          disabled={pdfPage >= 3}
                          className="px-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                        >
                          ›
                        </button>
                      </div>

                      {/* Zoom Controls */}
                      <div className="hidden sm:flex items-center gap-1 bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                        <button
                          onClick={() => setPdfZoom((z) => Math.max(75, z - 10))}
                          className="p-0.5 hover:text-white"
                          title="Zoom out"
                        >
                          <ZoomOut className="w-3 h-3" />
                        </button>
                        <span>{pdfZoom}%</span>
                        <button
                          onClick={() => setPdfZoom((z) => Math.min(130, z + 10))}
                          className="p-0.5 hover:text-white"
                          title="Zoom in"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => setActiveAttachment(null)}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-semibold"
                      >
                        Close Reader
                      </button>
                    </div>
                  </div>

                  {/* Simulated PDF Paper Page */}
                  <div className="p-6 bg-slate-200 dark:bg-slate-950 flex justify-center">
                    <div
                      className="w-full max-w-2xl bg-white text-slate-900 p-8 rounded shadow-lg border border-slate-300 font-sans text-xs space-y-4"
                      style={{ zoom: `${pdfZoom}%` }}
                    >
                      {/* Document Header */}
                      <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                        <div>
                          <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                            STANDARD OPERATING PROCEDURE • DOC-SOP-{activeUpdate.version}
                          </div>
                          <h1 className="text-base font-black text-slate-950 mt-1 uppercase tracking-tight">
                            {activeUpdate.title}
                          </h1>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Client Organization: <strong>{currentUser.scope.clientName}</strong> | LOB: <strong>{currentUser.scope.lobName}</strong>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[10px] text-slate-500">
                          <div>EFFECTIVE: {activeUpdate.effectiveDate}</div>
                          <div>REVISION: {activeUpdate.version}</div>
                          <div className="px-1.5 py-0.5 mt-1 bg-emerald-100 text-emerald-800 font-bold rounded inline-block text-[9px]">
                            OFFICIALLY RATIFIED
                          </div>
                        </div>
                      </div>

                      {/* Content per Page */}
                      {pdfPage === 1 && (
                        <div className="space-y-3">
                          <h2 className="font-bold text-slate-950 text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
                            1. Purpose & Core Directive
                          </h2>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            This Standard Operating Procedure establishes the updated operational mandate governing customer transactions, refund validations, and security workflows across all frontline tiers. Frontline staff must verify customer identities using two-factor authentication before initiating any account adjustments.
                          </p>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                            <h3 className="font-bold text-slate-900 text-[11px] mb-1">
                              Key Discretionary Thresholds
                            </h3>
                            <p className="text-slate-600 text-[11px]">
                              Frontline Customer Care Representatives are authorized to execute discretionary concessions up to $250.00 USD without supervisor sign-off, provided the account has been authenticated via SMS OTP or registered security token.
                            </p>
                          </div>
                        </div>
                      )}

                      {pdfPage === 2 && (
                        <div className="space-y-3">
                          <h2 className="font-bold text-slate-950 text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
                            2. Mandatory Process Flow & Escalations
                          </h2>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            Transactions exceeding $250.00 USD require real-time supervisor escalation via Portal Queue 'T2-Billing'. The supervisor must confirm account risk score is below 35 before authorizing funds disbursement.
                          </p>
                          <table className="w-full text-left text-[10px] border border-slate-300">
                            <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                              <tr>
                                <th className="p-1.5">Amount Range</th>
                                <th className="p-1.5">Authorization Level</th>
                                <th className="p-1.5">SLA Timeline</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr>
                                <td className="p-1.5">$0.01 - $250.00</td>
                                <td className="p-1.5">Tier 1 Frontline Agent</td>
                                <td className="p-1.5">Immediate (Real-time)</td>
                              </tr>
                              <tr>
                                <td className="p-1.5">$250.01 - $1,000.00</td>
                                <td className="p-1.5">Team Leader / Supervisor</td>
                                <td className="p-1.5">4 Hours</td>
                              </tr>
                              <tr>
                                <td className="p-1.5">&gt; $1,000.00</td>
                                <td className="p-1.5">Operations Manager & Finance</td>
                                <td className="p-1.5">24 Hours</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {pdfPage === 3 && (
                        <div className="space-y-3">
                          <h2 className="font-bold text-slate-950 text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
                            3. Quality Compliance & Regulatory Sign-Off
                          </h2>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            All interactions under this SOP are monitored and subject to randomized weekly QA sampling. Failure to log the correct refund reason code in the CRM wrap-up dialog constitutes a compliance deviation.
                          </p>
                          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                            <div>
                              APPROVED BY: Quality Governance Board<br />
                              STAMP: ISO-9001:2015 AUDITED
                            </div>
                            <div className="border border-slate-300 p-2 text-center rounded bg-slate-50">
                              <span className="font-bold block text-slate-800">DIGITALLY VERIFIED</span>
                              DocuCore Compliance Engine
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Confidential & Proprietary • Internal Operational Use</span>
                        <span>Page {pdfPage} of 3</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Check className="w-4 h-4" />
                      Document reader requirement fulfilled. Acknowledgement condition satisfied.
                    </span>
                    <button
                      onClick={() => setActiveAttachment(null)}
                      className="font-semibold text-slate-800 dark:text-slate-200 hover:underline"
                    >
                      Done Reading
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz Module */}
              {activeUpdate.requiresQuiz && activeUpdate.quiz && (
                <div className="p-5 border border-slate-200 dark:border-slate-750 rounded-lg bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Mandatory Verification Quiz: {activeUpdate.quiz.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Passing Score: {activeUpdate.quiz.passingPercentage}% • Questions: {activeUpdate.quiz.questions.length} • Time Limit: {activeUpdate.quiz.timeLimitMinutes} mins
                      </p>
                    </div>

                    {activeProgress?.quizAttempts && activeProgress.quizAttempts.length > 0 && (
                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          activeProgress.quizAttempts[activeProgress.quizAttempts.length - 1].passed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}>
                          Last Score: {activeProgress.quizAttempts[activeProgress.quizAttempts.length - 1].scorePercentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quiz Taking Form */}
                  {quizStarted ? (
                    <div className="space-y-4 pt-1">
                      {activeUpdate.quiz.questions.map((q, idx) => (
                        <div key={q.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 space-y-2.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            Q{idx + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt) => (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                                  quizAnswers[q.id] === opt.id
                                    ? 'border-slate-800 dark:border-slate-200 bg-slate-200/60 dark:bg-slate-700/60 font-semibold'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  checked={quizAnswers[q.id] === opt.id}
                                  onChange={() => handleQuizAnswerSelect(q.id, opt.id)}
                                  className="w-3.5 h-3.5 text-slate-900 focus:ring-slate-800"
                                />
                                <span>{opt.label}. {opt.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      {quizResult && (
                        <div className={`p-4 rounded-lg border text-xs font-medium ${
                          quizResult.passed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">
                              Result: {quizResult.passed ? 'PASSED' : 'DID NOT PASS'} ({quizResult.score}%)
                            </span>
                            {!quizResult.passed && (
                              <button
                                onClick={() => {
                                  setQuizAnswers({});
                                  setQuizResult(null);
                                }}
                                className="text-xs underline font-semibold text-rose-700 dark:text-rose-300"
                              >
                                Try Again
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] mt-1 opacity-90">
                            {quizResult.passed
                              ? 'Required threshold reached. You may now confirm your acknowledgment.'
                              : 'Score is below 80%. Please re-read the attached SOP and retry.'}
                          </p>
                        </div>
                      )}

                      {!quizResult && (
                        <button
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < activeUpdate.quiz.questions.length}
                          className="w-full py-2.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md disabled:opacity-40 hover:bg-slate-900 shadow-xs transition-colors"
                        >
                          Submit Quiz Answers
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {activeProgress?.quizAttempts?.some((a) => a.passed)
                          ? 'Quiz passed. Ready for acknowledgment.'
                          : 'You must take and pass the verification quiz before acknowledging.'}
                      </p>
                      <button
                        onClick={() => setQuizStarted(true)}
                        className="px-3.5 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md hover:bg-slate-900 transition-colors shadow-xs"
                      >
                        {activeProgress?.quizAttempts?.some((a) => a.passed) ? 'Retake Quiz' : 'Start Quiz'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {!activeProgress?.attachmentViewedAt && (
                  <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Read the attached PDF before acknowledging.
                  </span>
                )}
                {activeProgress?.attachmentViewedAt && activeUpdate.requiresQuiz && !activeProgress?.quizAttempts?.some((a) => a.passed) && (
                  <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Verification quiz must be passed before completing acknowledgment.
                  </span>
                )}
                {activeProgress?.state === 'ACKNOWLEDGED' && (
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Acknowledged on {activeProgress.acknowledgedAt}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCloseModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  Close
                </button>

                {activeProgress?.state !== 'ACKNOWLEDGED' && (
                  <button
                    id="btn-acknowledge-update"
                    disabled={
                      isImpersonating ||
                      !activeProgress?.attachmentViewedAt ||
                      (activeUpdate.requiresQuiz && !activeProgress?.quizAttempts?.some((a) => a.passed))
                    }
                    onClick={handleAcknowledgeClick}
                    className="px-4 py-2 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md disabled:opacity-40 hover:bg-slate-900 dark:hover:bg-white shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-800"
                  >
                    Confirm Acknowledgment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
