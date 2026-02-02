import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Briefcase, MapPin, Clock, Send, CheckCircle, XCircle, Loader, Filter, Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import API_BASE_URL from '../../../config';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [activeFilter]);

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

    const getStatusConfig = (status) => {
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
                label: 'Hired'
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

    const filters = [
        { id: 'ALL', label: 'All', count: stats.total || 0 },
        { id: 'APPLIED', label: 'Applied', count: stats.applied || 0 },
        { id: 'SHORTLISTED', label: 'Shortlisted', count: stats.shortlisted || 0 },
        { id: 'HIRED', label: 'Hired', count: stats.hired || 0 },
        { id: 'REJECTED', label: 'Rejected', count: stats.rejected || 0 },
    ];

    // Filter applications by search term
    const filteredApplications = applications.filter(app => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            app.job_details.title.toLowerCase().includes(searchLower) ||
            app.job_details.subjects.some(s => s.toLowerCase().includes(searchLower)) ||
            app.job_details.locality.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
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
                        {/* Status Filters */}
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
                                        activeFilter === filter.id
                                            ? "bg-white/20"
                                            : "bg-slate-200 dark:bg-slate-700"
                                    )}>
                                        {filter.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
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
            ) : filteredApplications.length === 0 ? (
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
                                onClick={() => window.location.href = '/tutor-dashboard?tab=tuitions'}
                            >
                                Browse Jobs
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredApplications.map(application => {
                        const statusConfig = getStatusConfig(application.status);
                        const StatusIcon = statusConfig.icon;
                        const job = application.job_details;

                        return (
                            <Card key={application.id} className={cn("border-2 hover:shadow-lg transition-all", statusConfig.border)}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Job Details */}
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

                                            {/* Subjects */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {job.subjects.map((subject, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full"
                                                    >
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Budget */}
                                            {job.budget_range && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="font-semibold">Budget:</span> {job.budget_range}
                                                    {job.hourly_rate && ` (₹${job.hourly_rate}/hr)`}
                                                </p>
                                            )}

                                            {/* Application Date */}
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

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 md:w-40">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.location.href = `/jobs/${job.id}`}
                                                className="w-full"
                                            >
                                                View Job
                                            </Button>
                                            {application.status === 'HIRED' && (
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

                                    {/* Cover Message (if exists) */}
                                    {application.cover_message && (
                                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Message:</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{application.cover_message}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyApplications;
