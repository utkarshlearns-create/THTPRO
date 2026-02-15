
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { LayoutDashboard, Briefcase, PlusCircle, Search, Settings, User, LogOut } from 'lucide-react';
import PostJob from '../../components/institution/PostJob';
import BrowseTutors from '../../components/institution/BrowseTutors';
import API_BASE_URL from '../../config';

const InstitutionDashboard = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) {
                router.push('/login');
                return;
            }
            const res = await fetch(`${API_BASE_URL}/api/users/institution/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                 // If profile doesn't exist or error, maybe handle it
                 console.error("Failed to fetch profile");
            }
        } catch (error) {
            console.error("Error fetching profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const SidebarItem = ({ id, icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === id 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-24">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                                    {profile?.institution_name?.charAt(0) || 'I'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{profile?.institution_name || 'Institution'}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.contact_person}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <SidebarItem id="overview" icon={<LayoutDashboard size={20} />} label="Overview" />
                                <SidebarItem id="my-jobs" icon={<Briefcase size={20} />} label="My Jobs" />
                                <SidebarItem id="post-job" icon={<PlusCircle size={20} />} label="Post New Job" />
                                <SidebarItem id="browse-tutors" icon={<Search size={20} />} label="Browse Tutors" />
                                <SidebarItem id="settings" icon={<Settings size={20} />} label="Settings" />
                            </nav>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        {activeTab === 'overview' && <OverviewTab profile={profile} setActiveTab={setActiveTab} />}
                        {activeTab === 'my-jobs' && <MyJobsTab />}
                        {activeTab === 'post-job' && <PostJob onSuccess={() => setActiveTab('my-jobs')} />}
                        {activeTab === 'browse-tutors' && <BrowseTutors />}
                        {activeTab === 'settings' && <SettingsTab profile={profile} />}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

const OverviewTab = ({ profile, setActiveTab }) => (
    <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Briefcase size={24} />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">+2 this week</span>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Jobs</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
                <button onClick={() => setActiveTab('my-jobs')} className="text-indigo-600 text-sm font-medium mt-4 hover:underline">View all jobs</button>
            </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                        <User size={24} />
                    </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Applicants</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                        <Settings size={24} />
                    </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Profile Status</h3>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{profile?.is_verified ? 'Verified' : 'Pending Verification'}</p>
                {!profile?.is_verified && <p className="text-xs text-orange-500 mt-1">Complete profile to get verified</p>}
            </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Welcome, {profile?.institution_name || 'Partner'}!</h2>
                <p className="text-indigo-100 mb-6 max-w-xl">Start hiring the best tutors for your institution. Post a job requirement detailing your needs and let top educators apply.</p>
                <button onClick={() => setActiveTab('post-job')} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                    Post a Job Requirement
                </button>
             </div>
        </div>
    </div>
);

const MyJobsTab = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchJobs();
    }, []);
    
    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('access');
            const res = await fetch(`${API_BASE_URL}/api/jobs/institution/jobs/?mode=my_jobs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Job Postings</h2>
            </div>
            {jobs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No jobs posted yet</h3>
                    <p className="text-slate-500 mb-6">Create your first job post to start receiving applications.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{job.title}</h3>
                                <p className="text-sm text-slate-500">{job.subject} • {job.class_level}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{job.status}</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">{job.job_type}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-indigo-600">{job.salary_range || 'Salary not specified'}</p>
                                <p className="text-xs text-slate-400 mt-1">Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const SettingsTab = ({ profile }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>
        <p className="text-slate-500">Profile editing coming soon.</p>
        <div className="mt-4">
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Institution Name</label>
             <input type="text" disabled value={profile?.institution_name || ''} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 p-2" />
        </div>
    </div>
);

export default InstitutionDashboard;
