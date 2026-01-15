import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const location = useLocation();

  const isDashboard = location.pathname.includes('/dashboard');

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to={role === 'PARENT' ? '/parent-home' : role === 'TEACHER' ? '/tutor-home' : '/'} className="flex items-center gap-2">
                <img
                    className="h-10 w-auto" 
                    src="/logo.png"
                    alt="The Home Tuitions"
                />
                <span className="font-bold text-xl tracking-tight text-slate-900">
                    The Home <span className="text-indigo-600">Tuitions</span>
                </span>
            </Link>

            {/* Desktop Navigation */}
            {!isDashboard && (
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Find Tutors</a>
                    <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Become a Tutor</a>
                    <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">About Us</a>
                    
                    {role ? (
                        <div className="flex items-center gap-4 ml-4">
                            <Link 
                                to={role === 'ADMIN' ? '/admin-dashboard' : role === 'TEACHER' ? '/dashboard/tutor' : '/dashboard/parent'} 
                                className="text-slate-900 font-semibold hover:text-indigo-600 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('role');
                                    localStorage.removeItem('access');
                                    window.location.href = '/login';
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-full font-semibold transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 ml-4">
                            <Link to="/login" className="text-slate-900 font-semibold hover:text-indigo-600 transition-colors">
                                Log in
                            </Link>
                            <Link to="/signup" className="btn-primary px-6 py-2.5 shadow-lg shadow-indigo-200 hover:shadow-indigo-300">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Mobile menu button */}
            {!isDashboard && (
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-slate-600 hover:text-slate-900 focus:outline-none p-2"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 absolute w-full left-0 shadow-xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
                <a href="#" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Find Tutors</a>
                <a href="#" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Become a Tutor</a>
                <a href="#" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">About Us</a>
                <div className="border-t border-slate-100 my-2 pt-2">
                    {role ? (
                         <>
                            <Link 
                                to={role === 'ADMIN' ? '/admin-dashboard' : role === 'TEACHER' ? '/dashboard/tutor' : '/dashboard/parent'}
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
                        <>
                            <Link to="/login" className="block w-full text-center px-3 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-lg">
                                Log in
                            </Link>
                            <Link to="/signup" className="block w-full text-center px-3 py-3 mt-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
