import React, { useState } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Bell,
    Users,
    GraduationCap,
    UserCheck,
    MousePointer2,
    FileText,
    LogOut,
    ChevronDown,
    ChevronRight,
    Circle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ThemeToggle from '../ui/ThemeToggle';

const MENU_ITEMS = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        id: 'home'
    },
    // PARENT MANAGEMENT
    {
        header: 'PARENT MANAGEMENT',
    },
    {
        label: 'Post Jobs (Approvals)',
        icon: Briefcase,
        id: 'jobs',
        subItems: [
            { label: 'Final Leads List', id: 'jobs-final-leads' },
            { label: 'Close Leads List', id: 'jobs-close-leads' },
            { label: 'Add New Jobs', id: 'jobs-add-new' },
            { label: 'Approve Jobs', id: 'jobs-approve' },
        ]
    },

    // TUTOR MANAGEMENT
    {
        header: 'TUTOR MANAGEMENT',
    },
    {
        label: 'Approve Tutor (KYC)',
        icon: UserCheck,
        id: 'approve-tutor',
        subItems: [
            { label: 'Pending Verification', id: 'approve-tutor-list' }
        ]
    },
    {
        label: 'Tutor Applications',
        icon: MousePointer2,
        id: 'select-tutor',
        subItems: [
            { label: 'Applications List', id: 'select-tutor-apply-job' },
            { label: 'Assigned Jobs', id: 'select-tutor-assigned' }
        ]
    },

    // GENERAL
    {
        header: 'GENERAL',
    },
    {
        label: 'Notifications',
        icon: Bell,
        id: 'notifications',
        subItems: [
            { label: 'Notification Master', id: 'notifications-master' }
        ]
    },
    {
        label: 'Reports',
        icon: FileText,
        id: 'reports',
        subItems: [
            { label: 'Enquiry List', id: 'reports-enquiry' },
            { label: 'Unlocked Job List', id: 'reports-unlocked-jobs' },
            { label: 'Parent View History', id: 'reports-parent-view-history' }
        ]
    }
];

const NavItem = ({ item, activeView, setActiveView, isOpen }) => {
    const [expanded, setExpanded] = useState(false);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = activeView === item.id || (hasSubItems && item.subItems.some(sub => sub.id === activeView));

    const handleClick = () => {
        if (hasSubItems) {
            setExpanded(!expanded);
        } else {
            setActiveView(item.id);
        }
    };

    return (
        <div className="mb-1">
            <button
                onClick={handleClick}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive && !hasSubItems
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <item.icon size={20} className={cn("flex-shrink-0 transition-transform group-hover:scale-110", isActive && !hasSubItems && "animate-pulse-subtle")} />
                    <span className={cn("font-medium text-sm whitespace-nowrap transition-opacity duration-300", !isOpen && "opacity-0 w-0 h-0 overflow-hidden")}>
                        {item.label}
                    </span>
                </div>
                {hasSubItems && isOpen && (
                    <div className="text-slate-500">
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                )}
            </button>

            {hasSubItems && expanded && isOpen && (
                <div className="mt-1 ml-4 space-y-1 border-l border-slate-800 pl-4 py-1">
                    {item.subItems.map((subItem) => (
                        <button
                            key={subItem.id}
                            onClick={() => setActiveView(subItem.id)}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                activeView === subItem.id
                                    ? "text-blue-400 bg-blue-500/10 font-medium"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                            )}
                        >
                            <Circle size={6} className={cn("transition-colors", activeView === subItem.id ? "fill-current" : "fill-transparent")} />
                            <span>{subItem.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function AdminSidebar({ activeView, setActiveView, isOpen, toggleSidebar, mode }) {
    // Filter items based on mode
    const filteredItems = MENU_ITEMS.filter(item => {
        if (!mode) return true; // Show all if no mode specified

        // Common items
        if (['home', 'notifications', 'reports'].includes(item.id)) return true;
        
        // Header handling - tricky because headers have no ID.
        // Simplified approach: If header is "PARENT MANAGEMENT" and mode is 'tutor', hide.
        if (item.header === 'PARENT MANAGEMENT' && mode === 'tutor') return false;
        if (item.header === 'TUTOR MANAGEMENT' && mode === 'parent') return false;
        if (item.header === 'GENERAL') return true;

        // Specific section handling
        if (mode === 'parent') {
            return ['jobs', 'parent-package'].includes(item.id) || item.header === 'PARENT MANAGEMENT' || item.header === 'GENERAL';
        }
        if (mode === 'tutor') {
            return ['approve-tutor', 'select-tutor', 'tutor-package'].includes(item.id) || item.header === 'TUTOR MANAGEMENT' || item.header === 'GENERAL';
        }
        return true;
    });

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-all duration-300 z-50",
                isOpen ? "w-64" : "w-20"
            )}
        >
            {/* Header */}
            <div className={cn("h-16 flex items-center border-b border-slate-800 transition-all duration-300 relative", isOpen ? "px-6" : "justify-center px-0")}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="font-bold text-white">T</span>
                    </div>
                    {isOpen && (
                        <span className="font-bold text-lg tracking-tight whitespace-nowrap">THTPRO<span className="text-blue-500">Admin</span></span>
                    )}
                </div>
                
                {/* Desktop Toggle Button */}
                <button 
                    onClick={toggleSidebar}
                    className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-blue-600 rounded-full items-center justify-center text-white shadow-md hover:bg-blue-700 transition-colors z-50"
                >
                    {isOpen ? <ChevronDown className="rotate-90" size={14} /> : <ChevronRight size={14} />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar overflow-x-hidden">
                {isOpen && (
                    <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {mode ? `${mode} Admin` : 'Main Navigation'}
                    </div>
                )}
                
                <div className="space-y-1">
                    {filteredItems.map((item, index) => (
                        item.header ? (
                            isOpen && (
                                <div key={index} className="px-3 mt-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {item.header}
                                </div>
                            )
                        ) : (
                             <NavItem 
                                key={item.id}
                                item={item}
                                activeView={activeView}
                                setActiveView={setActiveView}
                                isOpen={isOpen}
                            />
                        )
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                {isOpen ? (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/50 mb-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <img 
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
                                alt="Admin" 
                                className="h-9 w-9 bg-slate-700 rounded-full flex-shrink-0"
                            />
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium text-white truncate">Admin</span>
                                <span className="text-xs text-slate-400 truncate">admin@tht.com</span>
                            </div>
                        </div>
                        <ThemeToggle className="text-slate-400 hover:text-white hover:bg-slate-700 flex-shrink-0" />
                    </div>
                ) : (
                    <div className="flex justify-center mb-4">
                        <ThemeToggle className="text-slate-400 hover:text-white hover:bg-slate-700" />
                    </div>
                )}
                
                <button 
                    onClick={() => {
                        localStorage.removeItem('role');
                        window.location.href = '/admin-login';
                    }}
                    className={cn(
                        "w-full flex items-center gap-2 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium",
                        !isOpen && "justify-center"
                    )}
                >
                    <LogOut size={16} />
                    {isOpen && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
