"use client";
import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Upload, CheckCircle, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const KYCUpload = ({ kycFiles, handleFileChange, handleKycSubmit, kycUploading, status, existingKyc }) => {
    const kycStatus = existingKyc?.status;
    const isRejected = kycStatus === 'REJECTED' || status === 'KYC_REJECTED';
    const isUnderReview = kycStatus === 'UNDER_REVIEW' || kycStatus === 'SUBMITTED' || status === 'UNDER_REVIEW';
    const isVerified = kycStatus === 'VERIFIED' || status === 'VERIFIED';
    
    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
             <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white hidden md:block">Document Verification</h1>
                <Button
                    onClick={handleKycSubmit}
                    disabled={kycUploading || isUnderReview || isVerified}
                    variant="sapphire"
                >
                    {kycUploading ? 'Uploading...' : isUnderReview ? 'Under Review' : isVerified ? 'Verified' : 'Submit for Verification'}
                </Button>
            </div>

            {isRejected && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                            <h3 className="text-red-800 dark:text-red-200 font-medium">Verification Rejected</h3>
                            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                                {existingKyc?.rejection_reason || 'Your documents were rejected. Please check the feedback and re-upload.'}
                            </p>
                            {existingKyc?.admin_feedback && (
                                <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium flex items-baseline gap-1">
                                    <span className="shrink-0">Admin Feedback:</span> 
                                    <span className="font-normal">{existingKyc.admin_feedback}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isUnderReview && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                            <h3 className="text-amber-800 dark:text-amber-200 font-medium">Under Review</h3>
                            <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                                Your KYC documents are currently being reviewed by our team. This usually takes 24-48 hours.
                            </p>
                        </div>
                    </div>
                </div>
            )}
             
            {isVerified && (
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                            <h3 className="text-green-800 dark:text-green-200 font-medium">Verification Successful</h3>
                            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                                Your documents have been verified successfully. Your profile is active.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UploadZone
                    label="Aadhaar Card (Front)"
                    file={kycFiles.aadhaar_front}
                    existingUrl={existingKyc?.aadhaar_front}
                    onChange={(e) => handleFileChange(e, 'aadhaar_front')}
                />
                 <UploadZone
                    label="Aadhaar Card (Back)"
                    file={kycFiles.aadhaar_back}
                    existingUrl={existingKyc?.aadhaar_back}
                    onChange={(e) => handleFileChange(e, 'aadhaar_back')}
                />
                 <UploadZone
                    label="Highest Qualification Certificate"
                    file={kycFiles.highest_qualification_certificate}
                    existingUrl={existingKyc?.highest_qualification_certificate}
                    onChange={(e) => handleFileChange(e, 'highest_qualification_certificate')}
                />
            </div>
        </div>
    );
};

const UploadZone = ({ label, file, existingUrl, onChange, accept = "application/pdf,image/*" }) => {
    const hasExisting = existingUrl && !file;
    const hasFile = !!file;
    const uploaded = hasFile || hasExisting;

    return (
        <div className="relative group cursor-pointer">
            <input
                type="file"
                accept={accept}
                onChange={onChange}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
            <Card className={cn(
                "h-64 flex flex-col items-center justify-center border-dashed border-2 transition-all",
                "border-slate-300 bg-slate-50",
                "dark:border-slate-700 dark:bg-slate-900/30",
                "group-hover:border-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/5",
                uploaded && "border-green-500/50 bg-green-50 dark:bg-green-500/5"
            )}>
                <div className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-all",
                    uploaded
                        ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-400"
                )}>
                    {uploaded ? <CheckCircle size={32} /> : <Upload size={32} />}
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">{label}</h3>
                {hasFile ? (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center px-4 truncate max-w-full">
                        {file.name}
                    </p>
                ) : hasExisting ? (
                    <div className="mt-2 text-center">
                        <p className="text-sm text-green-600 dark:text-green-400">Already uploaded</p>
                        <a
                            href={existingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 relative z-20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink size={12} />
                            View document
                        </a>
                        <p className="text-xs text-slate-400 mt-1">Click to replace</p>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 mt-2 text-center px-4">
                        Drag & drop or click to upload
                    </p>
                )}
            </Card>
        </div>
    );
};

export default KYCUpload;
