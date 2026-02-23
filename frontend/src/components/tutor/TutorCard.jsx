import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Clock, Monitor, Globe } from 'lucide-react';
import API_BASE_URL from '../../config';

/**
 * TutorCard — Displays a tutor's summary in search results.
 * Used by FindTutors.jsx
 */
const TutorCard = ({ tutor }) => {
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

export default TutorCard;
