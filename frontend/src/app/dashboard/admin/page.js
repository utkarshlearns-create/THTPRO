"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/views/AdminDashboard';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function AdminDashboardPage() {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setRole(decoded.role || localStorage.getItem('role'));
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
    }, []);

    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['COUNSELLOR', 'TUTOR_ADMIN']}>
                <AdminDashboard mode={role} />
            </ProtectedRoute>
        </>
    );
}



