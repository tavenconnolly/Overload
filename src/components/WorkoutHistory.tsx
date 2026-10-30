import React, { useState } from 'react';
import { 
  Calendar, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Dumbbell, 
  Layers, 
  Flame 
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface WorkoutHistoryProps {
  onLogNewWorkout: () => void;
  onSelectExerciseForProgress: (exerciseId: string) => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  onLogNewWorkout,
  onSelectExerciseForProgress,
}) => {
  const { workouts, deleteWorkout, getExerciseById, unit } = useWorkout();
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    workouts[0]?.id || null
  );

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const toggleExpand = (id: string) => {
    setExpandedWorkoutId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="text-blue-500" size={24} />
            Workout History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review past training sessions, exercise order, and progressive overload records.
          </p>
        </div>

        <button
          onClick={onLogNewWorkout}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition self-start sm:self-auto"
        >
          <Dumbbell size={16} />
          <span>Log New Workout</span>
        </button>
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {workouts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-800/80">
            <div className="w-14 h-14 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar size={28} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No completed workouts yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Once you finish logging your first workout, it will show up here along with all sets and progressive metrics.
            </p>
            <div className="flex items-center justify-center">
              <button
                onClick={onLogNewWorkout}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
              >
                <Dumbbell size={16} />
                <span>Log First Workout</span>
              </button>
            </div>
          </div>
        ) : (
          workouts.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            const dateObj = new Date(workout.date + 'T12:00:00');
            const formattedDate = dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            // Calculate total volume for this workout
            const totalWorkoutVolume = workout.exercises.reduce((exSum, ex) => {
              return (
                exSum +
                ex.sets.reduce((sSum, s) => {
                  return sSum + (s.completed || s.weight > 0 ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0);
                }, 0)
              );
            }, 0);

            return (
              <div
                key={workout.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition"
              >
                {/* Workout Card Header */}
                <div
                  onClick={() => toggleExpand(workout.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-850/60 transition gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-white">{workout.title}</span>
                      <span className="text-xs text-blue-400 bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded-md font-medium">
                        {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300 font-mono">
                        <Flame size={13} className="text-purple-400" />
                        {totalWorkoutVolume.toLocaleString()} {unit} volume
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete workout "${workout.title}" from ${formattedDate}?`)) {
                          deleteWorkout(workout.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition"
                      title="Delete workout"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="p-2 text-slate-400 bg-slate-800/60 rounded-xl">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Exercise Breakdown */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                    {workout.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        "{workout.notes}"
                      </p>
                    )}

                    <div className="space-y-3 mt-3">
                      {workout.exercises.map((loggedEx) => {
                        const exerciseInfo = getExerciseById(loggedEx.exerciseId);

                        return (
                          <div
                            key={loggedEx.id}
                            className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Layers size={11} />
                                  {getOrdinal(loggedEx.order)}
                                </span>
                                <h4 className="font-bold text-white text-sm">
                                  {exerciseInfo?.name || 'Exercise'}
                                </h4>
                                {exerciseInfo?.muscleGroup && (
                                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                    {exerciseInfo.muscleGroup}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => onSelectExerciseForProgress(loggedEx.exerciseId)}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                              >
                                View Chart →
                              </button>
                            </div>

                            {/* Sets list */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                              {loggedEx.sets.map((set) => (
                                <div
                                  key={set.id}
                                  className="bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-slate-300"
                                >
                                  <span className="text-slate-500 font-bold">Set {set.setNumber}</span>
                                  <span className="font-bold text-white">
                                    {set.weight} {unit} × {set.reps}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

