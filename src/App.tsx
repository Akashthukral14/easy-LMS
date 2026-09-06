import React, { useState } from 'react';
import { LmsProvider, useLms } from './context/LmsContext';
import { Sidebar } from './components/navigation/Sidebar';
import { Topbar } from './components/navigation/Topbar';
import { ImpersonationBanner } from './components/modals/ImpersonationBanner';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';

// Views
import { AgentDashboard } from './components/dashboard/AgentDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { UpdatesView } from './components/updates/UpdatesView';
import { UpdateManagementView } from './components/updates/UpdateManagementView';
import { AssessmentsView } from './components/assessments/AssessmentsView';
import { DocumentsView } from './components/documents/DocumentsView';
import { ELearningView } from './components/elearning/ELearningView';
import { UserManagementView } from './components/users/UserManagementView';
import { ClientManagementView } from './components/clients/ClientManagementView';
import { AnalyticsReportsView } from './components/analytics/AnalyticsReportsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SettingsView } from './components/settings/SettingsView';

const AppLayout: React.FC = () => {
  const {
    activeTab,
    currentUser,
    accessibilitySettings,
    selectedUpdateId,
    selectedAssessmentId,
    selectedDocId,
    setSelectedUpdateId,
    setSelectedAssessmentId,
    setSelectedDocId,
  } = useLms();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Render view corresponding to activeTab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'Super Admin') {
          return <SuperAdminDashboard />;
        }
        if (currentUser.role === 'Agent') {
          return <AgentDashboard />;
        }
        return <AdminDashboard />;

      case 'updates':
        return (
          <UpdatesView
            selectedUpdateId={selectedUpdateId}
            onClearSelection={() => setSelectedUpdateId(null)}
          />
        );

      case 'update_management':
        return <UpdateManagementView />;

      case 'assessments':
        return (
          <AssessmentsView
            selectedAssessmentId={selectedAssessmentId}
            onClearSelection={() => setSelectedAssessmentId(null)}
          />
        );

      case 'documents':
        return (
          <DocumentsView
            selectedDocId={selectedDocId}
            onClearSelection={() => setSelectedDocId(null)}
          />
        );

      case 'elearning':
        return <ELearningView />;

      case 'users':
        return <UserManagementView />;

      case 'client_management':
        return <ClientManagementView />;

      case 'reports':
        return <AnalyticsReportsView />;

      case 'audit_logs':
        return <AuditLogsView />;

      case 'settings':
        return <SettingsView />;

      default:
        return currentUser.role === 'Agent' ? <AgentDashboard /> : <AdminDashboard />;
    }
  };

  const densityClass =
    accessibilitySettings.density === 'compact' ? 'text-xs' : 'text-sm';
  const contrastClass = accessibilitySettings.highContrast ? 'high-contrast' : '';

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-800 selection:text-white dark:selection:bg-slate-200 dark:selection:text-slate-900 ${densityClass} ${contrastClass}`}
    >
      {/* Impersonation Banner if in agent view */}
      <ImpersonationBanner />

      {/* Top Bar with scope breadcrumb & search */}
      <Topbar
        onToggleMobileSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Minimalist Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Scrollable Main Content Area with accessibility anchor */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all focus:outline-none"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <LmsProvider>
      <AppLayout />
    </LmsProvider>
  );
}
