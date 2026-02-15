"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Edit, Clock, MapPin, BookOpen, GraduationCap, IndianRupee } from 'lucide-react';
import API_BASE_URL from '../../../config';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';

const PendingJobApprovals = () => {
    const [pendingJobs, setPendingJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [modificationFeedback, setModificationFeedback] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'approve', 'reject', 'modify'

    useEffect(() => {
        fetchPendingJobs();
    }, []);

    const fetchPendingJobs = async () => {
        const token = localStorage.getItem('access');
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/pending/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPendingJobs(data);
            }
        } catch (error) {
            console.error('Error fetching pending jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (jobId) => {
        const token = localStorage.getItem('access');
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/${jobId}/approve/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                alert('Job approved successfully!');
                fetchPendingJobs();
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error approving job:', error);
            alert('Failed to approve job');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (jobId) => {
        const token = localStorage.getItem('access');
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/${jobId}/reject/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectionReason })
            });
            if (response.ok) {
                alert('Job rejected');
                fetchPendingJobs();
                setShowModal(false);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Error rejecting job:', error);
            alert('Failed to reject job');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestModifications = async (jobId) => {
        const token = localStorage.getItem('access');
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/${jobId}/request-modifications/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ feedback: modificationFeedback })
            });
            if (response.ok) {
                alert('Modification request sent');
                fetchPendingJobs();
                setShowModal(false);
                setModificationFeedback('');
            }
        } catch (error) {
            console.error('Error requesting modifications:', error);
            alert('Failed to send modification request');
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (job, type) => {
        setSelectedJob(job);
        setModalType(type);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Job Approvals</h2>
                    <p className="text-slate-500 dark:text-slate-400">Review and approve tutor job postings</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full">
                    <span className="text-indigo-700 dark:text-indigo-300 font-semibold">{pendingJobs.length} Pending</span>
                </div>
            </div>

            {pendingJobs.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
                        <p className="text-slate-500 dark:text-slate-400">No pending job approvals at the moment.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {pendingJobs.map((job) => (
                        <Card key={job.id} className="border-l-4 border-l-amber-500">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {job.class_grade} {job.board} - {job.subjects.join(', ')}
                                        </CardTitle>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Posted by: {job.posted_by_username || 'Tutor'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending Review</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{job.locality}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{job.preferred_time || 'Flexible'}</span>
                                    </div>
                                    {job.hourly_rate && (
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm text-slate-600 dark:text-slate-300">₹{job.hourly_rate}/hr</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{job.subjects.length} subjects</span>
                                    </div>
                                </div>

                                {job.requirements && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{job.requirements}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={() => openModal(job, 'approve')}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => openModal(job, 'reject')}
                                        variant="destructive"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => openModal(job, 'modify')}
                                        variant="outline"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Request Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && selectedJob && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {modalType === 'approve' && 'Approve Job Posting'}
                            {modalType === 'reject' && 'Reject Job Posting'}
                            {modalType === 'modify' && 'Request Modifications'}
                        </h3>

                        {modalType === 'approve' && (
                            <p className="text-slate-600 dark:text-slate-300">
                                Are you sure you want to approve this job posting? It will become visible to parents.
                            </p>
                        )}

                        {modalType === 'reject' && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Rejection Reason
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="Explain why this job is being rejected..."
                                />
                            </div>
                        )}

                        {modalType === 'modify' && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Modification Feedback
                                </label>
                                <textarea
                                    value={modificationFeedback}
                                    onChange={(e) => setModificationFeedback(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="What changes are needed?"
                                />
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowModal(false);
                                    setRejectionReason('');
                                    setModificationFeedback('');
                                }}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (modalType === 'approve') handleApprove(selectedJob.id);
                                    else if (modalType === 'reject') handleReject(selectedJob.id);
                                    else if (modalType === 'modify') handleRequestModifications(selectedJob.id);
                                }}
                                disabled={actionLoading || (modalType === 'reject' && !rejectionReason) || (modalType === 'modify' && !modificationFeedback)}
                                className={modalType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                                {actionLoading ? 'Processing...' : 'Confirm'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingJobApprovals;

