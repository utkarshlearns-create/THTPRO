import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Save, Loader2 } from 'lucide-react';
import API_BASE_URL from '../../config';

const EditUserModal = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'PARENT',
        department: user?.department || ''
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
            const response = await fetch(`${API_BASE_URL}/api/users/superadmin/users/${user.id}/`, {
                method: 'PATCH',
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
                alert("Session expired. Please login again.");
                localStorage.removeItem('access');
                window.location.href = '/superadmin/login';
            } else {
                let errorMessage = data.error || data.detail || "Failed to update user";
                if (typeof data === 'object' && !errorMessage) {
                    const messages = Object.entries(data).map(([key, msgs]) => {
                        const msgText = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
                        return `${key}: ${msgText}`;
                    });
                    if (messages.length > 0) errorMessage = messages.join('\n');
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
                        <User size={20} className="text-brand-gold" /> Edit User
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
                        {/* User Info Header */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-gold to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{user?.username}</p>
                                <p className="text-xs text-slate-500">ID: #{user?.id} • Joined {new Date(user?.date_joined).toLocaleDateString()}</p>
                            </div>
                        </div>

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
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
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
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role</label>
                                <div className="relative">
                                    <Shield size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm appearance-none"
                                    >
                                        <option value="PARENT">Parent</option>
                                        <option value="TEACHER">Tutor</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                            {formData.role === 'ADMIN' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option value="PARENT_OPS">Parent Operations</option>
                                        <option value="TUTOR_OPS">Tutor Operations</option>
                                    </select>
                                </div>
                            )}
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
                                className="flex-1 py-2.5 bg-brand-gold hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-brand-gold/20 font-medium text-sm transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
