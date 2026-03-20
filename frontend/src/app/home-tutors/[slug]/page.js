import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CreditCard, 
  ArrowRight,
  Star,
  Users,
  CheckCircle,
  MessageCircle,
  Phone,
  ChevronRight,
  Search
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import API_BASE_URL from '../../../config';

// Constants for generation
const SUBJECTS = [
  'maths', 'physics', 'chemistry', 'biology', 'english', 
  'hindi', 'science', 'commerce', 'accounts', 'coding'
];
const CLASSES = [
  'class-1','class-2','class-3','class-4','class-5','class-6',
  'class-7','class-8','class-9','class-10','class-11','class-12'
];
const AREAS = [
  'gomti-nagar', 'aliganj', 'indira-nagar', 'hazratganj', 'rajajipuram',
  'alambagh', 'chinhat', 'vibhuti-khand', 'nirala-nagar', 'mahanagar',
  'jankipuram', 'sultanpur-road', 'faizabad-road', 'kursi-road',
  'telibagh', 'sushant-golf-city', 'kanpur-road', 'lucknow-cantonment',
  'aminabad', 'charbagh'
];

// 2. SLUG PARSING
function parseSlug(slug) {
  const parts = slug.split('-');
  
  let subject = null;
  for (const s of SUBJECTS) {
    if (slug.includes(s)) {
      subject = s;
      break;
    }
  }

  let classGrade = null;
  const classMatch = slug.match(/class-(\d+)/);
  if (classMatch) {
    classGrade = classMatch[0]; // class-1, class-10, etc.
  }

  // Find area: it's usually between class/tutor and lucknow
  // Slugs: {subject}-tutor-{class}-{area}-lucknow
  // home-tutor-{class}-{area}-lucknow
  let area = null;
  for (const a of AREAS) {
    if (slug.includes(a)) {
      area = a;
      break;
    }
  }

  return {
    subject: subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "Home",
    subjectRaw: subject,
    classGrade: classGrade ? classGrade.replace('class-', 'Class ') : "",
    classRaw: classGrade,
    area: area ? area.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Lucknow",
    areaRaw: area,
    city: "Lucknow"
  };
}

// 3. METADATA
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { subject, classGrade, area } = parseSlug(slug);

  const title = `Best ${subject} Tutor ${classGrade ? `for ${classGrade}` : ""} in ${area}, Lucknow | The Home Tuitions`;
  const description = `Find verified, background-checked ${subject.toLowerCase()} tutors ${classGrade ? `for ${classGrade}` : ""} near ${area}, Lucknow. Free demo class. Rated 4.8/5 by 1000+ parents.`;

  return {
    title,
    description,
    keywords: `${subject} tutor ${area}, home tutors in ${area}, ${subject} tuition lucknow, verified tutors lucknow`,
    openGraph: {
      title,
      description,
      url: `https://thehometuitions.com/home-tutors/${slug}`,
      images: [{ url: '/og-banner.jpg' }],
    },
    alternates: {
      canonical: `https://thehometuitions.com/home-tutors/${slug}`,
    }
  };
}

// 9. Static Params (Pre-generate top 250 combinations)
export async function generateStaticParams() {
   const params = [];
   
   // Top 10 subjects x Top 5 classes x Top 5 areas
   const topSubjects = SUBJECTS.slice(0, 10);
   const topClasses = CLASSES.slice(8, 12); // Class 9-12 are high intent
   const topAreas = AREAS.slice(0, 6);

   for (const s of topSubjects) {
     for (const c of topClasses) {
       for (const a of topAreas) {
         params.push({ slug: `${s}-tutor-${c}-${a}-lucknow` });
       }
     }
   }
   
   return params;
}

export const revalidate = 86400; // ISR: 24 hours

