"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { MapPin, Clock, IndianRupee } from 'lucide-react';

const JobMatchList = ({ onViewAll, userLocality }) => {
    const router = useRouter();
    const [jobs, setJobs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('access');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            let url = `${API_BASE_URL}/api/jobs/`;
            if (userLocality) {
                url = `${API_BASE_URL}/api/jobs/search/?location=${encodeURIComponent(userLocality)}`;
            }
            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                setJobs(Array.isArray(data) ? data : (data.results || []));
            }
        } catch (error) {
            console.error("Error fetching job matches:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="col-span-4 space-y-4">
            <div className="flex justify-between items-end">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recommended Jobs</h3>
                <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => onViewAll ? onViewAll() : router.push('/find-jobs')}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-sky-400 dark:border-sky-900/50 dark:hover:bg-sky-900/20"
                >
                    View All Jobs
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(jobs) && jobs.length > 0 ? (
                    jobs.map((job) => (
                        <Card key={job.id} className="p-6 border group relative overflow-hidden text-left bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
                            {/* Shimmer Effect on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                            
                            <div className="flex justify-between items-start mb-3">
                                <span className="px-2 py-1 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md">
                                    {job.class_grade}
                                </span>
                                <span className="text-xs text-slate-400">{new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                            
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1 leading-tight">
                                {Array.isArray(job.subjects) ? job.subjects.join(', ') : 'General'} Tutor
                            </h4>
                            <p className="text-xs text-slate-500 mb-4">{job.board || 'Any Board'}</p>
                            
                            <div className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                                 <div className="flex items-center gap-2"><MapPin size={16} className="text-slate-400"/> {job.locality}</div>
                                 <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><IndianRupee size={16}/> {job.budget_range || 'Negotiable'}</div>
                                 <div className="flex items-center gap-2 italic"><Clock size={16} className="text-slate-400"/> {job.preferred_time || 'Flexible'}</div>
                            </div>
                            
                            <Button 
                                size="sm" 
                                variant="sapphire" 
                                className="w-full h-11 text-sm font-bold"
                                onClick={() => router.push(`/jobs/${job.id}`)}
                            >
                                Unlock & Apply
                            </Button>
                        </Card>
                    ))
                ) : (
                    <div className="w-full p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">No active jobs nearby right now</h4>
                        <p className="text-sm text-slate-500 max-w-sm">
                            We will notify you when a new tuition requirement matches your profile and location. Keep your profile updated to get better matches!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobMatchList;

