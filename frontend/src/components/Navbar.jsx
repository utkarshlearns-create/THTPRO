
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, Wallet, User } from 'lucide-react';
import { Button } from './ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check role on mount and on every route change (e.g. after login/logout)
    const userRole = localStorage.getItem('role');
    setRole(userRole); // Update state even if null (for logout)
  }, [location]);

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${ role ? 'bg-slate-50/90 shadow-none' : 'bg-white/80 border-b border-slate-100/50' } backdrop-blur-md supports-[backdrop-filter]:bg-opacity-60`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <Link to={role === 'PARENT' ? '/parent-home' : role === 'TEACHER' ? '/tutor-home' : '/'} className="flex items-center gap-2">
                <img className="h-14 w-auto" src="/logo.png" alt="The Home Tuitions" />
                <span className="font-bold text-xl tracking-tight text-slate-900">
                    The Home <span className="text-indigo-600">Tuitions</span>
                </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
                {role ? (
                    <div className="flex items-center gap-6 ml-auto">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 rounded-full text-indigo-900 font-bold text-sm border border-slate-200/60 shadow-sm">
                             <Wallet size={18} className="text-indigo-600" />
                             <span>₹ 2,500</span>
                        </div>
                        <button className="relative p-2 text-slate-500 hover:text-indigo-600 transition-all hover:bg-slate-100 rounded-full">
                            <Bell size={24} />
                            <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <Link 
                            to={role === 'ADMIN' ? '/dashboard/admin' : role === 'TEACHER' ? '/dashboard/tutor' : '/dashboard/parent'} 
                            className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-full transition-all border border-transparent hover:border-slate-200"
                        >
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white">
                                {role === 'TEACHER' ? 'T' : role === 'PARENT' ? 'P' : 'A'}
                            </div>
                        </Link>
                    </div>
                ) : (
                    <>
                        <Link to="/tutors" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Find Tutors</Link>
                        <Link to="/signup?role=teacher" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Become a Tutor</Link>
                        <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">About Us</a>
                        
                        <div className="flex items-center gap-4 ml-4">
                            <Button asChild className="shadow-lg shadow-indigo-200 hover:shadow-indigo-300 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Link to="/login">Log in</Link>
                            </Button>
                            <Button asChild className="bg-white text-indigo-600 font-bold hover:bg-white hover:text-indigo-700 border border-indigo-100">
                                <Link to="/signup">Get Started</Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-slate-600 hover:text-slate-900 focus:outline-none p-2"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 absolute w-full left-0 shadow-xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
                {!role && (
                    <>
                        <Link to="/tutors" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Find Tutors</Link>
                        <Link to="/signup?role=teacher" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Become a Tutor</Link>
                        <a href="#" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">About Us</a>
                    </>
                )}
                {role ? (
                        <>
                        <Link 
                            to={role === 'ADMIN' ? '/dashboard/admin' : role === 'TEACHER' ? '/dashboard/tutor' : '/dashboard/parent'}
                            className="block w-full text-center px-3 py-3 text-indigo-600 font-bold hover:bg-indigo-50 rounded-lg"
                        >
                            Go to Dashboard
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem('role');
                                window.location.reload();
                            }}
                            className="block w-full text-left px-3 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-lg"
                        >
                            Logout
                        </button>
                        </>
                ) : (
                    <div className="flex flex-col gap-2 mt-4">
                        <Button asChild className="w-full justify-center shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Link to="/login">Log in</Link>
                        </Button>
                        <Button asChild className="w-full justify-center bg-white text-indigo-600 font-bold hover:bg-white hover:text-indigo-700 border border-indigo-100">
                            <Link to="/signup">Get Started</Link>
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
