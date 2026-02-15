"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';

export default function SuperAdminLayoutWrapper({ children }) {
    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']} loginPath="/superadmin/login">
            <SuperAdminLayout>
                {children}
            </SuperAdminLayout>
        </ProtectedRoute>
    );
}
