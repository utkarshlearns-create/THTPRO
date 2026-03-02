"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
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
import DashboardHero from './DashboardHero';
import InspirationCards from './InspirationCards';

const DashboardHome = ({ user, completionPercentage, stats }) => {
    const router = useRouter();

    return (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700 pb-10">
            {/* Premium Hero Section */}
            <DashboardHero user={user} completionPercentage={completionPercentage} />

            {/* Inspiration / Feature Highlight Cards (Show if profile not 100% or just for aesthetic) */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Highlights</h2>
                        <p className="text-slate-500 dark:text-slate-400">Everything you need to succeed as a professional tutor.</p>
                    </div>
                </div>
                <InspirationCards />
            </div>

            {/* Critical Action Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Your Onboarding</h3>
                    <NextStepsChecklist />
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Verification Status</h3>
                    <KYCStatusCard />
                </div>
            </div>

            {/* Main Stats and Activities Grid */}
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Center</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <QuickActions />
                    <ApplicationFunnel stats={stats} />

                    {/* Row 1: Ranking Banner */}
                    <div className="lg:col-span-2">
                        <TutorRanking />
                    </div>

                    {/* Row 2: Earnings & Upcoming Classes */}
                    <div className="lg:col-span-2">
                        <EarningsChart />
                    </div>
                    <div className="lg:col-span-2">
                        <UpcomingClasses />
                    </div>

                    {/* Row 3: Performance, Stats */}
                    <div className="lg:col-span-2">
                        <PerformanceRadial />
                    </div>
                    <div className="lg:col-span-2">
                        <EngagementStats />
                    </div>
                    
                    {/* Full Width Job Matches */}
                    <div className="lg:col-span-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Job Matches</h3>
                            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 font-semibold" onClick={() => router.push('/dashboard/tutor?tab=tuitions')}>
                                View All Matches <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                        <JobMatchList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;



