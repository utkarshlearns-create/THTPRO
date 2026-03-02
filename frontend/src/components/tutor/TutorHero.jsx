"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Sparkles } from 'lucide-react';

const TutorHero = () => {
    const router = useRouter();

    return (
        <div className="relative w-full overflow-hidden bg-[#f0f9ff] dark:bg-slate-950/20 py-20 transition-colors duration-500">
            {/* Very subtle background decorative circles/elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -mr-32 -mt-32 dark:bg-blue-900/10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl -ml-20 -mb-20 dark:bg-indigo-900/10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    {/* Left Column: Text Content */}
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <div className="inline-block">
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-1 block">
                                Tutor's Module
                            </span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-[850] text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                            Empower Students. <br />
                            Boost Your Earnings. <br />
                            <span className="text-slate-900 dark:text-sky-300">A Brand of <span className="text-blue-600 dark:text-blue-400">The Home Tuitions.</span></span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-medium opacity-90">
                            Access a robust platform designed specifically for home tutors, 
                            leveraging the power of thtpro to manage your tuitions, track earnings, 
                            and expand your reach.
                        </p>
                        
                        <div className="pt-6">
                            <Button 
                                variant="default" 
                                size="lg" 
                                className="bg-[#4ab9e2] hover:bg-[#3ca8d1] text-white font-bold px-12 py-7 text-xl rounded-2xl shadow-xl hover:shadow-[#4ab9e2]/20 transition-all border-none transform hover:-translate-y-1"
                                onClick={() => router.push('/signup?role=teacher')}
                            >
                                Launch Your Tutor Dashboard
                            </Button>
                        </div>
                    </div>
                    
                    {/* Right Column: Illustration */}
                    <div className="flex-1 relative w-full max-w-2xl animate-float">
                        <div className="relative pointer-events-none">
                            <Image 
                                src="/tutor-hero-v2.png" 
                                alt="Tutor Hero Illustration" 
                                width={1000} 
                                height={800} 
                                className="w-full h-auto drop-shadow-2xl translate-x-4"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorHero;
