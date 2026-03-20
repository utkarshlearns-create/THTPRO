"use client";
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, IndianRupee, Clock, Briefcase, Eye, AlertCircle, ArrowRightLeft } from 'lucide-react';
import API_BASE_URL from '../../../config';
import { toast } from 'react-hot-toast';
import Badge from '../../ui/badge';
import JobAssignModal from './JobAssignModal';

export default function AdminJobList({ status, title, adminId }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Assign Tutor Feature
    const [assignModalJobId, setAssignModalJobId] = useState(null);
    
    // Transfer Lead Feature
    const [transferLead, setTransferLead] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [targetAdmin, setTargetAdmin] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            let queryParams = [];
            if (status) queryParams.push(`status=${status}`);
            if (adminId) queryParams.push(`admin_id=${adminId}`);
            
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/all/${queryString}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data.results || data);
            } else {
                toast.error("Failed to load jobs");
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast.error("Server error");
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/list-admins/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAdmins(data.results || data);
            }
        } catch (error) {
            console.error("Failed to fetch admins");
        }
    };

    const handleTransferLead = async () => {
        if (!targetAdmin || !transferLead) return;
        setTransferLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/transfer-lead/${transferLead.id}/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_admin_id: targetAdmin })
            });
            if (response.ok) {
                toast.success("Lead transferred successfully");
                setTransferLead(null);
                setTargetAdmin('');
                fetchJobs();
            } else {
                toast.error("Transfer failed");
            }
        } catch (error) {
            toast.error("Transfer error");
        } finally {
            setTransferLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        if (adminId === 'me') fetchAdmins();
    }, [status, adminId]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage {(status || 'all').toLowerCase()} job postings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search jobs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No {(status || 'assigned').toLowerCase()} jobs found</h3>
                    <p className="text-slate-500 mt-1">Adjust your search or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {jobs
                        .filter(job => {
                            if (!searchTerm) return true;
                            const search = searchTerm.toLowerCase();
                            return (
                                job.student_name?.toLowerCase().includes(search) ||
                                job.locality?.toLowerCase().includes(search) ||
                                job.class_grade?.toLowerCase().includes(search)
                            );
                        })
                        .map(job => (
                        <div key={job.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                            
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-lg">
                                            {job.student_name ? job.student_name.charAt(0).toUpperCase() : 'S'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-1">
                                                {job.student_name || "Unknown Student"}
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">{job.class_grade} • {job.board}</p>
                                        </div>
                                    </div>
                                    <Badge variant={status === 'APPROVED' ? 'success' : 'danger'}>
                                        {status}
                                    </Badge>
                                </div>

                                <div className="space-y-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-slate-400" />
                                        <span className="truncate">{Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="truncate">{job.locality}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <IndianRupee size={16} className="text-emerald-500" />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{job.budget_range}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-amber-500" />
                                        <span>{job.preferred_time || 'Flexible Time'}</span>
                                    </div>
                                </div>
                            </div>

                            {status === 'REJECTED' && job.rejection_reason && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border-b border-rose-100 dark:border-rose-900/30">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide mb-1">Rejection Reason</p>
                                            <p className="text-sm text-rose-600 dark:text-rose-300 italic">{job.rejection_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 mt-auto flex items-center justify-between">
                                <div className="text-xs text-slate-500 font-medium">
                                    {job.application_count || 0} Applicants
                                </div>
                                <div className="flex gap-2">
                                    {status === 'APPROVED' && (
                                        <button 
                                            onClick={() => setAssignModalJobId(job.id)}
                                            className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                                        >
                                            <Eye size={14} /> View Applicants
                                        </button>
                                    )}
                                    {adminId === 'me' && (
                                        <button 
                                            onClick={() => setTransferLead(job)}
                                            className="px-3 py-1.5 text-xs font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 bg-white rounded-lg transition-colors flex items-center gap-1.5"
                                        >
                                            <ArrowRightLeft size={14} /> Transfer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {assignModalJobId && (
                <JobAssignModal 
                    jobId={assignModalJobId} 
                    onClose={() => setAssignModalJobId(null)} 
                    onAssigned={() => {
                        setAssignModalJobId(null);
                        fetchJobs();
                    }} 
                />
            )}

            {/* Transfer Lead Modal */}
            {transferLead && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                <ArrowRightLeft size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transfer Lead</h3>
                        </div>
                        
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            Transfer Job #{transferLead.id} ({transferLead.student_name}) to another counsellor.
                        </p>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Target Counselor</label>
                            <select 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={targetAdmin}
                                onChange={(e) => setTargetAdmin(e.target.value)}
                            >
                                <option value="">Choose an admin...</option>
                                {admins
                                    .filter(a => a.id !== parseInt(localStorage.getItem('user_id')))
                                    .map(admin => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.username} ({admin.role})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                onClick={() => { setTransferLead(null); setTargetAdmin(''); }}
                                disabled={transferLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                                disabled={!targetAdmin || transferLoading}
                                onClick={handleTransferLead}
                            >
                                {transferLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Confirm Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
