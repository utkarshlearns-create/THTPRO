"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Clock, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import API_BASE_URL from '../../config';

// Skeleton loader component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

// KPI Card Component
const KPICard = ({ title, value, icon, trend, color, index, loading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className={`relative overflow-hidden bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow ${color}`}>
      <CardContent className="p-4">
        {loading ? (
          <>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {icon}
              </div>
            </div>
            {trend && (
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={12} />
                <span>{trend}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    total_leads: 0,
    fresh_leads: 0,
    rejected_leads: 0,
    confirmed_tuitions: 0,
    total_revenue: 0,
    pending_jobs: 0,
    total_parents: 0,
    total_tutors: 0,
    total_admins: 0,
    pending_kyc: 0,
    verified_kyc: 0,
    leads_vs_conversions: [],
    lead_distribution: [],
    revenue_weekly: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(`${API_BASE_URL}/api/users/superadmin/analytics/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else if (response.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load analytics data.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Build KPI data from API response
  const kpiData = [
    { 
      title: 'Total Leads', 
      value: analytics.total_leads.toLocaleString(), 
      icon: <Users className="text-blue-500" />, 
      trend: `${analytics.total_parents + analytics.total_tutors} users`,
      color: 'border-l-4 border-blue-500' 
    },
    { 
      title: 'Fresh Leads', 
      value: analytics.fresh_leads, 
      icon: <UserPlus className="text-emerald-500" />, 
      trend: 'This month',
      color: 'border-l-4 border-emerald-500' 
    },
    { 
      title: 'Rejected', 
      value: analytics.rejected_leads, 
      icon: <UserX className="text-red-500" />, 
      trend: null,
      color: 'border-l-4 border-red-500' 
    },
    { 
      title: 'Confirmed', 
      value: analytics.confirmed_tuitions, 
      icon: <CheckCircle className="text-amber-600" />, 
      trend: 'Tuitions',
      color: 'border-l-4 border-amber-500' 
    },
    { 
      title: 'Revenue', 
      value: `₹ ${analytics.total_revenue.toLocaleString()}`, 
      icon: <DollarSign className="text-violet-500" />, 
      trend: 'Total credits',
      color: 'border-l-4 border-violet-500' 
    },
    { 
      title: 'Pending Jobs', 
      value: analytics.pending_jobs, 
      icon: <Clock className="text-amber-500" />, 
      trend: 'Need review',
      color: 'border-l-4 border-amber-400' 
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time insights into your agency's performance.</p>
        </div>
      <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <button 
                onClick={() => {
                    // Generate downloadable report
                    const reportDate = new Date().toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    const report = `
THT ADMIN - ANALYTICS REPORT
Generated: ${reportDate}
================================

KEY PERFORMANCE INDICATORS
--------------------------
Total Leads: ${analytics.total_leads}
Fresh Leads: ${analytics.fresh_leads}
Rejected Leads: ${analytics.rejected_leads}
Confirmed Tuitions: ${analytics.confirmed_tuitions}
Total Revenue: ₹${analytics.total_revenue.toLocaleString()}
Pending Jobs: ${analytics.pending_jobs}

USER STATISTICS
---------------
Total Parents: ${analytics.total_parents}
Total Tutors: ${analytics.total_tutors}
Total Admins: ${analytics.total_admins}

KYC STATUS
----------
Pending KYC: ${analytics.pending_kyc}
Verified Tutors: ${analytics.verified_kyc}

================================
THT Pro - Tutoring Platform
                    `.trim();
                    
                    const blob = new Blob([report], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tht_analytics_report_${new Date().toISOString().split('T')[0]}.txt`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download Report
            </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} index={index} loading={loading} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Bar Chart: Leads vs Conversions */}
          <Card className="xl:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Leads vs Conversions Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-full w-full" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.leads_vs_conversions}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                  itemStyle={{ color: '#fff' }}
                              />
                              <Legend />
                              <Bar dataKey="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                              <Bar dataKey="Conversions" fill="#d97706" radius={[4, 4, 0, 0]} barSize={30} />
                          </BarChart>
                      </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
          </Card>

          {/* Donut Chart: Lead Distribution */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Lead Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-48 w-48 rounded-full mx-auto" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={analytics.lead_distribution}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {analytics.lead_distribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Pie>
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                              />
                              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                          </PieChart>
                      </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
          </Card>

          {/* Line Chart: Revenue */}
          <Card className="xl:col-span-3 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white">Revenue & Collection</CardTitle>
                <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
            </CardHeader>
            <CardContent>
                 <div className="h-[250px] w-full">
                    {loading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.revenue_weekly}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                              />
                               <Line type="monotone" dataKey="Revenue" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                          </LineChart>
                       </ResponsiveContainer>
                    )}
                 </div>
            </CardContent>
          </Card>

          {/* Quick Stats Cards */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">User Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-300">Parents</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{analytics.total_parents}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-300">Tutors</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{analytics.total_tutors}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-300">Admins</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">{analytics.total_admins}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">KYC Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-300">Pending KYC</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{analytics.pending_kyc}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-300">Verified Tutors</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{analytics.verified_kyc}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

