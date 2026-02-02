import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../config';
import TutorDashboardLayout from '../components/dashboard/TutorDashboardLayout';
import DashboardHome from '../components/tutor/dashboard/DashboardHome';
import ProfileEditForm from '../components/tutor/dashboard/ProfileEditForm';
import KYCUpload from '../components/tutor/dashboard/KYCUpload';
import WalletSection from '../components/tutor/dashboard/WalletSection';
import JobMatchList from '../components/tutor/dashboard/JobMatchList';
import MyApplications from '../components/tutor/dashboard/MyApplications';

const TutorDashboard = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'dashboard_home';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [activeSection, setActiveSection] = useState('personal'); // For Profile Edit (Personal/Professional)
    const navigate = useNavigate();

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
    });

    const [kycFiles, setKycFiles] = useState({ aadhaar_document: null, education_certificate: null, photo: null });
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
                setCompletionPercentage(data.profile_completion_percentage || 0);
                setFormData(prev => ({ ...prev, ...data }));
                if (data.status_msg) setStatus(data.status_msg.status);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) { console.error("Error fetching profile:", error); } 
        finally { setLoading(false); }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        if(e) e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const data = await response.json();
                setCompletionPercentage(data.profile_completion_percentage);
                alert('Profile updated successfully!');
            } else { alert('Failed to update profile.'); }
        } catch (error) { console.error("Error updating profile:", error); alert('Error occurred.'); } 
        finally { setSaving(false); }
    };

    const handleFileChange = (e, fieldName) => {
        if (e.target.files[0]) setKycFiles(prev => ({...prev, [fieldName]: e.target.files[0]}));
    };

    const handleKycSubmit = async () => {
        if (!kycFiles.aadhaar_document || !kycFiles.education_certificate || !kycFiles.photo) return alert("Please select all documents.");
        setKycUploading(true);
        try {
            const token = localStorage.getItem('access');
            const data = new FormData();
            Object.keys(kycFiles).forEach(key => data.append(key, kycFiles[key]));
            
            const response = await fetch(`${API_BASE_URL}/api/users/kyc/submit/`, {
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

    const isLocked = status === 'UNDER_REVIEW' || status === 'APPROVED';

    return (
        <TutorDashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} user={formData}>
            
            {activeTab === 'dashboard_home' && (
                <DashboardHome 
                    user={formData} 
                    completionPercentage={completionPercentage} 
                    stats={stats}
                />
            )}

            {(activeTab === 'profile' || activeTab === 'personal') && (
                <ProfileEditForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
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
                    <JobMatchList />
                     {/* We can add more 'all jobs' list later */}
                </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'locations' || activeTab === 'settings' || activeTab === 'support' || activeTab === 'notifications') && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                    <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Coming Soon</h2>
                    <p>This module is under development.</p>
                </div>
            )}
        </TutorDashboardLayout>
    );
};

export default TutorDashboard;
