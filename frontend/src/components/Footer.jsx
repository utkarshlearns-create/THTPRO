
import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                                The Home <span className="text-indigo-600 dark:text-indigo-400">Tuitions</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Connecting students with the best tutors for personalized learning experiences.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/find-tutor" className="hover:text-indigo-600 transition-colors">Find Tutors</Link></li>
                            <li><Link href="/signup?role=teacher" className="hover:text-indigo-600 transition-colors">Become a Tutor</Link></li>
                            <li><Link href="/institution-home" className="hover:text-indigo-600 transition-colors">For Institutions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/help" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Contact</h4>
                         <ul className="space-y-2 text-sm text-slate-500">
                            <li>support@thehometuitions.com</li>
                            <li>+91 98765 43210</li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">© {new Date().getFullYear()} The Home Tuitions. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
