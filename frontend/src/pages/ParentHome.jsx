import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  Star,
  ChevronRight
} from 'lucide-react';
import JobWizard from '../components/JobWizard';
import API_BASE_URL from '../config';

const ParentHome = () => {
  const [tutors, setTutors] = useState([]);

  // Mock fetching tutors for now (or implement API later)
  useEffect(() => {
      // In a real scenario, this would fetch from /api/users/tutors/featured/
      setTutors([
          { id: 1, name: "Aarav Gupta", subject: "Mathematics", rating: 4.8, location: "Indira Nagar", img: "https://randomuser.me/api/portraits/men/32.jpg" },
          { id: 2, name: "Priya Singh", subject: "Science (Phy/Chem)", rating: 4.9, location: "Gomti Nagar", img: "https://randomuser.me/api/portraits/women/44.jpg" },
          { id: 3, name: "Dr. R.K. Verma", subject: "Biology", rating: 5.0, location: "Aliganj", img: "https://randomuser.me/api/portraits/men/85.jpg" },
          { id: 4, name: "Sneha Kapoor", subject: "English", rating: 4.7, location: "Hazratganj", img: "https://randomuser.me/api/portraits/women/68.jpg" },
      ]);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Navbar Placeholder (or use global Layout) */}
      
      {/* Hero / Wizard Section */}
      <section className="relative pt-24 pb-16 bg-white rounded-b-[3rem] shadow-sm mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                    Find the Perfect Tutor <br />
                    <span className="text-indigo-600">In Your Locality</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Post your learning requirement and get matched with verified expert tutors nearby.
                </p>
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                 <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-100 rounded-full blur-xl opacity-60"></div>
                 <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-100 rounded-full blur-xl opacity-60"></div>
                 <JobWizard />
            </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Top Tutors Near You</h2>
            <Link to="/tutors" className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
                View All <ChevronRight size={18} />
            </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {tutors.map(tutor => (
                <div key={tutor.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <img src={tutor.img} alt={tutor.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" />
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight">{tutor.name}</h3>
                            <p className="text-sm text-slate-500">{tutor.subject}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star size={16} fill="currentColor" /> {tutor.rating}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                            <MapPin size={14} /> {tutor.location}
                        </div>
                    </div>
                    <button className="w-full mt-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        View Profile
                    </button>
                </div>
            ))}
        </div>
      </section>

    </div>
  );
};

export default ParentHome;
