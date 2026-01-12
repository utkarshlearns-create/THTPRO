import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Briefcase } from 'lucide-react';

const Signup = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');
    
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        password: '',
        role: 'PARENT' // Default
    });

    useEffect(() => {
        if (roleParam === 'teacher') {
            setFormData(prev => ({ ...prev, role: 'TEACHER' }));
        } else {
            setFormData(prev => ({ ...prev, role: 'PARENT' }));
        }
    }, [roleParam]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:8000/api/users/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                alert("Account created successfully! Please login.");
                navigate('/login');
            } else {
                const data = await response.json();
                // Handle different error formats (Django DRF usually returns object with field keys)
                const errorMsg = Object.values(data).flat().join(', ') || "Signup failed. Please try again.";
                setError(errorMsg);
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const isTeacher = formData.role === 'TEACHER';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Join as a {isTeacher ? 'Tutor' : 'Parent'}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[420px]">
                <div className="bg-white py-8 px-8 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-100">
                    <div className="flex justify-center mb-8">
                         <div className="inline-flex rounded-xl bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'PARENT'})}
                                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${!isTeacher ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Parent
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'TEACHER'})}
                                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${isTeacher ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Tutor
                            </button>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <span className="font-bold">Error:</span>
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="input-field"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                required
                                className="input-field"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input-field"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
