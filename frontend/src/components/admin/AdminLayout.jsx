import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { cn } from '../../lib/utils'; // Assuming cn exists

export default function AdminLayout({ children, activeView, setActiveView }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white">
                <span className="font-bold text-lg">THTPRO<span className="text-blue-500">Admin</span></span>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <AdminSidebar 
                activeView={activeView} 
                setActiveView={(view) => {
                    setActiveView(view);
                    if (window.innerWidth < 768) setSidebarOpen(false); // Close on mobile selection only
                }}
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main 
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    "md:ml-64 min-h-screen", // Desktop margin for sidebar
                    "p-4 md:p-8"
                )}
            >
                {children}
            </main>
        </div>
    );
}
