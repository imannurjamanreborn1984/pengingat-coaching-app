"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';

export const MeditationTimer = ({
  onCompleteSession,
  defaultDurationMinutes = 15,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(defaultDurationMinutes);
  const [timeLeft, setTimeLeft] = useState(defaultDurationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Tarik Nafas');
  const [breathSeconds, setBreathSeconds] = useState(4);

  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.5);
    } catch (e) {
      console.log('Audio chime not supported or muted:', e);
    }
  };

  useEffect(() => {
    setTimeLeft(selectedMinutes * 60);
    setIsRunning(false);
  }, [selectedMinutes]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();
            onCompleteSession(selectedMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedMinutes, onCompleteSession]);

  useEffect(() => {
    if (!isRunning) return;

    const phases = [
      { phase: 'Tarik Nafas', duration: 4 },
      { phase: 'Tahan', duration: 4 },
      { phase: 'Hembuskan', duration: 4 },
      { phase: 'Hening', duration: 4 },
    ];

    let currentPhaseIndex = 0;

    const interval = setInterval(() => {
      setBreathSeconds((prevSec) => {
        if (prevSec <= 1) {
          currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
          setBreathPhase(phases[currentPhaseIndex].phase);
          return phases[currentPhaseIndex].duration;
        }
        return prevSec - 1;
      });
    }, 1000);

    breathTimerRef.current = interval;

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (!isRunning) {
      playChime();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presets = [5, 10, 15, 20, 30, 45];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-b from-rose-500/5 via-amber-500/5 to-transparent pointer-events-none transition-opacity ${
          isRunning ? 'opacity-100' : 'opacity-40'
        }`}
      />

      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 z-10">
        {presets.map((min) => (
          <button
            key={min}
            onClick={() => setSelectedMinutes(min)}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedMinutes === min
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50'
            }`}
          >
            {min} Menit
          </button>
        ))}
      </div>

      <div className="relative my-4 flex items-center justify-center">
        <div
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-rose-500/30 flex flex-col items-center justify-center transition-all duration-1000 ${
            isRunning
              ? breathPhase === 'Tarik Nafas'
                ? 'scale-110 bg-rose-500/10 shadow-lg shadow-rose-500/20'
                : breathPhase === 'Tahan'
                ? 'scale-110 bg-amber-500/10 border-amber-500/30'
                : breathPhase === 'Hembuskan'
                ? 'scale-90 bg-indigo-500/10 border-indigo-500/30'
                : 'scale-95 bg-slate-500/5 border-slate-500/20'
              : 'bg-slate-50 dark:bg-slate-800/40'
          }`}
        >
          {isRunning ? (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs uppercase tracking-widest font-bold text-rose-600 dark:text-rose-400 mb-1">
                {breathPhase}
              </p>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Ritme: {breathSeconds}s
              </p>
            </div>
          ) : (
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Siap untuk hening
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 z-10">
        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="Reset Waktu"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
              : 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-rose-600/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Jeda Sesi</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Mulai Hening</span>
            </>
          )}
        </button>

        <button
          onClick={playChime}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="Tes Suara Bell Sing Bowl (528 Hz)"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-5">
        🧘 Latihan nafas 4-4-4-4 (Box Breathing) otomatis aktif saat timer berjalan.
      </p>
    </div>
  );
};
