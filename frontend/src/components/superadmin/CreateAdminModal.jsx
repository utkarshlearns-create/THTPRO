"use client";
import React, { useState } from 'react';
import { X, UserPlus, Shield, Mail, Phone, Lock, User } from 'lucide-react';
import API_BASE_URL from '../../config';

const CreateAdminModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        department: 'PARENT_OPS'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/superadmin/create-admin/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                if (onSuccess) onSuccess(data);
                onClose();
            } else if (response.status === 401) {
                 alert("Your session has expired. Please login again.");
                 localStorage.removeItem('access');
                 window.location.href = '/login'; // Force redirect
                 onClose();
            } else {
                 let errorMessage = data.error || data.detail || "Failed to create admin";
                 
                 if (!errorMessage && typeof data === 'object') {
                     // Convert validation errors dict to string
                     const messages = Object.entries(data).map(([key, msgs]) => {
                          const msgText = Array.isArray(msgs) ? msgs.join(', ') : JSON.stringify(msgs);
                          return `${key}: ${msgText}`;
                     });
                     if (messages.length > 0) {
                         errorMessage = messages.join('\n');
                     }
                 }
                 setError(errorMessage);
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserPlus size={20} className="text-brand-gold" /> Create New Admin
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Username</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                                        placeholder="admin_name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                                    placeholder="admin@tht.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text" // Visible for admin creation ease, or password type
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                                    placeholder="Strong Password"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Department / Role</label>
                            <div className="relative">
                                <Shield size={16} className="absolute left-3 top-3 text-slate-400" />
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm appearance-none"
                                >
                                    <option value="PARENT_OPS">Parent Operations</option>
                                    <option value="TUTOR_OPS">Tutor Operations</option>
                                    <option value="INSTITUTION_OPS">Institution Operations</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 bg-brand-gold hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-brand-gold/20 font-medium text-sm transition-all"
                            >
                                {loading ? 'Creating...' : 'Create Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Start Function needed for ChevronDown usage above if not imported
function ChevronDown({ className, size }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m6 9 6 6 6-6"/>
        </svg>
    )
}

export default CreateAdminModal;

