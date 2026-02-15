"use client";
import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Briefcase, 
    GraduationCap, 
    CheckCircle, 
    XCircle,
    Clock,
    TrendingUp,
    Loader2,
    ArrowLeft,
    Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../components/ui/table';
import Badge from '../../components/ui/badge';
import API_BASE_URL from '../../config';
import { motion } from 'framer-motion';

// Stat Card Component
const StatCard = ({ title, value, icon, color, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
    >
        <Card className={`border-l-4 ${color} bg-white dark:bg-slate-900 shadow-sm`}>
            <CardContent className="p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export default function AdminPerformance({ department }) {
    const [data, setData] = useState({ summary: {}, admins: [] });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchPerformance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const url = department 
                ? `${API_BASE_URL}/api/users/superadmin/admin-performance/?department=${department}`
                : `${API_BASE_URL}/api/users/superadmin/admin-performance/`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error("Error fetching admin performance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, [department]);

    // Config based on department
    const config = {
        PARENT_OPS: {
            title: 'Parent Admin Performance',
            subtitle: 'Track work progress of Parent Operations team.',
            icon: <Briefcase className="text-blue-500" size={24} />,
            color: 'blue'
        },
        TUTOR_OPS: {
            title: 'Tutor Admin Performance',
            subtitle: 'Track work progress of Tutor Operations team.',
            icon: <GraduationCap className="text-emerald-500" size={24} />,
            color: 'emerald'
        },
        default: {
            title: 'Admin Performance',
            subtitle: 'Select a department to view performance.',
            icon: <Shield className="text-amber-500" size={24} />,
            color: 'amber'
        }
    };

    const currentConfig = config[department] || config.default;

    // Selection screen if no department
    if (!department) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Performance</h1>
                    <p className="text-slate-500 dark:text-slate-400">View work progress of your admin teams.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card 
                        className="cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all border-2 border-transparent"
                        onClick={() => router.push('/superadmin/performance/parent-admins')}
                    >
                        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Briefcase className="text-blue-500" size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Parent Admins</h3>
                                <p className="text-sm text-slate-500">View job handling & approval metrics</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card 
                        className="cursor-pointer hover:shadow-lg hover:border-emerald-400 transition-all border-2 border-transparent"
                        onClick={() => router.push('/superadmin/performance/tutor-admins')}
                    >
                        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <GraduationCap className="text-emerald-500" size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tutor Admins</h3>
                                <p className="text-sm text-slate-500">View KYC verification metrics</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const { summary, admins } = data;

    // Stats for Parent Ops
    const parentOpsStats = [
        { title: 'Total Admins', value: summary.total_admins || 0, icon: <Users className="text-blue-500" />, color: 'border-blue-500' },
        { title: 'Jobs Handled', value: summary.total_jobs_handled || 0, icon: <Briefcase className="text-amber-500" />, color: 'border-amber-500' },
        { title: 'Jobs Approved', value: summary.total_jobs_approved || 0, icon: <CheckCircle className="text-emerald-500" />, color: 'border-emerald-500' },
        { title: 'Jobs Rejected', value: summary.total_jobs_rejected || 0, icon: <XCircle className="text-red-500" />, color: 'border-red-500' },
    ];

    // Stats for Tutor Ops
    const tutorOpsStats = [
        { title: 'Total Admins', value: summary.total_admins || 0, icon: <Users className="text-emerald-500" />, color: 'border-emerald-500' },
        { title: 'KYC Verified', value: summary.total_kyc_verified || 0, icon: <Shield className="text-blue-500" />, color: 'border-blue-500' },
        { title: 'KYC Approved', value: summary.total_kyc_approved || 0, icon: <CheckCircle className="text-green-500" />, color: 'border-green-500' },
    ];

    const stats = department === 'PARENT_OPS' ? parentOpsStats : tutorOpsStats;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/superadmin/performance')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-500" />
                    </button>
                    <div className="flex items-center gap-3">
                        {currentConfig.icon}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{currentConfig.title}</h1>
                            <p className="text-slate-500 dark:text-slate-400">{currentConfig.subtitle}</p>
                        </div>
                    </div>
                </div>
                <Button variant="outline" onClick={fetchPerformance} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Refresh'}
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={stat.title} {...stat} index={index} />
                ))}
            </div>

            {/* Admins Table */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle>Individual Admin Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Admin</TableHead>
                                {department === 'PARENT_OPS' && (
                                    <>
                                        <TableHead>Jobs Assigned</TableHead>
                                        <TableHead>Approved</TableHead>
                                        <TableHead>Rejected</TableHead>
                                        <TableHead>This Week</TableHead>
                                    </>
                                )}
                                {department === 'TUTOR_OPS' && (
                                    <>
                                        <TableHead>KYC Approved</TableHead>
                                        <TableHead>KYC Rejected</TableHead>
                                        <TableHead>This Week</TableHead>
                                    </>
                                )}
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={department === 'PARENT_OPS' ? 6 : 5} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-amber-500" size={32} />
                                            <span className="text-slate-500">Loading performance data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : admins.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={department === 'PARENT_OPS' ? 6 : 5} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <Users size={32} className="text-slate-300" />
                                            <span>No admins found for this department.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                    {admin.username?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{admin.username}</p>
                                                    <p className="text-xs text-slate-500">{admin.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {department === 'PARENT_OPS' && (
                                            <>
                                                <TableCell>
                                                    <Badge variant="outline">{admin.jobs_assigned || 0}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-emerald-100 text-emerald-700">{admin.jobs_approved || 0}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-red-100 text-red-700">{admin.jobs_rejected || 0}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-blue-100 text-blue-700">{admin.jobs_this_week || 0}</Badge>
                                                </TableCell>
                                            </>
                                        )}
                                        {department === 'TUTOR_OPS' && (
                                            <>
                                                <TableCell>
                                                    <Badge className="bg-emerald-100 text-emerald-700">{admin.kyc_approved || 0}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-red-100 text-red-700">{admin.kyc_rejected || 0}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-blue-100 text-blue-700">{admin.kyc_this_week || 0}</Badge>
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell className="text-sm text-slate-500">
                                            {new Date(admin.date_joined).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}



