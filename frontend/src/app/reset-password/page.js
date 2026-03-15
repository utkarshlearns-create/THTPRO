"use client";
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import API_BASE_URL from '../../config';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({ new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid || !token) setError('This reset link is invalid or has expired.');
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.new_password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (formData.new_password !== formData.confirm_password) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/password-reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: formData.new_password }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setTimeout(() => router.push('/login'), 3000); }
      else setError(data.error || 'Something went wrong. Please request a new reset link.');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-4"><div className="p-4 bg-red-100 rounded-full"><XCircle className="h-10 w-10 text-red-500" /></div></div>
      <h2 className="text-xl font-extrabold text-slate-900 mb-3">Invalid Reset Link</h2>
      <p className="text-slate-500 text-sm mb-8">This link is invalid or has expired.</p>
      <Link href="/forgot-password" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700">Request New Link</Link>
    </div>
  );

  if (success) return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-4"><div className="p-4 bg-green-100 rounded-full"><CheckCircle className="h-10 w-10 text-green-600" /></div></div>
      <h2 className="text-xl font-extrabold text-slate-900 mb-3">Password Reset!</h2>
      <p className="text-slate-500 text-sm mb-2">Your password has been updated successfully.</p>
      <p className="text-slate-400 text-xs mb-8">Redirecting to login in 3 seconds...</p>
      <Link href="/login" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700">Go to Login</Link>
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Set New Password</h1>
        <p className="text-slate-500 text-sm">Choose a strong password for your account.</p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error} {error.includes('expired') && <Link href="/forgot-password" className="underline font-semibold">Request a new one.</Link>}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type={showPassword ? 'text' : 'password'} value={formData.new_password} onChange={(e) => setFormData({ ...formData, new_password: e.target.value })} placeholder="Minimum 8 characters" className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type={showPassword ? 'text' : 'password'} value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} placeholder="Re-enter your password" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
        </div>
        {formData.new_password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1,2,3,4].map((l) => (
                <div key={l} className={`h-1 flex-1 rounded-full transition-all ${formData.new_password.length >= l*3 ? l<=2?'bg-red-400':l===3?'bg-yellow-400':'bg-green-500' : 'bg-slate-200'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-400">{formData.new_password.length<6?'Too short':formData.new_password.length<9?'Weak':formData.new_password.length<12?'Good':'Strong'}</p>
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-slate-500 hover:text-indigo-600">Back to Login</Link>
      </div>
    </>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><img src="/logo.png" alt="The Home Tuitions" className="h-12 mx-auto mb-4" /></Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <Suspense fallback={<div className="text-center text-slate-400 py-8">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
