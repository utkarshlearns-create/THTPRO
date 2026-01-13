import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from '../config';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ phone: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
                if (decoded.role !== 'ADMIN') {
                    setError('Access Denied: You do not have admin privileges.');
                    return;
                }

                localStorage.setItem('access', data.access);
                localStorage.setItem('refresh', data.refresh);
                console.log('Admin login successful, redirecting...');
                navigate('/dashboard/admin');
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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                        <UserCheck className="text-white h-7 w-7" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Admin Access</h2>
                    <p className="text-slate-400 text-sm mt-1">Authorized personnel only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 block">Phone Number</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 block">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-all duration-200 mt-2 shadow-lg shadow-indigo-600/20 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                        Return to Site
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
