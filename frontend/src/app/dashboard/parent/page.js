"use client";

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParentDashboard from '@/views/ParentDashboard';

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
    </div>
);

export default function ParentDashboardPage() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['PARENT']}>
                <Suspense fallback={<LoadingSpinner />}>
                    <ParentDashboard />
                </Suspense>
            </ProtectedRoute>
        </>
    );
}


