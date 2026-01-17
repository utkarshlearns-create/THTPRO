import React, { useState } from 'react';
import { ArrowRight, CheckCircle, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import API_BASE_URL from '../config';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
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

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-indigo-50 shadow-xl overflow-hidden">
             
            <div className="bg-slate-50/50 p-6 pb-0">
                <div className="flex justify-between text-sm font-semibold text-slate-500 mb-2">
                    <span>Step {step} of 4</span>
                    <span className="text-indigo-600">{Math.round((step / 4) * 100)}% Completed</span>
                </div>
                <Progress value={(step / 4) * 100} className="h-2" />
            </div>

            <CardContent className="p-8 min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* STEP 1: Student Details */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Who needs a tutor?</h2>
                                    <p className="text-slate-500">Let's start with some basic details about the student.</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="student_name">Student Name</Label>
                                        <Input 
                                            id="student_name" 
                                            name="student_name" 
                                            value={formData.student_name} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. Rahul Sharma" 
                                            autoFocus 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <div className="flex gap-4">
                                            {['Male', 'Female'].map(g => (
                                                <Button
                                                    key={g}
                                                    type="button"
                                                    variant={formData.student_gender === g ? "default" : "outline"}
                                                    className={`w-full ${formData.student_gender === g ? '' : 'text-slate-500'}`}
                                                    onClick={() => setFormData(prev => ({...prev, student_gender: g}))}
                                                >
                                                    {formData.student_gender === g && <CheckCircle className="mr-2 h-4 w-4" />}
                                                    {g}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Academic Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Academic Details</h2>
                                    <p className="text-slate-500">What subject or class do you need help with?</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Class/Grade</Label>
                                        <Select name="class_grade" value={formData.class_grade} onValueChange={(val) => handleSelectChange('class_grade', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(12)].map((_, i) => (
                                                    <SelectItem key={i} value={`Class ${i + 1}`}>Class {i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Board</Label>
                                        <Select name="board" value={formData.board} onValueChange={(val) => handleSelectChange('board', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Board" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['CBSE', 'ICSE', 'State Board', 'IGCSE', 'IB'].map(board => (
                                                    <SelectItem key={board} value={board}>{board}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Subjects Needed</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Commerce', 'Computer'].map(sub => (
                                            <Button
                                                key={sub}
                                                type="button"
                                                variant={formData.subjects.includes(sub) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleSubjectChange(sub)}
                                                className={`rounded-full ${formData.subjects.includes(sub) ? '' : 'text-slate-600 border-slate-200'}`}
                                            >
                                                {sub}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Location & Time */}
                        {step === 3 && (
                             <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Location & Schedule</h2>
                                    <p className="text-slate-500">Where and when should the classes happen?</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Locality / Area</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                                            <Input 
                                                name="locality" 
                                                value={formData.locality} 
                                                onChange={handleInputChange} 
                                                className="pl-9" 
                                                placeholder="e.g. MP Nagar, Zone 2" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Preferred Time</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                                            <Input 
                                                name="preferred_time" 
                                                value={formData.preferred_time} 
                                                onChange={handleInputChange} 
                                                className="pl-9" 
                                                placeholder="e.g. Evening 5-7 PM" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Budget & Review */}
                        {step === 4 && (
                             <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Almost Done!</h2>
                                    <p className="text-slate-500">Review your requirements and submit.</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Budget Range (Monthly)</Label>
                                    <Input 
                                        name="budget_range" 
                                        value={formData.budget_range} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g. ₹3000 - ₹5000" 
                                    />
                                </div>

                                <Card className="bg-slate-50 border-slate-100">
                                    <CardContent className="p-4 text-sm text-slate-600 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-900">Student:</span>
                                            <span>{formData.student_name} ({formData.student_gender})</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-900">Class:</span>
                                            <span>{formData.class_grade} ({formData.board})</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-900">Subjects:</span>
                                            <span className="text-right">{formData.subjects.join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-900">Location:</span>
                                            <span>{formData.locality}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardContent>

            <CardFooter className="flex justify-between p-8 pt-0 bg-white">
                <Button 
                    variant="ghost" 
                    onClick={prevStep} 
                    disabled={step === 1}
                    className={step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500'}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {step < 4 ? (
                    <Button 
                        onClick={nextStep} 
                        disabled={
                            (step === 1 && (!formData.student_name || !formData.student_gender)) ||
                            (step === 2 && (!formData.class_grade || !formData.board || formData.subjects.length === 0)) ||
                            (step === 3 && !formData.locality)
                        }
                    >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="px-8"
                    >
                        {loading ? 'Posting...' : 'Post Requirement'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default JobWizard;
