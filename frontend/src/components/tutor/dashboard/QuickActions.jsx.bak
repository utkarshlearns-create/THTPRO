"use client";
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { ClipboardList, CalendarDays, Zap, HelpCircle } from 'lucide-react';

const actions = [
    { label: 'Log Class', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Availability', icon: CalendarDays, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Boost', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Support', icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-500/10' },
];

const QuickActions = () => {
    return (
        <Card className="col-span-4 lg:col-span-2 h-full shadow-premium border-slate-100 dark:border-slate-800">
            <CardContent className="h-full flex flex-col justify-center p-8">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {actions.map((action) => (
                        <button 
                            key={action.label}
                            className="flex flex-col items-center justify-center p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/5 transition-all duration-300 group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none"
                        >
                            <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${action.bg} ${action.color} shadow-sm`}>
                                <action.icon size={26} />
                            </div>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default QuickActions;

