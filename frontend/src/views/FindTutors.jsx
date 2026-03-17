"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, BookOpen, GraduationCap, Monitor, Star, Clock, IndianRupee, Globe, ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TutorCard from '../components/tutor/TutorCard';
import { LOCATION_DATA } from '../constants/locations';

const FindTutors = () => {
    const router = useRouter();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        q: '',
        subject: '',
        class: '', 
        state: 'Uttar Pradesh', // Default to UP
        city: 'Lucknow',        // Default to Lucknow
        locality: '',
        mode: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const SUBJECTS = [
        "Mathematics", "Physics", "Chemistry", "Biology", "Science", 
        "English", "Hindi", "Sanskrit", "Regional Languages",
        "Social Science", "History", "Geography", "Civics", "Political Science", 
        "Computer Science", "Information Technology", "Coding",
        "Accountancy", "Business Studies", "Economics", "Commerce",
        "EVS (Environmental Studies)", "Psychology", "Sociology", "Physical Education"
    ];
    const CLASSES = ["Nursery/Preschool", "Class 1-5", "Class 6-8", "Class 9", "Class 10", "Class 11", "Class 12", "IIT-JEE/NEET"];
    const [showFilters, setShowFilters] = useState(false);

    // Fetch tutors when filters change (debounced)
    useEffect(() => {
        const fetchTutors = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('access');
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const queryParams = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });
                queryParams.append('page', currentPage);

                const response = await fetch(`${API_BASE_URL}/api/users/tutors/search/?${queryParams.toString()}`, {
                    headers: headers,
                    cache: 'no-store'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.results && Array.isArray(data.results)) {
                        setTutors(data.results);
                        setTotalPages(Math.ceil((data.count || 0) / 20));
                    } else if (Array.isArray(data)) {
                        setTutors(data);
                        setTotalPages(1);
                    } else {
                        setTutors([]);
                        setTotalPages(1);
                    }
                } else if (response.status === 401) {
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error("Error fetching tutors:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchTutors();
        }, 500);

        return () => clearTimeout(timer);
    }, [filters, currentPage]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const [areaSuggestions, setAreaSuggestions] = useState([]);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

    useEffect(() => {
        if (!filters.locality || filters.locality.length < 3 || !showAreaSuggestions) {
            setAreaSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingArea(true);
            try {
                const query = `${filters.locality}, ${filters.city || 'Lucknow'}`;
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
                    { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const filtered = data.map(item => {
                        const addr = item.address;
                        const areaName = addr.suburb || addr.neighbourhood || addr.city_district || addr.road || addr.village;
                        const mainPart = areaName ? `${areaName}` : item.display_name.split(',')[0];
                        return { display_name: mainPart };
                    });
                    const unique = Array.from(new Set(filtered.map(a => a.display_name)))
                        .map(name => filtered.find(a => a.display_name === name));
                    setAreaSuggestions(unique);
                }
            } catch (err) {
                console.error("Nominatim error:", err);
            } finally {
                setIsSearchingArea(false);
            }
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [filters.locality, filters.city, showAreaSuggestions]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
            <div 
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: "url('/find-tutors-bg.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.8
                }}
            >
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-[20px]"></div>
            </div>

            <div className="relative z-10 font-sans">
                <Navbar />
                
                <main className="container mx-auto px-4 py-24">
                <div className="mb-12 max-w-4xl mx-auto text-center relative z-20">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                        Connect. Learn. Excel.
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl mb-10 font-medium">Discover Your Ideal Tutor Today.</p>
                    
                    <div className="relative max-w-3xl mx-auto shadow-2xl shadow-indigo-500/10 dark:shadow-none rounded-2xl">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            name="q"
                            value={filters.q}
                            onChange={handleFilterChange}
                            className="block w-full pl-14 pr-32 py-5 border border-white/50 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white text-lg placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                            placeholder="Search for subject or skill..."
                        />
                         <button 
                            className="absolute inset-y-2 right-2 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-bold shadow-md shadow-indigo-600/20 tracking-wide text-sm hidden md:flex items-center justify-center hover:-translate-y-0.5"
                        >
                            Search
                        </button>
                        <button 
                            className="absolute inset-y-2 right-2 px-4 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-bold md:hidden"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto relative z-20">
                    <FilterDrawer 
                        isOpen={showFilters} 
                        setIsOpen={setShowFilters} 
                        filters={filters} 
                        handleFilterChange={handleFilterChange} 
                        setFilters={setFilters} 
                        SUBJECTS={SUBJECTS}
                        CLASSES={CLASSES}
                        LOCATION_DATA={LOCATION_DATA}
                        isSearchingArea={isSearchingArea}
                        areaSuggestions={areaSuggestions}
                        showAreaSuggestions={showAreaSuggestions}
                        setShowAreaSuggestions={setShowAreaSuggestions}
                    />

                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                {tutors.length} Value Tutors Found
                            </h2>
                        </div>

                        {loading ? (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : Array.isArray(tutors) && tutors.length > 0 ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {tutors.map(tutor => (
                                        <TutorCard key={tutor.id} tutor={tutor} />
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                if (totalPages > 7 && page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                                                    if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="px-2 text-slate-400">...</span>;
                                                    return null;
                                                }
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${currentPage === page ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <Search className="h-10 w-10 text-slate-400 mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tutors found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
};

const FilterDrawer = ({ isOpen, setIsOpen, ...props }) => {
    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] md:hidden">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.aside 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm tracking-widest uppercase">
                                        <Filter size={16} className="text-indigo-600 dark:text-indigo-400" /> Filters
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>
                                <FilterContent {...props} />
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            <aside className="hidden md:block md:w-72 flex-shrink-0">
                <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/50 dark:border-white/10 sticky top-24 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold text-sm tracking-widest uppercase">
                        <Filter size={16} className="text-indigo-600 dark:text-indigo-400" /> Filters
                    </div>
                    <FilterContent {...props} />
                </div>
            </aside>
        </>
    );
};

const FilterContent = ({ filters, handleFilterChange, setFilters, SUBJECTS, CLASSES, LOCATION_DATA, isSearchingArea, areaSuggestions, showAreaSuggestions, setShowAreaSuggestions }) => (
    <div className="space-y-6">
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Subject</label>
            <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                    name="subject"
                    value={filters.subject}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
                >
                    <option value="">Any Subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Class / Grade</label>
            <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                    name="class"
                    value={filters.class}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
                >
                    <option value="">Any Class</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">State</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                    name="state"
                    value={filters.state}
                    onChange={(e) => {
                        const newState = e.target.value;
                        setFilters(prev => ({ 
                            ...prev, 
                            state: newState, 
                            city: Object.keys(LOCATION_DATA[newState] || {})[0] || '',
                            locality: '' 
                        }));
                    }}
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
                >
                    <option value="">Select State</option>
                    {Object.keys(LOCATION_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">City</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                    name="city"
                    value={filters.city}
                    onChange={(e) => {
                        const newCity = e.target.value;
                        setFilters(prev => ({ 
                            ...prev, 
                            city: newCity, 
                            locality: '' 
                        }));
                    }}
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
                    disabled={!filters.state}
                >
                    <option value="">Select City</option>
                    {filters.state && Object.keys(LOCATION_DATA[filters.state] || {}).map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Area / Locality</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                <input
                    type="text"
                    name="locality"
                    value={filters.locality}
                    onChange={(e) => {
                        handleFilterChange(e);
                        setShowAreaSuggestions(true);
                    }}
                    onFocus={() => setShowAreaSuggestions(true)}
                    placeholder="Search Area..."
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold transition-all shadow-sm"
                    autoComplete="off"
                />
                {isSearchingArea && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                )}
                {showAreaSuggestions && areaSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                        {areaSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    handleFilterChange({ target: { name: 'locality', value: suggestion.display_name } });
                                    setShowAreaSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-3 text-xs"
                            >
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span>{suggestion.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Teaching Mode</label>
            <div className="relative">
                <Monitor className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                    name="mode"
                    value={filters.mode}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
                >
                    <option value="">Any Mode</option>
                    <option value="HOME">Home Tuition</option>
                    <option value="ONLINE">Online</option>
                    <option value="BOTH">Both</option>
                </select>
            </div>
        </div>

        <button 
            onClick={() => setFilters({ q: '', subject: '', class: '', state: 'Uttar Pradesh', city: 'Lucknow', locality: '', mode: '' })}
            className="w-full mt-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white font-bold transition-all border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 backdrop-blur-sm"
        >
            Reset Filters
        </button>
    </div>
);

export default FindTutors;
