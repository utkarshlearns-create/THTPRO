"use client";
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import API_BASE_URL from '../config';
import TutorHero from '../components/tutor/TutorHero';
import TutorFeatureCards from '../components/tutor/TutorFeatureCards';
import TutorHowItWorks from '../components/tutor/TutorHowItWorks';
import TutorTestimonials from '../components/tutor/TutorTestimonials';

const TutorHome = () => {
    const [jobs, setJobs] = useState([]); // All Open Jobs
    const [loading, setLoading] = useState(true);
    const [profileStatus, setProfileStatus] = useState({ percent: 0, status: 'SIGNED_UP' });
    const [activeCategory, setActiveCategory] = useState('All');
    const router = useRouter();

    // Fetch profile status and jobs
    useEffect(() => {
        fetchJobs(activeCategory);
        fetchProfileStatus();
    }, [activeCategory]);

    const fetchProfileStatus = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) return;
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

    const fetchJobs = async (category = 'All') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            let url = `${API_BASE_URL}/api/jobs/`;
            if (category !== 'All') {
                // We use the search endpoint for specific categories to leverage filters
                url = `${API_BASE_URL}/api/jobs/search/?subject=${encodeURIComponent(category)}`;
            }

            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                setJobs(Array.isArray(data) ? data : (data.results || []));
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const canApply = profileStatus.percent >= 80 && (profileStatus.status === 'APPROVED' || profileStatus.status === 'ACTIVE');

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen pb-32 transition-colors duration-300">
            {/* 1. HERO SECTION (Full width, light blue) */}
            <TutorHero />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-24">
                
                {/* 2. FEATURE CARDS */}
                <TutorFeatureCards />

                {/* 3. HOW IT WORKS */}
                <TutorHowItWorks />

                {/* 4. FIND JOBS SECTION (The core utility) */}
                <div id="browse-jobs" className="scroll-mt-32">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Latest Student Requirements</h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400">Apply to thousands of verified tutoring opportunities near you.</p>
                        </div>
                        
                        {/* Status Banner */}
                        <div className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm
                            ${canApply ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'}`}>
                            {canApply ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {canApply ? "You are verified & eligible to apply" : `Complete Profile to Apply (${profileStatus.percent}%)`}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] shadow-premium border border-slate-100 dark:border-white/5 mb-12 flex gap-3 overflow-x-auto custom-scrollbar">
                        {[
                            { name: 'All', label: 'All Categories' },
                            { name: 'Mathematics', label: 'Mathematics' },
                            { name: 'Science', label: 'Science' },
                            { name: 'English', label: 'English Language' },
                            { name: 'Social Studies', label: 'Social Studies' }
                        ].map((cat) => (
                            <button 
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300
                                    ${activeCategory === cat.name 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105' 
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Job List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            <div className="col-span-2 text-center py-20">
                                <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-slate-500">Loading live opportunities...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="col-span-2 text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <Briefcase size={64} className="text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No Jobs Found</h3>
                                <p className="text-slate-500 dark:text-slate-400">Check back later for new student requirements.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <div key={job.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-premium border border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group">
                                    <div className="flex flex-col h-full justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-black rounded-full uppercase tracking-[0.15em] border border-indigo-100 dark:border-indigo-900/50">
                                                    {job.class_grade}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none">
                                                    {job.board || 'Any Board'}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                                {job.subjects && job.subjects.join('/')} Tutor Needed
                                            </h2>
                                            <div className="grid grid-cols-2 gap-4 text-slate-600 dark:text-slate-400 text-sm mb-6">
                                                <span className="flex items-center gap-2 font-medium bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl"><MapPin size={18} className="text-indigo-500" /> {job.locality}</span>
                                                <span className="flex items-center gap-2 font-medium bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl"><Clock size={18} className="text-indigo-500" /> {job.preferred_time || 'Flexible'}</span>
                                                <span className="flex items-center gap-2 font-medium bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl"><Wallet size={18} className="text-indigo-500" /> {job.budget_range || 'Negotiable'}</span>
                                                <span className="flex items-center gap-2 font-medium bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl"><UserPlus size={18} className="text-indigo-500" /> {job.student_gender} Student</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <button 
                                                disabled={!canApply}
                                                onClick={() => router.push(`/jobs/${job.id}`)}
                                                className={`px-8 py-4 rounded-2xl font-black transition-all w-full text-lg shadow-xl
                                                ${canApply 
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 dark:hover:shadow-none' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}
                                                `}
                                            >
                                                {canApply ? 'Apply for this Job' : 'Complete Profile to Apply'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 5. TESTIMONIALS */}
                <TutorTestimonials />

             </div>
        </div>
    );
};

export default TutorHome;

