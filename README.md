# OVERLOAD — Progressive Overload Workout Tracker

A responsive, gym-optimized progressive overload workout tracking web app designed to help you consistently build muscle by tracking weights, reps, exercise sequence, previous performance, and strength graphs.

## ✨ Features Built For You

1. **Exercise Library Categorized by Muscle Group**
   - Filter by: Chest, Back, Shoulders, Quads, Hamstrings & Glutes, Biceps, Triceps, Calves, Core.
   - Pre-loaded with standard progressive overload movements.
   - 1-click **Add Custom Exercise** modal for your personal machine variations.

2. **Full Workout Logger with Order Tracking**
   - Track exercise sequence: **1st Exercise, 2nd Exercise, 3rd Exercise**, etc.
   - Easy up/down arrows to adjust sequence if gym machines are occupied.
   - Add as many sets, weights, and reps as needed with quick completion checkmarks.

3. **Progressive Overload Helper (Previous Session Comparison)**
   - When you add an exercise, an **Overload Target Banner** instantly shows the exact sets, reps, and weights from your last session.
   - Highlights your target: *"+1 rep or +5 lbs to beat last session"*.
   - Live PR badges appear in green (e.g. `+5 lbs PR!`, `+1 rep!`) when you exceed your previous record.

4. **Progress Analytics & Graphs**
   - Interactive charts (using Recharts) for any exercise over time.
   - Switch metrics: **Top Weight Lifted**, **Estimated 1-Rep Max (1RM)**, and **Total Working Volume**.
   - Summary stat cards showing All-Time PR, Best 1RM, Peak Volume, and Total Sessions.
   - Chronological session timeline breakdown with exact set numbers.

5. **Bonus Gym Tools**
   - **Between-set Rest Timer** with sound alerts and 45s, 60s, 90s, 120s presets.
   - Instant **LBS / KG** unit toggle.
   - **Offline-ready LocalStorage** persistence with 1-click JSON backup export & import.
   - **Demo Data Loader**: 1-tap in Settings to test out 4 weeks of bench, incline, and overhead press progression curves.

## 🚀 Running the App Locally

Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser (or your phone's browser if on the same local Wi-Fi network).

To create a production build:
```bash
npm run build
```

