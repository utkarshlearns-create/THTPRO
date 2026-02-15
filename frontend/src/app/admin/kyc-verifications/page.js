"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminKYCPage from '@/views/AdminKYCPage';

export default function AdminKYCRoute() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminKYCPage />
            </ProtectedRoute>
        </>
    );
}



