import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles, children }) => {
    const token = localStorage.getItem('access');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role;

        if (allowedRoles.includes(userRole)) {
            return children || <Outlet />;
        } else {
            // Role mismatch - redirect based on their actual role to prevent "stuck" states
            // Role mismatch - redirect based on their actual role to prevent "stuck" states
            if (userRole === 'TEACHER') return <Navigate to="/dashboard/tutor" replace />;
            if (userRole === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
            return <Navigate to="/dashboard/parent" replace />;
        }
    } catch (error) {
        // Invalid token
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;
