"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserPackagesPage from '@/views/UserPackagesPage';

export default function PackagesPageRoute() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['PARENT', 'TEACHER']}>
                <UserPackagesPage />
            </ProtectedRoute>
        </>
    );
}



