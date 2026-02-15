"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/views/AdminDashboard';

export default function AdminCounsellorDashboardPage() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard mode="counsellor" />
            </ProtectedRoute>
        </>
    );
}



