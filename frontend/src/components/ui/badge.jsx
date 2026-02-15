"use client";
import React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = {
    default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
    destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
    outline: "text-slate-950 dark:text-slate-50",
    success: "border-transparent bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
    warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
    info: "border-transparent bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
};

export default function Badge({ className, variant = "default", children, ...props }) {
    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
            badgeVariants[variant],
            className
        )} {...props}>
            {children}
        </div>
    );
}

