import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, BookOpen, GraduationCap } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';

const JobSearch = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        q: '',
        subject: '',
        grade: '',
        location: '',
        min_budget: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch jobs when filters change (debounced)
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });

                const response = await fetch(`${API_BASE_URL}/api/jobs/search/?${queryParams.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setJobs(data);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchJobs();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar /> {/* Assuming wrapper handles this, but adding just in case or distinct layout */}
            
            <main className="container mx-auto px-4 py-8">
                {/* Header & Search */}
                <div className="mb-8 max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Find Your Next Tutoring Job
                    </h1>
                    <p className="text-slate-500 mb-8">Browse hundreds of active tutoring opportunities in your area.</p>
                    
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            name="q"
                            value={filters.q}
                            onChange={handleFilterChange}
                            className="block w-full pl-10 pr-4 py-4 border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Search by keywords (e.g. 'Maths Class 10')"
                        />
                        <button 
                            className="absolute inset-y-2 right-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium md:hidden"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal size={16} /> Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
                    {/* Filters Sidebar (Desktop) / Dropdown (Mobile) */}
                    <aside className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 sticky top-24">
                            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-semibold">
                                <Filter size={18} /> Filters
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Subject</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="subject"
                                            value={filters.subject}
                                            onChange={handleFilterChange}
                                            placeholder="e.g. Physics"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Class / Grade</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <select
                                            name="grade"
                                            value={filters.grade}
                                            onChange={handleFilterChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-500 text-slate-600 dark:text-slate-300"
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
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={filters.location}
                                            onChange={handleFilterChange}
                                            placeholder="e.g. Mumbai"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                 <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Min Budget (₹)</label>
                                    <input
                                        type="number"
                                        name="min_budget"
                                        value={filters.min_budget}
                                        onChange={handleFilterChange}
                                        placeholder="Min Amount"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <button 
                                    onClick={() => setFilters({ q: '', subject: '', grade: '', location: '', min_budget: '' })}
                                    className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-slate-900 dark:text-white font-semibold">
                                {jobs.length} Results Found
                            </h2>
                            <div className="text-sm text-slate-500">
                                Sorted by Newest
                            </div>
                        </div>

                        {loading ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : jobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {jobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No jobs found</h3>
                                <p className="text-slate-500">Try adjusting your search criteria or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobSearch;
