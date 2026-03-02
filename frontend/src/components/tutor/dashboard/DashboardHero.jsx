"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '../../ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const DashboardHero = ({ user, completionPercentage }) => {
    const router = useRouter();
    const firstName = user?.full_name?.split(' ')[0] || 'Tutor';

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white shadow-premium">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-semibold mb-6 backdrop-blur-sm">
                        <Sparkles size={14} className="text-amber-300" />
                        A Brand of The Home Tuitions
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                        Empower Students. <br />
                        <span className="text-sky-300">Boost Your Earnings.</span>
                    </h1>
                    
                    <p className="text-lg text-indigo-100 mb-8 max-w-xl leading-relaxed">
                        Welcome back, <span className="text-white font-bold">{firstName}</span>! 
                        Access a robust platform designed specifically for home tutors, 
                        leveraging the power of THTPRO to manage your tuitions and expand your reach.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <Button 
                            variant="default" 
                            size="lg" 
                            className="bg-sky-400 text-indigo-950 hover:bg-sky-300 font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-sky-400/20 transition-all border-none"
                            onClick={() => router.push(completionPercentage < 100 ? '/dashboard/tutor?tab=profile' : '/dashboard/tutor?tab=tuitions')}
                        >
                            {completionPercentage < 100 ? 'Complete Your Profile' : 'Launch Tutor Dashboard'}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        
                        <div className="text-indigo-200 text-sm font-medium">
                            {completionPercentage}% Profile Complete
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 relative max-w-md lg:max-w-none w-full animate-float">
                    <div className="relative z-20 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-2 shadow-2xl">
                        <Image 
                            src="/tutor-hero-illustration.png" 
                            alt="Tutor Hero" 
                            width={600} 
                            height={400} 
                            className="rounded-xl w-full h-auto"
                            priority
                        />
                    </div>
                    {/* Decorative Ring */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/20 to-indigo-400/20 rounded-3xl blur-xl -z-10" />
                </div>
            </div>
        </div>
    );
};

export default DashboardHero;
