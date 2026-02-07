import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, Loader2 } from 'lucide-react';
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

export default function JobApplicationsList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/crm/applications/?q=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data.results || data); // Handle pagination if necessary
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchApplications(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Applications</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage tutor applications for posted jobs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search tutor or job..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                    <Button onClick={fetchApplications} variant="outline" size="icon">
                        <Filter size={18} />
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>App ID</TableHead>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Tutor Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Budget / Quote</TableHead>
                            <TableHead>Applied Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    No applications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">APP-{app.id}</TableCell>
                                    <TableCell className="text-blue-600">JD-{app.job}</TableCell>
                                    <TableCell>{app.tutor_name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="h-3 w-3 text-slate-400" />
                                            {app.job_details?.subjects?.join(', ') || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {app.job_details?.budget_range || app.job_details?.hourly_rate || 'N/A'}
                                    </TableCell>
                                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={app.status === 'HIRED' ? 'success' : app.status === 'SHORTLISTED' ? 'info' : 'secondary'}>
                                            {app.status}
                                        </Badge>
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
