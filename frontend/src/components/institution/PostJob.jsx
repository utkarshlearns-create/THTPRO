
"use client";
import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import API_BASE_URL from '../../config';

const PostJob = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        class_level: '',
        requirements: '',
        salary_range: '',
        job_type: 'FULL_TIME',
        start_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('access');
            const res = await fetch(`${API_BASE_URL}/api/jobs/institution/jobs/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                if (onSuccess) onSuccess();
            } else {
                const data = await res.json();
                setError(data.detail || "Failed to post job");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="text-indigo-600" />
                Post a New Job
            </h2>
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                     <input 
                        type="text" 
                        name="title" 
                        required 
                        value={formData.title} 
                        onChange={handleChange}
                        placeholder="e.g. Senior Physics Faculty for Class 11-12" 
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                name="subject" 
                                required 
                                value={formData.subject} 
                                onChange={handleChange}
                                placeholder="e.g. Physics" 
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Level</label>
                         <input 
                            type="text" 
                            name="class_level" 
                            required 
                            value={formData.class_level} 
                            onChange={handleChange}
                            placeholder="e.g. Class 11-12 (JEE Main)" 
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salary Range</label>
                         <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                name="salary_range" 
                                value={formData.salary_range} 
                                onChange={handleChange}
                                placeholder="e.g. 50k - 70k per month" 
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
                         <div className="relative">
                            <Clock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                             <select 
                                name="job_type" 
                                value={formData.job_type} 
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 pl-10 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                            >
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="GUEST_LECTURE">Guest Lecture</option>
                            </select>
                         </div>
                    </div>
                </div>

                 <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                     <div className="relative">
                         <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                         <input 
                            type="date" 
                            name="start_date" 
                            value={formData.start_date} 
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                     </div>
                </div>

                <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Requirements & Description</label>
                     <textarea 
                        name="requirements" 
                        required 
                        rows="5"
                        value={formData.requirements} 
                        onChange={handleChange}
                        placeholder="Describe the role, required qualifications (e.g. B.Ed, MSc), experience, and other details..." 
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Posting...' : 'Post Job'}
                </button>
            </form>
        </div>
    );
};

export default PostJob;
