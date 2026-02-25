"use client";
import React from 'react';
import { MapPin, Clock, Banknote, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

const JobCard = ({ job }) => {
    const router = useRouter();

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING_APPROVAL':
                return (
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-100 dark:border-amber-800 flex items-center gap-1.5 shadow-sm">
                        <Clock size={12} className="animate-pulse" /> Under Review
                    </span>
                );
            case 'APPROVED':
            case 'ACTIVE':
                return (
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-100 dark:border-emerald-800 shadow-sm">
                        Active
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-full border border-rose-100 dark:border-rose-800 shadow-sm">
                        Rejected
                    </span>
                );
            case 'MODIFICATIONS_NEEDED':
                return (
                    <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full border border-orange-100 dark:border-orange-800 shadow-sm">
                        Needs Changes
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                        {status || 'Unknown'}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {job.class_grade} Need
                    </h3>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                        <MapPin size={14} className="mr-1" />
                        {job.locality || 'Remote/TBD'}
                    </div>
                </div>
                {getStatusBadge(job.status)}
            </div>

            <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                    {Array.isArray(job.subjects) && job.subjects.map((subject, index) => (
                        <span key={index} className="flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md">
                            <BookOpen size={12} className="mr-1.5" />
                            {subject}
                        </span>
                    ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                    {job.requirements || "No details provided."}
                </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center text-slate-700 dark:text-slate-300 font-semibold text-sm">
                        <Banknote size={16} className="mr-1.5 text-emerald-500" />
                        {job.budget_range || (job.hourly_rate ? `₹${job.hourly_rate}/hr` : 'Negotiable')}
                    </div>
                    <div className="flex items-center text-slate-400 text-xs">
                        <Clock size={12} className="mr-1.5" />
                        Posted {formatDate(job.created_at)}
                    </div>
                </div>
                
                <button 
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default JobCard;



