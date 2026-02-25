"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    MapPin, Clock, Banknote, BookOpen, User, Calendar, Share2, AlertCircle, ChevronLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import Navbar from '@/components/Navbar';
import API_BASE_URL from '@/config';
import { Button } from '@/components/ui/button';

export default function JobDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            const token = localStorage.getItem('access');
            try {
                const res = await fetch(`${API_BASE_URL}/api/jobs/${id}/`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (res.ok) {
                    const data = await res.json();
                    setJob(data);
                } else if (res.status === 404) {
                    setError('Job not found or unavailable.');
                } else {
                    setError('Failed to load job details.');
                }
            } catch (err) {
                console.error('Error fetching job details:', err);
                setError('Network error occurred.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchJob();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusTheme = (status) => {
        switch (status) {
            case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'APPROVED': case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'REJECTED': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'MODIFICATIONS_NEEDED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-16 w-16 text-rose-500 mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{error || 'Job not found'}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">The job you are looking for does not exist, has been taken down, or you do not have permission to view it.</p>
                    <Button onClick={() => router.back()} className="bg-indigo-600 text-white hover:bg-indigo-700">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-6 transition-colors"
                >
                    <ChevronLeft size={16} className="mr-1" /> Back
                </button>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-10 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        {job.class_grade} Requirement
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusTheme(job.status)}`}>
                                        {job.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    <span className="flex items-center">
                                        <MapPin size={16} className="mr-2 text-indigo-500" />
                                        {job.locality}
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar size={16} className="mr-2 text-indigo-500" />
                                        Posted {formatDate(job.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="border-slate-200 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Link copied to clipboard!');
                                }}>
                                    <Share2 size={16} className="mr-2" /> Share
                                </Button>
                            </div>
                        </div>

                        {job.status === 'PENDING_APPROVAL' && (
                            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start text-amber-800 dark:text-amber-300">
                                <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">This job is currently under review.</p>
                                    <p className="text-xs mt-1 opacity-90">It will not be visible to tutors until our team approves it.</p>
                                </div>
                            </div>
                        )}
                        {job.status === 'REJECTED' && (
                            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-start text-rose-800 dark:text-rose-300">
                                <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">This requirement was rejected.</p>
                                    {job.rejection_reason && <p className="text-xs mt-1 opacity-90">Reason: {job.rejection_reason}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 sm:p-10 bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Requirement Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Academic Info</p>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center text-slate-700 dark:text-slate-300">
                                            <span className="w-24 font-medium text-slate-900 dark:text-white">Board:</span> {job.board}
                                        </div>
                                        <div className="flex items-center text-slate-700 dark:text-slate-300">
                                            <span className="w-24 font-medium text-slate-900 dark:text-white">Subjects:</span>
                                            <div className="flex flex-wrap gap-1.5 ml-1">
                                                {Array.isArray(job.subjects) && job.subjects.map((sub, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-semibold">
                                                        {sub}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Preferences</p>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center text-slate-700 dark:text-slate-300">
                                            <span className="w-32 font-medium text-slate-900 dark:text-white">Tuition Mode:</span> {job.tuition_mode.replace(/_/g, ' ')}
                                        </div>
                                        <div className="flex items-center text-slate-700 dark:text-slate-300">
                                            <span className="w-32 font-medium text-slate-900 dark:text-white">Tutor Gender:</span> {job.tutor_gender_preference}
                                        </div>
                                        <div className="flex items-center text-slate-700 dark:text-slate-300">
                                            <span className="w-32 font-medium text-slate-900 dark:text-white">Student Gender:</span> {job.student_gender || 'Not Specified'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Schedule & Financials</p>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mr-3">
                                                <Banknote size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Budget / Rate</p>
                                                <p className="text-base font-bold text-slate-900 dark:text-white">
                                                    {job.budget_range || (job.hourly_rate ? `₹${job.hourly_rate}/hr` : 'Negotiable')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mr-3">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Preferred Time</p>
                                                <p className="text-base font-bold text-slate-900 dark:text-white">
                                                    {job.preferred_time || 'Flexible'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {job.requirements && (
                            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Additional Requirements</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                    {job.requirements}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
