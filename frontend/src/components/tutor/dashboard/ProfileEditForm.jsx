import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Save, User, Briefcase, ShieldCheck, Camera, RotateCcw, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import KYCUpload from './KYCUpload';
import MultiSelect from '../../ui/multi-select';
import { State, City } from 'country-state-city';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'user', 
                        width: { ideal: 480 }, 
                        height: { ideal: 480 } 
                    } 
                });
                console.log("Camera stream started");
                setStream(mediaStream);
                if (videoRef.current) videoRef.current.srcObject = mediaStream;
            } catch (err) {
                console.error("Camera error:", err);
                setError("Could not access camera. Please check permissions.");
            }
        }
        startCamera();
        return () => {
            if (stream) {
                console.log("Stopping camera tracks");
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capture = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (!canvas || !video) return;

        try {
            const width = video.videoWidth || 640;
            const height = video.videoHeight || 480;
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, width, height);
            ctx.restore();
            
            // toDataURL followed by manual conversion is most compatible
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            // Manual conversion to avoid fetch() data URL restrictions
            const byteString = atob(dataUrl.split(',')[1]);
            const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
            
            onCapture(file);
            onClose();
        } catch (err) {
            console.error("Capture failure:", err);
            alert("Capture error: " + err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <style>{`
                .mirror { transform: scaleX(-1); }
            `}</style>
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Take Profile Photo</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {error ? (
                        <div className="p-6 text-center text-red-500 font-medium">{error}</div>
                    ) : (
                        <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover mirror" />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="p-6 flex justify-center gap-4 bg-slate-50 dark:bg-slate-900/50">
                    <Button variant="outline" onClick={onClose} className="rounded-full px-6">Cancel</Button>
                    {!error && (
                        <Button onClick={capture} variant="sapphire" className="rounded-full px-8 gap-2">
                            <Camera size={18} /> Capture
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProfileEditForm = ({ formData, handleInputChange, handleProfileFileChange, handleSubmit, saving, isLocked, activeSection, setActiveSection, kycProps }) => {
    const [showCamera, setShowCamera] = useState(false);

    // Country-State-City data for India
    const indiaStates = State.getStatesOfCountry('IN');
    const selectedStateObj = formData.state ? indiaStates.find(s => s.name === formData.state) : null;
    const cities = selectedStateObj ? City.getCitiesOfState('IN', selectedStateObj.isoCode) : [];

    const onCameraCapture = (file) => {
        // Mocking an event object for the handler
        const event = {
            target: {
                name: 'profile_image',
                files: [file]
            }
        };
        handleProfileFileChange(event);
    };

    const handleStateChange = (e) => {
        handleInputChange(e);
        // Clear city when state changes to avoid mismatched data
        handleInputChange({ target: { name: 'city', value: '' } });
    };

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
                                        
                                        {/* Profile Image Upload */}
                                        <div className="col-span-1 md:col-span-2 flex items-center space-x-6">
                                            <div className="shrink-0">
                                                <img 
                                                    className="h-24 w-24 object-cover rounded-full border-4 border-white dark:border-slate-800 shadow-md" 
                                                    src={formData.profile_imagePreview || formData.profile_image || formData.external_profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.full_name || 'Tutor'}`} 
                                                    alt="Profile" 
                                                />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="block">
                                                    <span className="sr-only">Choose profile photo</span>
                                                    <input 
                                                        type="file" 
                                                        name="profile_image"
                                                        onChange={handleProfileFileChange}
                                                        accept="image/*"
                                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 dark:hover:file:bg-indigo-500/20"
                                                    />
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <Button 
                                                        type="button"
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="gap-2 rounded-full border-slate-200 dark:border-white/10"
                                                        onClick={() => setShowCamera(true)}
                                                    >
                                                        <Camera size={14} />
                                                        Take Photo
                                                    </Button>
                                                    {(formData.profile_imagePreview || formData.profile_image instanceof File) && (
                                                        <Button 
                                                            type="button"
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 gap-1"
                                                            onClick={() => handleProfileFileChange({ target: { name: 'profile_image', files: [] } })}
                                                        >
                                                            <RotateCcw size={14} />
                                                            Reset
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {showCamera && (
                                            <CameraCapture 
                                                onCapture={onCameraCapture} 
                                                onClose={() => setShowCamera(false)} 
                                            />
                                        )}
                                        <FormGroup label="Full Name">
                                            <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. John Doe" />
                                        </FormGroup>
                                        <FormGroup label="WhatsApp Number">
                                            <input type="text" name="whatsapp_number" value={formData.whatsapp_number || ''} onChange={handleInputChange} className="input-field" placeholder="+91 98765 43210" />
                                        </FormGroup>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormGroup label="Gender">
                                                <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="input-field">
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </FormGroup>
                                            <FormGroup label="Marital Status">
                                                <select name="marital_status" value={formData.marital_status || ''} onChange={handleInputChange} className="input-field">
                                                    <option value="">Select Status</option>
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                </select>
                                            </FormGroup>
                                        </div>
                                        <FormGroup label="Date of Birth">
                                            <input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} className="input-field" />
                                        </FormGroup>
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
                                        <FormGroup label="House No.">
                                            <input type="text" name="house_no" value={formData.house_no || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. Flat 101, Bldg A" />
                                        </FormGroup>
                                        <FormGroup label="Area / Street">
                                            <input type="text" name="area" value={formData.area || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. Indrapuri, Gopalpura" />
                                        </FormGroup>
                                        <FormGroup label="Landmark">
                                            <input type="text" name="landmark" value={formData.landmark || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. Near Shiv Temple" />
                                        </FormGroup>
                                        <FormGroup label="State">
                                            <select name="state" value={formData.state || ''} onChange={handleStateChange} className="input-field">
                                                <option value="">Select State</option>
                                                {indiaStates.map(state => (
                                                    <option key={state.isoCode} value={state.name}>{state.name}</option>
                                                ))}
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="City">
                                            <select name="city" value={formData.city || ''} onChange={handleInputChange} className="input-field" disabled={!formData.state}>
                                                <option value="">Select City</option>
                                                {cities.map(city => (
                                                    <option key={city.name} value={city.name}>{city.name}</option>
                                                ))}
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="Pincode">
                                            <input type="text" name="pincode" value={formData.pincode || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. 226016" />
                                        </FormGroup>
                                        <FormGroup label="Permanent Address">
                                            <textarea name="permanent_address" value={formData.permanent_address || ''} onChange={handleInputChange} rows="2" className="input-field resize-none" placeholder="Permanent address (if different)"></textarea>
                                        </FormGroup>
                                        <div className="hidden md:block"></div>
                                        <div className="col-span-1 md:col-span-2">
                                            <FormGroup label="About Me">
                                                <textarea 
                                                    name="about_me" 
                                                    value={formData.about_me || ''} 
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
                                        {/* Dynamic Class & Subject Mapping */}
                                        <div className="col-span-1 md:col-span-2 space-y-4">
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 block">Classes & Subjects You Teach</label>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-1 mt-1">Add a class to specify which subjects you teach for it.</p>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <select id="new-class-select" className="input-field py-1 text-sm bg-slate-50 border-slate-200">
                                                        <option value="">Add Class</option>
                                                        {['Class 1-5', 'Class 6-8', 'Class 9-10', 'Class 11-12', 'Competitive Exams'].filter(c => !formData.class_subjects || !Object.keys(formData.class_subjects).includes(c)).map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <Button 
                                                        type="button" 
                                                        size="sm" 
                                                        variant="sapphire" 
                                                        className="whitespace-nowrap px-3 h-9"
                                                        onClick={() => {
                                                            const select = document.getElementById('new-class-select');
                                                            const val = select.value;
                                                            if (val) {
                                                                const newMapping = { ...(formData.class_subjects || {}) };
                                                                newMapping[val] = [];
                                                                handleInputChange({ target: { name: 'class_subjects', value: newMapping } });
                                                                select.value = "";
                                                            }
                                                        }}
                                                    >
                                                        + Add
                                                    </Button>
                                                </div>
                                            </div>

                                            {(!formData.class_subjects || Object.keys(formData.class_subjects).length === 0) ? (
                                                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-slate-500">
                                                    No classes added yet. Select a class from the dropdown above.
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(formData.class_subjects).map(([className, subjects]) => (
                                                        <div key={className} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 md:items-start group">
                                                            <div className="md:w-1/3 flex items-center justify-between">
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{className}</span>
                                                                <button 
                                                                    type="button"
                                                                    className="md:hidden text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                                                                    onClick={() => {
                                                                        const newMapping = { ...formData.class_subjects };
                                                                        delete newMapping[className];
                                                                        handleInputChange({ target: { name: 'class_subjects', value: newMapping } });
                                                                    }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                            <div className="md:w-2/3 flex-1 flex gap-2 items-start">
                                                                <div className="w-full">
                                                                    <MultiSelect 
                                                                        options={['Mathematics', 'Science', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science', 'Economics', 'Accountancy']}
                                                                        value={subjects}
                                                                        onChange={(val) => {
                                                                            const newMapping = { ...formData.class_subjects };
                                                                            newMapping[className] = val;
                                                                            handleInputChange({ target: { name: 'class_subjects', value: newMapping } });
                                                                        }}
                                                                        placeholder={`Select subjects for ${className}`}
                                                                    />
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    className="hidden md:block mt-2 text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                    title={`Remove ${className}`}
                                                                    onClick={() => {
                                                                        const newMapping = { ...formData.class_subjects };
                                                                        delete newMapping[className];
                                                                        handleInputChange({ target: { name: 'class_subjects', value: newMapping } });
                                                                    }}
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <FormGroup label="Video Confession / Introduction (Max 50MB)">
                                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl transition-colors hover:border-indigo-400 dark:hover:border-indigo-500">
                                                        <div className="space-y-1 text-center">
                                                            {formData.intro_videoPreview || formData.intro_video ? (
                                                                <div className="mb-4">
                                                                    <video 
                                                                        src={formData.intro_videoPreview || (typeof formData.intro_video === 'string' ? formData.intro_video : '')} 
                                                                        controls 
                                                                        className="mx-auto h-40 rounded-lg shadow-sm"
                                                                    />
                                                                    <div className="mt-2 text-sm text-slate-500 truncate max-w-xs mx-auto">
                                                                        {formData.intro_video instanceof File ? formData.intro_video.name : 'Current Video'}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                            <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                                                                <label htmlFor="intro_video_upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                                    <span>Upload a video</span>
                                                                    <input id="intro_video_upload" name="intro_video" type="file" className="sr-only" accept="video/mp4,video/webm,video/ogg" onChange={handleProfileFileChange} />
                                                                </label>
                                                                <p className="pl-1">or drag and drop</p>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">MP4, WebM, OGG up to 50MB</p>
                                                        </div>
                                                    </div>
                                                </FormGroup>
                                            </div>

                                        <FormGroup label="Teaching Mode">
                                            <select name="teaching_mode" value={formData.teaching_mode || ''} onChange={handleInputChange} className="input-field">
                                                <option value="BOTH">Online & Offline</option>
                                                <option value="ONLINE">Online Only</option>
                                                <option value="OFFLINE">Offline / Home Tuition</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="Expected Fee">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                <input type="number" name="expected_fee" value={formData.expected_fee === null ? '' : formData.expected_fee} onChange={handleInputChange} className="input-field pl-8" placeholder="500" />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/hr</span>
                                            </div>
                                        </FormGroup>
                                        <FormGroup label="Total Experience">
                                            <div className="relative">
                                                <input type="number" name="teaching_experience_years" value={formData.teaching_experience_years === null ? '' : formData.teaching_experience_years} onChange={handleInputChange} className="input-field" placeholder="0" />
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
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Your specific qualification info</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormGroup label="Highest Qualification">
                                            <select name="highest_qualification" value={formData.highest_qualification || ''} onChange={handleInputChange} className="input-field">
                                                <option value="">Select Degree</option>
                                                <option value="B.Tech">B.Tech</option>
                                                <option value="B.Sc">B.Sc</option>
                                                <option value="B.Com">B.Com</option>
                                                <option value="B.A">B.A</option>
                                                <option value="M.Tech">M.Tech</option>
                                                <option value="M.Sc">M.Sc</option>
                                                <option value="M.Com">M.Com</option>
                                                <option value="M.A">M.A</option>
                                                <option value="PhD">PhD</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="Specialization / Stream">
                                            <input type="text" name="highest_stream" value={formData.highest_stream || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. Computer Science" />
                                        </FormGroup>
                                        <FormGroup label="University Name">
                                            <input type="text" name="highest_university" value={formData.highest_university || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. University of Mumbai" />
                                        </FormGroup>
                                        <FormGroup label="College Name">
                                            <input type="text" name="highest_college" value={formData.highest_college || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. St. Xavier's College" />
                                        </FormGroup>
                                        <FormGroup label="Year of Completion">
                                            <input type="number" name="highest_year" value={formData.highest_year === null ? '' : formData.highest_year} onChange={handleInputChange} className="input-field" placeholder="2020" />
                                        </FormGroup>
                                         <FormGroup label="Intermediate (12th) Stream">
                                            <input type="text" name="intermediate_stream" value={formData.intermediate_stream || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. PCM / PCB / Commerce" />
                                        </FormGroup>
                                        <FormGroup label="12th School Name">
                                            <input type="text" name="intermediate_school" value={formData.intermediate_school || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. St. Xavier's" />
                                        </FormGroup>
                                        <FormGroup label="12th Completion Year">
                                            <input type="number" name="intermediate_year" value={formData.intermediate_year === null ? '' : formData.intermediate_year} onChange={handleInputChange} className="input-field" placeholder="2016" />
                                        </FormGroup>
                                        <FormGroup label="12th Board">
                                            <input type="text" name="intermediate_board" value={formData.intermediate_board || ''} onChange={handleInputChange} className="input-field" placeholder="e.g. CBSE / ICSE / UP Board" />
                                        </FormGroup>

                                        {/* Certifications Checkboxes */}
                                        <div className="col-span-1 md:col-span-2">
                                            <FormGroup label="Professional Certifications">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <input type="checkbox" name="is_bed" checked={formData.is_bed} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">B.Ed</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <input type="checkbox" name="is_tet" checked={formData.is_tet} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">TET</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <input type="checkbox" name="is_mphil" checked={formData.is_mphil} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">M.Phil</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <input type="checkbox" name="is_phd" checked={formData.is_phd} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ph.D</span>
                                                    </label>
                                                </div>
                                            </FormGroup>
                                        </div>
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

