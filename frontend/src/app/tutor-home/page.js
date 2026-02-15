"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import TutorHome from '@/views/TutorHome';

export default function TutorHomePage() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['TEACHER']}>
                <TutorHome />
            </ProtectedRoute>
        </>
    );
}



