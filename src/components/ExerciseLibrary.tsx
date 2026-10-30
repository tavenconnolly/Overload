import React, { useState, useMemo } from 'react';
import { Plus, Search, Dumbbell, LineChart, Trash2, X, Check, Filter, Pencil, FileText } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { Exercise, MuscleGroup } from '../types';
import { MUSCLE_GROUPS } from '../data/defaultExercises';

interface ExerciseLibraryProps {
  onSelectForProgress?: (exerciseId: string) => void;
  onAddExerciseToActiveWorkout?: (exerciseId: string) => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onSelectForProgress,
  onAddExerciseToActiveWorkout,
}) => {
  const { exercises, addExercise, updateExercise, deleteExercise, getExerciseHistory } = useWorkout();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding custom exercise
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState<MuscleGroup>('Chest');
  const [newExerciseNotes, setNewExerciseNotes] = useState('');

  // Form states for editing custom exercise
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editName, setEditName] = useState('');
  const [editMuscle, setEditMuscle] = useState<MuscleGroup>('Chest');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditName(exercise.name);
    setEditMuscle(exercise.muscleGroup);
    setEditNotes(exercise.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise || !editName.trim()) return;

    updateExercise(editingExercise.id, {
      name: editName.trim(),
      muscleGroup: editMuscle,
      notes: editNotes.trim() || undefined,
    });
    setEditingExercise(null);
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
      const matchesQuery = ex.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesMuscle && matchesQuery;
    });
  }, [exercises, selectedMuscle, searchQuery]);

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;

    addExercise(newExerciseName.trim(), newExerciseMuscle, newExerciseNotes.trim() || undefined);
    setNewExerciseName('');
    setNewExerciseNotes('');
    setShowAddModal(false);
  };

  const getMuscleBadgeColor = (group: MuscleGroup) => {
    switch (group) {
      case 'Chest':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      case 'Back':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Shoulders':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'Quads':
      case 'Hamstrings & Glutes':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'Biceps':
      case 'Triceps':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      case 'Calves':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      case 'Core':
        return 'bg-orange-950/80 text-orange-300 border-orange-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Exercise action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="text-blue-500" size={24} />
            Exercise Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Categorized exercises with history and progressive overload targets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Add Custom Exercise</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises (e.g. Bench Press, Squat, Lat Pulldown)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Muscle group category filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedMuscle('All')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap border transition ${
              selectedMuscle === 'All'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            All Muscle Groups ({exercises.length})
          </button>
          {MUSCLE_GROUPS.map((group) => {
            const count = exercises.filter((e) => e.muscleGroup === group).length;
            const isSelected = selectedMuscle === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedMuscle(group)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap border transition ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {group} <span className="opacity-60 text-[11px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800/80">
            <Filter className="mx-auto text-slate-600 mb-3" size={32} />
            <h3 className="text-base font-semibold text-slate-300">No exercises found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or muscle filter, or create a custom exercise.
            </p>
          </div>
        ) : (
          filteredExercises.map((exercise) => {
            const history = getExerciseHistory(exercise.id);
            const totalSessions = history.length;
            const topWeight = history.length > 0 ? Math.max(...history.map((h) => h.topWeight)) : 0;

            return (
              <div
                key={exercise.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition leading-snug">
                      {exercise.name}
                    </h3>
                    {exercise.isCustom && (
                      <span className="text-[10px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-800/60 px-2 py-0.5 rounded-md shrink-0">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${getMuscleBadgeColor(
                        exercise.muscleGroup
                      )}`}
                    >
                      {exercise.muscleGroup}
                    </span>

                    {totalSessions > 0 ? (
                      <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-700/50">
                        Best: <strong className="text-slate-200">{topWeight}</strong> | {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No logs yet</span>
                    )}
                  </div>

                  {exercise.notes && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-300/90 bg-amber-950/20 border border-amber-900/40 px-2.5 py-1.5 rounded-xl mb-3">
                      <FileText size={13} className="text-amber-400 mt-0.5 shrink-0" />
                      <span className="italic">"{exercise.notes}"</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-2">
                  <div className="flex items-center gap-1.5">
                    {onSelectForProgress && (
                      <button
                        onClick={() => onSelectForProgress(exercise.id)}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/40 px-2.5 py-1.5 rounded-lg border border-blue-800/40 font-medium transition"
                        title="View Progress Chart"
                      >
                        <LineChart size={14} />
                        <span>View Graph</span>
                      </button>
                    )}

                    {onAddExerciseToActiveWorkout && (
                      <button
                        onClick={() => onAddExerciseToActiveWorkout(exercise.id)}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 px-2.5 py-1.5 rounded-lg border border-emerald-800/40 font-medium transition"
                      >
                        <Plus size={14} />
                        <span>Add to Workout</span>
                      </button>
                    )}
                  </div>

                  {exercise.isCustom && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(exercise)}
                        className="text-slate-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-950/30 transition"
                        title="Edit custom exercise & setup notes"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete custom exercise "${exercise.name}"?`)) {
                            deleteExercise(exercise.id);
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/20 transition"
                        title="Delete custom exercise"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Plus size={20} className="text-blue-400" />
              Add Custom Exercise
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Add any unique exercise variation to track progressive overload.
            </p>

            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Smith Machine Press"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Target Muscle Group *
                </label>
                <select
                  value={newExerciseMuscle}
                  onChange={(e) => setNewExerciseMuscle(e.target.value as MuscleGroup)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                >
                  {MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-400" />
                  <span>Exercise Setup Notes & Cues (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pin on setting 5, 30 degree incline, slow 3s eccentric"
                  value={newExerciseNotes}
                  onChange={(e) => setNewExerciseNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newExerciseName.trim()}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  <Check size={16} />
                  <span>Save Exercise</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Custom Exercise Modal */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingExercise(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Pencil size={20} className="text-blue-400" />
              Edit Custom Exercise
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Update the name, category, or personal setup notes/cues for this exercise.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Smith Machine Press"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Target Muscle Group *
                </label>
                <select
                  value={editMuscle}
                  onChange={(e) => setEditMuscle(e.target.value as MuscleGroup)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                >
                  {MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-400" />
                  <span>Exercise Setup Notes & Cues (Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Seat pin setting 4, bench at 30 degrees, slow 3s eccentric, focus on chest stretch"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editName.trim()}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  <Check size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

