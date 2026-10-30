import React, { useState, useMemo } from 'react';
import { 
  LineChart as ChartIcon, 
  TrendingUp, 
  Award, 
  Flame, 
  Calendar, 
  Dumbbell, 
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useWorkout } from '../context/WorkoutContext';
import { MuscleGroup } from '../types';
import { MUSCLE_GROUPS } from '../data/defaultExercises';

interface ProgressChartsProps {
  initialExerciseId?: string;
  onLogWorkout?: () => void;
}

type MetricType = 'topWeight' | 'estimated1RM' | 'totalVolume';

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ 
  initialExerciseId, 
  onLogWorkout 
}) => {
  const { exercises, unit, getExerciseHistory, workouts } = useWorkout();

  // Find default selected exercise: initialExerciseId, or first exercise with history, or first exercise in library
  const defaultSelectedId = useMemo(() => {
    if (initialExerciseId && exercises.some((e) => e.id === initialExerciseId)) {
      return initialExerciseId;
    }
    // Find first exercise with logs
    for (const ex of exercises) {
      if (getExerciseHistory(ex.id).length > 0) {
        return ex.id;
      }
    }
    return exercises[0]?.id || '';
  }, [initialExerciseId, exercises, getExerciseHistory]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(defaultSelectedId);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleGroup | 'All'>('All');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('topWeight');

  // Exercise history data for the graph
  const historyData = useMemo(() => {
    if (!selectedExerciseId) return [];
    return getExerciseHistory(selectedExerciseId);
  }, [selectedExerciseId, getExerciseHistory, workouts]);

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  // Available exercises filtered by muscle
  const selectableExercises = useMemo(() => {
    return exercises.filter((e) => 
      selectedMuscleFilter === 'All' || e.muscleGroup === selectedMuscleFilter
    );
  }, [exercises, selectedMuscleFilter]);

  // Statistics
  const stats = useMemo(() => {
    if (historyData.length === 0) {
      return {
        allTimePR: 0,
        best1RM: 0,
        maxVolume: 0,
        totalSessions: 0,
        firstDate: '',
        latestDate: '',
      };
    }

    const allTimePR = Math.max(...historyData.map((d) => d.topWeight));
    const best1RM = Math.max(...historyData.map((d) => d.estimated1RM));
    const maxVolume = Math.max(...historyData.map((d) => d.totalVolume));

    return {
      allTimePR,
      best1RM,
      maxVolume,
      totalSessions: historyData.length,
      firstDate: historyData[0].formattedDate,
      latestDate: historyData[historyData.length - 1].formattedDate,
    };
  }, [historyData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[180px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white">{data.formattedDate}</span>
            <span className="text-[10px] text-blue-400 font-semibold bg-blue-950/60 px-1.5 py-0.5 rounded">
              Order: #{data.order}
            </span>
          </div>

          <div className="text-slate-300 font-mono">
            {selectedMetric === 'topWeight' && (
              <div>
                Top Set: <strong className="text-emerald-400 text-sm">{data.topWeight} {unit}</strong> × {data.topReps} reps
              </div>
            )}
            {selectedMetric === 'estimated1RM' && (
              <div>
                Est. 1RM: <strong className="text-blue-400 text-sm">{data.estimated1RM} {unit}</strong>
              </div>
            )}
            {selectedMetric === 'totalVolume' && (
              <div>
                Total Volume: <strong className="text-purple-400 text-sm">{data.totalVolume} {unit}</strong>
              </div>
            )}
          </div>

          <div className="pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Sets performed:
            </span>
            <div className="space-y-0.5">
              {data.sets.map((s: any, idx: number) => (
                <div key={idx} className="text-[11px] text-slate-300 flex justify-between font-mono">
                  <span>Set {s.setNumber}:</span>
                  <span>{s.weight} {unit} × {s.reps}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Title & Exercise Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ChartIcon className="text-blue-500" size={24} />
            Progressive Overload Graphs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualize your strength and muscle progression across every workout session.
          </p>
        </div>

        {/* Exercise Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            {selectableExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.muscleGroup})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Muscle Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => setSelectedMuscleFilter('All')}
          className={`px-3 py-1.5 rounded-xl border transition ${
            selectedMuscleFilter === 'All'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          All
        </button>
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedMuscleFilter(g)}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition ${
              selectedMuscleFilter === g
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        {/* Metric Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base">
              {selectedExercise?.name}
            </span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
              {selectedExercise?.muscleGroup}
            </span>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setSelectedMetric('topWeight')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedMetric === 'topWeight'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Weight
            </button>
            <button
              onClick={() => setSelectedMetric('estimated1RM')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedMetric === 'estimated1RM'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Est. 1RM
            </button>
            <button
              onClick={() => setSelectedMetric('totalVolume')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedMetric === 'totalVolume'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Total Volume
            </button>
          </div>
        </div>

        {/* Chart View or Empty State */}
        {historyData.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              No workout logs for "{selectedExercise?.name}" yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              Log this exercise during your next workout to start tracking your progressive overload curve.
            </p>

            {onLogWorkout && (
              <div className="flex items-center justify-center">
                <button
                  onClick={onLogWorkout}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  <Dumbbell size={16} />
                  <span>Log Workout Now</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Recharts Area Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                    dot={{ fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#60a5fa', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1.5">
              <Info size={13} />
              <span>Tap or hover on points to inspect exact sets, reps, and exercise sequence.</span>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats Cards */}
      {historyData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <Award size={16} />
              <span>All-Time PR</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {stats.allTimePR} <span className="text-xs font-normal text-slate-400">{unit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Heaviest single working set</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
              <TrendingUp size={16} />
              <span>Estimated 1RM</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {stats.best1RM} <span className="text-xs font-normal text-slate-400">{unit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Calculated max strength</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
              <Flame size={16} />
              <span>Peak Volume</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {stats.maxVolume} <span className="text-xs font-normal text-slate-400">{unit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Max total volume in 1 session</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
              <Calendar size={16} />
              <span>Logged Sessions</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {stats.totalSessions}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Times performed to date</div>
          </div>
        </div>
      )}

      {/* Chronological Session Breakdown */}
      {historyData.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            Progression Timeline
          </h3>

          <div className="space-y-3">
            {[...historyData].reverse().map((point, idx) => {
              const prevPoint = [...historyData].reverse()[idx + 1];
              let progressBadge = null;

              if (prevPoint) {
                const diff = point.topWeight - prevPoint.topWeight;
                if (diff > 0) {
                  progressBadge = (
                    <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      +{diff} {unit}
                    </span>
                  );
                } else if (diff === 0) {
                  const repDiff = point.topReps - prevPoint.topReps;
                  if (repDiff > 0) {
                    progressBadge = (
                      <span className="text-blue-400 bg-blue-950/60 border border-blue-800/60 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        +{repDiff} rep
                      </span>
                    );
                  }
                }
              }

              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      #{point.order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{point.formattedDate}</span>
                        {progressBadge}
                      </div>
                      <div className="text-xs text-slate-400">{point.workoutTitle}</div>
                    </div>
                  </div>

                  {/* Sets details */}
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    {point.sets.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300"
                      >
                        {s.weight} × {s.reps}
                      </span>
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
};
