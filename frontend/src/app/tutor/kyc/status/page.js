"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import KYCStatusDashboard from '@/components/tutor/kyc/KYCStatusDashboard';

export default function KYCStatusRoute() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['TEACHER']}>
                <KYCStatusDashboard />
            </ProtectedRoute>
        </>
    );
}


