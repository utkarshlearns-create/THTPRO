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
            const response = await fetch(`${API_BASE_URL}/api/users/contact/`, {
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden relative border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row"
                    >
                        
                        {/* Left Side - Visual */}
                        <div className="hidden md:flex md:w-5/12 bg-indigo-600 relative overflow-hidden flex-col items-center justify-center p-8 text-center text-white">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            
                            <div className="relative z-10">
                                <div className="bg-white p-4 rounded-2xl shadow-lg mb-8 inline-block">
                                   <img src="/logo.png" alt="THT Logo" className="h-16 w-auto object-contain" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Start Your Learning Journey</h3>
                                <p className="text-indigo-100 leading-relaxed text-sm">
                                    Join thousands of students and tutors finding their perfect match every day.
                                </p>
                            </div>
                            
                            {/* Decorative circles */}
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-50"></div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="w-full md:w-7/12 relative p-8">
                             <button 
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2 transition-colors z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="h-full flex flex-col justify-center">
                                {!submitted ? (
                                    <>
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Get in Touch</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Fill in your details and we'll call you back shortly.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">I am a</label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <select
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                                    >
                                                        <option value="Parent">Parent</option>
                                                        <option value="Student">Student</option>
                                                        <option value="Tutor">Tutor</option>
                                                        <option value="School/Institute">School/Institute</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            required
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            placeholder="Your Name"
                                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            required
                                                            value={formData.location}
                                                            onChange={handleChange}
                                                            placeholder="City/Area"
                                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        required
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="Mobile Number"
                                                        pattern="[0-9]{10}"
                                                        title="Please enter a valid 10-digit mobile number"
                                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <Button 
                                                type="submit" 
                                                disabled={loading}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] mt-2"
                                            >
                                                {loading ? 'Submitting...' : 'Request Call Back'}
                                            </Button>

                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 mb-6 animate-bounce">
                                            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            We'll be in touch shortly.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ContactPopup;
