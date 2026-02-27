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
  Bell
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
      <section className="relative pt-24 pb-32 overflow-hidden bg-slate-900">
        {/* Background Image with Overlay */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: `url('/parent-home-hero.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 z-0" />
        
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
                        <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                           <ActivityFeed activities={stats?.recent_activities} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Overlapping Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-20 text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                  title="Active Jobs" 
                  value={stats?.stats?.active_jobs || 0} 
                  icon={Briefcase} 
                  color="indigo"
                  description="Currently hiring for"
                  className="bg-white dark:bg-slate-900 shadow-2xl rounded-[1.5rem] border-0 text-slate-900 dark:text-white"
              />
              <StatCard 
                  title="Applications" 
                  value={stats?.stats?.applications_received || 0} 
                  icon={Users} 
                  color="emerald"
                  description="Interested tutors"
                  className="bg-white dark:bg-slate-900 shadow-2xl rounded-[1.5rem] border-0 text-slate-900 dark:text-white"
              />
              {/* Profile Strength Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] shadow-2xl flex flex-col justify-between border-0 text-slate-900 dark:text-white">
                  <div className="flex items-center justify-between mb-2">
                       <h3 className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Profile Strength</h3>
                       <span className="text-indigo-600 dark:text-indigo-400 font-bold">85%</span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: '85%' }} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle size={14} className="text-emerald-500" /> Complete KYC to reach 100%
                  </div>
              </div>
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

        {/* Wizard Section (Collapsible or Inline) */}
        <section id="job-wizard-section" className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 rounded-3xl p-8 border border-indigo-100 dark:border-slate-800">
             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Post a Requirement</h2>
                <p className="text-slate-500 dark:text-slate-400">Quickly find the best tutor for your child.</p>
             </div>
             <div className="max-w-3xl mx-auto bg-white dark:bg-slate-950 rounded-xl shadow-sm p-1">
                <JobWizard />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {stats.recommended_tutors.map(tutor => (
                        <div key={tutor.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group">
                            <div className="flex flex-col items-center mb-4">
                                <img 
                                    src={tutor.image ? `${API_BASE_URL}${tutor.image}` : `https://ui-avatars.com/api/?name=${tutor.name}&background=random`} 
                                    alt={tutor.name} 
                                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-sm mb-3" 
                                />
                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-center">{tutor.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 line-clamp-1">
                                    {tutor.subjects && tutor.subjects.join(', ')}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs px-2 mb-3">
                                <div className="flex items-center gap-1 text-amber-500 font-bold">
                                    <Star size={14} fill="currentColor" /> {tutor.rating}
                                </div>
                                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                                    <MapPin size={12} /> <span className="truncate">{tutor.locality}</span>
                                </div>
                            </div>
                            
                            <Link 
                                href={`/tutors/${tutor.id}`}
                                className="block w-full text-center py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold text-xs group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white transition-colors"
                            >
                                View Profile
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        )}

      </div>
    </div>
  );
};

export default ParentHome;



