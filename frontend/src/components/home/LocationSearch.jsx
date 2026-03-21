"use client";
import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AREAS = [
  { name: 'Gomti Nagar', slug: 'gomti-nagar' },
  { name: 'Aliganj', slug: 'aliganj' },
  { name: 'Indira Nagar', slug: 'indira-nagar' },
  { name: 'Hazratganj', slug: 'hazratganj' },
  { name: 'Rajajipuram', slug: 'rajajipuram' },
  { name: 'Alambagh', slug: 'alambagh' },
  { name: 'Chinhat', slug: 'chinhat' },
  { name: 'Vibhuti Khand', slug: 'vibhuti-khand' },
  { name: 'Nirala Nagar', slug: 'nirala-nagar' },
  { name: 'Mahanagar', slug: 'mahanagar' },
  { name: 'Jankipuram', slug: 'jankipuram' },
  { name: 'Sultanpur Road', slug: 'sultanpur-road' },
  { name: 'Faizabad Road', slug: 'faizabad-road' },
  { name: 'Telibagh', slug: 'telibagh' },
  { name: 'Sushant Golf City', slug: 'sushant-golf-city' },
];

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const LocationSearch = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-4">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase mb-3">Local Expertise</h2>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
              Best Home Tutors in Your <span className="text-indigo-600 dark:text-indigo-400">Neighborhood</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Find verified teachers living near you in Lucknow for home visits and personalized attention.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 gap-4">
          {AREAS.map((area, index) => (
            <FadeIn key={area.slug} delay={index * 0.05}>
              <Link 
                href={`/home-tutors/home-tutor-${area.slug}-lucknow`}
                className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl dark:hover:shadow-indigo-900/20 transition-all flex flex-col gap-3 h-full"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                    <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{area.name}</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Home Tutors</p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.8}>
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold">Don't see your area mentioned?</h3>
              <p className="text-indigo-100 mt-2">We provide home tutors across all locations in Lucknow. Post your requirement today.</p>
            </div>
            <Link 
              href="/signup?role=parent"
              className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Get a Tutor Now
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default LocationSearch;
