import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const AccessRestrictionModal = ({ isOpen, onClose, onProceed, title, message, benefits }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
                    {title || 'KYC Verification Required'}
                </h2>

                {/* Message */}
                <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                    {message || 'You must complete KYC verification before accessing this feature.'}
                </p>

                {/* Benefits */}
                {benefits && benefits.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Benefits of verification:</p>
                        <ul className="space-y-1">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onProceed}
                        className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                    >
                        Complete KYC Verification
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessRestrictionModal;
