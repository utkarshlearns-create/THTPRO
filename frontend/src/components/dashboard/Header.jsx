"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Sparkles, Gem, Sun, Moon, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import API_BASE_URL from '../../config';

const Header = ({ sidebarOpen, setSidebarOpen, user, setActiveTab }) => {
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/jobs/notifications/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const items = data.results || data;
                setNotifications(items);
                setUnreadCount(items.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const token = localStorage.getItem('access');
            const res = await fetch(`${API_BASE_URL}/api/jobs/notifications/${id}/read/`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    return (
        <header className={cn(
            "h-20 fixed top-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 border-b",
            "bg-white/80 border-slate-200 backdrop-blur-md",
            "dark:bg-slate-950/50 dark:border-white/5",
            sidebarOpen ? "left-0 lg:left-64" : "left-0 lg:left-20"
        )}>
            {/* Left: Mobile Toggle & Welcome */}
            <div className="flex items-center gap-4 md:gap-6">
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 -ml-2 lg:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden md:block">
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Welcome back, <span className="bg-gradient-to-r from-sky-400 to-indigo-600 dark:from-sky-300 dark:to-indigo-400 bg-clip-text text-transparent">{user?.full_name?.split(' ')[0] || user?.first_name || 'Tutor'}</span>
                    </h1>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                        Profile Active
                    </p>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 md:gap-6">
                 {/* Theme Toggle */}
                 <button 
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                 >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                 </button>

                 {/* Wallet Jewel */}
                 <button 
                    onClick={() => setActiveTab && setActiveTab('wallet')}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 rounded-full shadow-sm hover:border-indigo-500/60 transition-colors cursor-pointer"
                 >
                    <Gem className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-indigo-100">500 Credits</span>
                 </button>

                 {/* Notification Bell */}
                 <div className="relative" ref={notificationRef}>
                     <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors group"
                     >
                        <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1.5 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-bounce">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                     </button>

                     {/* Notification Dropdown */}
                     {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                                        No notifications yet.
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} className={cn("p-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group", !notif.is_read ? "bg-blue-50/50 dark:bg-indigo-900/10" : "")}>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={cn("text-sm font-medium", !notif.is_read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>{notif.title}</p>
                                                    {!notif.is_read && (
                                                        <button onClick={(e) => markAsRead(notif.id, e)} className="p-1 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded opacity-0 group-hover:opacity-100 transition-all" title="Mark as read">
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                     )}
                 </div>

                 {/* Profile Avatar */}
                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 p-[1px] cursor-pointer hover:scale-105 transition-transform shadow-md overflow-hidden">
                    <div className="h-full w-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                        {(user?.profile_imagePreview || (typeof user?.profile_image === 'string' && user.profile_image)) ? (
                            <img 
                                src={user.profile_imagePreview || user.profile_image} 
                                alt="Profile" 
                                className="h-full w-full object-cover" 
                            />
                        ) : (
                            <span className="font-bold text-indigo-600 dark:text-sky-400 text-sm">
                                {user?.full_name?.charAt(0)?.toUpperCase() || user?.first_name?.charAt(0)?.toUpperCase() || 'T'}
                            </span>
                        )}
                    </div>
                 </div>
            </div>
        </header>
    );
};

export default Header;

