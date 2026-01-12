import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Bell, 
  Users, 
  GraduationCap, 
  UserCheck, 
  FileText, 
  LogOut, 
  Menu,
  Tag
} from 'lucide-react';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear mock auth
        localStorage.removeItem('role');
        navigate('/admin-login');
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

                <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-slate-300" />
                         </div>
                         {sidebarOpen && (
                            <div>
                                <div className="font-medium text-sm">Demo</div>
                                <div className="text-xs text-green-400 flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span> Online
                                </div>
                            </div>
                         )}
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active isOpen={sidebarOpen} />
                        
                        <SidebarItem 
                            icon={<Briefcase size={20} />} 
                            label="Post Jobs" 
                            isOpen={sidebarOpen}
                            subItems={[
                                "Final Leads List",
                                "Close Leads List",
                                "Add New Jobs",
                                "Approve Jobs"
                            ]}
                        />

                        <SidebarItem 
                            icon={<Bell size={20} />} 
                            label="Notification" 
                            isOpen={sidebarOpen}
                            subItems={["Notification Master"]}
                        />

                        <SidebarItem 
                            icon={<Users size={20} />} 
                            label="Parent Package" 
                            isOpen={sidebarOpen}
                            subItems={[
                                "Package Master",
                                "Pending Purchase List",
                                "Approved Purchase List",
                                "Rejected Purchase List"
                            ]}
                        />

                        <SidebarItem 
                            icon={<GraduationCap size={20} />} 
                            label="Tutor Package" 
                            isOpen={sidebarOpen}
                            subItems={[
                                "Package Master",
                                "Pending Purchase List",
                                "Approved Purchase List",
                                "Rejected Purchase List"
                            ]}
                        />

                        <SidebarItem 
                            icon={<UserCheck size={20} />} 
                            label="Approve Tutor" 
                            isOpen={sidebarOpen} 
                        />

                        <SidebarItem 
                            icon={<UserCheck size={20} />} 
                            label="Select Tutor" 
                            isOpen={sidebarOpen}
                            subItems={[
                                "Apply Job List",
                                "Assigned Jobs"
                            ]}
                        />

                        <SidebarItem 
                            icon={<FileText size={20} />} 
                            label="Reports" 
                            isOpen={sidebarOpen}
                            subItems={[
                                "Enquiry List",
                                "Unlocked Job List",
                                "Parent View Tutor History"
                            ]}
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
                <header className="h-16 bg-[#A07040] text-white flex items-center justify-between px-6 shadow-sm">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-white/10 rounded">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-12 bg-white/20 rounded-sm flex items-center justify-center text-xs">🇮🇳</div>
                         <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                            <UserCheck size={16} />
                         </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            color="from-cyan-400 to-blue-500" 
                            value="1770" 
                            label="Total Leads" 
                        />
                         <StatCard 
                            color="from-blue-400 to-indigo-500" 
                            value="89" 
                            label="Total Fresh Leads" 
                        />
                         <StatCard 
                            color="from-cyan-400 to-blue-500" 
                            value="377" 
                            label="Total Rejected Leads" 
                        />
                         <StatCard 
                            color="from-blue-400 to-indigo-500"
                            value="48" 
                            label="Total Future Lead" 
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active = false, isOpen, subItems }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <li>
            <button 
                onClick={() => subItems && setExpanded(!expanded)}
                className={`flex items-center gap-4 px-6 py-3 w-full transition-colors 
                ${active ? 'bg-slate-800 text-white border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'}
                ${!isOpen && 'justify-center px-2'}
            `}>
                <span className="flex-shrink-0">{icon}</span>
                {isOpen && (
                    <div className="flex-1 flex items-center justify-between whitespace-nowrap">
                        <span>{label}</span>
                        {subItems && (
                            <span className="text-slate-500">
                                {expanded ? '−' : '+'}
                            </span>
                        )}
                    </div>
                )}
            </button>
            
            {/* Sub Items */}
            {isOpen && expanded && subItems && (
                <ul className="bg-slate-900 border-l border-slate-700 ml-10 my-1 space-y-1">
                    {subItems.map((item, index) => (
                        <li key={index}>
                            <a href="#" className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-md transition-colors">
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

const StatCard = ({ color, value, label }) => (
    <div className={`bg-gradient-to-r ${color} rounded-lg p-6 text-white shadow-lg relative overflow-hidden group`}>
        <div className="relative z-10">
            <div className="text-4xl font-bold mb-1">{value}</div>
            <div className="text-sm font-medium opacity-90">{label}</div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:scale-110 transition-transform duration-300">
            <Tag size={64} />
        </div>
        {/* Decorative circle */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white opacity-10 rounded-full"></div>
    </div>
);

export default AdminDashboard;
