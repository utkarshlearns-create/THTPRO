"use client";

import { ThemeProvider } from '@/context/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import { installApiFetchInterceptor } from '@/utils/auth';

export default function Providers({ children }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        installApiFetchInterceptor();
    }, []);

    return (
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={clientId || "dummy_client_id_to_prevent_crash"}>
                <ThemeProvider>
                    {children}
                    <Toaster position="top-right" />
                </ThemeProvider>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    );
}
