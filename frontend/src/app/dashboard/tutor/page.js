"use client";

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import TutorDashboard from '@/views/TutorDashboard';

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
    </div>
);

export default function TutorDashboardPage() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['TEACHER']}>
                <Suspense fallback={<LoadingSpinner />}>
                    <TutorDashboard />
                </Suspense>
            </ProtectedRoute>
        </>
    );
}


