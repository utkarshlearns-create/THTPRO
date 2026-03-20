"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import API_BASE_URL from '../config';
import { clearAuthState } from '../utils/auth';
import TutorDashboardLayout from '../components/dashboard/TutorDashboardLayout';
import DashboardHome from '../components/tutor/dashboard/DashboardHome';
import ProfileEditForm from '../components/tutor/dashboard/ProfileEditForm';
import KYCUpload from '../components/tutor/dashboard/KYCUpload';
import WalletSection from '../components/tutor/dashboard/WalletSection';
import JobMatchList from '../components/tutor/dashboard/JobMatchList';
import MyApplications from '../components/tutor/dashboard/MyApplications';
import NotificationsTab from '../components/tutor/dashboard/NotificationsTab';
import { toast } from 'react-hot-toast';
import { Lock as LockIcon, User, Phone, Mail, X, ArrowRight } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

const TutorDashboard = () => {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'dashboard_home';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [activeSection, setActiveSection] = useState('personal'); // For Profile Edit (Personal/Professional)
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showProfileReminder, setShowProfileReminder] = useState(false);
    const [registrationInfo, setRegistrationInfo] = useState(null);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('SIGNED_UP'); 
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [stats, setStats] = useState({ total_applications: 0, accepted_applications: 0 });
    const [userProfile, setUserProfile] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '', gender: '', marital_status: '', whatsapp_number: '', dob: '', about_me: '',
        local_address: '', permanent_address: '', locality: '', teaching_mode: 'BOTH',
        highest_qualification: '', teaching_experience_years: '', teaching_experience_school_years: '', expected_fee: '',
        intermediate_stream: '', intermediate_school: '', intermediate_year: '', intermediate_board: '',
        highest_stream: '', highest_year: '', highest_university: '', highest_college: '',
        is_bed: false, is_tet: false, is_mphil: false, is_phd: false,
        class_subjects: {},
    });

    const [kycFiles, setKycFiles] = useState({ aadhaar_front: null, aadhaar_back: null, highest_qualification_certificate: null });
    const [kycUploading, setKycUploading] = useState(false);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
             if (tabParam === 'documents') {
                setActiveTab('profile');
                setActiveSection('verification');
             } else {
                setActiveTab(tabParam);
             }
        }
        fetchProfile();
        fetchStats();
        fetchRegistrationInfo();
    }, [searchParams]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/dashboard/stats/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) setStats(await response.json());
        } catch (error) { console.error("Error fetching stats:", error); }
    };

    const fetchRegistrationInfo = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/me/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRegistrationInfo(data);
            }
        } catch (error) { console.error("Error fetching user info:", error); }
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserProfile(data);
                const pct = data.profile_completion_percentage || 0;
                setCompletionPercentage(pct);
                setFormData(prev => ({ ...prev, ...data }));
                if (data.status_msg) setStatus(data.status_msg.status);
                // Show profile reminder popup if profile is incomplete
                if (pct < 100) {
                    const dismissed = sessionStorage.getItem('profile_reminder_dismissed');
                    if (!dismissed) setShowProfileReminder(true);
                }
            } else if (response.status === 401) {
                clearAuthState();
                router.push('/login');
            }
        } catch (error) { console.error("Error fetching profile:", error); } 
        finally { setLoading(false); }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleProfileFileChange = (e) => {
        const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
        const fieldName = e.target.name;
        
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ 
                ...prev, 
                [fieldName]: file,
                [`${fieldName}Preview`]: previewUrl
            }));
        } else {
            setFormData(prev => ({ 
                ...prev, 
                [fieldName]: null,
                [`${fieldName}Preview`]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        if(e) e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('access');
            
            // Check if we have files to upload
            const hasFiles = formData.profile_image instanceof File || formData.intro_video instanceof File;
            
            let fetchOptions = {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const nullIfEmptyFields = ['dob', 'expected_fee', 'intermediate_year', 'highest_year'];
            const zeroIfEmptyFields = ['teaching_experience_years', 'teaching_experience_school_years'];

            if (hasFiles) {
                const submissionData = new FormData();
                const fileFields = ['profile_image', 'intro_video', 'resume'];

                // Append all fields to FormData
                Object.keys(formData).forEach(key => {
                    if (key.endsWith('Preview')) return; // skip preview URLs
                    
                    let value = formData[key];
                    
                    // Prevent sending existing string URLs to FileFields (causes "submitted data was not a file" error)
                    if (fileFields.includes(key) && !(value instanceof File)) {
                        return; 
                    }

                    if (value === '') {
                        if (zeroIfEmptyFields.includes(key)) {
                            value = 0;
                        } else if (nullIfEmptyFields.includes(key)) {
                            return; // Omit from FormData instead of sending empty string
                        }
                    }

                    if (value instanceof File) {
                        submissionData.append(key, value);
                    } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                        submissionData.append(key, JSON.stringify(value));
                    } else if (value !== null && value !== undefined) {
                        submissionData.append(key, value);
                    }
                });
                fetchOptions.body = submissionData;
                // DO NOT set Content-Type header when sending FormData! The browser sets it with boundary automatically
            } else {
                fetchOptions.headers['Content-Type'] = 'application/json';
                
                // Exclude File objects and string URLs for file fields from JSON payload
                const jsonPayload = { ...formData };
                delete jsonPayload.profile_imagePreview;
                delete jsonPayload.intro_videoPreview;
                delete jsonPayload.profile_image;
                delete jsonPayload.intro_video;
                delete jsonPayload.resume;
                
                // Convert specific empty strings to null or 0 for backend validation
                nullIfEmptyFields.forEach(field => {
                     if (jsonPayload[field] === '') {
                         jsonPayload[field] = null;
                     }
                });
                zeroIfEmptyFields.forEach(field => {
                     if (jsonPayload[field] === '') {
                         jsonPayload[field] = 0;
                     }
                });
                
                fetchOptions.body = JSON.stringify(jsonPayload);
            }

            const response = await fetch(`${API_BASE_URL}/api/users/profile/`, fetchOptions);

            if (response.ok) {
                const data = await response.json();
                
                // Sync form data with server response and clear previews
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    profile_imagePreview: null,
                    intro_videoPreview: null
                }));
                setCompletionPercentage(data.profile_completion_percentage);
                toast.success('Profile updated successfully!', { position: 'bottom-center' });
            } else {
                let errorMsg = 'Failed to update profile.';
                try {
                    const errorData = await response.json();
                    errorMsg += ' Details: ' + JSON.stringify(errorData);
                } catch(e) {}
                toast.error(errorMsg, { position: 'bottom-center' });
            }
        } catch (error) { console.error("Error updating profile:", error); toast.error('Error occurred.', { position: 'bottom-center' }); } 
        finally { setSaving(false); }
    };

    const handleFileChange = (e, fieldName) => {
        if (e.target.files[0]) setKycFiles(prev => ({...prev, [fieldName]: e.target.files[0]}));
    };

    const handleKycSubmit = async () => {
        if (!kycFiles.aadhaar_front || !kycFiles.aadhaar_back || !kycFiles.highest_qualification_certificate) return alert("Please select all Aadhaar Front, Aadhaar Back and Certificate.");
        setKycUploading(true);
        try {
            const token = localStorage.getItem('access');
            const data = new FormData();
            Object.keys(kycFiles).forEach(key => data.append(key, kycFiles[key]));
            
            const response = await fetch(`${API_BASE_URL}/api/users/kyc/upload/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
            if (response.ok) {
                setStatus((await response.json()).status);
                alert("KYC Submitted Successfully!");
            } else { 
                const resData = await response.json();
                console.error("KYC Upload Error:", resData);
                alert(`Upload Failed: ${resData.error || JSON.stringify(resData)}`); 
            }
        } catch (error) { alert("Network error."); } 
        finally { setKycUploading(false); }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400">Loading Dashboard...</div>;

    const isLocked = status === 'UNDER_REVIEW';

    return (
        <TutorDashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} user={formData}>
            
            {activeTab === 'dashboard_home' && (
                <DashboardHome 
                    user={formData} 
                    completionPercentage={completionPercentage} 
                    stats={stats}
                    setActiveTab={setActiveTab}
                />
            )}

            {(activeTab === 'profile' || activeTab === 'personal') && (
                <ProfileEditForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    handleProfileFileChange={handleProfileFileChange}
                    handleSubmit={handleSubmit}
                    saving={saving}
                    isLocked={isLocked}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    kycProps={{
                        kycFiles,
                        handleFileChange,
                        handleKycSubmit,
                        kycUploading,
                        status
                    }}
                />
            )}

            {/* KYC Upload is now integrated into Profile -> Verification */
            activeTab === 'documents' && (
                <div className="flex flex-col items-center justify-center py-12">
                     <p className="text-slate-500 mb-4">Redirecting to Verification...</p>
                     {/* Logic in useEffect handles this, or manual switch */}
                </div>
            )}
            
            {activeTab === 'wallet' && <WalletSection />}

            {activeTab === 'applications' && <MyApplications />}

            {activeTab === 'tuitions' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Jobs</h1>
                    </div>
                    <JobMatchList userLocality={formData?.locality} />
                     {/* We can add more 'all jobs' list later */}
                </div>
            )}

            {activeTab === 'notifications' && <NotificationsTab />}

            {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Security</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Manage your account security and password.</p>
                        <button
                            onClick={() => setShowChangePassword(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900/50 transition-all shadow-sm"
                        >
                            <LockIcon className="h-4 w-4 text-indigo-500" />
                            Change Password
                        </button>
                    </div>
                </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'locations' || activeTab === 'support') && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                    <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Coming Soon</h2>
                    <p>This module is under development.</p>
                </div>
            )}

            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />

            {/* Profile Completion Reminder Popup */}
            {showProfileReminder && registrationInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md relative border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                            <button
                                onClick={() => {
                                    setShowProfileReminder(false);
                                    sessionStorage.setItem('profile_reminder_dismissed', 'true');
                                }}
                                className="absolute top-4 right-4 text-white/70 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="text-xl font-bold text-white">Welcome, {registrationInfo.first_name || 'Tutor'}!</h2>
                            <p className="text-indigo-100 text-sm mt-1">Your profile is {completionPercentage}% complete</p>
                        </div>

                        {/* Progress bar */}
                        <div className="px-6 pt-4">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Registration info card */}
                        <div className="px-6 py-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Your registered details:</p>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Name</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{registrationInfo.first_name || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Phone</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{registrationInfo.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Email</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{registrationInfo.email || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-6 pb-6">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Complete your profile to unlock job applications and increase your visibility to parents.</p>
                            <button
                                onClick={() => {
                                    setShowProfileReminder(false);
                                    sessionStorage.setItem('profile_reminder_dismissed', 'true');
                                    setActiveTab('profile');
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                            >
                                Complete My Profile
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setShowProfileReminder(false);
                                    sessionStorage.setItem('profile_reminder_dismissed', 'true');
                                }}
                                className="w-full text-center mt-2 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm transition-colors"
                            >
                                I'll do it later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TutorDashboardLayout>
    );
};

export default TutorDashboard;



