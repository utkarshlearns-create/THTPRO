"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { BarChart2, AlertCircle } from 'lucide-react';

const EngagementStats = () => {
    // Engagement tracking not yet implemented
    return (
        <Card className="col-span-4 lg:col-span-1">
            <CardHeader>
                <CardTitle>Engagement</CardTitle>
                <p className="text-xs text-slate-400">Profile views & interactions</p>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-3">
                        <BarChart2 className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Engagement tracking available after profile verification
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>Coming soon</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EngagementStats;

