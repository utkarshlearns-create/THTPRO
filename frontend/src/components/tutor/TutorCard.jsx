import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Clock, Monitor, Globe, Award, Heart } from 'lucide-react';
import API_BASE_URL from '../../config';

const getThemeFromSubjects = (subjects) => {
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return 'indigo';
    const subStr = subjects.join(' ').toLowerCase();
    
    // Emerald (Science)
    if (subStr.includes('science') || subStr.includes('physics') || subStr.includes('chemistry') || subStr.includes('biology') || subStr.includes('botany') || subStr.includes('zoology')) return 'emerald';
    
    // Blue (Commerce)
    if (subStr.includes('commerce') || subStr.includes('accountancy') || subStr.includes('business') || subStr.includes('economics')) return 'blue';
    
    // Purple (Math)
    if (subStr.includes('math') || subStr.includes('statistics') || subStr.includes('algebra')) return 'purple';
    
    // Orange (Arts/Humanities)
    if (subStr.includes('art') || subStr.includes('history') || subStr.includes('geography') || subStr.includes('english') || subStr.includes('hindi') || subStr.includes('social')) return 'orange';
    
    return 'indigo';
};

const themeStyles = {
    emerald: { // Tailwind requires full class names, string concatenation breaks purge
        cardBorder: 'border-emerald-500/20',
        cardShadowHover: 'hover:shadow-emerald-500/10',
        bgPill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
        solidPill: 'bg-emerald-500 text-white shadow-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 text-white',
        avatarBorder: 'border-emerald-100 dark:border-emerald-900/50',
    },
    blue: {
        cardBorder: 'border-blue-500/20',
        cardShadowHover: 'hover:shadow-blue-500/10',
        bgPill: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
        solidPill: 'bg-blue-500 text-white shadow-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 text-white',
        avatarBorder: 'border-blue-100 dark:border-blue-900/50',
    },
    purple: {
        cardBorder: 'border-purple-500/20',
        cardShadowHover: 'hover:shadow-purple-500/10',
        bgPill: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        solidPill: 'bg-purple-500 text-white shadow-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25 text-white',
        avatarBorder: 'border-purple-100 dark:border-purple-900/50',
    },
    orange: {
        cardBorder: 'border-orange-500/20',
        cardShadowHover: 'hover:shadow-orange-500/10',
        bgPill: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
        solidPill: 'bg-orange-500 text-white shadow-orange-500/20',
        text: 'text-orange-600 dark:text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/25 text-white',
        avatarBorder: 'border-orange-100 dark:border-orange-900/50',
    },
    indigo: {
        cardBorder: 'border-indigo-500/20',
        cardShadowHover: 'hover:shadow-indigo-500/10',
        bgPill: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
        solidPill: 'bg-indigo-500 text-white shadow-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 text-white',
        avatarBorder: 'border-indigo-100 dark:border-indigo-900/50',
    }
};

const getSpecialistText = (themeKey) => {
    switch(themeKey) {
        case 'emerald': return 'Science Specialist';
        case 'blue': return 'Commerce Specialist';
        case 'purple': return 'Mathematics Expert';
        case 'orange': return 'Arts & Humanities';
        default: return 'Experienced Tutor';
    }
};

