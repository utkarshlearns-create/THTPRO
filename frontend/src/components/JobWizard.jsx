import React, { useState } from 'react';
import { ArrowRight, CheckCircle, MapPin, Calendar, BookOpen, Clock } from 'lucide-react';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

const JobWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        student_name: '',
        student_gender: '',
        class_grade: '',
        board: '',
        subjects: [],
        locality: '',
        preferred_time: '',
        budget_range: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubjectChange = (subject) => {
        setFormData(prev => {
            const current = prev.subjects || [];
            if (current.includes(subject)) {
                return { ...prev, subjects: current.filter(s => s !== subject) };
            } else {
                return { ...prev, subjects: [...current, subject] };
            }
        });
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        // If not logged in, we should redirect to login but save state (TODO: Implement proper auth flow persistence)
        const token = localStorage.getItem('access');
        const role = localStorage.getItem('role');

        if (!token || role !== 'PARENT') {
            // Ideally redirect to login with return_url
            alert("Please Login as a Parent first!");
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Requirement Posted! Redirecting to Dashboard...");
                navigate('/dashboard/parent');
            } else {
                alert("Failed to post job. Please try again.");
            }
        } catch (error) {
            console.error("Error posting job:", error);
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden border border-indigo-50 relative">
            <div className="h-2 bg-slate-100 w-full">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>

            <div className="p-8">
                {/* STEM 1: Student Details */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Who needs a tutor?</h2>
                        <p className="text-slate-500 mb-6">Let's start with some basic details about the student.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="label">Student Name</label>
                                <input type="text" name="student_name" value={formData.student_name} onChange={handleInputChange} className="input-wiz" placeholder="e.g. Rahul Sharma" autoFocus />
                            </div>
                            <div>
                                <label className="label">Gender</label>
                                <div className="flex gap-4">
                                    {['Male', 'Female'].map(g => (
                                        <button 
                                            key={g}
                                            onClick={() => setFormData(prev => ({...prev, student_gender: g}))}
                                            className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all
                                            ${formData.student_gender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-200'}
                                            `}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={nextStep} disabled={!formData.student_name || !formData.student_gender} className="btn-wiz">
                                Next <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Academic Details */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Academic Details</h2>
                        <p className="text-slate-500 mb-6">What subject or class do you need help with?</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="label">Class/Grade</label>
                                <select name="class_grade" value={formData.class_grade} onChange={handleInputChange} className="input-wiz">
                                    <option value="">Select Class</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Board</label>
                                <select name="board" value={formData.board} onChange={handleInputChange} className="input-wiz">
                                    <option value="">Select Board</option>
                                    <option value="CBSE">CBSE</option>
                                    <option value="ICSE">ICSE</option>
                                    <option value="State Board">State Board</option>
                                    <option value="IGCSE">IGCSE</option>
                                    <option value="IB">IB</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label mb-2 block">Subjects Needed</label>
                            <div className="flex flex-wrap gap-2">
                                {['Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Commerce', 'Computer'].map(sub => (
                                    <button 
                                        key={sub}
                                        onClick={() => handleSubjectChange(sub)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
                                        ${formData.subjects.includes(sub) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}
                                        `}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button onClick={prevStep} className="text-slate-500 font-medium hover:text-slate-800">Back</button>
                            <button onClick={nextStep} disabled={!formData.class_grade || !formData.board || formData.subjects.length === 0} className="btn-wiz">
                                Next <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Location & Time */}
                {step === 3 && (
                     <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Location & Schedule</h2>
                        <p className="text-slate-500 mb-6">Where and when should the classes happen?</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="label">Locality / Area</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input type="text" name="locality" value={formData.locality} onChange={handleInputChange} className="input-wiz pl-10" placeholder="e.g. MP Nagar, Zone 2" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Preferred Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input type="text" name="preferred_time" value={formData.preferred_time} onChange={handleInputChange} className="input-wiz pl-10" placeholder="e.g. Evening 5-7 PM" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button onClick={prevStep} className="text-slate-500 font-medium hover:text-slate-800">Back</button>
                            <button onClick={nextStep} disabled={!formData.locality} className="btn-wiz">
                                Next <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Budget & Review */}
                {step === 4 && (
                     <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Almost Done!</h2>
                        <p className="text-slate-500 mb-6">Review your requirements and submit.</p>
                        
                        <div>
                            <label className="label">Budget Range (Monthly)</label>
                            <input type="text" name="budget_range" value={formData.budget_range} onChange={handleInputChange} className="input-wiz" placeholder="e.g. ₹3000 - ₹5000" />
                        </div>

                        <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 space-y-2">
                            <p><strong>Student:</strong> {formData.student_name} ({formData.student_gender})</p>
                            <p><strong>Class:</strong> {formData.class_grade} ({formData.board})</p>
                            <p><strong>Subjects:</strong> {formData.subjects.join(', ')}</p>
                            <p><strong>Location:</strong> {formData.locality}</p>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button onClick={prevStep} className="text-slate-500 font-medium hover:text-slate-800">Back</button>
                            <button onClick={handleSubmit} disabled={loading} className="btn-wiz w-auto px-8">
                                {loading ? 'Posting...' : 'Post Requirement'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .label { @apply block text-sm font-semibold text-slate-700 mb-1.5; }
                .input-wiz { @apply w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium; }
                .btn-wiz { @apply bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed; }
            `}</style>
        </div>
    );
};

export default JobWizard;
