"use client";

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import MyPostedJobs from '@/views/MyPostedJobs';

export default function MyJobsPageRoute() {
    return (
        <>
            <Navbar />
            <ProtectedRoute allowedRoles={['PARENT']}>
                <MyPostedJobs />
            </ProtectedRoute>
        </>
    );
}



