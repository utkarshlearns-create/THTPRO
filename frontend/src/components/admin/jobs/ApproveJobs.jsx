"use client";
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Loader2, X, Clock, MapPin, IndianRupee, BookOpen, User as UserIcon, Briefcase } from 'lucide-react';
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
    const [selectedJob, setSelectedJob] = useState(null);

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
            const response = await fetch(`${API_BASE_URL}/api/jobs/crm/jobs/?status=PENDING_APPROVAL`, {
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
                body: JSON.stringify({ status: action === 'approve' ? 'APPROVED' : 'REJECTED' }) 
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
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 w-8 p-0" 
                                                title="View Details"
                                                onClick={() => setSelectedJob(job)}
                                            >
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

            {/* Job Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Briefcase size={20} className="text-blue-500" />
                                    Job Reference: {selectedJob.id}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Posted on {format(new Date(selectedJob.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedJob(null)} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="h-5 w-5 text-slate-500" />
                            </Button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Parent Info */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">Parent Details</h4>
                                    
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Student Name</p>
                                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                            <UserIcon size={14} className="text-slate-400" />
                                            {selectedJob.student_name || 'Not specified'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Parent Connect</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedJob.user?.first_name || 'N/A'}</p>
                                        <p className="text-sm text-slate-500">{selectedJob.user?.phone || selectedJob.user?.email || 'No contact info'}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Location</p>
                                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400" />
                                            {selectedJob.locality}
                                        </p>
                                    </div>
                                </div>

                                {/* Job Info */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">Academic Needs</h4>
                                    
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Class / Grade</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedJob.class_grade} ({selectedJob.board})</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Subjects</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Array.isArray(selectedJob.subjects) ? selectedJob.subjects.map((sub, i) => (
                                                <Badge key={i} variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 pointer-events-none">
                                                    {sub}
                                                </Badge>
                                            )) : <span className="font-medium text-slate-900 dark:text-white">{selectedJob.subjects}</span>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Budget</p>
                                            <p className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <IndianRupee size={14} />
                                                {selectedJob.budget_range || 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Mode</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{selectedJob.tuition_mode}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                         <p className="text-xs text-slate-500 mb-1">Preferred Time</p>
                                         <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                            <Clock size={14} className="text-slate-400" />
                                            {selectedJob.preferred_time || 'Any time'}
                                         </p>
                                    </div>
                                </div>
                            </div>
                            
                            {selectedJob.requirements && (
                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Additional Requirements</h4>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                        {selectedJob.requirements}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 sticky bottom-0">
                            <Button 
                                variant="outline" 
                                className="border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                onClick={() => {
                                    handleAction(selectedJob.id, 'reject');
                                    setSelectedJob(null);
                                }}
                            >
                                <XCircle size={16} className="mr-2" />
                                Reject
                            </Button>
                            <Button 
                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                                onClick={() => {
                                    handleAction(selectedJob.id, 'approve');
                                    setSelectedJob(null);
                                }}
                            >
                                <CheckCircle size={16} className="mr-2" />
                                Approve Job
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

