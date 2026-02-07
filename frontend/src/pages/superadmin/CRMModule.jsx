import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronRight,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Eye,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import API_BASE_URL from '../../config';

// Skeleton loader
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    'PENDING_APPROVAL': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'ASSIGNED': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'CLOSED': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    'ACTIVE': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'MODIFICATIONS_NEEDED': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'CANCELLED': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles['PENDING_APPROVAL']}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const CRMModule = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pipelineStats, setPipelineStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  
  // Selected job
  const [selectedJob, setSelectedJob] = useState(null);
  const [assigningAdmin, setAssigningAdmin] = useState(false);
  
  const token = localStorage.getItem('access');

  useEffect(() => {
    fetchJobs();
    fetchPipelineStats();
    fetchAdmins();
  }, [statusFilter, adminFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/jobs/crm/jobs/?`;
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (adminFilter) url += `admin_id=${adminFilter}&`;
      if (searchQuery) url += `q=${searchQuery}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.results || data);
        setStats(data.stats);
      } else {
        setError('Failed to load jobs');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelineStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/crm/pipeline/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPipelineStats(data);
      }
    } catch (err) {
      console.error('Error fetching pipeline stats');
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/crm/admins/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error('Error fetching admins');
    }
  };

  const handleAssignAdmin = async (jobId, adminId) => {
    setAssigningAdmin(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/crm/jobs/${jobId}/assign/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ admin_id: adminId })
      });
      if (response.ok) {
        fetchJobs();
        setSelectedJob(null);
      }
    } catch (err) {
      setError('Failed to assign admin');
    } finally {
      setAssigningAdmin(false);
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/crm/jobs/${jobId}/status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchJobs();
        fetchPipelineStats();
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const statusOptions = [
    { value: 'ALL', label: 'All Jobs' },
    { value: 'PENDING_APPROVAL', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">CRM & Lead Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and manage all job leads through the pipeline.</p>
        </div>
        <Button onClick={fetchJobs} variant="outline" disabled={loading}>
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Pipeline Stats */}
      {pipelineStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Pending', value: pipelineStats.pipeline.pending, color: 'border-amber-500', icon: Clock },
            { label: 'Approved', value: pipelineStats.pipeline.approved, color: 'border-green-500', icon: CheckCircle },
            { label: 'Assigned', value: pipelineStats.pipeline.assigned, color: 'border-blue-500', icon: UserCheck },
            { label: 'Closed', value: pipelineStats.pipeline.closed, color: 'border-slate-500', icon: Briefcase },
            { label: 'Rejected', value: pipelineStats.pipeline.rejected, color: 'border-red-500', icon: XCircle },
            { label: 'This Week', value: pipelineStats.this_week, color: 'border-violet-500', icon: Calendar },
            { label: 'Conversion', value: `${pipelineStats.conversion_rate}%`, color: 'border-emerald-500', icon: ArrowUpRight },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-l-4 ${stat.color} bg-white dark:bg-slate-900`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <stat.icon size={16} className="text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Admins</option>
              <option value="unassigned">Unassigned</option>
              {admins.map(admin => (
                <option key={admin.id} value={admin.id}>{admin.name} ({admin.assigned_jobs})</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase size={20} />
            Jobs ({jobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p>No jobs found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Student / Class</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Subjects</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Assigned To</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{job.student_name || 'Not specified'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{job.class_grade} • {job.board}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin size={14} />
                          <span className="text-sm">{job.locality}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(job.subjects || []).slice(0, 2).map((subj, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded">
                              {subj}
                            </span>
                          ))}
                          {(job.subjects || []).length > 2 && (
                            <span className="text-xs text-slate-500">+{job.subjects.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 px-4">
                        {job.assigned_admin_username ? (
                          <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <User size={14} />
                            {job.assigned_admin_username}
                          </span>
                        ) : (
                          <span className="text-sm text-amber-500">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedJob(job)}
                            className="h-8"
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedJob.student_name || 'Job Details'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      {selectedJob.class_grade} • {selectedJob.board}
                    </p>
                  </div>
                  <StatusBadge status={selectedJob.status} />
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedJob.locality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Preferred Time</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedJob.preferred_time || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Budget</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedJob.budget_range || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Created</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {new Date(selectedJob.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedJob.subjects || []).map((subj, i) => (
                      <span key={i} className="px-3 py-1 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedJob.requirements && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Requirements</p>
                    <p className="text-slate-700 dark:text-slate-300">{selectedJob.requirements}</p>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Assign to Admin</p>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                      defaultValue={selectedJob.assigned_admin || ''}
                      onChange={(e) => e.target.value && handleAssignAdmin(selectedJob.id, e.target.value)}
                    >
                      <option value="">Select Admin</option>
                      {admins.map(admin => (
                        <option key={admin.id} value={admin.id}>{admin.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Quick Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateStatus(selectedJob.id, 'APPROVED')}
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(selectedJob.id, 'REJECTED')}
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {selectedJob.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleUpdateStatus(selectedJob.id, 'ASSIGNED')}
                      >
                        <UserCheck size={14} className="mr-1" />
                        Mark Assigned
                      </Button>
                    )}
                    {selectedJob.status !== 'CLOSED' && selectedJob.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedJob.id, 'CLOSED')}
                      >
                        Close Job
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRMModule;
