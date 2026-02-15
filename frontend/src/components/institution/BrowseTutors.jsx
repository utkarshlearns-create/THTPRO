
"use client";
import React, { useState, useEffect } from 'react';
import { Search, MapPin, BookOpen, Star, Filter } from 'lucide-react';
import API_BASE_URL from '../../config';

const BrowseTutors = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTutors();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            let url = `${API_BASE_URL}/api/users/institution/tutors/`;
            if (searchTerm) {
                url += `?q=${encodeURIComponent(searchTerm)}`;
            }
            
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setTutors(data);
            }
        } catch (error) {
            console.error("Error fetching tutors:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Tutors</h2>
                
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name, subject, or location..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : tutors.length === 0 ? (
                <div className="text-center py-20">
                     <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-slate-400" size={24} />
                     </div>
                     <h3 className="text-lg font-medium text-slate-900 dark:text-white">No tutors found</h3>
                     <p className="text-slate-500">Try adjusting your search terms.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutors.map(tutor => (
                        <div key={tutor.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg overflow-hidden">
                                        {tutor.photo ? (
                                            <img src={tutor.photo} alt={tutor.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            tutor.full_name?.charAt(0) || 'T'
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{tutor.full_name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full w-fit mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            Verified
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                                    <BookOpen size={18} />
                                </div>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <BookOpen size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                                    <span className="line-clamp-1">{tutor.subjects?.join(', ') || 'Various Subjects'}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <MapPin size={16} className="mt-0.5 shrink-0 text-red-500" />
                                    <span className="line-clamp-1">{tutor.city || 'Location not set'}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-2 min-h-[40px]">
                                    {tutor.about || "Experienced tutor passionate about teaching students."}
                                </p>
                            </div>

                            <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300">
                                View Profile
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseTutors;
