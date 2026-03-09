"use client";
import React, { useState } from 'react';
import { MapPin, Phone, User, Briefcase, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import API_BASE_URL from '../../config';

const InlineContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: 'Parent',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
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
                    subject: 'New Lead via Landing Page',
                    message: `Role: ${formData.role}, Location: ${formData.location}`
                })
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError('Failed to submit enquiry. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/50 dark:bg-indigo-900/10 skew-x-12 transform origin-top-right"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-16 items-center">
                
                {/* Left Text Side */}
                <div className="w-full lg:w-5/12 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                            Have Questions? <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                                Let's Talk.
                            </span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0">
                            Whether you're looking for the perfect tutor for your child or seeking teaching opportunities, our team is here to help you get started.
                        </p>
                        
                        <div className="flex flex-col gap-6 text-left max-w-xs mx-auto lg:mx-0">
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex flex-shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Direct Support</p>
                                    <p className="font-bold text-slate-900 dark:text-white">+91 6387488141</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Form Side */}
                <div className="w-full lg:w-7/12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-slate-800 relative z-20"
                    >
                        {!submitted ? (
                            <>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request a Call Back</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Fill out the form below and one of our experts will contact you shortly.</p>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/50">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">I am a</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-900 dark:text-white cursor-pointer"
                                                >
                                                    <option value="Parent">Parent</option>
                                                    <option value="Student">Student</option>
                                                    <option value="TEACHER">Tutor</option>
                                                    <option value="School/Institute">School/Institute</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">My Name is</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Full Name"
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Mobile Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="10-digit number"
                                                    pattern="[0-9]{10}"
                                                    title="Please enter a valid 10-digit mobile number"
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Location/City</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                                <select
                                                    name="location"
                                                    required
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium cursor-pointer ${formData.location === '' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                                                >
                                                    <option value="" disabled>Select your Area</option>
                                                    {[
                                                        "Aliganj", "Gomti Nagar", "Indira Nagar", "Hazratganj", 
                                                        "Janki Puram", "Mahanagar", "Alambagh", "Vikas Nagar", 
                                                        "South City", "Aashiana", "Other"
                                                    ].sort().map(loc => (
                                                        <option key={loc} value={loc} className="text-slate-900 dark:text-white">{loc}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 h-auto rounded-xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] mt-4 text-lg"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Request Now'}
                                    </Button>
                                    <p className="text-center text-xs text-slate-400 mt-4">
                                        By submitting this form, you agree to our privacy policy and terms of service.
                                    </p>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-16 px-4">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-8"
                                >
                                    <CheckCircle2 className="h-12 w-12" />
                                </motion.div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Request Received!</h3>
                                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    Thank you for reaching out. One of our educational consultants will contact you shortly at <span className="font-semibold text-slate-700 dark:text-slate-300">{formData.phone}</span>.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default InlineContactForm;
