"use client";
import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const MultiSelect = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option) => {
        const newValue = value.includes(option)
            ? value.filter(item => item !== option)
            : [...value, option];
        onChange(newValue);
    };

    const removeOption = (e, option) => {
        e.stopPropagation();
        onChange(value.filter(item => item !== option));
    };

    return (
        <div className="relative" ref={containerRef}>
            <div 
                className="w-full min-h-[42px] px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 cursor-pointer flex flex-wrap items-center gap-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                {value.length === 0 && (
                    <span className="text-slate-400">{placeholder}</span>
                )}
                {value.map(item => (
                    <span 
                        key={item} 
                        className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded text-sm font-medium flex items-center gap-1"
                    >
                        {item}
                        <X 
                            size={14} 
                            className="hover:text-indigo-800 cursor-pointer" 
                            onClick={(e) => removeOption(e, item)} 
                        />
                    </span>
                ))}
                <div className="flex-1 text-right">
                    <ChevronDown size={16} className="text-slate-400 ml-auto" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <div 
                            key={option}
                            className={cn(
                                "px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800",
                                value.includes(option) ? "text-indigo-600 font-medium bg-indigo-50 dark:bg-indigo-900/20" : "text-slate-700 dark:text-slate-300"
                            )}
                            onClick={() => toggleOption(option)}
                        >
                            {option}
                            {value.includes(option) && <Check size={16} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;

