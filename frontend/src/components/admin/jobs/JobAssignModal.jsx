import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Star, MapPin, CheckCircle, GraduationCap } from 'lucide-react';
import API_BASE_URL from '../../../config';
import { toast } from 'react-hot-toast';

export default function JobAssignModal({ jobId, onClose, onAssigned }) {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState(null);
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
                    setApplicants(data);
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

    const handleAssign = async (tutorId) => {
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
                    demo_date: demoDate || null 
                })
            });

            if (response.ok) {
                toast.success("Tutor assigned successfully!");
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
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Applicants</h2>
                        <p className="text-sm text-slate-500 mt-1">Select a tutor to assign to this job.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Demo Scheduling */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Schedule Demo Date & Time (Optional)
                    </label>
                    <input 
                        type="datetime-local" 
                        value={demoDate}
                        onChange={(e) => setDemoDate(e.target.value)}
                        className="w-full sm:w-2/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">If set, the parent will be notified of this demo schedule when the tutor is assigned.</p>
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
                            {applicants.map((app) => (
                                <div key={app.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
                                        {app.tutor_name?.charAt(0) || 'T'}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {app.tutor_name}
                                                    {app.status === 'APPLIED' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">Applied</span>}
                                                </h4>
                                                
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                                    {app.tutor_location && (
                                                        <div className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-300">
                                                            <MapPin size={14} className="text-slate-400" />
                                                            <span>{app.tutor_location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {app.cover_message && (
                                                    <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2 italic">
                                                        "{app.cover_message}"
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button
                                                onClick={() => handleAssign(app.tutor_id)}
                                                disabled={assigningId === app.tutor_id}
                                                className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {assigningId === app.tutor_id ? (
                                                    <><Loader2 size={16} className="animate-spin" /> Assigning...</>
                                                ) : (
                                                    <><CheckCircle size={16} /> Assign Tutor</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
