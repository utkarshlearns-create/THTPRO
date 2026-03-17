"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, BookOpen, GraduationCap, Monitor, X, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from '../components/jobs/JobCard';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';

const JobSearch = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextUrl, setNextUrl] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const [filters, setFilters] = useState({
        q: '',
        subject: '',
        grade: '',
        location: '',
        min_budget: '',
        mode: '',
        board: '',
        gender: ''
    });
    const [subjects, setSubjects] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch master data
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/jobs/master/subjects/`);
                if (response.ok) {
                    const data = await response.json();
                    setSubjects(data.results || data || []);
                }
            } catch (error) {
                console.error("Error fetching master data:", error);
            }
        };
        fetchMasterData();
    }, []);

    const fetchJobs = async (isLoadMore = false) => {
        if (isLoadMore) {
            if (!nextUrl) return;
            setLoadingMore(true);
        } else {
            setLoading(true);
            setJobs([]);
        }

        try {
            let url = '';
            if (isLoadMore && nextUrl) {
                url = nextUrl;
            } else {
                const queryParams = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });
                url = `${API_BASE_URL}/api/jobs/search/?${queryParams.toString()}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                
                let newJobs = [];
                let next = null;
                let count = 0;

                if (data.results && Array.isArray(data.results)) {
                    newJobs = data.results;
                    next = data.next;
                    count = data.count;
                } else if (Array.isArray(data)) {
                    newJobs = data;
                    next = null;
                    count = data.length;
                }

                if (isLoadMore) {
                    setJobs(prev => [...prev, ...newJobs]);
                } else {
                    setJobs(newJobs);
                }
                
                setNextUrl(next);
                setTotalCount(count);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Fetch jobs when filters change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchJobs(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
            <Navbar />
            
            <main className="container mx-auto px-4 py-12 md:py-16">
                {/* Header & Search */}
                <div className="mb-12 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                        Find Your Next Tutoring Job
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">Browse hundreds of active tutoring opportunities in your area.</p>
                    
                    <div className="relative max-w-2xl mx-auto shadow-2xl shadow-indigo-500/10 dark:shadow-none">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            name="q"
                            value={filters.q}
                            onChange={handleFilterChange}
                            className="block w-full pl-14 pr-32 py-5 border border-white/50 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white text-lg placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                            placeholder="Search by keywords (e.g. 'Maths Class 10')"
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
                            <SlidersHorizontal size={16} /> Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
                    <FilterDrawer 
                        isOpen={showFilters} 
                        setIsOpen={setShowFilters} 
                        filters={filters} 
                        handleFilterChange={handleFilterChange} 
                        setFilters={setFilters}
                        subjects={subjects}
                    />

                    {/* Results Grid */}
                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                                    {totalCount} Results Found
                                </h2>
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Newest
                                </span>
                            </div>
                        </div>

                        {loading ? (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : Array.isArray(jobs) && jobs.length > 0 ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {jobs.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                                
                                {nextUrl && (
                                    <div className="flex justify-center pt-8">
                                        <button
                                            onClick={() => fetchJobs(true)}
                                            disabled={loadingMore}
                                            className="px-10 py-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl text-slate-700 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1"
                                        >
                                            {loadingMore ? (
                                                <div className="animate-spin h-5 w-5 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    Load More Results
                                                    <ChevronDown size={20} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No jobs found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any tutoring jobs matching your criteria. Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const FilterDrawer = ({ isOpen, setIsOpen, ...props }) => {
    return (
        <>
            {/* Mobile Filters Overlay */}
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

            {/* Desktop Filters Sidebar */}
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

const FilterContent = ({ filters, handleFilterChange, setFilters, subjects }) => (
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
                    {Array.isArray(subjects) && subjects.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    {(!subjects || !Array.isArray(subjects) || !subjects.length) && (
                        <>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Science">Science</option>
                            <option value="English">English</option>
                        </>
                    )}
                </select>
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Class / Grade</label>
            <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                    name="grade"
                    value={filters.grade}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
                >
                    <option value="">Any Class</option>
                    <option value="Class 1-5">Class 1-5</option>
                    <option value="Class 6-8">Class 6-8</option>
                    <option value="Class 9-10">Class 9-10</option>
                    <option value="Class 11-12">Class 11-12</option>
                </select>
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Location</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="e.g. Mumbai"
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold transition-all shadow-sm"
                />
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tuition Mode</label>
            <div className="relative">
                <Monitor className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                    name="mode"
                    value={filters.mode}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
                >
                    <option value="">Any Mode</option>
                    <option value="Home">Home Tuition</option>
                    <option value="Online">Online</option>
                    <option value="Institution">Institution</option>
                </select>
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Education Board</label>
            <select
                name="board"
                value={filters.board}
                onChange={handleFilterChange}
                className="w-full px-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
            >
                <option value="">Any Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="ISC">ISC</option>
                <option value="IB">IB</option>
                <option value="State Board">State Board</option>
            </select>
        </div>

        <button 
            onClick={() => setFilters({ q: '', subject: '', grade: '', location: '', min_budget: '', mode: '', board: '', gender: '' })}
            className="w-full mt-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white font-bold transition-all border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 backdrop-blur-sm"
        >
            Reset Filters
        </button>
    </div>
);

export default JobSearch;
