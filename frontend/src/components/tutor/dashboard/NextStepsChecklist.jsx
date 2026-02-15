"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { CheckCircle2, Circle, ArrowRight, Loader } from 'lucide-react';
import { cn } from '../../../lib/utils';
import API_BASE_URL from '../../../config';

const NextStepsChecklist = () => {
    const router = useRouter();
    const [profileData, setProfileData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('access');
            
            // Fetch profile and stats in parallel
            const [profileRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/users/profile/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/users/dashboard/stats/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfileData(profileData);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="col-span-4">
                <CardContent className="p-8 flex items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin text-indigo-600" />
                </CardContent>
            </Card>
        );
    }

    // Define steps based on user's current status
    const steps = [
        {
            id: 1,
            label: 'Complete Your Profile',
            description: 'Fill in all required information',
            completed: (profileData?.profile_completion_percentage || 0) === 100,
            action: 'Complete Now',
            link: '/dashboard/tutor?tab=profile'
        },
        {
            id: 2,
            label: 'Upload KYC Documents',
            description: 'Submit verification documents',
            completed: profileData?.status_msg?.status !== 'SIGNED_UP' && profileData?.status_msg?.status !== 'PROFILE_INCOMPLETE',
            action: 'Upload Documents',
            link: '/dashboard/tutor?tab=profile&section=verification',
            disabled: (profileData?.profile_completion_percentage || 0) < 100
        },
        {
            id: 3,
            label: 'Get Verified',
            description: 'Wait for admin approval',
            completed: profileData?.status_msg?.status === 'APPROVED',
            action: 'View Status',
            link: '/tutor/kyc/status',
            disabled: profileData?.status_msg?.status === 'SIGNED_UP' || profileData?.status_msg?.status === 'PROFILE_INCOMPLETE'
        },
        {
            id: 4,
            label: 'Apply to Your First Job',
            description: 'Start your teaching journey',
            completed: (stats?.total_applications || 0) > 0,
            action: 'Browse Jobs',
            link: '/dashboard/tutor?tab=tuitions',
            disabled: profileData?.status_msg?.status !== 'APPROVED'
        }
    ];

    // Calculate progress
    const completedSteps = steps.filter(s => s.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;

    // Find current step (first incomplete step)
    const currentStepIndex = steps.findIndex(s => !s.completed);
    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

    return (
        <Card className="col-span-4 border-2 border-indigo-200 dark:border-indigo-900/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Next Steps</CardTitle>
                    <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {completedSteps}/{totalSteps} Completed
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {steps.map((step, index) => {
                        const isCompleted = step.completed;
                        const isCurrent = !isCompleted && index === currentStepIndex;
                        const isDisabled = step.disabled;

                        return (
                            <div 
                                key={step.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                                    isCompleted && "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50",
                                    isCurrent && "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-900/50 shadow-md",
                                    !isCompleted && !isCurrent && "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800",
                                    isDisabled && "opacity-50"
                                )}
                            >
                                {/* Step Icon */}
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2",
                                    isCompleted && "bg-green-600 border-green-600",
                                    isCurrent && "bg-indigo-600 border-indigo-600 animate-pulse",
                                    !isCompleted && !isCurrent && "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                )}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    ) : (
                                        <span className={cn(
                                            "text-sm font-bold",
                                            isCurrent ? "text-white" : "text-slate-500 dark:text-slate-400"
                                        )}>
                                            {step.id}
                                        </span>
                                    )}
                                </div>

                                {/* Step Content */}
                                <div className="flex-1">
                                    <h4 className={cn(
                                        "font-semibold",
                                        isCompleted && "text-green-900 dark:text-green-100",
                                        isCurrent && "text-indigo-900 dark:text-indigo-100",
                                        !isCompleted && !isCurrent && "text-slate-700 dark:text-slate-300"
                                    )}>
                                        {step.label}
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Action Button */}
                                {!isCompleted && !isDisabled && (
                                    <button
                                        onClick={() => router.push(step.link)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                                            isCurrent 
                                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg" 
                                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        )}
                                    >
                                        {step.action}
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}

                                {isCompleted && (
                                    <div className="text-green-600 dark:text-green-400 text-sm font-semibold">
                                        ✓ Done
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>


                {/* Completion Message */}
                {completedSteps === totalSteps && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-900/50 rounded-xl text-center">
                        <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                            🎉 Congratulations!
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            You've completed all onboarding steps. Start applying to jobs and build your teaching career!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default NextStepsChecklist;



