"use client";
import React, { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../../../config';
import {
    Plus, Search, Filter, Clock, CheckCircle, XCircle,
    Phone, Mail, User, Calendar, AlertTriangle, Bell,
    Edit2, Trash2, X, ChevronDown, StickyNote, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
    LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};

const LEAD_TYPE_LABELS = {
    PARENT: 'Parent',
    TUTOR: 'Tutor',
    INSTITUTION: 'Institution',
    GENERAL: 'General',
};

// ======================== ADD/EDIT MODAL ========================
const FollowUpModal = ({ isOpen, onClose, onSave, editData }) => {
    const [form, setForm] = useState({
        title: '',
        lead_name: '',
        lead_phone: '',
        lead_email: '',
        lead_type: 'GENERAL',
        note: '',
        priority: 'MEDIUM',
        scheduled_at: '',
    });

    useEffect(() => {
        if (editData) {
            setForm({
                title: editData.title || '',
                lead_name: editData.lead_name || '',
                lead_phone: editData.lead_phone || '',
                lead_email: editData.lead_email || '',
                lead_type: editData.lead_type || 'GENERAL',
                note: editData.note || '',
                priority: editData.priority || 'MEDIUM',
                scheduled_at: editData.scheduled_at
                    ? new Date(editData.scheduled_at).toISOString().slice(0, 16)
                    : '',
            });
        } else {
            // Default: schedule 1 hour from now
            const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
            setForm({
                title: '',
                lead_name: '',
                lead_phone: '',
                lead_email: '',
                lead_type: 'GENERAL',
                note: '',
                priority: 'MEDIUM',
                scheduled_at: defaultTime.toISOString().slice(0, 16),
            });
        }
    }, [editData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.lead_name.trim() || !form.scheduled_at) {
            toast.error('Title, Lead Name, and Schedule are required');
            return;
        }
        onSave({
            ...form,
            scheduled_at: new Date(form.scheduled_at).toISOString(),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {editData ? 'Edit Follow-Up' : 'New Follow-Up'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g., Follow up on Class 10 Math requirement"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Lead Name & Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Lead Name *
                            </label>
                            <input
                                type="text"
                                value={form.lead_name}
                                onChange={(e) => setForm({ ...form, lead_name: e.target.value })}
                                placeholder="Contact name"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Lead Type
                            </label>
                            <select
                                value={form.lead_type}
                                onChange={(e) => setForm({ ...form, lead_type: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="GENERAL">General</option>
                                <option value="PARENT">Parent</option>
                                <option value="TUTOR">Tutor</option>
                                <option value="INSTITUTION">Institution</option>
                            </select>
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                value={form.lead_phone}
                                onChange={(e) => setForm({ ...form, lead_phone: e.target.value })}
                                placeholder="+91 XXXXXXXXXX"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.lead_email}
                                onChange={(e) => setForm({ ...form, lead_email: e.target.value })}
                                placeholder="email@example.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Priority & Schedule */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Priority
                            </label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Reminder Time *
                            </label>
                            <input
                                type="datetime-local"
                                value={form.scheduled_at}
                                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Note
                        </label>
                        <textarea
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            rows={3}
                            placeholder="Add details about this follow-up..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium"
                        >
                            {editData ? 'Update' : 'Create Follow-Up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ======================== COMPLETION MODAL ========================
const CompleteModal = ({ isOpen, onClose, onComplete, followUp }) => {
    const [completionNote, setCompletionNote] = useState('');

    if (!isOpen || !followUp) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mark as Completed</h2>
                    <p className="text-sm text-slate-500 mt-1">{followUp.title}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Completion Note (optional)
                        </label>
                        <textarea
                            value={completionNote}
                            onChange={(e) => setCompletionNote(e.target.value)}
                            rows={3}
                            placeholder="What was the outcome?"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onComplete(followUp.id, completionNote);
                                setCompletionNote('');
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 font-medium"
                        >
                            Complete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ======================== FOLLOW-UP CARD ========================
const FollowUpCard = ({ item, onEdit, onComplete, onDelete }) => {
    const scheduledDate = new Date(item.scheduled_at);
    const now = new Date();
    const isOverdue = item.status === 'PENDING' && scheduledDate < now;

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) {
            return `Today, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (d.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        }
        return d.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className={`bg-white dark:bg-slate-800/50 rounded-xl border p-4 transition-all hover:shadow-md ${
            isOverdue
                ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                : item.status === 'COMPLETED'
                    ? 'border-green-200 dark:border-green-800/50'
                    : 'border-slate-200 dark:border-slate-700'
        }`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`font-semibold text-sm ${
                            item.status === 'COMPLETED'
                                ? 'text-slate-400 dark:text-slate-500 line-through'
                                : 'text-slate-900 dark:text-white'
                        }`}>
                            {item.title}
                        </h3>
                        {isOverdue && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                <AlertTriangle size={12} />
                                Overdue
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[item.priority]}`}>
                            {item.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>
                            {item.status}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            {LEAD_TYPE_LABELS[item.lead_type]}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                {item.status === 'PENDING' && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onComplete(item)}
                            className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Mark Complete"
                        >
                            <CheckCircle size={16} />
                        </button>
                        <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Lead Info */}
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                    <User size={14} />
                    {item.lead_name}
                </span>
                {item.lead_phone && (
                    <a href={`tel:${item.lead_phone}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Phone size={14} />
                        {item.lead_phone}
                    </a>
                )}
                {item.lead_email && (
                    <a href={`mailto:${item.lead_email}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Mail size={14} />
                        {item.lead_email}
                    </a>
                )}
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <Calendar size={13} />
                <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                    {formatDate(item.scheduled_at)}
                </span>
                {item.assigned_to_name && (
                    <span className="ml-2 text-slate-400">
                        Assigned to: <span className="font-medium text-slate-600 dark:text-slate-300">{item.assigned_to_name}</span>
                    </span>
                )}
            </div>

            {/* Note */}
            {item.note && (
                <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <StickyNote size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                    <span>{item.note}</span>
                </div>
            )}

            {/* Completion note */}
            {item.status === 'COMPLETED' && item.completion_note && (
                <div className="mt-2 p-2.5 bg-green-50 dark:bg-green-900/10 rounded-lg text-sm text-green-700 dark:text-green-400 flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{item.completion_note}</span>
                </div>
            )}
        </div>
    );
};

// ======================== MAIN COMPONENT ========================
export default function FollowUpManager() {
    const [followUps, setFollowUps] = useState([]);
    const [stats, setStats] = useState({ total_pending: 0, overdue: 0, today: 0, completed_this_week: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [completeModal, setCompleteModal] = useState({ open: false, followUp: null });

    // Filters
    const [filterStatus, setFilterStatus] = useState('PENDING');
    const [filterPriority, setFilterPriority] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Due reminders
    const [dueReminders, setDueReminders] = useState([]);
    const [showReminders, setShowReminders] = useState(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const fetchFollowUps = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterPriority) params.append('priority', filterPriority);
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`${API_BASE_URL}/api/jobs/followups/?${params}`, { headers });
            if (res.ok) {
                setFollowUps(await res.json());
            }
        } catch (err) {
            console.error('Error fetching follow-ups:', err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterPriority, searchQuery]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/jobs/followups/stats/`, { headers });
            if (res.ok) setStats(await res.json());
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const checkDueReminders = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/jobs/followups/due/?mine=true`, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    setDueReminders(data);
                    setShowReminders(true);
                    // Browser notification
                    if (Notification.permission === 'granted') {
                        data.forEach(item => {
                            new Notification('Follow-Up Reminder', {
                                body: `${item.title} - ${item.lead_name}`,
                                icon: '/favicon.ico',
                            });
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error checking reminders:', err);
        }
    };

    useEffect(() => {
        fetchFollowUps();
        fetchStats();

        // Request notification permission
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Poll for due reminders every 60 seconds
        checkDueReminders();
        const interval = setInterval(checkDueReminders, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchFollowUps();
    }, [filterStatus, filterPriority, searchQuery]);

    const handleSave = async (formData) => {
        try {
            const url = editData
                ? `${API_BASE_URL}/api/jobs/followups/${editData.id}/`
                : `${API_BASE_URL}/api/jobs/followups/`;
            const method = editData ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editData ? 'Follow-up updated!' : 'Follow-up created!');
                setShowModal(false);
                setEditData(null);
                fetchFollowUps();
                fetchStats();
            } else {
                const err = await res.json();
                toast.error(err.detail || 'Something went wrong');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const handleComplete = async (id, completionNote) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/jobs/followups/${id}/`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status: 'COMPLETED', completion_note: completionNote }),
            });
            if (res.ok) {
                toast.success('Follow-up completed!');
                setCompleteModal({ open: false, followUp: null });
                fetchFollowUps();
                fetchStats();
            }
        } catch (err) {
            toast.error('Error completing follow-up');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this follow-up?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/jobs/followups/${id}/`, {
                method: 'DELETE',
                headers,
            });
            if (res.ok || res.status === 204) {
                toast.success('Deleted');
                fetchFollowUps();
                fetchStats();
            }
        } catch (err) {
            toast.error('Error deleting');
        }
    };

    return (
        <div className="space-y-6">
            {/* Due Reminders Banner */}
            {showReminders && dueReminders.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-semibold">
                            <Bell size={18} className="animate-bounce" />
                            Follow-Up Reminders Due!
                        </div>
                        <button onClick={() => setShowReminders(false)} className="text-orange-400 hover:text-orange-600">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {dueReminders.map(r => (
                            <div key={r.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{r.title}</span>
                                <span className="text-slate-500">{r.lead_name} {r.lead_phone && `- ${r.lead_phone}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Pending</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_pending}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                    <div className="text-sm text-red-500">Overdue</div>
                    <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                    <div className="text-sm text-blue-500">Due Today</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 border border-green-200 dark:border-green-800/50 rounded-xl p-4">
                    <div className="text-sm text-green-500">Completed (7d)</div>
                    <div className="text-2xl font-bold text-green-600">{stats.completed_this_week}</div>
                </div>
            </div>

            {/* Header + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Follow-Ups</h1>
                <button
                    onClick={() => { setEditData(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
                >
                    <Plus size={18} />
                    New Follow-Up
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search follow-ups..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </select>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">Loading...</div>
            ) : followUps.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No follow-ups found</p>
                    <p className="text-sm text-slate-400 mt-1">Create one to start tracking your leads</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {followUps.map(item => (
                        <FollowUpCard
                            key={item.id}
                            item={item}
                            onEdit={(data) => { setEditData(data); setShowModal(true); }}
                            onComplete={(fu) => setCompleteModal({ open: true, followUp: fu })}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <FollowUpModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditData(null); }}
                onSave={handleSave}
                editData={editData}
            />
            <CompleteModal
                isOpen={completeModal.open}
                onClose={() => setCompleteModal({ open: false, followUp: null })}
                onComplete={handleComplete}
                followUp={completeModal.followUp}
            />
        </div>
    );
}
