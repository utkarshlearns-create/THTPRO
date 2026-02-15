"use client";
import React, { useState } from 'react';
import { X, Loader2, Package, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import API_BASE_URL from '../../config';
import { toast } from 'react-hot-toast';

export default function CreatePackageModal({ onClose, onSuccess, defaultRole = '' }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        credits: '',
        target_role: defaultRole || 'TUTOR',
        is_active: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.name || !form.price || !form.credits) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/wallet/admin/packages/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    price: parseFloat(form.price),
                    credits: parseInt(form.credits),
                    target_role: form.target_role,
                    is_active: form.is_active
                })
            });

            if (response.ok) {
                toast.success('Package created successfully!');
                onSuccess?.();
                onClose();
            } else {
                const data = await response.json();
                toast.error(data.detail || 'Failed to create package');
            }
        } catch (error) {
            console.error('Error creating package:', error);
            toast.error('Failed to create package');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Package className="text-amber-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Package</h2>
                            <p className="text-sm text-slate-500">Add a new subscription package</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Package Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Package Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g., Starter Pack"
                            className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Brief description of the package"
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Price and Credits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="299"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Credits <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="credits"
                                value={form.credits}
                                onChange={handleChange}
                                placeholder="50"
                                min="1"
                                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Target Role */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Target Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="target_role"
                            value={form.target_role}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                        >
                            <option value="TUTOR">Tutor</option>
                            <option value="PARENT">Parent</option>
                        </select>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Package is active and visible to users
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={16} className="mr-2" />
                                    Create Package
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

