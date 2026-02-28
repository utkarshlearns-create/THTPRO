"use client";
import React, { useState, useEffect } from 'react';
import { 
    MapPin, Star, Clock, GraduationCap, BookOpen, 
    Monitor, ShieldCheck, Award, Phone, Mail, Lock, Heart
} from 'lucide-react';
import Navbar from '../Navbar';
import API_BASE_URL from '../../config';
import { useRouter } from 'next/navigation';

const TutorProfileView = ({ tutorId }) => {
    const router = useRouter();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unlocking, setUnlocking] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [isParent, setIsParent] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userRole = localStorage.getItem('role');
        setIsParent(userRole === 'PARENT');
    }, []);

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const token = localStorage.getItem('access');
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(`${API_BASE_URL}/api/users/tutors/${tutorId}/`, {
                    headers: headers
                });

                if (response.ok) {
                    const data = await response.json();
                    setTutor(data);
                    setIsFavourite(data.is_favourite);
                    setIsParent(localStorage.getItem('role') === 'PARENT');
                } else {
                    setError("Failed to load tutor profile");
                }
            } catch (err) {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        };

        if (tutorId) {
            fetchTutor();
        }
    }, [tutorId]);

    const handleToggleFavourite = async () => {
        try {
            setToggling(true);
            const token = localStorage.getItem('access');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/users/tutors/${tutorId}/favourite/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsFavourite(data.is_favourite);
            }
        } catch (error) {
            console.error("Error toggling favourite:", error);
        } finally {
            setToggling(false);
        }
    };

    const handleUnlock = async () => {
        if (!confirm("Unlock contact for 50 Credits?")) return;
        
        setUnlocking(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/tutor/${tutorId}/unlock/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Update local state with unlocked info
                setTutor(prev => ({
                    ...prev,
                    is_unlocked: true,
                    contact_info: {
                        phone: data.phone,
                        email: data.email
                    }
                }));
                alert("Contact unlocked successfully!");
            } else {
                alert(data.error || "Failed to unlock contact");
                if (response.status === 402) {
                    // Redirect to wallet recharge?
                    // router.push('/wallet');
                }
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setUnlocking(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="container mx-auto px-4 py-24 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        </div>
    );

    if (error || !tutor) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="container mx-auto px-4 py-24 text-center">
                <h2 className="text-2xl font-bold text-red-500">{error || "Tutor not found"}</h2>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <Navbar />
            
            {/* Hero Header */}
            <div className="bg-indigo-900 text-white pt-24 pb-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-white p-1 shadow-xl">
                            <img 
                                src={tutor.image || "https://via.placeholder.com/150"} 
                                alt={tutor.name}
                                className="h-full w-full rounded-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-5xl font-bold">{tutor.name}</h1>
                                {isParent && (
                                    <button 
                                        onClick={handleToggleFavourite}
                                        disabled={toggling}
                                        className={`p-3 rounded-2xl transition-all duration-300 border backdrop-blur-md ${
                                            isFavourite 
                                            ? 'bg-rose-500/20 border-rose-500/30 text-rose-500 shadow-lg shadow-rose-500/20' 
                                            : 'bg-white/10 border-white/20 text-indigo-200 hover:bg-white/20 hover:text-white'
                                        } ${toggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                                        title={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
                                    >
                                        <Heart size={24} className={isFavourite ? 'fill-current' : ''} />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-indigo-200">
                                <span className="flex items-center"><MapPin size={18} className="mr-1"/> {tutor.locality}</span>
                                <span className="flex items-center"><Star size={18} className="mr-1 text-yellow-400 fill-current"/> 4.8 Rating</span>
                                <span className="flex items-center"><Clock size={18} className="mr-1"/> {tutor.teaching_experience_years} Years Exp.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <ShieldCheck className="mr-2 text-indigo-600" /> About Me
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {tutor.about_me || "No description provided."}
                            </p>
                        </div>

                        {/* Subjects & Classes */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <BookOpen className="mr-2 text-indigo-600" /> Operating Segments
                            </h2>
                            
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Subjects</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(tutor.subjects) && tutor.subjects.map((sub, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                             
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Classes</h3>
                                <div className="flex flex-wrap gap-2">
                                     {Array.isArray(tutor.classes) && tutor.classes.map((cls, i) => (
                                        <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-semibold">
                                            {cls}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                         {/* Education & Info */}
                         <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                <Award className="mr-2 text-indigo-600" /> Credentials
                            </h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-4">
                                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Qualification</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{tutor.highest_qualification}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-4">
                                        <Monitor className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Teaching Mode</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{tutor.teaching_mode == 'BOTH' ? 'Online & Offline' : tutor.teaching_mode}</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Sidebar / Contact Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-800 sticky top-24">
                            <div className="text-center mb-6">
                                <p className="text-slate-500 mb-1">Expected Fee</p>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                    ₹{tutor.expected_fee} <span className="text-sm font-normal text-slate-400">/ month</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {tutor.is_unlocked ? (
                                    <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                        <div className="flex items-center justify-between text-green-800 dark:text-green-300">
                                            <span className="font-bold flex items-center"><Phone size={16} className="mr-2"/> Phone:</span>
                                            <span>{tutor.contact_info.phone}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-green-800 dark:text-green-300">
                                            <span className="font-bold flex items-center"><Mail size={16} className="mr-2"/> Email:</span>
                                            <span className="text-sm truncate max-w-[150px]">{tutor.contact_info.email}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                        <Lock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Contact Hidden</h3>
                                        <p className="text-sm text-slate-500 mb-4">Unlock to view phone number & email</p>
                                        <button 
                                            onClick={handleUnlock}
                                            disabled={unlocking}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                                        >
                                            {unlocking ? "Unlocking..." : "Unlock for 50 Credits"}
                                        </button>
                                    </div>
                                )}

                                <button className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors">
                                    Message Tutor
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TutorProfileView;
