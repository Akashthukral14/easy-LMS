import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  FilePlus2,
  CheckSquare,
  GraduationCap,
  FolderArchive,
  BarChart3,
  Users,
  Building2,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  X,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: ('Agent' | 'Admin' | 'Super Admin' | 'Client Admin' | 'LOB Admin' | 'Location Admin' | 'Trainer' | 'Team Leader' | 'Quality Analyst')[];
  badge?: number;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed: propCollapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    settings,
    updateSettings,
    updates,
    userProgress,
  } = useLms();

  const isCollapsed = propCollapsed !== undefined
    ? propCollapsed
    : settings.sidebarState === 'collapsed';

  // Compute pending updates count for badge
  const pendingUpdatesCount = updates.filter((u) => {
    const key = `${currentUser.id}_${u.id}`;
    const p = userProgress[key];
    return !p || p.state !== 'ACKNOWLEDGED';
  }).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Agent', 'Admin', 'Super Admin', 'Client Admin', 'LOB Admin', 'Location Admin', 'Trainer', 'Team Leader', 'Quality Analyst'],
    },
    {
      id: 'updates',
      label: 'Process Updates',
      icon: FileText,
      roles: ['Agent', 'Admin', 'Super Admin', 'Client Admin', 'LOB Admin', 'Location Admin', 'Trainer', 'Team Leader', 'Quality Analyst'],
      badge: currentUser.role === 'Agent' ? pendingUpdatesCount : undefined,
    },
    {
      id: 'update_management',
      label: 'Update Authoring',
      icon: FilePlus2,
      roles: ['Admin', 'Super Admin', 'Client Admin', 'LOB Admin', 'Trainer', 'Quality Analyst'],
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: CheckSquare,
      roles: ['Agent', 'Admin', 'Super Admin', 'Client Admin', 'LOB Admin', 'Location Admin', 'Trainer', 'Team Leader', 'Quality Analyst'],
    },
    {
      id: 'elearning',
      label: 'E-Learning & Certs',
      icon: GraduationCap,
      roles: ['Agent', 'Admin', 'Super Admin', 'Client Admin', 'LOB Admin', 'Location Admin', 'Trainer', 'Team Leader', 'Quality Analyst'],
    },
    {
      id: 'documents',
      label: 'Document Library',
      icon: FolderArchive,
      roles: ['Agent', 'Admin', 'Super Admin', 'Client Admin', 'LOB Admin', 'Location Admin', 'Trainer', 'Team Leader', 'Quality Analyst'],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['Admin', 'Super Admin', 'Client Admin', 'LOB Admin', 'Team Leader', 'Quality Analyst'],
    },
    {
      id: 'users',
      label: 'User Directory',
      icon: Users,
      roles: ['Admin', 'Super Admin', 'Client Admin', 'LOB Admin'],
    },
    {
      id: 'client_management',
      label: 'Client Management',
      icon: Building2,
      roles: ['Super Admin', 'Client Admin'],
    },
    {
      id: 'audit_logs',
      label: 'Audit Trail',
      icon: ScrollText,
      roles: ['Super Admin', 'Admin', 'Client Admin'],
    },
    {
      id: 'settings',
      label: 'Accessibility Settings',
      icon: Settings,
      roles: ['Agent', 'Admin', 'Super Admin', 'Client Admin', 'LOB Admin', 'Location Admin', 'Trainer', 'Team Leader', 'Quality Analyst'],
    },
  ];

  // Filter items by current user role
  const visibleItems = navItems.filter((item) =>
    item.roles.some((r) => r === currentUser.role || (currentUser.role !== 'Agent' && r === 'Admin'))
  );

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      updateSettings({
        sidebarState: isCollapsed ? 'expanded' : 'collapsed',
      });
    }
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="main-sidebar"
        aria-label="Application Navigation"
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col shrink-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 shadow-sm ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Brand Header - Matching Professional Polish design */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center shrink-0 shadow-xs">
                <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
              </div>
              <div className="truncate">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 truncate block">
                  DOCUCORE
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block -mt-0.5 truncate">
                  Compliance LMS
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-8 mx-auto bg-slate-800 rounded flex items-center justify-center shrink-0 shadow-xs">
              <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle button */}
          <button
            id="btn-toggle-sidebar"
            onClick={handleToggle}
            aria-label={isCollapsed ? 'Expand navigation menu' : 'Collapse navigation menu'}
            title={isCollapsed ? 'Expand navigation menu' : 'Collapse navigation menu'}
            className={`hidden md:flex p-1.5 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 ${
              isCollapsed ? 'mx-auto mt-2' : ''
            }`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role & Scope Brief Banner (when expanded) */}
        {!isCollapsed && (
          <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {currentUser.role}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-medium">
              {currentUser.employeeId}
            </span>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main menu">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 ${
                  isActive
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {/* Polish indicator bullet */}
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                    isActive
                      ? 'bg-slate-800 dark:bg-slate-200'
                      : 'bg-transparent border border-slate-400'
                  }`}
                />

                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`} aria-hidden="true" />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Professional Polish Metric Widget (Storage/Compliance widget from Design HTML) */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-slate-800 text-white p-4 rounded-lg shadow-sm space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Compliance Index
              </p>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-1.5 rounded-full w-[94%]" />
              </div>
              <div className="flex items-center justify-between text-xs opacity-90 font-mono">
                <span>94% Target Met</span>
                <span className="text-[10px] text-blue-300">Audited</span>
              </div>
            </div>
          </div>
        )}

        {/* Minimal collapsed footer */}
        {isCollapsed && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
            <Layers className="w-4 h-4 mx-auto text-slate-400" />
          </div>
        )}
      </aside>
    </>
  );
};
