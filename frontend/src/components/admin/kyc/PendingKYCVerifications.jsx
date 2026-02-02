import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Edit, Clock, User, FileText, Image as ImageIcon, Download, Eye, ZoomIn } from 'lucide-react';
import API_BASE_URL from '../../../config';

const PendingKYCVerifications = () => {
    const [kycList, setKycList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKYC, setSelectedKYC] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    useEffect(() => {
        fetchPendingKYC();
    }, []);

    const fetchPendingKYC = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/admin/kyc/pending/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setKycList(data);
            }
        } catch (error) {
            console.error('Error fetching KYC list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (kyc, action) => {
        setSelectedKYC(kyc);
        setModalAction(action);
        setShowModal(true);
    };

    const submitVerification = async (action, data = {}) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/admin/kyc/${selectedKYC.id}/verify/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, ...data })
            });

            if (response.ok) {
                alert(`KYC ${action}d successfully!`);
                setShowModal(false);
                fetchPendingKYC(); // Refresh list
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || 'Action failed'}`);
            }
        } catch (error) {
            console.error('Error submitting verification:', error);
            alert('Failed to submit verification');
        }
    };

    const KYCCard = ({ kyc, expanded, onToggle }) => {
        const [checklist, setChecklist] = useState({
            authenticity: false,
            consistency: false,
            qualifications: false,
            completeness: false
        });

        const allChecked = Object.values(checklist).every(v => v);

        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div 
                    className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={onToggle}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {kyc.tutor?.full_name || kyc.tutor?.user?.username || 'Unknown Tutor'}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {kyc.tutor?.subjects?.join(', ') || 'No subjects listed'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Submitted: {new Date(kyc.created_at).toLocaleString()}
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full mt-1">
                                <Clock className="h-3 w-3" />
                                {kyc.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {expanded && (
                    <div className="border-t border-slate-200 dark:border-slate-800 p-6 space-y-6">
                        {/* Documents Grid */}
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                                Documents ({[kyc.aadhaar_document, kyc.education_certificate, kyc.photo, kyc.pan_document, kyc.passport_document, kyc.police_verification, kyc.teaching_certificate].filter(Boolean).length} uploaded)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {kyc.aadhaar_document && (
                                    <DocumentPreview 
                                        title="Aadhaar/ID" 
                                        url={kyc.aadhaar_document}
                                        type="image"
                                    />
                                )}
                                {kyc.education_certificate && (
                                    <DocumentPreview 
                                        title="Education Cert" 
                                        url={kyc.education_certificate}
                                        type="pdf"
                                    />
                                )}
                                {kyc.photo && (
                                    <DocumentPreview 
                                        title="Profile Photo" 
                                        url={kyc.photo}
                                        type="image"
                                    />
                                )}
                                {kyc.teaching_certificate && (
                                    <DocumentPreview 
                                        title="Teaching Cert" 
                                        url={kyc.teaching_certificate}
                                        type="pdf"
                                    />
                                )}
                                {kyc.pan_document && (
                                    <DocumentPreview 
                                        title="PAN Card" 
                                        url={kyc.pan_document}
                                        type="image"
                                    />
                                )}
                                {kyc.passport_document && (
                                    <DocumentPreview 
                                        title="Passport" 
                                        url={kyc.passport_document}
                                        type="image"
                                    />
                                )}
                                {kyc.police_verification && (
                                    <DocumentPreview 
                                        title="Police Verification" 
                                        url={kyc.police_verification}
                                        type="pdf"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Verification Checklist */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Verification Checklist</h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={checklist.authenticity}
                                        onChange={(e) => setChecklist({...checklist, authenticity: e.target.checked})}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Document authenticity verified</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={checklist.consistency}
                                        onChange={(e) => setChecklist({...checklist, consistency: e.target.checked})}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Information consistency checked</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={checklist.qualifications}
                                        onChange={(e) => setChecklist({...checklist, qualifications: e.target.checked})}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Qualifications match teaching subjects</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={checklist.completeness}
                                        onChange={(e) => setChecklist({...checklist, completeness: e.target.checked})}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Profile completeness confirmed</span>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAction(kyc, 'approve')}
                                disabled={!allChecked}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                                    allChecked
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <CheckCircle className="h-5 w-5" />
                                Approve
                            </button>
                            <button
                                onClick={() => handleAction(kyc, 'reject')}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                            >
                                <XCircle className="h-5 w-5" />
                                Reject
                            </button>
                            <button
                                onClick={() => handleAction(kyc, 'resubmit')}
                                className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                            >
                                <Edit className="h-5 w-5" />
                                Request Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const DocumentPreview = ({ title, url, type }) => (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="aspect-square bg-white dark:bg-slate-900 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {type === 'image' ? (
                    <img src={url} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <FileText className="h-12 w-12 text-slate-400" />
                )}
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</p>
            <div className="flex gap-1">
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
                >
                    <Eye className="h-3 w-3" />
                    View
                </a>
                <a 
                    href={url} 
                    download
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors"
                >
                    <Download className="h-3 w-3" />
                    Save
                </a>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-slate-600 dark:text-slate-400">Loading KYC verifications...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Pending KYC Verifications</h1>
                        <p className="text-slate-600 dark:text-slate-400">Review and verify tutor documents</p>
                    </div>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-full font-semibold">
                        {kycList.length} Pending
                    </span>
                </div>

                {/* KYC List */}
                {kycList.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
                        <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">All Caught Up!</h2>
                        <p className="text-slate-600 dark:text-slate-400">No pending KYC verifications at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {kycList.map((kyc, index) => (
                            <KYCCard
                                key={kyc.id}
                                kyc={kyc}
                                expanded={selectedKYC?.id === kyc.id}
                                onToggle={() => setSelectedKYC(selectedKYC?.id === kyc.id ? null : kyc)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showModal && <ActionModal 
                action={modalAction}
                kyc={selectedKYC}
                onClose={() => setShowModal(false)}
                onSubmit={submitVerification}
            />}
        </div>
    );
};

const ActionModal = ({ action, kyc, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [documents, setDocuments] = useState([]);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = () => {
        if (action === 'approve') {
            onSubmit('approve');
        } else if (action === 'reject') {
            if (!reason.trim()) {
                alert('Please provide a rejection reason');
                return;
            }
            onSubmit('reject', { reason });
        } else if (action === 'resubmit') {
            if (!feedback.trim() || documents.length === 0) {
                alert('Please provide feedback and select documents to resubmit');
                return;
            }
            onSubmit('resubmit', { feedback, documents });
        }
    };

    const documentOptions = [
        { value: 'aadhaar', label: 'Aadhaar/Government ID' },
        { value: 'education', label: 'Education Certificate' },
        { value: 'photo', label: 'Profile Photo' },
        { value: 'pan', label: 'PAN Card' },
        { value: 'passport', label: 'Passport' },
        { value: 'police_verification', label: 'Police Verification' },
        { value: 'teaching_certificate', label: 'Teaching Certificate' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {action === 'approve' && 'Approve KYC Verification?'}
                    {action === 'reject' && 'Reject KYC Verification'}
                    {action === 'resubmit' && 'Request Document Re-submission'}
                </h2>

                {action === 'approve' && (
                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-400">
                            Tutor: <strong>{kyc.tutor?.full_name || kyc.tutor?.user?.username}</strong>
                        </p>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <p className="text-sm text-green-700 dark:text-green-300">
                                This tutor will be able to:
                            </p>
                            <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 mt-2">
                                <li>Post job opportunities</li>
                                <li>Appear in parent searches</li>
                                <li>Receive a verification badge</li>
                            </ul>
                        </div>
                    </div>
                )}

                {action === 'reject' && (
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Rejection Reason <span className="text-red-500">*</span>
                            </span>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explain why the KYC is being rejected..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                rows={4}
                            />
                        </label>
                    </div>
                )}

                {action === 'resubmit' && (
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Documents to Re-upload <span className="text-red-500">*</span>
                            </span>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {documentOptions.map(doc => (
                                    <label key={doc.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={documents.includes(doc.value)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setDocuments([...documents, doc.value]);
                                                } else {
                                                    setDocuments(documents.filter(d => d !== doc.value));
                                                }
                                            }}
                                            className="h-4 w-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{doc.label}</span>
                                    </label>
                                ))}
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Feedback <span className="text-red-500">*</span>
                            </span>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide detailed feedback on what needs to be corrected..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                rows={4}
                            />
                        </label>
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                            action === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' :
                            action === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' :
                            'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                    >
                        {action === 'approve' && 'Confirm Approval'}
                        {action === 'reject' && 'Confirm Rejection'}
                        {action === 'resubmit' && 'Request Re-submission'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingKYCVerifications;
