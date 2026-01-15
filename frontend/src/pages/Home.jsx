import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CreditCard,
  ChevronRight, 
  CheckCircle,
  ArrowRight,
  Phone,
  MessageCircle,
  Calculator,
  FlaskConical,
  BookOpenText,
  TrendingUp,
  School,
  BookOpen,
  Files,
  Code2
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm mb-8">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span className="text-sm font-semibold text-indigo-900 tracking-wide uppercase">Lucknow's Premier Tutoring Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              Unlock Your Child's<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">True Potential.</span>
            </h1>
            
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              We bridge the gap between ambitious students and expert educators. 
              Get connected with verified, experienced mentors who prioritize your child's growth.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link
                  to="/parent-home" 
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg shadow-indigo-200 shadow-lg hover:shadow-indigo-300 hover:-translate-y-1 transition-all"
                >
                  Find a Tutor
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/signup?role=teacher"
                  className="inline-flex justify-center items-center px-8 py-4 border border-slate-200 text-lg font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  Become a Tutor
                </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-16 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 grayscale opacity-70">
                {['EduTrust', 'TutorSafe', 'VerifiedPro', 'HomeLearn'].map((brand, i) => (
                    <div key={i} className="flex justify-center items-center font-bold text-xl">{brand}</div>
                ))}
            </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3">Who We Are</h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900">
              Redefining Home Education
            </p>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Unlike others, we don't just provide a teacher; we provide a mentor. Every tutor is screened for expertise and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<ShieldCheck className="h-6 w-6 text-indigo-600" />}
                title="100% Verified"
                desc="Every tutor's ID and address is thoroughly checked for your safety."
              />
              <FeatureCard 
                icon={<Clock className="h-6 w-6 text-indigo-600" />}
                title="Flexible Timings"
                desc="Classes scheduled at your convenience to fit your child's routine."
              />
              <FeatureCard 
                icon={<MapPin className="h-6 w-6 text-indigo-600" />}
                title="Local Tutors"
                desc="Find expert teachers from your own locality and neighborhood."
              />
              <FeatureCard 
                icon={<CreditCard className="h-6 w-6 text-indigo-600" />}
                title="Affordable"
                desc="Premium education at fair rates. No hidden charges or commissions."
              />
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Browse by Subject & Class
            </h2>
            <p className="text-lg text-slate-500">Find specialized experts for your specific learning needs.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SubjectCard 
              icon={<Calculator className="h-6 w-6 text-indigo-500" />}
              title="Mathematics" 
              sub="Algebra, Calculus & More" 
            />
            <SubjectCard 
              icon={<FlaskConical className="h-6 w-6 text-indigo-500" />}
              title="Science" 
              sub="Physics, Chemistry, Bio" 
            />
            <SubjectCard 
              icon={<BookOpenText className="h-6 w-6 text-indigo-500" />}
              title="English" 
              sub="Grammar & Literature" 
            />
            <SubjectCard 
              icon={<TrendingUp className="h-6 w-6 text-indigo-500" />}
              title="Commerce" 
              sub="Accounts & Economics" 
            />
            <SubjectCard 
              icon={<School className="h-6 w-6 text-orange-500" />}
              title="Junior Wing" 
              sub="Class 1 to 5 All Subjects" 
              highlight 
            />
            <SubjectCard 
              icon={<BookOpen className="h-6 w-6 text-blue-500" />}
              title="High School" 
              sub="Class 6 to 10" 
              highlight 
            />
            <SubjectCard 
              icon={<Files className="h-6 w-6 text-green-500" />}
              title="Intermediate" 
              sub="Class 11 & 12 Specialized" 
              highlight 
            />
            <SubjectCard 
              icon={<Code2 className="h-6 w-6 text-purple-500" />}
              title="Coding / IT" 
              sub="Python, Java, C++" 
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How We Work?</h2>
            <p className="mt-4 text-lg text-slate-500">Three simple steps to start your learning journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <StepCard 
              number="01" 
              title="Post Requirement" 
              desc="Fill the form and tell us your class, subject, and area preferences." 
            />
            <StepCard 
              number="02" 
              title="Get Matched" 
              desc="We send the best suited tutor profile to you for a free demo class." 
            />
            <StepCard 
              number="03" 
              title="Start Learning" 
              desc="If satisfied with the demo, hire the tutor and start your classes." 
            />
          </div>
        </div>
      </section>

      {/* For Tutors CTA */}
      <section className="py-20 bg-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Looking for Teaching Jobs?</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join our network of verified educators and start earning by sharing your knowledge.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link
                to="/signup?role=teacher"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-900 text-lg font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Join as a Tutor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div>
              <div className="flex items-center gap-2 mb-6">
                 {/* Logo Placeholder */}
                 <span className="text-2xl font-bold text-white tracking-tight">THT PRO</span>
              </div>
              <p className="leading-relaxed mb-6">
                The Home Tuitions is Lucknow's dedicated platform for connecting students with the best home tutors.
              </p>
              <div className="text-sm">
                 &copy; 2024 The Home Tuitions. All rights reserved.
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Useful Links</h3>
              <ul className="space-y-4">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/signup?role=teacher" className="hover:text-white transition-colors">Join as Tutor</Link></li>
                <li><Link to="/signup?role=parent" className="hover:text-white transition-colors">Get a Home Tutor</Link></li>
                <li><div className="opacity-50 cursor-not-allowed">Gallery</div></li>
                <li><div className="opacity-50 cursor-not-allowed">Contact Us</div></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-slate-500">Phone:</span>
                  <a href="tel:6387488141" className="text-white hover:text-indigo-400 transition-colors">+91 6387488141</a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-white">support@thehometuitions.in</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-500">Address:</span>
                  <span className="text-white">Verma Complex 1st floor, A-mart Chauraha near Bal Nikunj School Madiyaon, Lko, U.P</span>
                </li>
              </ul>
            </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
        <a 
          href="https://wa.me/916387488141" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center animate-bounce-slow"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
        <a 
          href="tel:6387488141" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          title="Call Us"
        >
          <Phone className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
};

// --- Sub Components ---

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-slate-100">
        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:scale-110 transition-transform mb-6 text-indigo-600">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
)

const SubjectCard = ({ icon, title, sub, highlight = false }) => (
    <div className={`p-6 rounded-xl border transition-all duration-300 cursor-default
        ${highlight 
            ? 'bg-white border-indigo-100 shadow-md hover:shadow-lg hover:border-indigo-200' 
            : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'
        }
    `}>
        <div className="flex flex-col h-full justify-between">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${highlight ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                  {icon}
                </div>
                <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
                    <p className="text-sm text-slate-500">{sub}</p>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${highlight ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>
        </div>
    </div>
)

const StepCard = ({ number, title, desc }) => (
    <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center group hover:bg-white hover:shadow-xl transition-all duration-300">
        <div className="text-6xl font-black text-indigo-200 mb-6 group-hover:text-indigo-600 transition-colors">
            {number}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">
            {desc}
        </p>
    </div>
)

export default LandingPage;
