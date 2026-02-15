"use client";

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Signup from '@/views/Signup';

export default function SignupPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>}>
                <Signup />
            </Suspense>
        </>
    );
}


