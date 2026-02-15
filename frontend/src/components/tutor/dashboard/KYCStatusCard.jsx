"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { CheckCircle, Clock, XCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import API_BASE_URL from '../../../config';

const KYCStatusCard = () => {
    const router = useRouter();
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKYCStatus();
    }, []);

    const fetchKYCStatus = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/kyc/status/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setKycStatus(data);
            }
        } catch (error) {
            console.error('Error fetching KYC status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="col-span-4">
                <CardContent className="p-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </CardContent>
            </Card>
        );
    }

    // Determine status details
    const getStatusConfig = () => {
        const status = kycStatus?.status || 'NOT_SUBMITTED';
        
        const configs = {
            'NOT_SUBMITTED': {
                icon: AlertCircle,
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                border: 'border-amber-200 dark:border-amber-900/50',
                label: 'Not Submitted',
                message: 'Upload your KYC documents to get verified',
                action: 'Upload Documents',
                actionLink: '/dashboard/tutor?tab=profile&section=verification'
            },
            'SUBMITTED': {
                icon: Clock,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                border: 'border-blue-200 dark:border-blue-900/50',
                label: 'Under Review',
                message: 'Your documents are being reviewed by our team',
                action: 'View Status',
                actionLink: '/tutor/kyc/status'
            },
            'APPROVED': {
                icon: CheckCircle,
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-50 dark:bg-green-900/20',
                border: 'border-green-200 dark:border-green-900/50',
                label: 'Verified',
                message: 'Your account is verified! You can now apply to jobs',
                action: 'Browse Jobs',
                actionLink: '/dashboard/tutor?tab=tuitions'
            },
            'REJECTED': {
                icon: XCircle,
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-900/50',
                label: 'Rejected',
                message: kycStatus?.admin_feedback || 'Please review feedback and re-upload documents',
                action: 'Re-upload Documents',
                actionLink: '/dashboard/tutor?tab=profile&section=verification'
            },
            'RESUBMIT_REQUIRED': {
                icon: AlertCircle,
                color: 'text-orange-600 dark:text-orange-400',
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                border: 'border-orange-200 dark:border-orange-900/50',
                label: 'Changes Needed',
                message: kycStatus?.admin_feedback || 'Some documents need to be re-uploaded',
                action: 'Update Documents',
                actionLink: '/dashboard/tutor?tab=profile&section=verification'
            }
        };

        return configs[status] || configs['NOT_SUBMITTED'];
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    // Timeline steps
    const timelineSteps = [
        { label: 'Submitted', completed: kycStatus?.status !== 'NOT_SUBMITTED' },
        { label: 'Under Review', completed: ['SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMIT_REQUIRED'].includes(kycStatus?.status) },
        { label: 'Verified', completed: kycStatus?.status === 'APPROVED' }
    ];

    return (
        <Card className={cn("col-span-4 border-2", config.border)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", config.bg)}>
                        <FileText className={cn("h-5 w-5", config.color)} />
                    </div>
                    KYC Verification Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-3 rounded-full", config.bg)}>
                                <StatusIcon className={cn("h-6 w-6", config.color)} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {config.label}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {config.message}
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="sapphire" 
                            onClick={() => router.push(config.actionLink)}
                            className="flex items-center gap-2"
                        >
                            {config.action}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Timeline (only show if submitted) */}
                    {kycStatus?.status !== 'NOT_SUBMITTED' && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                {timelineSteps.map((step, index) => (
                                    <React.Fragment key={step.label}>
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                                                step.completed 
                                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                                            )}>
                                                {step.completed ? (
                                                    <CheckCircle className="h-5 w-5" />
                                                ) : (
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                )}
                                            </div>
                                            <span className={cn(
                                                "text-xs mt-2 font-medium",
                                                step.completed 
                                                    ? "text-slate-900 dark:text-white" 
                                                    : "text-slate-500 dark:text-slate-400"
                                            )}>
                                                {step.label}
                                            </span>
                                        </div>
                                        {index < timelineSteps.length - 1 && (
                                            <div className={cn(
                                                "flex-1 h-0.5 mx-2 transition-colors",
                                                step.completed 
                                                    ? "bg-indigo-600" 
                                                    : "bg-slate-300 dark:bg-slate-700"
                                            )} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Feedback (if rejected or resubmit) */}
                    {kycStatus?.admin_feedback && ['REJECTED', 'RESUBMIT_REQUIRED'].includes(kycStatus?.status) && (
                        <div className={cn("p-4 rounded-lg border", config.bg, config.border)}>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                Admin Feedback:
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {kycStatus.admin_feedback}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default KYCStatusCard;



