"use client";

import { ThemeProvider } from '@/context/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                {children}
                <Toaster position="top-right" />
            </ThemeProvider>
        </ErrorBoundary>
    );
}
