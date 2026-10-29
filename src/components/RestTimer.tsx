import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Plus, Minus } from 'lucide-react';

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ isOpen, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(90);
  const [initialSeconds, setInitialSeconds] = useState<number>(90);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((sec) => sec - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      // Play web audio beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch (e) {
        // audio might be blocked without user interaction
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  if (!isOpen) return null;

  const startPreset = (secs: number) => {
    setInitialSeconds(secs);
    setSecondsLeft(secs);
    setIsActive(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progressPct = initialSeconds > 0 
    ? Math.max(0, Math.min(100, ((initialSeconds - secondsLeft) / initialSeconds) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center gap-2 text-blue-400 mb-4 font-semibold tracking-wide uppercase text-xs">
          <Timer size={18} />
          <span>Rest Between Sets</span>
        </div>

        {/* Circular / Large timer display */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          <div className="text-6xl font-black font-mono text-white tracking-tight">
            {formatTime(secondsLeft)}
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Adjust time +/- 15s */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <button
            onClick={() => setSecondsLeft((s) => Math.max(0, s - 15))}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <Minus size={14} /> 15s
          </button>
          <button
            onClick={() => {
              if (isActive) {
                setIsActive(false);
              } else {
                if (secondsLeft === 0) setSecondsLeft(initialSeconds);
                setIsActive(true);
              }
            }}
            className={`flex items-center gap-2 font-bold px-5 py-2 rounded-xl text-sm transition ${
              isActive 
                ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
            }`}
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(initialSeconds);
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setSecondsLeft((s) => s + 15)}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <Plus size={14} /> 15s
          </button>
        </div>

        {/* Quick presets */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          {[45, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => startPreset(sec)}
              className={`py-2 text-xs font-semibold rounded-lg border transition ${
                initialSeconds === sec && isActive
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {sec < 60 ? `${sec}s` : `${sec / 60}m`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

