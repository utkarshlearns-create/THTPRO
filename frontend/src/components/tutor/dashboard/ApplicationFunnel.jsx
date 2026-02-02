import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { cn } from '../../../lib/utils';
import { Send, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import API_BASE_URL from '../../../config';

const ApplicationFunnel = () => {
    const [stats, setStats] = useState({
        total_applications: 0,
        pending_applications: 0,
        accepted_applications: 0,
        rejected_applications: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/dashboard/stats/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const funnelData = [
        { 
            label: 'Total Applied', 
            count: stats.total_applications || 0, 
            icon: Send, 
            color: 'text-blue-400', 
            bg: 'bg-blue-400/10' 
        },
        { 
            label: 'Pending', 
            count: stats.pending_applications || 0, 
            icon: Clock, 
            color: 'text-amber-400', 
            bg: 'bg-amber-400/10' 
        },
        { 
            label: 'Accepted', 
            count: stats.accepted_applications || 0, 
            icon: CheckCircle, 
            color: 'text-green-400', 
            bg: 'bg-green-400/10' 
        },
        { 
            label: 'Rejected', 
            count: stats.rejected_applications || 0, 
            icon: XCircle, 
            color: 'text-red-400', 
            bg: 'bg-red-400/10' 
        },
    ];

    if (loading) {
        return (
            <Card className="col-span-4">
                <CardContent className="p-12 flex items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin text-indigo-600" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Application Pipeline</CardTitle>
                <p className="text-xs text-slate-400">Your job application status</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {funnelData.map((stat) => (
                        <div key={stat.label} className={cn("p-4 rounded-xl border transition-all", 
                            "bg-white border-slate-200 hover:bg-slate-50", // Light
                            "dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10", // Dark
                            stat.bg // Specific bg color tint
                        )}>
                            <div className={cn("p-2 rounded-lg w-fit mb-2", "bg-white/50 dark:bg-black/20", stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.count}</p>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ApplicationFunnel;
