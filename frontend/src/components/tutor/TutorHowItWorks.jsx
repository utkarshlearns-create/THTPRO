"use client";
import React from 'react';
import { ArrowRight, UserPlus, ShieldCheck, BookOpen, Wallet } from 'lucide-react';

const steps = [
    { label: 'Register', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Verify', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Teach', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Earn', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const TutorHowItWorks = () => {
    return (
        <div className="py-12">
            <h2 className="text-3xl font-black text-center mb-16 text-slate-900 dark:text-white">How It Works</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center gap-4 group">
                            <div className={`w-20 h-20 rounded-full ${step.bg} flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                                <step.icon className={`w-8 h-8 ${step.color}`} />
                            </div>
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{step.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <ArrowRight className="hidden md:block w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default TutorHowItWorks;
