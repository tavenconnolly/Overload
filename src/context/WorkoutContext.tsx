import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Exercise, 
  Workout, 
  LoggedExercise, 
  WeightUnit, 
  ExerciseHistoryPoint,
  MuscleGroup
} from '../types';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';

interface WorkoutContextType {
  exercises: Exercise[];
  workouts: Workout[];
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
  addExercise: (name: string, muscleGroup: MuscleGroup, notes?: string) => Exercise;
  deleteExercise: (id: string) => void;
  saveWorkout: (workout: Omit<Workout, 'id' | 'createdAt'> & { id?: string }) => Workout;
  deleteWorkout: (id: string) => void;
  getLastLogForExercise: (exerciseId: string, excludeWorkoutId?: string) => { workout: Workout; loggedExercise: LoggedExercise } | null;
  getExerciseHistory: (exerciseId: string) => ExerciseHistoryPoint[];
  getExerciseById: (id: string) => Exercise | undefined;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  loadSampleData: () => void;
  clearAllData: () => void;
}

const STORAGE_KEYS = {
  EXERCISES: 'overload_exercises_v1',
  WORKOUTS: 'overload_workouts_v1',
  UNIT: 'overload_unit_v1',
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (stored) {
        const parsed: Exercise[] = JSON.parse(stored);
        // Retain any custom exercises added by user
        const customExercises = parsed.filter((e) => e.isCustom);
        // Ensure all DEFAULT_EXERCISES are present and up to date
        const merged = [...DEFAULT_EXERCISES];
        for (const custom of customExercises) {
          if (!merged.some((m) => m.id === custom.id || m.name.toLowerCase() === custom.name.toLowerCase())) {
            merged.push(custom);
          }
        }
        return merged;
      }
    } catch (e) {
      console.error('Failed to parse exercises from localStorage', e);
    }
    return DEFAULT_EXERCISES;
  });

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse workouts from localStorage', e);
    }
    return [];
  });

  const [unit, setUnitState] = useState<WeightUnit>(() => {
    return (localStorage.getItem(STORAGE_KEYS.UNIT) as WeightUnit) || 'lbs';
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    } catch (e) {
      console.error('Failed to save exercises', e);
    }
  }, [exercises]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (e) {
      console.error('Failed to save workouts', e);
    }
  }, [workouts]);

  const setUnit = (newUnit: WeightUnit) => {
    setUnitState(newUnit);
    localStorage.setItem(STORAGE_KEYS.UNIT, newUnit);
  };

  const getExerciseById = (id: string) => {
    return exercises.find((ex) => ex.id === id);
  };

  const addExercise = (name: string, muscleGroup: MuscleGroup, notes?: string): Exercise => {
    const newEx: Exercise = {
      id: `custom-${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name: name.trim(),
      muscleGroup,
      notes,
      isCustom: true,
    };
    setExercises((prev) => [newEx, ...prev]);
    return newEx;
  };

  const deleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const saveWorkout = (workoutData: Omit<Workout, 'id' | 'createdAt'> & { id?: string }): Workout => {
    const existingIndex = workoutData.id 
      ? workouts.findIndex((w) => w.id === workoutData.id) 
      : -1;

    let savedWorkout: Workout;

    if (existingIndex >= 0) {
      savedWorkout = {
        ...workouts[existingIndex],
        ...workoutData,
        id: workoutData.id!,
      };
      setWorkouts((prev) => {
        const updated = [...prev];
        updated[existingIndex] = savedWorkout;
        return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    } else {
      savedWorkout = {
        ...workoutData,
        id: workoutData.id || `workout-${Date.now()}`,
        createdAt: Date.now(),
      };
      setWorkouts((prev) => [savedWorkout, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }

    return savedWorkout;
  };

  const deleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  // Requirement 3: Find the last time this exercise was logged
  const getLastLogForExercise = (exerciseId: string, excludeWorkoutId?: string) => {
    // Sort descending by date
    const sorted = [...workouts]
      .filter((w) => w.id !== excludeWorkoutId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const w of sorted) {
      const match = w.exercises.find((e) => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        return {
          workout: w,
          loggedExercise: match,
        };
      }
    }
    return null;
  };

  // Requirement 4: Calculate historical data points for graphs
  const getExerciseHistory = (exerciseId: string): ExerciseHistoryPoint[] => {
    const points: ExerciseHistoryPoint[] = [];

    // Sort ascending by date for chronological charts
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const w of sorted) {
      const match = w.exercises.find((e) => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        const completedSets = match.sets.filter((s) => s.completed || s.weight > 0);
        if (completedSets.length === 0) continue;

        let topWeight = 0;
        let topReps = 0;
        let totalVolume = 0;
        let maxEstimated1RM = 0;

        for (const set of completedSets) {
          const wgt = Number(set.weight) || 0;
          const rps = Number(set.reps) || 0;
          totalVolume += wgt * rps;

          if (wgt > topWeight || (wgt === topWeight && rps > topReps)) {
            topWeight = wgt;
            topReps = rps;
          }

          // Epley Formula for 1RM: wgt * (1 + rps / 30)
          const e1rm = rps === 1 ? wgt : Math.round(wgt * (1 + rps / 30));
          if (e1rm > maxEstimated1RM) {
            maxEstimated1RM = e1rm;
          }
        }

        const dateObj = new Date(w.date + 'T12:00:00');
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });

        points.push({
          date: w.date,
          formattedDate,
          workoutTitle: w.title || 'Workout',
          order: match.order,
          topWeight,
          topReps,
          totalVolume,
          estimated1RM: maxEstimated1RM,
          sets: match.sets,
        });
      }
    }

    return points;
  };

  const exportData = () => {
    return JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      unit,
      exercises,
      workouts,
    }, null, 2);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.exercises && Array.isArray(parsed.exercises)) {
        setExercises(parsed.exercises);
      }
      if (parsed.workouts && Array.isArray(parsed.workouts)) {
        setWorkouts(parsed.workouts);
      }
      if (parsed.unit) {
        setUnit(parsed.unit);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const loadSampleData = () => {
    // Generate realistic progressive overload progression for 4 workouts over the last 3 weeks
    const today = new Date();
    const daysAgo = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      return d.toISOString().split('T')[0];
    };

    const sampleWorkouts: Workout[] = [
      {
        id: 'sample-w1',
        title: 'Push Day - Progressive Overload #1',
        date: daysAgo(21),
        createdAt: Date.now() - 21 * 86400000,
        exercises: [
          {
            id: 'se-1',
            exerciseId: 'bb-bench-press',
            order: 1,
            sets: [
              { id: 's1', setNumber: 1, weight: 175, reps: 8, completed: true },
              { id: 's2', setNumber: 2, weight: 175, reps: 8, completed: true },
              { id: 's3', setNumber: 3, weight: 175, reps: 7, completed: true },
            ]
          },
          {
            id: 'se-2',
            exerciseId: 'incline-dumbbell-press',
            order: 2,
            sets: [
              { id: 's4', setNumber: 1, weight: 60, reps: 10, completed: true },
              { id: 's5', setNumber: 2, weight: 60, reps: 9, completed: true },
              { id: 's6', setNumber: 3, weight: 60, reps: 8, completed: true },
            ]
          },
          {
            id: 'se-3',
            exerciseId: 'bb-shoulder-press',
            order: 3,
            sets: [
              { id: 's7', setNumber: 1, weight: 105, reps: 8, completed: true },
              { id: 's8', setNumber: 2, weight: 105, reps: 8, completed: true },
            ]
          }
        ]
      },
      {
        id: 'sample-w2',
        title: 'Push Day - Progressive Overload #2',
        date: daysAgo(14),
        createdAt: Date.now() - 14 * 86400000,
        exercises: [
          {
            id: 'se-4',
            exerciseId: 'bb-bench-press',
            order: 1,
            sets: [
              { id: 's9', setNumber: 1, weight: 180, reps: 8, completed: true },
              { id: 's10', setNumber: 2, weight: 180, reps: 8, completed: true },
              { id: 's11', setNumber: 3, weight: 180, reps: 7, completed: true },
            ]
          },
          {
            id: 'se-5',
            exerciseId: 'incline-dumbbell-press',
            order: 2,
            sets: [
              { id: 's12', setNumber: 1, weight: 65, reps: 8, completed: true },
              { id: 's13', setNumber: 2, weight: 65, reps: 8, completed: true },
              { id: 's14', setNumber: 3, weight: 65, reps: 7, completed: true },
            ]
          },
          {
            id: 'se-6',
            exerciseId: 'bb-shoulder-press',
            order: 3,
            sets: [
              { id: 's15', setNumber: 1, weight: 110, reps: 8, completed: true },
              { id: 's16', setNumber: 2, weight: 110, reps: 7, completed: true },
            ]
          }
        ]
      },
      {
        id: 'sample-w3',
        title: 'Push Day - Progressive Overload #3',
        date: daysAgo(7),
        createdAt: Date.now() - 7 * 86400000,
        exercises: [
          {
            id: 'se-7',
            exerciseId: 'bb-bench-press',
            order: 1,
            sets: [
              { id: 's17', setNumber: 1, weight: 185, reps: 8, completed: true },
              { id: 's18', setNumber: 2, weight: 185, reps: 8, completed: true },
              { id: 's19', setNumber: 3, weight: 185, reps: 8, completed: true },
            ]
          },
          {
            id: 'se-8',
            exerciseId: 'incline-dumbbell-press',
            order: 2,
            sets: [
              { id: 's20', setNumber: 1, weight: 65, reps: 10, completed: true },
              { id: 's21', setNumber: 2, weight: 65, reps: 9, completed: true },
              { id: 's22', setNumber: 3, weight: 65, reps: 9, completed: true },
            ]
          },
          {
            id: 'se-9',
            exerciseId: 'bb-shoulder-press',
            order: 3,
            sets: [
              { id: 's23', setNumber: 1, weight: 115, reps: 8, completed: true },
              { id: 's24', setNumber: 2, weight: 115, reps: 8, completed: true },
            ]
          }
        ]
      },
      {
        id: 'sample-w4',
        title: 'Push Day - Progressive Overload #4 (Latest)',
        date: daysAgo(2),
        createdAt: Date.now() - 2 * 86400000,
        exercises: [
          {
            id: 'se-10',
            exerciseId: 'bb-bench-press',
            order: 1,
            sets: [
              { id: 's25', setNumber: 1, weight: 190, reps: 8, completed: true },
              { id: 's26', setNumber: 2, weight: 190, reps: 7, completed: true },
              { id: 's27', setNumber: 3, weight: 190, reps: 6, completed: true },
            ]
          },
          {
            id: 'se-28',
            exerciseId: 'incline-dumbbell-press',
            order: 2,
            sets: [
              { id: 's29', setNumber: 1, weight: 70, reps: 8, completed: true },
              { id: 's30', setNumber: 2, weight: 70, reps: 7, completed: true },
              { id: 's31', setNumber: 3, weight: 70, reps: 6, completed: true },
            ]
          },
          {
            id: 'se-32',
            exerciseId: 'bb-shoulder-press',
            order: 3,
            sets: [
              { id: 's33', setNumber: 1, weight: 120, reps: 7, completed: true },
              { id: 's34', setNumber: 2, weight: 120, reps: 6, completed: true },
            ]
          }
        ]
      }
    ];

    setWorkouts(sampleWorkouts);
  };

  const clearAllData = () => {
    setWorkouts([]);
    setExercises(DEFAULT_EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
    localStorage.removeItem(STORAGE_KEYS.EXERCISES);
  };

  return (
    <WorkoutContext.Provider
      value={{
        exercises,
        workouts,
        unit,
        setUnit,
        addExercise,
        deleteExercise,
        saveWorkout,
        deleteWorkout,
        getLastLogForExercise,
        getExerciseHistory,
        getExerciseById,
        exportData,
        importData,
        loadSampleData,
        clearAllData,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

