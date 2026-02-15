"use client";
import React, { useState, useEffect } from 'react';
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
    FlaskConical,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import API_BASE_URL from '../config';
import { clearAuthState } from '../utils/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardFooter } from './ui/card';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Icon mapping for subjects
const iconMap = {
    'Calculator': Calculator,
    'FlaskConical': FlaskConical,
    'BookOpen': BookOpen,
    'Atom': Globe,
    'Dna': GraduationCap,
    'Globe': Globe,
    'Code': Code,
    'Landmark': BookOpen,
    'Map': Globe,
    'TrendingUp': Calculator,
    'GraduationCap': GraduationCap,
    'Stethoscope': FlaskConical,
    'Award': GraduationCap,
    'BarChart': Calculator,
};

const JobWizard = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [masterDataLoading, setMasterDataLoading] = useState(true);
    
    // Master data from API
    const [subjects, setSubjects] = useState([]);
    const [boards, setBoards] = useState([]);
    const [classLevels, setClassLevels] = useState([]);
    
    const [formData, setFormData] = useState({
        class_grade: '',
        board: '',
        subjects: [],
        locality: '',
        preferred_time: '',
        budget_range: '',
        hourly_rate: '',
        requirements: ''
    });

    // Fetch master data on mount
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/jobs/master/`);
                if (response.ok) {
                    const data = await response.json();
                    setSubjects(data.subjects || []);
                    setBoards(data.boards || []);
                    setClassLevels(data.class_levels || []);
                }
            } catch (error) {
                console.error('Error fetching master data:', error);
                // Fallback to defaults if API fails
                setSubjects([
                    { id: 1, name: 'Maths', icon: 'Calculator' },
                    { id: 2, name: 'Science', icon: 'FlaskConical' },
                    { id: 3, name: 'English', icon: 'BookOpen' },
                    { id: 4, name: 'Physics', icon: 'Atom' },
                    { id: 5, name: 'Chemistry', icon: 'FlaskConical' },
                    { id: 6, name: 'Biology', icon: 'Dna' },
                    { id: 7, name: 'Computer', icon: 'Code' },
                    { id: 8, name: 'Commerce', icon: 'TrendingUp' }
                ]);
                setBoards([
                    { id: 1, name: 'CBSE', short_name: 'CBSE' },
                    { id: 2, name: 'ICSE', short_name: 'ICSE' },
                    { id: 3, name: 'State Board', short_name: 'State' },
                    { id: 4, name: 'IGCSE', short_name: 'IGCSE' },
                    { id: 5, name: 'IB', short_name: 'IB' }
                ]);
                setClassLevels([
                    ...Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Class ${i + 1}` }))
                ]);
            } finally {
                setMasterDataLoading(false);
            }
        };
        fetchMasterData();
    }, []);

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

        if (!token) {
            localStorage.setItem('pendingJobPost', JSON.stringify(formData));
            alert("Please Login to post a job opportunity!");
            router.push('/login?redirect=post-job');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.removeItem('pendingJobPost');
                alert(`Success! ${data.message}\n\nYour job posting is being reviewed by our team. You'll be notified once it's approved.`);
                if (role === 'TEACHER') {
                    router.push('/tutor-home');
                } else {
                    router.push('/dashboard/parent');
                }
            } else if (response.status === 401) {
                alert("Your session has expired. Please login again.");
                clearAuthState();
                router.push('/login');
            } else {
                // Handle different error formats (string or object)
                let errorMessage = data.error || data.detail || "Failed to post job. Please try again.";
                
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
                alert(errorMessage);
            }
        } catch (error) {
            console.error("Error posting job:", error);
            alert("Network error. Please check your connection.");
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
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Step {step} of 3</span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                            {step === 1 && "Academic Details"}
                            {step === 2 && "Location & Availability"}
                            {step === 3 && "Rate & Review"}
                        </h2>
                    </div>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{Math.round((step / 3) * 100)}%</span>
                </div>
                <Progress value={(step / 3) * 100} className="h-1.5 bg-slate-200 dark:bg-slate-700" indicatorClassName="bg-indigo-600 dark:bg-indigo-500" />
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
                        {/* STEP 1: Academic Details */}
                        {step === 1 && (
                            <div className="space-y-8">
                                {masterDataLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                        <span className="ml-2 text-slate-500">Loading options...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Class/Grade</Label>
                                                <Select name="class_grade" value={formData.class_grade} onValueChange={(val) => handleSelectChange('class_grade', val)}>
                                                    <SelectTrigger className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classLevels.map((level) => (
                                                            <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>
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
                                                        {boards.map(board => (
                                                            <SelectItem key={board.id} value={board.short_name || board.name}>{board.short_name || board.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Subjects You Can Teach</Label>
                                            <div className="flex flex-wrap gap-3">
                                                {subjects.map((sub) => {
                                                    const IconComponent = iconMap[sub.icon] || BookOpen;
                                                    return (
                                                        <button
                                                            key={sub.id}
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
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}



                        {/* STEP 2: Location & Availability */}
                        {step === 2 && (
                             <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Your Locality / Area</Label>
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
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Your Available Time Slots</Label>
                                    <div className="relative group">
                                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <Input 
                                            name="preferred_time" 
                                            value={formData.preferred_time} 
                                            onChange={handleInputChange} 
                                            className="pl-12 py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-shadow" 
                                            placeholder="e.g. Weekday Evenings 5-8 PM" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Rate & Requirements */}
                        {step === 3 && (
                             <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Hourly Rate (₹)</Label>
                                        <Input 
                                            name="hourly_rate" 
                                            type="number"
                                            value={formData.hourly_rate} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. 500" 
                                            className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Budget Range (Optional)</Label>
                                        <Input 
                                            name="budget_range" 
                                            value={formData.budget_range} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. ₹3000 - ₹5000/month" 
                                            className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Additional Requirements (Optional)</Label>
                                    <textarea
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                        rows={4}
                                        placeholder="Any specific requirements or preferences..."
                                        className="w-full px-4 py-3 text-base bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none"
                                    />
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                                     <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Summary</h3>
                                     
                                     <div className="flex items-center gap-4">
                                         <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <GraduationCap className="h-5 w-5" />
                                         </div>
                                         <div>
                                             <p className="text-sm text-slate-500 dark:text-slate-400">Teaching</p>
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

                                     <div className="flex items-center gap-4">
                                         <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <MapPin className="h-5 w-5" />
                                         </div>
                                         <div>
                                             <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                                             <p className="font-semibold text-slate-900 dark:text-white">{formData.locality}</p>
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

                {step < 3 ? (
                    <Button 
                        onClick={nextStep} 
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5"
                        disabled={
                            (step === 1 && (!formData.class_grade || !formData.board || formData.subjects.length === 0)) ||
                            (step === 2 && !formData.locality)
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
                        {loading ? 'Submitting...' : 'Post Job Opportunity'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default JobWizard;



