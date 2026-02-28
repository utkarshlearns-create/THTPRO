"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Phone, User, Sparkles } from 'lucide-react';
import API_BASE_URL from '../config';
import { LOCATION_DATA } from '../constants/locations';
import { MapPin, Home } from 'lucide-react';

const ParentOnboardingPopup = ({ userProfile, onComplete, forceOpen = false, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('Lucknow');
    const [area, setArea] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (forceOpen) {
            setName(userProfile?.first_name || '');
            setPhone(userProfile?.phone || '');
            setIsOpen(true);
            return;
        }

        // If profile is loaded and missing either first_name or phone, show popup
        if (userProfile && (!userProfile.first_name || !userProfile.phone)) {
            setName(userProfile.first_name || '');
            setPhone(userProfile.phone || '');
            setCity(userProfile.city || 'Lucknow');
            setArea(userProfile.area || '');
            setAddress(userProfile.address || '');
            setIsOpen(true);
        } else if (userProfile) {
            setIsOpen(false);
        }
    }, [userProfile, forceOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || phone.trim().length < 10) {
            setError('Please provide a valid name and phone number.');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('access');
            const res = await fetch(`${API_BASE_URL}/api/users/me/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: name.trim(),
                    phone: phone.trim(),
                    city: city,
                    area: area,
                    address: address.trim()
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setIsOpen(false);
                if (onComplete) onComplete(updatedUser);
            } else {
                const data = await res.json();
                setError(data.error || data.phone?.[0] || 'Error updating profile. Please try again.');
            }
        } catch (err) {
            console.error('Error in onboarding:', err);
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                    className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50"
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-center relative overflow-hidden">
                        {forceOpen && onClose && (
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors z-20"
                            >
                                ✕
                            </button>
                        )}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 ring-4 ring-white/10">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">{forceOpen ? 'Update Your Profile' : 'Just One More Little Step!'}</h2>
                            <p className="text-indigo-100 mt-2 text-sm font-medium">{forceOpen ? 'Keep your contact details up to date.' : 'To provide you with the best experience, we need a few details to personalize your account.'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 pb-10 space-y-6">
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm rounded-xl font-medium tracking-tight">
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">Your Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all text-sm font-medium"
                                        placeholder="e.g. Ramesh Kumar"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">WhatsApp Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all text-sm font-medium"
                                        placeholder="Mobile Number"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 font-medium">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    We promise no spam, ever.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-5">
                                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Address Details</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">City</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <MapPin size={18} />
                                            </div>
                                            <select
                                                required
                                                value={city}
                                                onChange={(e) => {
                                                    setCity(e.target.value);
                                                    setArea('');
                                                }}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all text-sm font-medium appearance-none"
                                            >
                                                {Object.keys(LOCATION_DATA["Uttar Pradesh"]).map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">Area</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <MapPin size={18} />
                                            </div>
                                            <select
                                                required
                                                value={area}
                                                onChange={(e) => setArea(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all text-sm font-medium appearance-none"
                                            >
                                                <option value="">Select Area</option>
                                                {city && LOCATION_DATA["Uttar Pradesh"][city].map(a => (
                                                    <option key={a} value={a}>{a}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">Detailed Address</label>
                                    <div className="relative">
                                        <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400">
                                            <Home size={18} />
                                        </div>
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            rows={2}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all text-sm font-medium resize-none"
                                            placeholder="House No, Street Name, Landmark..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/10 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-slate-400 border-t-white dark:border-slate-400 dark:border-t-slate-900 rounded-full animate-spin"></div>
                            ) : (
                                forceOpen ? "Save Changes" : "Complete Profile & Continue"
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ParentOnboardingPopup;
