import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Calendar, AlertCircle } from 'lucide-react';

const UpcomingClasses = () => {
    // Classes scheduling not yet implemented
    return (
        <Card className="col-span-4 lg:col-span-2 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Upcoming Classes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Class Scheduling
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                        Your scheduled classes will appear here once you start accepting tuition jobs
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>Feature coming soon</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default UpcomingClasses;
