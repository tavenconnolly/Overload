import React from 'react';
import { Dumbbell, Layers, LineChart, History } from 'lucide-react';

export type TabType = 'log' | 'exercises' | 'progress' | 'history';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'log' as TabType, label: 'Log Workout', icon: Dumbbell },
    { id: 'exercises' as TabType, label: 'Exercises', icon: Layers },
    { id: 'progress' as TabType, label: 'Progress Graphs', icon: LineChart },
    { id: 'history' as TabType, label: 'History', icon: History },
  ];

  return (
    <>
      {/* Desktop / Tablet top tab bar */}
      <nav className="hidden md:flex items-center justify-center gap-2 max-w-5xl mx-auto px-4 pt-4">
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 pb-safe">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs transition ${
                  isActive
                    ? 'text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition ${
                    isActive ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {tab.id === 'progress' ? 'Graphs' : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

