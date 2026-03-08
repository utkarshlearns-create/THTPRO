"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Clock, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import API_BASE_URL from '../../../config';
import { toast } from 'react-hot-toast';

const NotificationsTab = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/jobs/notifications/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.results || data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('access');
            const res = await fetch(`${API_BASE_URL}/api/jobs/notifications/${id}/read/`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                toast.success('Marked as read');
            }
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'JOB_APPROVED':
            case 'KYC_APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'JOB_REJECTED':
            case 'KYC_REJECTED':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'SYSTEM':
                return <Info className="w-5 h-5 text-blue-500" />;
            default:
                return <Bell className="w-5 h-5 text-indigo-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading your notifications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Bell className="w-7 h-7 text-indigo-500" />
                        Notifications
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Stay updated with your job applications and account alerts.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                {notifications.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-lg font-medium">No notifications yet</p>
                        <p className="text-sm">We'll let you know when something important happens.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={cn(
                                    "p-6 flex flex-col sm:flex-row gap-4 transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02]",
                                    !notif.is_read ? "bg-indigo-50/30 dark:bg-indigo-500/5 border-l-4 border-l-indigo-500" : "border-l-4 border-l-transparent"
                                )}
                            >
                                <div className="shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center">
                                        {getIcon(notif.notification_type)}
                                    </div>
                                </div>
                                
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={cn("font-semibold", !notif.is_read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                                            {notif.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                            {!notif.is_read && (
                                                <button 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="p-1 px-2 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsTab;
