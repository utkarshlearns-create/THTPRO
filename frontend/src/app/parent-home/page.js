"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParentHome from '@/views/ParentHome';

export default function ParentHomePage() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentHome />
            </ProtectedRoute>
        </>
    );
}



