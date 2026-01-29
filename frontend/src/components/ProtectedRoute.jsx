import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles, children, loginPath = "/login" }) => {
    const token = localStorage.getItem('access');

    if (!token) {
        return <Navigate to={loginPath} replace />;
    }

    try {
        const decoded = jwtDecode(token);
        // Fallback to localStorage if role is missing in token (during migration/fixes)
        const userRole = decoded.role || localStorage.getItem('role');

        if (allowedRoles.includes(userRole) || allowedRoles.includes(userRole.toUpperCase())) {
            return children || <Outlet />;
        } else {
            // Role mismatch - redirect based on their actual role to prevent "stuck" states
            if (userRole === 'TEACHER') return <Navigate to="/tutor-home" replace />;
            if (userRole === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
            if (userRole === 'SUPERADMIN') return <Navigate to="/superadmin" replace />;
            return <Navigate to="/parent-home" replace />;
        }
    } catch (error) {
        // Invalid token
        localStorage.clear();
        return <Navigate to={loginPath} replace />;
    }
};

export default ProtectedRoute;
