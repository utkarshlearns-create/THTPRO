
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
  AlertCircle
} from 'lucide-react';
import API_BASE_URL from '../config';

const ParentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('jobs_posted'); // jobs_posted, tutor_assigned, history, wallet
    const navigate = useNavigate();
    const [stats, setStats] = useState({ jobs_posted: 0, tutors_hired: 0 });

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`bg-slate-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-30`}>
                <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-900">
                     {sidebarOpen ? (
                        <div className="font-bold text-xl tracking-wider flex flex-col items-center">
                            <span>THE HOME</span>
                            <span className="text-xs font-normal text-slate-400">TUITIONS</span>
                        </div>
                     ) : (
                        <span className="font-bold text-xl">THT</span>
                     )}
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        <SidebarItem 
                            icon={<Briefcase size={20} />} 
                            label="Jobs Posted" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'jobs_posted'}
                            onClick={() => setActiveTab('jobs_posted')}
                        />
                        <SidebarItem 
                            icon={<User size={20} />} 
                            label="Tutor Assigned" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'tutor_assigned'}
                            onClick={() => setActiveTab('tutor_assigned')}
                        />
                        <SidebarItem 
                            icon={<History size={20} />} 
                            label="History" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'history'}
                            onClick={() => setActiveTab('history')}
                        />
                        <SidebarItem 
                            icon={<Wallet size={20} />} 
                            label="Credit History" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'wallet'}
                            onClick={() => setActiveTab('wallet')}
                        />
                        <SidebarItem 
                            icon={<Bell size={20} />} 
                            label="Notifications" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                        />
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className={`flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full ${!sidebarOpen && 'justify-center'}`}>
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Navbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                            <Menu size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900 leading-none">Parent</p>
                                <p className="text-xs text-slate-500 mt-0.5">Account</p>
                            </div>
                            <div className="h-9 w-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                                PA
                            </div>
                         </div>
                    </div>
                </header>

                <div className="p-6 max-w-5xl mx-auto">
                    {/* JOBS POSTED VIEW */}
                    {activeTab === 'jobs_posted' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                             <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-slate-900">Jobs Posted</h1>
                                <button className="btn-primary flex items-center gap-2">
                                    <span>+ Post New Job</span>
                                </button>
                             </div>
                             
                             {/* Placeholder for Jobs List */}
                             <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center">
                                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                    <Briefcase size={24} className="text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No Jobs Posted Yet</h3>
                                <p className="text-slate-500 mt-1 max-w-sm mx-auto">Post your first tuition requirement to find the best tutors in your locality.</p>
                                <button className="mt-6 text-indigo-600 font-medium hover:underline">Post a requirement now</button>
                             </div>
                        </div>
                    )}

                    {/* TUTOR ASSIGNED VIEW */}
                    {activeTab === 'tutor_assigned' && (
                         <div className="space-y-6 animate-in fade-in duration-300">
                            <h1 className="text-2xl font-bold text-slate-900">Assigned Tutors</h1>
                            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center">
                                <p className="text-slate-500">No tutors currently assigned.</p>
                            </div>
                         </div>
                    )}

                     {/* HISTORY VIEW */}
                     {activeTab === 'history' && (
                         <div className="space-y-6 animate-in fade-in duration-300">
                            <h1 className="text-2xl font-bold text-slate-900">History</h1>
                            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center">
                                <p className="text-slate-500">No history available.</p>
                            </div>
                         </div>
                    )}

                    {/* WALLET VIEW */}
                    {activeTab === 'wallet' && (
                        <WalletSection />
                    )}

                    {/* NOTIFICATIONS VIEW */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center">
                                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Bell size={24} className="text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No New Notifications</h3>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active = false, isOpen, onClick }) => (
    <li>
        <button 
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-3 w-full transition-colors 
            ${active ? 'bg-slate-800 text-white border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'}
            ${!isOpen && 'justify-center px-2'}
        `}>
            <span className="flex-shrink-0">{icon}</span>
            {isOpen && <span className="font-medium">{label}</span>}
        </button>
    </li>
);

const WalletSection = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/wallet/me/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWallet(data);
            }
        } catch (error) {
            console.error("Error fetching wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Wallet...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-900">Credit History</h1>
            
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-indigo-200 font-medium mb-1">Available Credits</p>
                        <h2 className="text-4xl font-bold">₹ {wallet?.balance || '0.00'}</h2>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <Wallet size={32} className="text-white" />
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition">
                        Add Credits
                    </button>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {wallet?.transactions?.length > 0 ? (
                        wallet.transactions.map((tx) => (
                            <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${tx.transaction_type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.transaction_type === 'CREDIT' ? <CheckCircle size={18} /> : <FileText size={18} />} 
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{tx.description}</p>
                                        <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-slate-900'}`}>
                                    {tx.transaction_type === 'CREDIT' ? '+' : '-'} ₹{tx.amount}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">No transactions yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
