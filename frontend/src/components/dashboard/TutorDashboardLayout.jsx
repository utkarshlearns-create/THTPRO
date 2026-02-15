"use client";
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '../../lib/utils';

const TutorDashboardLayout = ({ children, activeTab, setActiveTab, user }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Theme context is available via useTheme() in children if needed

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-600/10 rounded-full blur-3xl opacity-50 dark:opacity-30"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 dark:bg-indigo-600/10 rounded-full blur-3xl opacity-50 dark:opacity-30"></div>
            </div>

            <Sidebar 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                isOpen={sidebarOpen} 
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <Header 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                user={user}
            />

            <main className={cn(
                "pt-24 pb-12 px-8 min-h-screen transition-all duration-300 relative z-10",
                sidebarOpen ? "ml-64" : "ml-20"
            )}>
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default TutorDashboardLayout;

