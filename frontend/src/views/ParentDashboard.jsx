"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  LogOut, 
  Menu,
  Briefcase,
  History,
  Wallet,
  Bell,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Unlock,
  Home,
  TrendingUp
} from 'lucide-react';
import API_BASE_URL from '../config';
import { clearAuthState } from '../utils/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import ThemeToggle from '../components/ui/ThemeToggle';
import ParentOnboardingPopup from '../components/ParentOnboardingPopup';

// Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

const ParentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarHover, setSidebarHover] = useState(false);
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(initialTab);
    const router = useRouter();
    const [stats, setStats] = useState({ 
        jobs_posted: 0, 
        jobs_this_week: 0,
        applications_received: 0, 
        hired_count: 0,
        assigned_tutor: null,
        profile_completion: 0,
        member_since: '',
        activities: []
    });
    const [latestJob, setLatestJob] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
        fetchDashboardData();
    }, [searchParams]);

    const fetchDashboardData = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('access');
            if (!token) {
                setError("No access token found. Please login again.");
                setLoading(false);
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, jobsRes, walletRes, profileRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/jobs/stats/parent/`, { headers }),
                fetch(`${API_BASE_URL}/api/jobs/`, { headers }),
                fetch(`${API_BASE_URL}/api/wallet/me/`, { headers }),
                fetch(`${API_BASE_URL}/api/users/me/`, { headers })
            ]);

            if (statsRes.ok) {
                setStats(await statsRes.json());
            } else {
                if (statsRes.status === 401) {
                    setError("Session expired. Redirecting...");
                    handleLogout();
                    return;
                }
                console.error("Dashboard Stats Error:", statsRes.status, statsRes.statusText);
            }

            if (jobsRes.ok) {
                const jobsData = await jobsRes.json();
                if (jobsData.length > 0) setLatestJob(jobsData[0]);
            } else if (jobsRes.status === 401) {
                 // Already handled by statsRes 401 check ideally, but safe to ignore
            } else {
                console.error("Dashboard Jobs Error:", jobsRes.status, jobsRes.statusText);
            }

            if (walletRes.ok) {
                setWallet(await walletRes.json());
            } else if (walletRes.status === 401) {
                 if (!error) { // Verify if not already redirecting
                     setError("Session expired. Redirecting...");
                     handleLogout();
                 }
            } else {
                 console.error("Dashboard Wallet Error:", walletRes.status, walletRes.statusText);
            }

            if (profileRes.ok) {
                setUserProfile(await profileRes.json());
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError(`Network Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        clearAuthState();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100">
            <ParentOnboardingPopup userProfile={userProfile} onComplete={(updatedProfile) => setUserProfile(updatedProfile)} />
            
            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — hidden on mobile, overlay drawer when toggled */}
            <aside 
                onMouseEnter={() => setSidebarHover(true)}
                onMouseLeave={() => setSidebarHover(false)}
                className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col fixed h-full z-50 shadow-sm
                ${(sidebarOpen || sidebarHover) ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}
            `}>
                <div className="h-16 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                     {(sidebarOpen || sidebarHover) ? (
                        <div className="font-bold text-xl tracking-tight flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <span className="text-slate-900 dark:text-white">THE HOME</span> TUITIONS
                        </div>
                     ) : (
                        <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">THT</span>
                     )}
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} isOpen={sidebarOpen} isHovered={sidebarHover} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={<User size={20} />} label="My Profile" active={activeTab === 'profile'} isOpen={sidebarOpen} isHovered={sidebarHover} onClick={() => setActiveTab('profile')} />
                    <SidebarItem icon={<Briefcase size={20} />} label="Job Postings" active={activeTab === 'jobs_posted'} isOpen={sidebarOpen} isHovered={sidebarHover} onClick={() => setActiveTab('jobs_posted')} />
                    <SidebarItem icon={<User size={20} />} label="Your Tutor" active={activeTab === 'tutor_assigned'} isOpen={sidebarOpen} isHovered={sidebarHover} onClick={() => setActiveTab('tutor_assigned')} />
                    <SidebarItem icon={<History size={20} />} label="History" active={activeTab === 'history'} isOpen={sidebarOpen} isHovered={sidebarHover} onClick={() => setActiveTab('history')} />
                    <SidebarItem icon={<Unlock size={20} />} label="Unlocked Contacts" active={activeTab === 'unlocked_contacts'} isOpen={sidebarOpen} isHovered={sidebarHover} onClick={() => setActiveTab('unlocked_contacts')} />
                    <SidebarItem icon={<Wallet size={20} />} label="Wallet & Credits" active={activeTab === 'wallet'} isOpen={sidebarOpen} isHovered={sidebarHover} onClick={() => setActiveTab('wallet')} />
                    <SidebarItem icon={<Bell size={20} />} label="Notifications" active={activeTab === 'notifications'} isOpen={sidebarOpen} isHovered={sidebarHover} onClick={() => setActiveTab('notifications')} />
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" onClick={handleLogout} className={`w-full transition-all duration-300 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 ${!(sidebarOpen || sidebarHover) ? 'px-2 justify-center' : 'justify-start'}`}>
                        <LogOut size={20} className={(sidebarOpen || sidebarHover) ? "mr-2" : ""} />
                        <span className={`${!(sidebarOpen || sidebarHover) ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content — no left margin on mobile */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Header */}
                <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button 
                            onClick={() => router.push('/parent-home')}
                            className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/30 rounded-xl transition-all shadow-sm flex items-center gap-2"
                            title="Go to Parent Home"
                        >
                            <Home size={20} />
                            <span className="hidden sm:inline-block text-sm font-medium">Home</span>
                        </button>
                        <ThemeToggle />
                         <div className="text-right hidden md:block pl-2 border-l border-slate-200 dark:border-slate-800">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">Parent Account</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Managed Profile</p>
                        </div>
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-700">
                            PA
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Welcome back! Here's an overview of your tuition activities.</p>
                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                                        <strong>Error:</strong> {error}
                                    </div>
                                )}
                            </div>

                            {/* Insights Section with Stagger Animation */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {loading ? (
                                    <>
                                        <Skeleton className="h-36 w-full" />
                                        <Skeleton className="h-36 w-full" />
                                        <Skeleton className="h-36 w-full" />
                                    </>
                                ) : (
                                    <>
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                            <InsightCard 
                                                title="Wallet Balance" 
                                                value={`₹ ${wallet?.balance || '0'}`} 
                                                icon={<Wallet className="text-emerald-500" />}
                                                description="Available credits for unlocking"
                                                trend={wallet?.balance > 100 ? "Healthy balance" : "Consider recharging"}
                                                trendColor={wallet?.balance > 100 ? "text-emerald-600" : "text-amber-600"}
                                            />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                            <InsightCard 
                                                title="Active Jobs" 
                                                value={stats.jobs_posted} 
                                                icon={<Briefcase className="text-indigo-500" />}
                                                description="Open tuition requirements"
                                                trend={stats.jobs_this_week > 0 ? `${stats.jobs_this_week} new this week` : "Post a job to start"}
                                                trendColor="text-indigo-600"
                                            />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                            <InsightCard 
                                                title="Profile Strength" 
                                                value={`${stats.profile_completion}%`} 
                                                icon={<Zap className="text-amber-500" />}
                                                description="Complete your profile to attract better tutors"
                                                progress={stats.profile_completion}
                                            />
                                        </motion.div>
                                    </>
                                )}
                            </div>

                            {/* Quick Stats Grid with Stagger */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {loading ? (
                                    <>
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                    </>
                                ) : (
                                    <>
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                                            <StatItem label="Applications" value={stats.applications_received} icon={<User size={18} />} color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                                            <StatItem label="Tutors Hired" value={stats.hired_count} icon={<CheckCircle size={18} />} color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                                            <StatItem label="Member Since" value={stats.member_since || 'N/A'} icon={<Clock size={18} />} color="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
                                            <StatItem label="Assigned Tutor" value={stats.assigned_tutor?.name || 'None'} icon={<Star size={18} />} color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
                                        </motion.div>
                                    </>
                                )}
                            </div>

                            {/* Recent Activity & Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900 dark:text-white">Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {loading ? (
                                                <>
                                                    <Skeleton className="h-16 w-full" />
                                                    <Skeleton className="h-16 w-full" />
                                                    <Skeleton className="h-16 w-full" />
                                                </>
                                            ) : Array.isArray(stats.recent_activities) && stats.recent_activities.length > 0 ? (
                                                stats.recent_activities.map((activity, i) => (
                                                    <motion.div 
                                                        key={i} 
                                                        initial={{ opacity: 0, x: -20 }} 
                                                        animate={{ opacity: 1, x: 0 }} 
                                                        transition={{ delay: 0.1 * i }}
                                                        className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
                                                    >
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                                                            {activity.icon === 'briefcase' ? <Briefcase size={18} className="text-indigo-500"/> : 
                                                             activity.icon === 'user' ? <User size={18} className="text-blue-500"/> : 
                                                             <Wallet size={18} className="text-amber-500"/>}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{activity.title}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activity.description}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                                                {new Date(activity.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                                    <Briefcase className="mx-auto mb-3 h-8 w-8 opacity-50" />
                                                    <p>No recent activity yet.</p>
                                                    <p className="text-sm mt-1">Post a job to get started!</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>


                                <div className="space-y-6">
                                     <Card className="border-indigo-100 bg-indigo-50/50 shadow-none">
                                        <CardHeader>
                                            <CardTitle className="text-indigo-900">Quick Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setActiveTab('jobs_posted')}>
                                                <Briefcase className="mr-2 h-4 w-4" /> Post New Requirement
                                            </Button>
                                            <Button className="w-full justify-start bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setActiveTab('wallet')}>
                                                <Wallet className="mr-2 h-4 w-4 text-green-600" /> Add Credits
                                            </Button>
                                             <Button 
                                                className="w-full justify-start bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700" 
                                                onClick={() => router.push('/tutors')}
                                            >
                                                <User className="mr-2 h-4 w-4 text-blue-600" /> Browse Tutors
                                            </Button>
                                        </CardContent>
                                     </Card>
                                     
                                     <Card className="border-amber-100 bg-amber-50/50 shadow-none">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                                    <TrendingUp size={18} />
                                                </div>
                                                <h3 className="font-semibold text-amber-900">Pro Tip</h3>
                                            </div>
                                            <p className="text-sm text-amber-800/80 leading-relaxed">
                                                Completing your profile and adding a detailed bio increases the chances of getting top-rated tutors by 40%.
                                            </p>
                                        </CardContent>
                                     </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* JOB POSTINGS VIEW */}
                    {activeTab === 'jobs_posted' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                             <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Postings</h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your active tuition requirements.</p>
                                </div>
                                <Button 
                                    onClick={() => router.push('/parent-home')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                                >
                                    <Briefcase className="mr-2 h-4 w-4" /> Post New Job
                                </Button>
                             </div>
                             
                             <JobsList />
                        </div>
                    )}

                    {/* MY PROFILE VIEW */}
                    {activeTab === 'profile' && <MyProfile latestJob={latestJob} stats={stats} />}

                    {/* TUTOR ASSIGNED VIEW */}
                    {activeTab === 'tutor_assigned' && <TutorAssigned />}

                    {/* HISTORY VIEW */}
                    {activeTab === 'history' && <HistorySection />}

                    {/* UNLOCKED CONTACTS VIEW */}
                    {activeTab === 'unlocked_contacts' && <UnlockedContactsList />}

                    {/* WALLET VIEW */}
                    {activeTab === 'wallet' && <WalletSection wallet={wallet} />}

                    {/* NOTIFICATIONS VIEW */}
                    {activeTab === 'notifications' && <NotificationsSection />}

                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, isOpen, isHovered, onClick }) => {
    const showLabel = isOpen || isHovered;
    return (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
        ${active ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
        ${!showLabel && 'justify-center'}
    `}>
        <span className={`flex-shrink-0 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>{icon}</span>
        <span className={`whitespace-nowrap transition-all duration-300 origin-left ${showLabel ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 w-0 hidden'}`}>
            {label}
        </span>
    </button>
)};

const InsightCard = ({ title, value, icon, description, trend, trendColor, progress }) => (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-transparent">
                {title}
            </CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            {trend && <p className={`text-xs font-medium mt-2 ${trendColor}`}>{trend}</p>}
            {progress && <Progress value={progress} className="h-2 mt-3" indicatorClassName="bg-amber-500" />}
        </CardContent>
    </Card>
);

const StatItem = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);
const UnlockedContactsList = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await fetch(`${API_BASE_URL}/api/users/dashboard/unlocked-contacts/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setContacts(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error fetching unlocked contacts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Unlocked Contacts</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Tutors whose contact details you have unlocked using credits.</p>
            
            {contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contacts.map((contact, idx) => (
                        <Card key={contact.id || idx} className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 border-2 border-indigo-50 dark:border-indigo-900/50">
                                        {contact.profile_image ? (
                                            <img src={contact.profile_image.startsWith('http') ? contact.profile_image : `${API_BASE_URL}${contact.profile_image}`} alt={contact.name} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            <User size={28} className="text-indigo-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{contact.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                            <CheckCircle size={14} className="text-green-500" /> Unlocked on {new Date(contact.unlocked_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Phone</span>
                                        <span className="font-semibold text-slate-900 dark:text-white select-all">{contact.phone}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Email</span>
                                        <span className="font-semibold text-slate-900 dark:text-white select-all">{contact.email}</span>
                                    </div>
                                    {contact.subjects && contact.subjects.length > 0 && (
                                        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Subjects Required</span>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(contact.subjects) && contact.subjects.map((sub, i) => (
                                                    <span key={i} className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 px-2 py-1 rounded">
                                                        {sub}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Unlock size={24} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Unlocked Contacts</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Unlock tutor profiles to see their contacts here.</p>
                 </div>
            )}
        </div>
    );
};

export default ParentDashboard;

const JobApplicationsView = ({ job, onBack }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, [job.id]);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/applicants/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data.results || data);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (appId, action) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/parent/application-action/${appId}/`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });
            if (response.ok) {
                fetchApplications();
            }
        } catch (error) {
            console.error(`Error processing application ${action}:`, error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <History size={18} className="rotate-180" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Applicants for {job.class_grade} {job.subjects?.[0]}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review tutor profiles and applications</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <User size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Applicants Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400">Tutors will appear here once they apply.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {applications.map((app) => (
                        <Card key={app.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-50 dark:border-indigo-900/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {/* Profile placeholder/image (no contact info) */}
                                        <User size={28} className="text-indigo-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{app.tutor_name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                ID: #{app.tutor}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        {app.status === 'APPLIED' ? (
                                            <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 px-3 py-1 rounded-full">Pending</span>
                                        ) : app.status === 'HIRED' ? (
                                            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400 px-3 py-1 rounded-full">Hired</span>
                                        ) : (
                                            <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400 px-3 py-1 rounded-full">Rejected</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                                    <span className="font-semibold block mb-1">Cover Message:</span>
                                    {app.cover_message ? `"${app.cover_message}"` : <span className="italic text-slate-400">No message provided.</span>}
                                </div>

                                {app.status === 'APPLIED' && (
                                    <div className="flex gap-3 mt-6">
                                        <Button 
                                            onClick={() => handleAction(app.id, 'ACCEPT')}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            <CheckCircle size={16} className="mr-2" /> Accept
                                        </Button>
                                        <Button 
                                            onClick={() => handleAction(app.id, 'REJECT')}
                                            variant="outline"
                                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/50"
                                        >
                                            <XCircle size={16} className="mr-2" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const JobsList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/my-jobs/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(Array.isArray(data) ? data : data.results || []);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse"></div>
            ))}
        </div>
    );

    if (selectedJob) {
        return <JobApplicationsView job={selectedJob} onBack={() => setSelectedJob(null)} />;
    }

    if (jobs.length === 0) {
        return (
             <div className="bg-white dark:bg-slate-900 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                <div className="mx-auto w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                    <Briefcase size={32} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Jobs Posted Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Post your first tuition requirement to find the best tutors in your locality.</p>
                <Button onClick={() => window.location.href = '/parent-home'} className="mt-8 bg-indigo-600 hover:bg-indigo-700">Post Now</Button>
             </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
                <div key={job.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase
                            ${job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}
                        `}>
                            {job.status}
                        </span>
                    </div>

                    <div className="p-6">
                        <div className="mb-4">
                             <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {job.subjects && job.subjects[0] ? job.subjects[0].charAt(0) : 'S'}
                             </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                {job.student_name}'s Tuition
                            </h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {job.class_grade} • {job.board}
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                             <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                <span className="p-1 rounded bg-white dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 shadow-sm"><FileText size={14} /></span>
                                <span className="font-medium truncate">{Array.isArray(job.subjects) ? job.subjects.join(', ') : 'No subjects'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                <span className="p-1 rounded bg-white dark:bg-slate-700 text-emerald-500 dark:text-emerald-400 shadow-sm"><Clock size={14} /></span>
                                <span className="font-medium truncate">{job.preferred_time || 'Flexible Time'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                <span className="p-1 rounded bg-white dark:bg-slate-700 text-amber-500 dark:text-amber-400 shadow-sm"><Wallet size={14} /></span>
                                <span className="font-medium truncate">{job.budget_range}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-700 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-300">
                                    {job.application_count || 0}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {job.application_count === 1 ? 'Applicant' : 'Applicants'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push(`/tutors?subject=${encodeURIComponent(job.subjects?.[0] || '')}&location=${encodeURIComponent(job.locality || '')}`)}
                                className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Find Matches
                            </button>
                            <button 
                                onClick={() => setSelectedJob(job)}
                                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group/btn"
                            >
                                View Applicants <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MyProfile = ({ latestJob, stats }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Left Column: Identity */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-fit bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 text-center">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="h-24 w-24 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 ring-4 ring-indigo-50 dark:ring-indigo-900/10"
                    >
                        PA
                    </motion.div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Parent Account</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Active since {stats?.member_since || 'N/A'}</p>
                    
                    <div className="space-y-4 text-left">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Verification</span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                                <CheckCircle size={12} /> VERIFIED
                            </span>
                        </div>
                         <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Location</span>
                            <span className="text-sm text-slate-900 dark:text-white font-medium">Mumbai, India</span>
                        </div>
                    </div>

                    <Button className="w-full mt-6" variant="outline">Edit Basic Info</Button>
                </CardContent>
            </Card>

            {/* Right Column: Student Details */}
            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-slate-100">Student Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    {latestJob ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileField label="Student Name" value={latestJob.student_name} icon={<User size={16} />} />
                                <ProfileField label="Class / Grade" value={latestJob.class_grade} icon={<Briefcase size={16} />} />
                                <ProfileField label="Board" value={latestJob.board} icon={<FileText size={16} />} />
                                <ProfileField label="Gender" value={latestJob.student_gender} icon={<User size={16} />} />
                            </div>
                            
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Subjects Required</p>
                                 <div className="flex flex-wrap gap-2">
                                    {Array.isArray(latestJob.subjects) && latestJob.subjects.map((sub, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-900/30">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <User size={24} />
                             </div>
                            <p className="text-slate-500 dark:text-slate-400">No student profile active.</p>
                            <Button className="mt-4" variant="link" onClick={() => window.location.href = '/parent-home'}>Create Profile via Job Post</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const ProfileField = ({ label, value, icon }) => (
    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 mb-2 text-slate-400">
            {icon}
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
);

const TutorAssigned = () => {
    const [assignedJobs, setAssignedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingModal, setRatingModal] = useState({ open: false, app: null, job: null });
    const [attendanceModal, setAttendanceModal] = useState({ open: false, app: null, job: null });
    
    // Ratings Form State
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    
    // Attendance Form State
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');

    useEffect(() => {
        const fetchAssignedTutors = async () => {
            try {
                const token = localStorage.getItem('access');
                const jobsRes = await fetch(`${API_BASE_URL}/api/jobs/my-jobs/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    const jobs = Array.isArray(jobsData) ? jobsData : jobsData.results || [];
                    
                    const myAssignedJobs = jobs.filter(j => j.status === 'ASSIGNED');
                    
                    const tutorsData = await Promise.all(myAssignedJobs.map(async (job) => {
                        const appRes = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/applicants/`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (appRes.ok) {
                            const appsData = await appRes.json();
                            const apps = appsData.results || appsData;
                            const hiredApp = apps.find(a => a.status === 'HIRED');
                            if (hiredApp) {
                                return { job, application: hiredApp };
                            }
                        }
                        return null;
                    }));
                    
                    setAssignedJobs(tutorsData.filter(Boolean));
                }
            } catch (error) {
                console.error("Error fetching assigned tutors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignedTutors();
    }, []);

    const handleRatingSubmit = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/parent/tutor-rating/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tutor: ratingModal.app.tutor,
                    job: ratingModal.job.id,
                    rating,
                    review
                })
            });
            if (response.ok) {
                alert('Rating submitted successfully!');
                setRatingModal({ open: false, app: null, job: null });
                setRating(5);
                setReview('');
            } else {
                const err = await response.json();
                alert(`Error: ${JSON.stringify(err)}`);
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    const handleAttendanceSubmit = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/parent/tutor-attendance/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tutor: attendanceModal.app.tutor, 
                    job: attendanceModal.job.id,
                    date: attendanceDate,
                    status: attendanceStatus
                })
            });
            if (response.ok) {
                alert('Attendance marked successfully!');
                setAttendanceModal({ open: false, app: null, job: null });
                setAttendanceDate(new Date().toISOString().split('T')[0]);
                setAttendanceStatus('PRESENT');
            } else {
                const err = await response.json();
                alert(`Error: ${JSON.stringify(err)}`);
            }
        } catch (error) {
            console.error("Error marking attendance:", error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Tutor</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage tutors assigned to your active jobs.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            ) : assignedJobs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <User size={32} className="text-indigo-500 dark:text-indigo-400" />
                        <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">+</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Tutors Assigned Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Once you approve an application, your assigned tutor will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignedJobs.map(({ job, application }) => (
                        <Card key={job.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl overflow-hidden">
                                        {application.tutor_name ? application.tutor_name.charAt(0) : 'T'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{application.tutor_name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{job.class_grade} - {job.subjects?.join(', ')}</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 text-slate-700 dark:text-slate-300"
                                        onClick={() => setAttendanceModal({ open: true, app: application, job })}
                                    >
                                        <Clock size={16} className="mr-2" /> Attendance
                                    </Button>
                                    <Button 
                                        onClick={() => setRatingModal({ open: true, app: application, job })}
                                        className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:hover:bg-amber-900/60 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                    >
                                        <Star size={16} className="mr-2" /> Rate Tutor
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Attendance Modal */}
            {attendanceModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Mark Attendance</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Record a session for {attendanceModal.app?.tutor_name}.</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        value={attendanceDate}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select 
                                        value={attendanceStatus}
                                        onChange={(e) => setAttendanceStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="PRESENT">Present</option>
                                        <option value="ABSENT">Absent</option>
                                        <option value="RESCHEDULED">Rescheduled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setAttendanceModal({ open: false, app: null, job: null })}>Cancel</Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAttendanceSubmit}>Submit</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Rate Your Tutor</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">How was your experience with {ratingModal.app?.tutor_name}?</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating ({rating}/5)</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} 
                                                onClick={() => setRating(star)}
                                                className={`p-2 rounded-full transition-colors ${rating >= star ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-300 dark:text-slate-600'}`}
                                            >
                                                <Star fill={rating >= star ? 'currentColor' : 'none'} size={24} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Review (Optional)</label>
                                    <textarea 
                                        rows="3"
                                        placeholder="Write a brief review..."
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setRatingModal({ open: false, app: null, job: null })}>Cancel</Button>
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleRatingSubmit}>Submit Review</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const HistorySection = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity History</h1>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <History size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p>No history available yet.</p>
            </div>
        </div>
    </div>
);

const WalletSection = ({ wallet }) => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet & Credits</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                <div className="relative z-10">
                    <p className="text-indigo-200 font-medium mb-2">Available Balance</p>
                    <h2 className="text-5xl font-bold tracking-tight">₹ {wallet?.balance || '0.00'}</h2>
                    <div className="mt-8 flex gap-3">
                        <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold border-0">
                            + Add Money
                        </Button>
                        <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                            View Statement
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Recharge */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-base text-slate-900 dark:text-white">Quick Recharge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[500, 1000, 2000].map(amount => (
                        <button key={amount} className="w-full flex justify-between items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">₹ {amount}</span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">ADD</span>
                        </button>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Transactions */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                {wallet?.transactions?.length > 0 ? (
                    <div className="space-y-4">
                        {wallet.transactions.map((tx) => (
                             <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.transaction_type === 'CREDIT' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                        {tx.transaction_type === 'CREDIT' ? <TrendingUp size={16} /> : <FileText size={16} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{tx.description}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.transaction_type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-200'}`}>
                                    {tx.transaction_type === 'CREDIT' ? '+' : '-'} ₹{tx.amount}
                                </span>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">No recent transactions.</div>
                )}
            </CardContent>
        </Card>
    </div>
);

const NotificationsSection = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">All Caught Up!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">You have no new notifications.</p>
             </div>
        </div>
    </div>
);





