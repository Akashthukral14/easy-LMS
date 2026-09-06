import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Sun,
  Moon,
  Eye,
  LayoutGrid,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    accessibilitySettings,
    updateAccessibilitySettings,
    currentUser,
  } = useLms();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Accessibility Preferences & Theme Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customized display readability, plain monochrome theme modes, font sizing, and visual density
        </p>
      </div>

      {/* Accessibility & Visual Contrast Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-6 space-y-6 text-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span>Visual Accessibility & Theme Controls</span>
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
            Compliant with WCAG AA standards and Professional Polish design guidelines
          </p>
        </div>

        {/* Theme Mode & Density & Text Sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="font-semibold block text-slate-800 dark:text-slate-200 mb-2">
              Color Palette Theme
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => updateAccessibilitySettings({ theme: 'light' })}
                className={`p-3 border rounded-lg text-left flex items-center gap-2 transition-colors shadow-2xs ${
                  accessibilitySettings.theme === 'light'
                    ? 'border-slate-800 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 ring-1 ring-slate-800'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Light</div>
                  <div className="text-[10px] text-slate-400">Crisp Canvas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateAccessibilitySettings({ theme: 'dark' })}
                className={`p-3 border rounded-lg text-left flex items-center gap-2 transition-colors shadow-2xs ${
                  accessibilitySettings.theme === 'dark'
                    ? 'border-slate-100 bg-slate-800 text-white font-bold ring-1 ring-slate-100'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Dark</div>
                  <div className="text-[10px] text-slate-400">Deep Slate</div>
                </div>
              </button>
            </div>
          </div>

          {/* Density */}
          <div>
            <label className="font-semibold block text-slate-800 dark:text-slate-200 mb-2">
              Information Density
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => updateAccessibilitySettings({ density: 'comfortable' })}
                className={`p-3 border rounded-lg text-left flex items-center gap-2 transition-colors shadow-2xs ${
                  accessibilitySettings.density === 'comfortable'
                    ? 'border-slate-800 dark:border-slate-100 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 ring-1 ring-slate-800 dark:ring-slate-100'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Standard</div>
                  <div className="text-[10px] text-slate-400">Default</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateAccessibilitySettings({ density: 'compact' })}
                className={`p-3 border rounded-lg text-left flex items-center gap-2 transition-colors shadow-2xs ${
                  accessibilitySettings.density === 'compact'
                    ? 'border-slate-800 dark:border-slate-100 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 ring-1 ring-slate-800 dark:ring-slate-100'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Compact</div>
                  <div className="text-[10px] text-slate-400">High Density</div>
                </div>
              </button>
            </div>
          </div>

          {/* Text Sizing Option */}
          <div>
            <label className="font-semibold block text-slate-800 dark:text-slate-200 mb-2">
              Text Sizing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: '100%', sub: 'Default' },
                { id: 'large', label: '115%', sub: 'Medium' },
                { id: 'xlarge', label: '130%', sub: 'Large' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateAccessibilitySettings({ textSize: s.id as any })}
                  className={`p-2.5 border rounded-lg text-center transition-colors shadow-2xs ${
                    accessibilitySettings.textSize === s.id
                      ? 'border-slate-800 dark:border-slate-100 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 ring-1 ring-slate-800 dark:ring-slate-100'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{s.label}</div>
                  <div className="text-[10px] text-slate-400">{s.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Accessibility Toggles */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-750 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                High Contrast Border Mode
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Enhances stroke contrast on buttons, borders, and input focus rings
              </span>
            </div>
            <input
              type="checkbox"
              checked={accessibilitySettings.highContrast}
              onChange={(e) =>
                updateAccessibilitySettings({ highContrast: e.target.checked })
              }
              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 border-slate-300 dark:border-slate-600"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-750 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Reduced Motion & Animation Suppression
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Suppresses spring animations and animated transitions for motion sensitivity
              </span>
            </div>
            <input
              type="checkbox"
              checked={accessibilitySettings.reducedMotion}
              onChange={(e) =>
                updateAccessibilitySettings({ reducedMotion: e.target.checked })
              }
              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 border-slate-300 dark:border-slate-600"
            />
          </label>
        </div>
      </div>

      {/* Account & Profile Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-6 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          User Identity & Session Metadata
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">User Name</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {currentUser.name}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">Role Tier</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {currentUser.role}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">Assigned Scope</span>
            <span className="text-slate-800 dark:text-slate-200">
              {currentUser.scope.clientName} &gt; {currentUser.scope.lobName}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-sans">Employee ID</span>
            <span className="text-slate-800 dark:text-slate-200">
              {currentUser.employeeId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
