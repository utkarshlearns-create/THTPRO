import React from 'react';
import { cn } from '../../lib/utils';

const CircularProgress = ({ value, size = 120, strokeWidth = 10, className, showValue = true }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-800"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
                
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7dd3fc" /> {/* sky-300 */}
                        <stop offset="100%" stopColor="#2563eb" /> {/* blue-600 */}
                    </linearGradient>
                </defs>
            </svg>
            {showValue && (
                <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-white text-shadow-glow">{value}%</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Complete</span>
                </div>
            )}
        </div>
    );
};

const Progress = ({ value, className, indicatorClassName }) => (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-slate-100", className)}>
        <div
            className={cn("h-full w-full flex-1 bg-indigo-600 transition-all duration-500 ease-in-out", indicatorClassName)}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
);

export { CircularProgress, Progress };
