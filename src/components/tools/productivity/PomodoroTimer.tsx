'use client';

import { useState, useEffect } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';

type TimerState = 'work' | 'shortBreak' | 'longBreak' | 'idle';

export default function PomodoroTimer() {
    const [workDuration, setWorkDuration] = useState(25);
    const [shortBreakDuration, setShortBreakDuration] = useState(5);
    const [longBreakDuration, setLongBreakDuration] = useState(15);
    const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);

    const [timeLeft, setTimeLeft] = useState(workDuration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [completedSessions, setCompletedSessions] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        setIsRunning(false);

        if (timerState === 'work') {
            const newCompleted = completedSessions + 1;
            setCompletedSessions(newCompleted);

            if (newCompleted % sessionsUntilLongBreak === 0) {
                setTimerState('longBreak');
                setTimeLeft(longBreakDuration * 60);
            } else {
                setTimerState('shortBreak');
                setTimeLeft(shortBreakDuration * 60);
            }
        } else {
            setTimerState('work');
            setTimeLeft(workDuration * 60);
        }
    };

    const startWork = () => {
        setTimerState('work');
        setTimeLeft(workDuration * 60);
        setIsRunning(true);
    };

    const toggleTimer = () => {
        if (timerState === 'idle') {
            startWork();
        } else {
            setIsRunning(!isRunning);
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimerState('idle');
        setTimeLeft(workDuration * 60);
        setCompletedSessions(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStateColor = () => {
        switch (timerState) {
            case 'work': return 'text-emerald-600';
            case 'shortBreak': return 'text-blue-500';
            case 'longBreak': return 'text-purple-500';
            default: return 'text-slate-600';
        }
    };

    const getStateBg = () => {
        switch (timerState) {
            case 'work': return 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20';
            case 'shortBreak': return 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20';
            case 'longBreak': return 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20';
            default: return 'from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-800';
        }
    };

    const progress = timerState === 'idle' ? 0 :
        (1 - timeLeft / ((timerState === 'work' ? workDuration : timerState === 'shortBreak' ? shortBreakDuration : longBreakDuration) * 60)) * 100;

    return (
        <CalculatorLayout
            title="Pomodoro Timer"
            description="Boost productivity with timed work sessions"
            category="Productivity"
            results={
                <div className="space-y-4">
                    <div className={`text-center p-8 bg-gradient-to-br ${getStateBg()} rounded-xl`}>
                        <p className="text-sm font-medium text-slate-500 mb-2">
                            {timerState === 'idle' && 'Ready to focus?'}
                            {timerState === 'work' && '🎯 Focus Time'}
                            {timerState === 'shortBreak' && '☕ Short Break'}
                            {timerState === 'longBreak' && '🌴 Long Break'}
                        </p>

                        <div className="relative w-48 h-48 mx-auto mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-slate-200 dark:text-slate-700"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${progress * 5.53} 553`}
                                    strokeLinecap="round"
                                    className={getStateColor()}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-5xl font-bold font-mono ${getStateColor()}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={toggleTimer}
                                className={`p-4 rounded-full ${timerState === 'work' ? 'bg-emerald-500' : timerState === 'shortBreak' ? 'bg-blue-500' : 'bg-purple-500'} text-white hover:opacity-90 transition`}
                            >
                                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                            </button>
                            <button
                                onClick={resetTimer}
                                className="p-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                            >
                                <RotateCcw className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center gap-2">
                        {Array.from({ length: sessionsUntilLongBreak }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${i < completedSessions % sessionsUntilLongBreak ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                            />
                        ))}
                    </div>

                    <p className="text-center text-sm text-slate-500">
                        Sessions completed: {completedSessions}
                    </p>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Work Duration: {workDuration} minutes
                    </label>
                    <input
                        type="range"
                        min={15}
                        max={60}
                        step={5}
                        value={workDuration}
                        onChange={(e) => {
                            setWorkDuration(Number(e.target.value));
                            if (timerState === 'idle') setTimeLeft(Number(e.target.value) * 60);
                        }}
                        className="w-full accent-emerald-500"
                        disabled={isRunning}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Short Break: {shortBreakDuration} minutes
                    </label>
                    <input
                        type="range"
                        min={3}
                        max={15}
                        value={shortBreakDuration}
                        onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                        className="w-full accent-blue-500"
                        disabled={isRunning}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Long Break: {longBreakDuration} minutes
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={30}
                        step={5}
                        value={longBreakDuration}
                        onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                        className="w-full accent-purple-500"
                        disabled={isRunning}
                    />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">How it works:</p>
                    <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                        <li>Work for {workDuration} minutes</li>
                        <li>Take a {shortBreakDuration}-minute break</li>
                        <li>After {sessionsUntilLongBreak} sessions, take a {longBreakDuration}-minute break</li>
                    </ol>
                </div>
            </div>
        </CalculatorLayout>
    );
}
