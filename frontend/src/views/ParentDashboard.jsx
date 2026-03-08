"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingUp,
  X,
  Heart,
  AlertCircle,
  MapPin
} from 'lucide-react';
import API_BASE_URL from '../config';
import { clearAuthState } from '../utils/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import ThemeToggle from '../components/ui/ThemeToggle';
import ParentOnboardingPopup from '../components/ParentOnboardingPopup';
import TutorCard from '../components/tutor/TutorCard';
import JobWizard from '../components/JobWizard';

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
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showJobWizard, setShowJobWizard] = useState(false);

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
                fetch(`${API_BASE_URL}/api/jobs/my-jobs/`, { headers }),
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
                const fetchedJobs = Array.isArray(jobsData) ? jobsData : (jobsData.results || []);
                if (fetchedJobs.length > 0) setLatestJob(fetchedJobs[0]);
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
            {/* Connect onboarding popup with support for manual manual 'Edit Profile' triggering */}
            <ParentOnboardingPopup 
                userProfile={userProfile} 
                forceOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
                onComplete={(updatedProfile) => {
                    setUserProfile(updatedProfile);
                    setShowEditProfile(false);
                }} 
            />
            
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
                    <SidebarItem 
                        icon={<Heart size={20} />} 
                        label="Favourites" 
                        active={activeTab === 'favourites'} 
                        isOpen={sidebarOpen} 
                        isHovered={sidebarHover}
                        onClick={() => setActiveTab('favourites')} 
                    />
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
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, {userProfile?.first_name || 'Parent'}!</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Here's an overview of your tuition activities.</p>
                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                                        <strong>Error:</strong> {error}
                                    </div>
                                )}
                            </div>

                            {/* Insights Section with Stagger Animation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {loading ? (
                                    <>
                                        <Skeleton className="h-36 w-full" />
                                        <Skeleton className="h-36 w-full" />
                                    </>
                                ) : (
                                    <>
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                            <InsightCard 
                                                title="Wallet Balance" 
                                                value={`₹ ${stats?.stats?.wallet_balance || (wallet?.balance || '0')}`} 
                                                icon={<Wallet className="text-emerald-500" />}
                                                description="Available credits for unlocking"
                                                trend={stats?.stats?.wallet_balance > 100 ? "Healthy balance" : "Consider recharging"}
                                                trendColor={stats?.stats?.wallet_balance > 100 ? "text-emerald-600" : "text-amber-600"}
                                            />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                            <InsightCard 
                                                title="Active Jobs" 
                                                value={stats?.stats?.active_jobs || 0} 
                                                icon={<Briefcase className="text-indigo-500" />}
                                                description="Open tuition requirements"
                                                trend={stats?.stats?.active_jobs > 0 ? "Managing your requests" : "Post a job to start"}
                                                trendColor="text-indigo-600"
                                            />
                                        </motion.div>
                                    </>
                                )}
                            </div>

                            {/* Quick Stats Grid with Stagger */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {loading ? (
                                    <>
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                    </>
                                ) : (
                                    <>
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                                            <StatItem label="Applications" value={stats?.stats?.applications_received || 0} icon={<User size={18} />} color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                                            <StatItem label="Tutors Hired" value={stats?.stats?.hired_count || 0} icon={<CheckCircle size={18} />} color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" />
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                                            <StatItem label="Assigned Tutor" value={stats?.assigned_tutor?.name || 'None'} icon={<Star size={18} />} color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
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
                                            <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowJobWizard(true)}>
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
                                    onClick={() => setShowJobWizard(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                                >
                                    <Briefcase className="mr-2 h-4 w-4" /> Post New Job
                                </Button>
                             </div>
                             
                             <JobsList />
                        </div>
                    )}

                    {/* MY PROFILE VIEW */}
                    {activeTab === 'profile' && <MyProfile latestJob={latestJob} stats={stats} userProfile={userProfile} onEdit={() => setShowEditProfile(true)} />}

                    {/* TUTOR ASSIGNED VIEW */}
                    {activeTab === 'tutor_assigned' && <TutorAssigned />}

                    {/* HISTORY VIEW */}
                    {activeTab === 'history' && <HistorySection />}

                    {/* UNLOCKED CONTACTS VIEW */}
                    {activeTab === 'unlocked_contacts' && <UnlockedContactsList />}

                    {/* WALLET VIEW */}
                    {activeTab === 'wallet' && <WalletSection wallet={wallet} />}

                    {/* FAVOURITES VIEW */}
                    {activeTab === 'favourites' && <FavouritesSection />}

                    {/* NOTIFICATIONS VIEW */}
                    {activeTab === 'notifications' && <NotificationsSection />}

                </div>
            </main>

            {/* Job Wizard Modal */}
            <AnimatePresence>
                {showJobWizard && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-transparent w-full max-w-2xl relative"
                        >
                            <button 
                                onClick={() => setShowJobWizard(false)}
                                className="absolute right-4 top-4 z-50 p-2 bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700 rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X size={20} className="text-slate-700 dark:text-slate-300" />
                            </button>
                            <JobWizard onSuccess={() => {
                                setShowJobWizard(false);
                                window.dispatchEvent(new Event('refreshJobs'));
                                setActiveTab('jobs_posted');
                            }} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
            
            {Array.isArray(contacts) && contacts.length > 0 ? (
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

const FavouritesSection = () => {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFavourites();
    }, []);

    const fetchFavourites = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/dashboard/favourite-tutors/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFavourites(data.results || data);
            } else {
                setError("Failed to fetch favourites.");
            }
        } catch (err) {
            setError("Something went wrong while fetching favourites.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Favourites</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">{error}</p>
                <Button onClick={fetchFavourites} className="mt-6 bg-indigo-600 hover:bg-indigo-700">Try Again</Button>
            </div>
        );
    }

    if (favourites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
                    <Heart size={40} className="text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Favourites Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
                    You haven't saved any tutors yet. Browse our recommended teachers and heart the ones you love!
                </p>
                <Button onClick={() => window.location.href = '/parent-home'} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transition-all">
                    Find Tutors
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Favourite Tutors</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Found {favourites.length} tutors you've saved.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                {Array.isArray(favourites) && favourites.map(tutor => (
                    <TutorCard key={tutor.id} tutor={tutor} />
                ))}
            </div>
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
                    {Array.isArray(applications) && applications.map((app) => (
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
        const handleRefresh = () => fetchJobs();
        const handleOpenWizard = () => setShowJobWizard(true);
        window.addEventListener('refreshJobs', handleRefresh);
        window.addEventListener('openJobWizard', handleOpenWizard);
        return () => {
            window.removeEventListener('refreshJobs', handleRefresh);
            window.removeEventListener('openJobWizard', handleOpenWizard);
        };
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

    const handleCloseJob = async (jobId) => {
        if (!confirm("Are you sure you want to close this job requirement? You will no longer receive applications.")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/parent/jobs/${jobId}/close/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setJobs(jobs.map(j => j.id === jobId ? {...j, status: 'CLOSED'} : j));
            } else {
                alert("Failed to close job. Please try again.");
            }
        } catch (error) {
            console.error("Error closing job:", error);
            alert("Network error while closing job.");
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
            {Array.isArray(jobs) && jobs.map((job) => (
                <div key={job.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    {/* Status Badge & Actions */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                        {['OPEN', 'APPROVED', 'ACTIVE'].includes(job.status) && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleCloseJob(job.id); }}
                                className="text-[11px] font-bold px-2 py-1 rounded-full text-rose-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors shadow-sm flex items-center gap-1"
                                title="Close Job Requirement"
                            >
                                <X size={12} strokeWidth={3} /> Close
                            </button>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm
                            ${['OPEN', 'APPROVED', 'ACTIVE'].includes(job.status) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}
                        `}>
                            {['APPROVED', 'ACTIVE'].includes(job.status) ? 'OPEN' : job.status.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="p-6">
                        <div className="mb-4">
                             <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4 shadow-sm transition-all duration-300 group-hover:scale-110
                                ${!job.student_name ? 'bg-slate-400' : 
                                  ['A','E','I','O','U'].includes(job.student_name.charAt(0).toUpperCase()) ? 'bg-indigo-500' :
                                  ['B','C','D','F','G'].includes(job.student_name.charAt(0).toUpperCase()) ? 'bg-emerald-500' :
                                  ['H','J','K','L','M'].includes(job.student_name.charAt(0).toUpperCase()) ? 'bg-amber-500' :
                                  ['N','P','Q','R','S'].includes(job.student_name.charAt(0).toUpperCase()) ? 'bg-purple-500' : 'bg-rose-500'}
                             `}>
                                {job.student_name ? job.student_name.charAt(0).toUpperCase() : <User size={20} />}
                             </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                {job.student_name ? `${job.student_name}'s Tuition` : `Tuition for ${job.class_grade}`}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {job.class_grade} {job.board ? `• ${job.board}` : ''}
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

                    {job.status === 'REJECTED' && job.rejection_reason && (
                        <div className="px-6 py-3 bg-rose-50 dark:bg-rose-900/10 border-t border-rose-100 dark:border-rose-900/30">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide mb-1">Reason for Rejection</p>
                                    <p className="text-sm text-rose-600 dark:text-rose-300 italic">{job.rejection_reason}</p>
                                </div>
                            </div>
                        </div>
                    )}

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
                                onClick={(e) => { e.stopPropagation(); router.push(`/tutors?subject=${encodeURIComponent(job.subjects?.[0] || '')}&location=${encodeURIComponent(job.locality || '')}`); }}
                                className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Find Matches
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                                className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all shadow-sm shadow-indigo-200 dark:shadow-indigo-900/20 hover:shadow-md flex items-center gap-1.5 group/btn"
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

const MyProfile = ({ latestJob, stats, userProfile, onEdit }) => {
    // Generate Location String dynamically
    let locationStr = "Location Not Provided";
    if (userProfile?.locality) {
        locationStr = userProfile.locality;
    } else if (latestJob?.locality) {
        locationStr = latestJob.locality;
    }

    // Dynamic User Name
    const getFullName = () => {
        if (userProfile?.first_name || userProfile?.last_name) {
            return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
        }
        if (userProfile?.name) return userProfile.name;
        if (userProfile?.username) return userProfile.username;
        
        return 'Parent Account';
    };
    
    const displayName = getFullName();

    // Dynamic Initials
    const getInitials = (name) => {
        if (!name || name === 'Parent Account') return 'PA';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const initials = getInitials(displayName);

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
                        {initials}
                    </motion.div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize truncate">{displayName}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Active since {stats?.member_since || 'N/A'}</p>
                    
                    <div className="space-y-4 text-left">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Verification</span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                                <CheckCircle size={12} /> VERIFIED
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <MapPin size={14} className="text-indigo-500" /> City
                            </span>
                            <span className="text-sm text-slate-900 dark:text-white font-bold">{userProfile?.city || 'Lucknow'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <MapPin size={14} className="text-indigo-500" /> Area
                            </span>
                            <span className="text-sm text-slate-900 dark:text-white font-bold">{userProfile?.area || 'N/A'}</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1 w-full">
                                <Home size={14} className="text-indigo-500" /> Detailed Address
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium min-h-[40px]">
                                {userProfile?.address || 'No address provided.'}
                            </p>
                        </div>
                    </div>

                    <Button onClick={onEdit} className="w-full mt-6 hover:bg-slate-100 dark:hover:bg-slate-800" variant="outline">Edit Basic Info</Button>
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
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center py-12">
                             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <User size={24} />
                             </div>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">No student profile active.</p>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => window.dispatchEvent(new Event('openJobWizard'))}>
                                <Briefcase className="mr-2 h-4 w-4" /> Create Profile via Job Post
                            </Button>
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
    const [scheduledDemos, setScheduledDemos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingModal, setRatingModal] = useState({ open: false, app: null, job: null });
    const [demoActionModal, setDemoActionModal] = useState({ open: false, app: null, job: null, action: '' });
    
    // Ratings Form State
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    
    // Demo Form State
    const [demoRemarks, setDemoRemarks] = useState('');

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
                
                const ConfirmedTutors = [];
                const DemoTutors = [];

                await Promise.all(myAssignedJobs.map(async (job) => {
                    const appRes = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/applicants/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (appRes.ok) {
                        const appsData = await appRes.json();
                        const apps = appsData.results || appsData;
                        
                        // Check for Hired / Confirmed
                        const hiredApp = apps.find(a => a.status === 'HIRED' && a.is_confirmed);
                        if (hiredApp) {
                            ConfirmedTutors.push({ job, application: hiredApp });
                        } else {
                            // Check for Demo/Shortlisted
                            const demoApp = apps.find(a => a.status === 'SHORTLISTED' || (a.status === 'HIRED' && !a.is_confirmed));
                            if (demoApp) {
                                DemoTutors.push({ job, application: demoApp });
                            }
                        }
                    }
                }));
                
                setAssignedJobs(ConfirmedTutors);
                setScheduledDemos(DemoTutors);
            }
        } catch (error) {
            console.error("Error fetching assigned tutors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const handleDemoActionSubmit = async () => {
        try {
            const token = localStorage.getItem('access');
            const { app, action } = demoActionModal;
            const endpoint = action === 'confirm' 
                ? `/api/jobs/parent/application-action/${app.id}/confirm/`
                : `/api/jobs/parent/application-action/${app.id}/demo/`;
                
            const payload = action === 'confirm' ? {} : { action: action === 'complete' ? 'COMPLETED' : action.toUpperCase(), remarks: demoRemarks };
                
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                alert(`Action successfully submitted!`);
                setDemoActionModal({ open: false, app: null, job: null, action: '' });
                setDemoRemarks('');
                fetchAssignedTutors(); 
            } else {
                const err = await response.json();
                alert(`Error: ${JSON.stringify(err)}`);
            }
        } catch (error) {
            console.error("Error submitting demo action:", error);
            alert("Network error while submitting action.");
        }
    };

    const getDemoStatusBadge = (dmStatus) => {
        switch(dmStatus) {
            case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending</span>;
            case 'ACCEPTED': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Accepted</span>;
            case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Rejected</span>;
            case 'RESCHEDULE_REQUESTED': return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Reschedule Req</span>;
            case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Completed</span>;
            default: return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Unknown</span>;
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-300 relative">
            
            {/* SCHEDULED DEMOS SECTION */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scheduled Demos</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Review tutors shortlisted for a demo before confirming them.</p>
                    </div>
                </div>

                {loading ? (
                    <Skeleton className="h-32 rounded-2xl" />
                ) : scheduledDemos.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400">
                        No scheduled demos at the moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {scheduledDemos.map(({ job, application }) => (
                            <div key={application.id} className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group">
                                <div className="h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500" />
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex flex-shrink-0 items-center justify-center font-bold text-xl overflow-hidden">
                                            {application.tutor_details?.image ? (
                                                <img src={application.tutor_details.image} alt={application.tutor_name} className="h-full w-full object-cover" />
                                            ) : application.tutor_name?.charAt(0) || 'D'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{application.tutor_name}</h3>
                                                {getDemoStatusBadge(application.demo_status)}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                <Briefcase size={13} className="shrink-0" />
                                                <span className="truncate">{job.class_grade} • {Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects}</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {application.demo_date && (
                                        <div className="mt-4 flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                            <Clock size={16} className="text-blue-500" />
                                            <span className="font-semibold">{new Date(application.demo_date).toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                        <Button variant="outline" size="sm" onClick={() => window.open(`/tutors/${application.tutor}`, '_blank')} className="flex-shrink-0 h-8">
                                            View Profile
                                        </Button>
                                        
                                        {['PENDING', 'RESCHEDULE_REQUESTED'].includes(application.demo_status) && (
                                            <>
                                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0 h-8" onClick={() => setDemoActionModal({ open: true, app: application, job, action: 'accept' })}>Accept</Button>
                                                <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex-shrink-0 h-8" onClick={() => setDemoActionModal({ open: true, app: application, job, action: 'reschedule' })}>Reschedule</Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 h-8" onClick={() => setDemoActionModal({ open: true, app: application, job, action: 'reject' })}>Reject</Button>
                                            </>
                                        )}
                                        
                                        {application.demo_status === 'ACCEPTED' && (
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 h-8" onClick={() => setDemoActionModal({ open: true, app: application, job, action: 'complete' })}>Mark Completed</Button>
                                        )}
                                        
                                        {application.demo_status === 'COMPLETED' && (
                                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0 h-8 px-6" onClick={() => setDemoActionModal({ open: true, app: application, job, action: 'confirm' })}>
                                                Confirm Tutor (Hire)
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CONFIRMED TUTORS SECTION */}
            <div className="space-y-6 mt-12 pb-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Tutor</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage tutors assigned and confirmed for your active jobs.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Skeleton className="h-48 rounded-2xl" />
                        <Skeleton className="h-48 rounded-2xl" />
                    </div>
                ) : assignedJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <User size={32} className="text-indigo-500 dark:text-indigo-400" />
                            <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-3 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">✓</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Tutors Confirmed Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Once you confirm a tutor after a successful demo, they will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {assignedJobs.map(({ job, application }) => (
                            <div key={job.id} className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
                                
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                                                {application.tutor_details?.image ? (
                                                    <img src={application.tutor_details.image} alt={application.tutor_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    application.tutor_name?.charAt(0) || 'T'
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                                                <CheckCircle size={10} className="text-white" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{application.tutor_name}</h3>
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">Confirmed</span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                                                <Briefcase size={13} className="shrink-0" />
                                                <span className="truncate">{job.class_grade} • {Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => window.open(`/tutors/${application.tutor}`, '_blank')}
                                            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 transition-colors group/btn"
                                        >
                                            <User size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            <span className="text-[11px] font-bold">View Profile</span>
                                        </button>
                                        <button 
                                            onClick={() => setRatingModal({ open: true, app: application, job })}
                                            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 transition-colors group/btn"
                                        >
                                            <Star size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            <span className="text-[11px] font-bold">Rate Tutor</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Demo Action Modal */}
            {demoActionModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize mb-2">{demoActionModal.action} Demo / Tutor</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                {demoActionModal.action === 'confirm' 
                                    ? `Are you sure you want to hire ${demoActionModal.app?.tutor_name}?`
                                    : `You are about to ${demoActionModal.action} the demo for ${demoActionModal.app?.tutor_name}.`}
                            </p>
                            
                            {['reject', 'reschedule'].includes(demoActionModal.action) && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks / Reason</label>
                                        <textarea 
                                            rows="3"
                                            placeholder="Please provide a reason..."
                                            value={demoRemarks}
                                            onChange={(e) => setDemoRemarks(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setDemoActionModal({ open: false, app: null, job: null, action: '' })}>Cancel</Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleDemoActionSubmit}>Submit Action</Button>
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
                {Array.isArray(wallet?.transactions) && wallet.transactions.length > 0 ? (
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





