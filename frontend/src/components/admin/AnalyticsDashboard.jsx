import React, { useEffect, useState } from 'react';
import { 
    Users, 
    Zap, 
    XCircle, 
    Clock,
    TrendingUp,
    DollarSign
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import KPICard from './KPICard';
import { Card } from '../ui/card';
import API_BASE_URL from '../../config';

// Dummy Data (Kept for charts)
const leadData = [
    { name: 'Jan 1', leads: 40 },
    { name: 'Jan 5', leads: 65 },
    { name: 'Jan 10', leads: 50 },
    { name: 'Jan 15', leads: 90 },
    { name: 'Jan 20', leads: 85 },
    { name: 'Jan 25', leads: 120 },
    { name: 'Jan 30', leads: 145 },
];

const revenueData = [
    { name: 'Parent Packages', value: 65000 },
    { name: 'Tutor Packages', value: 35000 },
];

const onboardingData = [
    { name: 'Week 1', applied: 50, approved: 30, rejected: 10 },
    { name: 'Week 2', applied: 75, approved: 45, rejected: 15 },
    { name: 'Week 3', applied: 60, approved: 40, rejected: 10 },
    { name: 'Week 4', applied: 90, approved: 60, rejected: 20 },
];

const REVENUE_COLORS = ['#6366f1', '#10b981']; 

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState({
        total_tutors: 0,
        total_parents: 0,
        active_jobs: 0,
        pending_jobs: 0,
        pending_kyc: 0,
        department: 'Loading...'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await fetch(`${API_BASE_URL}/api/jobs/admin/dashboard/stats/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const totalPending = (stats.pending_jobs || 0) + (stats.pending_kyc || 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.department === 'SUPERADMIN' ? 'Super Admin Dashboard' : 
                         stats.department === 'PARENT_OPS' ? 'Parent Operations Dashboard' :
                         stats.department === 'TUTOR_OPS' ? 'Tutor Operations Dashboard' : 'Admin Dashboard'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Overview of platform performance and key metrics.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                        <option>Today</option>
                    </select>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Total Tutors" 
                    value={stats.total_tutors?.toLocaleString() || "0"} 
                    icon={Users} 
                    gradient="bg-gradient-to-br from-blue-500 to-violet-600"
                />
                <KPICard 
                    title="Active Jobs" 
                    value={stats.active_jobs?.toLocaleString() || "0"} 
                    icon={Zap} 
                    gradient="bg-gradient-to-br from-emerald-400 to-green-600"
                    pulse={true}
                />
                <KPICard 
                    title="Pending Actions" 
                    value={totalPending?.toLocaleString() || "0"} 
                    icon={Clock} 
                    gradient="bg-gradient-to-br from-amber-400 to-yellow-600"
                />
                <KPICard 
                    title="Total Parents" 
                    value={stats.total_parents?.toLocaleString() || "0"} 
                    icon={Users} 
                    gradient="bg-gradient-to-br from-indigo-400 to-cyan-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Lead Acquisition Area Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lead Acquisition Trend</h3>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={leadData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#6366f1' }}
                                />
                                <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Split Donut Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Distribution</h3>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={revenueData}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {revenueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={REVENUE_COLORS[index % REVENUE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tutor Onboarding Bar Chart - Full Width */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tutor Onboarding Stats</h3>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={onboardingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Legend />
                                <Bar dataKey="applied" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
