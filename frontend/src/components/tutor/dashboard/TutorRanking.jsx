import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Trophy, TrendingUp, Crown } from 'lucide-react';
import { Progress } from '../../ui/progress';

const TutorRanking = () => {
    return (
        <Card className="col-span-4 lg:col-span-4 relative overflow-hidden border-yellow-500/20">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <Trophy size={120} className="text-yellow-500" />
             </div>

            <CardContent className="p-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Rank Info */}
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                             <Crown size={32} className="text-white fill-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Rank</p>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Top 5% <span className="text-xs font-normal px-2 py-1 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full flex items-center gap-1">
                                    <TrendingUp size={12} /> +12
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">You are doing better than 95% of tutors in your area!</p>
                        </div>
                    </div>

                    {/* Progress to Next Level */}
                    <div className="flex-1 w-full md:max-w-md">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Level 4: Expert Tutor</span>
                            <span className="text-slate-500">2,450 / 3,000 XP</span>
                        </div>
                        <Progress value={82} className="h-3" indicatorClassName="bg-gradient-to-r from-yellow-400 to-amber-600" />
                        <p className="text-xs text-slate-500 mt-2 text-right">550 XP needed for <span className="text-amber-500 font-bold">Master Tutor</span> status</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TutorRanking;
