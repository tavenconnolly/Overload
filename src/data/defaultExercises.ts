import { Exercise, MuscleGroup } from '../types';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Quads',
  'Hamstrings & Glutes',
  'Biceps',
  'Triceps',
  'Calves',
  'Core',
];

export const DEFAULT_EXERCISES: Exercise[] = [
  // --- CHEST ---
  { id: 'bb-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest' },
  { id: 'db-chest-press', name: 'Dumbbell Chest Press', muscleGroup: 'Chest' },
  { id: 'chest-press-machine', name: 'Chest Press Machine', muscleGroup: 'Chest' },
  { id: 'leverage-chest-press', name: 'Leverage Chest Press', muscleGroup: 'Chest' },
  { id: 'decline-leverage-machine', name: 'Decline Leverage Machine', muscleGroup: 'Chest' },
  { id: 'incline-leverage-machine', name: 'Incline Leverage Machine', muscleGroup: 'Chest' },
  { id: 'single-arm-low-flys', name: 'Single-Arm Low Cable Flyes', muscleGroup: 'Chest' },
  { id: 'weird-pec-fly-machine', name: 'Weird Pec Fly Machine', muscleGroup: 'Chest' },
  { id: 'pec-deck-machine', name: 'Pec Deck Machine', muscleGroup: 'Chest' },
  { id: 'high-cable-crossover', name: 'High Cable Crossover', muscleGroup: 'Chest' },
  { id: 'low-cable-crossover', name: 'Low Cable Crossover', muscleGroup: 'Chest' },
  { id: 'chest-dips', name: 'Chest Dips', muscleGroup: 'Chest' },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { id: 'push-ups', name: 'Push-ups', muscleGroup: 'Chest' },

  // --- TRICEPS ---
  { id: 'db-skull-crushers-single', name: 'Dumbbell Skull Crushers (Single Arm)', muscleGroup: 'Triceps' },
  { id: 'db-skull-crushers-dual', name: 'Dumbbell Skull Crushers (Dual Arm)', muscleGroup: 'Triceps' },
  { id: 'ez-bar-skull-crushers-standing', name: 'EZ Bar Skull Crushers (Standing)', muscleGroup: 'Triceps' },
  { id: 'tricep-pushdowns-rope', name: 'Tricep Pushdowns (Rope)', muscleGroup: 'Triceps' },
  { id: 'tricep-pushdowns-ez-bar', name: 'Tricep Pushdowns (EZ Bar)', muscleGroup: 'Triceps' },
  { id: 'overhead-cable-extension', name: 'Overhead Cable Extension', muscleGroup: 'Triceps' },
  { id: 'seated-dips', name: 'Seated Dips', muscleGroup: 'Triceps' },
  { id: 'bench-dips', name: 'Bench Dips', muscleGroup: 'Triceps' },
  { id: 'tricep-triset-ez-bar', name: '3 Tri-Set (EZ Bar)', muscleGroup: 'Triceps' },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', muscleGroup: 'Triceps' },

  // --- BACK ---
  { id: 'bb-rows', name: 'Barbell Bent-Over Row', muscleGroup: 'Back' },
  { id: 'one-arm-db-rows', name: 'One-Arm Dumbbell Row', muscleGroup: 'Back' },
  { id: 'row-machine', name: 'Row Machine', muscleGroup: 'Back' },
  { id: 'high-row-machine', name: 'High Row Machine', muscleGroup: 'Back' },
  { id: 'lat-pulldowns', name: 'Lat Pulldown', muscleGroup: 'Back' },
  { id: 'single-arm-lat-pulls', name: 'Single-Arm Lat Pulldown', muscleGroup: 'Back' },
  { id: 'seated-cable-rows', name: 'Seated Cable Row', muscleGroup: 'Back' },
  { id: 'mid-row-machine', name: 'Mid Row Machine', muscleGroup: 'Back' },
  { id: 'lever-high-row', name: 'Lever High Row Machine', muscleGroup: 'Back' },
  { id: 'standing-cable-rows', name: 'Standing Cable Row', muscleGroup: 'Back' },
  { id: 't-bar-rows', name: 'T-Bar Row', muscleGroup: 'Back' },
  { id: 'straight-arm-pulldowns', name: 'Straight-Arm Pulldown', muscleGroup: 'Back' },
  { id: 'pull-ups', name: 'Pull-ups', muscleGroup: 'Back' },
  { id: 'barbell-deadlift', name: 'Conventional Deadlift', muscleGroup: 'Back' },

  // --- BICEPS ---
  { id: 'ez-bar-bicep-curls', name: 'EZ Bar Bicep Curls', muscleGroup: 'Biceps' },
  { id: 'dumbbell-curls', name: 'Dumbbell Curls', muscleGroup: 'Biceps' },
  { id: 'lever-curls', name: 'Lever Curls', muscleGroup: 'Biceps' },
  { id: 'seated-db-curls', name: 'Seated Dumbbell Curls', muscleGroup: 'Biceps' },
  { id: 'hammer-curls', name: 'Hammer Curls', muscleGroup: 'Biceps' },
  { id: 'preacher-curls', name: 'Preacher Curls', muscleGroup: 'Biceps' },
  { id: 'concentration-curls', name: 'Concentration Curls', muscleGroup: 'Biceps' },
  { id: 'rope-hammer-curls', name: 'Rope Hammer Curls', muscleGroup: 'Biceps' },
  { id: 'ez-bar-cable-curls', name: 'EZ Bar Cable Curls', muscleGroup: 'Biceps' },
  { id: 'machine-curls', name: 'Machine Curls', muscleGroup: 'Biceps' },
  { id: 'ez-bar-reverse-curls', name: 'EZ Bar Reverse Curls', muscleGroup: 'Biceps' },
  { id: 'dumbbell-5x5-superset', name: '5X5 Superset (Dumbbell)', muscleGroup: 'Biceps' },

  // --- SHOULDERS ---
  { id: 'bb-shoulder-press', name: 'Barbell Shoulder Press', muscleGroup: 'Shoulders' },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders' },
  { id: 'shoulder-press-machine', name: 'Shoulder Press Machine', muscleGroup: 'Shoulders' },
  { id: 'lateral-raises', name: 'Dumbbell Lateral Raises', muscleGroup: 'Shoulders' },
  { id: 'machine-lateral-raises', name: 'Machine Lateral Raises', muscleGroup: 'Shoulders' },
  { id: 'face-pulls', name: 'Face Pulls', muscleGroup: 'Shoulders' },
  { id: 'cable-reverse-flies', name: 'Cable Reverse Flyes', muscleGroup: 'Shoulders' },
  { id: 'machine-reverse-flies', name: 'Machine Reverse Flyes', muscleGroup: 'Shoulders' },
  { id: 'rear-delt-flyes', name: 'Rear Delt Flyes', muscleGroup: 'Shoulders' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { id: 'dumbbell-shrugs', name: 'Dumbbell Shrugs', muscleGroup: 'Shoulders' },
  { id: 'barbell-shrugs', name: 'Barbell Shrugs', muscleGroup: 'Shoulders' },

  // --- QUADS ---
  { id: 'bb-squats', name: 'Barbell Squats', muscleGroup: 'Quads' },
  { id: 'pendulum-squat', name: 'Pendulum Squat', muscleGroup: 'Quads' },
  { id: 'incline-leg-press', name: '45° Incline Leg Press', muscleGroup: 'Quads' },
  { id: 'seated-leg-press-machine', name: 'Seated Leg Press Machine', muscleGroup: 'Quads' },
  { id: 'hack-squats', name: 'Hack Squats', muscleGroup: 'Quads' },
  { id: 'leg-extensions', name: 'Leg Extensions', muscleGroup: 'Quads' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Quads' },
  { id: 'walking-lunges', name: 'Walking Lunges', muscleGroup: 'Quads' },

  // --- HAMSTRINGS & GLUTES ---
  { id: 'laying-leg-curls', name: 'Lying Leg Curls', muscleGroup: 'Hamstrings & Glutes' },
  { id: 'seated-leg-curls', name: 'Seated Leg Curls', muscleGroup: 'Hamstrings & Glutes' },
  { id: 'outer-thighs', name: 'Outer Thighs (Abductors)', muscleGroup: 'Hamstrings & Glutes' },
  { id: 'inner-thighs', name: 'Inner Thighs (Adductors)', muscleGroup: 'Hamstrings & Glutes' },
  { id: 'hip-thrusts', name: 'Hip Thrusts', muscleGroup: 'Hamstrings & Glutes' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Hamstrings & Glutes' },

  // --- CALVES ---
  { id: 'calf-raises-standing', name: 'Standing Calf Raises', muscleGroup: 'Calves' },
  { id: 'calf-raises-seated', name: 'Seated Calf Raises', muscleGroup: 'Calves' },

  // --- CORE ---
  { id: 'hanging-knee-raises', name: 'Hanging Knee Raises', muscleGroup: 'Core' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Core' },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', muscleGroup: 'Core' },
  { id: 'plank', name: 'Plank', muscleGroup: 'Core' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Core' },
];
