import React, { useEffect, useRef } from 'react';
import { useLms } from '../../context/LmsContext';
import { Search, X, FileText, FolderArchive, CheckSquare, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectUpdate?: (updateId: string) => void;
  onSelectDocument?: (docId: string) => void;
  onSelectAssessment?: (asmId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSelectUpdate,
  onSelectDocument,
  onSelectAssessment,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    setActiveTab,
    setSelectedUpdateId,
    setSelectedDocId,
    setSelectedAssessmentId,
  } = useLms();

  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveIsOpen = propIsOpen !== undefined ? propIsOpen : isSearchOpen;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    if (effectiveIsOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [effectiveIsOpen]);

  // Handle escape key and slash shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && effectiveIsOpen) {
        handleClose();
      }
      if ((e.key === '/' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) && !effectiveIsOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [effectiveIsOpen]);

  if (!effectiveIsOpen) return null;

  const totalResults =
    searchResults.updates.length +
    searchResults.documents.length +
    searchResults.assessments.length;

  const handleChooseUpdate = (id: string) => {
    if (onSelectUpdate) {
      onSelectUpdate(id);
    } else {
      setSelectedUpdateId(id);
      setActiveTab('updates');
    }
    handleClose();
  };

  const handleChooseDocument = (id: string) => {
    if (onSelectDocument) {
      onSelectDocument(id);
    } else {
      setSelectedDocId(id);
      setActiveTab('documents');
    }
    handleClose();
  };

  const handleChooseAssessment = (id: string) => {
    if (onSelectAssessment) {
      onSelectAssessment(id);
    } else {
      setSelectedAssessmentId(id);
      setActiveTab('assessments');
    }
    handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-850/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword, ID (e.g. 'Refund', 'UPD-2026', 'PCI')..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-200 shadow-2xs"
          >
            ESC
          </button>
        </div>

        {/* Results summary counter */}
        {searchQuery.trim() && (
          <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span className="font-medium">
              Found {totalResults} authorized item{totalResults === 1 ? '' : 's'}
            </span>
            <div className="flex gap-3 text-[11px] font-mono text-slate-500">
              <span>Updates: {searchResults.updates.length}</span>
              <span>Documents: {searchResults.documents.length}</span>
              <span>Assessments: {searchResults.assessments.length}</span>
            </div>
          </div>
        )}

        {/* Results List or Quick Help */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {!searchQuery.trim() ? (
            <div className="p-4 text-center text-slate-400 space-y-2">
              <p className="font-medium text-slate-600 dark:text-slate-300">
                Quick Navigation & Scoped Entity Search
              </p>
              <p className="text-[11px] max-w-sm mx-auto">
                Type keywords to find policy updates, standard operating procedures, and assessments restricted to your assigned scope.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">
                  Esc to close
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">
                  / to focus anywhere
                </span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="font-semibold text-slate-800 dark:text-slate-200">No matches found</p>
              <p className="text-[11px] mt-1 text-slate-400">
                No active records matched "{searchQuery}" in your current client scope.
              </p>
            </div>
          ) : (
            <>
              {/* Process Updates Section */}
              {searchResults.updates.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Process Updates ({searchResults.updates.length})</span>
                  </h3>
                  <div className="space-y-1">
                    {searchResults.updates.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleChooseUpdate(u.id)}
                        className="w-full p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left flex items-center justify-between transition-colors group"
                      >
                        <div className="overflow-hidden mr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {u.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              v{u.version}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {u.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {u.id}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {searchResults.documents.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>Process Documents & SOPs ({searchResults.documents.length})</span>
                  </h3>
                  <div className="space-y-1">
                    {searchResults.documents.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleChooseDocument(d.id)}
                        className="w-full p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left flex items-center justify-between transition-colors group"
                      >
                        <div className="overflow-hidden mr-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {d.title}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {d.summary}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {d.docCode}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessments Section */}
              {searchResults.assessments.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Assessments & Quizzes ({searchResults.assessments.length})</span>
                  </h3>
                  <div className="space-y-1">
                    {searchResults.assessments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleChooseAssessment(a.id)}
                        className="w-full p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left flex items-center justify-between transition-colors group"
                      >
                        <div className="overflow-hidden mr-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {a.title}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {a.questions.length} questions • {a.timeLimitMinutes} mins • {a.passingPercentage}% passing score
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {a.id}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
