import React from 'react';
import { useLms } from '../../context/LmsContext';
import { LogOut, ShieldAlert } from 'lucide-react';

export const ImpersonationBanner: React.FC = () => {
  const { isImpersonating, impersonatedUser, stopImpersonation } = useLms();

  if (!isImpersonating || !impersonatedUser) return null;

  return (
    <div
      role="alert"
      id="impersonation-alert-banner"
      className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800/80 px-4 py-2.5 text-xs text-amber-950 dark:text-amber-100 flex items-center justify-between z-50 sticky top-0 shadow-2xs"
    >
      <div className="flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
        <span className="font-bold">
          Agent Impersonation Mode:
        </span>
        <span className="bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
          {impersonatedUser.name} ({impersonatedUser.employeeId})
        </span>
        <span className="hidden sm:inline text-amber-800/90 dark:text-amber-300 text-[11px]">
          • Read-only preview active. Mutation actions and quiz submissions are suppressed.
        </span>
      </div>
      <button
        id="btn-exit-impersonation"
        onClick={stopImpersonation}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 text-white dark:bg-amber-100 dark:text-amber-950 text-xs font-semibold rounded-md hover:bg-amber-950 dark:hover:bg-white transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-label="Exit Agent Impersonation and return to Admin view"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Return to Admin</span>
      </button>
    </div>
  );
};
