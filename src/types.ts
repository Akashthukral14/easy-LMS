export type Role =
  | 'Super Admin'
  | 'Client Admin'
  | 'LOB Admin'
  | 'Location Admin'
  | 'Trainer'
  | 'Team Leader'
  | 'Quality Analyst'
  | 'Agent'
  | 'Admin';

export interface LineOfBusiness {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  lobs: LineOfBusiness[];
  locations: Location[];
}

export type UserStatus = 'Active' | 'Inactive' | 'Locked' | 'Suspended' | 'Archived';

export interface UserScope {
  clientId: string;
  clientName: string;
  lobId: string;
  lobName: string;
  locationId: string;
  locationName: string;
}

export interface GranularPermissions {
  createUpdate: boolean;
  editUpdate: boolean;
  publishUpdate: boolean;
  createQuiz: boolean;
  createAssessment: boolean;
  viewReports: boolean;
  exportReports: boolean;
  manageUsers: boolean;
  manageClients: boolean;
  impersonateAgent: boolean;
  manageSettings: boolean;
  viewAuditLogs: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  role: Role;
  scope: UserScope;
  permissions: GranularPermissions;
  joiningDate: string;
  status: UserStatus;
  failedLoginAttempts: number;
  isLocked: boolean;
  lockExpiry?: string;
  temporaryPassword?: boolean;
  avatarUrl?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'contrast';
  accentColor: 'charcoal' | 'navy' | 'emerald' | 'slate';
  density: 'compact' | 'comfortable' | 'spacious';
  textSize: 'normal' | 'large' | 'xlarge';
  sidebarState: 'expanded' | 'collapsed';
  animation: 'full' | 'reduced' | 'off';
  highContrast: boolean;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type UpdateStatus = 'Draft' | 'Review' | 'Approved' | 'Scheduled' | 'Published' | 'Expired' | 'Archived';

export type AgentUpdateState = 
  | 'NOT_STARTED'
  | 'VIEWED'
  | 'ATTACHMENT_VIEWED'
  | 'QUIZ_STARTED'
  | 'ACKNOWLEDGED'
  | 'FAILED';

export interface Attachment {
  id: string;
  name: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'MP4' | 'PNG';
  size: string;
  url: string;
  requiredToView: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; label: string; text: string }[];
  correctOptionId: string;
  marks: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  passingPercentage: number;
  timeLimitMinutes: number;
  attemptLimit: number;
  randomizeQuestions: boolean;
  showAnswersAfterSubmission: boolean;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  attemptNumber: number;
  timestamp: string;
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  selectedAnswers: Record<string, string>; // questionId -> optionId
}

export interface ProcessUpdate {
  id: string; // e.g., UPD-20260906-ABC-INT-001
  topic: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  clientId: string;
  lobId: string;
  locationId: string;
  version: string;
  effectiveDate: string;
  dueDate: string;
  expiryDate: string;
  status: UpdateStatus;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  attachments: Attachment[];
  quiz?: Quiz;
  requiresQuiz: boolean;
  reacknowledgementRequiredOnVersionBump: boolean;
}

export interface AgentUpdateProgress {
  updateId: string;
  version: string;
  state: AgentUpdateState;
  viewedAt?: string;
  attachmentViewedAt?: string;
  acknowledgedAt?: string;
  quizAttempts: QuizAttempt[];
  attemptsRemaining: number;
}

export type AssessmentStatus = 'Draft' | 'Scheduled' | 'Published' | 'Active' | 'Expired' | 'Archived';

export interface Assessment {
  id: string;
  title: string;
  folderPath: string; // e.g. "Monthly Assessment", "Compliance", "Product"
  category: string;
  clientId: string;
  lobId: string;
  locationId: string;
  description: string;
  startDate: string;
  endDate: string;
  timeLimitMinutes: number;
  passingPercentage: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showAnswerVisibility: boolean;
  passMessage: string;
  failMessage: string;
  status: AssessmentStatus;
  questions: QuizQuestion[];
  eligibleForCertificate: boolean;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  attemptNumber: number;
  submittedAt: string;
  scorePercentage: number;
  passed: boolean;
  answers: Record<string, string>;
  timeSpentSeconds: number;
  certificateId?: string;
}

export type DocumentCategory = 
  | 'SOP' 
  | 'Work Instructions' 
  | 'Policies' 
  | 'FAQs' 
  | 'Escalation Matrix' 
  | 'Process Flow' 
  | 'Reference Material';

export interface ProcessDocument {
  id: string;
  title: string;
  docCode: string;
  category: DocumentCategory;
  clientId: string;
  lobId: string;
  locationId: string;
  currentVersion: string;
  effectiveDate: string;
  expiryDate: string;
  owner: string;
  summary: string;
  content: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX';
  fileSize: string;
  downloadRestricted: boolean;
  versions: {
    version: string;
    releasedDate: string;
    author: string;
    changeSummary: string;
  }[];
}

export interface ELearningCourse {
  id: string;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  modulesCount: number;
  clientId: string;
  lobId: string;
  modules: {
    id: string;
    title: string;
    type: 'video' | 'text' | 'interactive';
    duration: string;
    content: string;
    videoUrl?: string;
    completed: boolean;
  }[];
  certificateEligible: boolean;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseOrAssessmentTitle: string;
  score: number;
  completionDate: string;
  validUntil: string;
  verificationCode: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'assessment' | 'reminder' | 'compliance' | 'certificate';
  createdAt: string;
  read: boolean;
  actionPath?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  target: string;
  scope: string;
  ip: string;
  metadata?: string;
}

export interface ClientEntity {
  id: string;
  name: string;
  code: string;
  status: 'Active' | 'Archived';
  effectiveDate: string;
  contactEmail: string;
  lobs: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}
