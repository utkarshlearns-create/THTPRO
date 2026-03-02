"use client";
import React from 'react';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';

const testimonials = [
    {
        name: "Sarah J.",
        role: "Science Tutor",
        content: "I used the thtpro module to help students and track my progress. It has been a game changer for my teaching career.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
        name: "David L.",
        role: "English Tutor",
        content: "The thtpro module is hard to beat when it comes to managing tuitions and finding the right students.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
        name: "Michael R.",
        role: "Maths Tutor",
        content: "Transparent earnings and smart scheduling have made my life so much easier. Highly recommended!",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    }
];

const TutorTestimonials = () => {
    return (
        <div className="py-12">
            <h2 className="text-3xl font-black text-center mb-16 text-slate-900 dark:text-white">Hear from our Tutors</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, idx) => (
                    <Card key={idx} className="shadow-premium border-none rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 hover:scale-[1.02] transition-transform overflow-hidden">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{t.role}</p>
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 italic">"{t.content}"</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TutorTestimonials;
