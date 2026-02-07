import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';
import { Button } from '../../ui/button';
import API_BASE_URL from '../../../config';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function ApproveJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPendingJobs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            // Fetch PENDING_REVIEW jobs. Adjust status param if needed based on Model.
            // Assumption: JobPost model uses status='PENDING_REVIEW' or 'DRAFT'.
            // Let's try 'PENDING' first as a guess or look at similar code. 
            // In UnlockedJobsList.jsx I used 'Unlocked'.
            // In AdminTutorListView (users/views.py) I used 'PENDING' group.
            // JobModel usually has OPEN, CLOSED.
            // Let's assume there is a 'PENDING' status for moderation.
            // Or maybe 'OPEN' jobs that are flagged?
            // Actually, typical workflow: Parent posts -> Admin approves -> OPEN.
            // So status might be 'PENDING'.
            const response = await fetch(`${API_BASE_URL}/api/jobs/crm/jobs/?status=PENDING`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data.results || data);
            }
        } catch (error) {
            console.error("Error fetching pending jobs:", error);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingJobs();
    }, []);

    const handleAction = async (jobId, action) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/crm/jobs/${jobId}/status/`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: action === 'approve' ? 'OPEN' : 'REJECTED' }) 
            });

            if (response.ok) {
                toast.success(`Job ${action}d successfully`);
                fetchPendingJobs(); // Refresh
            } else {
                toast.error("Action failed");
            }
        } catch (error) {
            console.error("Error updating job:", error);
            toast.error("Server error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Approve Jobs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review and approve new job postings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search pending..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                            <TableHead>Parent</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Date Posted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                    No pending jobs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">{job.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{job.user?.first_name || 'Parent'}</span>
                                            <span className="text-xs text-slate-500">{job.user?.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{job.subjects}</span>
                                            <span className="text-xs text-slate-500">{job.class_grade}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{job.location}</TableCell>
                                    <TableCell>{job.created_at ? format(new Date(job.created_at), 'dd MMM yyyy') : '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="warning">{job.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View Details">
                                                <Eye size={14} />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white" 
                                                title="Approve"
                                                onClick={() => handleAction(job.id, 'approve')}
                                            >
                                                <CheckCircle size={14} />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white" 
                                                title="Reject"
                                                onClick={() => handleAction(job.id, 'reject')}
                                            >
                                                <XCircle size={14} />
                                            </Button>
                                        </div>
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
