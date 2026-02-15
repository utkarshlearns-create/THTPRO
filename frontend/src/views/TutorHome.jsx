"use client";
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Search,
  BookOpen
} from 'lucide-react';
import API_BASE_URL from '../config';

const TutorHome = () => {
    const [jobs, setJobs] = useState([]); // All Open Jobs
    const [loading, setLoading] = useState(true);
    const [profileStatus, setProfileStatus] = useState({ percent: 0, status: 'SIGNED_UP' });

    // Fetch profile status and jobs
    useEffect(() => {
        fetchJobs();
        fetchProfileStatus();
    }, []);

    const fetchProfileStatus = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfileStatus({ 
                    percent: data.profile_completion_percentage || 0, 
                    status: data.status_msg?.status || 'SIGNED_UP' 
                });
            }
        } catch (error) {
            console.error("Error fetching profile status:", error);
        }
    };

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/`, {
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

    const canApply = profileStatus.percent >= 80 && profileStatus.status === 'APPROVED';

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20 pt-20 px-4 transition-colors duration-300">
             <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Find Teaching Jobs</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Browse and apply to students looking for tutors in your area.</p>
                    </div>
                    
                    {/* Status Banner (Mobilish) */}
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 
                        ${canApply ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'}`}>
                        {canApply ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {canApply ? "You are eligible to apply" : `Complete Profile to Apply (${profileStatus.percent}%)`}
                    </div>
                </div>

                {/* Filters (Mock) */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex gap-4 overflow-x-auto">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium whitespace-nowrap hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors">All Jobs</button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg font-medium whitespace-nowrap transition-colors">Mathematics</button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg font-medium whitespace-nowrap transition-colors">Science</button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg font-medium whitespace-nowrap transition-colors">English</button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg font-medium whitespace-nowrap transition-colors">Nearby</button>
                </div>

                {/* Job List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading Jobs...</div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                             <Briefcase size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Jobs Found</h3>
                             <p className="text-slate-500 dark:text-slate-400">Check back later for new requirements.</p>
                        </div>
                    ) : (
                        jobs.map(job => (
                            <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wide border border-indigo-100 dark:border-indigo-900/50">
                                                {job.class_grade}
                                            </span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                {job.board || 'Any Board'}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {job.subjects && job.subjects.join('/')} Tutor Needed
                                        </h2>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600 dark:text-slate-400 text-sm mb-4">
                                            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400 dark:text-slate-500" /> {job.locality}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400 dark:text-slate-500" /> {job.preferred_time || 'Flexible'}</span>
                                            <span className="flex items-center gap-1.5"><Wallet size={16} className="text-slate-400 dark:text-slate-500" /> {job.budget_range || 'Negotiable'}</span>
                                        </div>
                                         <p className="text-slate-500 dark:text-slate-500 text-sm">
                                            Student: {job.student_gender} • Looking for {job.status === 'OPEN' ? 'immediate start' : 'later'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <button 
                                            disabled={!canApply}
                                            className={`px-8 py-3 rounded-xl font-bold transition-all w-full md:w-auto
                                            ${canApply 
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-none' 
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}
                                            `}
                                        >
                                            {canApply ? 'Apply Now' : 'Complete Profile'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>
    );
};

export default TutorHome;

