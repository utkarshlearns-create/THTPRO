import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { MapPin, Clock, IndianRupee } from 'lucide-react';

const jobs = [
    { id: 1, subject: 'Mathematics (Class 10)', loc: 'Indira Nagar', pay: '₹500/hr', dist: '2.5 km' },
    { id: 2, subject: 'Physics (Class 12)', loc: 'Gomti Nagar', pay: '₹800/hr', dist: '5.0 km' },
    { id: 3, subject: 'Chemistry (NEET)', loc: 'Aliganj', pay: '₹1200/hr', dist: '3.2 km' },
    { id: 4, subject: 'English (Class 8)', loc: 'Hazratganj', pay: '₹400/hr', dist: '1.5 km' },
];

const JobMatchList = () => {
    return (
        <div className="col-span-4 space-y-4">
            <div className="flex justify-between items-end">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recommended Jobs</h3>
                <button className="text-xs text-indigo-600 dark:text-sky-400 hover:text-indigo-700 dark:hover:text-sky-300">View All</button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {jobs.map((job) => (
                    <Card key={job.id} className="snap-center min-w-[280px] p-5 border group relative overflow-hidden text-left">
                        {/* Shimmer Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md">New Match</span>
                            <span className="text-xs text-slate-500">{job.dist}</span>
                        </div>
                        
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">{job.subject}</h4>
                        
                        <div className="space-y-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
                             <div className="flex items-center gap-2"><MapPin size={14}/> {job.loc}</div>
                             <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><IndianRupee size={14}/> {job.pay}</div>
                        </div>
                        
                        <Button size="sm" variant="sapphire" className="w-full">
                            Unlock & Apply
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default JobMatchList;
