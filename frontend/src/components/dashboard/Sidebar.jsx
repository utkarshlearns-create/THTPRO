"use client";
import React, { useState } from 'react';
import { LayoutDashboard, User, FileText, Wallet, Bell, LogOut, Settings, HelpCircle, MapPin, BookOpen, ChevronLeft, ChevronRight, Menu, Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ activeTab, onTabChange, isOpen, onToggle }) => {
    const { theme, toggleTheme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const showSidebar = isOpen || isHovered;
    const navItems = [
        { id: 'dashboard_home', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'profile', icon: User, label: 'My Profile' },
        { id: 'applications', icon: FileText, label: 'My Applications' },
        { id: 'tuitions', icon: BookOpen, label: 'Browse Jobs' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'settings', icon: Settings, label: 'Settings' },
        { id: 'support', icon: HelpCircle, label: 'Support' },
    ];

    return (
        <aside 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r",
            "bg-white border-slate-200 shadow-xl",
            "dark:bg-slate-900/80 dark:border-white/5 dark:shadow-none dark:backdrop-blur-xl",
            showSidebar ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-20 lg:translate-x-0"
        )}>
            {/* Logo Area & Toggle */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/5 relative">
                {showSidebar ? (
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-sky-500 to-blue-700 dark:from-sky-400 dark:to-blue-600 bg-clip-text text-transparent">THE HOME</span>
                        <span className="text-xs tracking-[0.3em] text-slate-500 dark:text-slate-400 font-medium">TUITIONS</span>
                    </div>
                ) : (
                    <div className="h-10 w-10 mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <span className="font-bold text-white">T</span>
                    </div>
                )}
                
                {/* Sidebar Toggle Button - Always visible inside sidebar */}
                 {isOpen && (
                    <button 
                        onClick={onToggle}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                 )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onTabChange(item.id);
                            // Auto-close sidebar on mobile
                            if (window.innerWidth < 1024) onToggle();
                        }}
                        className={cn(
                            "w-full flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                            activeTab === item.id 
                                ? "bg-indigo-50 text-indigo-600 dark:bg-white/5 dark:text-sky-400 shadow-sm" 
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                        )}
                    >
                        {activeTab === item.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-sky-400 rounded-r-full" />
                        )}
                        <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", activeTab === item.id && "scale-110")} />
                        
                        <span className={cn(
                            "font-medium whitespace-nowrap transition-all duration-300 origin-left",
                            !showSidebar && "opacity-0 translate-x-10 w-0 overflow-hidden",
                            showSidebar && "opacity-100 translate-x-0"
                        )}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            {/* Collapsed Toggle (When closed, user clicks logo or bottom button to open? Or use the header button. Adding button at bottom for convenience) */}
            {!showSidebar && (
                <button 
                    onClick={onToggle}
                    className="mx-auto mb-2 p-2 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-sky-400 hover:bg-indigo-100 dark:hover:bg-slate-700 transition"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
                {/* Theme Toggle (Sidebar Version) */}
                <button 
                    onClick={toggleTheme}
                    className={cn(
                    "w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors group",
                    "text-slate-500 hover:text-indigo-600 hover:bg-slate-100", // Light
                    "dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5", // Dark
                    !showSidebar && "justify-center px-0"
                )}>
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    ) : (
                        <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                    )}
                    <span className={cn("font-medium transition-all duration-300 whitespace-nowrap", !showSidebar ? "w-0 opacity-0 overflow-hidden" : "opacity-100")}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* Logout */}
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}
                    className={cn(
                    "w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors group",
                    "text-slate-500 hover:text-red-500 hover:bg-red-50", // Light
                    "dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10", // Dark
                    !showSidebar && "justify-center px-0"
                )}>
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className={cn("font-medium transition-all duration-300 whitespace-nowrap", !showSidebar ? "w-0 opacity-0 overflow-hidden" : "opacity-100")}>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
