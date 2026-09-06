import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Role,
  ClientEntity,
  ProcessUpdate,
  Assessment,
  ProcessDocument,
  ELearningCourse,
  Certificate,
  NotificationItem,
  AuditLog,
  AgentUpdateProgress,
  AssessmentSubmission,
  UserSettings,
  ActiveSession,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_UPDATES,
  INITIAL_PROGRESS,
  INITIAL_ASSESSMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_DOCUMENTS,
  INITIAL_ELEARNING,
  INITIAL_CERTIFICATES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

interface LmsContextType {
  // Current user & Auth
  currentUser: User;
  users: User[];
  allUsers: User[];
  setCurrentUserById: (userId: string) => void;
  isImpersonating: boolean;
  impersonatedUser: User | null;
  startImpersonation: (agentId: string) => void;
  stopImpersonation: () => void;
  
  // Scope
  currentScopeLabel: string;
  clients: ClientEntity[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  selectedLobId: string;
  setSelectedLobId: (id: string) => void;
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  
  // Settings & Theme
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  activeSessions: ActiveSession[];
  logoutSession: (sessionId: string) => void;
  logoutAllOtherSessions: () => void;
  
  // Updates & State Machine
  updates: ProcessUpdate[];
  userProgress: Record<string, AgentUpdateProgress>;
  viewUpdate: (updateId: string) => void;
  viewAttachment: (updateId: string, attachmentId: string) => void;
  submitUpdateQuiz: (updateId: string, selectedAnswers: Record<string, string>) => { passed: boolean; score: number };
  acknowledgeUpdate: (updateId: string) => boolean;
  publishNewUpdate: (update: Omit<ProcessUpdate, 'id' | 'createdAt' | 'status'>) => ProcessUpdate;
  archiveUpdate: (updateId: string) => void;
  
  // Assessments
  assessments: Assessment[];
  submissions: AssessmentSubmission[];
  submitAssessment: (assessmentId: string, answers: Record<string, string>, timeSpentSeconds: number) => AssessmentSubmission;
  createAssessment: (assessment: Omit<Assessment, 'id'>) => Assessment;
  bulkUploadQuestionsToAssessment: (assessmentId: string, questions: Assessment['questions']) => void;
  
  // Documents & E-Learning
  documents: ProcessDocument[];
  elearningCourses: ELearningCourse[];
  certificates: Certificate[];
  toggleModuleCompletion: (courseId: string, moduleId: string) => void;
  
  // Notifications & Audits
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  auditLogs: AuditLog[];
  logAuditEvent: (action: string, target: string, metadata?: string) => void;
  
  // User Management
  addUser: (userData: Partial<User>) => User;
  updateUserStatus: (userId: string, status: User['status']) => void;
  bulkImportUsers: (newUsers: Partial<User>[]) => { successCount: number; errors: string[] };
  
  // Client Management (Super Admin)
  addClient: (client: Omit<ClientEntity, 'id'>) => void;
  
  // Global Search & Modals
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchResults: {
    updates: ProcessUpdate[];
    documents: ProcessDocument[];
    assessments: Assessment[];
  };

  // Nav state & Selection
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedUpdateId: string | null;
  setSelectedUpdateId: (id: string | null) => void;
  selectedAssessmentId: string | null;
  setSelectedAssessmentId: (id: string | null) => void;
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;

  // Accessibility helpers
  accessibilitySettings: {
    theme: 'light' | 'dark' | 'contrast';
    highContrast: boolean;
    density: 'comfortable' | 'compact' | 'spacious';
    textSize: 'normal' | 'large' | 'xlarge';
    reducedMotion: boolean;
  };
  updateAccessibilitySettings: (newSettings: Partial<{
    theme: 'light' | 'dark' | 'contrast';
    highContrast: boolean;
    density: 'comfortable' | 'compact' | 'spacious';
    textSize: 'normal' | 'large' | 'xlarge';
    reducedMotion: boolean;
  }>) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  accentColor: 'charcoal',
  density: 'comfortable',
  textSize: 'normal',
  sidebarState: 'expanded',
  animation: 'full',
  highContrast: false,
};

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-agent-rahul');
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);

  // Active user resolution
  const loggedInUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const impersonatedUser = useMemo(() => {
    return impersonatedUserId ? users.find((u) => u.id === impersonatedUserId) || null : null;
  }, [users, impersonatedUserId]);

  // When impersonating, currentUser behaves as the target agent (with read-only restrictions)
  const effectiveUser = impersonatedUser || loggedInUser;
  const isImpersonating = !!impersonatedUser;

  // Scopes
  const [clients, setClients] = useState<ClientEntity[]>(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedLobId, setSelectedLobId] = useState<string>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');

  // User Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('lms_user_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('lms_user_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-current',
      deviceName: 'Windows 11 PC (Chrome 128)',
      browser: 'Chrome / Blink',
      ip: '192.168.10.42',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'sess-mobile',
      deviceName: 'Apple iPhone 15 Pro (Safari)',
      browser: 'Mobile Safari',
      ip: '49.36.120.15',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
  ]);

  const logoutSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    logAuditEvent('LOGOUT_SESSION', sessionId, 'Logged out specific user session.');
  };

  const logoutAllOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
    logAuditEvent('LOGOUT_ALL_SESSIONS', 'All non-current sessions', 'Terminated all secondary sessions.');
  };

  // Core LMS entities
  const [updates, setUpdates] = useState<ProcessUpdate[]>(INITIAL_UPDATES);
  const [userProgress, setUserProgress] = useState<Record<string, AgentUpdateProgress>>(INITIAL_PROGRESS);
  const [assessments, setAssessments] = useState<Assessment[]>(INITIAL_ASSESSMENTS);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>(INITIAL_SUBMISSIONS);
  const [documents, setDocuments] = useState<ProcessDocument[]>(INITIAL_DOCUMENTS);
  const [elearningCourses, setElearningCourses] = useState<ELearningCourse[]>(INITIAL_ELEARNING);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Nav state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Sync theme with document class
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Sync text sizing with root font size for full application responsiveness
  useEffect(() => {
    if (settings.textSize === 'large') {
      document.documentElement.style.fontSize = '17.5px';
      document.documentElement.classList.remove('text-size-normal', 'text-size-xlarge');
      document.documentElement.classList.add('text-size-large');
    } else if (settings.textSize === 'xlarge') {
      document.documentElement.style.fontSize = '19px';
      document.documentElement.classList.remove('text-size-normal', 'text-size-large');
      document.documentElement.classList.add('text-size-xlarge');
    } else {
      document.documentElement.style.fontSize = '16px';
      document.documentElement.classList.remove('text-size-large', 'text-size-xlarge');
      document.documentElement.classList.add('text-size-normal');
    }
  }, [settings.textSize]);

  const accessibilitySettings = useMemo(() => ({
    theme: settings.theme,
    highContrast: settings.highContrast,
    density: settings.density,
    textSize: settings.textSize,
    reducedMotion: settings.animation !== 'full',
  }), [settings]);

  const updateAccessibilitySettings = (newSettings: any) => {
    updateSettings({
      ...(newSettings.theme && { theme: newSettings.theme }),
      ...(newSettings.highContrast !== undefined && { highContrast: newSettings.highContrast }),
      ...(newSettings.density && { density: newSettings.density }),
      ...(newSettings.textSize && { textSize: newSettings.textSize }),
      ...(newSettings.reducedMotion !== undefined && { animation: newSettings.reducedMotion ? 'reduced' : 'full' }),
    });
  };

  // Audit logging helper
  const logAuditEvent = (action: string, target: string, metadata?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: loggedInUser.id,
      userName: loggedInUser.name,
      role: loggedInUser.role,
      action,
      target,
      scope: `${loggedInUser.scope.clientName} / ${loggedInUser.scope.lobName}`,
      ip: '192.168.10.42',
      metadata,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Impersonation handlers
  const startImpersonation = (agentId: string) => {
    const targetAgent = users.find((u) => u.id === agentId);
    if (!targetAgent) return;
    setImpersonatedUserId(agentId);
    logAuditEvent('IMPERSONATION_START', `${targetAgent.name} (${targetAgent.role})`, 'Started read-only Agent View.');
  };

  const stopImpersonation = () => {
    if (impersonatedUser) {
      logAuditEvent('IMPERSONATION_END', `${impersonatedUser.name}`, 'Exited read-only Agent View.');
    }
    setImpersonatedUserId(null);
  };

  const setCurrentUserById = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u) {
      setImpersonatedUserId(null); // clear any active impersonation
      setCurrentUserId(userId);
      logAuditEvent('ROLE_SWITCH', `${u.name} (${u.role})`, `Switched active user context to ${u.role}`);
    }
  };

  // Scope Filtering Logic
  // If Agent or Admin, they can ONLY see their assigned Client + LOB + Location!
  // If Super Admin, they can view all or filter.
  const scopedUpdates = useMemo(() => {
    return updates.filter((item) => {
      if (effectiveUser.role === 'Super Admin') {
        if (selectedClientId !== 'all' && item.clientId !== selectedClientId) return false;
        if (selectedLobId !== 'all' && item.lobId !== selectedLobId) return false;
        return true;
      }
      // Scoped user:
      return item.clientId === effectiveUser.scope.clientId && item.lobId === effectiveUser.scope.lobId;
    });
  }, [updates, effectiveUser, selectedClientId, selectedLobId]);

  const scopedAssessments = useMemo(() => {
    return assessments.filter((item) => {
      if (effectiveUser.role === 'Super Admin') {
        if (selectedClientId !== 'all' && item.clientId !== selectedClientId) return false;
        if (selectedLobId !== 'all' && item.lobId !== selectedLobId) return false;
        return true;
      }
      return item.clientId === effectiveUser.scope.clientId && item.lobId === effectiveUser.scope.lobId;
    });
  }, [assessments, effectiveUser, selectedClientId, selectedLobId]);

  const scopedDocuments = useMemo(() => {
    return documents.filter((item) => {
      if (effectiveUser.role === 'Super Admin') {
        if (selectedClientId !== 'all' && item.clientId !== selectedClientId) return false;
        if (selectedLobId !== 'all' && item.lobId !== selectedLobId) return false;
        return true;
      }
      return item.clientId === effectiveUser.scope.clientId && item.lobId === effectiveUser.scope.lobId;
    });
  }, [documents, effectiveUser, selectedClientId, selectedLobId]);

  // Current scope label for topbar
  const currentScopeLabel = useMemo(() => {
    if (effectiveUser.role === 'Super Admin') {
      return selectedClientId === 'all'
        ? 'Global Scope (All Clients)'
        : `Filtered: ${clients.find((c) => c.id === selectedClientId)?.name || 'Client'}`;
    }
    return `${effectiveUser.scope.clientName} • ${effectiveUser.scope.lobName} • ${effectiveUser.scope.locationName}`;
  }, [effectiveUser, selectedClientId, clients]);

  // Update State Machine Actions
  const viewUpdate = (updateId: string) => {
    const key = `${effectiveUser.id}_${updateId}`;
    setUserProgress((prev) => {
      const current = prev[key] || {
        updateId,
        version: '1.0',
        state: 'NOT_STARTED',
        quizAttempts: [],
        attemptsRemaining: 3,
      };
      if (current.state === 'NOT_STARTED') {
        return {
          ...prev,
          [key]: {
            ...current,
            state: 'VIEWED',
            viewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
        };
      }
      return prev;
    });
  };

  const viewAttachment = (updateId: string, attachmentId: string) => {
    const key = `${effectiveUser.id}_${updateId}`;
    setUserProgress((prev) => {
      const current = prev[key] || {
        updateId,
        version: '1.0',
        state: 'NOT_STARTED',
        quizAttempts: [],
        attemptsRemaining: 3,
      };
      const newState = current.state === 'NOT_STARTED' || current.state === 'VIEWED' ? 'ATTACHMENT_VIEWED' : current.state;
      return {
        ...prev,
        [key]: {
          ...current,
          state: newState,
          attachmentViewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      };
    });
    logAuditEvent('VIEW_ATTACHMENT', `${updateId} - Attachment ${attachmentId}`, 'Agent opened required document attachment.');
  };

  const submitUpdateQuiz = (updateId: string, selectedAnswers: Record<string, string>) => {
    const targetUpdate = updates.find((u) => u.id === updateId);
    if (!targetUpdate || !targetUpdate.quiz) {
      return { passed: true, score: 100 };
    }

    const quiz = targetUpdate.quiz;
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionId) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = scorePercentage >= quiz.passingPercentage;
    const key = `${effectiveUser.id}_${updateId}`;

    setUserProgress((prev) => {
      const current = prev[key] || {
        updateId,
        version: targetUpdate.version,
        state: 'QUIZ_STARTED',
        quizAttempts: [],
        attemptsRemaining: quiz.attemptLimit,
      };

      const newAttempt = {
        attemptNumber: (current.quizAttempts?.length || 0) + 1,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        scorePercentage,
        correctCount,
        totalQuestions: quiz.questions.length,
        passed,
        selectedAnswers,
      };

      const remaining = Math.max(0, current.attemptsRemaining - 1);
      const nextState = passed ? 'ACKNOWLEDGED' : remaining > 0 ? 'QUIZ_STARTED' : 'FAILED';

      return {
        ...prev,
        [key]: {
          ...current,
          state: nextState,
          acknowledgedAt: passed ? new Date().toISOString().replace('T', ' ').substring(0, 16) : current.acknowledgedAt,
          quizAttempts: [...(current.quizAttempts || []), newAttempt],
          attemptsRemaining: remaining,
        },
      };
    });

    logAuditEvent(
      'QUIZ_ATTEMPT',
      `${updateId} Quiz`,
      `Score: ${scorePercentage}% (${passed ? 'PASSED' : 'FAILED'}), User: ${effectiveUser.name}`
    );

    return { passed, score: scorePercentage };
  };

  const acknowledgeUpdate = (updateId: string): boolean => {
    if (isImpersonating) {
      alert('Read-only Agent View: Impersonating administrators cannot acknowledge updates on behalf of agents.');
      return false;
    }

    const key = `${effectiveUser.id}_${updateId}`;
    const targetUpdate = updates.find((u) => u.id === updateId);
    if (!targetUpdate) return false;

    // Check if attachment was viewed
    const currentProgress = userProgress[key];
    if (!currentProgress || currentProgress.state === 'NOT_STARTED' || currentProgress.state === 'VIEWED') {
      alert('Mandatory Rule: You must view the required attachment before acknowledgement.');
      return false;
    }

    if (targetUpdate.requiresQuiz && targetUpdate.quiz) {
      // Must pass quiz
      const passedAttempt = currentProgress.quizAttempts?.find((a) => a.passed);
      if (!passedAttempt) {
        alert('This update requires passing the verification quiz before acknowledgement.');
        return false;
      }
    }

    setUserProgress((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        state: 'ACKNOWLEDGED',
        acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    }));

    logAuditEvent('ACKNOWLEDGE_UPDATE', updateId, `User ${effectiveUser.name} acknowledged update.`);
    return true;
  };

  // Admin: Publish Update
  const publishNewUpdate = (updateData: Omit<ProcessUpdate, 'id' | 'createdAt' | 'status'>) => {
    // Generate standardized ID: UPD-YYYYMMDD-CLIENT-LOB-SEQUENCE
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const clientCode = clients.find((c) => c.id === updateData.clientId)?.code || 'SYS';
    const lobShort = updateData.lobId.includes('int') ? 'INT' : updateData.lobId.includes('dom') ? 'DOM' : 'OPS';
    const seq = String(updates.length + 1).padStart(3, '0');
    const generatedId = `UPD-${yyyy}${mm}${dd}-${clientCode}-${lobShort}-${seq}`;

    const newUpdate: ProcessUpdate = {
      ...updateData,
      id: generatedId,
      status: 'Published',
      createdAt: `${yyyy}-${mm}-${dd} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`,
    };

    setUpdates((prev) => [newUpdate, ...prev]);

    // If this update replaces a version, reset progress for matching agents
    if (newUpdate.reacknowledgementRequiredOnVersionBump) {
      setUserProgress((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (k.endsWith(`_${generatedId}`)) {
            next[k] = {
              updateId: generatedId,
              version: newUpdate.version,
              state: 'NOT_STARTED',
              quizAttempts: [],
              attemptsRemaining: 3,
            };
          }
        });
        return next;
      });
    }

    // Notify agents
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Update: ${newUpdate.title}`,
      message: `${newUpdate.id} (${newUpdate.topic}) has been published. Due on ${newUpdate.dueDate}.`,
      type: 'update',
      createdAt: 'Just now',
      read: false,
      actionPath: 'updates',
    };
    setNotifications((prev) => [newNotification, ...prev]);

    logAuditEvent('PUBLISH_UPDATE', newUpdate.id, `Created & Published by ${loggedInUser.name}`);
    return newUpdate;
  };

  const archiveUpdate = (updateId: string) => {
    setUpdates((prev) =>
      prev.map((u) => (u.id === updateId ? { ...u, status: 'Archived' as const } : u))
    );
    logAuditEvent('ARCHIVE_UPDATE', updateId, 'Soft-archived update record.');
  };

  // Assessment Submissions
  const submitAssessment = (assessmentId: string, answers: Record<string, string>, timeSpentSeconds: number): AssessmentSubmission => {
    const targetAsm = assessments.find((a) => a.id === assessmentId);
    if (!targetAsm) throw new Error('Assessment not found');

    let totalScore = 0;
    let maxScore = 0;
    targetAsm.questions.forEach((q) => {
      maxScore += q.marks;
      if (answers[q.id] === q.correctOptionId) {
        totalScore += q.marks;
      }
    });

    const scorePercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
    const passed = scorePercentage >= targetAsm.passingPercentage;

    let certId: string | undefined = undefined;
    if (passed && targetAsm.eligibleForCertificate) {
      certId = `CERT-${targetAsm.id.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const newCert: Certificate = {
        id: certId,
        userId: effectiveUser.id,
        userName: effectiveUser.name,
        courseOrAssessmentTitle: targetAsm.title,
        score: scorePercentage,
        completionDate: new Date().toISOString().substring(0, 10),
        validUntil: '2027-09-06',
        verificationCode: `VER-${Math.floor(10000 + Math.random() * 90000)}-${effectiveUser.employeeId}`,
      };
      setCertificates((prev) => [newCert, ...prev]);
    }

    const newSub: AssessmentSubmission = {
      id: `sub-${Date.now()}`,
      assessmentId,
      userId: effectiveUser.id,
      userName: effectiveUser.name,
      attemptNumber: 1,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      scorePercentage,
      passed,
      answers,
      timeSpentSeconds,
      certificateId: certId,
    };

    setSubmissions((prev) => [newSub, ...prev]);

    logAuditEvent(
      'SUBMIT_ASSESSMENT',
      targetAsm.title,
      `User ${effectiveUser.name} scored ${scorePercentage}% (${passed ? 'PASSED' : 'FAILED'})`
    );

    return newSub;
  };

  const createAssessment = (assessmentData: Omit<Assessment, 'id'>) => {
    const newId = `asm-${Date.now()}`;
    const newAssessment: Assessment = {
      ...assessmentData,
      id: newId,
    };
    setAssessments((prev) => [newAssessment, ...prev]);
    logAuditEvent('CREATE_ASSESSMENT', newAssessment.title, `Assessment created by ${loggedInUser.name}`);
    return newAssessment;
  };

  const bulkUploadQuestionsToAssessment = (assessmentId: string, newQuestions: Assessment['questions']) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === assessmentId ? { ...a, questions: [...a.questions, ...newQuestions] } : a))
    );
    logAuditEvent('EXCEL_UPLOAD_QUESTIONS', assessmentId, `Imported ${newQuestions.length} questions via Excel validation.`);
  };

  // E-Learning
  const toggleModuleCompletion = (courseId: string, moduleId: string) => {
    setElearningCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          modules: c.modules.map((m) => (m.id === moduleId ? { ...m, completed: !m.completed } : m)),
        };
      })
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Users CRUD
  const addUser = (userData: Partial<User>) => {
    const newId = `usr-${Date.now()}`;
    const newUser: User = {
      id: newId,
      username: userData.username || `user.${Date.now().toString().slice(-4)}`,
      name: userData.name || 'New Staff Member',
      email: userData.email || 'user@example.com',
      phone: userData.phone || '+91 90000 00000',
      employeeId: userData.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      role: userData.role || 'Agent',
      scope: userData.scope || effectiveUser.scope,
      permissions: userData.permissions || {
        createUpdate: false,
        editUpdate: false,
        publishUpdate: false,
        createQuiz: false,
        createAssessment: false,
        viewReports: false,
        exportReports: false,
        manageUsers: false,
        manageClients: false,
        impersonateAgent: false,
        manageSettings: false,
        viewAuditLogs: false,
      },
      joiningDate: new Date().toISOString().substring(0, 10),
      status: 'Active',
      failedLoginAttempts: 0,
      isLocked: false,
      temporaryPassword: true,
    };
    setUsers((prev) => [newUser, ...prev]);
    logAuditEvent('CREATE_USER', `${newUser.name} (${newUser.role})`, `Account created with temporary password.`);
    return newUser;
  };

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
    logAuditEvent('UPDATE_USER_STATUS', userId, `Status set to ${status}`);
  };

  const bulkImportUsers = (newUsers: Partial<User>[]) => {
    const added: User[] = [];
    newUsers.forEach((u, i) => {
      added.push({
        id: `usr-bulk-${Date.now()}-${i}`,
        username: u.username || `bulk.user${i}`,
        name: u.name || `Bulk Agent ${i + 1}`,
        email: u.email || `agent${i}@abcglobal.com`,
        phone: u.phone || '+91 98000 11111',
        employeeId: u.employeeId || `EMP-${8000 + i}`,
        role: (u.role as Role) || 'Agent',
        scope: u.scope || effectiveUser.scope,
        permissions: {
          createUpdate: false,
          editUpdate: false,
          publishUpdate: false,
          createQuiz: false,
          createAssessment: false,
          viewReports: false,
          exportReports: false,
          manageUsers: false,
          manageClients: false,
          impersonateAgent: false,
          manageSettings: false,
          viewAuditLogs: false,
        },
        joiningDate: new Date().toISOString().substring(0, 10),
        status: 'Active',
        failedLoginAttempts: 0,
        isLocked: false,
      });
    });
    setUsers((prev) => [...added, ...prev]);
    logAuditEvent('BULK_USER_IMPORT', `${added.length} Users`, `Processed bulk Excel user creation.`);
    return { successCount: added.length, errors: [] };
  };

  // Client Management
  const addClient = (clientData: Omit<ClientEntity, 'id'>) => {
    const newClient: ClientEntity = {
      ...clientData,
      id: `client-${Date.now()}`,
    };
    setClients((prev) => [...prev, newClient]);
    logAuditEvent('CREATE_CLIENT', newClient.name, `New client entity added.`);
  };

  // Global Search across authorized entities
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { updates: [], documents: [], assessments: [] };
    }
    const q = searchQuery.toLowerCase();
    return {
      updates: scopedUpdates.filter(
        (u) =>
          u.id.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q) ||
          u.topic.toLowerCase().includes(q) ||
          u.category.toLowerCase().includes(q)
      ),
      documents: scopedDocuments.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.docCode.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q)
      ),
      assessments: scopedAssessments.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.folderPath.toLowerCase().includes(q)
      ),
    };
  }, [searchQuery, scopedUpdates, scopedDocuments, scopedAssessments]);

  return (
    <LmsContext.Provider
      value={{
        currentUser: effectiveUser,
        users: effectiveUser.role === 'Super Admin' ? users : users.filter((u) => u.scope.clientId === effectiveUser.scope.clientId),
        allUsers: users,
        setCurrentUserById,
        isImpersonating,
        impersonatedUser,
        startImpersonation,
        stopImpersonation,
        currentScopeLabel,
        clients,
        selectedClientId,
        setSelectedClientId,
        selectedLobId,
        setSelectedLobId,
        selectedLocationId,
        setSelectedLocationId,
        settings,
        updateSettings,
        activeSessions,
        logoutSession,
        logoutAllOtherSessions,
        updates: scopedUpdates,
        userProgress,
        viewUpdate,
        viewAttachment,
        submitUpdateQuiz,
        acknowledgeUpdate,
        publishNewUpdate,
        archiveUpdate,
        assessments: scopedAssessments,
        submissions,
        submitAssessment,
        createAssessment,
        bulkUploadQuestionsToAssessment,
        documents: scopedDocuments,
        elearningCourses,
        certificates: effectiveUser.role === 'Agent' ? certificates.filter((c) => c.userId === effectiveUser.id) : certificates,
        toggleModuleCompletion,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs: effectiveUser.role === 'Super Admin' ? auditLogs : auditLogs.filter((a) => a.scope.includes(effectiveUser.scope.clientName)),
        logAuditEvent,
        addUser,
        updateUserStatus,
        bulkImportUsers,
        addClient,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        searchResults,
        activeTab,
        setActiveTab,
        selectedUpdateId,
        setSelectedUpdateId,
        selectedAssessmentId,
        setSelectedAssessmentId,
        selectedDocId,
        setSelectedDocId,
        accessibilitySettings,
        updateAccessibilitySettings,
      }}
    >
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
