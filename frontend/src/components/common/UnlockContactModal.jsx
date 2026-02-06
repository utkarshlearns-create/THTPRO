import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';

const UnlockContactModal = ({ tutor, onClose, onUnlockSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [insufficientFunds, setInsufficientFunds] = useState(false);
    const navigate = useNavigate();

    const UNLOCK_COST = 50; // Hardcoded to match backend

    const handleUnlock = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/tutor/${tutor.id}/unlock/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                onUnlockSuccess(data); // Pass back phone/email
                onClose();
            } else if (response.status === 402) {
                setInsufficientFunds(true);
            } else {
                setError(data.error || "Failed to unlock contact.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            {insufficientFunds ? <AlertCircle size={20} /> : <Lock size={20} />}
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {insufficientFunds ? "Insufficient Credits" : "Unlock Contact Info"}
                    </h3>

                    {insufficientFunds ? (
                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-300">
                                You need <strong>{UNLOCK_COST} credits</strong> to unlock this contact, but your wallet balance is low.
                            </p>
                            <button
                                onClick={() => navigate('/wallet')}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Add Funds to Wallet
                            </button>
                             <button
                                onClick={onClose}
                                className="w-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-2 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-slate-600 dark:text-slate-300">
                                Unlocking <strong>{tutor.full_name || tutor.user.username}</strong>'s contact information will deduct <strong>{UNLOCK_COST} credits</strong> from your wallet.
                            </p>
                            
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUnlock}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            <Unlock size={18} />
                                            Confirm Unlock
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnlockContactModal;
