import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Star, AlertCircle } from 'lucide-react';

const PerformanceRadial = () => {
    // Performance tracking not yet implemented - requires student reviews
    return (
        <Card className="col-span-4 lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Performance
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[280px] text-center">
                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Performance Metrics
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                    Your performance ratings will appear here once students start reviewing your teaching
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>Available after first review</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default PerformanceRadial;
