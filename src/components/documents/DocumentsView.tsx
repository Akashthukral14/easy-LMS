import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { ProcessDocument, DocumentCategory } from '../../types';
import {
  FolderArchive,
  FileText,
  Search,
  Eye,
  Download,
  History,
  Lock,
  ChevronRight,
  Clock,
  Shield,
  X,
  Copy,
  Printer,
  FileSpreadsheet,
  Check,
  SlidersHorizontal,
  FileCode,
} from 'lucide-react';

interface DocumentsViewProps {
  selectedDocId?: string | null;
  onClearSelection?: () => void;
}

const CATEGORIES: DocumentCategory[] = [
  'SOP',
  'Work Instructions',
  'Policies',
  'FAQs',
  'Escalation Matrix',
  'Process Flow',
  'Reference Material',
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  selectedDocId,
  onClearSelection,
}) => {
  const { currentUser, documents, logAuditEvent } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<ProcessDocument | null>(
    documents.find((d) => d.id === selectedDocId) || null
  );
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(0);

  // Document modal viewer controls
  const [docTextSize, setDocTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [docSearchInside, setDocSearchInside] = useState('');

  const filteredDocs = documents.filter((d) => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    if (selectedFileType !== 'all' && d.fileType !== selectedFileType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.docCode.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenDoc = (doc: ProcessDocument) => {
    setPreviewDoc(doc);
    setSelectedVersionIndex(0);
    setDocSearchInside('');
    logAuditEvent('VIEW_DOCUMENT', `${doc.docCode} (${doc.title})`, `Accessed active version ${doc.currentVersion}`);
  };

  const handleDownloadDoc = (doc: ProcessDocument) => {
    if (doc.downloadRestricted && currentUser.role === 'Agent') {
      alert('Security Governance (Section 66): Direct file download of restricted compliance material is disabled for frontline agents. Please review this document in the secure on-screen viewer.');
      return;
    }

    logAuditEvent('DOWNLOAD_DOCUMENT', doc.docCode, `Downloaded file: ${doc.title} (${doc.fileType})`);

    // Actually trigger browser download of the document content
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.docCode}_v${doc.currentVersion}.${doc.fileType.toLowerCase() === 'pdf' ? 'txt' : doc.fileType.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyDocContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <span>Process Document & SOP Knowledge Base</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 32 & 33: Standard Operating Procedures (SOPs), Work Instructions, Policies, Escalation Matrices, and Version History
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-mono">
            Scope: {currentUser.scope.clientName}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Search input */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by code, title, owner, or keywords..."
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
              <option value="all">All Document Types</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* File Type Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-500 font-medium">Format:</span>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
            >
              <option value="all">All Formats</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="XLSX">XLSX</option>
            </select>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex-wrap">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Quick Filter:
          </span>
          {['all', 'SOP', 'Work Instructions', 'Policies', 'Escalation Matrix'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid Layout */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 text-xs space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
            No process documents match your search and filter criteria.
          </p>
          <p className="text-slate-400">
            Try adjusting your search query or reset the category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedFileType('all');
            }}
            className="mt-2 px-3 py-1.5 bg-slate-800 text-white rounded text-xs hover:bg-slate-900"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Row: DocCode, Version, Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {doc.docCode}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-slate-700 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      v{doc.currentVersion}
                    </span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {doc.category}
                    </span>
                  </div>

                  {doc.downloadRestricted && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800"
                      title="Restricted Content"
                    >
                      <Lock className="w-3 h-3" /> View Only
                    </span>
                  )}
                </div>

                {/* Title and summary */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                {/* Metadata Box */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Document Owner:</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">{doc.owner}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Effective Period:</span>
                    <span className="font-mono text-[10px]">{doc.effectiveDate} → {doc.expiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-750">
                    <span>Format & Version:</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {doc.fileType} • {doc.versions.length} revisions
                    </span>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(doc)}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 font-medium p-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {doc.fileType}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDoc(doc)}
                  className="px-3.5 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Detail & Version History Modal (Section 33) */}
      {previewDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Top header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {previewDoc.docCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold">
                    Active Version: v{previewDoc.currentVersion}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {previewDoc.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewDoc(null);
                  if (onClearSelection) onClearSelection();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Version History Tabs - Section 33 */}
            <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
              <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0 flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Version History:
              </span>
              {previewDoc.versions.map((ver, idx) => (
                <button
                  key={ver.version}
                  type="button"
                  onClick={() => {
                    if (idx > 0 && currentUser.role === 'Agent') {
                      alert('Section 33: Frontline agents review the latest authorized active version. Supervisor role is required to review archived revisions.');
                      return;
                    }
                    setSelectedVersionIndex(idx);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
                    selectedVersionIndex === idx
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  v{ver.version} ({ver.releasedDate})
                </button>
              ))}
            </div>

            {/* Version Note */}
            <div className="px-5 py-2 bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 shrink-0">
              <strong>Revision Summary (v{previewDoc.versions[selectedVersionIndex]?.version}):</strong>{' '}
              {previewDoc.versions[selectedVersionIndex]?.changeSummary} (Authored by{' '}
              {previewDoc.versions[selectedVersionIndex]?.author})
            </div>

            {/* Document Reader Controls Toolbar */}
            <div className="px-5 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Viewer Font:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDocTextSize('normal')}
                    className={`px-2 py-0.5 rounded text-xs ${
                      docTextSize === 'normal'
                        ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    100%
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocTextSize('large')}
                    className={`px-2 py-0.5 rounded text-xs ${
                      docTextSize === 'large'
                        ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    115%
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocTextSize('xlarge')}
                    className={`px-2 py-0.5 rounded text-xs ${
                      docTextSize === 'xlarge'
                        ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    130%
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyDocContent(previewDoc.content)}
                  className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-1 font-medium transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedDoc ? 'Copied Content!' : 'Copy Document Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-1 font-medium transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Document Body Viewer */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div
                className={`p-6 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-mono shadow-xs ${
                  docTextSize === 'large'
                    ? 'text-sm'
                    : docTextSize === 'xlarge'
                    ? 'text-base'
                    : 'text-xs'
                }`}
              >
                {previewDoc.content}
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500">
                Document governed under compliance security rules (Section 66).
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc(null);
                    if (onClearSelection) onClearSelection();
                  }}
                  className="px-4 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded-md hover:bg-slate-900 dark:hover:bg-white transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
