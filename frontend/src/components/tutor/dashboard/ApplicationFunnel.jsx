import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { cn } from '../../../lib/utils';
import { Send, Clock, CheckCircle, XCircle } from 'lucide-react';

const stats = [
    { label: 'Applied', count: 12, icon: Send, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'In Queue', count: 5, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Selected', count: 3, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Rejected', count: 8, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
];

const ApplicationFunnel = () => {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Application Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className={cn("p-4 rounded-xl border transition-all", 
                            "bg-white border-slate-200 hover:bg-slate-50", // Light
                            "dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10", // Dark
                            stat.bg // Specific bg color tint
                        )}>
                            <div className={cn("p-2 rounded-lg", "bg-white/50 dark:bg-black/20", stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.count}</p>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ApplicationFunnel;
