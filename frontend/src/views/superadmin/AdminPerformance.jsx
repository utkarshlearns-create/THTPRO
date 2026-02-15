"use client";
import React, { useState, useEffect } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';
import { 
    Trophy, 
    TrendingUp, 
    Users, 
    CheckCircle, 
    XCircle,
    Clock,
    Target,
    Award
} from 'lucide-react';
import API_BASE_URL from '../../config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const AdminPerformance = () => {
    const [activeTab, setActiveTab] = useState('PARENT_OPS');
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchPerformance();
    }, [refreshTrigger]);

    const fetchPerformance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/superadmin/performance/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPerformanceData(data);
            } else {
                setError("Failed to fetch performance data");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !performanceData) return <div className="p-8 text-center text-slate-500">Loading performance metrics...</div>;
    if (error && !performanceData) return <div className="p-8 text-center text-red-500">{error}</div>;

    const topPerformers = performanceData?.top_performers || {};
    const parentOpsData = performanceData?.parent_ops || [];
    const tutorOpsData = performanceData?.tutor_ops || [];

    const currentData = activeTab === 'PARENT_OPS' ? parentOpsData : tutorOpsData;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-brand-gold" /> Admin Performance
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Track key metrics and identify top performers.</p>
                </div>
                <Button variant="outline" onClick={() => setRefreshTrigger(prev => prev + 1)}>
                    Refresh
                </Button>
            </div>

            {/* Top Performers Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-yellow-500">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Top Converter</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                                {topPerformers.top_converter?.name || 'N/A'}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {topPerformers.top_converter?.conversion_rate}% Conversion
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-blue-500">
                            <Target size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Highest Volume</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                                {topPerformers.top_volume?.name || 'N/A'}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {topPerformers.top_volume?.kyc_processed || topPerformers.top_volume?.assigned_leads || 0} Tasks
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/10 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                            <Award size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Most Active</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                                {topPerformers.most_efficient?.name || 'N/A'}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Active Now
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('PARENT_OPS')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'PARENT_OPS' 
                        ? 'border-brand-gold text-brand-gold' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Parent Operations
                </button>
                <button
                    onClick={() => setActiveTab('TUTOR_OPS')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'TUTOR_OPS' 
                        ? 'border-brand-gold text-brand-gold' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Tutor Operations
                </button>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                <XAxis dataKey="username" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend />
                                {activeTab === 'PARENT_OPS' ? (
                                    <>
                                        <Bar dataKey="assigned_leads" name="Assigned" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="converted_leads" name="Converted" fill="#d97706" radius={[4, 4, 0, 0]} barSize={20} />
                                    </>
                                ) : (
                                    <>
                                        <Bar dataKey="kyc_processed" name="KYC Processed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="interviews_conducted" name="Interviews" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                                    </>
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {currentData.length === 0 ? (
                                <p className="text-slate-500 text-sm">No data available</p>
                            ) : (
                                currentData
                                    .sort((a, b) => {
                                        if (activeTab === 'PARENT_OPS') return (b.conversion_rate || 0) - (a.conversion_rate || 0);
                                        return (b.kyc_processed || 0) - (a.kyc_processed || 0);
                                    })
                                    .slice(0, 5)
                                    .map((admin, index) => (
                                        <div key={admin.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className={`
                                                h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                                  index === 1 ? 'bg-slate-100 text-slate-700' : 
                                                  index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{admin.username}</p>
                                                <p className="text-xs text-slate-500">
                                                    {activeTab === 'PARENT_OPS' 
                                                        ? `${admin.conversion_rate || 0}% Conversion` 
                                                        : `${admin.kyc_processed || 0} Processed`}
                                                </p>
                                            </div>
                                            {index === 0 && <Trophy size={16} className="text-yellow-500" />}
                                        </div>
                                    ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Detailed Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                                    <th className="p-3">Admin</th>
                                    {activeTab === 'PARENT_OPS' ? (
                                        <>
                                            <th className="p-3">Assigned Leads</th>
                                            <th className="p-3">Converted</th>
                                            <th className="p-3">Conversion Rate</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-3">KYC Processed</th>
                                            <th className="p-3">Interviews</th>
                                            <th className="p-3">Approval Rate</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {currentData.length === 0 ? (
                                    <tr><td colSpan="4" className="p-4 text-center text-slate-500">No data</td></tr>
                                ) : (
                                    currentData.map(admin => (
                                        <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="p-3 font-medium">{admin.username}</td>
                                            {activeTab === 'PARENT_OPS' ? (
                                                <>
                                                    <td className="p-3">{admin.assigned_leads || 0}</td>
                                                    <td className="p-3">{admin.converted_leads || 0}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            (admin.conversion_rate || 0) >= 30 ? 'bg-green-100 text-green-700' : 
                                                            (admin.conversion_rate || 0) >= 15 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {admin.conversion_rate || 0}%
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-3">{admin.kyc_processed || 0}</td>
                                                    <td className="p-3">{admin.interviews_conducted || 0}</td>
                                                    <td className="p-3">{admin.approval_rate || '0%'}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminPerformance;
