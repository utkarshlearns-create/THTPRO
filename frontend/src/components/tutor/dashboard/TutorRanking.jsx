import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Trophy, AlertCircle } from 'lucide-react';

const TutorRanking = () => {
    // Ranking system not yet implemented
    return (
        <Card className="col-span-4 lg:col-span-4 relative overflow-hidden border-yellow-500/20">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                    <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Tutor Ranking System
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                    Your ranking will be calculated based on student reviews, completion rates, and teaching quality. 
                    Start accepting jobs to build your reputation!
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>Feature coming soon</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default TutorRanking;
