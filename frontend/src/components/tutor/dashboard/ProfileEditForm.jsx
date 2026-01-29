import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Save, User, Briefcase, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';
import KYCUpload from './KYCUpload';

const ProfileEditForm = ({ formData, handleInputChange, handleSubmit, saving, isLocked, activeSection, setActiveSection, kycProps }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>
                {activeSection !== 'verification' && (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isLocked || saving}
                        variant="sapphire"
                        className="gap-2"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                )}
            </div>

            {/* Section Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 w-fit overflow-x-auto">
                <TabButton 
                    active={activeSection === 'personal'} 
                    onClick={() => setActiveSection('personal')} 
                    icon={<User size={16} />} 
                    label="Personal" 
                />
                <TabButton 
                    active={activeSection === 'professional'} 
                    onClick={() => setActiveSection('professional')} 
                    icon={<Briefcase size={16} />} 
                    label="Professional" 
                />
                <TabButton 
                    active={activeSection === 'verification'} 
                    onClick={() => setActiveSection('verification')} 
                    icon={<ShieldCheck size={16} />} 
                    label="Verification" 
                />
            </div>

            {activeSection === 'verification' ? (
                <KYCUpload {...kycProps} />
            ) : (
                <div className="space-y-6">
                    <fieldset disabled={isLocked} className="space-y-6">
                        {activeSection === 'personal' ? (
                            <>
                                {/* Personal Identity Section */}
                                <Card>
                                    <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Identity & Contact</CardTitle>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Your basic personal details</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormGroup label="Full Name">
                                            <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="input-field" placeholder="e.g. John Doe" />
                                        </FormGroup>
                                        <FormGroup label="WhatsApp Number">
                                            <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleInputChange} className="input-field" placeholder="+91 98765 43210" />
                                        </FormGroup>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormGroup label="Gender">
                                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="input-field">
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </FormGroup>
                                            <FormGroup label="Date of Birth">
                                                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="input-field" />
                                            </FormGroup>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Location & About Section */}
                                <Card>
                                    <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Location & Bio</CardTitle>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Where are you based and what do you do?</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormGroup label="City / Locality">
                                            <input type="text" name="locality" value={formData.locality} onChange={handleInputChange} className="input-field" placeholder="e.g. Indrapuri, Gopalpura" />
                                        </FormGroup>
                                        <div className="hidden md:block"></div>
                                        <div className="col-span-1 md:col-span-2">
                                            <FormGroup label="About Me">
                                                <textarea 
                                                    name="about_me" 
                                                    value={formData.about_me} 
                                                    onChange={handleInputChange} 
                                                    rows="4" 
                                                    className="input-field resize-none leading-relaxed" 
                                                    placeholder="Write a brief introduction about your teaching experience, methodology, and what makes you a great tutor..."
                                                ></textarea>
                                            </FormGroup>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <>
                                {/* Professional Overview */}
                                <Card>
                                    <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Teaching Preferences</CardTitle>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Set your mode, fees, and experience</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormGroup label="Teaching Mode">
                                            <select name="teaching_mode" value={formData.teaching_mode} onChange={handleInputChange} className="input-field">
                                                <option value="BOTH">Online & Offline</option>
                                                <option value="ONLINE">Online Only</option>
                                                <option value="OFFLINE">Offline / Home Tuition</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="Expected Fee">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                <input type="number" name="expected_fee" value={formData.expected_fee} onChange={handleInputChange} className="input-field pl-8" placeholder="500" />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/hr</span>
                                            </div>
                                        </FormGroup>
                                        <FormGroup label="Total Experience">
                                            <div className="relative">
                                                <input type="number" name="teaching_experience_years" value={formData.teaching_experience_years} onChange={handleInputChange} className="input-field" placeholder="0" />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Years</span>
                                            </div>
                                        </FormGroup>
                                    </CardContent>
                                </Card>

                                {/* Education Details */}
                                <Card>
                                    <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Education Details</CardTitle>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Your highest qualification info</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormGroup label="Degree / Stream">
                                            <input type="text" name="highest_stream" value={formData.highest_stream} onChange={handleInputChange} className="input-field" placeholder="e.g. B.Tech CS" />
                                        </FormGroup>
                                        <FormGroup label="University / College">
                                            <input type="text" name="highest_university" value={formData.highest_university} onChange={handleInputChange} className="input-field" placeholder="e.g. IIT Delhi" />
                                        </FormGroup>
                                        <FormGroup label="Passing Year">
                                            <input type="number" name="highest_year" value={formData.highest_year} onChange={handleInputChange} className="input-field" placeholder="YYYY" />
                                        </FormGroup>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </fieldset>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap",
            active 
                ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
        )}
    >
        {icon} {label}
    </button>
);

const FormGroup = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 block">{label}</label>
        {children}
    </div>
);

export default ProfileEditForm;
