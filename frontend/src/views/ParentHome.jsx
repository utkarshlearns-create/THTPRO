"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MapPin, 
  Star,
  ChevronRight,
  Briefcase,
  Users,
  Wallet,
  Plus,
  LayoutGrid,
  Search,
  CheckCircle,
  Bell,
  Clock
} from 'lucide-react';
import JobWizard from '../components/JobWizard';
import API_BASE_URL from '../config';
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import JobCard from '../components/jobs/JobCard';

const ParentHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ first_name: 'Parent' });

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
        const token = localStorage.getItem('access');
        if (!token) return;
        const response = await fetch(`${API_BASE_URL}/api/users/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setUser(data);
        }
    } catch (err) {
        console.error("Error fetching user profile:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
        const token = localStorage.getItem('access');
        if (!token) {
            setLoading(false);
            return; // Or redirect
        }

        const response = await fetch(`${API_BASE_URL}/api/jobs/stats/parent/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            setStats(data);
        } else {
            console.error("Failed to fetch dashboard stats", response.status, response.statusText);
            if (response.status === 401) {
                setError("Session expired. Please login again.");
                // Optional: Redirect to login
                // window.location.href = '/login';
            } else {
                setError(`Could not load dashboard data (${response.status}: ${response.statusText})`);
            }
        }
    } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Network error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-44 overflow-hidden bg-slate-900 min-h-[700px] flex items-center">
        {/* Background Image with Overlay */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-[center_right] opacity-40 mix-blend-screen"
            style={{ backgroundImage: `url('/parent-home-hero.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 z-0" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl z-0 animate-pulse" />
        <div className="absolute bottom-10 left-[5%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left: Greeting & Actions */}
                <div className="lg:col-span-7">
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Welcome back, <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">{user?.first_name || 'Parent'}</span>!
                        </h1>
                        <p className="text-xl text-indigo-100/70 max-w-xl leading-relaxed">
                            Find your perfect tutor for personalized learning and track your student's progress in real-time.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-indigo-300/80 font-medium">
                            <MapPin size={16} /> Pan-India Tutors
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={() => document.getElementById('job-wizard-section').scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/40 transition-all hover:-translate-y-1 active:scale-95 group"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Post New Job
                        </button>
                        <Link 
                            href="/tutors" 
                            className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                        >
                            <LayoutGrid size={20} /> Browse Tutors
                        </Link>
                    </div>
                </div>

                {/* Right: Floating Activity Card */}
                <div className="lg:col-span-5 hidden lg:block">
                    <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl relative">
                        <div className="absolute -top-4 -right-4 bg-amber-400 p-3 rounded-2xl shadow-lg rotate-12">
                            <Bell size={24} className="text-amber-950" />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl text-white">Recent Activity</h3>
                            <Link href="/dashboard/parent?tab=activities" className="text-indigo-300 text-sm font-semibold hover:text-white transition-colors">
                                View History
                            </Link>
                        </div>
                        <div className="max-h-[420px] overflow-y-auto overflow-x-hidden p-4 pb-8 custom-scrollbar">
                           <ActivityFeed activities={stats?.recent_activities} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Overlapping Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-20 text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard 
                  title="Active Jobs" 
                  value={stats?.stats?.active_jobs || 0} 
                  icon={Briefcase} 
                  color="indigo"
                  description="Currently hiring for"
                  className="bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] border-2 border-indigo-600/60 text-slate-900 dark:text-white"
              />
              <StatCard 
                  title="Applications" 
                  value={stats?.stats?.applications_received || 0} 
                  icon={Users} 
                  color="emerald"
                  description="Interested tutors"
                  className="bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] border-2 border-emerald-600/60 text-slate-900 dark:text-white"
              />
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Recent Jobs Section */}
        {stats?.recent_jobs && stats.recent_jobs.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Job Postings</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your active requirements</p>
                    </div>
                    <Link href="/dashboard/parent?tab=jobs_posted" className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1 text-sm shadow-sm">
                        View All <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.recent_jobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            </section>
        )}

        {/* Job Wizard Section */}
        <section id="job-wizard-section" className="relative py-24 scroll-mt-20 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Left: Creative Benefits Panel */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-bold tracking-wide uppercase">
                            <Star size={16} fill="currentColor" /> Quick & Easy Process
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                            Find the <span className="text-indigo-600 dark:text-indigo-400">Perfect Tutor</span> for Your Child
                        </h2>
                        
                        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                            Say goodbye to endless searching. Tell us your needs, and we'll connect you with top-rated, background-verified educators in minutes.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-800 text-indigo-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Verified Experts</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">100% background checked</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-800 text-purple-600">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Fast Response</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Matches within 2 hours</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-800 text-emerald-600">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Best Pricing</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Personalized auto-pricing</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-800 text-amber-600">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Rated 4.9/5</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">By 50,000+ happy parents</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Job Wizard Form */}
                    <div className="lg:col-span-12 xl:col-span-7 animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="bg-white dark:bg-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none rounded-[2.5rem] p-4 md:p-8 border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden">
                            {/* Glassmorphism Accents */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px]" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />
                            
                            <div className="relative z-20">
                                <JobWizard />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Recommended Tutors Section */}
        {stats?.recommended_tutors && stats.recommended_tutors.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Recommended Tutors</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Top-rated educators matching your needs</p>
                    </div>
                    <Link href="/tutors" className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1 text-sm shadow-sm">
                        View All <ChevronRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                    {stats.recommended_tutors.map(tutor => {
                        // Dynamic theme color based on subject or random
                        const themes = [
                            { border: 'border-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-500/30' },
                            { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500/30' },
                            { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500/30' },
                            { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500/30' },
                            { border: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-500/30' },
                        ];
                        const theme = themes[tutor.id % themes.length];

                        return (
                            <div key={tutor.id} className={`relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] group ${theme.border} border-t-4`}>
                                {/* Floating Experience Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="px-2.5 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">
                                        5+ Yrs Exp
                                    </div>
                                </div>

                                <div className="flex flex-col items-center mb-6 relative">
                                    {/* Avatar with Gradient Ring */}
                                    <div className={`relative p-1 rounded-full ring-2 ${theme.ring} mb-4 transition-transform duration-500 group-hover:scale-110`}>
                                        <img 
                                            src={tutor.image ? `${API_BASE_URL}${tutor.image}` : `https://ui-avatars.com/api/?name=${tutor.name}&background=random`} 
                                            alt={tutor.name} 
                                            className="w-20 h-20 rounded-full object-cover shadow-inner" 
                                        />
                                        {/* Verified Badge */}
                                        <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900 animate-pulse">
                                            <ShieldCheck size={12} fill="currentColor" />
                                        </div>
                                    </div>

                                    <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight text-center text-lg">{tutor.name}</h3>
                                    
                                    {/* Rating & Location Row */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                            <Star size={14} fill="currentColor" /> {tutor.rating}
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                            <MapPin size={12} className="text-indigo-500" /> {tutor.locality}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Subject Pills */}
                                <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                                    {tutor.subjects && tutor.subjects.slice(0, 3).map((sub, i) => (
                                        <span key={i} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${theme.bg} ${theme.text} dark:bg-opacity-20`}>
                                            {sub}
                                        </span>
                                    ))}
                                    {tutor.subjects && tutor.subjects.length > 3 && (
                                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                                            +{tutor.subjects.length - 3}
                                        </span>
                                    )}
                                </div>
                                
                                <Link 
                                    href={`/tutors/${tutor.id}`}
                                    className={`block w-full text-center py-3 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-indigo-500/25`}
                                >
                                    View Profile
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>
        )}

      </div>
    </div>
  );
};

export default ParentHome;



