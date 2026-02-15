"use client";
import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config';

const ContactPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: 'Parent',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Show popup after 5 seconds if not already submitted or closed in this session
        const hasSeenPopup = sessionStorage.getItem('hasSeenContactPopup');
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000); // 5 seconds delay
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenContactPopup', 'true');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/enquiry/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    role: formData.role,
                    location: formData.location,
                    subject: 'New Lead via Popup',
                    message: `Role: ${formData.role}, Location: ${formData.location}`
                })
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    handleClose();
                }, 3000);
            } else {
                console.error('Failed to submit enquiry');
            }
        } catch (error) {
            console.error('Error submitting enquiry:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative border border-indigo-100 dark:border-indigo-900"
                    >
                        {/* Decorative Header Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                        
                        <button 
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="relative pt-8 px-6 pb-6">
                            {!submitted ? (
                                <>
                                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg mb-6 text-center -mt-12 border border-slate-100 dark:border-slate-700">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Help Us Contact You</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Please fill in your details below.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">I am a</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                >
                                                    <option value="Parent">Parent</option>
                                                    <option value="Student">Student</option>
                                                    <option value="Tutor">Tutor</option>
                                                    <option value="School/Institute">School/Institute</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="Enter your mobile number"
                                                    pattern="[0-9]{10}"
                                                    title="Please enter a valid 10-digit mobile number"
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="location"
                                                    required
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="Enter your city/area"
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]"
                                        >
                                            {loading ? 'Submitting...' : 'Get a Call Back'}
                                        </Button>

                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium transition-colors"
                                        >
                                            No thanks, I'm just browsing
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        We have received your details. Our team will contact you shortly.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ContactPopup;
