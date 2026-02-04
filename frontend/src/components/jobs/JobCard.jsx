import React from 'react';
import { MapPin, Clock, Banknote, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800">
                    Active
                </span>
            </div>

            <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                    {job.subjects && job.subjects.map((subject, index) => (
                        <span key={index} className="flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md">
                            <BookOpen size={12} className="mr-1.5" />
                            {subject}
                        </span>
                    ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                    {job.description || "No description provided."}
                </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center text-slate-700 dark:text-slate-300 font-semibold text-sm">
                        <Banknote size={16} className="mr-1.5 text-emerald-500" />
                        ₹{job.budget_min} - ₹{job.budget_max}/mo
                    </div>
                    <div className="flex items-center text-slate-400 text-xs">
                        <Clock size={12} className="mr-1.5" />
                        Posted {formatDate(job.created_at)}
                    </div>
                </div>
                
                <button 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default JobCard;
