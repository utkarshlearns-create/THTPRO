import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';
import API_BASE_URL from '../config';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import ThemeToggle from '../components/ui/ThemeToggle';

const ParentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(initialTab);
    const navigate = useNavigate();
    const [stats, setStats] = useState({ jobs_posted: 0, applications_received: 0, assigned_tutor: 'None' });
    const [latestJob, setLatestJob] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
        fetchDashboardData();
    }, [searchParams]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('access');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, jobsRes, walletRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/jobs/stats/parent/`, { headers }),
                fetch(`${API_BASE_URL}/api/jobs/`, { headers }),
                fetch(`${API_BASE_URL}/api/wallet/me/`, { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (jobsRes.ok) {
                const jobsData = await jobsRes.json();
                if (jobsData.length > 0) setLatestJob(jobsData[0]);
            }
            if (walletRes.ok) setWallet(await walletRes.json());

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100">
            {/* Sidebar */}
            <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-30 shadow-sm`}>
                <div className="h-16 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                     {sidebarOpen ? (
                        <div className="font-bold text-xl tracking-tight flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <span className="text-slate-900 dark:text-white">THE HOME</span> TUITIONS
                        </div>
                     ) : (
                        <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">THT</span>
                     )}
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} isOpen={sidebarOpen} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={<User size={20} />} label="My Profile" active={activeTab === 'profile'} isOpen={sidebarOpen} onClick={() => setActiveTab('profile')} />
                    <SidebarItem icon={<Briefcase size={20} />} label="Jobs Posted" active={activeTab === 'jobs_posted'} isOpen={sidebarOpen} onClick={() => setActiveTab('jobs_posted')} />
                    <SidebarItem icon={<User size={20} />} label="Tutor Assigned" active={activeTab === 'tutor_assigned'} isOpen={sidebarOpen} onClick={() => setActiveTab('tutor_assigned')} />
                    <SidebarItem icon={<History size={20} />} label="History" active={activeTab === 'history'} isOpen={sidebarOpen} onClick={() => setActiveTab('history')} />
                    <SidebarItem icon={<Wallet size={20} />} label="Wallet & Credits" active={activeTab === 'wallet'} isOpen={sidebarOpen} onClick={() => setActiveTab('wallet')} />
                    <SidebarItem icon={<Bell size={20} />} label="Notifications" active={activeTab === 'notifications'} isOpen={sidebarOpen} onClick={() => setActiveTab('notifications')} />
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" onClick={handleLogout} className={`w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 ${!sidebarOpen && 'px-2 justify-center'}`}>
                        <LogOut size={20} className={sidebarOpen ? "mr-2" : ""} />
                        {sidebarOpen && "Logout"}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                         <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">Parent Account</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Managed Profile</p>
                        </div>
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-700">
                            PA
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto space-y-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Welcome back! Here's an overview of your tuition activities.</p>
                            </div>

                            {/* Insights Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InsightCard 
                                    title="Total Spend" 
                                    value={`₹ ${wallet?.balance ? (5000 - wallet.balance) : '0'}`} 
                                    icon={<Wallet className="text-emerald-500" />}
                                    description="Lifetime investment in education"
                                    trend="+12% from last month"
                                    trendColor="text-emerald-600"
                                />
                                <InsightCard 
                                    title="Active Jobs" 
                                    value={stats.jobs_posted} 
                                    icon={<Briefcase className="text-indigo-500" />}
                                    description="Open tuition requirements"
                                    trend="2 new this week"
                                    trendColor="text-indigo-600"
                                />
                                <InsightCard 
                                    title="Profile Strength" 
                                    value="85%" 
                                    icon={<Zap className="text-amber-500" />}
                                    description="Complete your profile to attract better tutors"
                                    progress={85}
                                />
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatItem label="Wallet Balance" value={`₹ ${wallet?.balance || '0.00'}`} icon={<Wallet size={18} />} color="bg-emerald-100 text-emerald-700" />
                                <StatItem label="Applications" value={stats.applications_received} icon={<User size={18} />} color="bg-blue-100 text-blue-700" />
                                <StatItem label="Classes Taken" value="12" icon={<Clock size={18} />} color="bg-violet-100 text-violet-700" />
                                <StatItem label="Avg. Tutor Rating" value="4.8" icon={<Star size={18} />} color="bg-amber-100 text-amber-700" />
                            </div>

                            {/* Recent Activity & Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900 dark:text-white">Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="flex items-start gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                                                        {i === 0 ? <CheckCircle size={18} className="text-green-500"/> : i === 1 ? <User size={18} className="text-blue-500"/> : <Wallet size={18} className="text-amber-500"/>}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{i === 0 ? 'Tutor Assigned' : i === 1 ? 'New Application Received' : 'Wallet Recharged'}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                            {i === 0 ? 'Rahul Sharma was assigned for Mathematics Class 10.' : i === 1 ? 'Priya Singh applied for your English requirement.' : 'You added ₹ 500 to your wallet.'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{i + 1} day ago</p>
                                                    </div>
                                                </div>
                                            ))}
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
                                            <Button className="w-full justify-start bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
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

                    {/* JOBS POSTED VIEW */}
                    {activeTab === 'jobs_posted' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                             <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Jobs Posted</h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your active tuition requirements.</p>
                                </div>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                                    <Briefcase className="mr-2 h-4 w-4" /> Post New Job
                                </Button>
                             </div>
                             
                             <JobsList />
                        </div>
                    )}

                    {/* MY PROFILE VIEW */}
                    {activeTab === 'profile' && <MyProfile latestJob={latestJob} />}

                    {/* TUTOR ASSIGNED VIEW */}
                    {activeTab === 'tutor_assigned' && <TutorAssigned />}

                    {/* HISTORY VIEW */}
                    {activeTab === 'history' && <HistorySection />}

                    {/* WALLET VIEW */}
                    {activeTab === 'wallet' && <WalletSection wallet={wallet} />}

                    {/* NOTIFICATIONS VIEW */}
                    {activeTab === 'notifications' && <NotificationsSection />}

                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, isOpen, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
        ${active ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
        ${!isOpen && 'justify-center'}
    `}>
        <span className={`flex-shrink-0 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>{icon}</span>
        {isOpen && <span>{label}</span>}
    </button>
);

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

export default ParentDashboard;

const JobsList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
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

    if (jobs.length === 0) {
        return (
             <div className="bg-white dark:bg-slate-900 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                <div className="mx-auto w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                    <Briefcase size={32} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Jobs Posted Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Post your first tuition requirement to find the best tutors in your locality.</p>
                <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700">Post Now</Button>
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
                                <span className="font-medium truncate">{job.subjects.join(', ')}</span>
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
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-700 bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300">
                                    ?
                                </div>
                            ))}
                        </div>
                        <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group/btn">
                            View Details <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MyProfile = ({ latestJob }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Left Column: Identity */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-fit bg-white dark:bg-slate-900">
                <CardContent className="pt-8 text-center">
                    <div className="h-24 w-24 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 ring-4 ring-indigo-50 dark:ring-indigo-900/10">
                        PA
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Parent Account</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Active since Jan 2024</p>
                    
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
                                    {latestJob.subjects.map((sub, i) => (
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
                            <Button className="mt-4" variant="link">Create Profile via Job Post</Button>
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

const TutorAssigned = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Tutors</h1>
         </div>
         <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <User size={32} className="text-indigo-500 dark:text-indigo-400" />
                <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">+</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Tutors Assigned Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Once you approve an application, your assigned tutor will appear here.</p>
         </div>
    </div>
);

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


