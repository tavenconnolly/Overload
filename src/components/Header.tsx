import React, { useState, useRef } from 'react';
import { Dumbbell, Settings, Timer, Download, Upload, Sparkles, Trash2, X, Check } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { RestTimer } from './RestTimer';

interface HeaderProps {
  onSelectTab: (tab: 'log' | 'exercises' | 'progress' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectTab }) => {
  const { unit, setUnit, exportData, importData, loadSampleData, clearAllData, workouts } = useWorkout();
  const [showSettings, setShowSettings] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overload-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Workout data exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        showToast('Backup restored successfully!');
        setShowSettings(false);
      } else {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    if (workouts.length > 0) {
      if (!confirm('This will load 4 progressive push day sessions to preview graphs and overload cues. Existing data will be preserved or merged. Continue?')) {
        return;
      }
    }
    loadSampleData();
    showToast('Loaded progressive overload sample workouts!');
    setShowSettings(false);
    onSelectTab('progress');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all workouts and restore default exercises? This cannot be undone.')) {
      clearAllData();
      showToast('All workout logs cleared.');
      setShowSettings(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div 
            onClick={() => onSelectTab('log')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
              <Dumbbell size={20} className="transform -rotate-45" />
            </div>
            <div>
              <span className="font-black tracking-wider text-lg bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
                OVERLOAD
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/50">
                PRO
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rest Timer Button */}
            <button
              onClick={() => setShowTimer(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold transition"
              title="Rest Timer"
            >
              <Timer size={16} className="text-blue-400" />
              <span className="hidden xs:inline">Rest</span>
            </button>

            {/* LBS / KG Toggle */}
            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setUnit('lbs')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  unit === 'lbs'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                lbs
              </button>
              <button
                onClick={() => setUnit('kg')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  unit === 'kg'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                kg
              </button>
            </div>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition"
              title="Settings & Data"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Rest timer modal */}
      <RestTimer isOpen={showTimer} onClose={() => setShowTimer(false)} />

      {/* Settings / Data Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Settings size={20} className="text-blue-400" />
              Tracker Settings & Data
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Manage your local progressive overload logs, backups, and preferences.
            </p>

            <div className="space-y-3">
              {/* Load Sample Data */}
              <button
                onClick={handleLoadSample}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 hover:from-blue-900/50 hover:to-indigo-900/50 border border-blue-700/40 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Load Demo Progression Data</div>
                    <div className="text-xs text-slate-400">Instantly test 4 weeks of bench, incline & OHP charts</div>
                  </div>
                </div>
              </button>

              {/* Export JSON */}
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
                    <Download size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Export Backup (JSON)</div>
                    <div className="text-xs text-slate-400">Download your logs to keep them safe</div>
                  </div>
                </div>
              </button>

              {/* Import JSON */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
                    <Upload size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Import Backup (JSON)</div>
                    <div className="text-xs text-slate-400">Restore your saved workouts from a file</div>
                  </div>
                </div>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />

              {/* Reset Data */}
              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-800/30 text-left transition mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600/20 text-red-400 rounded-lg">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-red-400">Clear All Workouts</div>
                    <div className="text-xs text-slate-500">Reset logs back to an empty slate</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};

