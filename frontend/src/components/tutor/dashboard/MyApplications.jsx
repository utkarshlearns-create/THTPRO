"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Briefcase, MapPin, Clock, Send, CheckCircle, XCircle, Loader, Filter, Search, CalendarCheck, Play, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import API_BASE_URL from '../../../config';
import { toast } from 'react-hot-toast';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [demos, setDemos] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [demosLoading, setDemosLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [markingComplete, setMarkingComplete] = useState(null);

    useEffect(() => {
        fetchApplications();
        fetchDemos();
    }, [activeFilter]);

    const fetchDemos = async () => {
        setDemosLoading(true);
        try {
            const token = localStorage.getItem('access');
            const res = await fetch(`${API_BASE_URL}/api/jobs/tutor/demos/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDemos(data.demos || []);
            }
        } catch (error) {
            console.error('Error fetching demos:', error);
        } finally {
            setDemosLoading(false);
        }
    };

    const markDemoCompleted = async (applicationId) => {
        setMarkingComplete(applicationId);
        try {
            const token = localStorage.getItem('access');
            const res = await fetch(`${API_BASE_URL}/api/jobs/tutor/demos/${applicationId}/complete/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                toast.success('Demo marked as completed! The parent will be notified.');
                fetchDemos();
                fetchApplications();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to mark demo as completed.');
            }
        } catch (error) {
            console.error('Error marking demo:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setMarkingComplete(null);
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const url = activeFilter === 'ALL' 
                ? `${API_BASE_URL}/api/jobs/tutor/applications/`
                : `${API_BASE_URL}/api/jobs/tutor/applications/?status=${activeFilter}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications || []);
                setStats(data.stats || {});
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status, isConfirmed) => {
        const configs = {
            'APPLIED': {
                icon: Send,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                border: 'border-blue-200 dark:border-blue-900/50',
                label: 'Applied'
            },
            'SHORTLISTED': {
                icon: Clock,
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                border: 'border-amber-200 dark:border-amber-900/50',
                label: 'Shortlisted'
            },
            'HIRED': {
                icon: CheckCircle,
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-50 dark:bg-green-900/20',
                border: 'border-green-200 dark:border-green-900/50',
                label: isConfirmed ? '🎉 Hired' : 'Awaiting Confirmation'
            },
            'REJECTED': {
                icon: XCircle,
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-900/50',
                label: 'Rejected'
            }
        };
        return configs[status] || configs['APPLIED'];
    };

    const getDemoStatusBadge = (demoStatus) => {
        const badges = {
            'PENDING': { label: 'Scheduled', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
            'ACCEPTED': { label: 'Accepted', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
            'COMPLETED': { label: 'Completed', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
            'RESCHEDULE_REQUESTED': { label: 'Reschedule Req.', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
        };
        const badge = badges[demoStatus] || badges['PENDING'];
        return <span className={cn("px-2.5 py-0.5 text-xs font-bold rounded-full", badge.cls)}>{badge.label}</span>;
    };

    const filters = [
        { id: 'ALL', label: 'All', count: stats.total || 0 },
        { id: 'APPLIED', label: 'Applied', count: stats.applied || 0 },
        { id: 'SHORTLISTED', label: 'Shortlisted', count: stats.shortlisted || 0 },
        { id: 'HIRED', label: 'Hired', count: stats.hired || 0 },
        { id: 'REJECTED', label: 'Rejected', count: stats.rejected || 0 },
    ];

    const filteredApplications = (Array.isArray(applications) ? applications : []).filter(app => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            app.job_details?.title?.toLowerCase().includes(searchLower) ||
            (Array.isArray(app.job_details?.subjects) && app.job_details.subjects.some(s => s.toLowerCase().includes(searchLower))) ||
            app.job_details?.locality?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-8">
            {/* ===== SCHEDULED DEMOS SECTION ===== */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Scheduled Demos</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Demos assigned to you by counsellors. Mark as completed after the session.</p>
                    </div>
                </div>

                {demosLoading ? (
                    <Card><CardContent className="p-8 flex items-center justify-center"><Loader className="h-6 w-6 animate-spin text-indigo-600" /></CardContent></Card>
                ) : demos.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No scheduled demos right now.</p>
                            <p className="text-sm mt-1">When a counsellor schedules a demo for you, it will appear here.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {demos.map(demo => {
                            const job = demo.job_details;
                            return (
                                <Card key={demo.id} className="border-2 border-indigo-200 dark:border-indigo-900/50 hover:shadow-lg transition-all overflow-hidden">
                                    <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">{job?.title || `${job?.class_grade} Tuition`}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Briefcase size={13} />
                                                    {job?.class_grade} • {Array.isArray(job?.subjects) ? job.subjects.join(', ') : job?.subjects}
                                                </p>
                                                {job?.locality && (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <MapPin size={13} />
                                                        {job.locality}
                                                    </p>
                                                )}
                                            </div>
                                            {getDemoStatusBadge(demo.demo_status)}
                                        </div>

                                        {demo.demo_date && (
                                            <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/30 mb-3">
                                                <Clock size={14} className="text-blue-500" />
                                                <span className="font-semibold">{new Date(demo.demo_date).toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-2">
                                            {demo.demo_status !== 'COMPLETED' ? (
                                                <Button 
                                                    size="sm" 
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                                                    onClick={() => markDemoCompleted(demo.id)}
                                                    disabled={markingComplete === demo.id}
                                                >
                                                    {markingComplete === demo.id ? (
                                                        <><Loader className="w-4 h-4 animate-spin mr-1" /> Marking...</>
                                                    ) : (
                                                        <><CheckCircle className="w-4 h-4 mr-1" /> Mark Demo Completed</>
                                                    )}
                                                </Button>
                                            ) : (
                                                <span className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800/30 flex items-center gap-1.5 flex-1 justify-center font-medium">
                                                    <CheckCircle size={14} />
                                                    Demo Completed — Awaiting parent confirmation
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ===== APPLICATIONS SECTION ===== */}
            <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
                        <p className="text-slate-600 dark:text-slate-400">Track all your job applications</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total || 0}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Applications</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-wrap gap-2">
                                {filters.map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2",
                                            activeFilter === filter.id
                                                ? "bg-indigo-600 text-white shadow-lg"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        )}
                                    >
                                        {filter.label}
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-bold",
                                            activeFilter === filter.id ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
                                        )}>
                                            {filter.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by subject, location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications List */}
                {loading ? (
                    <Card>
                        <CardContent className="p-12 flex items-center justify-center">
                            <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                        </CardContent>
                    </Card>
                ) : (!Array.isArray(filteredApplications) || filteredApplications.length === 0) ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Briefcase className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                No Applications Found
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                {searchTerm 
                                    ? "Try adjusting your search terms" 
                                    : activeFilter === 'ALL'
                                        ? "You haven't applied to any jobs yet"
                                        : `No ${activeFilter.toLowerCase()} applications`
                                }
                            </p>
                            {activeFilter === 'ALL' && !searchTerm && (
                                <Button 
                                    variant="sapphire" 
                                    onClick={() => window.location.href = '/dashboard/tutor?tab=tuitions'}
                                >
                                    Browse Jobs
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {Array.isArray(filteredApplications) && filteredApplications.map(application => {
                            const statusConfig = getStatusConfig(application.status, application.is_confirmed);
                            const StatusIcon = statusConfig.icon;
                            const job = application.job_details;

                            return (
                                <Card key={application.id} className={cn("border-2 hover:shadow-lg transition-all", statusConfig.border)}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                            {job.title}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <Briefcase className="h-4 w-4" />
                                                                {job.class_grade} • {job.board}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {job.locality}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={cn("px-3 py-1 rounded-full flex items-center gap-2", statusConfig.bg)}>
                                                        <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
                                                        <span className={cn("text-sm font-semibold", statusConfig.color)}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {Array.isArray(job.subjects) && job.subjects.map((subject, idx) => (
                                                        <span 
                                                            key={idx}
                                                            className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full"
                                                        >
                                                            {subject}
                                                        </span>
                                                    ))}
                                                </div>

                                                {job.budget_range && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        <span className="font-semibold">Budget:</span> {job.budget_range}
                                                        {job.hourly_rate && ` (₹${job.hourly_rate}/hr)`}
                                                    </p>
                                                )}

                                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Applied on {new Date(application.created_at).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 md:w-40">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.location.href = `/jobs/${job.id}`}
                                                    className="w-full"
                                                >
                                                    View Job
                                                </Button>
                                                {application.status === 'HIRED' && application.is_confirmed && (
                                                    <Button
                                                        variant="sapphire"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        Contact Parent
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {application.cover_message && (
                                            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Message:</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{application.cover_message}</p>
                                            </div>
                                        )}

                                        {/* Status pills for HIRED applications */}
                                        {application.status === 'HIRED' && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {/* Job completion status pill */}
                                                {application.job_completion_status === 'ONGOING' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Classes Ongoing</span>
                                                )}
                                                {application.job_completion_status === 'COMPLETED' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Completed</span>
                                                )}
                                                {application.job_completion_status === 'DROPPED' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Dropped</span>
                                                )}
                                                {application.job_completion_status === 'ON_HOLD' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">On Hold</span>
                                                )}

                                                {/* Payment status pill */}
                                                {application.payment_status === 'PENDING' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Payment Pending</span>
                                                )}
                                                {application.payment_status === 'PARTIALLY_PAID' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Partially Paid</span>
                                                )}
                                                {application.payment_status === 'PAID' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Payment Received</span>
                                                )}
                                                {application.payment_status === 'OVERDUE' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Payment Overdue</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Warning when applying is blocked */}
                                        {application.status === 'HIRED' && application.job_completion_status === 'ONGOING' && application.payment_status !== 'PAID' && (
                                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg flex items-start gap-2">
                                                <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                                    New applications are paused. Your counsellor will unlock applying after this tuition is completed and payment is confirmed.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
