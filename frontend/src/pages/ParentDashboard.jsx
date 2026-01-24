import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ParentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const [stats, setStats] = useState({ jobs_posted: 0, applications_received: 0, assigned_tutor: 'None' });
    const [latestJob, setLatestJob] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

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
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-30 shadow-sm`}>
                <div className="h-16 flex items-center justify-center border-b border-slate-100">
                     {sidebarOpen ? (
                        <div className="font-bold text-xl tracking-tight flex items-center gap-2 text-indigo-600">
                            <span className="text-slate-900">THE HOME</span> TUITIONS
                        </div>
                     ) : (
                        <span className="font-bold text-xl text-indigo-600">THT</span>
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

                <div className="p-4 border-t border-slate-100">
                    <Button variant="ghost" onClick={handleLogout} className={`w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50 ${!sidebarOpen && 'px-2 justify-center'}`}>
                        <LogOut size={20} className={sidebarOpen ? "mr-2" : ""} />
                        {sidebarOpen && "Logout"}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                         <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-900 leading-none">Parent Account</p>
                            <p className="text-xs text-slate-500 mt-1">Managed Profile</p>
                        </div>
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                            PA
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto space-y-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                                <p className="text-slate-500 mt-2">Welcome back! Here's an overview of your tuition activities.</p>
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
                                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="flex items-start gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                                                        {i === 0 ? <CheckCircle size={18} className="text-green-500"/> : i === 1 ? <User size={18} className="text-blue-500"/> : <Wallet size={18} className="text-amber-500"/>}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{i === 0 ? 'Tutor Assigned' : i === 1 ? 'New Application Received' : 'Wallet Recharged'}</p>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {i === 0 ? 'Rahul Sharma was assigned for Mathematics Class 10.' : i === 1 ? 'Priya Singh applied for your English requirement.' : 'You added ₹ 500 to your wallet.'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-2">{i + 1} day ago</p>
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
                                            <Button className="w-full justify-start bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" onClick={() => setActiveTab('wallet')}>
                                                <Wallet className="mr-2 h-4 w-4 text-green-600" /> Add Credits
                                            </Button>
                                            <Button className="w-full justify-start bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">
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

                    {/* Placeholder for other tabs (implementation can be added similarly) */}
                    {activeTab !== 'overview' && (
                        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                {activeTab === 'profile' ? <User size={32} /> : activeTab === 'wallet' ? <Wallet size={32} /> : <Briefcase size={32} />}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('_', ' ')}</h2>
                            <p className="text-slate-500 mt-2">This section is being redesigned. Switch back to Overview.</p>
                            <Button className="mt-6" variant="outline" onClick={() => setActiveTab('overview')}>Back to Overview</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, isOpen, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
        ${active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
        ${!isOpen && 'justify-center'}
    `}>
        <span className={`flex-shrink-0 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</span>
        {isOpen && <span>{label}</span>}
    </button>
);

const InsightCard = ({ title, value, icon, description, trend, trendColor, progress }) => (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 bg-transparent">
                {title}
            </CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
            {trend && <p className={`text-xs font-medium mt-2 ${trendColor}`}>{trend}</p>}
            {progress && <Progress value={progress} className="h-2 mt-3" indicatorClassName="bg-amber-500" />}
        </CardContent>
    </Card>
);

const StatItem = ({ label, value, icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

export default ParentDashboard;
