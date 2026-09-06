import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { ELearningCourse, Certificate } from '../../types';
import {
  BookOpen,
  PlayCircle,
  FileText,
  CheckCircle,
  Award,
  Clock,
  ShieldCheck,
  ExternalLink,
  QrCode,
  X,
  Printer,
  ChevronRight,
  ChevronLeft,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Copy,
  SlidersHorizontal,
} from 'lucide-react';

export const ELearningView: React.FC = () => {
  const {
    currentUser,
    elearningCourses,
    toggleModuleCompletion,
    certificates,
    logAuditEvent,
  } = useLms();

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'courses' | 'certificates'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal states
  const [activeCourse, setActiveCourse] = useState<ELearningCourse | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Text Module Player controls (Text Option)
  const [textScale, setTextScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copiedText, setCopiedText] = useState(false);

  // Video Module Player controls
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Interactive Module simulation state
  const [interactiveChoice, setInteractiveChoice] = useState<string | null>(null);
  const [interactiveFeedback, setInteractiveFeedback] = useState<string | null>(null);

  // Filter courses
  const filteredCourses = elearningCourses.filter((course) => {
    if (selectedCategory !== 'all' && course.category !== selectedCategory) return false;
    
    // Type filter
    if (selectedTypeFilter !== 'all') {
      const hasType = course.modules.some((m) => m.type === selectedTypeFilter);
      if (!hasType) return false;
    }

    // Status filter
    const completedCount = course.modules.filter((m) => m.completed).length;
    if (selectedStatusFilter === 'completed' && completedCount !== course.modules.length) return false;
    if (selectedStatusFilter === 'in_progress' && (completedCount === 0 || completedCount === course.modules.length)) return false;
    if (selectedStatusFilter === 'not_started' && completedCount > 0) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.modules.some((m) => m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const categories = Array.from(new Set(elearningCourses.map((c) => c.category)));

  const handleOpenCourse = (course: ELearningCourse) => {
    setActiveCourse(course);
    setActiveModuleIndex(0);
    setIsVideoPlaying(false);
    setInteractiveChoice(null);
    setInteractiveFeedback(null);
    logAuditEvent('OPEN_ELEARNING', course.title, 'Agent opened course module viewer.');
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <span>E-Learning Academy & Certified Programs</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 41 & 42: Interactive multimedia courses, text curriculum, video masterclasses, and verified competency certificates
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'courses'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Catalog</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {elearningCourses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'certificates'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certificates</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {certificates.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'courses' && (
        <>
          {/* Controls Bar: Search & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              {/* Search input */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search course titles, modules, or key topics..."
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

              {/* Category Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-medium">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
                >
                  <option value="all">All Progress</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Quick Module Type Filter Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex-wrap">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Lesson Type:
              </span>
              {[
                { id: 'all', label: 'All Modules' },
                { id: 'text', label: '📄 Text Lessons' },
                { id: 'video', label: '🎬 Video Masterclasses' },
                { id: 'interactive', label: '⚡ Interactive Scenarios' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedTypeFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    selectedTypeFilter === pill.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid Layout */}
          {filteredCourses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 text-xs space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                No courses matched your search criteria.
              </p>
              <p className="text-slate-400">
                Try resetting your filters or clearing the search bar.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTypeFilter('all');
                  setSelectedStatusFilter('all');
                }}
                className="mt-2 px-3 py-1.5 bg-slate-800 text-white rounded text-xs hover:bg-slate-900"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCourses.map((course) => {
                const completedCount = course.modules.filter((m) => m.completed).length;
                const percent = Math.round((completedCount / course.modules.length) * 100);
                const hasText = course.modules.some((m) => m.type === 'text');
                const hasVideo = course.modules.some((m) => m.type === 'video');
                const hasInteractive = course.modules.some((m) => m.type === 'interactive');

                return (
                  <div
                    key={course.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Badges row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 font-mono uppercase tracking-wide">
                          {course.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{course.durationMinutes} mins</span>
                        </div>
                      </div>

                      {/* Course Title & Description */}
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      {/* Module composition breakdown */}
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {course.modules.length} Modules:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {hasText && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-blue-500" /> Text
                            </span>
                          )}
                          {hasVideo && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center gap-1">
                              <PlayCircle className="w-3 h-3 text-rose-500" /> Video
                            </span>
                          )}
                          {hasInteractive && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" /> Interactive
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            {completedCount} of {course.modules.length} modules
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent === 100
                                ? 'bg-emerald-600 dark:bg-emerald-400'
                                : 'bg-slate-800 dark:bg-slate-200'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      {course.certificateEligible ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <Award className="w-3.5 h-3.5" /> Certificate Eligible
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Internal SOP</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenCourse(course)}
                        className="px-3.5 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white inline-flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <span>
                          {percent === 100
                            ? 'Review Course'
                            : percent > 0
                            ? 'Resume Course'
                            : 'Start Course'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Verified Certificates Tab (Grid Format) */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Issued Competency Certificates ({certificates.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Permanent cryptographic records (Section 42)
            </span>
          </div>

          {certificates.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-xs space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No issued certificates found yet.
              </p>
              <p className="text-slate-400">
                Complete eligible assessments or e-learning courses to unlock verifiable certificates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCertificate(cert)}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {cert.id}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cert.courseOrAssessmentTitle}
                    </h4>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Recipient:</span>
                        <strong className="text-slate-900 dark:text-slate-100 font-semibold">{cert.userName}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Score Cleared:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{cert.score}%</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Issued On:</span>
                        <span className="font-mono text-[11px]">{cert.completionDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                      {cert.verificationCode}
                    </span>
                    <button
                      type="button"
                      className="text-slate-800 dark:text-slate-200 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>View & Print</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Course Reader & Interactive Player Modal */}
      {activeCourse && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                  {activeCourse.category} • Module {activeModuleIndex + 1} of {activeCourse.modules.length}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {activeCourse.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCourse(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modules Navigation Bar */}
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
              {activeCourse.modules.map((mod, idx) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    setActiveModuleIndex(idx);
                    setIsVideoPlaying(false);
                    setInteractiveChoice(null);
                    setInteractiveFeedback(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 border ${
                    activeModuleIndex === idx
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mod.completed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : mod.type === 'text' ? (
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                  ) : mod.type === 'video' ? (
                    <PlayCircle className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>
                    {idx + 1}. {mod.title.split(':')[0]}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">({mod.duration})</span>
                </button>
              ))}
            </div>

            {/* Module Active Content Area */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {activeCourse.modules[activeModuleIndex] && (
                <div className="space-y-5">
                  {/* Module Title & Meta */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          activeCourse.modules[activeModuleIndex].type === 'text'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                            : activeCourse.modules[activeModuleIndex].type === 'video'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                        }`}>
                          {activeCourse.modules[activeModuleIndex].type} LESSON
                        </span>
                        <span className="text-slate-500 font-mono">
                          Duration: {activeCourse.modules[activeModuleIndex].duration}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {activeCourse.modules[activeModuleIndex].title}
                      </h4>
                    </div>

                    {/* Quick completion badge */}
                    {activeCourse.modules[activeModuleIndex].completed && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>

                  {/* 1. TEXT MODULE OPTION (Dedicated Rich Text Reader) */}
                  {activeCourse.modules[activeModuleIndex].type === 'text' && (
                    <div className="space-y-4">
                      {/* Reader toolbar */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            Reader Sizing:
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setTextScale('normal')}
                              className={`px-2 py-0.5 rounded text-xs ${
                                textScale === 'normal'
                                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              Standard
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextScale('large')}
                              className={`px-2 py-0.5 rounded text-xs ${
                                textScale === 'large'
                                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              Medium
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextScale('xlarge')}
                              className={`px-2 py-0.5 rounded text-xs ${
                                textScale === 'xlarge'
                                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              Large
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyText(activeCourse.modules[activeModuleIndex].content)}
                          className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex items-center gap-1 font-medium transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Lesson Notes'}</span>
                        </button>
                      </div>

                      {/* Lesson Text Reader Content */}
                      <div
                        className={`p-6 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed text-slate-800 dark:text-slate-200 space-y-4 shadow-xs ${
                          textScale === 'large'
                            ? 'text-sm'
                            : textScale === 'xlarge'
                            ? 'text-base'
                            : 'text-xs'
                        }`}
                      >
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          Core Lesson Material & Operational Guidelines
                        </h5>
                        <p className="leading-relaxed">
                          {activeCourse.modules[activeModuleIndex].content}
                        </p>
                        <p className="leading-relaxed">
                          When operating across frontline channels, customer interactions require immediate alignment with established SOP criteria. Ensure all decisions adhere to compliance constraints, security boundaries, and verified ticketing sequences.
                        </p>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-slate-800 dark:border-slate-200 space-y-1.5 text-xs">
                          <strong className="text-slate-900 dark:text-slate-100 block font-bold">
                            Key Operational Takeaways:
                          </strong>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                            <li>De-escalate using objective, non-defensive language.</li>
                            <li>Never commit to unauthorized financial refunds beyond your role threshold.</li>
                            <li>Document all ticket remarks with timestamped timestamps and reference IDs.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. VIDEO MODULE PLAYER (Interactive Player Simulation) */}
                  {activeCourse.modules[activeModuleIndex].type === 'video' && (
                    <div className="space-y-3">
                      <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-lg text-white">
                        {/* Video Top Controls */}
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span className="font-semibold flex items-center gap-1.5">
                            <PlayCircle className="w-4 h-4 text-rose-400" />
                            HD Training Stream • 1080p
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-800/80 rounded">
                            {playbackSpeed}x Speed
                          </span>
                        </div>

                        {/* Center Play/Pause Graphic */}
                        <div className="flex items-center justify-center my-auto">
                          <button
                            type="button"
                            onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                            className="w-16 h-16 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20 transition-transform active:scale-95 shadow-xl"
                          >
                            {isVideoPlaying ? (
                              <div className="w-5 h-5 flex items-center justify-between">
                                <span className="w-1.5 h-5 bg-white rounded-xs" />
                                <span className="w-1.5 h-5 bg-white rounded-xs" />
                              </div>
                            ) : (
                              <PlayCircle className="w-9 h-9 text-white" />
                            )}
                          </button>
                        </div>

                        {/* Video Bottom Scrub Bar & Controls */}
                        <div className="space-y-2 bg-slate-900/90 backdrop-blur-xs p-3 rounded-lg border border-slate-800">
                          {/* Scrub Bar */}
                          <div
                            className="w-full bg-slate-700 h-1.5 rounded-full cursor-pointer relative"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const clickX = e.clientX - rect.left;
                              const newPct = Math.round((clickX / rect.width) * 100);
                              setVideoProgress(Math.max(0, Math.min(100, newPct)));
                            }}
                          >
                            <div
                              className="bg-rose-500 h-full rounded-full transition-all"
                              style={{ width: `${videoProgress}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                className="font-bold hover:text-white"
                              >
                                {isVideoPlaying ? 'Pause' : 'Play'}
                              </button>
                              <span className="font-mono text-[11px] text-slate-400">
                                04:15 / {activeCourse.modules[activeModuleIndex].duration}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const speeds = [1.0, 1.25, 1.5, 2.0];
                                  const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                                  setPlaybackSpeed(speeds[nextIdx]);
                                }}
                                className="hover:text-white font-mono text-[11px]"
                              >
                                {playbackSpeed}x
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsMuted(!isMuted)}
                                className="hover:text-white"
                              >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => alert('Full screen expanded')}
                                className="hover:text-white"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Video Synopsis */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          <strong>Synopsis:</strong> {activeCourse.modules[activeModuleIndex].content}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. INTERACTIVE MODULE (Scenario Simulator) */}
                  {activeCourse.modules[activeModuleIndex].type === 'interactive' && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-750">
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Interactive Scenario Simulator</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Select the best operational resolution
                        </span>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs leading-relaxed space-y-2">
                        <strong className="text-slate-900 dark:text-slate-100 block">
                          Operational Challenge:
                        </strong>
                        <p className="text-slate-700 dark:text-slate-300">
                          {activeCourse.modules[activeModuleIndex].content}
                        </p>
                      </div>

                      {/* Choice Buttons */}
                      <div className="space-y-2">
                        {[
                          {
                            id: 'choice-1',
                            label: 'A',
                            text: 'De-escalate immediately with active listening, acknowledging caller sentiment while confirming boundary policies.',
                            correct: true,
                            feedback: 'Optimal Choice! High empathy without unauthorized liability admissions satisfies Section 41 governance.',
                          },
                          {
                            id: 'choice-2',
                            label: 'B',
                            text: 'Promise an immediate executive courtesy waiver without consulting team leadership or checking billing records.',
                            correct: false,
                            feedback: 'Incorrect: Premature concession violates the Refund Matrix and exposes the operation to financial audit discrepancies.',
                          },
                          {
                            id: 'choice-3',
                            label: 'C',
                            text: 'Place caller on hold abruptly without context to request supervisor intervention.',
                            correct: false,
                            feedback: 'Incorrect: Hold times exceeding standard protocol without preliminary context elevate customer agitation.',
                          },
                        ].map((choice) => (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => {
                              setInteractiveChoice(choice.id);
                              setInteractiveFeedback(choice.feedback);
                              if (choice.correct && !activeCourse.modules[activeModuleIndex].completed) {
                                toggleModuleCompletion(
                                  activeCourse.id,
                                  activeCourse.modules[activeModuleIndex].id
                                );
                              }
                            }}
                            className={`w-full p-3 text-left rounded-lg border text-xs transition-all flex items-start gap-2.5 ${
                              interactiveChoice === choice.id
                                ? choice.correct
                                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                                  : 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                          >
                            <span className="font-bold font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-800 dark:text-slate-200 shrink-0">
                              {choice.label}
                            </span>
                            <span className="font-medium">{choice.text}</span>
                          </button>
                        ))}
                      </div>

                      {/* Feedback box */}
                      {interactiveFeedback && (
                        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {interactiveFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Module Completion Toggle & Modal Footer Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={activeCourse.modules[activeModuleIndex].completed}
                        onChange={() =>
                          toggleModuleCompletion(
                            activeCourse.id,
                            activeCourse.modules[activeModuleIndex].id
                          )
                        }
                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800"
                      />
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        Mark module as completed
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {activeModuleIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveModuleIndex((prev) => prev - 1)}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </button>
                      )}

                      {activeModuleIndex < activeCourse.modules.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!activeCourse.modules[activeModuleIndex].completed) {
                              toggleModuleCompletion(
                                activeCourse.id,
                                activeCourse.modules[activeModuleIndex].id
                              );
                            }
                            setActiveModuleIndex((prev) => prev + 1);
                          }}
                          className="px-4 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white inline-flex items-center gap-1 shadow-xs"
                        >
                          <span>Next Module</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!activeCourse.modules[activeModuleIndex].completed) {
                              toggleModuleCompletion(
                                activeCourse.id,
                                activeCourse.modules[activeModuleIndex].id
                              );
                            }
                            setActiveCourse(null);
                          }}
                          className="px-5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 inline-flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Finish Course</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verifiable Certificate Modal - Section 42 */}
      {selectedCertificate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-8 shadow-2xl space-y-6 text-center my-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="font-mono text-xs text-slate-400 font-bold uppercase">
                Official Certification Record
              </span>
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 shadow-2xs">
                <ShieldCheck className="w-8 h-8 text-slate-900 dark:text-slate-100" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50 uppercase">
                Certificate of Competency
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Issued under Operational Governance & Compliance Framework
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-500">This certifies that</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {selectedCertificate.userName}
              </h4>
              <p className="text-xs text-slate-500">
                has successfully cleared the evaluation benchmarks for
              </p>
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {selectedCertificate.courseOrAssessmentTitle}
              </h5>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Score Cleared</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                  {selectedCertificate.score}%
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Granted Date</span>
                <strong>{selectedCertificate.completionDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Valid Until</span>
                <strong>{selectedCertificate.validUntil}</strong>
              </div>
            </div>

            {/* QR Verification Block */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white text-black shadow-2xs">
                <QrCode className="w-12 h-12" />
              </div>
              <div className="text-left text-[11px] font-mono space-y-0.5">
                <div className="text-slate-400 font-medium">Cryptographic Ledger ID:</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedCertificate.verificationCode}
                </div>
                <div className="text-[10px] text-slate-400">
                  Record Key: {selectedCertificate.id}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold rounded-md text-xs hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                className="px-5 py-2 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded-md text-xs hover:bg-slate-900 dark:hover:bg-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
