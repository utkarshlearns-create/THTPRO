"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell, Wallet, User } from 'lucide-react';
import { Button } from './ui/button';
import API_BASE_URL from '../config';
import { clearAuthState } from '../utils/auth';
import ThemeToggle from './ui/ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const pathname = usePathname();

  const [walletBalance, setWalletBalance] = useState('0.00');

  useEffect(() => {
    // Check role on mount and on every route change (e.g. after login/logout)
    const userRole = localStorage.getItem('role');
    setRole(userRole); // Update state even if null (for logout)
    
    if (userRole) {
        fetchWalletBalance();
    }
  }, [pathname]);

  const fetchWalletBalance = async () => {
    try {
        const token = localStorage.getItem('access');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/wallet/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setWalletBalance(data.balance);
        }
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
    }
  };

  // Hide Navbar on Admin Dashboard and Admin Login
  if (pathname.startsWith('/dashboard/admin') || pathname === '/admin-login') {
      return null;
  }

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${ role ? 'bg-slate-50/90 dark:bg-slate-900/90 shadow-none' : 'bg-white/80 dark:bg-slate-950/80 border-b border-slate-100/50 dark:border-slate-800/50' } backdrop-blur-md supports-[backdrop-filter]:bg-opacity-60`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href={role === 'PARENT' ? '/parent-home' : role === 'TEACHER' ? '/tutor-home' : '/'} className="flex items-center gap-2">
                <img className="h-12 w-auto dark:brightness-0 dark:invert" src="/logo.png" alt="The Home Tuitions" />
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                    The Home <span className="text-indigo-600 dark:text-indigo-400">Tuitions</span>
                </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
                <ThemeToggle />
                {role ? (
                    <div className="flex items-center gap-6 ml-auto">
                        <Link href={role === 'TEACHER' ? '/dashboard/tutor?tab=wallet' : '/dashboard/parent?tab=wallet'} className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-full text-indigo-900 dark:text-indigo-100 font-bold text-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                             <Wallet size={18} className="text-indigo-600 dark:text-indigo-400" />
                             <span>₹ {walletBalance}</span>
                        </Link>
                        <Link href={role === 'TEACHER' ? '/dashboard/tutor?tab=notifications' : '/dashboard/parent?tab=notifications'} className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <Bell size={24} />
                            <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </Link>
                        <Link href={role === 'ADMIN' ? '/dashboard/admin' : role === 'TEACHER' ? '/dashboard/tutor' : '/dashboard/parent'} 
                            className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-full transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white dark:ring-slate-800">
                                {role === 'TEACHER' ? 'T' : role === 'PARENT' ? 'P' : 'A'}
                            </div>
                        </Link>
                    </div>
                ) : (
                    <>
                        <Link href="/signup?role=parent" className="px-3 py-2 rounded-lg transition-all duration-300 border border-transparent hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 font-medium">Find Tutors</Link>
                        <Link href="/signup?role=teacher" className="px-3 py-2 rounded-lg transition-all duration-300 border border-transparent hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 font-medium">Become a Tutor</Link>
                        <Link href="/about" className="px-3 py-2 rounded-lg transition-all duration-300 border border-transparent hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 font-medium">About Us</Link>
                        
                        <div className="flex items-center gap-4 ml-4">
                            <Button asChild className="shadow-lg shadow-indigo-200 dark:shadow-none bg-indigo-600 hover:bg-white hover:text-indigo-600 border-2 border-transparent hover:border-indigo-600 text-white transition-all duration-300">
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white dark:hover:text-white border-2 border-indigo-100 dark:border-slate-700 hover:border-transparent shadow-sm transition-all duration-300">
                                <Link href="/signup">Get Started</Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none p-2"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 absolute w-full left-0 shadow-xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
                {!role && (
                    <>
                        <Link href="/signup?role=parent" className="block px-3 py-3 text-slate-600 dark:text-slate-300 font-medium hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors">Find Tutors</Link>
                        <Link href="/signup?role=teacher" className="block px-3 py-3 text-slate-600 dark:text-slate-300 font-medium hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors">Become a Tutor</Link>
                        <Link href="/about" className="block px-3 py-3 text-slate-600 dark:text-slate-300 font-medium hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors">About Us</Link>
                    </>
                )}
                {role ? (
                        <>
                        <Link href={role === 'ADMIN' ? '/dashboard/admin' : role === 'TEACHER' ? '/dashboard/tutor' : '/dashboard/parent'}
                            className="block w-full text-center px-3 py-3 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                            Go to Dashboard
                        </Link>
                        <button
                            onClick={() => {
                                clearAuthState();
                                window.location.reload();
                            }}
                            className="block w-full text-left px-3 py-3 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                            Logout
                        </button>
                        </>
                ) : (
                    <div className="flex flex-col gap-2 mt-4">
                        <Button asChild className="w-full justify-center shadow-md bg-indigo-600 hover:bg-white hover:text-indigo-600 border-2 border-transparent hover:border-indigo-600 text-white transition-all duration-300">
                            <Link href="/login">Log in</Link>
                        </Button>
                        <Button asChild className="w-full justify-center bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white border-2 border-indigo-100 dark:border-slate-700 hover:border-transparent shadow-sm transition-all duration-300">
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;




