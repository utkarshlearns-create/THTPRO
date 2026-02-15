"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import TutorKYCPage from '@/views/TutorKYCPage';

export default function TutorKYCRoute() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['TEACHER']}>
                <TutorKYCPage />
            </ProtectedRoute>
        </>
    );
}



