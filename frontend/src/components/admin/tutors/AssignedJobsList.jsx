"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';
import API_BASE_URL from '../../../config';
import { toast } from 'react-hot-toast';

export default function AssignedJobsList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAssignedJobs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            // Fetch HIRED applications = Assigned/Active Jobs
            const response = await fetch(`${API_BASE_URL}/api/jobs/crm/applications/?status=HIRED&q=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data.results || data); 
            }
        } catch (error) {
            console.error("Error fetching assigned jobs:", error);
            toast.error("Failed to load assigned jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchAssignedJobs(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Jobs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track active and confirmed tuitions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search parent, tutor..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Assigned Tutor</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    No assigned/active jobs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">JD-{app.job}</TableCell>
                                    <TableCell>{app.job_details?.parent_name || 'N/A'}</TableCell>
                                    <TableCell className="font-medium text-blue-600">{app.tutor_name}</TableCell>
                                    <TableCell>{app.job_details?.subjects?.join(', ') || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3 text-slate-400" />
                                            {new Date(app.updated_at).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="success">Active</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

