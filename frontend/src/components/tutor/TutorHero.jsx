"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const TutorHero = () => {
    const router = useRouter();

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white shadow-premium">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-bold mb-8 backdrop-blur-sm uppercase tracking-widest">
                        <Sparkles size={14} className="text-amber-300" />
                        Tutor's Module
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">
                        Empower Students. <br />
                        Boost Your Earnings. <br />
                        <span className="text-sky-300">A Brand of THTPRO.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-xl leading-relaxed opacity-90">
                        Access a robust platform designed specifically for home tutors, 
                        leveraging the power of thtpro to manage your tuitions, track earnings, 
                        and expand your reach.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <Button 
                            variant="default" 
                            size="lg" 
                            className="bg-sky-400 text-indigo-950 hover:bg-sky-300 font-bold px-10 py-7 text-xl rounded-2xl shadow-2xl hover:shadow-sky-400/30 transition-all border-none"
                            onClick={() => router.push('/signup?role=teacher')}
                        >
                            Launch Your Tutor Dashboard
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                    </div>
                </div>
                
                <div className="flex-1 relative max-w-md lg:max-w-none w-full animate-float">
                    <div className="relative z-20 overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 shadow-2xl">
                        <Image 
                            src="/tutor-hero-illustration.png" 
                            alt="Tutor Hero" 
                            width={800} 
                            height={600} 
                            className="rounded-2xl w-full h-auto"
                            priority
                        />
                    </div>
                    {/* Decorative Ring */}
                    <div className="absolute -inset-6 bg-gradient-to-r from-sky-400/20 to-indigo-400/20 rounded-[3rem] blur-2xl -z-10" />
                </div>
            </div>
        </div>
    );
};

export default TutorHero;
