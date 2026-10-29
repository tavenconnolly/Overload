import React, { useState } from 'react';
import { WorkoutProvider } from './context/WorkoutContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutLogger } from './components/WorkoutLogger';
import { ProgressCharts } from './components/ProgressCharts';
import { WorkoutHistory } from './components/WorkoutHistory';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [selectedExerciseForGraph, setSelectedExerciseForGraph] = useState<string | undefined>(undefined);

  const handleSelectForProgress = (exerciseId: string) => {
    setSelectedExerciseForGraph(exerciseId);
    setActiveTab('progress');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header onSelectTab={setActiveTab} />

      {/* Main Tab Bar for Desktop */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-12 animate-in fade-in duration-200">
        {activeTab === 'log' && (
          <WorkoutLogger 
            onWorkoutSaved={() => setActiveTab('history')}
            onNavigateToExercises={() => setActiveTab('exercises')}
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseLibrary 
            onSelectForProgress={handleSelectForProgress}
            onAddExerciseToActiveWorkout={() => {
              setActiveTab('log');
            }}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressCharts 
            initialExerciseId={selectedExerciseForGraph}
            onLogWorkout={() => setActiveTab('log')}
          />
        )}

        {activeTab === 'history' && (
          <WorkoutHistory 
            onLogNewWorkout={() => setActiveTab('log')}
            onSelectExerciseForProgress={handleSelectForProgress}
          />
        )}
      </main>
    </div>
  );
};

export function App() {
  return (
    <WorkoutProvider>
      <MainApp />
    </WorkoutProvider>
  );
}

export default App;

