"use client";
import React from 'react';
import { Bell, Menu, Sparkles, Gem, Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ sidebarOpen, setSidebarOpen, user }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className={cn(
            "h-20 fixed top-0 right-0 z-40 flex items-center justify-between px-8 transition-all duration-300 border-b",
            "bg-white/80 border-slate-200 backdrop-blur-md", // Light Mode
            "dark:bg-slate-950/50 dark:border-white/5", // Dark Mode
            sidebarOpen ? "left-0 md:left-64" : "left-0 md:left-20" // Fix for mobile/desktop layout
        )}>
            {/* Left: Mobile Toggle & Welcome */}
            <div className="flex items-center gap-4 md:gap-6 ml-12 md:ml-0"> {/* ml-12 to push past fixed sidebar toggle on mobile if needed */}
                <div className="hidden md:block">
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Welcome back, <span className="bg-gradient-to-r from-sky-400 to-indigo-600 dark:from-sky-300 dark:to-indigo-400 bg-clip-text text-transparent">{user?.first_name || 'Tutor'}</span>
                    </h1>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                        Profile Active
                    </p>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 md:gap-6">
                 {/* Theme Toggle */}
                 <button 
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                 >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                 </button>

                 {/* Wallet Jewel */}
                 <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 rounded-full shadow-sm hover:border-indigo-500/60 transition-colors cursor-pointer">
                    <Gem className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-indigo-100">500 Credits</span>
                 </div>

                 {/* Notification Bell */}
                 <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors group">
                    <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-bounce"></span>
                 </button>

                 {/* Profile Avatar */}
                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 p-[1px] cursor-pointer hover:scale-105 transition-transform shadow-md">
                    <div className="h-full w-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center">
                        <span className="font-bold text-indigo-600 dark:text-sky-400 text-sm">TU</span>
                    </div>
                 </div>
            </div>
        </header>
    );
};

export default Header;

