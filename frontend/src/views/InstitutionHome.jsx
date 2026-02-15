
"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building, GraduationCap, CheckCircle, Users, ArrowRight, ShieldCheck, Clock, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const InstitutionHome = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-8 border border-indigo-100 dark:border-indigo-800"
            >
                <Building size={16} />
                <span>For Schools & Coaching Centers</span>
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight leading-tight"
            >
                Hire Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Tutors</span> <br/>
                For Your Institution
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
                Connect with thousands of verified, qualified tutors for your school, college, or coaching institute requirements. Simplifying recruitment for educational institutions.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
                <Link href="/signup?role=institution" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl transition-all flex items-center gap-2 group">
                    Register Institution
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                    Login
                </Link>
            </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Partner With Us?</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We understand the challenges of finding quality faculty. Our platform is designed to make hiring efficient and reliable.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<ShieldCheck className="w-8 h-8 text-green-600" />}
                    title="Verified Profiles"
                    desc="Every tutor profile is manually verified, including educational verification and ID checks."
                    delay={0.1}
                />
                <FeatureCard 
                    icon={<Search className="w-8 h-8 text-indigo-600" />}
                    title="Smart Search"
                    desc="Find tutors by subject, grade, board, and location with our advanced filtering system."
                    delay={0.2}
                />
                 <FeatureCard 
                    icon={<Clock className="w-8 h-8 text-purple-600" />}
                    title="Quick Hiring"
                    desc="Post your job requirements and get applications from interested tutors instantly."
                    delay={0.3}
                />
            </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                     <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Streamlined Recruitment Process</h2>
                     <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Stop sifting through irrelevant resumes. Our platform brings qualified candidates directly to you.</p>
                     
                     <div className="space-y-8">
                        <Step number="01" title="Create Institutional Profile" desc="Sign up as an institution and complete your profile." />
                        <Step number="02" title="Post Vacancy" desc="Detail your requirements: Subject, Class, Experience, Salary." />
                        <Step number="03" title="Shortlist & Hire" desc="Review applications, interview candidates, and hire the best." />
                     </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl transform rotate-3"></div>
                    <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-8">
                        {/* Mock UI for Job Post */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                             <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                                 <Building className="text-indigo-600" />
                             </div>
                             <div>
                                 <div className="font-bold text-slate-900 dark:text-white">Physics Faculty Needed</div>
                                 <div className="text-sm text-slate-500">Sunrise Public School • Full Time</div>
                             </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Applicants</span>
                                <span className="font-medium text-slate-900 dark:text-white">12 Qualified</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium">View Applications</button>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
);

const Step = ({ number, title, desc }) => (
    <div className="flex gap-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
            {number}
        </div>
        <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
            <p className="text-slate-600 dark:text-slate-400">{desc}</p>
        </div>
    </div>
);

export default InstitutionHome;
