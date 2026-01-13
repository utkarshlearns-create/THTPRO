import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Settings, 
  LogOut, 
  Menu,
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Lock,
  Bell
} from 'lucide-react';
import API_BASE_URL from '../config';

const TutorDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard_home'); // dashboard_home, personal, professional, documents
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileId, setProfileId] = useState(null);
    const [status, setStatus] = useState('SIGNED_UP'); // SIGNED_UP, UNDER_REVIEW, APPROVED, etc
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [stats, setStats] = useState({ total_applications: 0, accepted_applications: 0 });

    const [formData, setFormData] = useState({
        // Personal
        full_name: '',
        gender: '',
        marital_status: '',
        whatsapp_number: '',
        dob: '',
        about_me: '',
        local_address: '',
        permanent_address: '',
        locality: '',
        teaching_mode: 'BOTH',
        
        // Professional
        highest_qualification: '',
        teaching_experience_years: '',
        teaching_experience_school_years: '',
        expected_fee: '',
        
        // Qualifications
        intermediate_stream: '',
        intermediate_school: '',
        intermediate_year: '',
        intermediate_board: '',
        highest_stream: '',
        highest_year: '',
        highest_university: '',
        highest_college: '',
        
        // Certifications
        is_bed: false,
        is_tet: false,
        is_mphil: false,
        is_phd: false,
    });

    const [kycFiles, setKycFiles] = useState({
        aadhaar_document: null,
        education_certificate: null,
        photo: null
    });
    const [kycUploading, setKycUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/dashboard/stats/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setProfileId(data.id);
                setCompletionPercentage(data.profile_completion_percentage || 0);
                
                // Map API data to state
                setFormData(prev => ({
                    ...prev,
                    ...data
                }));

                if (data.status_msg) {
                    setStatus(data.status_msg.status);
                }
            } else if (response.status === 401) {
                handleLogout();
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setCompletionPercentage(data.profile_completion_percentage);
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('An error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setKycFiles(prev => ({...prev, [fieldName]: file}));
        }
    };

    const handleKycSubmit = async () => {
        if (!kycFiles.aadhaar_document || !kycFiles.education_certificate || !kycFiles.photo) {
            alert("Please select all required documents.");
            return;
        }

        setKycUploading(true);
        try {
            const token = localStorage.getItem('access');
            const data = new FormData();
            data.append('aadhaar_document', kycFiles.aadhaar_document);
            data.append('education_certificate', kycFiles.education_certificate);
            data.append('photo', kycFiles.photo);

            const response = await fetch(`${API_BASE_URL}/api/users/kyc/submit/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (response.ok) {
                const result = await response.json();
                setStatus(result.status);
                alert("KYC Submitted Successfully! Your profile is now under review.");
            } else {
                const err = await response.json();
                alert(err.error || "KYC Submission Upload Failed");
            }
        } catch (error) {
            console.error(error);
            alert("Network error during upload.");
        } finally {
            setKycUploading(false);
        }
    };

    const isLocked = status === 'UNDER_REVIEW' || status === 'APPROVED';

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`bg-slate-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-30`}>
                <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-900">
                     {sidebarOpen ? (
                        <div className="font-bold text-xl tracking-wider flex flex-col items-center">
                            <span>THE HOME</span>
                            <span className="text-xs font-normal text-slate-400">TUITIONS</span>
                        </div>
                     ) : (
                        <span className="font-bold text-xl">THT</span>
                     )}
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        <SidebarItem 
                            icon={<LayoutDashboard size={20} />} 
                            label="Dashboard" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'dashboard_home'}
                            onClick={() => setActiveTab('dashboard_home')}
                        />
                        <SidebarItem 
                            icon={<User size={20} />} 
                            label="Edit Profile" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'personal' || activeTab === 'professional'}
                            onClick={() => setActiveTab('personal')}
                        />
                        <SidebarItem 
                            icon={<FileText size={20} />} 
                            label="Document Upload" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'documents'}
                            onClick={() => setActiveTab('documents')}
                        />
                        <SidebarItem 
                            icon={<Bell size={20} />} 
                            label="Notifications" 
                            isOpen={sidebarOpen} 
                            active={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                        />
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className={`flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full ${!sidebarOpen && 'justify-center'}`}>
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Navbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                            <Menu size={20} />
                        </button>
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2
                            ${status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                              status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}
                        `}>
                            {status === 'APPROVED' ? <CheckCircle size={14}/> : status === 'UNDER_REVIEW' ? <Clock size={14}/> : <AlertCircle size={14}/>}
                            {status.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         {/* Notification Bell */}
                         {/* Notification Bell Removed from here as per request */}
                         
                         {/* Profile Icon */}
                         
                         {/* Profile Icon */}
                         <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900 leading-none">Tutor</p>
                                <p className="text-xs text-slate-500 mt-0.5">Account</p>
                            </div>
                            <div className="h-9 w-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                                TU
                            </div>
                         </div>
                    </div>
                </header>

                <div className="p-6 max-w-5xl mx-auto">
                    {/* DASHBOARD HOME VIEW */}
                     {activeTab === 'dashboard_home' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                             <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Total Applications</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total_applications}</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Accepted Applications</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.accepted_applications}</p>
                                        </div>
                                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                            <CheckCircle size={20} />
                                        </div>
                                    </div>
                                </div>
                             </div>

                             {/* Show completion bar in dashboard too */}
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Profile Completion</h3>
                                        <p className="text-sm text-slate-500">Complete your profile to get verified.</p>
                                    </div>
                                    <span className="text-xl font-bold text-indigo-600">{completionPercentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={() => setActiveTab('personal')} 
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                        Continue Editing &rarr;
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS VIEW */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center">
                                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Bell size={24} className="text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No New Notifications</h3>
                                <p className="text-slate-500 mt-1">We will notify you when there are updates.</p>
                            </div>
                        </div>
                    )}

                    {/* PROFILE EDIT VIEWS - Only show if NOT home and NOT notifications */}
                    {activeTab !== 'dashboard_home' && activeTab !== 'notifications' && (
                    <div className="mb-8">
                         <div className="flex justify-between items-end mb-2">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
                                <p className="text-slate-500 mt-1">Manage your personal and professional information</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-indigo-600">{completionPercentage}%</span>
                                <span className="text-sm text-slate-500 block">Completion</span>
                            </div>
                         </div>
                         <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            />
                         </div>
                         {isLocked && (
                             <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                <Lock className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="font-medium text-amber-800">Profile Locked</h4>
                                    <p className="text-sm text-amber-600 mt-1">
                                        Your profile is currently {status.replace('_', ' ').toLowerCase()}. 
                                        Editing is disabled to ensure data consistency during the review process.
                                    </p>
                                </div>
                             </div>
                         )}
                    </div>
                    )}

                    {activeTab !== 'dashboard_home' && activeTab !== 'notifications' && (
                    <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-4">
                        <button 
                            onClick={handleSubmit} 
                            disabled={isLocked || saving}
                            className={`btn-primary flex items-center gap-2 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={18} />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                        <div className="flex border-b border-slate-200 overflow-x-auto">
                            <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} label="Personal Info" icon={<User size={18} />} />
                            <TabButton active={activeTab === 'professional'} onClick={() => setActiveTab('professional')} label="Professional Details" icon={<BriefcaseIcon />} />
                            <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} label="Documents (KYC)" icon={<FileText size={18} />} />
                        </div>
                    </div>
                    </>
                    )}

                    {activeTab !== 'dashboard_home' && activeTab !== 'notifications' && (
                        <div className="p-6 sm:p-8">
                            {/* FORM FIELDS - DISABLED IF LOCKED */}
                            <fieldset disabled={isLocked} className="space-y-6">
                            
                            {activeTab === 'personal' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="input-field" placeholder="Full Name" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="input-field">
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
                                                <select name="marital_status" value={formData.marital_status} onChange={handleInputChange} className="input-field">
                                                    <option value="">Select Status</option>
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                                                <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleInputChange} className="input-field" placeholder="+91..." />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Address Details</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Locality</label>
                                                <input type="text" name="locality" value={formData.locality} onChange={handleInputChange} className="input-field" placeholder="e.g. Indrapuri" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Local Address</label>
                                                <textarea name="local_address" value={formData.local_address} onChange={handleInputChange} rows="3" className="input-field resize-none"></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Permanent Address</label>
                                                <textarea name="permanent_address" value={formData.permanent_address} onChange={handleInputChange} rows="3" className="input-field resize-none"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">About Yourself</label>
                                        <textarea name="about_me" value={formData.about_me} onChange={handleInputChange} rows="4" className="input-field" placeholder="Tell us about your teaching style..."></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'professional' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    {/* Experience & Fees */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-slate-900">Experience & Fees</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Teaching Experience (Years)</label>
                                                <input type="number" name="teaching_experience_years" value={formData.teaching_experience_years} onChange={handleInputChange} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">School Experience (Years)</label>
                                                <input type="number" name="teaching_experience_school_years" value={formData.teaching_experience_school_years} onChange={handleInputChange} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Fee (₹)</label>
                                                <input type="number" name="expected_fee" value={formData.expected_fee} onChange={handleInputChange} className="input-field" />
                                            </div>
                                        </div>

                                        {/* Highest Qualification */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-slate-900">Highest Qualification</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Degree / Stream</label>
                                                <input type="text" name="highest_stream" value={formData.highest_stream} onChange={handleInputChange} className="input-field" placeholder="e.g. B.Tech CS" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">University</label>
                                                <input type="text" name="highest_university" value={formData.highest_university} onChange={handleInputChange} className="input-field" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
                                                    <input type="text" name="highest_college" value={formData.highest_college} onChange={handleInputChange} className="input-field" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                                                    <input type="number" name="highest_year" value={formData.highest_year} onChange={handleInputChange} className="input-field" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Certifications */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Certifications</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { key: 'is_bed', label: 'B.Ed' },
                                                { key: 'is_tet', label: 'T.E.T' },
                                                { key: 'is_mphil', label: 'M.Phil' },
                                                { key: 'is_phd', label: 'PhD' }
                                            ].map((cert) => (
                                                <label key={cert.key} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        name={cert.key} 
                                                        checked={formData[cert.key]} 
                                                        onChange={handleInputChange}
                                                        disabled={isLocked}
                                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                                                    />
                                                    <span className="text-slate-700 font-medium">{cert.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            </fieldset>

                            {activeTab === 'documents' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-slate-900">Upload KYC Documents</h3>
                                        {status === 'KYC_SUBMITTED' || status === 'UNDER_REVIEW' ? (
                                            <span className="text-sm font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">SUBMITTED</span>
                                        ) : (
                                            <button 
                                                onClick={handleKycSubmit}
                                                disabled={completionPercentage < 100 || kycUploading || isLocked}
                                                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {kycUploading ? 'Uploading...' : 'Submit KYC'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {completionPercentage < 100 && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            <span>Complete your profile (100%) to unlock KYC submission.</span>
                                        </div>
                                    )}

                                    {!isLocked ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FileUploadField 
                                                label="Adhaar Card" 
                                                accept="image/*" 
                                                onChange={(e) => handleFileChange(e, 'aadhaar_document')}
                                                selectedFile={kycFiles.aadhaar_document}
                                            />
                                            <FileUploadField 
                                                label="Education Cert" 
                                                accept="application/pdf,image/*" 
                                                onChange={(e) => handleFileChange(e, 'education_certificate')}
                                                selectedFile={kycFiles.education_certificate}
                                            />
                                            <FileUploadField 
                                                label="Profile Photo" 
                                                accept="image/*" 
                                                onChange={(e) => handleFileChange(e, 'photo')}
                                                selectedFile={kycFiles.photo}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-slate-50 border border-dashed rounded-xl">
                                            <p className="text-slate-500">Documents submitted for review.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active = false, isOpen, onClick }) => (
    <li>
        <button 
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-3 w-full transition-colors 
            ${active ? 'bg-slate-800 text-white border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'}
            ${!isOpen && 'justify-center px-2'}
        `}>
            <span className="flex-shrink-0">{icon}</span>
            {isOpen && <span className="font-medium">{label}</span>}
        </button>
    </li>
);

const TabButton = ({ active, onClick, label, icon }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 
        ${active ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
    `}>
        {icon}
        <span>{label}</span>
    </button>
);

const FileUploadField = ({ label, accept, onChange, selectedFile }) => (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/10 transition-colors group cursor-pointer relative">
        <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            accept={accept} 
            onChange={onChange}
        />
        <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-100 transition-colors">
            {selectedFile ? <CheckCircle size={20} className="text-green-600" /> : <Upload size={20} className="text-indigo-600" />}
        </div>
        <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
        <p className="text-xs text-slate-400">
            {selectedFile ? selectedFile.name : `Click to upload ${accept?.includes('image') ? 'Image' : 'File'}`}
        </p>
    </div>
);

// Simple briefcase icon component since it might not be exported by lucide-react in some versions
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);

export default TutorDashboard;
