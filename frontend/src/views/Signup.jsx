"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, GraduationCap, CheckCircle, ShieldCheck, Clock, Shield, Sparkles, AlertTriangle, Eye, EyeOff, Wallet } from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import GoogleLoginButton from '../components/GoogleLoginButton';
import API_BASE_URL from '../config';
import { Button } from '../components/ui/button';

// NOTE: Replace with your actual Client ID
// Google Client ID from environment variables
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const Signup = () => {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        name: '',
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
            // Backend expects username (used for login). We set username=phone so users login with phone.
            let body = {
                username: formData.phone,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
                first_name: formData.name,
            };

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
                
                // Auto-login logic for both Password and OTP methods
                // Check if access token exists
                if (data.access && data.refresh) {
                    localStorage.setItem('access', data.access);
                    localStorage.setItem('refresh', data.refresh);
                    localStorage.setItem('role', data.role);
                    
                    // Small delay for UX
                    setTimeout(() => {
                        router.push(data.role === 'TEACHER' ? '/tutor-home' : '/parent-home');
                    }, 500);
                } else {
                     // Fallback if no tokens (should not happen with new backend update)
                     alert("Account created! Please login.");
                     router.push('/login');
                }
            } else {
                const data = await response.json();
                const errorMsg = data.detail || (typeof data === 'object' ? Object.values(data).flat().join(', ') : "Signup failed.");
                setError(errorMsg);
            }
        } catch (err) {
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
            if (data.role === 'TEACHER') router.push('/tutor-home');
            else router.push('/parent-home');
          } else {
              setError(data.error || data.detail || "Google Signup failed.");
          }
      } catch {
          setError("Network Error during Google Signup");
      } finally { setLoading(false); }
    };

    const role = formData.role.toLowerCase(); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Dynamic content configuration
    const content = role === 'teacher' ? {
        badge: "Join Active Tutors",
        title: "Share Your Knowledge, ",
        highlight: "Earn Respect",
        desc: "Join India's fastest growing network of home tutors and start earning.",
        features: [
            {
                icon: <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
                bg: "bg-indigo-100 dark:bg-indigo-900/50",
                title: "Zero Commission",
                desc: "Keep 100% of what you earn from students."
            },
            {
                icon: <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />,
                bg: "bg-green-100 dark:bg-green-900/50",
                title: "Flexible Schedule",
                desc: "Teach at your own preferred timings."
            }
        ]
    } : {
        badge: "Join 10,000+ Learners",
        title: "Start Your ",
        highlight: "Learning Journey",
        desc: "Get access to verified tutors, smart tracking, and personalized learning plans.",
        features: [
            {
                icon: <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
                bg: "bg-indigo-100 dark:bg-indigo-900/50",
                title: "100% Verified Tutors",
                desc: "Every tutor is ID checked for safety."
            },
            {
                icon: <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />,
                bg: "bg-green-100 dark:bg-green-900/50",
                title: "Free Demo Class",
                desc: "Try before you hire. No commitment."
            }
        ]
    };

    return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex pt-20 lg:pt-0 transition-colors duration-300">
      
      {/* Left Panel - Trust / Promo (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-indigo-50 dark:bg-slate-900 relative overflow-hidden flex-col justify-center px-12 xl:px-20 pt-24 pb-60">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.6]" 
                style={{ 
                    backgroundImage: 'linear-gradient(#c7d2fe 1px, transparent 1px), linear-gradient(to right, #c7d2fe 1px, transparent 1px)', 
                    backgroundSize: '32px 32px' 
                }}>
            </div>
            
             <div className="relative z-10 space-y-8 max-w-lg mx-auto text-center lg:text-left">
                <div>
                     <div className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold shadow-sm mb-6 border border-indigo-100 dark:border-slate-700">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2"></span>
                            {content.badge}
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                        {content.title} <span className="text-indigo-600 dark:text-indigo-400">{content.highlight}</span> Today
                    </h1>
                     <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                        {content.desc}
                    </p>
                </div>

                 <div className="space-y-4 pt-4">
                     <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 dark:border-slate-700/50 shadow-sm">
                         <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                             <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                         </div>
                         <div className="text-left">
                             <h3 className="font-bold text-slate-900 dark:text-white">100% Verified Tutors</h3>
                             <p className="text-sm text-slate-600 dark:text-slate-400">Every tutor is ID checked for safety.</p>
                         </div>
                     </div>
                      <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 dark:border-slate-700/50 shadow-sm">
                         <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                             <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                         </div>
                         <div className="text-left">
                             <h3 className="font-bold text-slate-900 dark:text-white">Free Demo Class</h3>
                             <p className="text-sm text-slate-600 dark:text-slate-400">Try before you hire. No commitment.</p>
                         </div>
                     </div>
                </div>
            </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-slate-950 lg:pt-24 transition-colors duration-300">
        <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-8">
                <button
                    type="button"
                    onClick={() => handleRoleChange('PARENT')}
                     className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        role === 'parent'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                    <User className="h-4 w-4" />
                    I'm a Parent
                </button>
                 <button
                    type="button"
                    onClick={() => handleRoleChange('TEACHER')}
                    className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        role === 'teacher'
                             ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                    <GraduationCap className="h-4 w-4" />
                    I'm a Tutor
                </button>
            </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
               <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 text-slate-900 dark:text-white dark:bg-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                        placeholder="e.g. Rahul Verma"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                        name="phone"
                        type="text"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 text-slate-900 dark:text-white dark:bg-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                        placeholder="+91..."
                    />
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    <div className="relative mt-1">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
                             className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 text-slate-900 dark:text-white dark:bg-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors pr-10"
                            placeholder="Create a strong password"
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                        >
                             {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-start">
               <div className="flex h-5 items-center">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                    />
               </div>
               <div className="ml-3 text-sm">
                   <label htmlFor="terms" className="font-medium text-slate-600 dark:text-slate-400">
                       I agree to the <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Terms</a> and <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Privacy Policy</a>
                   </label>
               </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              {loading ? (
                  <span className="flex items-center gap-2">
                       <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Creating Account...
                  </span>
              ) : 'Create Account'}
            </button>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                 <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400">Or sign up with</span>
                </div>
            </div>

            {GOOGLE_CLIENT_ID ? (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={setError} text="Sign up with Google" />
                </GoogleOAuthProvider>
            ) : (
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    (Google Login requires valid Client ID)
                </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;




