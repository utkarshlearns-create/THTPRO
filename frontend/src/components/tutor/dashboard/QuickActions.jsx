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
        <Card className="col-span-4 lg:col-span-2 h-full">
            <CardContent className="h-full flex flex-col justify-center p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {actions.map((action) => (
                        <button 
                            key={action.label}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                        >
                            <div className={`p-3 rounded-full mb-3 transition-transform group-hover:scale-110 ${action.bg} ${action.color}`}>
                                <action.icon size={24} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
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
