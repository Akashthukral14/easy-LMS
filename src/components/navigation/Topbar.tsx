import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Shield,
  ChevronDown,
  Building2,
  Check,
  Menu,
} from 'lucide-react';

interface TopbarProps {
  onOpenSearch?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSearch,
  onToggleMobileSidebar,
}) => {
  const {
    currentUser,
    allUsers,
    setCurrentUserById,
    currentScopeLabel,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    settings,
    updateSettings,
    setActiveTab,
    setIsSearchOpen,
  } = useLms();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showA11yMenu, setShowA11yMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenSearch = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <header
      id="main-topbar"
      className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 z-40 sticky top-0 shadow-xs"
    >
      {/* Skip link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 rounded-md text-sm font-semibold shadow-md outline-none ring-2 ring-slate-500"
      >
        Skip to main content
      </a>

      {/* Left: Mobile hamburger + Scope breadcrumb (matching Professional Polish design) */}
      <div className="flex items-center gap-3">
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileSidebar}
          aria-label="Open mobile navigation menu"
          className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Professional Polish Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <span
            onClick={() => setActiveTab('dashboard')}
            className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            {currentUser.role === 'Super Admin' ? 'Platform' : currentUser.scope.clientName}
          </span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span
            className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[220px] lg:max-w-md"
            title={currentScopeLabel}
          >
            {currentScopeLabel}
          </span>
        </div>
      </div>

      {/* Center: Global Search Trigger */}
      <div className="flex-1 max-w-md mx-2">
        <button
          id="btn-global-search-trigger"
          onClick={handleOpenSearch}
          aria-label="Search updates, documents, assessments, and quizzes"
          className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-slate-800 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search updates, SOPs, assessments...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600">
            /
          </kbd>
        </button>
      </div>

      {/* Right Actions: Role Switcher, Accessibility Menu, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Role / Switch User Popover - Secondary button style */}
        <div className="relative">
          <button
            id="btn-switch-user-role"
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
              setShowA11yMenu(false);
            }}
            aria-expanded={showRoleMenu}
            aria-haspopup="true"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span className="hidden md:inline font-semibold">{currentUser.role}:</span>
            <span className="truncate max-w-[90px]">{currentUser.name.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-2 z-50 text-xs"
              role="menu"
              aria-orientation="vertical"
            >
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Switch User / Scope</p>
                <p className="text-[11px] text-slate-500">Test role-based scope isolation & features</p>
              </div>
              <div className="space-y-1">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUserById(u.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{u.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {u.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{u.scope.clientName} • {u.scope.lobName}</div>
                    </div>
                    {currentUser.id === u.id && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accessibility Quick Menu */}
        <div className="relative">
          <button
            id="btn-accessibility-options"
            onClick={() => {
              setShowA11yMenu(!showA11yMenu);
              setShowRoleMenu(false);
              setShowNotifMenu(false);
            }}
            aria-label="Accessibility settings: contrast, text size, and density"
            title="Accessibility Controls"
            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {showA11yMenu && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-3 z-50 text-xs space-y-3"
              role="dialog"
              aria-label="Accessibility options"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Accessibility Preferences</p>
                <p className="text-[11px] text-slate-500">Theme mode & visual density controls</p>
              </div>

              {/* Theme Mode */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['light', 'dark', 'contrast'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className={`px-2 py-1 rounded text-xs capitalize border ${
                        settings.theme === t
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Sizing */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Text Sizing
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'normal', label: '100%' },
                    { id: 'large', label: '115%' },
                    { id: 'xlarge', label: '130%' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateSettings({ textSize: s.id as any })}
                      className={`px-2 py-1 rounded text-xs border ${
                        settings.textSize === s.id
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interface Density */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Interface Density
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => updateSettings({ density: d })}
                      className={`px-2 py-1 rounded text-xs capitalize border ${
                        settings.density === d
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            id="btn-topbar-notifications"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
              setShowA11yMenu(false);
            }}
            aria-label={`Notifications: ${unreadCount} unread`}
            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 relative shadow-xs focus-visible:ring-2 focus-visible:ring-slate-800"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifMenu && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-2 z-50 text-xs"
              role="dialog"
              aria-label="Notifications panel"
            >
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 dark:text-blue-400 underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-slate-400">No notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.actionPath) {
                          setActiveTab(n.actionPath);
                          setShowNotifMenu(false);
                        }
                      }}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        !n.read
                          ? 'bg-slate-100 dark:bg-slate-800 font-medium'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{n.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Trigger - Blue badge avatar from Professional Polish design */}
        <button
          id="btn-user-profile-trigger"
          onClick={() => setActiveTab('settings')}
          title="Open Profile & Settings"
          aria-label="Open Profile & Settings"
          className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs hover:ring-slate-400 transition-all focus-visible:ring-2 focus-visible:ring-slate-800"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
