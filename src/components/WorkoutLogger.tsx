import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  TrendingUp,
  X,
  Dumbbell,
  CheckCircle2,
  Layers,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { LoggedExercise, ExerciseSet, MuscleGroup } from '../types';
import { MUSCLE_GROUPS } from '../data/defaultExercises';

interface WorkoutLoggerProps {
  onWorkoutSaved: () => void;
  onOpenRestTimer?: () => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ 
  onWorkoutSaved,
}) => {
  const { 
    exercises, 
    unit, 
    saveWorkout, 
    getLastLogForExercise, 
    getExerciseById,
    activeDraft,
    updateActiveDraft,
    clearActiveDraft,
    addExercise
  } = useWorkout();

  // Active workout state directly connected to persistent activeDraft in localStorage
  const workoutTitle = activeDraft.title;
  const setWorkoutTitle = (val: string) => updateActiveDraft({ title: val });

  const workoutDate = activeDraft.date;
  const setWorkoutDate = (val: string) => updateActiveDraft({ date: val });

  const workoutNotes = activeDraft.notes;
  const setWorkoutNotes = (val: string) => updateActiveDraft({ notes: val });

  const loggedExercises = activeDraft.exercises;
  const setLoggedExercises = (
    updater: LoggedExercise[] | ((prev: LoggedExercise[]) => LoggedExercise[])
  ) => {
    updateActiveDraft((prev) => {
      const nextExercises = typeof updater === 'function' ? updater(prev.exercises) : updater;
      return { ...prev, exercises: nextExercises };
    });
  };

  // Modal for adding exercise to current workout
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'All'>('All');

  // Inline custom exercise creation state inside the modal
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');
  const [customNotes, setCustomNotes] = useState('');

  const handleCreateAndAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customName.trim()) return;

    const newEx = addExercise(customName.trim(), customMuscle, customNotes.trim() || undefined);
    handleAddExerciseToWorkout(newEx.id);
    setIsCreatingCustom(false);
    setCustomName('');
    setCustomNotes('');
    setShowAddExerciseModal(false);
  };

  // Success celebration state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Helper to get ordinal (1st, 2nd, 3rd, 4th...)
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Add exercise to active session
  const handleAddExerciseToWorkout = (exerciseId: string) => {
    // Check if previous log exists to intelligently prefill or recommend baseline
    const lastLog = getLastLogForExercise(exerciseId);
    
    // Create initial sets (default to 3 sets or whatever last session had)
    const initialSets: ExerciseSet[] = [];
    const setsToCreate = lastLog?.loggedExercise.sets.length || 3;

    for (let i = 1; i <= Math.min(setsToCreate, 4); i++) {
      initialSets.push({
        id: `set-${Date.now()}-${i}`,
        setNumber: i,
        weight: 0,
        reps: 0,
        completed: false,
      });
    }

    const newLoggedExercise: LoggedExercise = {
      id: `logged-ex-${Date.now()}`,
      exerciseId,
      order: loggedExercises.length + 1,
      sets: initialSets,
    };

    setLoggedExercises((prev) => [...prev, newLoggedExercise]);
    setShowAddExerciseModal(false);
  };

  // Reorder exercises (move up/down)
  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === loggedExercises.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...loggedExercises];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    // Re-assign order numbers 1, 2, 3...
    const reordered = updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setLoggedExercises(reordered);
  };

  // Remove exercise from active workout
  const removeExercise = (index: number) => {
    const updated = loggedExercises.filter((_, idx) => idx !== index);
    const reordered = updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setLoggedExercises(reordered);
  };

  // Set management
  const addSet = (exerciseIndex: number) => {
    setLoggedExercises((prev) => {
      const updated = [...prev];
      const target = { ...updated[exerciseIndex] };
      const newSetNumber = target.sets.length + 1;

      target.sets = [
        ...target.sets,
        {
          id: `set-${Date.now()}-${newSetNumber}`,
          setNumber: newSetNumber,
          weight: 0,
          reps: 0,
          completed: false,
        },
      ];

      updated[exerciseIndex] = target;
      return updated;
    });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setLoggedExercises((prev) => {
      const updated = [...prev];
      const target = { ...updated[exerciseIndex] };
      target.sets = target.sets
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      updated[exerciseIndex] = target;
      return updated;
    });
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'completed',
    value: any
  ) => {
    setLoggedExercises((prev) => {
      const updated = [...prev];
      const target = { ...updated[exerciseIndex] };
      const sets = [...target.sets];
      sets[setIndex] = {
        ...sets[setIndex],
        [field]: value,
      };
      target.sets = sets;
      updated[exerciseIndex] = target;
      return updated;
    });
  };

  // Save full workout
  const handleSaveWorkout = () => {
    if (loggedExercises.length === 0) {
      alert('Please add at least one exercise before saving!');
      return;
    }

    saveWorkout({
      title: workoutTitle.trim() || 'Workout Session',
      date: workoutDate,
      exercises: loggedExercises,
      notes: workoutNotes.trim() || undefined,
    });

    clearActiveDraft();
    setShowSuccessModal(true);
  };

  const handleFinishAndReset = () => {
    setShowSuccessModal(false);
    clearActiveDraft();
    onWorkoutSaved();
  };

  // Filter exercises for Add Modal
  const availableExercises = exercises.filter((ex) => {
    const matchesGroup = filterMuscle === 'All' || ex.muscleGroup === filterMuscle;
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase().trim());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Workout Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
              <Dumbbell size={16} />
              <span>Active Workout Session</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="Workout Name (e.g. Chest & Triceps)"
                className="text-xl sm:text-2xl font-black bg-transparent border-b border-dashed border-slate-700 hover:border-blue-500 focus:border-blue-500 text-white focus:outline-none transition pb-0.5"
              />

              <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                <Calendar size={16} className="text-slate-400" />
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Save Workout CTA */}
          <div className="flex items-center gap-2">
            {loggedExercises.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Discard current workout in progress?')) {
                    clearActiveDraft();
                  }
                }}
                className="text-xs text-slate-400 hover:text-red-400 px-3 py-2 rounded-xl transition"
              >
                Clear
              </button>
            )}

            <button
              onClick={handleSaveWorkout}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition transform active:scale-95"
            >
              <CheckCircle2 size={18} />
              <span>Finish & Save</span>
            </button>
          </div>
        </div>

        {/* Workout Quick Presets / Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 text-xs">
          <span className="text-slate-500 font-medium">Quick title:</span>
          {['Push Day', 'Pull Day', 'Leg Day', 'Chest & Arms', 'Upper Body', 'Full Body'].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setWorkoutTitle(tag)}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  workoutTitle === tag
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {tag}
              </button>
            )
          )}
        </div>

        {/* Optional session notes */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Add session notes (optional)..."
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Logged Exercises List */}
      <div className="space-y-5">
        {loggedExercises.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-800/80">
            <div className="w-14 h-14 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Dumbbell size={28} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Your workout is empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Add your first exercise to see what you lifted last session and target progressive overload.
            </p>
            <button
              onClick={() => setShowAddExerciseModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
            >
              <Plus size={16} />
              <span>Add Exercise to Workout</span>
            </button>
          </div>
        ) : (
          loggedExercises.map((loggedEx, exerciseIdx) => {
            const exerciseInfo = getExerciseById(loggedEx.exerciseId);
            const lastLog = getLastLogForExercise(loggedEx.exerciseId);

            return (
              <div
                key={loggedEx.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative transition"
              >
                {/* Exercise Header with Requirement 2 Order (1st, 2nd, 3rd) */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Order Badge (Requirement 2) */}
                    <div className="flex items-center gap-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                      <Layers size={13} />
                      <span>{getOrdinal(loggedEx.order)} Exercise</span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {exerciseInfo?.name || 'Exercise'}
                    </h2>

                    {exerciseInfo?.muscleGroup && (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                        {exerciseInfo.muscleGroup}
                      </span>
                    )}
                  </div>

                  {/* Order reorder arrows and delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveExercise(exerciseIdx, 'up')}
                      disabled={exerciseIdx === 0}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 rounded-lg transition"
                      title="Move exercise up in order"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => moveExercise(exerciseIdx, 'down')}
                      disabled={exerciseIdx === loggedExercises.length - 1}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 rounded-lg transition"
                      title="Move exercise down in order"
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button
                      onClick={() => removeExercise(exerciseIdx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition ml-1"
                      title="Remove exercise from workout"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Exercise Setup Notes / Form Cues if present */}
                {exerciseInfo?.notes && (
                  <div className="mb-3 px-3 py-2 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start gap-2 text-xs text-amber-300/90">
                    <FileText size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-amber-200">Notes / Setup:</strong> {exerciseInfo.notes}
                    </span>
                  </div>
                )}

                {/* Requirement 3: Progressive Overload Banner (Previous Log & Target to Beat) */}
                <div className="mb-4 p-3 bg-gradient-to-r from-slate-950 to-blue-950/20 border border-blue-900/30 rounded-xl">
                  {lastLog ? (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                          <TrendingUp size={14} />
                          Last Log ({new Date(lastLog.workout.date + 'T12:00:00').toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Order was {getOrdinal(lastLog.loggedExercise.order)}
                        </span>
                      </div>

                      {/* Previous Sets overview */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono">
                        {lastLog.loggedExercise.sets
                          .filter((s) => s.completed || s.weight > 0)
                          .map((prevSet) => (
                            <span
                              key={prevSet.id}
                              className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md"
                            >
                              S{prevSet.setNumber}: <strong className="text-white">{prevSet.weight}</strong> {unit} × <strong className="text-white">{prevSet.reps}</strong>
                            </span>
                          ))}
                      </div>

                      {/* Overload Target Cue */}
                      <div className="mt-2 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                        <Sparkles size={12} className="shrink-0" />
                        <span>
                          <strong>Progressive Overload Target:</strong> Add +1 rep or +5 {unit} compared to last session!
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <AlertCircle size={15} className="text-blue-400 shrink-0" />
                      <span>
                        <strong>First time logging:</strong> Enter your working sets today to establish your progressive overload baseline!
                      </span>
                    </div>
                  )}
                </div>

                {/* Set-by-Set Logging Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-2 w-12 text-center">Set</th>
                        <th className="py-2 px-2">Previous Log</th>
                        <th className="py-2 px-2">Weight ({unit})</th>
                        <th className="py-2 px-2">Reps</th>
                        <th className="py-2 px-2 text-center w-16">Done</th>
                        <th className="py-2 px-2 w-10 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loggedEx.sets.map((set, setIdx) => {
                        const prevSet = lastLog?.loggedExercise.sets[setIdx];

                        // Progressive overload comparison logic
                        let overloadBadge: React.ReactNode = null;
                        if (prevSet && set.completed) {
                          const weightDiff = (Number(set.weight) || 0) - (Number(prevSet.weight) || 0);
                          const repDiff = (Number(set.reps) || 0) - (Number(prevSet.reps) || 0);

                          if (weightDiff > 0) {
                            overloadBadge = (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded ml-1.5">
                                +{weightDiff} {unit} PR!
                              </span>
                            );
                          } else if (weightDiff === 0 && repDiff > 0) {
                            overloadBadge = (
                              <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.5 rounded ml-1.5">
                                +{repDiff} rep!
                              </span>
                            );
                          }
                        }

                        return (
                          <tr
                            key={set.id}
                            className={`transition ${
                              set.completed ? 'bg-blue-950/10' : 'hover:bg-slate-850/40'
                            }`}
                          >
                            {/* Set # */}
                            <td className="py-2 px-2 text-center font-bold text-slate-300">
                              {set.setNumber}
                            </td>

                            {/* Previous stat */}
                            <td className="py-2 px-2 text-slate-400 font-mono text-[11px]">
                              {prevSet ? (
                                <span>
                                  {prevSet.weight} × {prevSet.reps}
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>

                            {/* Weight input */}
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={set.weight === 0 ? '' : set.weight}
                                onChange={(e) =>
                                  updateSet(
                                    exerciseIdx,
                                    setIdx,
                                    'weight',
                                    e.target.value === '' ? 0 : Number(e.target.value)
                                  )
                                }
                                placeholder=""
                                className="w-20 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-center font-bold text-white text-sm focus:outline-none focus:border-blue-500 transition"
                              />
                            </td>

                            {/* Reps input */}
                            <td className="py-2 px-2">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={set.reps === 0 ? '' : set.reps}
                                  onChange={(e) =>
                                    updateSet(
                                      exerciseIdx,
                                      setIdx,
                                      'reps',
                                      e.target.value === '' ? 0 : Number(e.target.value)
                                    )
                                  }
                                  placeholder=""
                                  className="w-16 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-center font-bold text-white text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                                {overloadBadge}
                              </div>
                            </td>

                            {/* Done checkmark button */}
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() =>
                                  updateSet(exerciseIdx, setIdx, 'completed', !set.completed)
                                }
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition ${
                                  set.completed
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                                }`}
                                title="Mark set complete"
                              >
                                <Check size={16} className={set.completed ? 'stroke-[3]' : ''} />
                              </button>
                            </td>

                            {/* Delete set */}
                            <td className="py-2 px-2 text-right">
                              {loggedEx.sets.length > 1 && (
                                <button
                                  onClick={() => removeSet(exerciseIdx, setIdx)}
                                  className="text-slate-600 hover:text-red-400 p-1 rounded transition"
                                  title="Delete set"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add set button */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => addSet(exerciseIdx)}
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/30 hover:bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-800/40 font-semibold transition"
                  >
                    <Plus size={14} />
                    <span>Add Set</span>
                  </button>

                  <span className="text-[11px] text-slate-500 font-mono">
                    Total Volume:{' '}
                    <strong className="text-slate-300">
                      {loggedEx.sets
                        .filter((s) => s.completed || s.weight > 0)
                        .reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)}{' '}
                      {unit}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Add Exercise CTA button at bottom */}
        {loggedExercises.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setShowAddExerciseModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold text-xs px-4 py-3 rounded-xl transition shadow-md"
            >
              <Plus size={16} className="text-blue-400" />
              <span>Add Another Exercise ({getOrdinal(loggedExercises.length + 1)})</span>
            </button>

            <button
              onClick={handleSaveWorkout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition transform active:scale-95"
            >
              <CheckCircle2 size={18} />
              <span>Save & Complete Workout</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Exercise to Workout Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-blue-400" />
                {isCreatingCustom
                  ? 'Add Custom Exercise'
                  : `Select Exercise for #${loggedExercises.length + 1}`}
              </h3>
              <button
                onClick={() => {
                  setShowAddExerciseModal(false);
                  setIsCreatingCustom(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {isCreatingCustom ? (
              <form onSubmit={handleCreateAndAddCustom} className="py-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Incline Smith Machine Press"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Target Muscle Group *
                  </label>
                  <select
                    value={customMuscle}
                    onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
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
                    <FileText size={13} className="text-blue-400" />
                    <span>Setup Notes & Cues (Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Pin height 4, 30° bench incline, slow negative"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                  >
                    Back to List
                  </button>
                  <button
                    type="submit"
                    disabled={!customName.trim()}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
                  >
                    <Check size={16} />
                    <span>Save & Add to Workout</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Filter controls */}
                <div className="py-3 space-y-2.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search exercise..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />

                  {/* Muscle Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                    <button
                      onClick={() => setFilterMuscle('All')}
                      className={`px-2.5 py-1 rounded-lg border transition ${
                        filterMuscle === 'All'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {MUSCLE_GROUPS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setFilterMuscle(g)}
                        className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                          filterMuscle === g
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exercise list items */}
                <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 pr-1">
                  {availableExercises.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <p className="text-xs text-slate-400 mb-3">
                        No exercise found matching "{exerciseSearch}".
                      </p>
                      <button
                        onClick={() => {
                          setCustomName(exerciseSearch.trim());
                          setCustomMuscle(filterMuscle !== 'All' ? filterMuscle : 'Chest');
                          setIsCreatingCustom(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md"
                      >
                        <Plus size={15} />
                        <span>Create "{exerciseSearch.trim() || 'Custom'}" & Add</span>
                      </button>
                    </div>
                  ) : (
                    availableExercises.map((ex) => {
                      const lastLog = getLastLogForExercise(ex.id);
                      return (
                        <button
                          key={ex.id}
                          onClick={() => handleAddExerciseToWorkout(ex.id)}
                          className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-800/60 transition flex items-center justify-between group"
                        >
                          <div>
                            <div className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition">
                              {ex.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              <span>{ex.muscleGroup}</span>
                              {lastLog && (
                                <span className="text-blue-400">
                                  • Last logged: {lastLog.loggedExercise.sets[0]?.weight} {unit}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-slate-500 group-hover:text-blue-400 transition transform group-hover:translate-x-1" />
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Link to create custom */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Don't see your exercise?</span>
                  <button
                    onClick={() => {
                      setCustomName(exerciseSearch.trim());
                      setCustomMuscle(filterMuscle !== 'All' ? filterMuscle : 'Chest');
                      setIsCreatingCustom(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Create Custom Exercise</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Celebration Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <Check size={32} className="stroke-[3]" />
            </div>

            <h3 className="text-xl font-black text-white mb-1">Workout Logged!</h3>
            <p className="text-xs text-slate-400 mb-6">
              Great work! Your sets, reps, and exercise sequence have been recorded for progressive overload tracking.
            </p>

            <button
              onClick={handleFinishAndReset}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition"
            >
              View Progress Graphs & History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

