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
import { motion } from 'framer-motion';

const FadeIn = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 bg-[url('/hero-main.jpg')] bg-cover bg-center bg-no-repeat bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm mb-8"
                >
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                    </span>
                    <span className="text-base font-semibold text-indigo-900 tracking-wide uppercase">India's Premier Tutoring Platform</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight"
                >
                  Unlock Your Child's<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">True Potential.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="mt-6 text-xl text-slate-600 mb-10 leading-relaxed max-w-lg"
                >
                  We bridge the gap between ambitious students and expert educators. 
                  Get connected with verified, experienced mentors who prioritize your child's growth.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
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
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="mt-8 text-sm font-semibold text-slate-500"
                >
                    ⭐ Trusted by thousands of parents and tutors • Rated 4.8/5
                </motion.p>
                
                {/* Trust Badges */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 grayscale opacity-70"
                >
                    {['EduTrust', 'TutorSafe', 'VerifiedPro', 'HomeLearn'].map((brand, i) => (
                        <div key={i} className="flex justify-start items-center font-bold text-lg">{brand}</div>
                    ))}
                </motion.div>
            </div>
            
            {/* Right side is intentionally empty to let the background image show */}
            <div className="hidden lg:block"></div>
        </div>
      </section>

      {/* Why Choose Us Section - Staggered Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-20">
            <h2 className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3">Who We Are</h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900">
              Redefining Home Education
            </p>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Unlike others, we don't just provide a teacher; we provide a mentor. Every tutor is screened for expertise and safety.
            </p>
          </FadeIn>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
              <motion.div variants={itemVariants}>
                <FeatureCard 
                  icon={<ShieldCheck className="h-6 w-6 text-indigo-600" />}
                  title="100% Verified"
                  desc="Every tutor's ID and address is thoroughly checked for your safety."
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FeatureCard 
                  icon={<Clock className="h-6 w-6 text-indigo-600" />}
                  title="Flexible Timings"
                  desc="Classes scheduled at your convenience to fit your child's routine."
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FeatureCard 
                  icon={<MapPin className="h-6 w-6 text-indigo-600" />}
                  title="Local Tutors"
                  desc="Find expert teachers from your own locality and neighborhood."
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FeatureCard 
                  icon={<CreditCard className="h-6 w-6 text-indigo-600" />}
                  title="Affordable"
                  desc="Premium education at fair rates. No hidden charges or commissions."
                />
              </motion.div>
          </motion.div>
        </div>
      </section>



      {/* Testimonials Section - Wall of Trust */}
      <section className="py-24 bg-[url('/trust-bg.png')] bg-cover bg-center relative overflow-hidden">
         {/* Overlay */}
         <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <FadeIn className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/2 text-right md:order-last">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6 animate-pulse">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="font-bold text-slate-700">Excellent</span>
                        <div className="flex text-yellow-500 text-sm">
                            {[...Array(5)].map((_,i) => <span key={i}>★</span>)}
                        </div>
                        <span className="text-slate-500 text-sm font-medium">4.8/5</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-indigo-950 mb-6 tracking-tight leading-tight">
                        Loved by <br/>
                        <span className="text-indigo-600">Parents.</span>
                    </h2>
                    <p className="text-xl text-slate-800 font-medium leading-relaxed mb-8">
                        See why thousands of parents trust THT for their child's future.
                    </p>
                    <div className="flex justify-end gap-3 text-sm font-semibold text-slate-600">
                        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-green-600"/> Verified Reviews</span>
                        <span>•</span>
                        <span>Last updated today</span>
                    </div>
                </div>

                {/* Reviews Carousel */}
                <div className="md:w-1/2 w-full">
                     <TestimonialCarousel />
                </div>
            </FadeIn>
         </div>
      </section>

      {/* Subjects Section - Staggered Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Browse by Subject & Class
            </h2>
            <p className="text-lg text-slate-500">Find specialized experts for your specific learning needs.</p>
          </FadeIn>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={itemVariants}>
                <SubjectCard 
                icon={<Calculator className="h-6 w-6 text-indigo-500" />}
                title="Mathematics" 
                sub="Algebra, Calculus & More" 
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SubjectCard 
                icon={<FlaskConical className="h-6 w-6 text-indigo-500" />}
                title="Science" 
                sub="Physics, Chemistry, Bio" 
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SubjectCard 
                icon={<BookOpenText className="h-6 w-6 text-indigo-500" />}
                title="English" 
                sub="Grammar & Literature" 
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SubjectCard 
                icon={<TrendingUp className="h-6 w-6 text-indigo-500" />}
                title="Commerce" 
                sub="Accounts & Economics" 
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SubjectCard 
                icon={<School className="h-6 w-6 text-orange-500" />}
                title="Junior Wing" 
                sub="Class 1 to 5 All Subjects" 
                highlight 
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SubjectCard 
                icon={<BookOpen className="h-6 w-6 text-blue-500" />}
                title="High School" 
                sub="Class 6 to 10" 
                highlight 
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SubjectCard 
                icon={<Files className="h-6 w-6 text-green-500" />}
                title="Intermediate" 
                sub="Class 11 & 12 Specialized" 
                highlight 
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <SubjectCard 
                icon={<Code2 className="h-6 w-6 text-purple-500" />}
                title="Coding / IT" 
                sub="Python, Java, C++" 
                />
            </motion.div>
          </motion.div>
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

const TestimonialCarousel = () => {
    const testimonials = [
        {
            quote: "Finding a reliable maths tutor was a nightmare until I found THT. The tutor is excellent and my son's grades improved in just 2 months!",
            author: "Priya Sharma",
            role: "Parent, Gomti Nagar",
            rating: 5
        },
        {
            quote: "I love how professional the process is. They verified the tutor's background which gave me peace of mind. Highly recommended.",
            author: "Amit Verma",
            role: "Parent, Aliganj",
            rating: 5
        },
        {
            quote: "Great platform for tutors too. I got connected with genuine students near my home without any hassle of commissions.",
            author: "Sanya Gupta",
            role: "Tutor, Indira Nagar",
            rating: 4
        },
        {
            quote: "The flexible timing option is a lifesaver for working parents like us. The tutor adjusts according to our schedule.",
            author: "Rajesh Singh",
            role: "Parent, Hazratganj",
            rating: 5
        }
    ];

    const [current, setCurrent] = React.useState(0);

    const next = () => setCurrent((curr) => (curr + 1) % testimonials.length);
    const prev = () => setCurrent((curr) => (curr - 1 + testimonials.length) % testimonials.length);

    React.useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative">
            <div className="overflow-hidden p-4">
                <div 
                    className="flex transition-transform duration-500 ease-in-out" 
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {testimonials.map((t, i) => (
                        <div key={i} className="w-full flex-shrink-0 px-4">
                            <TestimonialCard {...t} />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`h-2 w-2 rounded-full transition-all ${current === i ? 'bg-indigo-600 w-4' : 'bg-slate-300'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const TestimonialCard = ({ quote, author, role, rating }) => (
    <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden mx-auto max-w-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6 relative">
            <div className="absolute top-6 right-6">
                <svg className="h-6 w-6 opacity-80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            </div>
            
            <div className="flex items-start gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg">
                    {author.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 leading-snug">{author}</h4>
                    <p className="text-xs text-slate-500">{role}</p>
                </div>
            </div>

            <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-base ${i < rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                ))}
                <span className="text-xs text-slate-400 ml-2">Posted on Google</span>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-4">
                "{quote}"
            </p>
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
