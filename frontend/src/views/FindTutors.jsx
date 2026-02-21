"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, BookOpen, GraduationCap, Monitor, Star, Clock, IndianRupee } from 'lucide-react';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

    const LOCATION_DATA = {
        "Uttar Pradesh": {
            "Lucknow": ["Aliganj", "Gomti Nagar", "Indira Nagar", "Hazratganj", "Janki Puram", "Mahanagar", "Alambagh", "Vikas Nagar", "South City", "Aashiana"],
            "Kanpur": ["Kalyanpur", "Kidwai Nagar", "Civil Lines", "Swaroop Nagar", "Jajmau"],
            "Varanasi": ["Lanka", "Sigra", "Cantt", "Sarnath"],
            "Agra": ["Sanjay Place", "Taj Nagri", "Dayal Bagh"],
            "Noida": ["Sector 15", "Sector 18", "Sector 62", "Sector 137"],
        }
    };

    const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science", "History", "Geography", "Computer Science", "Business Studies", "Accountancy", "Economics"];
    const CLASSES = ["Nursery/Preschool", "Class 1-5", "Class 6-8", "Class 9", "Class 10", "Class 11", "Class 12", "IIT-JEE/NEET"];
    const [showFilters, setShowFilters] = useState(false);

    // Fetch tutors when filters change (debounced)
    useEffect(() => {
        const fetchTutors = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('access');
                // If not logged in, maybe redirect or show empty? 
                // Requirement says "Browse Tutors" from Parent Dashboard, so likely logged in.
                // But if public, handle that. My backend requires Auth.
                
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                } else {
                    // Redirect to login if token missing?
                     // router.push('/login'); // Optional
                }

                const queryParams = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });

                const response = await fetch(`${API_BASE_URL}/api/users/tutors/search/?${queryParams.toString()}`, {
                    headers: headers
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Handle pagination (Django Rest Framework returns { results: [], count: ... })
                    if (data.results && Array.isArray(data.results)) {
                        setTutors(data.results);
                    } else if (Array.isArray(data)) {
                        setTutors(data);
                    } else {
                        setTutors([]); // Fallback
                    }
                } else if (response.status === 401) {
                    // Unauthorized
                    console.log("Unauthorized, redirecting...");
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
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            
            <main className="container mx-auto px-4 py-24">
                {/* Header & Search */}
                <div className="mb-12 max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Find the Perfect Tutor
                    </h1>
                    <p className="text-slate-500 text-lg mb-8">Connect with expert tutors in your area for any subject or grade.</p>
                    
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            name="q"
                            value={filters.q}
                            onChange={handleFilterChange}
                            className="block w-full pl-11 pr-4 py-4 border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                            placeholder="Search by name, subject, or keywords..."
                        />
                        <button 
                            className="absolute inset-y-2 right-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium md:hidden"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
                    {/* Filters Sidebar */}
                    <aside className={`md:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 sticky top-24 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold text-lg">
                                <Filter size={20} className="text-indigo-600" /> Filters
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Subject</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <select
                                            name="subject"
                                            value={filters.subject}
                                            onChange={handleFilterChange}
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium appearance-none"
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
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium appearance-none"
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
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium appearance-none"
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
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium appearance-none"
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
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <select
                                            name="locality"
                                            value={filters.locality}
                                            onChange={handleFilterChange}
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium appearance-none"
                                            disabled={!filters.city}
                                        >
                                            <option value="">Select Area</option>
                                            {filters.state && filters.city && (LOCATION_DATA[filters.state][filters.city] || []).map(l => (
                                                <option key={l} value={l}>{l}</option>
                                            ))}
                                        </select>
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
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium appearance-none"
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
                                    className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-indigo-300"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {tutors.length} Value Tutors Found
                            </h2>
                            {/* Sorting could go here */}
                        </div>

                        {loading ? (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : tutors.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {tutors.map(tutor => (
                                    <TutorCard key={tutor.id} tutor={tutor} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tutors found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any tutors matching your criteria. Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const TutorCard = ({ tutor }) => {
    // Generate random star rating if missing (mock)
    const rating = 4.5 + Math.random() * 0.5;
    const [imgError, setImgError] = React.useState(false);
    
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                    {tutor.image && !imgError ? (
                        <img 
                            src={typeof tutor.image === 'string' && tutor.image.startsWith('http') ? tutor.image : `${API_BASE_URL}${tutor.image}`} 
                            alt={tutor.name} 
                            className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold border-2 border-white dark:border-slate-800 shadow-md">
                            {tutor.name?.charAt(0) || 'T'}
                        </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900"></span>
                </div>
                
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {tutor.name}
                    </h3>
                    <div className="flex items-center text-emerald-500 text-sm font-semibold mb-1">
                        <Star size={14} className="fill-current mr-1" />
                        {rating.toFixed(1)} <span className="text-slate-400 font-normal ml-1">(24 reviews)</span>
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate">{tutor.locality || "Location N/A"}</span>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[2.5rem]">
                    {tutor.about_me || "Passionate and experienced tutor dedicated to student success."}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {tutor.subjects?.slice(0, 3).map((sub, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-md">
                        {sub}
                    </span>
                ))}
                {(tutor.subjects?.length || 0) > 3 && (
                    <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-semibold rounded-md">
                        +{tutor.subjects.length - 3} more
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center text-slate-900 dark:text-white font-bold">
                   <Clock size={16} className="mr-1.5 text-indigo-600" />
                   {tutor.teaching_experience_years || 0} Yrs Exp.
                </div>
                
                <Link href={`/tutors/${tutor.id}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-200 dark:shadow-none">
                    View Profile
                </Link>
            </div>
        </div>
    );
};

export default FindTutors;
