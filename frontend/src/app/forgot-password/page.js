"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import API_BASE_URL from '../../config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/users/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><img src="/logo.png" alt="The Home Tuitions" className="h-12 mx-auto mb-4" /></Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {!submitted ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Forgot your password?</h1>
                <p className="text-slate-500 text-sm leading-relaxed">Enter the email address linked to your account and we'll send you a reset link.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back to Login</Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4"><div className="p-4 bg-green-100 rounded-full"><CheckCircle className="h-10 w-10 text-green-600" /></div></div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">Check your email</h2>
              <p className="text-slate-500 text-sm mb-2">If an account exists for <strong className="text-slate-700">{email}</strong>, a reset link has been sent.</p>
              <p className="text-slate-400 text-xs mb-8">Didn't receive it? Check your spam folder or try again.</p>
              <button onClick={() => { setSubmitted(false); setEmail(''); }} className="text-sm text-indigo-600 hover:underline mr-6">Try a different email</button>
              <Link href="/login" className="text-sm font-semibold text-indigo-600 hover:underline">Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
