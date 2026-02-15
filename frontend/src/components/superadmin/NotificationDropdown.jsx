"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
    Bell, 
    CheckCircle, 
    AlertCircle, 
    XCircle, 
    UserPlus, 
    CreditCard,
    FileCheck,
    Clock,
    X
} from 'lucide-react';
import API_BASE_URL from '../../config';

// Mock notifications for now - in production these would come from backend
const getMockNotifications = () => [
    {
        id: 1,
        type: 'job',
        title: 'New Job Posted',
        message: 'Parent looking for Math tutor in Indiranagar',
        time: '5 min ago',
        read: false,
        icon: <AlertCircle size={16} className="text-amber-500" />
    },
    {
        id: 2,
        type: 'kyc',
        title: 'KYC Pending Review',
        message: '3 tutors awaiting KYC verification',
        time: '1 hour ago',
        read: false,
        icon: <FileCheck size={16} className="text-blue-500" />
    },
    {
        id: 3,
        type: 'user',
        title: 'New User Signup',
        message: 'Rahul Kumar registered as parent',
        time: '2 hours ago',
        read: true,
        icon: <UserPlus size={16} className="text-green-500" />
    },
    {
        id: 4,
        type: 'payment',
        title: 'Credit Purchase',
        message: 'Priya Sharma purchased ₹500 credits',
        time: '3 hours ago',
        read: true,
        icon: <CreditCard size={16} className="text-violet-500" />
    }
];

const NotificationDropdown = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // In production, fetch from API
        setNotifications(getMockNotifications());
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (!isOpen) return null;

    return (
        <div 
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-brand-gold" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllRead}
                            className="text-xs text-brand-gold hover:underline font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div 
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                                !notification.read ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                            }`}
                        >
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {notification.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-semibold ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {notification.title}
                                        </p>
                                        {!notification.read && (
                                            <span className="flex-shrink-0 h-2 w-2 bg-brand-gold rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <Clock size={10} />
                                        {notification.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <button className="w-full text-center text-sm text-brand-gold hover:underline font-medium">
                    View All Notifications
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;

