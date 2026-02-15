"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ allowedRoles, children, loginPath = "/login" }) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access');

        if (!token) {
            router.replace(loginPath);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const userRole = decoded.role || localStorage.getItem('role');

            if (!allowedRoles.includes(userRole) && !allowedRoles.includes(userRole?.toUpperCase())) {
                // Role mismatch - redirect based on their actual role
                if (userRole === 'TEACHER') router.replace('/tutor-home');
                else if (userRole === 'ADMIN') router.replace('/dashboard/admin');
                else if (userRole === 'SUPERADMIN') router.replace('/superadmin');
                else router.replace('/parent-home');
            }
        } catch (error) {
            localStorage.clear();
            router.replace(loginPath);
        }
    }, [allowedRoles, loginPath, router]);

    // Check synchronously for rendering
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access');
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            const userRole = decoded.role || localStorage.getItem('role');
            if (allowedRoles.includes(userRole) || allowedRoles.includes(userRole?.toUpperCase())) {
                return children;
            }
        } catch {
            return null;
        }
    }

    return null;
}
