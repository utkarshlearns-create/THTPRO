"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, BookOpen, GraduationCap, Monitor, Star, Clock, IndianRupee, Globe } from 'lucide-react';
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
                    headers: headers,
                    cache: 'no-store'
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
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
            {/* User Provided Background Image */}
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
                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-[20px]"></div>
            </div>

            <div className="relative z-10 font-sans">
                <Navbar />
                
                <main className="container mx-auto px-4 py-24">
                {/* Header & Search */}
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
                    {/* Filters Sidebar */}
                    <aside className={`md:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/50 dark:border-white/10 sticky top-24 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold text-sm tracking-widest uppercase">
                                <Filter size={16} className="text-indigo-600 dark:text-indigo-400" /> Filters
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
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <select
                                            name="locality"
                                            value={filters.locality}
                                            onChange={handleFilterChange}
                                            className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-slate-700 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white font-semibold appearance-none transition-all shadow-sm"
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
                        </div>
                    </aside>

                    {/* Results Grid */}
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
        </div>
    );
};

const TutorCard = ({ tutor }) => {
    // Generate random star rating if missing (mock)
    const rating = 4.5 + Math.random() * 0.5;
    const [imgError, setImgError] = React.useState(false);
    
    return (
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/50 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-2 group relative overflow-hidden">
            {/* Glossy top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent"></div>
            
            <div className="flex flex-col h-full">
                <div className="flex items-start gap-5 mb-5 space-x-2">
                    <div className="relative shrink-0 flex items-center self-center w-full justify-center flex-col mt-4 border-b border-indigo-100/50 dark:border-white/5 pb-4 mb-2">
                        {tutor.image && !imgError ? (
                            <img 
                                src={typeof tutor.image === 'string' && tutor.image.startsWith('http') ? tutor.image : `${API_BASE_URL}${tutor.image}`} 
                                alt={tutor.name} 
                                className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-extrabold border-4 border-white dark:border-white/10 shadow-xl">
                                {tutor.name?.charAt(0) || 'T'}
                            </div>
                        )}
                        <span className="absolute bottom-1 right-2 bg-emerald-500 h-5 w-5 rounded-full border-4 border-white dark:border-slate-900"></span>
                    </div>

                    <div className="absolute top-0 right-0">
                        <div className="flex flex-col items-center bg-blue-50/80 dark:bg-blue-900/20 px-3 py-1 rounded-2xl border border-blue-100 dark:border-blue-800">
                             <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400 leading-none">{rating.toFixed(1)}</span>
                             <div className="flex text-amber-500 mt-1">
                                 <Star size={10} className="fill-current" />
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="text-center mb-4">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
                        {tutor.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate mt-1">
                         Experienced Tutor
                    </p>
                    <div className="flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium mt-2 gap-1.5 bg-slate-100/50 dark:bg-slate-800/40 inline-flex px-3 py-1 rounded-full">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="truncate">{tutor.locality || "Location N/A"}</span>
                    </div>
                </div>

                <div className="mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[2.5rem]">
                    {tutor.about_me || "Passionate and experienced tutor dedicated to student success."}
                </p>
            </div>

            {/* Subjects pills */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {Array.isArray(tutor.subjects) && tutor.subjects.slice(0, 3).map((sub, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                        {sub}
                    </span>
                ))}
                {Array.isArray(tutor.subjects) && tutor.subjects.length > 3 && (
                    <span className="px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 text-xs font-bold rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                        +{tutor.subjects.length - 3} more
                    </span>
                )}
            </div>

            <div className="mt-auto pt-5 mt-4 border-t border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between font-bold text-sm mb-4 px-2">
                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <Clock size={16} className="mr-2 text-indigo-500" />
                        {tutor.teaching_experience_years || 0} Yrs Exp.
                    </div>
                    {/* Could add fee or mode here if available */}
                     <div className="flex items-center text-slate-700 dark:text-slate-300">
                         {tutor.tuition_modes && tutor.tuition_modes.includes('ONLINE') ? (
                             <Monitor size={16} className="text-cyan-500 mr-2" />
                         ) : (
                             <Globe size={16} className="text-cyan-500 mr-2" />
                         )}
                         {tutor.tuition_modes ? tutor.tuition_modes.join(', ') : 'HOME'}
                     </div>
                </div>

                <Link href={`/tutors/${tutor.id}`} className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40">
                    View Profile
                </Link>
            </div>
            </div>
        </div>
    );
};

export default FindTutors;
