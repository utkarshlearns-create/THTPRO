"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import WalletPage from '@/views/WalletPage';

export default function WalletPageRoute() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['PARENT', 'TEACHER']}>
                <WalletPage />
            </ProtectedRoute>
        </>
    );
}



