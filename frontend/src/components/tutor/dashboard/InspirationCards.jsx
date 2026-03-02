"use client";
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Calendar, Wallet, Users, Layout } from 'lucide-react';

const cards = [
    {
        title: "Smart Scheduling",
        description: "Effortlessly manage your classes and calendar with clear daily data.",
        icon: Calendar,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-100 dark:border-blue-900/50"
    },
    {
        title: "Transparent Earnings",
        description: "Keep track of your monthly earnings and payment statuses in real-time.",
        icon: Wallet,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-100 dark:border-green-900/50"
    },
    {
        title: "Matched Students",
        description: "Get smart recommendations based on your profile and target subjects.",
        icon: Users,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-100 dark:border-purple-900/50"
    },
    {
        title: "Resource Sharing",
        description: "Upload and share study materials with students and parents easily.",
        icon: Layout,
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-100 dark:border-amber-900/50"
    }
];

const InspirationCards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <Card key={idx} className={`shadow-premium border-2 ${card.border} hover:scale-[1.02] transition-transform duration-300`}>
                    <CardContent className="p-6">
                        <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-5`}>
                            <card.icon className={`h-7 w-7 ${card.color}`} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default InspirationCards;
