"use client";
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../../config';

const UploadCard = ({ title, documentName, document, onFileSelect, accept }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            onFileSelect(documentName, file);
        }
    }, [documentName, onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-6 transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">Required</span>
            </div>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : document
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600'
                }`}
            >
                <input {...getInputProps()} />
                {document ? (
                    <div className="space-y-2">
                        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto" />
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">{document.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{(document.size / 1024).toFixed(2)} KB</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Upload className="h-12 w-12 text-slate-400 mx-auto" />
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
                        </p>
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                JPG, PNG, PDF • Max 5MB
            </p>
        </div>
    );
};

const KYCDocumentUpload = () => {
    const [documents, setDocuments] = useState({
        aadhaar_front: null,
        aadhaar_back: null,
        highest_qualification_certificate: null
    });

    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    const handleFileSelect = useCallback((docType, file) => {
        setDocuments(prev => ({ ...prev, [docType]: file }));
    }, []);

    const handleSubmit = async () => {
        if (!documents.aadhaar_front || !documents.aadhaar_back || !documents.highest_qualification_certificate) {
            alert('Please upload all required documents (Aadhaar Front, Back and Certificate)');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('aadhaar_front', documents.aadhaar_front);
        formData.append('aadhaar_back', documents.aadhaar_back);
        formData.append('highest_qualification_certificate', documents.highest_qualification_certificate);

        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/kyc/upload/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                setUploadStatus('success');
                alert('KYC documents submitted successfully! You will be notified once verified.');
                setTimeout(() => {
                    window.location.href = '/tutor/kyc/status';
                }, 2000);
            } else {
                const error = await response.json();
                setUploadStatus('error');
                alert(`Error: ${error.error || 'Failed to submit documents'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            alert('Failed to upload documents. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const uploadedCount = [documents.aadhaar_front, documents.aadhaar_back, documents.highest_qualification_certificate].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete KYC Verification</h1>
                    <p className="text-slate-600 dark:text-slate-400">Upload your documents to get verified and start posting job opportunities</p>
                </div>

                {/* Progress Indicator */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress: Step 2 of 4</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile</span>
                        </div>
                        <div className="flex-1 h-1 bg-indigo-600 dark:bg-indigo-500 rounded"></div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">2</span>
                            </div>
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Documents</span>
                        </div>
                        <div className="flex-1 h-1 bg-slate-300 dark:bg-slate-700 rounded"></div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                                <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">3</span>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Review</span>
                        </div>
                        <div className="flex-1 h-1 bg-slate-300 dark:bg-slate-700 rounded"></div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                                <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">4</span>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Verified</span>
                        </div>
                    </div>
                </div>

                {/* Upload Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <UploadCard
                        title="Aadhaar Card (Front)"
                        documentName="aadhaar_front"
                        document={documents.aadhaar_front}
                        onFileSelect={handleFileSelect}
                        accept={{ 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }}
                    />
                    <UploadCard
                        title="Aadhaar Card (Back)"
                        documentName="aadhaar_back"
                        document={documents.aadhaar_back}
                        onFileSelect={handleFileSelect}
                        accept={{ 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }}
                    />
                    <UploadCard
                        title="Highest Qualification Certificate"
                        documentName="highest_qualification_certificate"
                        document={documents.highest_qualification_certificate}
                        onFileSelect={handleFileSelect}
                        accept={{ 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }}
                    />
                </div>

                {/* Upload Checklist */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 mb-8 border border-indigo-200 dark:border-indigo-800">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Upload Checklist
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-indigo-700 dark:text-indigo-300">Documents Uploaded:</span>
                        <span className={`text-sm font-bold ${uploadedCount === 3 ? 'text-green-600 dark:text-green-400' : 'text-indigo-700 dark:text-indigo-300'}`}>
                            {uploadedCount}/3
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploadedCount < 3 || uploading}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                            uploadedCount === 3 && !uploading
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {uploading ? 'Uploading...' : 'Submit for Verification'}
                    </button>
                </div>

                {/* Status Messages */}
                {uploadStatus === 'success' && (
                    <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <p className="text-green-700 dark:text-green-300">Documents submitted successfully! Redirecting to status page...</p>
                    </div>
                )}
                {uploadStatus === 'error' && (
                    <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <p className="text-red-700 dark:text-red-300">Failed to submit documents. Please try again.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KYCDocumentUpload;
