import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Star, MapPin, CheckCircle, GraduationCap, Calendar, UserCheck } from 'lucide-react';
import API_BASE_URL from '../../../config';
import { toast } from 'react-hot-toast';

export default function JobAssignModal({ jobId, onClose, onAssigned }) {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState(null);
    // Track which tutor has an action UI open and what type
    const [activeAction, setActiveAction] = useState(null); // { tutorId, type: 'demo' | 'hire' }
    const [demoDate, setDemoDate] = useState('');

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applicants/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setApplicants(Array.isArray(data) ? data : data.results || []);
                } else {
                    toast.error("Failed to load applicants");
                }
            } catch (error) {
                console.error("Error fetching applicants:", error);
                toast.error("Server error");
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchApplicants();
        }
    }, [jobId]);

    const handleAssign = async (tutorId, withDemo) => {
        setAssigningId(tutorId);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/${jobId}/assign-tutor/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tutor_id: tutorId,
                    demo_date: withDemo ? demoDate : null
                })
            });

            if (response.ok) {
                toast.success(withDemo ? "Demo scheduled successfully!" : "Tutor hired successfully!");
                onAssigned();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to assign tutor");
            }
        } catch (error) {
            console.error("Error assigning tutor:", error);
            toast.error("Network error");
        } finally {
            setAssigningId(null);
            setActiveAction(null);
            setDemoDate('');
        }
    };

    const openAction = (tutorId, type) => {
        // Only one action UI open at a time
        setActiveAction({ tutorId, type });
        setDemoDate('');
    };

    const closeAction = () => {
        setActiveAction(null);
        setDemoDate('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Applicants</h2>
                        <p className="text-sm text-slate-500 mt-1">Schedule a demo or hire a tutor directly.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : applicants.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No applicants yet</h3>
                            <p className="text-slate-500 mt-1">This job hasn't received any applications.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applicants.map((app) => {
                                const isActionOpen = activeAction?.tutorId === app.tutor;
                                const actionType = activeAction?.type;

                                return (
                                    <div key={app.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
                                                {app.tutor_details?.image ? (
                                                    <img src={app.tutor_details.image} alt={app.tutor_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    app.tutor_name?.charAt(0) || 'T'
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between lg:justify-start lg:gap-3">
                                                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                {app.tutor_name}
                                                                {app.status === 'APPLIED' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">Applied</span>}
                                                            </h4>
                                                            <a
                                                                href={`/tutors/${app.tutor}`}
                                                                target="_blank"
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                                                            >
                                                                View Profile
                                                            </a>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <GraduationCap size={14} className="text-slate-400" />
                                                                <span className="font-medium">{app.tutor_details?.highest_qualification || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Star size={14} className="text-slate-400" />
                                                                <span className="font-medium">{app.tutor_details?.teaching_experience_years || 0} Years Exp.</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 col-span-full">
                                                                <MapPin size={14} className="text-slate-400" />
                                                                <span>{app.tutor_details?.locality || 'Location N/A'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            {app.tutor_details?.subjects?.slice(0, 3).map(sub => (
                                                                <span key={sub} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 rounded">
                                                                    {sub}
                                                                </span>
                                                            ))}
                                                            {app.tutor_details?.subjects?.length > 3 && (
                                                                <span className="text-[10px] text-slate-400 font-bold">+{app.tutor_details.subjects.length - 3} more</span>
                                                            )}
                                                        </div>

                                                        {app.cover_message && (
                                                            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2 italic">
                                                                "{app.cover_message}"
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Two action buttons side by side */}
                                                    {!isActionOpen && (
                                                        <div className="flex gap-2 shrink-0">
                                                            <button
                                                                onClick={() => openAction(app.tutor, 'demo')}
                                                                className="px-4 py-2.5 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2"
                                                            >
                                                                <Calendar size={16} /> Schedule Demo
                                                            </button>
                                                            <button
                                                                onClick={() => openAction(app.tutor, 'hire')}
                                                                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                                            >
                                                                <UserCheck size={16} /> Hire Directly
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inline Demo Schedule UI */}
                                        {isActionOpen && actionType === 'demo' && (
                                            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800/30 space-y-3">
                                                <label className="block text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                                    Select Demo Date & Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={demoDate}
                                                    onChange={(e) => setDemoDate(e.target.value)}
                                                    className="w-full sm:w-2/3 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (!demoDate) {
                                                                toast.error("Please select a demo date");
                                                                return;
                                                            }
                                                            handleAssign(app.tutor, true);
                                                        }}
                                                        disabled={assigningId === app.tutor}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {assigningId === app.tutor ? (
                                                            <><Loader2 size={14} className="animate-spin" /> Scheduling...</>
                                                        ) : (
                                                            <><CheckCircle size={14} /> Confirm Demo</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={closeAction}
                                                        className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Inline Direct Hire Confirmation */}
                                        {isActionOpen && actionType === 'hire' && (
                                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800/30 space-y-3">
                                                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                                                    Hire <span className="font-black">{app.tutor_name}</span> without demo?
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAssign(app.tutor, false)}
                                                        disabled={assigningId === app.tutor}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {assigningId === app.tutor ? (
                                                            <><Loader2 size={14} className="animate-spin" /> Hiring...</>
                                                        ) : (
                                                            <><UserCheck size={14} /> Yes, Hire</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={closeAction}
                                                        className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
