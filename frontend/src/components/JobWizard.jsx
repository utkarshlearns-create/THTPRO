import React, { useState } from 'react';
import { 
    ArrowRight, 
    ArrowLeft, 
    CheckCircle, 
    MapPin, 
    Clock, 
    User, 
    BookOpen, 
    GraduationCap, 
    Code, 
    Globe, 
    Calculator,
    FlaskConical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import API_BASE_URL from '../config';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardFooter } from './ui/card';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
    
    // For Select components
    const handleSelectChange = (name, value) => {
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
        const token = localStorage.getItem('access');
        const role = localStorage.getItem('role');

        if (!token || role !== 'PARENT') {
            // Store data in local storage so they don't lose it after login
            localStorage.setItem('pendingJobPost', JSON.stringify(formData));
            alert("Please Login as a Parent first!");
            navigate('/login?redirect=post-job');
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
                localStorage.removeItem('pendingJobPost');
                alert("Requirement Posted! Redirecting to Dashboard...");
                navigate('/parent-home');
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

    // Animation Variants
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 30 : -30,
            opacity: 0,
            scale: 0.98
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 30 : -30,
            opacity: 0,
            scale: 0.98
        })
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-0 shadow-2xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10">
             
            {/* Progress Bar Container */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Step {step} of 4</span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                            {step === 1 && "Student Profile"}
                            {step === 2 && "Academic Needs"}
                            {step === 3 && "Location & Schedule"}
                            {step === 4 && "Review & Post"}
                        </h2>
                    </div>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{Math.round((step / 4) * 100)}%</span>
                </div>
                <Progress value={(step / 4) * 100} className="h-1.5 bg-slate-200 dark:bg-slate-700" indicatorClassName="bg-indigo-600 dark:bg-indigo-500" />
            </div>

            <CardContent className="p-8 min-h-[420px] relative">
                <AnimatePresence custom={step} mode="wait">
                    <motion.div
                        key={step}
                        custom={step}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full"
                    >
                        {/* STEP 1: Student Details */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Who is this for?</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                        <Input 
                                            name="student_name" 
                                            value={formData.student_name} 
                                            onChange={handleInputChange} 
                                            placeholder="Student's Full Name" 
                                            className="pl-12 py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-indigo-500 dark:focus:ring-indigo-400" 
                                            autoFocus 
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Gender</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Male', 'Female'].map(g => (
                                            <div 
                                                key={g}
                                                onClick={() => setFormData(prev => ({...prev, student_gender: g}))}
                                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                                                    formData.student_gender === g 
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-md transform scale-[1.02]' 
                                                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                {g === 'Male' ? <User className="h-8 w-8 text-blue-500/80" /> : <User className="h-8 w-8 text-pink-500/80" />}
                                                <span className="font-semibold">{g}</span>
                                                {formData.student_gender === g && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-900" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Academic Details */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Class/Grade</Label>
                                        <Select name="class_grade" value={formData.class_grade} onValueChange={(val) => handleSelectChange('class_grade', val)}>
                                            <SelectTrigger className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(12)].map((_, i) => (
                                                    <SelectItem key={i} value={`Class ${i + 1}`}>Class {i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Board</Label>
                                        <Select name="board" value={formData.board} onValueChange={(val) => handleSelectChange('board', val)}>
                                            <SelectTrigger className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['CBSE', 'ICSE', 'State Board', 'IGCSE', 'IB'].map(board => (
                                                    <SelectItem key={board} value={board}>{board}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Subjects Needed</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { name: 'Maths', icon: Calculator }, 
                                            { name: 'Science', icon: FlaskConical }, 
                                            { name: 'English', icon: BookOpen }, 
                                            { name: 'Physics', icon: Globe }, // Placeholder icon
                                            { name: 'Chemistry', icon: FlaskConical },
                                            { name: 'Biology', icon: GraduationCap },
                                            { name: 'Computer', icon: Code }, 
                                            { name: 'Commerce', icon: User }
                                        ].map((sub) => (
                                            <button
                                                key={sub.name}
                                                type="button"
                                                onClick={() => handleSubjectChange(sub.name)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                                                    formData.subjects.includes(sub.name)
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 transform scale-105'
                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {sub.name}
                                                {formData.subjects.includes(sub.name) && <CheckCircle className="h-3 w-3 ml-1 fill-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Location & Time */}
                        {step === 3 && (
                             <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Locality / Area</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-indigo-500 dark:text-indigo-400 group-focus-within:animate-bounce" />
                                        </div>
                                        <Input 
                                            name="locality" 
                                            value={formData.locality} 
                                            onChange={handleInputChange} 
                                            className="pl-12 py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-shadow" 
                                            placeholder="e.g. Indiranagar, Sector 14" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Preferred Time Slot</Label>
                                    <div className="relative group">
                                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <Input 
                                            name="preferred_time" 
                                            value={formData.preferred_time} 
                                            onChange={handleInputChange} 
                                            className="pl-12 py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-shadow" 
                                            placeholder="e.g. Evening 5-7 PM" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Budget & Review */}
                        {step === 4 && (
                             <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Monthly Budget (Approx)</Label>
                                    <Input 
                                        name="budget_range" 
                                        value={formData.budget_range} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g. ₹3000 - ₹5000" 
                                        className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
                                    />
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                                     <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Summary</h3>
                                     
                                     <div className="flex items-center gap-4">
                                         <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <User className="h-5 w-5" />
                                         </div>
                                         <div>
                                             <p className="text-sm text-slate-500 dark:text-slate-400">Student</p>
                                             <p className="font-semibold text-slate-900 dark:text-white">{formData.student_name} ({formData.student_gender})</p>
                                         </div>
                                     </div>

                                     <div className="flex items-center gap-4">
                                         <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <GraduationCap className="h-5 w-5" />
                                         </div>
                                         <div>
                                             <p className="text-sm text-slate-500 dark:text-slate-400">Academic</p>
                                             <p className="font-semibold text-slate-900 dark:text-white">{formData.class_grade} • {formData.board}</p>
                                         </div>
                                     </div>

                                     <div className="flex items-center gap-4">
                                         <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <BookOpen className="h-5 w-5" />
                                         </div>
                                         <div>
                                             <p className="text-sm text-slate-500 dark:text-slate-400">Subjects</p>
                                             <p className="font-semibold text-slate-900 dark:text-white">{formData.subjects.join(', ')}</p>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardContent>

            <CardFooter className="flex justify-between p-8 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                <Button 
                    variant="ghost" 
                    onClick={prevStep} 
                    disabled={step === 1}
                    className={`text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {step < 4 ? (
                    <Button 
                        onClick={nextStep} 
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5"
                        disabled={
                            (step === 1 && (!formData.student_name || !formData.student_gender)) ||
                            (step === 2 && (!formData.class_grade || !formData.board || formData.subjects.length === 0)) ||
                            (step === 3 && !formData.locality)
                        }
                    >
                        Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-10 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5 font-bold"
                    >
                        {loading ? 'Posting...' : 'Post Requirement'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default JobWizard;
