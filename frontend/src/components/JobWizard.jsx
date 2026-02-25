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
    Loader2,
    ChevronDown,
    Navigation
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    
    const dropdownRef = React.useRef(null);

    // Close the dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSubjectDropdownOpen(false);
            }
        };

        if (isSubjectDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSubjectDropdownOpen]);

    // Master data from API
    const [subjects, setSubjects] = useState([]);
    const [boards, setBoards] = useState([]);
    const [classLevels, setClassLevels] = useState([]);
    
    const [formData, setFormData] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedDraft = localStorage.getItem('jobWizardDraft');
            if (savedDraft) {
                try {
                    return JSON.parse(savedDraft);
                } catch (e) {
                    console.error("Error parsing draft", e);
                }
            }
        }
        return {
            student_gender: '',
            tutor_gender_preference: 'Any',
            tuition_mode: 'HOME',
            class_grade: '',
            board: '',
            subjects: [],
            locality: '',
            preferred_time: '',
            budget_range: '',
            hourly_rate: '',
            requirements: '',
            parent_whatsapp_number: ''
        };
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('jobWizardDraft', JSON.stringify(formData));
        }
    }, [formData]);

    // Fetch master data on mount
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                // Fetch Master Data
                const response = await fetch(`${API_BASE_URL}/api/jobs/master/`);
                if (response.ok) {
                    const data = await response.json();
                    setSubjects(data.subjects || []);
                    setBoards(data.boards || []);
                    setClassLevels(data.class_levels || []);
                }

                // Fetch Profile info to auto-fill WhatsApp number if available
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('access');
                    if (token) {
                        try {
                            const profileRes = await fetch(`${API_BASE_URL}/api/users/profile/`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (profileRes.ok) {
                                const profileData = await profileRes.json();
                                if (profileData.phone) {
                                    setFormData(prev => ({
                                        ...prev,
                                        parent_whatsapp_number: prev.parent_whatsapp_number || profileData.phone
                                    }));
                                }
                            }
                        } catch (err) {
                            console.error("Error fetching profile phone:", err);
                        }
                    }
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
            toast.error("Please Login to post a job opportunity!");
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
                localStorage.removeItem('jobWizardDraft');
                toast.success(`Success! ${data.message}\nYour job posting is being reviewed by our team.`, { duration: 5000 });
                if (role === 'TEACHER') {
                    router.push('/tutor-home');
                } else {
                    router.push('/dashboard/parent');
                }
            } else if (response.status === 401) {
                toast.error("Your session has expired. Please login again.");
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
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error posting job:", error);
            toast.error("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Reverse geocoding using OpenStreetMap Nominatim with zoom 13 (city district/suburb level)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=13&addressdetails=1`, {
                        headers: {
                            'Accept-Language': 'en-US,en;q=0.9',
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const address = data.address;
                        
                        // Construct a more accurate, broader area name (e.g. "Indiranagar, Lucknow")
                        const area = address.suburb || address.neighbourhood || address.city_district;
                        const city = address.city || address.town || address.county;
                        
                        let localityName = '';
                        if (area && city && area !== city) {
                            localityName = `${area}, ${city}`;
                        } else {
                            localityName = area || city || address.state || '';
                        }
                        
                        if (localityName) {
                            setFormData(prev => {
                                const newData = { ...prev, locality: localityName };
                                return newData;
                            });
                        } else {
                            toast.error("Could not determine specific locality from coordinates.");
                        }
                    } else {
                        throw new Error("Failed to reverse geocode");
                    }
                } catch (error) {
                    console.error("Error fetching location details:", error);
                    toast.error("Failed to get location details. Please enter manually.");
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = "Failed to detect location.";
                if (error.code === 1) msg = "Please allow location access to use this feature.";
                toast.error(msg);
                setIsDetectingLocation(false);
            },
            { timeout: 10000 }
        );
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
        <Card className="w-full max-w-2xl mx-auto border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10">
             
            {/* Progress Bar Container */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6 border-b border-slate-100 dark:border-slate-800 rounded-t-2xl">
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

                                        <div className="grid grid-cols-2 gap-6 mt-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Student Gender</Label>
                                                <Select name="student_gender" value={formData.student_gender} onValueChange={(val) => handleSelectChange('student_gender', val)}>
                                                    <SelectTrigger className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Male">Boy</SelectItem>
                                                        <SelectItem value="Female">Girl</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">WhatsApp Number</Label>
                                                <Input 
                                                    name="parent_whatsapp_number" 
                                                    value={formData.parent_whatsapp_number} 
                                                    onChange={handleInputChange} 
                                                    placeholder="e.g. 9876543210" 
                                                    className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mt-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Tutor Gender Preference</Label>
                                                <Select name="tutor_gender_preference" value={formData.tutor_gender_preference} onValueChange={(val) => handleSelectChange('tutor_gender_preference', val)}>
                                                    <SelectTrigger className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Any">No Preference</SelectItem>
                                                        <SelectItem value="Male">Male Tutor</SelectItem>
                                                        <SelectItem value="Female">Female Tutor</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Subjects Required</Label>
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                                                    className="w-full flex items-center justify-between py-5 px-4 text-left text-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <span className="truncate text-slate-700 dark:text-slate-200">
                                                        {formData.subjects.length > 0 ? formData.subjects.join(', ') : 'Select Subjects...'}
                                                    </span>
                                                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                
                                                <AnimatePresence>
                                                {isSubjectDropdownOpen && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                                                    >
                                                        <div className="p-2 pb-3 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                                                            {(() => {
                                                                const isJuniorClass = formData.class_grade && 
                                                                    ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7'].includes(formData.class_grade);
                                                                
                                                                // Conditionally inject "All Subjects"
                                                                let optionsToRender = [...subjects];
                                                                if (isJuniorClass && !optionsToRender.some(s => s.name === 'All Subjects')) {
                                                                    optionsToRender = [{ id: 'all_subj', name: 'All Subjects', icon: 'BookOpen' }, ...optionsToRender];
                                                                }
                                                                return optionsToRender.map((sub) => (
                                                                    <label key={sub.id} className="flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg cursor-pointer transition-colors group">
                                                                        <div className={`flex items-center justify-center w-5 h-5 rounded border ${formData.subjects.includes(sub.name) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}`}>
                                                                            {formData.subjects.includes(sub.name) && <CheckCircle className="h-4 w-4 text-white" />}
                                                                        </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        value={sub.name}
                                                                        checked={formData.subjects.includes(sub.name)}
                                                                        onChange={() => handleSubjectChange(sub.name)}
                                                                        className="hidden"
                                                                    />
                                                                    <span className="text-slate-700 dark:text-slate-200 font-medium">{sub.name}</span>
                                                                    </label>
                                                                ));
                                                            })()}
                                                        </div>
                                                    </motion.div>
                                                )}
                                                </AnimatePresence>
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
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Tuition Mode</Label>
                                    <Select name="tuition_mode" value={formData.tuition_mode} onValueChange={(val) => handleSelectChange('tuition_mode', val)}>
                                        <SelectTrigger className="py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HOME">Home Tuition</SelectItem>
                                            <SelectItem value="ONLINE_ONE_TO_ONE">Online One-to-One</SelectItem>
                                            <SelectItem value="ONLINE_GROUP">Online Group</SelectItem>
                                            <SelectItem value="INSTITUTION">Institution / Center</SelectItem>
                                            <SelectItem value="BOTH">Both / Any</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Your Locality / Area</Label>
                                    <div className="flex gap-2">
                                        <div className="relative group flex-1">
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
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={detectLocation}
                                            disabled={isDetectingLocation}
                                            className="py-6 px-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                            title="Detect my location"
                                        >
                                            {isDetectingLocation ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Navigation className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">Preferred Timing</Label>
                                    <div className="relative group">
                                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <Select name="preferred_time" value={formData.preferred_time} onValueChange={(val) => handleSelectChange('preferred_time', val)}>
                                            <SelectTrigger className="pl-12 py-6 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                                <SelectValue placeholder="Select Preferred Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Early Morning (Before 9 AM)">Early Morning (Before 9 AM)</SelectItem>
                                                <SelectItem value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</SelectItem>
                                                <SelectItem value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</SelectItem>
                                                <SelectItem value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</SelectItem>
                                                <SelectItem value="Late Evening (After 8 PM)">Late Evening (After 8 PM)</SelectItem>
                                                <SelectItem value="Flexible / Any Time">Flexible / Any Time</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                            (step === 1 && (!formData.class_grade || !formData.board || formData.subjects.length === 0 || !formData.student_gender)) ||
                            (step === 2 && !formData.locality)
                        }
                    >
                        Save & Next <ArrowRight className="ml-2 h-4 w-4" />
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



