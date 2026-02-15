"use client";
import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-500/20",
        outline: "border border-blue-200 dark:border-slate-700 bg-transparent hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-700 dark:text-slate-200",
        ghost: "hover:bg-blue-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white",
        glass: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10",
        sapphire: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] border border-indigo-400/20"
    };

    const sizes = {
        default: "h-11 px-8 py-2 rounded-xl",
        sm: "h-9 px-4 rounded-lg text-sm",
        lg: "h-12 px-10 rounded-xl text-lg",
        icon: "h-10 w-10 text-xl" // Centered icon
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});
Button.displayName = "Button";

export { Button };

