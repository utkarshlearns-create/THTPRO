import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { User, GraduationCap, CheckCircle, ShieldCheck, Clock, Shield } from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import GoogleLoginButton from '../components/GoogleLoginButton';
import API_BASE_URL from '../config';
import { Button } from '../components/ui/button';

// NOTE: Replace with your actual Client ID
// Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Signup = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const roleParam = searchParams.get('role');
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        password: '',
        role: 'PARENT', // Default
        otp: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [signupMethod, setSignupMethod] = useState('password'); // 'password' | 'otp'
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        if (roleParam === 'teacher') {
            setFormData(prev => ({ ...prev, role: 'TEACHER' }));
        } else {
            setFormData(prev => ({ ...prev, role: 'PARENT' }));
        }
    }, [roleParam]);

    const handleRoleChange = (newRole) => {
        setFormData(prev => ({ ...prev, role: newRole }));
        // Update URL to reflect change
        setSearchParams({ role: newRole === 'TEACHER' ? 'teacher' : 'parent' });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!formData.phone) return setError("Please enter your phone number.");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/auth/send-otp/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone })
            });
            if (res.ok) {
                setOtpSent(true);
                setError("");
                alert("OTP sent to your phone (Check console for mock OTP)");
            } else {
                setError("Failed to send OTP.");
            }
        } catch { setError("Network error sending OTP."); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            let endpoint = '/api/users/signup/';
            let body = formData;

            if (signupMethod === 'otp') {
                endpoint = '/api/users/auth/verify-otp/';
                body = { phone: formData.phone, otp: formData.otp, role: formData.role };
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("Signup/Verify Response Data:", data); // DEBUG LOG
                
                // Auto-login logic for both Password and OTP methods
                // Check if access token exists
                if (data.access && data.refresh) {
                    console.log("Tokens found, logging in...");
                    localStorage.setItem('access', data.access);
                    localStorage.setItem('refresh', data.refresh);
                    localStorage.setItem('role', data.role);
                    
                    // Small delay for UX
                    setTimeout(() => {
                        navigate(data.role === 'TEACHER' ? '/tutor-home' : '/parent-home');
                    }, 500);
                } else {
                     // Fallback if no tokens (should not happen with new backend update)
                     alert("Account created! Please login.");
                     navigate('/login');
                }
            } else {
                const data = await response.json();
                const errorMsg = data.detail || (typeof data === 'object' ? Object.values(data).flat().join(', ') : "Signup failed.");
                setError(errorMsg);
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
      setLoading(true);
      try {
          let token;
          if (typeof credentialResponse === 'string') token = credentialResponse;
          else if (credentialResponse?.credential) token = credentialResponse.credential;
          else if (credentialResponse?.access_token) token = credentialResponse.access_token;

          if (!token) throw new Error("No token received");

          const res = await fetch(`${API_BASE_URL}/api/users/auth/google/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, role: formData.role })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('role', data.role);
            if (data.role === 'TEACHER') navigate('/tutor-home');
            else navigate('/parent-home');
          } else {
              setError(data.error || data.detail || "Google Signup failed.");
          }
      } catch {
          setError("Network Error during Google Signup");
      } finally { setLoading(false); }
    };

    const isTeacher = formData.role === 'TEACHER';

    // beneficial content for left panel
    const content = isTeacher ? {
        badge: "Join 500+ Top Tutors",
        headline: <>Share Knowledge & <span className="text-indigo-600">Earn Respect</span></>,
        subhead: "Teach students from the comfort of your home or nearby.",
        benefits: [
            { icon: <ShieldCheck className="w-5 h-5" />, title: "Guaranteed Payments", desc: "Timely payments for your hard work" },
            { icon: <Clock className="w-5 h-5" />, title: "Flexible Schedule", desc: "Be your own boss, choose your timings" },
            { icon: <User className="w-5 h-5" />, title: "Zero Commission", desc: "Keep 100% of what you earn (limited time)" }
        ],
        colors: { tag: "text-indigo-600", bg: "bg-indigo-50" }
    } : {
        badge: "Trusted by 1000+ Parents",
        headline: <>Unlock Your Child's True Potential with <span className="text-indigo-600">Best Home Tutors</span></>,
        subhead: "Join India's most trusted tutoring community. Quality education at your doorstep.",
        benefits: [
            { icon: <ShieldCheck className="w-5 h-5" />, title: "100% Verified Tutors", desc: "Every tutor goes through a background check" },
            { icon: <Clock className="w-5 h-5" />, title: "Free Demo Class", desc: "Try before you commit. No questions asked." },
            { icon: <Shield className="w-5 h-5" />, title: "No Spam Assurance", desc: "Your contact verification is secure with us." }
        ],
        colors: { tag: "text-green-600", bg: "bg-green-50" }
    };

    return (
        <div className="min-h-screen bg-white flex pt-20 lg:pt-0">
            {/* Left Panel - Trust & Benefits (Hidden on mobile, visible on lg) */}
            <div className="hidden lg:flex w-1/2 bg-indigo-50 relative overflow-hidden flex-col justify-center px-12 xl:px-20 pt-24 pb-60">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.4]" 
                     style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                </div>
                
                <div className="relative z-10 space-y-8 max-w-lg mx-auto">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-indigo-600 text-sm font-semibold shadow-sm mb-6 border border-indigo-100">
                             <ShieldCheck className="w-4 h-4 mr-2" />
                             {content.badge}
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                            {content.headline}
                        </h1>
                        <p className="mt-4 text-lg text-slate-600">
                            {content.subhead}
                        </p>
                    </div>

                    <div className="space-y-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-indigo-50/50">
                        {content.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mt-1">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                                    <p className="text-sm text-slate-500">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white lg:pt-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    {/* Role Selection Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('PARENT')}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 text-center ${
                                !isTeacher 
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                                : 'border-slate-100 hover:border-slate-300 text-slate-500'
                            }`}
                        >
                            <div className={`p-2 rounded-full ${!isTeacher ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                <User className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-sm">Join as Parent</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleChange('TEACHER')}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 text-center ${
                                isTeacher 
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                                : 'border-slate-100 hover:border-slate-300 text-slate-500'
                            }`}
                        >
                            <div className={`p-2 rounded-full ${isTeacher ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-sm">Join as Tutor</span>
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                                    placeholder="Enter your full name"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                                Phone Number
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {signupMethod === 'password' && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors pr-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
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
                        </div>
                        )}

                        <div>
                            <button
                                type={signupMethod === 'otp' && !otpSent ? 'button' : 'submit'}
                                onClick={signupMethod === 'otp' && !otpSent ? handleSendOtp : undefined}
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                                }`}
                            >
                                {loading ? 'Processing...' : (signupMethod === 'otp' ? (otpSent ? 'Verify & Create Account' : 'Send OTP') : 'Create Free Account')}
                            </button>

                            {/* OTP Toggle */}
                            <div className="text-center mt-3">
                                {signupMethod === 'password' ? (
                                    <button type="button" onClick={() => setSignupMethod('otp')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                        Continue with OTP instead
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => setSignupMethod('password')} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
                                        Use Password
                                    </button>
                                )}
                            </div>

                            {/* OTP Input Conditional */}
                            {signupMethod === 'otp' && otpSent && (
                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-slate-700">Enter OTP</label>
                                    <input
                                        name="otp"
                                        type="text"
                                        maxLength="6"
                                        required
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                        className="block w-full mt-1 rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="XXXXXX"
                                    />
                                </div>
                            )}

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">Or sign up with</span>
                                </div>
                            </div>

                            {GOOGLE_CLIENT_ID ? (
                                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                                    <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={setError} />
                                </GoogleOAuthProvider>
                            ) : (
                                <div className="text-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    (Google Login requires valid Client ID)
                                </div>
                            )}
                            <p className="mt-4 text-center text-xs text-slate-500">
                                By signing up, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
