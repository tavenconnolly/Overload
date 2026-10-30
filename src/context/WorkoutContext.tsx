import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Exercise, 
  Workout, 
  LoggedExercise, 
  WeightUnit, 
  ExerciseHistoryPoint,
  MuscleGroup,
  ActiveWorkoutDraft,
  ExerciseSet
} from '../types';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';

interface WorkoutContextType {
  exercises: Exercise[];
  workouts: Workout[];
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
  activeDraft: ActiveWorkoutDraft;
  updateActiveDraft: (updater: Partial<ActiveWorkoutDraft> | ((prev: ActiveWorkoutDraft) => ActiveWorkoutDraft)) => void;
  addExerciseToActiveDraft: (exerciseId: string) => void;
  clearActiveDraft: () => void;
  addExercise: (name: string, muscleGroup: MuscleGroup, notes?: string) => Exercise;
  updateExercise: (id: string, updates: Partial<Omit<Exercise, 'id'>>) => void;
  deleteExercise: (id: string) => void;
  saveWorkout: (workout: Omit<Workout, 'id' | 'createdAt'> & { id?: string }) => Workout;
  deleteWorkout: (id: string) => void;
  getLastLogForExercise: (exerciseId: string, excludeWorkoutId?: string) => { workout: Workout; loggedExercise: LoggedExercise } | null;
  getExerciseHistory: (exerciseId: string) => ExerciseHistoryPoint[];
  getExerciseById: (id: string) => Exercise | undefined;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  clearAllData: () => void;
}

const STORAGE_KEYS = {
  EXERCISES: 'overload_exercises_v1',
  WORKOUTS: 'overload_workouts_v1',
  UNIT: 'overload_unit_v1',
  DRAFT: 'overload_active_workout_draft_v1',
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

  const [activeDraft, setActiveDraft] = useState<ActiveWorkoutDraft>(() => {
    const fallback: ActiveWorkoutDraft = {
      title: 'Push Day',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      exercises: [],
    };
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load draft from localStorage', e);
    }
    return fallback;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(activeDraft));
    } catch (e) {
      console.error('Failed to save draft to localStorage', e);
    }
  }, [activeDraft]);

  const updateActiveDraft = (
    updater: Partial<ActiveWorkoutDraft> | ((prev: ActiveWorkoutDraft) => ActiveWorkoutDraft)
  ) => {
    setActiveDraft((prev) => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  };

  const addExerciseToActiveDraft = (exerciseId: string) => {
    setActiveDraft((prev) => {
      const initialSets: ExerciseSet[] = [
        { id: `set-${Date.now()}-1`, setNumber: 1, weight: 0, reps: 0, completed: false },
        { id: `set-${Date.now()}-2`, setNumber: 2, weight: 0, reps: 0, completed: false },
        { id: `set-${Date.now()}-3`, setNumber: 3, weight: 0, reps: 0, completed: false },
      ];
      const newLoggedEx: LoggedExercise = {
        id: `logged-ex-${Date.now()}`,
        exerciseId,
        order: prev.exercises.length + 1,
        sets: initialSets,
      };
      return {
        ...prev,
        exercises: [...prev.exercises, newLoggedEx],
      };
    });
  };

  const clearActiveDraft = () => {
    const freshDraft: ActiveWorkoutDraft = {
      title: 'Push Day',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      exercises: [],
    };
    setActiveDraft(freshDraft);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  };

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

  const updateExercise = (id: string, updates: Partial<Omit<Exercise, 'id'>>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    );
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
        activeDraft,
        updateActiveDraft,
        addExerciseToActiveDraft,
        clearActiveDraft,
        addExercise,
        updateExercise,
        deleteExercise,
        saveWorkout,
        deleteWorkout,
        getLastLogForExercise,
        getExerciseHistory,
        getExerciseById,
        exportData,
        importData,
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

