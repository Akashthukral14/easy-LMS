import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { ProcessUpdate, Priority, QuizQuestion } from '../../types';
import {
  FilePlus2,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  FileText,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

export const UpdateManagementView: React.FC = () => {
  const {
    currentUser,
    clients,
    publishNewUpdate,
    updates,
    archiveUpdate,
    setActiveTab,
  } = useLms();

  const [isCreating, setIsCreating] = useState(false);
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Process Change');
  const [priority, setPriority] = useState<Priority>('High');
  const [version, setVersion] = useState('1.0');
  const [effectiveDate, setEffectiveDate] = useState('2026-09-06');
  const [dueDate, setDueDate] = useState('2026-09-12');
  const [expiryDate, setExpiryDate] = useState('2027-09-06');
  const [requiresQuiz, setRequiresQuiz] = useState(false);
  const [reackRequired, setReackRequired] = useState(true);

  // Client/LOB selection (Admin is locked to their scope, Super Admin can pick)
  const [selectedClient, setSelectedClient] = useState(
    currentUser.role === 'Super Admin' ? clients[0]?.id || 'client-abc' : currentUser.scope.clientId
  );
  const currentClientObj = clients.find((c) => c.id === selectedClient);
  const [selectedLob, setSelectedLob] = useState(
    currentUser.role === 'Super Admin'
      ? currentClientObj?.lobs[0]?.id || 'lob-int-voice'
      : currentUser.scope.lobId
  );
  const [selectedLocation, setSelectedLocation] = useState(
    currentUser.role === 'Super Admin'
      ? currentClientObj?.locations[0]?.id || 'loc-gurgaon'
      : currentUser.scope.locationId
  );

  // Quiz builder questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-custom-1',
      question: 'Does this update require immediate client notification?',
      options: [
        { id: 'opt-1', label: 'A', text: 'Yes, within 2 hours of case intake' },
        { id: 'opt-2', label: 'B', text: 'No, purely internal reference' },
        { id: 'opt-3', label: 'C', text: 'Only if customer requests supervisor' },
      ],
      correctOptionId: 'opt-1',
      marks: 10,
      explanation: 'SLA requires immediate notification within 2 hours.',
    },
  ]);

  // Confirmation dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAddQuestion = () => {
    const newId = `q-custom-${Date.now()}`;
    setQuestions((prev) => [
      ...prev,
      {
        id: newId,
        question: 'New Question Title',
        options: [
          { id: 'opt-a', label: 'A', text: 'Option A' },
          { id: 'opt-b', label: 'B', text: 'Option B' },
        ],
        correctOptionId: 'opt-a',
        marks: 10,
        explanation: 'Mandatory rationale.',
      },
    ]);
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide both Title and Description.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = () => {
    const newUpdate = publishNewUpdate({
      topic,
      title,
      description,
      category,
      priority,
      clientId: selectedClient,
      lobId: selectedLob,
      locationId: selectedLocation,
      version,
      effectiveDate,
      dueDate,
      expiryDate,
      createdBy: `${currentUser.name} (${currentUser.role})`,
      lastModifiedBy: `${currentUser.name} (${currentUser.role})`,
      attachments: [
        {
          id: `att-${Date.now()}`,
          name: `${title.replace(/\s+/g, '_').slice(0, 20)}_SOP.pdf`,
          fileType: 'PDF',
          size: '1.2 MB',
          url: '#',
          requiredToView: true,
        },
      ],
      requiresQuiz,
      reacknowledgementRequiredOnVersionBump: reackRequired,
      quiz: requiresQuiz
        ? {
            id: `quiz-${Date.now()}`,
            title: `${title} - Verification Quiz`,
            passingPercentage: 80,
            timeLimitMinutes: 5,
            attemptLimit: 3,
            randomizeQuestions: false,
            showAnswersAfterSubmission: true,
            questions,
          }
        : undefined,
    });

    setShowConfirmModal(false);
    setIsCreating(false);
    alert(`Successfully published update: ${newUpdate.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Process Update Authoring & Lifecycle Management
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Create, version, attach verification quizzes, and publish updates to targeted agent scopes
          </p>
        </div>

        <button
          id="btn-create-new-update"
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded hover:opacity-90 transition-opacity inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-neutral-900 shrink-0"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>{isCreating ? 'Cancel Authoring' : 'Author New Update'}</span>
        </button>
      </div>

      {/* Update Creation Form */}
      {isCreating && (
        <form
          onSubmit={handlePublishSubmit}
          className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-6 space-y-6"
        >
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              New Update Specification (Section 18 & 29)
            </h3>
            <p className="text-xs text-neutral-500">
              Update ID will be automatically generated as UPD-YYYYMMDD-CLIENT-LOB-SEQUENCE upon publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Update Topic / Subject Area *
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Cross-Border Billing & Currency Policy"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Headline / Official Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Revised International Refund Approval Thresholds"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Detailed Process Description & Operational Change Summary *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide precise step-by-step guidance on what frontline staff must do differently..."
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
              >
                <option value="Process Change">Process Change</option>
                <option value="Policy">Policy</option>
                <option value="Compliance">Compliance</option>
                <option value="Product">Product</option>
                <option value="Escalation">Escalation</option>
                <option value="Quality">Quality</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-none"
              >
                <option value="Urgent">Urgent (Immediate Review)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Version Identifier (Section 30)
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., 2.0"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Due Date for Acknowledgment
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
          </div>

          {/* Scope Isolation Assignment */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-neutral-200 dark:border-neutral-700 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Audience Scope Assignment (Section 8 & 9)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-neutral-500 block mb-1">Client</label>
                <select
                  disabled={currentUser.role !== 'Super Admin'}
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded font-medium"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-500 block mb-1">Line of Business (LOB)</label>
                <select
                  disabled={currentUser.role !== 'Super Admin'}
                  value={selectedLob}
                  onChange={(e) => setSelectedLob(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded font-medium"
                >
                  {currentClientObj?.lobs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-500 block mb-1">Location / Site</label>
                <select
                  disabled={currentUser.role !== 'Super Admin'}
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded font-medium"
                >
                  {currentClientObj?.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Workflow checkboxes */}
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reackRequired}
                onChange={(e) => setReackRequired(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Enforce Version-Based Re-acknowledgment (Section 31)
              </span>
            </label>
            <p className="text-neutral-500 pl-6 text-[11px]">
              If enabled, all previously acknowledged agents must re-read this revision and acknowledge again.
            </p>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={requiresQuiz}
                onChange={(e) => setRequiresQuiz(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Attach Mandatory Comprehension Quiz (Section 23)
              </span>
            </label>
          </div>

          {/* Quiz Builder Sub-form */}
          {requiresQuiz && (
            <div className="p-4 border border-neutral-300 dark:border-neutral-700 rounded bg-neutral-50 dark:bg-neutral-800/40 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Quiz Questions ({questions.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-2 py-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium rounded hover:opacity-90 inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Question {idx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== q.id))}
                          className="text-neutral-400 hover:text-neutral-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={q.question}
                        placeholder="Enter the question..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, question: val } : item)));
                        }}
                        className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
                      />
                    </div>

                    {/* Question Options List */}
                    <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                          Options & Correct Answer (Select radio button for correct option)
                        </span>
                        {q.options.length < 5 && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextLabel = String.fromCharCode(65 + q.options.length);
                              const newOpt = {
                                id: `opt-${Date.now()}-${q.options.length}`,
                                label: nextLabel,
                                text: `Option ${nextLabel}`,
                              };
                              setQuestions((prev) =>
                                prev.map((item) =>
                                  item.id === q.id
                                    ? { ...item, options: [...item.options, newOpt] }
                                    : item
                                )
                              );
                            }}
                            className="text-[10px] font-semibold text-neutral-900 dark:text-neutral-100 underline hover:opacity-80"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2 p-1.5 rounded border transition-colors ${
                              q.correctOptionId === opt.id
                                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30'
                            }`}
                          >
                            <label className="flex items-center gap-1.5 cursor-pointer shrink-0" title="Mark as correct option">
                              <input
                                type="radio"
                                name={`correct-opt-${q.id}`}
                                checked={q.correctOptionId === opt.id}
                                onChange={() =>
                                  setQuestions((prev) =>
                                    prev.map((item) =>
                                      item.id === q.id ? { ...item, correctOptionId: opt.id } : item
                                    )
                                  )
                                }
                                className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="font-bold font-mono text-neutral-700 dark:text-neutral-300 w-4">
                                {opt.label}.
                              </span>
                            </label>

                            <input
                              type="text"
                              value={opt.text}
                              placeholder={`Enter option ${opt.label} text...`}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setQuestions((prev) =>
                                  prev.map((item) =>
                                    item.id === q.id
                                      ? {
                                          ...item,
                                          options: item.options.map((o) =>
                                            o.id === opt.id ? { ...o, text: newText } : o
                                          ),
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
                            />

                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions((prev) =>
                                    prev.map((item) => {
                                      if (item.id !== q.id) return item;
                                      const filtered = item.options.filter((o) => o.id !== opt.id);
                                      const reIndexed = filtered.map((o, i) => ({
                                        ...o,
                                        label: String.fromCharCode(65 + i),
                                      }));
                                      const newCorrect =
                                        item.correctOptionId === opt.id
                                          ? reIndexed[0]?.id || ''
                                          : item.correctOptionId;
                                      return {
                                        ...item,
                                        options: reIndexed,
                                        correctOptionId: newCorrect,
                                      };
                                    })
                                  );
                                }}
                                className="text-neutral-400 hover:text-rose-500 p-1"
                                title="Delete Option"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded hover:opacity-90 focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              Review & Publish Update
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Modal - Section 81 "Confirmation Rules" */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-neutral-900 dark:text-neutral-100 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Publish Process Update?
                </h4>
                <p className="text-neutral-500 mt-1">
                  This update will become immediately visible and mandatory for all assigned agents:
                </p>
                <div className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-[11px] font-mono space-y-1">
                  <div>Client: {currentClientObj?.name}</div>
                  <div>LOB: {selectedLob}</div>
                  <div>Location: {selectedLocation}</div>
                  <div>Version: v{version}</div>
                  <div>Quiz Required: {requiresQuiz ? 'YES' : 'NO'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                className="px-4 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold rounded hover:opacity-90"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Updates Table with Soft Delete/Archive option */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Update Inventory ({updates.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Manage life cycle statuses: Published, Archived, or Soft-Deleted
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-medium">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Due Date</th>
                <th className="py-2 pr-4">Quiz</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {updates.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td className="py-2.5 pr-4 font-mono font-medium text-neutral-600 dark:text-neutral-400">
                    {u.id}
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-neutral-900 dark:text-neutral-100 max-w-xs truncate">
                    {u.title}
                  </td>
                  <td className="py-2.5 pr-4 font-mono">v{u.version}</td>
                  <td className="py-2.5 pr-4 font-mono text-neutral-500">{u.dueDate}</td>
                  <td className="py-2.5 pr-4">{u.requiresQuiz ? 'Yes' : 'No'}</td>
                  <td className="py-2.5 pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right space-x-2">
                    {u.status !== 'Archived' && (
                      <button
                        onClick={() => archiveUpdate(u.id)}
                        className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 underline text-xs"
                      >
                        Archive
                      </button>
                    )}
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
