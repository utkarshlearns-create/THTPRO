import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  Briefcase, 
  Headphones, 
  Search, 
  Bell, 
  Menu, 
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeToggle from '../components/ui/ThemeToggle';
import CreateAdminModal from '../components/superadmin/CreateAdminModal';

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Analytics Hub', path: '/superadmin' },
    { icon: <Database size={20} />, label: 'Master Management', path: '/superadmin/masters' },
    { icon: <Users size={20} />, label: 'HRM Module', path: '/superadmin/hrm' },
    { icon: <Briefcase size={20} />, label: 'CRM & Leads', path: '/superadmin/crm' },
    { icon: <Headphones size={20} />, label: 'Support System', path: '/superadmin/support' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 text-white fixed h-full z-40 transition-all duration-300 ease-in-out flex flex-col shadow-xl",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50">
           {sidebarOpen ? (
               <div className="font-bold text-xl tracking-wide flex items-center gap-2">
                   <span className="text-brand-gold">THT</span> <span className="text-slate-100">ADMIN</span>
               </div>
           ) : (
               <span className="font-bold text-xl text-brand-gold">THT</span>
           )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                            isActive 
                                ? "bg-brand-gold text-white shadow-lg shadow-brand-gold/20" 
                                : "text-slate-400 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <span className={cn("flex-shrink-0 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")}>
                            {item.icon}
                        </span>
                        {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    </Link>
                );
            })}
        </nav>

        {/* User Profile Snippet (Bottom Sidebar) */}
        <div className="p-4 border-t border-slate-800">
             <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-gold to-amber-600 flex items-center justify-center text-white font-bold shadow-md">
                     MD
                 </div>
                 {sidebarOpen && (
                     <div className="overflow-hidden">
                         <p className="text-sm font-bold text-white truncate">Managing Director</p>
                         <p className="text-xs text-slate-400 truncate">superadmin@tht.com</p>
                     </div>
                 )}
             </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300 min-h-screen", sidebarOpen ? "ml-64" : "ml-20")}>
        
        {/* Topbar */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                >
                    <Menu size={20} />
                </button>
                
                {/* Global Search */}
                <div className="relative hidden md:block w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search leads, employees, or invoices..." 
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-gold/50 text-sm transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <button className="relative p-2 text-slate-500 hover:text-brand-gold transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                
                 {/* Admin Dropdown */}
                 <div className="relative">
                    <button 
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                    >
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Admin Panel</span>
                        <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 font-medium z-50 animate-in fade-in zoom-in-95 duration-200">
                            <button 
                                onClick={() => {
                                    setShowCreateAdmin(true);
                                    setProfileOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors flex items-center gap-2"
                            >
                                <Users size={16} /> Create Admin
                            </button>
                             <button 
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                                onClick={() => {
                                    localStorage.removeItem('role');
                                    localStorage.removeItem('access');
                                    window.location.href = '/superadmin/login';
                                }}
                            >
                                <span className="rotate-180"><Menu size={16} /></span> Sign Out
                            </button>
                        </div>
                    )}
                 </div>
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
            <Outlet />
        </main>

        {showCreateAdmin && (
            <CreateAdminModal 
                onClose={() => setShowCreateAdmin(false)}
                onSuccess={(data) => {
                    // Could show toast here
                    alert('Admin Created Successfully!');
                }}
            />
        )}

      </div>
    </div>
  );
};

export default SuperAdminLayout;
