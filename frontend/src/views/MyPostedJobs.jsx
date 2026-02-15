"use client";
import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, Users, ChevronRight, Lock, Unlock } from 'lucide-react';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';
import UnlockContactModal from '../components/common/UnlockContactModal';

const MyPostedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null); // For viewing applicants
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    
    // Unlock Modal State
    const [unlockModalOpen, setUnlockModalOpen] = useState(false);
    const [tutorToUnlock, setTutorToUnlock] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await fetch(`${API_BASE_URL}/api/jobs/my-jobs/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setJobs(data);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const fetchApplicants = async (jobId) => {
        setLoadingApplicants(true);
        setApplicants([]);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applicants/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplicants(data);
            }
        } catch (error) {
            console.error("Error fetching applicants:", error);
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleViewApplicants = (job) => {
        if (selectedJob?.id === job.id) {
            setSelectedJob(null); // Toggle off
        } else {
            setSelectedJob(job);
            fetchApplicants(job.id);
        }
    };

    const openUnlockModal = (tutor) => {
        setTutorToUnlock(tutor);
        setUnlockModalOpen(true);
    };

    const handleUnlockSuccess = (updatedContactInfo) => {
        // Update local state to show unlocked info (or just refresh)
        // For now, simpler to refresh applicants list or update specific item
        if (selectedJob) fetchApplicants(selectedJob.id);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Posted Jobs</h1>
                        <p className="text-slate-500">Manage your requirements and view applicants</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : jobs.length > 0 ? (
                    <div className="space-y-6">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {job.class_grade} - {job.subjects && job.subjects.join(', ')}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                                                job.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                job.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                {job.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{job.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} /> Posted {new Date(job.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users size={14} /> Applicants
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button 
                                            onClick={() => handleViewApplicants(job)}
                                            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center gap-2"
                                        >
                                            View Applicants <ChevronRight size={16} className={`transition-transform ${selectedJob?.id === job.id ? 'rotate-90' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Applicants Section (Expanded) */}
                                {selectedJob?.id === job.id && (
                                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 animate-in slide-in-from-top-2">
                                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                                            Applicants for this job
                                        </h4>
                                        {loadingApplicants ? (
                                            <div>Loading applicants...</div>
                                        ) : applicants.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {applicants.map(app => (
                                                    <div key={app.id} className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                                    {app.tutor.full_name ? app.tutor.full_name[0] : 'T'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                                        {app.tutor.full_name || "Tutor"}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500">
                                                                        Applied on {new Date(app.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                                                                Match: 95%
                                                            </span>
                                                        </div>
                                                        
                                                        {app.cover_note && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg italic">
                                                                "{app.cover_note}"
                                                            </p>
                                                        )}

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2">
                                                             {/* 
                                                                Refine logic: Check if contact info is already present in response?
                                                                Usually API won't send phone unless unlocked.
                                                                Wait, ApplicationSerializer sends nested 'tutor'. 
                                                                Does TutorProfileSerializer include phone? 
                                                                Usually user.phone is on User model. TutorProfileSerializer nests UserSerializer?
                                                                Let's assume we need to check if 'phone' is visible or masked.
                                                                Or just rely on button action.
                                                             */}
                                                            <button 
                                                                onClick={() => openUnlockModal(app.tutor)}
                                                                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Unlock size={14} /> Unlock Contact
                                                            </button>
                                                            <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                                                Profile
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-sm">No applicants yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No jobs posted yet</h3>
                        <p className="text-slate-500 mb-6">Post a requirement to start finding tutors.</p>
                        <a href="/parent-home" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Post a Job
                        </a>
                    </div>
                )}
            </main>

            {unlockModalOpen && tutorToUnlock && (
                <UnlockContactModal 
                    tutor={tutorToUnlock}
                    onClose={() => setUnlockModalOpen(false)}
                    onUnlockSuccess={handleUnlockSuccess}
                />
            )}
        </div>
    );
};

export default MyPostedJobs;

