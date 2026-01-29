import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { User, GraduationCap } from 'lucide-react';
import API_BASE_URL from '../config';

// NOTE: Replace with your actual Client ID from Google Cloud Console
// Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    otp: ''
  });
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Role Selection Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempGoogleToken, setTempGoogleToken] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = authMethod === 'password' ? '/api/users/login/' : '/api/users/auth/verify-otp/';
    const body = authMethod === 'password' 
        ? { username: formData.phone, password: formData.password }
        : { phone: formData.phone, otp: formData.otp };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        
        let role = data.role;
        if (!role && data.access) {
            const decoded = jwtDecode(data.access);
            role = decoded.role;
        }
        localStorage.setItem('role', role);
        
        console.log('Login successful, role:', role);
        if (role === 'ADMIN') {
            navigate('/dashboard/admin');
        } else if (role === 'TEACHER') {
            navigate('/tutor-home');
        } else {
            navigate('/parent-home');
        }
      } else {
        setError(data.detail || data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    const handleGoogleSuccess = async (credentialResponse, role = null) => {
      setLoading(true);
      setError('');
      try {
          // credentialResponse can be a string (AccessToken) or object (Credential)
          let token;
          if (typeof credentialResponse === 'string') {
              token = credentialResponse;
          } else if (credentialResponse?.credential) {
              token = credentialResponse.credential;
          } else if (credentialResponse?.access_token) {
               token = credentialResponse.access_token;
          }
          
          if (!token) {
              throw new Error("No token received from Google");
          }

          const body = { token };
          if (role) body.role = role;

          const res = await fetch(`${API_BASE_URL}/api/users/auth/google/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
          });
          const data = await res.json();
          
          if (res.ok) {
            if (data.status === 'role_required') {
                setTempGoogleToken(token); // Save token to reuse after role selection
                setShowRoleModal(true);
                setLoading(false);
                return;
            }

            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('role', data.role);
            if (data.role === 'TEACHER') navigate('/tutor-home');
            else navigate('/parent-home');
          } else {
              setError(data.error || data.detail || "Google Login failed.");
          }
      } catch (err) {
          console.error(err);
          setError("Network Error during Google Login");
      } finally { 
          // Only stop loading if we are NOT showing the modal (waiting for user)
          if (!role && !showRoleModal) setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-white flex pt-20 lg:pt-0">
       {/* Left Panel - Trust & Welcome (Hidden on mobile, visible on lg) */}
       <div className="hidden lg:flex w-1/2 bg-indigo-50 relative overflow-hidden flex-col justify-center px-12 xl:px-20 pt-24 pb-60">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.6]" 
                style={{ 
                    backgroundImage: 'linear-gradient(#c7d2fe 1px, transparent 1px), linear-gradient(to right, #c7d2fe 1px, transparent 1px)', 
                    backgroundSize: '32px 32px' 
                }}>
            </div>
            
            <div className="relative z-10 space-y-8 max-w-lg mx-auto text-center lg:text-left">
                <div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-indigo-600 text-sm font-semibold shadow-sm mb-6 border border-indigo-100">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
                            Welcome Back
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                        Continue Your <span className="text-indigo-600">Success Journey</span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Log in to access your personalized dashboard, manage classes, and track progress securely.
                    </p>
                </div>
            </div>
        </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white lg:pt-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mb-10">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign In</h2>
                <p className="mt-2 text-sm text-slate-600">
                    New to The Home Tuitions?{' '}
                    <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Create an account
                    </Link>
                </p>
            </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                  placeholder="+91..."
                />
              </div>
            </div>

            {authMethod === 'password' ? (
                <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                </label>
                <div className="mt-1 relative">
                    <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors pr-10"
                    placeholder="••••••••"
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
                    <div className="text-right mt-1">
                        <button type="button" onClick={() => setAuthMethod('otp')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                             Login with OTP instead
                        </button>
                    </div>
                </div>
                </div>
            ) : (
                <div>
                     {otpSent ? (
                         <div>
                            <label className="block text-sm font-semibold text-slate-700">Enter OTP</label>
                            <input
                                name="otp"
                                type="text"
                                maxLength="6"
                                required
                                value={formData.otp}
                                onChange={handleChange}
                                className="block w-full mt-1 rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="XXXXXX"
                            />
                             <div className="text-right mt-1">
                                <button type="button" onClick={() => setAuthMethod('password')} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                                    Cancel
                                </button>
                            </div>
                         </div>
                     ) : (
                         <div className="mt-4">
                            <p className="text-sm text-slate-600 mb-4">We will send an OTP to your registered number.</p>
                             <div className="text-right">
                                <button type="button" onClick={() => setAuthMethod('password')} className="text-sm font-medium text-slate-500 hover:text-slate-700 mr-4">
                                    Use Password
                                </button>
                            </div>
                         </div>
                     )}
                </div>
            )}

            <div>
              <button
                type={authMethod === 'otp' && !otpSent ? 'button' : 'submit'}
                onClick={authMethod === 'otp' && !otpSent ? handleSendOtp : undefined}
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
              >
                {loading ? 'Processing...' : (authMethod === 'otp' ? (otpSent ? 'Verify & Login' : 'Send OTP') : 'Sign in')}
              </button>
            </div>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
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
          </form>
        </div>
      </div>
            {/* Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Finish Setup</h3>
                        <p className="text-slate-500 mb-6">You are new here! Please select how you want to join.</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleGoogleSuccess(tempGoogleToken, 'PARENT')}
                                className="p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 transition-all flex flex-col items-center gap-3"
                            >
                                <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                                    <User className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-sm">As Parent</span>
                            </button>

                            <button
                                onClick={() => handleGoogleSuccess(tempGoogleToken, 'TEACHER')}
                                className="p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 transition-all flex flex-col items-center gap-3"
                            >
                                <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-sm">As Tutor</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default Login;
