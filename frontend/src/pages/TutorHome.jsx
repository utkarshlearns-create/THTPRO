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

    // Mock fetching profile status (In real app, fetch from /api/users/profile/ or similar)
    useEffect(() => {
        // Fetch Jobs
        fetchJobs();
        // Fetch Status (Mock for now, assumes 50% incomplete)
        // TODO: Replace with real API call
        setProfileStatus({ percent: 40, status: 'PROFILE_INCOMPLETE' });
    }, []);

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
        <div className="bg-slate-50 min-h-screen pb-20 pt-20 px-4">
             <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Find Teaching Jobs</h1>
                        <p className="text-slate-500 mt-1">Browse and apply to students looking for tutors in your area.</p>
                    </div>
                    
                    {/* Status Banner (Mobilish) */}
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 
                        ${canApply ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {canApply ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {canApply ? "You are eligible to apply" : `Complete Profile to Apply (${profileStatus.percent}%)`}
                    </div>
                </div>

                {/* Filters (Mock) */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex gap-4 overflow-x-auto">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium whitespace-nowrap">All Jobs</button>
                    <button className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium whitespace-nowrap">Mathematics</button>
                    <button className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium whitespace-nowrap">Science</button>
                    <button className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium whitespace-nowrap">English</button>
                    <button className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium whitespace-nowrap">Nearby</button>
                </div>

                {/* Job List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10">Loading Jobs...</div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                             <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
                             <h3 className="text-lg font-semibold text-slate-900">No Jobs Found</h3>
                             <p className="text-slate-500">Check back later for new requirements.</p>
                        </div>
                    ) : (
                        jobs.map(job => (
                            <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                                {job.class_grade}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                {job.board || 'Any Board'}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {job.subjects && job.subjects.join('/')} Tutor Needed
                                        </h2>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600 text-sm mb-4">
                                            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {job.locality}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {job.preferred_time || 'Flexible'}</span>
                                            <span className="flex items-center gap-1.5"><Wallet size={16} className="text-slate-400" /> {job.budget_range || 'Negotiable'}</span>
                                        </div>
                                         <p className="text-slate-500 text-sm">
                                            Student: {job.student_gender} • Looking for {job.status === 'OPEN' ? 'immediate start' : 'later'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <button 
                                            disabled={!canApply}
                                            className={`px-8 py-3 rounded-xl font-bold transition-all w-full md:w-auto
                                            ${canApply 
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
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
