"use client";
import React from 'react';
import { CheckCircle } from 'lucide-react';

const VerificationBadge = ({ size = 'sm', showText = true }) => {
    const sizes = {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    const textSizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
            <CheckCircle className={sizes[size]} />
            {showText && <span className={textSizes[size]}>Verified</span>}
        </span>
    );
};

export default VerificationBadge;

