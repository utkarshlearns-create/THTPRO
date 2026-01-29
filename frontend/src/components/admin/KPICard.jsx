import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function KPICard({ title, value, icon: Icon, gradient, pulse }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
                "relative overflow-hidden rounded-2xl p-6 text-white shadow-lg",
                gradient
            )}
        >
            {/* Background Pattern/Glow */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/20 blur-xl"></div>
            
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight">{value}</span>
                        {pulse && (
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </motion.div>
    );
}
