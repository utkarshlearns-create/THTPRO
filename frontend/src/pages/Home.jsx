import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CreditCard,
  ChevronRight, 
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
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 bg-[url('/hero-main.png')] bg-cover bg-center bg-no-repeat bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="text-left">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm mb-8 animate-in fade-in zoom-in duration-500">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                    </span>
                    <span className="text-base font-semibold text-indigo-900 tracking-wide uppercase">India's Premier Tutoring Platform</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight animate-in slide-in-from-bottom-8 duration-700">
                  Unlock Your Child's<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">True Potential.</span>
                </h1>
                
                <p className="mt-6 text-xl text-slate-600 mb-10 leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-150 max-w-lg">
                  We bridge the gap between ambitious students and expert educators. 
                  Get connected with verified, experienced mentors who prioritize your child's growth.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
                   <Button 
                      asChild
                      size="lg"
                      className="px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-200"
                    >
                      <Link to="/parent-home">
                        Find a Tutor <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="px-8 py-6 text-lg rounded-xl border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-indigo-600 hover:text-indigo-600 transition-all font-bold"
                    >
                      <Link to="/signup?role=teacher">
                        Become a Tutor
                      </Link>
                    </Button>
                </div>
                
                <p className="mt-8 text-sm font-semibold text-slate-500 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                    ⭐ Trusted by thousands of parents and tutors • Rated 4.8/5
                </p>
                
                {/* Trust Badges */}
                <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 grayscale opacity-70 animate-in fade-in duration-1000 delay-500">
                    {['EduTrust', 'TutorSafe', 'VerifiedPro', 'HomeLearn'].map((brand, i) => (
                        <div key={i} className="flex justify-start items-center font-bold text-lg">{brand}</div>
                    ))}
                </div>
            </div>
            
            {/* Right side is intentionally empty to let the background image show */}
            <div className="hidden lg:block"></div>
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



      {/* Testimonials Section */}
      <section className="py-24 bg-indigo-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Wall of Trust and Love</h2>
              <p className="text-lg text-slate-500">Real stories from families who found the perfect tutor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TestimonialCard 
                    quote="Finding a reliable maths tutor was a nightmare until I found THT. The tutor is excellent and my son's grades improved in just 2 months!"
                    author="Priya Sharma"
                    role="Parent, Gomti Nagar"
                    rating={5}
                />
                <TestimonialCard 
                    quote="I love how professional the process is. They verified the tutor's background which gave me peace of mind. Highly recommended."
                    author="Amit Verma"
                    role="Parent, Aliganj"
                    rating={5}
                />
                <TestimonialCard 
                    quote="Great platform for tutors too. I got connected with genuine students near my home without any hassle of commissions."
                    author="Sanya Gupta"
                    role="Tutor, Indira Nagar"
                    rating={4}
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
      <section className="py-24 bg-[url('/hero-bg.png')] bg-cover bg-center bg-fixed relative">
        <div className="absolute inset-0 bg-white/95"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
               <Button
                 asChild
                 size="lg"
                 className="bg-white text-indigo-900 hover:bg-indigo-50 hover:text-indigo-900 px-8 py-6 text-lg font-bold rounded-xl shadow-lg border-2 border-transparent hover:border-indigo-100"
               >
                 <Link to="/signup?role=teacher">
                   Join as a Tutor <ArrowRight className="ml-2 h-5 w-5" />
                 </Link>
               </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div>
              <div className="flex items-center gap-2 mb-6">
                 {/* Logo IN FOOTER */}
                 <img className="h-14 w-auto brightness-0 invert opacity-90" src="/logo.png" alt="The Home Tuitions" />
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

const TestimonialCard = ({ quote, author, role, rating }) => (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
        <CardContent className="p-8">
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                ))}
            </div>
            <p className="text-slate-700 italic mb-6 leading-relaxed">"{quote}"</p>
            <div>
                <h4 className="font-bold text-slate-900">{author}</h4>
                <p className="text-sm text-indigo-600 font-medium">{role}</p>
            </div>
        </CardContent>
    </Card>
)

const FeatureCard = ({ icon, title, desc }) => (
    <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 group border-slate-100 bg-slate-50/50 hover:bg-indigo-100 hover:border-indigo-600 cursor-default">
        <CardContent className="p-8">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:scale-110 transition-transform mb-6 text-indigo-600">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
                {desc}
            </p>
        </CardContent>
    </Card>
)

const SubjectCard = ({ icon, title, sub, highlight = false }) => (
    <Card className={`transition-all duration-300 cursor-default border group hover:scale-105 hover:bg-indigo-100
        ${highlight 
            ? 'bg-white border-indigo-100 shadow-md hover:shadow-lg hover:border-indigo-600' 
            : 'bg-white border-slate-200 hover:border-indigo-600 hover:shadow-md'
        }
    `}>
        <CardContent className="p-6 flex flex-col h-full justify-between">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${highlight ? 'bg-indigo-50' : 'bg-slate-50 group-hover:bg-white transition-colors'}`}>
                  {icon}
                </div>
                <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
                    <p className="text-sm text-slate-500">{sub}</p>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${highlight ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'}`}>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>
        </CardContent>
    </Card>
)

const StepCard = ({ number, title, desc }) => (
    <Card className="relative border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
        <CardContent className="p-8 text-center">
            <div className="text-6xl font-black text-indigo-200 mb-6 group-hover:text-indigo-600 transition-colors">
                {number}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">
                {desc}
            </p>
        </CardContent>
    </Card>
)

export default LandingPage;
