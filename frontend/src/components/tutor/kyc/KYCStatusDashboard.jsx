"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Download, Eye, RefreshCw } from 'lucide-react';
import API_BASE_URL from '../../../config';

const KYCStatusDashboard = () => {
    const [kycData, setKycData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchKYCStatus();
    }, []);

    const fetchKYCStatus = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/kyc/status/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setKycData(data);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch KYC status');
            }
        } catch (err) {
            console.error('Error fetching KYC status:', err);
            setError('Failed to load KYC status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'NOT_SUBMITTED': {
                color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                icon: <AlertCircle className="h-5 w-5" />,
                text: 'Not Submitted'
            },
            'DRAFT': {
                color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                icon: <AlertCircle className="h-5 w-5" />,
                text: 'Draft'
            },
            'SUBMITTED': {
                color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                icon: <Clock className="h-5 w-5" />,
                text: 'Submitted'
            },
            'UNDER_REVIEW': {
                color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                icon: <Clock className="h-5 w-5 animate-pulse" />,
                text: 'Under Review'
            },
            'VERIFIED': {
                color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                icon: <CheckCircle className="h-5 w-5" />,
                text: 'Verified'
            },
            'REJECTED': {
                color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                icon: <XCircle className="h-5 w-5" />,
                text: 'Rejected'
            }
        };
        return badges[status] || badges['NOT_SUBMITTED'];
    };

    const getStatusMessage = (status) => {
        const messages = {
            'NOT_SUBMITTED': 'You haven\'t submitted your KYC documents yet. Click below to get started.',
            'DRAFT': 'Your KYC documents are saved as draft. Complete and submit them for verification.',
            'SUBMITTED': 'Your documents have been submitted and are waiting to be assigned to an admin.',
            'UNDER_REVIEW': 'Your documents are being reviewed by our admin team. This typically takes 24-48 hours.',
            'VERIFIED': 'Congratulations! Your KYC has been verified. You can now post job opportunities and appear in parent searches.',
            'REJECTED': 'Your KYC has been rejected. Please review the feedback below and re-submit corrected documents.'
        };
        return messages[status] || messages['NOT_SUBMITTED'];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading KYC status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-100 text-center mb-2">Error</h2>
                    <p className="text-red-700 dark:text-red-300 text-center mb-4">{error}</p>
                    <button
                        onClick={fetchKYCStatus}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const status = kycData?.kyc?.status || kycData?.status || 'NOT_SUBMITTED';
    const statusBadge = getStatusBadge(status);
    const kyc = kycData?.kyc;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => window.history.back()}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">KYC Verification Status</h1>
                </div>

                {/* Status Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 mb-8 border border-slate-200 dark:border-slate-800">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${statusBadge.color} mb-4`}>
                        {statusBadge.icon}
                        <span className="font-semibold text-lg">{statusBadge.text}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-lg">{getStatusMessage(status)}</p>
                    {status === 'UNDER_REVIEW' && (
                        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                ⏱️ <strong>Estimated review time:</strong> 24-48 hours
                            </p>
                        </div>
                    )}
                </div>

                {/* Timeline (if KYC exists) */}
                {kyc && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 mb-8 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Verification Timeline</h2>
                        <div className="space-y-6">
                            {/* Submitted */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    {kyc.assigned_at && <div className="w-0.5 h-12 bg-green-600 dark:bg-green-400 mt-2"></div>}
                                </div>
                                <div className="flex-1 pb-8">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Documents Submitted</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(kyc.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Assigned to Admin */}
                            {kyc.assigned_at && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        {status === 'UNDER_REVIEW' && <div className="w-0.5 h-12 bg-amber-600 dark:bg-amber-400 mt-2"></div>}
                                        {status === 'VERIFIED' && <div className="w-0.5 h-12 bg-green-600 dark:bg-green-400 mt-2"></div>}
                                    </div>
                                    <div className="flex-1 pb-8">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Assigned to Admin</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(kyc.assigned_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Under Review */}
                            {status === 'UNDER_REVIEW' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-6 w-6 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse"></div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-amber-700 dark:text-amber-300">Under Review</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">In Progress...</p>
                                    </div>
                                </div>
                            )}

                            {/* Verified */}
                            {status === 'VERIFIED' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-green-700 dark:text-green-300">Verification Complete</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {kyc.reviewed_at ? new Date(kyc.reviewed_at).toLocaleString() : 'Completed'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Rejected */}
                            {status === 'REJECTED' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-red-700 dark:text-red-300">Rejected</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {kyc.reviewed_at ? new Date(kyc.reviewed_at).toLocaleString() : 'Rejected'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Admin Feedback */}
                {(kycData?.admin_feedback || kycData?.rejection_reason) && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Admin Feedback
                        </h2>
                        <p className="text-amber-800 dark:text-amber-200">
                            {kycData.admin_feedback || kycData.rejection_reason}
                        </p>
                        {kycData?.documents_to_resubmit && kycData.documents_to_resubmit.length > 0 && (
                            <div className="mt-4">
                                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Documents to re-upload:</p>
                                <ul className="list-disc list-inside text-amber-800 dark:text-amber-200">
                                    {kycData.documents_to_resubmit.map((doc, idx) => (
                                        <li key={idx}>{doc}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    {status === 'NOT_SUBMITTED' && (
                        <button
                            onClick={() => window.location.href = '/tutor/kyc'}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Start KYC Verification
                        </button>
                    )}
                    {(status === 'DRAFT' || status === 'REJECTED') && (
                        <button
                            onClick={() => window.location.href = '/tutor/kyc'}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Re-upload Documents
                        </button>
                    )}
                    {status === 'VERIFIED' && (
                        <button
                            onClick={() => window.location.href = '/tutor/dashboard'}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    )}
                    <button
                        onClick={fetchKYCStatus}
                        className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-slate-100 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Need Help?</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        If you have questions about the verification process or need assistance, please contact our support team.
                    </p>
                    <button className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
                        Contact Support →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KYCStatusDashboard;

