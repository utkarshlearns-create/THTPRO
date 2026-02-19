"use client";
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils'; // Assuming cn exists, if not I will use template literals but cn is standard in shadcn-like setups

export default function ThemeToggle({ className }) {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by rendering a placeholder until mounted
    if (!mounted) {
        return (
            <button
                className={cn(
                    "p-2 rounded-lg transition-colors duration-200 flex items-center justify-center border",
                    "bg-slate-100 border-slate-200 text-slate-700",
                    "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200",
                    "hover:bg-slate-200 dark:hover:bg-slate-700",
                    className
                )}
                aria-label="Toggle theme"
            >
                <div className="w-5 h-5" /> {/* Placeholder size of icon */}
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "p-2 rounded-lg transition-colors duration-200 flex items-center justify-center border",
                "bg-slate-100 border-slate-200 text-slate-700",
                "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200",
                "hover:bg-slate-200 dark:hover:bg-slate-700",
                className
            )}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-400 fill-current" />
            ) : (
                <Moon size={20} className="text-slate-700 fill-current" />
            )}
        </button>
    );
}