// Component for Tutor Card
const TutorCard = ({ tutor }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
    <div className="p-5">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xl overflow-hidden ring-2 ring-indigo-50 dark:ring-indigo-900/50">
          {tutor.image ? (
             <img src={tutor.image} alt={tutor.name} className="w-full h-full object-cover" />
          ) : (
             tutor.name.charAt(0)
          )}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{tutor.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
             <Star size={14} fill="currentColor" />
             <span className="text-sm font-bold">4.8</span>
             <span className="text-xs text-slate-400 font-normal ml-1">(12 Reviews)</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
         <div className="flex items-center gap-2">
            <Users size={14} className="text-indigo-500" />
            <span>{tutor.subjects?.slice(0, 3).join(', ')}</span>
         </div>
         <div className="flex items-center gap-2">
            <MapPin size={14} className="text-indigo-500" />
            <span>{tutor.locality || 'Lucknow'}</span>
         </div>
      </div>

      <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
         <Link href={`/tutors/${tutor.id}`}>View Full Profile</Link>
      </Button>
    </div>
  </Card>
);

export default async function Page({ params }) {
  const { slug } = await params;
  const data = parseSlug(slug);
  const { subject, classGrade, area, subjectRaw, areaRaw } = data;

  // 4.D Fetch Tutors
  let tutors = [];
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  try {
    const res = await fetch(`${backendUrl}/api/users/tutors/search/?subject=${subjectRaw}&locality=${areaRaw}/`, {
        next: { revalidate: 3600 }
    });
    if (res.ok) {
        const json = await res.json();
        tutors = json.results || json;
    }
  } catch (error) {
    console.error("Search fetch failed", error);
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      
      {/* A. Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 px-4">
        <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-8">
                <CheckCircle size={16} /> 100% Verified Local Tutors
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
               Best <span className="text-indigo-600 dark:text-indigo-400">{subject}</span> Tutors {classGrade && `for ${classGrade}`} in {area}, Lucknow
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
               Find the perfect verified {subject.toLowerCase()} teacher for your child {classGrade && `in ${classGrade}`} near {area}. Get a free demo class today and ensure your child's academic success.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
               <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-7 text-lg font-bold rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none">
                  <Link href="/signup?role=parent">Find a Tutor</Link>
               </Button>
               <Button asChild variant="outline" size="lg" className="border-2 border-slate-200 dark:border-slate-800 px-10 py-7 text-lg font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900">
                  <Link href="/signup?role=teacher">Apply as Tutor</Link>
               </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-200 dark:border-slate-800">
               <div>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">5,000+</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expert Tutors</p>
               </div>
               <div>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">12,000+</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Happy Students</p>
               </div>
               <div>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">4.8/5</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Rating</p>
               </div>
               <div>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">100%</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verified Profiles</p>
               </div>
            </div>
        </div>
      </section>

      {/* B. Why Choose Us */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
         <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-3xl font-bold mb-16 text-slate-900 dark:text-white">Why Choose THTPRO for {subject}?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <FeatureCard 
                  icon={<ShieldCheck size={28} />} 
                  title="100% Verified" 
                  desc="Stringent ID, address, and academic background checks for every educator." 
               />
               <FeatureCard 
                  icon={<Clock size={28} />} 
                  title="Flexible Timings" 
                  desc="Pick hours that fit your schedule. No rigid routines, only custom learning." 
               />
               <FeatureCard 
                  icon={<MapPin size={28} />} 
                  title="Local Experts" 
                  desc={`Get the best tutors from ${area} for easy home visits.`} 
               />
               <FeatureCard 
                  icon={<CreditCard size={28} />} 
                  title="Affordable Rates" 
                  desc="Pay fairly for quality education. Direct matching with no agent commissions." 
               />
            </div>
         </div>
      </section>

      {/* C. How It Works */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/40">
         <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-16">Start Learning in 3 Simple Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
               <Step number="1" title="Post Requirement" desc="Tell us what you need. We'll find the perfect match." />
               <Step number="2" title="Get Matched" desc="Receive 3 top tutor profiles and schedule a FREE demo." />
               <Step number="3" title="Start Learning" desc="If you like the demo, start your journey immediately." />
            </div>
         </div>
      </section>

      {/* D. Tutor Listings */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950">
         <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Verified {subject} Tutors in {area}</h2>
                  <p className="text-slate-500">Showing top results near your location.</p>
               </div>
               <Button asChild variant="outline" className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                  <Link href="/tutors">See All Tutors</Link>
               </Button>
            </div>

            {tutors.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tutors.slice(0, 6).map(t => <TutorCard key={t.id} tutor={t} />)}
               </div>
            ) : (
               <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-12 text-center border-2 border-dashed border-indigo-200 dark:border-indigo-800">
                  <p className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-4">Be the first {subject.toLowerCase()} tutor in {area}!</p>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">We are currently verifying more tutors in your area. Join our network today to reach students looking for your expertise.</p>
                  <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                     <Link href="/signup?role=teacher">Become a Tutor</Link>
                  </Button>
               </div>
            )}
         </div>
      </section>

      {/* E. FAQ */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
               <FAQItem 
                  q="Is the first demo class free?" 
                  a="Absolutely! We want you to be completely confident in the tutor before you commit. The first demo session is free of charge." 
               />
               <FAQItem 
                  q="How are tutors verified at THTPRO?" 
                  a="Every tutor undergoes a strict verification process including identity proof, address verification, and academic credential checks." 
               />
               <FAQItem 
                  q={`What is the starting fee for home tutors in ${area}?`} 
                  a={`The fee depends on the tutor's experience and the class level. Usually, home tuitions start from ₹3000-₹5000 per month in ${area}.`} 
               />
               <FAQItem 
                  q={`How quickly can I get a ${subject} tutor?`} 
                  a="We typically match you with a suitable tutor within 24-48 hours of posting your requirement." 
               />
               <FAQItem 
                  q={`Can I get online ${subject} tuitions?`} 
                  a={`Yes, most of our tutors in ${area} offer both home tuitions and online sessions via Zoom/Google Meet.`} 
               />
            </div>
         </div>
      </section>

      {/* F. Bottom CTA */}
      <section className="py-20 px-4 bg-indigo-900 dark:bg-indigo-950 text-white text-center relative overflow-hidden">
         <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Looking for {subject} Teaching Jobs in {area}?</h2>
            <p className="text-xl text-indigo-100 mb-10">Join 5000+ expert educators in Lucknow and grow your teaching career.</p>
            <Button asChild size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 px-10 py-7 text-lg font-bold rounded-2xl shadow-xl">
               <Link href="/signup?role=teacher">Register as a Teacher</Link>
            </Button>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
      </section>

      {/* 7. Internal Linking */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/50">
         <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-bold mb-10 text-slate-900 dark:text-white flex items-center gap-2">
               <Search className="text-indigo-600" size={20} /> Browse More Tutors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
               <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-widest text-xs">Search by Class</h4>
                  <ul className="space-y-3">
                     {['class-9', 'class-10', 'class-11', 'class-12'].map(c => (
                        <li key={c}>
                           <Link href={`/home-tutors/${subjectRaw}-tutor-${c}-lucknow`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                              {subject} Tutor for {c.replace('class-', 'Class ')} in {area}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>
               <div>
                   <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-widest text-xs">Search by Subject</h4>
                   <ul className="space-y-3">
                     {['physics', 'chemistry', 'english', 'biology'].map(s => (
                        <li key={s}>
                           <Link href={`/home-tutors/${s}-tutor-${data.classRaw}-lucknow`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                              {s.charAt(0).toUpperCase() + s.slice(1)} Tutor for {data.classGrade} in {area}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>
               <div>
                   <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-widest text-xs">Search by Area</h4>
                   <ul className="space-y-3">
                     {['gomti-nagar', 'aliganj', 'hazratganj', 'indira-nagar'].map(a => (
                        <li key={a}>
                           <Link href={`/home-tutors/${subjectRaw}-tutor-${data.classRaw}-${a}-lucknow`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                              {subject} Tutor for {data.classGrade} in {a.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* Floating Buttons */}
       <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
        <a href="https://wa.me/916387488141" className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"><MessageCircle size={24} /></a>
        <a href="tel:6387488141" className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"><Phone size={24} /></a>
      </div>
    </div>
  );
}

// Sub-components
const FeatureCard = ({ icon, title, desc }) => (
  <Card className="border-none bg-indigo-50/30 dark:bg-indigo-900/10 p-2 group hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl transition-all h-full">
     <CardContent className="p-6">
        <div className="mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform inline-block">
           {icon}
        </div>
        <h3 className="font-bold text-lg mb-3 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
     </CardContent>
  </Card>
);

const Step = ({ number, title, desc }) => (
  <div className="relative z-10">
     <div className="text-6xl font-black text-indigo-100 dark:text-indigo-900/20 mb-4">{number}</div>
     <h3 className="font-bold text-xl mb-3 dark:text-white">{title}</h3>
     <p className="text-slate-600 dark:text-slate-400">{desc}</p>
  </div>
);

const FAQItem = ({ q, a }) => (
  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
     <h4 className="font-bold text-lg mb-3 text-slate-900 dark:text-white flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-indigo-500"></span> {q}
     </h4>
     <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-5">{a}</p>
  </div>
);
