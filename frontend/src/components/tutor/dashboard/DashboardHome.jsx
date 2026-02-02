import React from 'react';
import EarningsChart from './EarningsChart';
import EngagementStats from './EngagementStats';
import PerformanceRadial from './PerformanceRadial';
import ApplicationFunnel from './ApplicationFunnel';
import JobMatchList from './JobMatchList';
import UpcomingClasses from './UpcomingClasses';
import QuickActions from './QuickActions';
import TutorRanking from './TutorRanking';
import KYCStatusCard from './KYCStatusCard';
import NextStepsChecklist from './NextStepsChecklist';
import { CircularProgress } from '../../ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

const DashboardHome = ({ user, completionPercentage }) => {
    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
             {/* Profile Completion Banner (if not 100%) */}
             {completionPercentage < 100 && (
                 <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 border-indigo-500/30">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                             <CircularProgress value={completionPercentage} size={80} strokeWidth={6} showValue={false} />
                             <div>
                                 <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
                                 <p className="text-slate-400 max-w-md">
                                     You are <span className="text-sky-400 font-bold">{completionPercentage}%</span> there! 
                                     Complete your profile to unlock job applications and boost visibility.
                                 </p>
                             </div>
                        </div>
                        <Button variant="sapphire" onClick={() => window.location.href = '?tab=profile'}>
                            Complete Now
                        </Button>
                    </CardContent>
                 </Card>
             )}

            {/* Critical Action Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NextStepsChecklist />
                <KYCStatusCard />
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                <QuickActions />
                <ApplicationFunnel />

                {/* Coming Soon Features */}
                {/* Row 1: Ranking Banner */}
                <TutorRanking />

                {/* Row 2: Earnings & Upcoming Classes */}
                <EarningsChart />
                <UpcomingClasses />

                {/* Row 3: Performance, Stats */}
                <PerformanceRadial />
                <EngagementStats />
                
                {/* Job Matches */}
                <JobMatchList />
            </div>
        </div>
    );
};

export default DashboardHome;
