export type MuscleGroup = 
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Quads'
  | 'Hamstrings & Glutes'
  | 'Biceps'
  | 'Triceps'
  | 'Calves'
  | 'Core';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom?: boolean;
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface LoggedExercise {
  id: string; // unique ID for this instance in the workout
  exerciseId: string;
  order: number; // 1 = 1st, 2 = 2nd, 3 = 3rd, etc.
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  exercises: LoggedExercise[];
  notes?: string;
  createdAt: number;
}

export type WeightUnit = 'lbs' | 'kg';

export interface ExerciseHistoryPoint {
  date: string;
  formattedDate: string;
  workoutTitle: string;
  order: number;
  topWeight: number;
  topReps: number;
  totalVolume: number;
  estimated1RM: number;
  sets: ExerciseSet[];
}

