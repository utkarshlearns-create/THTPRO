"use client";
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';

const EarningsChart = () => {
    // Earnings feature not yet implemented - show coming soon message
    return (
        <Card className="col-span-4 lg:col-span-2">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center h-[280px]">
                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                    <Wallet className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Earnings Tracking
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                    Earnings tracking will be available once you start accepting tuition jobs. 
                    Complete your profile and KYC to get started!
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>Feature coming soon</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default EarningsChart;

