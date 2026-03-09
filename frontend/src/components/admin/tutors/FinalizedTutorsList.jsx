"use client";
import React, { useState, useEffect } from 'react';
import { Search, Calendar, Loader2, CheckCircle, User } from 'lucide-react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';
import API_BASE_URL from '../../../config';
import { toast } from 'react-hot-toast';

export default function FinalizedTutorsList() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchFinalized = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/crm/applications/?status=HIRED&q=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const all = data.results || data;
                // Only show truly confirmed/finalized tutors
                setApps(Array.isArray(all) ? all.filter(a => a.is_confirmed) : []);
            }
        } catch (error) {
            console.error("Error fetching finalized tutors:", error);
            toast.error("Failed to load finalized tutors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchFinalized(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        Finalized Tutors
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Tutors confirmed and hired by parents after a successful demo.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search parent, tutor..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-green-500 outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Hired Tutor</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Confirmed On</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-green-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : apps.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                    <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No finalized tutors yet.</p>
                                    <p className="text-sm mt-1">When a parent finalizes a tutor after a demo, they will appear here.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            apps.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">JD-{app.job}</TableCell>
                                    <TableCell>{app.job_details?.parent_name || 'N/A'}</TableCell>
                                    <TableCell className="font-medium text-green-600">{app.tutor_name}</TableCell>
                                    <TableCell>{app.job_details?.subjects?.join(', ') || 'N/A'}</TableCell>
                                    <TableCell>{app.job_details?.class_grade || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3 text-slate-400" />
                                            {new Date(app.updated_at).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="success">✅ Confirmed</Badge>
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
