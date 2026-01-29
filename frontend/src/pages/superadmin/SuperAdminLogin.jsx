import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from '../../config';
import ThemeToggle from '../../components/ui/ThemeToggle';

const SuperAdminLogin = () => {
    const [formData, setFormData] = useState({ phone: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: formData.phone, password: formData.password }),
            });

            const data = await response.json();

            if (response.ok) {
                const decoded = jwtDecode(data.access);
                
                if (decoded.role !== 'SUPERADMIN') {
                     setError('Access Denied: You do not have superadmin privileges.');
                     return;
                }

                localStorage.setItem('access', data.access);
                localStorage.setItem('refresh', data.refresh);
                localStorage.setItem('role', 'SUPERADMIN'); 
                console.log('Superadmin login successful, redirecting...');
                navigate('/superadmin');
            } else {
                setError(data.detail || 'Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
             {/* Minimal Header */}
            <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <img className="h-10 w-auto dark:brightness-0 dark:invert" src="/logo.png" alt="THT Logo" />
                    <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                        THE HOME <span className="text-brand-gold">TUITIONS</span>
                    </span>
                </div>
                <ThemeToggle />
            </header>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-16 w-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-gold/10 ring-1 ring-brand-gold/20">
                            <ShieldCheck className="text-brand-gold h-9 w-9" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Superadmin Portal</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Restricted Access Level 1</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-900/20 border border-red-500/20 text-red-400 text-sm p-4 rounded-lg flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 block">Secure ID</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all placeholder-slate-400 dark:placeholder-slate-700"
                                placeholder="Enter secure ID"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 block">Passkey</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all placeholder-slate-400 dark:placeholder-slate-700 pr-10"
                                placeholder="••••••••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-slate-500 hover:text-brand-gold focus:outline-none transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-brand-gold hover:bg-[#8f5a2b] text-white font-bold py-3.5 rounded-lg transition-all duration-200 mt-4 shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Authenticating...' : 'Authenticate Access'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-600">
                            Unauthorized access attempts are monitored and logged.<br/>
                            IP: {window.location.hostname}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
