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
  Plus
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
  const [user, setUser] = useState({ name: 'Parent' });

  useEffect(() => {
    fetchDashboardData();
    // Get user name/details from local storage or decode token if needed
    // For now, we'll rely on the API response or generic greeting
  }, []);

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
      
      {/* Hero / Wizard Section */}
      <section className="relative pt-24 pb-12 bg-white dark:bg-slate-900 rounded-b-[2.5rem] shadow-sm mb-10 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Greeting & Stats */}
                <div className="lg:col-span-2">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                            Welcome Back!
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400">
                            Manage your tuition requests and track progress.
                        </p>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <StatCard 
                            title="Active Jobs" 
                            value={stats?.stats?.active_jobs || 0} 
                            icon={Briefcase} 
                            color="indigo"
                        />
                        <StatCard 
                            title="Applications" 
                            value={stats?.stats?.applications_received || 0} 
                            icon={Users} 
                            color="emerald"
                        />
                        <StatCard 
                            title="Wallet Balance" 
                            value={`₹${stats?.stats?.wallet_balance || 0}`} 
                            icon={Wallet} 
                            color="amber"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => document.getElementById('job-wizard-section').scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md shadow-indigo-200 dark:shadow-none transition-all"
                        >
                            <Plus size={18} /> Post New Job
                        </button>
                        <Link href="/tutors" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-all">
                            Browse Tutors
                        </Link>
                    </div>
                </div>

                {/* Right: Activity Feed */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    </div>
                    <ActivityFeed activities={stats?.recent_activities} />
                </div>
            </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Recent Jobs Section */}
        {stats?.recent_jobs && stats.recent_jobs.length > 0 && (
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Job Postings</h2>
                    <Link href="/parent/approved" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                        View All <ChevronRight size={18} />
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
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recommended Tutors</h2>
                    <Link href="/tutors" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                        View All <ChevronRight size={18} />
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