const TutorCard = ({ tutor }) => {
    const rating = 4.5 + Math.random() * 0.5;
    const [imgError, setImgError] = React.useState(false);
    const [isFavourite, setIsFavourite] = React.useState(tutor.is_favourite || false);
    const [toggling, setToggling] = React.useState(false);
    const [isParent, setIsParent] = React.useState(false);

    React.useEffect(() => {
        setIsParent(localStorage.getItem('role') === 'PARENT');
    }, []);

    const handleToggleFavourite = async () => {
        try {
            setToggling(true);
            const token = localStorage.getItem('access');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/users/tutors/${tutor.id}/favourite/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsFavourite(data.is_favourite);
            }
        } catch (error) {
            console.error("Error toggling favourite:", error);
        } finally {
            setToggling(false);
        }
    };
    
    const themeKey = getThemeFromSubjects(tutor.subjects);
    const styles = themeStyles[themeKey];
    const specialistText = getSpecialistText(themeKey);

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-[24px] p-6 border ${styles.cardBorder} shadow-lg shadow-slate-200/50 dark:shadow-none ${styles.cardShadowHover} transition-all duration-300 hover:-translate-y-1 flex flex-col h-full font-sans relative overflow-hidden group`}>
            
            {/* Header: Avatar, Name, Rating */}
            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex items-center gap-4">
                    {/* Circular Avatar */}
                    <div className="relative shrink-0">
                        {tutor.image && !imgError ? (
                            <img
                                src={typeof tutor.image === 'string' && tutor.image.startsWith('http') ? tutor.image : `${API_BASE_URL}${tutor.image}`}
                                alt={tutor.name}
                                className={`h-16 w-16 rounded-full object-cover border-2 ${styles.avatarBorder} shadow-sm object-top`}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className={`h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${styles.text} text-2xl font-extrabold border-2 ${styles.avatarBorder} shadow-sm`}>
                                {tutor.name?.charAt(0) || 'T'}
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 bg-emerald-500 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </div>

                    {/* Name & Sub-header */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-[190px]">
                            {tutor.name}
                        </h3>
                        <div className={`text-sm font-semibold ${styles.text} flex items-center gap-1 mt-0.5 truncate`}>
                             <Award size={14} /> {specialistText}
                        </div>
                    </div>
                </div>

                {/* Rating & Favorite */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 leading-none">{rating.toFixed(1)}</span>
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                    </div>
                    {isParent && (
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggleFavourite();
                            }}
                            disabled={toggling}
                            className={`p-2 rounded-xl transition-all duration-300 border ${
                                isFavourite 
                                ? 'bg-rose-50 border-rose-100 text-rose-500 dark:bg-rose-900/20 dark:border-rose-900/30' 
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 dark:bg-slate-800/80 dark:border-slate-700'
                            } ${toggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                        >
                            <Heart size={18} className={isFavourite ? 'fill-current' : ''} />
                        </button>
                    )}
                </div>
            </div>

            {/* Experience Pill */}
            <div className="mb-4">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${styles.bgPill}`}>
                    <Clock size={14} className="opacity-80" />
                    <span className="text-[11px] font-bold tracking-wide uppercase">
                        {tutor.teaching_experience_years || 0} Yrs Exp | 50+ Students
                    </span>
                </div>
            </div>
            
            {/* Bio / Location Context */}
            <div className="mb-5 flex-grow">
                 <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 gap-1.5">
                    <MapPin size={14} />
                    <span className="truncate">{tutor.locality || "Location N/A"}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {tutor.about_me || "Passionate and experienced tutor dedicated to student success."}
                </p>
            </div>

            {/* Skills Section (Tags) */}
            <div className="flex flex-wrap gap-2 mb-6">
                {Array.isArray(tutor.subjects) && tutor.subjects.slice(0, 3).map((sub, idx) => (
                    <span key={idx} className={`px-3 py-1.5 text-[11px] tracking-wide font-bold rounded-[12px] truncate max-w-full ${styles.solidPill}`}>
                        {sub}
                    </span>
                ))}
                {Array.isArray(tutor.subjects) && tutor.subjects.length > 3 && (
                    <span className={`px-3 py-1.5 text-[11px] font-bold rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700`}>
                        +{tutor.subjects.length - 3}
                    </span>
                )}
            </div>

            {/* Footer / CTA */}
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 relative z-10 w-full">
                 <div className="flex items-center font-semibold text-[13px] text-slate-500 dark:text-slate-400">
                    {tutor.tuition_modes && tutor.tuition_modes.includes('ONLINE') ? (
                        <Monitor size={14} className="mr-1.5 text-cyan-500" />
                    ) : (
                        <Globe size={14} className="mr-1.5 text-cyan-500" />
                    )}
                    {tutor.tuition_modes ? tutor.tuition_modes.join(', ') : 'HOME'}
                </div>

                <Link href={`/tutors/${tutor.id}`} className={`block w-full py-3 text-center font-bold rounded-[12px] transition-all shadow-md ${styles.button}`}>
                    View Profile
                </Link>
            </div>
        </div>
    );
};

export default TutorCard;

